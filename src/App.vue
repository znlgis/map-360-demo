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
        <button
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': adding }"
          @click="startAddMarker"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {{ adding ? '添加模式中…' : '添加标记' }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <Transition name="hint">
        <div v-if="adding" class="add-mode-bar">
          <span class="add-mode-icon" aria-hidden="true">📍</span>
          <span>添加模式：点击全景图空白处，或点击右下角地图精确定位</span>
          <button class="add-mode-cancel" @click="exitAdding">取消</button>
        </div>
      </Transition>
      <PsvContainer
        ref="psvRef"
        :scene="currentScene"
        :markers="currentMarkers"
        :preview-marker="previewMarker"
        @click-empty="onClickEmpty"
        @map-pick="onMapPick"
      />
    </main>

    <footer class="app-footer">
      <MarkerList
        :markers="currentMarkers"
        @view-marker="onViewMarker"
        @delete-marker="onDeleteMarker"
        @restore="onRestoreMarkers"
      />
    </footer>

    <MarkerModal
      :visible="showModal"
      :coordinates="modalCoords"
      @confirm="onConfirmMarker"
      @cancel="onCancelMarker"
    />

    <ToastHost />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SceneSelector from '@/components/SceneSelector.vue'
import PsvContainer from '@/components/PsvContainer.vue'
import { PREVIEW_ID } from '@/data/scenes'
import MarkerList from '@/components/MarkerList.vue'
import MarkerModal from '@/components/MarkerModal.vue'
import ToastHost from '@/components/ToastHost.vue'
import { useAppState } from '@/composables/useAppState'
import { useToast } from '@/composables/useToast'
import { estimateGps, yawFromGps } from '@/utils/geo'
import type { MarkerData } from '@/types'

const {
  scenes,
  currentSceneId,
  currentScene,
  currentMarkers,
  switchScene,
  addMarker,
  removeMarker,
  resetMarkers,
} = useAppState()

const { show } = useToast()

const psvRef = ref<InstanceType<typeof PsvContainer>>()
const showModal = ref(false)

// ---- 添加模式状态 ----
const adding = ref(false)
const pendingPosition = ref<{ yaw: number; pitch: number } | null>(null)
const pendingCoords = ref<[number, number] | null>(null)

/** 弹窗显示的坐标（有选点则用选点，否则用场景中心） */
const modalCoords = computed<[number, number]>(() =>
  pendingCoords.value ?? currentScene.value.coordinates
)

/** 待确认标记的预览 pin（红色脉冲），确认前同步显示在全景与地图上 */
const previewMarker = computed<MarkerData | null>(() => {
  if (!pendingPosition.value || !pendingCoords.value) return null
  return {
    id: PREVIEW_ID,
    sceneId: currentScene.value.id,
    name: '',
    description: '',
    position: pendingPosition.value,
    coordinates: pendingCoords.value,
    createdAt: 0,
  }
})

function startAddMarker() {
  if (adding.value) return
  adding.value = true
  show('已进入添加模式：点击全景图或地图选择标记位置', 'info')
}

/** 完全退出添加模式并清理预览 */
function exitAdding() {
  adding.value = false
  pendingPosition.value = null
  pendingCoords.value = null
  showModal.value = false
}

function onSceneSwitch(id: string) {
  exitAdding()
  const target = scenes.value.find(s => s.id === id)
  switchScene(id)
  if (target) {
    show(`已切换到「${target.name}」`, 'info')
  }
}

function onClickEmpty(position: { yaw: number; pitch: number }) {
  if (!adding.value) return
  pendingPosition.value = position
  // 按场景方位角估算经纬度，方向与点击方位一致
  pendingCoords.value = estimateGps(currentScene.value, position.yaw, position.pitch)
  showModal.value = true
}

function onMapPick(coords: [number, number]) {
  if (!adding.value) return
  pendingCoords.value = coords
  // 反推 yaw，使 360 预览 pin 朝向地图所选方向
  const yaw = yawFromGps(currentScene.value, coords)
  pendingPosition.value = pendingPosition.value
    ? { ...pendingPosition.value, yaw }
    : { yaw, pitch: 0 }
  showModal.value = true
}

function onConfirmMarker(name: string, description: string, coordinates: [number, number]) {
  if (!pendingPosition.value) return
  addMarker({
    sceneId: currentScene.value.id,
    name,
    description,
    position: pendingPosition.value,
    coordinates,
  })
  show(`已添加标记「${name}」`, 'success')
  exitAdding()
}

/** 弹窗取消：保留预览 pin 和添加模式，便于重新选点 */
function onCancelMarker() {
  showModal.value = false
}

function onViewMarker(id: string) {
  const p = psvRef.value?.getMarkersPlugin()
  if (p) p.gotoMarker(id)
}

function onDeleteMarker(id: string) {
  const marker = currentMarkers.value.find(m => m.id === id)
  removeMarker(id)
  show(`已删除标记「${marker?.name ?? id}」`, 'info')
}

function onRestoreMarkers() {
  resetMarkers()
  show('已恢复为预设标记', 'success')
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

/* 预览 pin 脉冲动效 */
.psv-marker--preview {
  animation: psv-preview-pulse 1.1s ease-in-out infinite;
}

.psv-marker--preview .psv-marker-image {
  transform-origin: bottom center;
}

@keyframes psv-preview-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.22); }
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
  gap: 12px;
  padding: 10px 16px;
  background: #16162a;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: 1px solid #4a9eff;
  border-radius: 6px;
  background: rgba(74, 158, 255, 0.15);
  color: #4a9eff;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: rgba(74, 158, 255, 0.3);
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.15);
}

.toolbar-btn:active {
  transform: scale(0.97);
}

.toolbar-btn--active {
  background: rgba(74, 158, 255, 0.35);
  border-color: #6db3ff;
  color: #bcdcff;
}

.app-main {
  flex: 1;
  min-height: 0;
  position: relative;
}

/* 添加模式提示条 */
.add-mode-bar {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  color: #fff;
  background: rgba(22, 24, 42, 0.92);
  border: 1px solid rgba(74, 158, 255, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  pointer-events: none;
  white-space: nowrap;
}

.add-mode-icon {
  font-size: 15px;
}

.add-mode-cancel {
  pointer-events: auto;
  margin-left: 4px;
  padding: 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #ddd;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.add-mode-cancel:hover {
  background: rgba(255, 80, 80, 0.25);
  border-color: #ff6b6b;
  color: #fff;
}

.hint-enter-active,
.hint-leave-active {
  transition: all 0.25s ease;
}

.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.app-footer {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .scene-desc {
    display: none;
  }

  .add-mode-bar {
    font-size: 12px;
  }
}
</style>
