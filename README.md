# map-360-demo — 360全景地图联动演示

一个基于 **Vue 3 + Vite + TypeScript** 的纯前端演示项目：360° 全景图与真实地图（Leaflet）双向联动，支持多场景切换、标记管理（添加/编辑/删除/搜索）、场景间跳转与数据导入导出。

## ✨ 功能特性

- **360° 全景浏览**：基于 [Photo Sphere Viewer v5](https://photo-sphere-viewer.js.org/)，支持拖拽旋转、缩放、全屏
- **多场景切换**：内置两个场景（法国默康图尔国家公园 / 美国比斯坎湾灯塔），切换时全景与地图同步更新
- **地图联动**：右下角 Leaflet 地图（PlanPlugin），标记热点双向联动 —— 点地图热点，全景自动旋转到对应位置
- **标记管理**：
  - 显式「添加模式」：点击全景空白处或地图精确定位，红色脉冲预览 pin 即时反馈，可取消重选
  - 支持**编辑**（改名/改描述/改坐标/改类型）与**删除**
  - 底部列表**搜索**、**折叠**、新标记自动置顶
  - **导入/导出 JSON**，方便备份与分享
- **场景跳转标记**：标记类型二选一 —— 信息标记（📍 展示信息）或跳转标记（➜ 点击后切换到目标场景），绿色箭头 pin 标识
- **数据持久化**：标记自动保存到 `localStorage`，刷新页面不丢失；「恢复默认」一键还原
- **安全处理**：标记名称/描述经过 HTML 转义，防止注入
- **中文界面**：全部 UI 与交互文案为中文

## 🛠️ 技术栈

| 依赖 | 版本 | 用途 |
| --- | --- | --- |
| Vue | 3.5 | UI 框架 |
| Vite | 8.x | 构建工具 |
| TypeScript | 5.8 | 类型系统 |
| @photo-sphere-viewer/core | 5.15 | 全景查看器 |
| @photo-sphere-viewer/markers-plugin | 5.15 | 全景标记 |
| @photo-sphere-viewer/plan-plugin | 5.15 | 嵌入地图 |
| leaflet | 1.9 | 地图渲染 |

## 🚀 快速开始

```bash
npm install     # 安装依赖
npm run dev     # 启动开发服务器（默认 http://localhost:5173）
npm run build   # 类型检查 + 生产构建（输出到 dist/）
npm run preview # 预览生产构建
```

## 📁 项目结构

```
src/
├── App.vue                    # 根组件：编排状态、跳转逻辑、导入导出
├── components/
│   ├── PsvContainer.vue       # 核心：封装 PSV viewer 生命周期（Viewer + Plan + Markers 插件）
│   ├── SceneSelector.vue      # 场景下拉选择
│   ├── MarkerModal.vue        # 添加/编辑标记弹窗（类型选择、焦点管理、过渡动效）
│   ├── MarkerList.vue         # 底部标记列表（搜索、折叠、编辑/删除、导入导出）
│   └── ToastHost.vue          # 全局 Toast 反馈
├── composables/
│   ├── useAppState.ts         # 全局响应式状态 + localStorage 持久化 + 导入导出
│   ├── useAddMarkerFlow.ts    # 添加/编辑标记状态机（选点、预览 pin、弹窗协调）
│   └── useToast.ts            # Toast 单例状态（定时器自动清理）
├── data/scenes.ts             # 预设场景、默认标记、PSV 标记配置转换
├── styles/psv.css             # PSV 全局样式覆盖（tooltip、预览脉冲、跳转标记）
├── types/index.ts             # Scene / MarkerData / MarkerPayload 类型定义
└── utils/geo.ts               # 方位角换算（点击位置 ↔ 经纬度）
public/icons/link-pin.svg      # 场景跳转标记图标（本地资源，不依赖 CDN）
```

## 📝 使用说明

1. **切换场景**：顶部下拉选择，或点击全景/地图中的绿色「跳转标记」（➜）直接切换
2. **添加标记**：点击「添加标记」进入添加模式 → 点击全景图空白处（或直接点击右下角地图精确定位）→ 出现红色脉冲预览 pin → 填写名称与描述确认。经纬度按方位角自动估算，可在弹窗中手动修改
3. **编辑标记**：底部列表悬停标记行，点击 ✎ 按钮，可修改名称、描述、坐标与类型（含跳转目标场景）
4. **查找标记**：底部列表搜索框按名称/描述过滤
5. **导入导出**：底部列表「导出」下载全部标记为 JSON；「导入」选择 JSON 文件合并标记（自动校验与去重）
6. **删除/恢复**：悬停标记行点击 ✕ 删除；「恢复默认」一键还原预设标记

> 全景图片与地图瓦片均来自公共资源（PSV 官方 CDN / OpenStreetMap），需要联网访问。
