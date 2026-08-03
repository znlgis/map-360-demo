<template>
  <div class="marker-list">
    <div class="marker-list-header">
      <span class="marker-list-title">标记列表（{{ markers.length }}）</span>
    </div>
    <div class="marker-list-body" v-if="markers.length > 0">
      <div
        v-for="marker in markers"
        :key="marker.id"
        class="marker-item"
      >
        <div class="marker-item-info" @click="$emit('viewMarker', marker.id)">
          <span class="marker-item-name">{{ marker.name }}</span>
          <span class="marker-item-desc">{{ marker.description }}</span>
        </div>
        <button class="marker-item-delete" @click="$emit('deleteMarker', marker.id)" title="删除标记">
          ✕
        </button>
      </div>
    </div>
    <div class="marker-list-empty" v-else>
      暂无标记，点击全景图空白处添加
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MarkerData } from '@/types'

defineProps<{
  markers: MarkerData[]
}>()

defineEmits<{
  viewMarker: [id: string]
  deleteMarker: [id: string]
}>()
</script>

<style scoped>
.marker-list {
  background: #1e1e2e;
  border-top: 1px solid #333;
  max-height: 180px;
  display: flex;
  flex-direction: column;
}
.marker-list-header {
  padding: 10px 16px;
  flex-shrink: 0;
}
.marker-list-title {
  font-size: 13px;
  color: #aaa;
}
.marker-list-body {
  overflow-y: auto;
  flex: 1;
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
.marker-item-name {
  display: block;
  font-size: 14px;
  color: #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  border-radius: 4px;
  background: transparent;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.marker-item-delete:hover {
  background: rgba(255, 80, 80, 0.2);
  color: #ff5050;
}
.marker-list-empty {
  padding: 24px 16px;
  text-align: center;
  color: #666;
  font-size: 13px;
}
</style>
