<template>
  <div ref="containerRef" class="psv-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import '@photo-sphere-viewer/plan-plugin/index.css'
import 'leaflet/dist/leaflet.css'
import type { Scene, MarkerData } from '../types'
import { toPsvMarkerConfig, BASE_URL } from '../data/scenes'

const props = defineProps<{
  scene: Scene
  markers: MarkerData[]
}>()

const emit = defineEmits<{
  'click-empty': [position: { yaw: number; pitch: number }]
  'ready': []
}>()

const containerRef = ref<HTMLDivElement>()
let viewer: Viewer | null = null
let markersPlugin: MarkersPlugin | null = null
let planPlugin: PlanPlugin | null = null
function createViewer() {
  if (!containerRef.value) return
  destroyViewer()

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
        size: { width: '300px', height: '300px' },
        position: 'bottom left',
        visibleOnLoad: true,
        lang: {
          map: '地图',
          mapMaximize: '最大化',
          mapMinimize: '最小化',
          mapReset: '重置',
          mapLayers: '底图',
        },
      }),
      MarkersPlugin.withConfig({
        markers: props.markers.map(toPsvMarkerConfig),
      }),
    ],
  })

  markersPlugin = viewer.getPlugin(MarkersPlugin)
  planPlugin = viewer.getPlugin(PlanPlugin)

  // 点击360视图获取位置
  viewer.addEventListener('click', (e: any) => {
    emit('click-empty', {
      yaw: e.data.yaw,
      pitch: e.data.pitch,
    })
  })

  // 标记点击事件：旋转视角
  markersPlugin?.addEventListener('select-marker', ({ marker }) => {
    markersPlugin?.gotoMarker(marker.id)
  })

  // 地图热点点击：旋转视角到对应标记
  planPlugin?.addEventListener('select-hotspot', ({ hotspotId }) => {
    const found = props.markers.find(m => m.id === hotspotId)
    if (found && markersPlugin) {
      markersPlugin.gotoMarker(hotspotId)
    }
  })

  emit('ready')
}

function destroyViewer() {
  if (viewer) {
    viewer.destroy()
    viewer = null
    markersPlugin = null
    planPlugin = null
  }
}

function refreshMarkers() {
  if (!markersPlugin) return
  markersPlugin.clearMarkers()
  props.markers.forEach(m => {
    markersPlugin!.addMarker(toPsvMarkerConfig(m) as any)
  })
}

// 场景切换时重建 viewer
watch(() => props.scene.id, () => {
  nextTick(() => createViewer())
})

// 标记变化时增量更新
watch(() => props.markers, () => {
  if (!viewer) return
  refreshMarkers()
}, { deep: true, flush: 'post' })

onMounted(() => {
  createViewer()
})

onUnmounted(() => {
  destroyViewer()
})

// 暴露给父组件
defineExpose({
  getViewer: () => viewer,
  getMarkersPlugin: () => markersPlugin,
  getPlanPlugin: () => planPlugin,
  refreshMarkers,
})
</script>

<style scoped>
.psv-container {
  width: 100%;
  height: 100%;
}
</style>
