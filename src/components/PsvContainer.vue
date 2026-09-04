<template>
  <div ref="containerRef" class="psv-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Viewer } from '@photo-sphere-viewer/core'
import type { PluginConstructor, ViewerConfig } from '@photo-sphere-viewer/core'
import { CubemapAdapter } from '@photo-sphere-viewer/cubemap-adapter'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import type { MarkerConfig } from '@photo-sphere-viewer/markers-plugin'
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin'
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin'
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin'
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin'
import { CompassPlugin } from '@photo-sphere-viewer/compass-plugin'
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin'
import { SettingsPlugin } from '@photo-sphere-viewer/settings-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import '@photo-sphere-viewer/plan-plugin/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'
import '@photo-sphere-viewer/gallery-plugin/index.css'
import '@photo-sphere-viewer/compass-plugin/index.css'
import '@photo-sphere-viewer/settings-plugin/index.css'
import 'leaflet/dist/leaflet.css'
import type { Scene, MarkerData, FeatureFlags, SceneAdapter } from '@/types'
import { toPsvMarkerConfig, BASE_URL, PREVIEW_ID } from '@/data/scenes'

const props = defineProps<{
  scene: Scene
  /** 全部场景（用于构建虚拟导览节点与画廊） */
  scenes: Scene[]
  /** 全部标记（按 sceneId 过滤） */
  markers: MarkerData[]
  /** 待确认的标记预览（红色脉冲 pin，同时显示在地图上） */
  previewMarker?: MarkerData | null
  /** 可切换的 PSV 功能开关 */
  features: FeatureFlags
}>()

const emit = defineEmits<{
  'click-empty': [position: { yaw: number; pitch: number }]
  'map-pick': [coords: [number, number]]
  /** 用户点击全景标记或地图热点时触发（由 App 决定跳转逻辑） */
  'marker-click': [id: string]
  /** 虚拟导览箭头 / 画廊触发的场景切换 */
  'scene-change': [id: string]
  /** 陀螺仪在当前设备不可用 */
  'gyroscope-error': []
}>()

const containerRef = ref<HTMLDivElement>()
let viewer: Viewer | null = null
let markersPlugin: MarkersPlugin | null = null
let planPlugin: PlanPlugin | null = null
let virtualTour: VirtualTourPlugin | null = null
let galleryPlugin: GalleryPlugin | null = null
let autorotatePlugin: AutorotatePlugin | null = null
let compassPlugin: CompassPlugin | null = null
let gyroscopePlugin: GyroscopePlugin | null = null
let settingsPlugin: SettingsPlugin | null = null
let currentAdapter: SceneAdapter | null = null
let previewShown = false

/** 场景默认适配器（缺省等距圆柱） */
function adapterOf(scene: Scene): SceneAdapter {
  return scene.adapter ?? 'equirectangular'
}

/** 将场景转换为虚拟导览节点 */
function toTourNode(scene: Scene) {
  return {
    id: scene.id,
    panorama: scene.panorama,
    name: scene.name,
    caption: scene.name,
    description: scene.description,
    thumbnail: scene.thumbnail,
    links: (scene.links ?? []).map((l) => ({
      nodeId: l.targetSceneId,
      position: l.position,
      name: l.name,
    })),
  }
}

function createViewer() {
  if (!containerRef.value) return
  destroyViewer()
  currentAdapter = adapterOf(props.scene)
  const isCubemap = currentAdapter === 'cubemap'

  const plugins: Array<PluginConstructor | [PluginConstructor, any]> = [
    PlanPlugin.withConfig({
      coordinates: props.scene.coordinates,
      bearing: props.scene.bearing,
      defaultZoom: props.scene.defaultZoom,
      size: { width: 'min(300px, 72vw)', height: 'min(300px, 34vh)' },
      position: 'bottom left',
      visibleOnLoad: true,
    }),
    MarkersPlugin.withConfig({}),
  ]

  // 虚拟导览：仅等距圆柱场景组成 tour，立方体贴图为独立场景（不同适配器，无法共用同一 viewer）
  if (!isCubemap) {
    plugins.push(
      VirtualTourPlugin.withConfig({
        dataMode: 'client',
        positionMode: 'manual',
        renderMode: '3d',
        nodes: props.scenes
          .filter((s) => adapterOf(s) === 'equirectangular')
          .map(toTourNode),
        startNodeId: props.scene.id,
        linksOnCompass: false,
      })
    )
  }

  plugins.push(GalleryPlugin.withConfig({ visibleOnLoad: false }))
  plugins.push(
    AutorotatePlugin.withConfig({
      autorotateSpeed: '2rpm',
      autostartDelay: undefined,
      autostartOnIdle: false,
    })
  )
  plugins.push(CompassPlugin.withConfig({ size: '120px', position: 'top left' }))
  plugins.push(GyroscopePlugin.withConfig({}))
  plugins.push(SettingsPlugin.withConfig({}))

  const viewerConfig: ViewerConfig = {
    container: containerRef.value,
    panorama: props.scene.panorama,
    caption: props.scene.name,
    loadingImg: BASE_URL + 'loader.gif',
    navbar: ['zoom', 'fullscreen', 'caption', 'gallery', 'markers', 'markersList', 'settings'],
    lang: {
      zoom: '缩放',
      zoomOut: '缩小',
      zoomIn: '放大',
      moveUp: '上移',
      moveDown: '下移',
      moveLeft: '左移',
      moveRight: '右移',
      fullscreen: '全屏',
      menu: '菜单',
      close: '关闭',
      loading: '加载中...',
      loadError: '全景图加载失败',
      twoFingers: '使用双指导航',
      ctrlZoom: '使用 Ctrl + 滚动缩放',
      markers: '标记',
      markersList: '标记列表',
      map: '地图',
      mapMaximize: '最大化',
      mapMinimize: '最小化',
      mapReset: '重置',
      mapLayers: '底图',
      gallery: '画廊',
      settings: '设置',
    },
    plugins,
  }
  if (isCubemap) {
    viewerConfig.adapter = CubemapAdapter
  }

  viewer = new Viewer(viewerConfig)

  markersPlugin = viewer.getPlugin<MarkersPlugin>(MarkersPlugin)
  planPlugin = viewer.getPlugin<PlanPlugin>(PlanPlugin)
  galleryPlugin = viewer.getPlugin<GalleryPlugin>(GalleryPlugin)
  autorotatePlugin = viewer.getPlugin<AutorotatePlugin>(AutorotatePlugin)
  compassPlugin = viewer.getPlugin<CompassPlugin>(CompassPlugin)
  gyroscopePlugin = viewer.getPlugin<GyroscopePlugin>(GyroscopePlugin)
  settingsPlugin = viewer.getPlugin<SettingsPlugin>(SettingsPlugin)
  virtualTour = isCubemap ? null : viewer.getPlugin<VirtualTourPlugin>(VirtualTourPlugin)

  // 地图点击精确选点
  planPlugin?.getLeaflet().on('click', (e) => {
    emit('map-pick', [e.latlng.lng, e.latlng.lat])
  })

  // 点击 360 视图获取位置（点击标记时不触发）
  viewer.addEventListener('click', (e: any) => {
    // 忽略右键与点击标记的情况，仅在空白处左键选点
    if (e.data?.rightclick || e.data?.marker) return
    emit('click-empty', { yaw: e.data.yaw, pitch: e.data.pitch })
  })

  // 标记点击
  markersPlugin?.addEventListener('select-marker', ({ marker }) => {
    emit('marker-click', marker.id)
  })

  // 地图热点点击（标记热点）
  planPlugin?.addEventListener('select-hotspot', ({ hotspotId }: any) => {
    if (typeof hotspotId === 'string' && hotspotId.startsWith('__marker__')) {
      emit('marker-click', hotspotId.slice('__marker__'.length))
    }
  })

  // 虚拟导览箭头点击：切换到目标节点，同步标记并通知 App
  virtualTour?.addEventListener('node-changed', ({ node }: any) => {
    syncSceneData(node.id)
    if (node.id !== props.scene.id) {
      emit('scene-change', node.id)
    }
  })

  // 画廊点击：切换场景（App 统一处理，避免与虚拟导览重复导航）
  galleryPlugin?.setItems(
    props.scenes.map((s) => ({
      id: s.id,
      panorama: s.panorama,
      thumbnail: s.thumbnail,
      name: s.name,
    })),
    (id) => emit('scene-change', String(id))
  )

  // 设置面板：鱼眼 / 滚轮缩放 / 缩放级别
  settingsPlugin?.addSetting({
    id: 'fisheye',
    label: '鱼眼效果',
    type: 'toggle',
    active: () => !!viewer?.config.fisheye,
    toggle: () => viewer?.setOption('fisheye', viewer!.config.fisheye ? false : true),
  })
  settingsPlugin?.addSetting({
    id: 'mousewheel',
    label: '滚轮缩放',
    type: 'toggle',
    active: () => !!viewer?.config.mousewheel,
    toggle: () => viewer?.setOption('mousewheel', !viewer!.config.mousewheel),
  })
  settingsPlugin?.addSetting({
    id: 'zoom',
    label: '缩放级别',
    type: 'options',
    current: () => String(Math.round(viewer?.getZoomLevel() ?? 0)),
    options: () => [0, 25, 50, 75, 100].map((v) => ({ id: String(v), label: `${v}%` })),
    apply: (id) => viewer?.zoom(Number(id)),
  })

  // 初始同步当前场景标记 / 罗盘热点 / 自动旋转关键点
  syncSceneData(props.scene.id)
  applyFeatures()
  syncPreview()
}

function destroyViewer() {
  previewShown = false
  if (viewer) {
    viewer.destroy()
    viewer = null
    markersPlugin = null
    planPlugin = null
    virtualTour = null
    galleryPlugin = null
    autorotatePlugin = null
    compassPlugin = null
    gyroscopePlugin = null
    settingsPlugin = null
  }
}

/** 同步某个场景的标记、罗盘热点与自动旋转关键点 */
function syncSceneData(sceneId: string) {
  const sceneMarkers = props.markers.filter((m) => m.sceneId === sceneId)
  markersPlugin?.setMarkers(sceneMarkers.map(toPsvMarkerConfig))
  compassPlugin?.setHotspots(
    sceneMarkers.map((m) => ({
      yaw: m.position.yaw,
      pitch: m.position.pitch,
      color: m.type === 'link' ? '#4ade80' : '#4a9eff',
    }))
  )
  autorotatePlugin?.setKeypoints(
    sceneMarkers.length
      ? sceneMarkers.map((m) => ({ yaw: m.position.yaw, pitch: m.position.pitch }))
      : null
  )
  // setMarkers 会清空标记（含预览 pin），若仍在添加/编辑模式则恢复预览
  previewShown = false
  syncPreview()
}

/** 依据 features 开关应用各插件状态 */
function applyFeatures() {
  const f = props.features
  if (autorotatePlugin) {
    if (f.autorotate) autorotatePlugin.start()
    else autorotatePlugin.stop()
  }
  if (compassPlugin) {
    if (f.compass) compassPlugin.show()
    else compassPlugin.hide()
  }
  if (galleryPlugin) {
    if (f.gallery) galleryPlugin.show()
    else galleryPlugin.hide()
  }
  if (settingsPlugin) {
    if (f.settings) settingsPlugin.showSettings()
    else settingsPlugin.hideSettings()
  }
  if (gyroscopePlugin) {
    if (f.gyroscope) {
      gyroscopePlugin.start().catch(() => emit('gyroscope-error'))
    } else {
      gyroscopePlugin.stop()
    }
  }
}

function previewConfig(m: MarkerData): MarkerConfig {
  return {
    id: PREVIEW_ID,
    tooltip: '新标记位置',
    content: `<div class="psv-marker-content"><h3>新标记位置</h3><p>确认后将在此处创建标记</p></div>`,
    position: m.position,
    image: BASE_URL + 'pictos/pin-red.png',
    size: { width: 34, height: 34 },
    anchor: 'bottom center',
    className: 'psv-marker--preview',
    data: {
      plan: {
        coordinates: m.coordinates,
        size: 30,
        image: BASE_URL + 'pictos/pin-red.png',
      },
    },
  }
}

function syncPreview() {
  if (!markersPlugin) return
  if (previewShown) {
    markersPlugin.removeMarker(PREVIEW_ID)
    previewShown = false
  }
  if (props.previewMarker) {
    markersPlugin.addMarker(previewConfig(props.previewMarker))
    previewShown = true
  }
}

// 场景切换
watch(
  () => props.scene.id,
  (id) => {
    if (!viewer) return
    const newAdapter = adapterOf(props.scene)
    // 适配器变化（等距圆柱 ↔ 立方体）需重建 viewer
    if (newAdapter !== currentAdapter) {
      createViewer()
      return
    }
    if (virtualTour) {
      // 虚拟导览已在目标节点时无需重复导航，仅同步平面地图与标记
      if (virtualTour.getCurrentNode()?.id !== id) {
        virtualTour.setCurrentNode(id)
      }
    } else {
      viewer.setPanorama(props.scene.panorama, {
        caption: props.scene.name,
        showLoader: true,
      })
    }
    planPlugin?.setOptions({ bearing: props.scene.bearing })
    planPlugin?.setCoordinates(props.scene.coordinates)
    planPlugin?.setZoom(props.scene.defaultZoom)
    syncSceneData(id)
  }
)

// 标记变化（增删改 / 导入 / 恢复）时同步当前场景
watch(
  () => props.markers,
  () => {
    if (!viewer) return
    syncSceneData(props.scene.id)
  },
  { deep: true }
)

// 预览标记变化
watch(
  () => props.previewMarker,
  () => {
    if (!viewer) return
    syncPreview()
  }
)

// 功能开关变化
watch(
  () => props.features,
  () => applyFeatures(),
  { deep: true }
)

onMounted(() => {
  createViewer()
})

onUnmounted(() => {
  destroyViewer()
})

/** 旋转视角到某个标记 */
function gotoMarker(id: string) {
  markersPlugin?.gotoMarker(id)
}

defineExpose({
  gotoMarker,
})
</script>

<style scoped>
.psv-container {
  width: 100%;
  height: 100%;
}

/* 小屏兜底：限制地图面板不超过视口 */
:deep(.psv-plan) {
  max-width: calc(100vw - 24px);
  max-height: 40vh;
}
</style>
