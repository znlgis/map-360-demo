<template>
  <aside class="feature-panel" :class="{ 'feature-panel--collapsed': collapsed }">
    <div class="feature-panel-header">
      <button
        class="feature-panel-toggle"
        :aria-expanded="!collapsed"
        title="折叠/展开功能面板"
        @click="collapsed = !collapsed"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" :class="{ 'is-collapsed': collapsed }">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <span class="feature-panel-title">功能演示</span>
    </div>

    <div v-if="!collapsed" class="feature-panel-body">
      <p class="feature-panel-intro">
        基于 Photo Sphere Viewer v5，以下开关可实时切换各项能力。
      </p>

      <div class="feature-list">
        <label class="feature-item">
          <span class="feature-item-text">
            <span class="feature-item-name">自动旋转</span>
            <span class="feature-item-desc">自动缓慢旋转全景（沿标记关键点巡航）</span>
          </span>
          <input
            type="checkbox"
            class="feature-switch"
            :checked="autorotate"
            @change="$emit('update:autorotate', ($event.target as HTMLInputElement).checked)"
          />
        </label>

        <label class="feature-item">
          <span class="feature-item-text">
            <span class="feature-item-name">罗盘</span>
            <span class="feature-item-desc">显示方位罗盘，标记以彩色圆点标注</span>
          </span>
          <input
            type="checkbox"
            class="feature-switch"
            :checked="compass"
            @change="$emit('update:compass', ($event.target as HTMLInputElement).checked)"
          />
        </label>

        <label class="feature-item">
          <span class="feature-item-text">
            <span class="feature-item-name">陀螺仪</span>
            <span class="feature-item-desc">随手机姿态转动（仅移动设备支持）</span>
          </span>
          <input
            type="checkbox"
            class="feature-switch"
            :checked="gyroscope"
            @change="$emit('update:gyroscope', ($event.target as HTMLInputElement).checked)"
          />
        </label>

        <label class="feature-item">
          <span class="feature-item-text">
            <span class="feature-item-name">设置面板</span>
            <span class="feature-item-desc">鱼眼效果、滚轮缩放、缩放级别</span>
          </span>
          <input
            type="checkbox"
            class="feature-switch"
            :checked="settings"
            @change="$emit('update:settings', ($event.target as HTMLInputElement).checked)"
          />
        </label>

        <label class="feature-item">
          <span class="feature-item-text">
            <span class="feature-item-name">缩略图画廊</span>
            <span class="feature-item-desc">底部缩略图快速切换场景</span>
          </span>
          <input
            type="checkbox"
            class="feature-switch"
            :checked="gallery"
            @change="$emit('update:gallery', ($event.target as HTMLInputElement).checked)"
          />
        </label>
      </div>

      <div class="feature-list feature-list--static">
        <div class="feature-item feature-item--static">
          <span class="feature-item-text">
            <span class="feature-item-name">立方体贴图</span>
            <span class="feature-item-desc">切换到「立方体山脉」场景体验 cubemap 适配器</span>
          </span>
          <span class="feature-tag">场景</span>
        </div>
        <div class="feature-item feature-item--static">
          <span class="feature-item-text">
            <span class="feature-item-name">虚拟导览</span>
            <span class="feature-item-desc">场景间 3D 箭头导航（等距圆柱场景互连）</span>
          </span>
          <span class="feature-tag">自动</span>
        </div>
        <div class="feature-item feature-item--static">
          <span class="feature-item-text">
            <span class="feature-item-name">标记 + 地图联动</span>
            <span class="feature-item-desc">标记热点与 Leaflet 地图双向联动</span>
          </span>
          <span class="feature-tag">核心</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  autorotate: boolean
  compass: boolean
  gyroscope: boolean
  settings: boolean
  gallery: boolean
}>()

defineEmits<{
  'update:autorotate': [value: boolean]
  'update:compass': [value: boolean]
  'update:gyroscope': [value: boolean]
  'update:settings': [value: boolean]
  'update:gallery': [value: boolean]
}>()

const collapsed = ref(false)
</script>

<style scoped>
.feature-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  width: 264px;
  max-height: calc(100% - 24px);
  display: flex;
  flex-direction: column;
  background: rgba(22, 24, 42, 0.92);
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.feature-panel--collapsed {
  width: auto;
}

.feature-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #2a2a3e;
  flex-shrink: 0;
}

.feature-panel-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #aaa;
  cursor: pointer;
  transition: all 0.15s;
}

.feature-panel-toggle:hover {
  background: #2a2a3e;
  color: #eee;
}

.feature-panel-toggle svg {
  transition: transform 0.2s;
}

.feature-panel-toggle svg.is-collapsed {
  transform: rotate(180deg);
}

.feature-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #ddd;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.feature-panel-body {
  overflow-y: auto;
  padding: 10px 12px 12px;
}

.feature-panel-intro {
  margin: 0 0 10px;
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-list--static {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #2a2a3e;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.feature-item:hover {
  background: #2a2a3e;
}

.feature-item--static {
  cursor: default;
}

.feature-item--static:hover {
  background: transparent;
}

.feature-item-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.feature-item-name {
  font-size: 13px;
  color: #e0e0e0;
}

.feature-item-desc {
  font-size: 11px;
  color: #777;
  line-height: 1.4;
}

.feature-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 10px;
  color: #4a9eff;
  background: rgba(74, 158, 255, 0.12);
  border: 1px solid rgba(74, 158, 255, 0.3);
  white-space: nowrap;
}

/* 开关样式 */
.feature-switch {
  appearance: none;
  position: relative;
  flex-shrink: 0;
  width: 38px;
  height: 22px;
  border-radius: 99px;
  background: #3a3a52;
  cursor: pointer;
  transition: background 0.2s;
  outline: none;
}

.feature-switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ddd;
  transition: transform 0.2s;
}

.feature-switch:checked {
  background: #4a9eff;
}

.feature-switch:checked::after {
  transform: translateX(16px);
}
</style>
