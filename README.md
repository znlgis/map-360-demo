# map-360-demo

360° 全景图像与真实地图联动演示。基于 [Photo Sphere Viewer v5](https://photo-sphere-viewer.js.org/) + Vue 3 + Vite + TypeScript 构建，展示全景浏览、Leaflet 地图联动、在线标记增删等能力。

## ✨ 功能特性

- **360° 全景浏览**：拖拽旋转、滚轮缩放、全屏查看。
- **地图联动**：右下角悬浮 Leaflet/OpenStreetMap 小地图，显示当前场景 GPS 位置，视角方向与地图指针实时同步。
- **标记双向联动**：
  - 点击全景图空白处即可添加标记（名称 + 描述），标记会同时出现在全景图与地图上。
  - 点击全景图中的标记或地图上的热点，视角会自动旋转到对应方向。
- **标记管理**：底部列表展示当前场景的全部标记，支持点击定位与删除。
- **多场景切换**：内置多个全景场景，各自拥有独立的 GPS 位置与标记集合。
- **中文界面**：全部 UI 文本已本地化为中文。

## 🛠 技术栈

| 依赖 | 版本 | 作用 |
|------|------|------|
| [vue](https://vuejs.org/) | 3.5 | 前端框架 |
| [vite](https://vitejs.dev/) | 8 | 构建工具 / 开发服务器 |
| [typescript](https://www.typescriptlang.org/) | 5.8 | 类型系统 |
| `@photo-sphere-viewer/core` | 5.15 | 360° 全景核心渲染（基于 Three.js） |
| `@photo-sphere-viewer/markers-plugin` | 5.15 | 标记系统（图片标记、tooltip、侧栏内容） |
| `@photo-sphere-viewer/plan-plugin` | 5.15 | Leaflet 地图插件（GPS 定位、热点、视角联动） |
| [leaflet](https://leafletjs.com/) | 1.9 | 地图渲染（plan-plugin 的对等依赖） |

## 🚀 快速开始

需要 Node.js 18+ 环境。

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 生产构建（先执行 vue-tsc 类型检查，再由 vite 打包）
npm run build

# 本地预览生产构建产物
npm run preview
```

## 🕹 使用说明

1. 通过顶部下拉框切换全景**场景**。
2. 拖拽全景图旋转视角，滚轮缩放；右下角小地图会同步方向。
3. 点击全景图**空白处**弹出表单，填写名称（必填）与描述（选填）后即可添加标记。
4. 点击全景图中的标记或地图热点，视角会自动旋转到该标记。
5. 在底部**标记列表**中点击某条标记可定位视角，点击 ✕ 可删除。

## 📁 项目结构

```
map-360-demo/
├── index.html                 # HTML 入口
├── vite.config.ts             # Vite 配置（含 @ -> src 别名）
├── tsconfig*.json             # TypeScript 配置
├── src/
│   ├── main.ts                # Vue 应用入口
│   ├── App.vue                # 根组件，组合各子组件并持有状态
│   ├── env.d.ts               # Vue SFC 类型声明
│   ├── types/index.ts         # Scene / MarkerData / PsvMarkerConfig 类型
│   ├── data/scenes.ts         # 预设场景与标记数据，标记 → PSV 配置转换
│   ├── composables/
│   │   └── useAppState.ts      # 全局响应式状态（不使用 Pinia）
│   └── components/
│       ├── SceneSelector.vue  # 场景下拉选择
│       ├── PsvContainer.vue   # PSV 实例封装（Viewer + Markers + Plan 插件）
│       ├── MarkerModal.vue    # 添加标记弹窗
│       └── MarkerList.vue     # 底部标记列表
└── docs/superpowers/          # 设计文档与实施计划
```

## 📝 说明与约束

- 数据不做持久化，刷新页面后新增的标记会丢失。
- 全景图片与图钉素材使用 Photo Sphere Viewer 官方演示 CDN。
- 地图默认使用 OpenStreetMap 瓦片。
- 无后端服务，纯前端演示项目。

## 📄 许可证

[MIT](./LICENSE)

