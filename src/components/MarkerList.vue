<template>
  <div class="marker-list">
    <div class="marker-list-header">
      <div class="marker-list-title-row">
        <button class="marker-list-toggle" @click="collapsed = !collapsed" :aria-expanded="!collapsed" title="折叠/展开">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" :class="{ 'is-collapsed': collapsed }">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <span class="marker-list-title">标记列表（{{ visibleMarkers.length }}）</span>
      </div>
      <div class="marker-list-actions">
        <button class="marker-list-btn" @click="onExport" title="导出全部标记为 JSON 文件">导出</button>
        <button class="marker-list-btn" @click="fileInput?.click()" title="从 JSON 文件导入标记">导入</button>
        <button class="marker-list-btn marker-list-btn--danger" @click="$emit('restore')" title="恢复为预设标记">
          恢复默认
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="marker-list-file"
          @change="onImportFile"
        />
      </div>
    </div>

    <div class="marker-list-search" v-if="!collapsed">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        v-model="keyword"
        class="marker-list-search-input"
        type="search"
        placeholder="搜索标记名称或描述…"
      />
    </div>

    <div class="marker-list-body" v-if="!collapsed && visibleMarkers.length > 0">
      <div
        v-for="marker in visibleMarkers"
        :key="marker.id"
        class="marker-item"
      >
        <div class="marker-item-info" @click="$emit('viewMarker', marker.id)">
          <div class="marker-item-name-row">
            <span class="marker-item-name">{{ marker.name }}</span>
            <span
              v-if="marker.type === 'link' && marker.targetSceneId"
              class="marker-item-link-badge"
              :title="`点击跳转到 ${targetSceneName(marker.targetSceneId)}`"
            >
              ➜ {{ targetSceneName(marker.targetSceneId) }}
            </span>
            <span class="marker-item-time">{{ formatTime(marker.createdAt) }}</span>
          </div>
          <span class="marker-item-desc">{{ marker.description }}</span>
        </div>
        <div class="marker-item-actions">
          <button class="marker-item-edit" @click="$emit('editMarker', marker.id)" title="编辑标记" aria-label="编辑标记">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
            </svg>
          </button>
          <button class="marker-item-delete" @click="$emit('deleteMarker', marker.id)" title="删除标记" aria-label="删除标记">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="marker-list-empty" v-else-if="!collapsed">
      <span class="marker-list-empty-icon" aria-hidden="true">{{ keyword ? '🔍' : '📍' }}</span>
      {{ keyword ? '未找到匹配的标记' : '暂无标记，点击「添加标记」后在全景图或地图上选点' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MarkerData } from '@/types'
import { SCENES } from '@/data/scenes'

const props = defineProps<{
  markers: MarkerData[]
}>()

const emit = defineEmits<{
  viewMarker: [id: string]
  editMarker: [id: string]
  deleteMarker: [id: string]
  restore: []
  /** 导出全部标记 */
  export: []
  /** 导入 JSON 内容 */
  import: [json: string]
}>()

const collapsed = ref(false)
const keyword = ref('')
const fileInput = ref<HTMLInputElement>()

/** 新添加的标记排在前面 */
const sortedMarkers = computed<MarkerData[]>(() =>
  [...props.markers].sort((a, b) => b.createdAt - a.createdAt)
)

const visibleMarkers = computed<MarkerData[]>(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return sortedMarkers.value
  return sortedMarkers.value.filter(m =>
    m.name.toLowerCase().includes(kw) || m.description.toLowerCase().includes(kw)
  )
})

function targetSceneName(sceneId: string): string {
  return SCENES.find(s => s.id === sceneId)?.name ?? sceneId
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  if (sameDay) return `${hh}:${mm}`
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${mo}-${day} ${hh}:${mm}`
}

function onExport() {
  emit('export')
}

function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    emit('import', String(reader.result ?? ''))
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.marker-list {
  background: #1e1e2e;
  border-top: 1px solid #333;
  max-height: 220px;
  display: flex;
  flex-direction: column;
}

.marker-list-header {
  padding: 8px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.marker-list-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.marker-list-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
}

.marker-list-toggle:hover {
  background: #2a2a3e;
  color: #eee;
}

.marker-list-toggle svg {
  transition: transform 0.2s;
}

.marker-list-toggle svg.is-collapsed {
  transform: rotate(-90deg);
}

.marker-list-title {
  font-size: 13px;
  color: #aaa;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.marker-list-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.marker-list-btn {
  padding: 3px 10px;
  border: 1px solid #3a3a52;
  border-radius: 6px;
  background: transparent;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.marker-list-btn:hover {
  border-color: #4a9eff;
  color: #4a9eff;
  background: rgba(74, 158, 255, 0.1);
}

.marker-list-btn--danger:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
  background: rgba(255, 80, 80, 0.1);
}

.marker-list-file {
  display: none;
}

.marker-list-search {
  padding: 0 16px 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #777;
}

.marker-list-search-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #3a3a52;
  border-radius: 6px;
  background: #2a2a3e;
  color: #eee;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.marker-list-search-input:focus {
  border-color: #4a9eff;
}

.marker-list-search-input::placeholder {
  color: #666;
}

.marker-list-body {
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #3a3a52 transparent;
}

.marker-list-body::-webkit-scrollbar {
  width: 6px;
}

.marker-list-body::-webkit-scrollbar-thumb {
  background: #3a3a52;
  border-radius: 3px;
}

.marker-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid #2a2a3e;
  transition: background 0.15s;
}

.marker-item:hover {
  background: #2a2a3e;
}

.marker-item-info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.marker-item-name-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.marker-item-name {
  font-size: 14px;
  color: #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.marker-item-link-badge {
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 99px;
  font-size: 11px;
  color: #4ade80;
  background: rgba(74, 222, 128, 0.12);
  border: 1px solid rgba(74, 222, 128, 0.3);
  white-space: nowrap;
}

.marker-item-time {
  flex-shrink: 0;
  margin-left: auto;
  font-size: 11px;
  color: #5a5a7a;
}

.marker-item-desc {
  display: block;
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.marker-item-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 12px;
}

.marker-item-edit,
.marker-item-delete {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marker-item-edit:hover {
  background: rgba(74, 158, 255, 0.15);
  color: #4a9eff;
}

.marker-item-delete:hover {
  background: rgba(255, 80, 80, 0.18);
  color: #ff5050;
}

.marker-list-empty {
  padding: 20px 16px;
  text-align: center;
  color: #666;
  font-size: 13px;
}

.marker-list-empty-icon {
  margin-right: 6px;
}
</style>
