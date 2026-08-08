<template>
  <div class="marker-list">
    <div class="marker-list-header">
      <span class="marker-list-title">标记列表（{{ markers.length }}）</span>
      <button class="marker-list-restore" @click="$emit('restore')" title="恢复为预设标记">
        恢复默认
      </button>
    </div>
    <div class="marker-list-body" v-if="sortedMarkers.length > 0">
      <div
        v-for="marker in sortedMarkers"
        :key="marker.id"
        class="marker-item"
      >
        <div class="marker-item-info" @click="$emit('viewMarker', marker.id)">
          <div class="marker-item-name-row">
            <span class="marker-item-name">{{ marker.name }}</span>
            <span class="marker-item-time">{{ formatTime(marker.createdAt) }}</span>
          </div>
          <span class="marker-item-desc">{{ marker.description }}</span>
        </div>
        <button class="marker-item-delete" @click="$emit('deleteMarker', marker.id)" title="删除标记" aria-label="删除标记">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <div class="marker-list-empty" v-else>
      <span class="marker-list-empty-icon" aria-hidden="true">📍</span>
      暂无标记，点击「添加标记」后在全景图或地图上选点
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MarkerData } from '@/types'

const props = defineProps<{
  markers: MarkerData[]
}>()

defineEmits<{
  viewMarker: [id: string]
  deleteMarker: [id: string]
  restore: []
}>()

// 新添加的标记排在前面
const sortedMarkers = computed<MarkerData[]>(() =>
  [...props.markers].sort((a, b) => b.createdAt - a.createdAt)
)

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
</script>

<style scoped>
.marker-list {
  background: #1e1e2e;
  border-top: 1px solid #333;
  max-height: 200px;
  display: flex;
  flex-direction: column;
}

.marker-list-header {
  padding: 10px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.marker-list-title {
  font-size: 13px;
  color: #aaa;
  letter-spacing: 0.5px;
}

.marker-list-restore {
  padding: 3px 10px;
  border: 1px solid #3a3a52;
  border-radius: 6px;
  background: transparent;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.marker-list-restore:hover {
  border-color: #4a9eff;
  color: #4a9eff;
  background: rgba(74, 158, 255, 0.1);
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
}

.marker-item-name {
  font-size: 14px;
  color: #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.marker-item-time {
  flex-shrink: 0;
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

.marker-item-delete {
  flex-shrink: 0;
  margin-left: 12px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
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
