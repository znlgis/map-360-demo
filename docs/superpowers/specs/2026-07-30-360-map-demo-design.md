# 360全景图像与地图联动 Demo — 设计文档

- 日期：2026-07-30
- 类型：Demo 演示项目
- 技术栈：Vue 3 + Vite + TypeScript + Photo Sphere Viewer v5

---

## 1. 目标

构建一个演示页面，展示以下核心能力：

1. **360全景图像查看**：用户可旋转、缩放浏览360度全景图
2. **真实地图联动**：基于 Leaflet/OpenStreetMap 的地图显示当前场景的 GPS 位置，360视角与地图方向同步
3. **标记信息管理**：用户可在360图像中动态添加标记（名称+描述），标记同时出现在地图上；点击地图热点可旋转360视角到对应方向
4. **多场景切换**：支持多个360全景场景切换，每个场景有独立的 GPS 位置和标记集合

---

## 2. 技术方案

### 核心依赖

| 包名 | 作用 |
|------|------|
| `@photo-sphere-viewer/core` | 360全景核心渲染（基于 Three.js） |
| `@photo-sphere-viewer/markers-plugin` | 标记系统：图片标记、tooltip、content、事件 |
| `@photo-sphere-viewer/plan-plugin` | Leaflet 地图插件：GPS 定位、热点、视角联动 |
| `vue` (v3) | 前端框架 |
| `vite` | 构建工具 |
| `typescript` | 类型系统 |

`plan-plugin` 依赖 `leaflet` 作为对等依赖，需单独安装。

### 标记与地图联动机制

PSV 的联动通过 Marker 的 `data` 属性实现：

```ts
// plan-plugin 自动读取 marker.data.plan 在地图上显示热点
{
  id: 'marker-1',
  position: { yaw: 0.11, pitch: 0.32 },  // 360中的球形坐标
  tooltip: '标记名称',
  image: 'pin.png',
  size: { width: 32, height: 32 },
  anchor: 'bottom center',
  data: {
    plan: {                              // 地图上的配置
      coordinates: [6.79077, 44.58041],  // GPS 经纬度
      size: 25,
      image: 'pin-map.png',
    },
  },
}
```

### 添加标记的流程

```
用户点击360视图空白处
  → PSV click 事件（排除标记点击）
  → 获取点击位置的 yaw/pitch
  → 弹出模态框：标记名称 + 描述
  → 用当前场景的 GPS + 偏移量估算标记的 GPS
  → 调用 markersPlugin.addMarker()
  → PlanPlugin 自动从 data.plan 读取并在 Leaflet 地图上添加热点
```

---

## 3. 数据模型

### 场景 Scene

```ts
interface Scene {
  id: string
  name: string
  description: string
  panorama: string            // 360图片URL
  coordinates: [number, number]  // [经度, 纬度]
  bearing: string             // 方向偏移, 如 "120deg"
  defaultZoom: number         // 地图缩放级别, 默认 14
  thumbnail?: string          // 缩略图（场景选项用）
}
```

### 标记 MarkerData

```ts
interface MarkerData {
  id: string
  sceneId: string
  name: string                // 标记名称
  description: string         // 详细描述
  position: { yaw: number; pitch: number }   // 360中球形坐标(弧度)
  coordinates: [number, number]               // 地图上GPS [lng, lat]
  createdAt: number           // 时间戳
}
```

### 预设场景数据（Demo 数据）

使用 PSV 官方 CDN 数据（`https://photo-sphere-viewer-data.netlify.app/assets/`）：

| 场景 | 360图片 | GPS | 方位 |
|------|---------|-----|------|
| 默康图尔国家公园 | `sphere.jpg` | [6.78677, 44.58241] | 120deg |
| 湖景 | 第二个场景 | 不同坐标 | 不同方位 |

### 预设标记（Demo 初始数据）

为第一个场景预设3个中文标记：

1. "山顶观测点" — "此处海拔2350米，可远眺阿尔卑斯山脉"
2. "徒步路线起点" — "由此出发，全程约8公里，预计4小时"
3. "高山湖泊" — "冰川融化形成的天然湖泊，水质清澈"

---

## 4. 组件架构

```
App.vue
├── SceneSelector.vue        # 场景下拉选择器
├── PsvContainer.vue         # 360全景容器（封装PSV实例生命周期）
├── MapPanel.vue             # Leaflet地图面板（通过PlanPlugin渲染）
├── MarkerModal.vue          # 添加/编辑标记的模态弹窗
└── MarkerList.vue           # 底部标记列表（名称、描述、删除按钮）
```

### 组件职责

| 组件 | 职责 |
|------|------|
| `App.vue` | 持有全局状态（composable），协调子组件，处理场景切换 |
| `SceneSelector.vue` | 下拉菜单切换场景，emit `select` 事件 |
| `PsvContainer.vue` | `onMounted` 创建 Viewer + PlanPlugin + MarkersPlugin；暴露 PSV 实例方法；监听 click 事件触发标记添加 |
| `MapPanel.vue` | 仅做容器渲染，PlanPlugin 自动管理 Leaflet 地图的 DOM |
| `MarkerModal.vue` | 表单：名称（必填）+ 描述（选填），确认/取消 |
| `MarkerList.vue` | 展示当前场景所有标记，支持点击查看详情和删除 |

### 状态管理

不引入 Pinia，使用 composable：

```ts
// composables/useAppState.ts
export function useAppState() {
  const scenes = ref<Scene[]>(SCENES_DATA)
  const currentSceneId = ref<string>(SCENES_DATA[0].id)
  const markers = ref<MarkerData[]>(DEFAULT_MARKERS)

  const currentScene = computed(() => /* ... */)
  const currentMarkers = computed(() => /* ... */)

  function switchScene(id: string) { /* ... */ }
  function addMarker(data: Omit<MarkerData, 'id' | 'createdAt'>) { /* ... */ }
  function removeMarker(id: string) { /* ... */ }

  return { scenes, currentSceneId, currentScene, markers, currentMarkers, ... }
}
```

---

## 5. UI布局

```
┌─ 顶部工具栏 ────────────────────────────────────────────┐
│  [场景: 默康图尔国家公园 ▾]    [➕ 添加标记]             │
├────────────────────────────┬────────────────────────────┤
│                            │  ┌──────────────────┐      │
│                            │  │   Leaflet 地图   │      │
│   360° 全景视图             │  │   (300×300px)    │      │
│   (fill 剩余空间)           │  │   右下角悬浮      │      │
│                            │  │   📍当前位置      │      │
│                            │  │   📍标记热点      │      │
│                            │  └──────────────────┘      │
├────────────────────────────┴────────────────────────────┤
│  标记列表:                                               │
│  📌 山顶观测点 — "海拔2350米，可远眺..."  [详情] [删除]   │
│  📌 徒步路线起点 — "全程8公里"            [详情] [删除]   │
└─────────────────────────────────────────────────────────┘
```

地图面板位置：右下角 `position: fixed; bottom: 16px; right: 16px;`，带最小化按钮。
标记列表底部 `height: auto`，内容超过3条可滚动。

---

## 6. 交互流程

| 操作 | 触发 | 效果 |
|------|------|------|
| 切换场景 | `SceneSelector` 选择 | 销毁并重建 Viewer；地图移到新 GPS |
| 查看标记 tooltip | 鼠标悬停360标记 | 显示名称 |
| 点击标记 | 点击360标记 | 视角旋转到标记；底部列表高亮 |
| 添加标记 | 工具栏"添加标记"→点击360空白处 | 弹出 MarkerModal → 确认后添加 |
| 点击标记详情 | MarkerList 点击"详情" | 360视角旋转到标记 + 展开描述 |
| 删除标记 | MarkerList 点击"删除" | 确认后从360和地图移除 |
| 地图热点点击 | 点击地图上标记热点 | 360视角旋转到对应标记方向 |
| 拖拽360 | 鼠标拖拽旋转视角 | 地图方向指示器同步旋转 |

---

## 7. 国际化

所有 UI 文本使用中文：

```ts
const viewerLang = {
  zoom: '缩放', zoomOut: '缩小', zoomIn: '放大',
  moveUp: '上移', moveDown: '下移', moveLeft: '左移', moveRight: '右移',
  fullscreen: '全屏', menu: '菜单', close: '关闭',
  loading: '加载中...',
  loadError: '全景图加载失败',
  twoFingers: '使用双指导航',
  ctrlZoom: '使用 Ctrl + 滚动缩放',
  map: '地图',
  mapMaximize: '最大化', mapMinimize: '最小化',
  mapReset: '重置', mapLayers: '底图',
  markers: '标记', markersList: '标记列表',
}
```

---

## 8. 约束

- 数据不持久化，刷新页面丢失
- 仅使用 PSV 官方 Demo CDN 的免费全景图片
- 地图默认使用 OpenStreetMap 瓦片
- 不引入后端服务
- 不创建新模型、不使用 `@ts-ignore`、不添加无意义注释

---

## 9. 项目结构

```
map-360-demo/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts                 # Vue 入口
│   ├── App.vue                 # 根组件
│   ├── components/
│   │   ├── SceneSelector.vue   # 场景选择
│   │   ├── PsvContainer.vue    # 360容器
│   │   ├── MapPanel.vue        # 地图面板
│   │   ├── MarkerModal.vue     # 标记表单弹窗
│   │   └── MarkerList.vue      # 标记列表
│   ├── composables/
│   │   └── useAppState.ts      # 全局状态
│   ├── data/
│   │   └── scenes.ts           # 预设场景和标记数据
│   └── types/
│       └── index.ts            # 类型定义
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-07-30-360-map-demo-design.md
```

---

## 10. 自我审查

- [x] 无 TBD / TODO 占位符
- [x] 数据模型与交互流程一致
- [x] 单 Demo 范围，无过度设计
- [x] 所有配置使用中文
- [x] 技术选型可落地（PSV5 + Vue3 + Vite）
