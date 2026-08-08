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
          :class="{ 'toolbar-btn--active': flow.adding.value }"
          @click="flow.startAddMarker()"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {{ flow.adding.value ? (isEditing ? '编辑中…' : '添加模式中…') : '添加标记' }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <Transition name="hint">
        <div v-if="flow.adding.value" class="add-mode-bar">
          <span class="add-mode-icon" aria-hidden="true">📍</span>
          <span>
            {{ isEditing ? '编辑模式：点击全景图或地图调整位置' : '添加模式：点击全景图空白处，或点击右下角地图精确定位' }}
          </span>
          <button class="add-mode-cancel" @click="flow.exitAdding()">取消</button>
        </div>
      </Transition>
      <PsvContainer
        ref="psvRef"
        :scene="currentScene"
        :markers="currentMarkers"
        :preview-marker="flow.previewMarker.value"
        @click-empty="flow.onClickEmpty"
        @map-pick="flow.onMapPick"
        @marker-click="onMarkerClick"
      />
    </main>

    <footer class="app-footer">
      <MarkerList
        :markers="currentMarkers"
        @view-marker="onViewMarker"
        @edit-marker="onEditMarker"
        @delete-marker="onDeleteMarker"
        @restore="onRestoreMarkers"
        @export="onExportMarkers"
        @import="onImportMarkers"
      />
    </footer>

    <MarkerModal
      :visible="flow.showModal.value"
      :coordinates="flow.modalCoords.value"
      :current-scene-id="currentSceneId"
      :scenes="scenes"
      :editing-marker="flow.editingMarker.value"
      @confirm="flow.onModalConfirm"
      @cancel="flow.onModalCancel"
    />

    <ToastHost />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SceneSelector from '@/components/SceneSelector.vue'
import PsvContainer from '@/components/PsvContainer.vue'
import MarkerList from '@/components/MarkerList.vue'
import MarkerModal from '@/components/MarkerModal.vue'
import ToastHost from '@/components/ToastHost.vue'
import { useAppState } from '@/composables/useAppState'
import { useToast } from '@/composables/useToast'
import { useAddMarkerFlow } from '@/composables/useAddMarkerFlow'
import type { MarkerData } from '@/types'

const {
  scenes,
  currentSceneId,
  currentScene,
  currentMarkers,
  switchScene,
  addMarker,
  updateMarker,
  removeMarker,
  resetMarkers,
  exportMarkers,
  importMarkers,
} = useAppState()

const { show } = useToast()

const psvRef = ref<InstanceType<typeof PsvContainer>>()

const flow = useAddMarkerFlow({
  currentScene,
  currentMarkers,
  onAdd: (payload) => {
    const marker = addMarker(payload)
    show(`已添加标记「${marker.name}」`, 'success')
  },
  onUpdate: (id, patch) => {
    updateMarker(id, patch)
    const m = currentMarkers.value.find(x => x.id === id)
    show(`已更新标记「${m?.name ?? id}」`, 'success')
  },
})

const isEditing = computed(() => !!flow.editingMarker.value)

function onSceneSwitch(id: string) {
  flow.exitAdding()
  const target = scenes.value.find(s => s.id === id)
  switchScene(id)
  if (target) {
    show(`已切换到「${target.name}」`, 'info')
  }
}

/** 标记点击：link 标记切换场景，info 标记旋转视角 */
function onMarkerClick(id: string) {
  const marker = currentMarkers.value.find(m => m.id === id)
  if (!marker) return
  if (marker.type === 'link' && marker.targetSceneId) {
    // 已在该场景时无需切换
    if (marker.targetSceneId === currentScene.value.id) {
      show('已在该场景中', 'info')
      return
    }
    flow.exitAdding()
    const target = scenes.value.find(s => s.id === marker.targetSceneId)
    switchScene(marker.targetSceneId!)
    if (target) {
      show(`已跳转至「${target.name}」`, 'info')
    }
  } else {
    psvRef.value?.gotoMarker(id)
  }
}

function onViewMarker(id: string) {
  psvRef.value?.gotoMarker(id)
}

function onEditMarker(id: string) {
  const marker = currentMarkers.value.find(m => m.id === id)
  if (marker) {
    flow.openEdit(marker)
  }
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

function onExportMarkers() {
  const blob = new Blob([exportMarkers()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `map-360-markers-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  show('已导出全部标记', 'success')
}

function onImportMarkers(json: string) {
  const result = importMarkers(json)
  show(result.message, result.ok ? 'success' : 'error')
}
</script>

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
