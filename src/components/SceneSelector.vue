<template>
  <div class="scene-selector">
    <label class="scene-label">场景：</label>
    <select
      class="scene-select"
      :value="currentSceneId"
      @change="onSelect"
    >
      <option
        v-for="scene in scenes"
        :key="scene.id"
        :value="scene.id"
      >
        {{ scene.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { Scene } from '@/types'

defineProps<{
  scenes: Scene[]
  currentSceneId: string
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

function onSelect(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('select', target.value)
}
</script>

<style scoped>
.scene-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}
.scene-label {
  color: #ccc;
  font-size: 14px;
  white-space: nowrap;
}
.scene-select {
  padding: 6px 12px;
  border: 1px solid #555;
  border-radius: 6px;
  background: #2a2a3e;
  color: #eee;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}
.scene-select:focus {
  border-color: #4a9eff;
}
</style>
