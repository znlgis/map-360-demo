<template>
  <div ref="containerRef" class="psv-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import type { MarkerConfig } from '@photo-sphere-viewer/markers-plugin'
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import '@photo-sphere-viewer/plan-plugin/index.css'
import 'leaflet/dist/leaflet.css'
import type { Scene, MarkerData } from '@/types'
import { toPsvMarkerConfig, BASE_URL, PREVIEW_ID } from '@/data/scenes'

const props = defineProps<{
  scene: Scene
  markers: MarkerData[]
  /** 待确认的标记预览（红色脉冲 pin，同时显示在地图上） */
  previewMarker?: MarkerData | null
}>()

const emit = defineEmits<{
  'click-empty': [position: { yaw: number; pitch: number }]
  'map-pick': [coords: [number, number]]
  /** 用户点击全景标记或地图热点时触发（由 App 决定跳转逻辑） */
  'marker-click': [id: string]
}>()

const containerRef = ref<HTMLDivElement>()
let viewer: Viewer | null = null
let markersPlugin: MarkersPlugin | null = null
let planPlugin: PlanPlugin | null = null
let viewerSceneId = ''
let previewShown = false

function createViewer() {
  if (!containerRef.value) return
  destroyViewer()
  viewerSceneId = props.scene.id

  viewer = new Viewer({
    container: containerRef.value,
    panorama: props.scene.panorama,
    caption: props.scene.name,
    loadingImg: BASE_URL + 'loader.gif',
    navbar: ['zoom', 'fullscreen', 'caption', 'markers', 'markersList'],
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
    },
    plugins: [
      PlanPlugin.withConfig({
        coordinates: props.scene.coordinates,
        bearing: props.scene.bearing,
        defaultZoom: props.scene.defaultZoom,
        // 响应式尺寸：桌面 300px，小屏按视口收缩
        size: { width: 'min(300px, 72vw)', height: 'min(300px, 34vh)' },
        position: 'bottom left',
        visibleOnLoad: true,
        // 暴露原始 Leaflet 实例，用于地图点击精确选点
        configureLeaflet: (map) => {
          map.on('click', (e) => {
            emit('map-pick', [e.latlng.lng, e.latlng.lat])
          })
        },
      }),
      MarkersPlugin.withConfig({
        markers: props.markers.map(toPsvMarkerConfig),
      }),
    ],
  })

  markersPlugin = viewer.getPlugin<MarkersPlugin>(MarkersPlugin)
  planPlugin = viewer.getPlugin<PlanPlugin>(PlanPlugin)

  // 点击360视图获取位置（点击标记时不触发）
  viewer.addEventListener('click', (e) => {
    if (e.data.marker) return
    emit('click-empty', {
      yaw: e.data.yaw,
      pitch: e.data.pitch,
    })
  })

  // 标记点击事件：交由 App 决定（信息标记旋转视角 / 跳转标记切换场景）
  markersPlugin?.addEventListener('select-marker', ({ marker }) => {
    emit('marker-click', marker.id)
  })

  // 地图热点点击：同样交由 App 处理
  planPlugin?.addEventListener('select-hotspot', ({ hotspotId }) => {
    emit('marker-click', hotspotId)
  })

  // 若创建时已有预览标记（如场景重建），确保渲染
  syncPreview()
}

function destroyViewer() {
  previewShown = false
  if (viewer) {
    viewer.destroy()
    viewer = null
    markersPlugin = null
    planPlugin = null
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
  if (!markersPlugin || viewerSceneId !== props.scene.id) return
  if (previewShown) {
    markersPlugin.removeMarker(PREVIEW_ID)
    previewShown = false
  }
  if (props.previewMarker) {
    markersPlugin.addMarker(previewConfig(props.previewMarker))
    previewShown = true
  }
}

function refreshMarkers() {
  if (!markersPlugin || viewerSceneId !== props.scene.id) return
  markersPlugin.setMarkers(props.markers.map(toPsvMarkerConfig))
  previewShown = false
  syncPreview()
}

// 场景切换：复用 viewer 实例，仅更新全景图/地图/标记。
// 相比销毁重建，保留 WebGL 上下文与 Leaflet 瓦片缓存，切换更快且带过渡动画。
watch(() => props.scene.id, (id) => {
  if (!viewer || viewerSceneId === id) return
  viewerSceneId = id
  refreshMarkers()
  planPlugin?.setOptions({ bearing: props.scene.bearing })
  planPlugin?.setCoordinates(props.scene.coordinates)
  planPlugin?.setZoom(props.scene.defaultZoom)
  viewer.setPanorama(props.scene.panorama, {
    caption: props.scene.name,
    showLoader: true,
  })
})

// 标记变化时增量更新
watch(() => props.markers, () => {
  if (!viewer) return
  refreshMarkers()
}, { deep: true, flush: 'post' })

// 预览标记变化时同步
watch(() => props.previewMarker, () => {
  if (!viewer) return
  syncPreview()
}, { deep: true })

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

// 暴露语义化接口，不直接暴露插件实例
defineExpose({
  gotoMarker,
  refreshMarkers,
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
