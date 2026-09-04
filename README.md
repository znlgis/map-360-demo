# map-360-demo — 360 全景能力演示

一个基于 **Vue 3 + Vite + TypeScript** 的纯前端演示项目：360° 全景图与真实地图（Leaflet）双向联动，并系统性展示 [Photo Sphere Viewer v5](https://photo-sphere-viewer.js.org/) 的各项能力。

## ✨ 功能特性

- **多种全景格式**：
  - 等距圆柱（Equirectangular）—— 4 个互连场景（默康图尔国家公园 / 比斯坎湾灯塔 / 灯塔花园 / 海滨栈道）
  - 立方体贴图（Cubemap）—— 独立场景「立方体山脉」，演示 cubemap 适配器（六面独立图片）
- **虚拟导览（Virtual Tour）**：等距圆柱场景间 3D 箭头导航，点击箭头带转场动画切换场景
- **标记管理**：添加 / 编辑 / 删除 / 搜索 / 导入导出 JSON / 恢复默认，标记自动持久化到 `localStorage`
- **地图联动（Plan）**：右下角 Leaflet 地图，标记热点双向联动，点击地图热点自动旋转视角
- **缩略图画廊（Gallery）**：底部缩略图快速切换场景
- **自动旋转（Autorotate）**：沿标记关键点自动巡航
- **罗盘（Compass）**：方位罗盘，标记以彩色圆点标注，可点击导航
- **陀螺仪（Gyroscope）**：移动端随手机姿态转动（需授权）
- **设置面板（Settings）**：鱼眼效果、滚轮缩放、缩放级别
- **安全处理**：标记名称/描述经 HTML 转义，防止注入
- **中文界面**：全部 UI 与交互文案为中文

## 🛠️ 技术栈

| 依赖 | 版本 | 用途 |
| --- | --- | --- |
| Vue | 3.5 | UI 框架 |
| Vite | 8.x | 构建工具 |
| TypeScript | 6.0 | 类型系统 |
| @photo-sphere-viewer/core | 5.15 | 全景查看器 |
| @photo-sphere-viewer/markers-plugin | 5.15 | 全景标记 |
| @photo-sphere-viewer/plan-plugin | 5.15 | 嵌入地图 |
| @photo-sphere-viewer/virtual-tour-plugin | 5.15 | 虚拟导览（3D 箭头） |
| @photo-sphere-viewer/gallery-plugin | 5.15 | 缩略图画廊 |
| @photo-sphere-viewer/autorotate-plugin | 5.15 | 自动旋转 |
| @photo-sphere-viewer/compass-plugin | 5.15 | 罗盘 |
| @photo-sphere-viewer/gyroscope-plugin | 5.15 | 陀螺仪 |
| @photo-sphere-viewer/settings-plugin | 5.15 | 设置面板 |
| @photo-sphere-viewer/cubemap-adapter | 5.15 | 立方体贴图适配器 |
| leaflet | 1.9 | 地图渲染 |

## 🚀 快速开始

```bash
npm install     # 安装依赖
npm run dev     # 启动开发服务器（默认 http://localhost:5173）
npm run build   # 类型检查 + 生产构建（输出到 dist/）
npm run preview # 预览生产构建
npm run typecheck # 仅运行类型检查
```

## 📁 项目结构

```
src/
├── App.vue                    # 根组件：编排状态、跳转逻辑、功能开关
├── components/
│   ├── PsvContainer.vue       # 核心：封装 PSV viewer 生命周期与全部插件
│   ├── FeaturePanel.vue       # 功能演示面板（开关各项能力）
│   ├── SceneSelector.vue      # 场景下拉选择
│   ├── MarkerModal.vue        # 添加/编辑标记弹窗
│   ├── MarkerList.vue         # 底部标记列表
│   └── ToastHost.vue          # 全局 Toast 反馈
├── composables/
│   ├── useAppState.ts         # 全局响应式状态 + localStorage 持久化 + 导入导出
│   ├── useAddMarkerFlow.ts    # 添加/编辑标记状态机
│   └── useToast.ts            # Toast 单例状态
├── data/scenes.ts             # 预设场景、虚拟导览链接、默认标记、PSV 配置转换
├── styles/psv.css             # PSV 全局样式覆盖
├── types/index.ts             # Scene / MarkerData / FeatureFlags 等类型
└── utils/geo.ts               # 方位角换算（点击位置 ↔ 经纬度）
public/icons/link-pin.svg      # 场景跳转标记图标
```

## 📝 使用说明

1. **切换场景**：顶部下拉选择、底部画廊缩略图、或点击全景中的 3D 箭头（虚拟导览）均可切换
2. **体验功能**：右侧「功能演示」面板可实时开关自动旋转、罗盘、陀螺仪、设置面板、缩略图画廊
3. **立方体贴图**：切换到「立方体山脉」场景，体验 cubemap 适配器（六面独立图片渲染）
4. **添加标记**：点击「添加标记」→ 点击全景图空白处（或右下角地图精确定位）→ 出现红色脉冲预览 pin → 填写名称与描述确认
5. **编辑/删除标记**：底部列表悬停标记行，点击 ✎ 编辑、✕ 删除
6. **导入导出**：底部列表「导出」下载 JSON；「导入」选择 JSON 文件合并标记
7. **恢复默认**：一键还原预设标记

> 全景图片与地图瓦片均来自公共资源（PSV 官方 CDN / OpenStreetMap），需要联网访问。
