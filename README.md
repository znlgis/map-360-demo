# map-360-demo — 360全景地图联动演示

一个基于 **Vue 3 + Vite + TypeScript** 的纯前端演示项目：360° 全景图与真实地图（Leaflet）双向联动，支持多场景切换与在线标记管理。

## ✨ 功能特性

- **360° 全景浏览**：基于 [Photo Sphere Viewer v5](https://photo-sphere-viewer.js.org/)，支持拖拽旋转、缩放、全屏
- **多场景切换**：内置两个场景（法国默康图尔国家公园 / 美国比斯坎湾灯塔），切换时全景与地图同步更新
- **地图联动**：右下角 Leaflet 地图（PlanPlugin），标记热点双向联动 —— 点地图热点，全景自动旋转到对应位置
- **标记管理**：点击全景空白处弹出表单即可添加标记；底部列表支持查看、删除；新标记自动按时间置顶
- **数据持久化**：标记自动保存到 `localStorage`，刷新页面不丢失
- **中文界面**：全部 UI 与交互文案为中文
- **安全处理**：标记名称/描述经过 HTML 转义，防止注入

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
├── App.vue                    # 根组件：集成工具栏、全景、标记列表、弹窗、Toast
├── components/
│   ├── PsvContainer.vue       # 核心：封装 PSV viewer 生命周期（Viewer + Plan + Markers 插件）
│   ├── SceneSelector.vue      # 场景下拉选择
│   ├── MarkerModal.vue        # 添加标记弹窗（Esc 关闭、焦点圈定、过渡动效）
│   ├── MarkerList.vue         # 底部标记列表（新标记置顶、时间显示、删除）
│   └── ToastHost.vue          # 全局 Toast 反馈
├── composables/
│   ├── useAppState.ts         # 全局响应式状态 + localStorage 持久化
│   └── useToast.ts            # Toast 单例状态
├── data/scenes.ts             # 预设场景、默认标记、PSV 标记配置转换
└── types/index.ts             # Scene / MarkerData 类型定义
```

## 📝 使用说明

1. **切换场景**：顶部下拉选择，全景与地图同步更新
2. **添加标记**：点击「添加标记」进入添加模式 → 点击全景图空白处（或直接点击右下角地图精确定位）→ 出现红色脉冲预览 pin → 填写名称与描述确认。经纬度可按方位角自动估算，也可在弹窗中手动修改
3. **查看标记**：底部列表点击标记名称，视角旋转过去；点击地图上的热点亦可
4. **删除标记**：底部列表悬停标记行，点击 ✕ 按钮；「恢复默认」可一键还原预设标记

> 全景图片与地图瓦片均来自公共资源（PSV 官方 CDN / OpenStreetMap），需要联网访问。
