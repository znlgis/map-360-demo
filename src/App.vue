<template>
  <div class="app">
    <header class="app-toolbar">
      <SceneSelector
        :scenes="scenes"
        :currentSceneId="currentSceneId"
        @select="onSceneSwitch"
      />
      <div class="toolbar-actions">
        <span class="scene-desc">{{ currentScene.description }}</span>
        <button class="toolbar-btn" @click="startAddMarker">
          ➕ 添加标记
        </button>
      </div>
    </header>

    <main class="app-main">
      <PsvContainer
        ref="psvRef"
        :scene="currentScene"
        :markers="markers"
        @click-empty="onClickEmpty"
      />
    </main>

    <footer class="app-footer">
      <MarkerList
        :markers="currentMarkers"
        @view-marker="onViewMarker"
        @delete-marker="onDeleteMarker"
      />
    </footer>

    <MarkerModal
      :visible="showModal"
      @confirm="onConfirmMarker"
      @cancel="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SceneSelector from './components/SceneSelector.vue'
import PsvContainer from './components/PsvContainer.vue'
import MarkerList from './components/MarkerList.vue'
import MarkerModal from './components/MarkerModal.vue'
import { useAppState } from './composables/useAppState'

const {
  scenes,
  currentSceneId,
  currentScene,
  markers,
  currentMarkers,
  switchScene,
  addMarker,
  removeMarker,
} = useAppState()

const psvRef = ref<InstanceType<typeof PsvContainer>>()
const showModal = ref(false)
const pendingPosition = ref<{ yaw: number; pitch: number } | null>(null)

function onSceneSwitch(id: string) {
  switchScene(id)
}

function startAddMarker() {
  alert('请点击360全景图中的空白位置来放置标记')
}

function onClickEmpty(position: { yaw: number; pitch: number }) {
  pendingPosition.value = position
  showModal.value = true
}

function onConfirmMarker(name: string, description: string) {
  if (!pendingPosition.value) return
  const pos = pendingPosition.value

  // 根据当前场景 GPS 粗略计算标记 GPS（微调偏移）
  const [lng, lat] = currentScene.value.coordinates
  const offsetLng = (pos.yaw - Math.PI) * 0.002
  const offsetLat = pos.pitch * 0.002
  const markerCoords: [number, number] = [
    Math.round((lng + offsetLng) * 1e5) / 1e5,
    Math.round((lat + offsetLat) * 1e5) / 1e5,
  ]

  addMarker({
    sceneId: currentScene.value.id,
    name,
    description,
    position: pos,
    coordinates: markerCoords,
  })

  showModal.value = false
  pendingPosition.value = null
}

function onViewMarker(id: string) {
  const p = psvRef.value?.getMarkersPlugin()
  if (p) p.gotoMarker(id)
}

function onDeleteMarker(id: string) {
  removeMarker(id)
}
</script>

<style>
/* 全局样式 — PSV marker tooltip 中文内容样式（适配深色面板背景） */
.psv-panel-content,
.psv-marker-content {
  padding: 8px;
  min-width: 200px;
}
.psv-marker-content h3 {
  margin: 0 0 6px;
  font-size: 15px;
  color: #e0e0e0;
}
.psv-marker-content p {
  margin: 0;
  font-size: 13px;
  color: #b0b0b0;
  line-height: 1.5;
}

/* PSV 深色面板文字全局可读性 */
.psv-panel,
.psv-panel-content {
  color: #d0d0d0;
}
.psv-panel h3,
.psv-panel .psv-panel-title {
  color: #e8e8e8;
}
</style>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  color: #eee;
}
.app-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #16162a;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.scene-desc {
  font-size: 13px;
  color: #999;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toolbar-btn {
  padding: 6px 16px;
  border: 1px solid #4a9eff;
  border-radius: 6px;
  background: rgba(74, 158, 255, 0.15);
  color: #4a9eff;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.toolbar-btn:hover {
  background: rgba(74, 158, 255, 0.3);
}
.app-main {
  flex: 1;
  min-height: 0;
}
.app-footer {
  flex-shrink: 0;
}
</style>
