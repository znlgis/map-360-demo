<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="modalTitleId"
        @click.self="cancel"
        @keydown="onKeydown"
      >
        <div class="modal-content" tabindex="-1">
          <h3 :id="modalTitleId" class="modal-title">
            {{ isEditing ? '编辑标记' : '添加标记' }}
          </h3>

          <div class="modal-field">
            <label class="modal-label" for="marker-name">标记名称</label>
            <input
              id="marker-name"
              ref="nameInput"
              v-model="name"
              class="modal-input"
              placeholder="请输入标记名称"
              maxlength="30"
              @keyup.enter="confirm"
            />
          </div>

          <div class="modal-field">
            <label class="modal-label" for="marker-desc">描述信息（选填）</label>
            <textarea
              id="marker-desc"
              v-model="description"
              class="modal-textarea"
              placeholder="请输入描述信息"
              rows="3"
              maxlength="100"
            ></textarea>
          </div>

          <div class="modal-field">
            <span class="modal-label">标记类型</span>
            <div class="modal-types" role="radiogroup" aria-label="标记类型">
              <label class="modal-type" :class="{ 'modal-type--active': type === 'info' }">
                <input v-model="type" type="radio" value="info" class="modal-type-input" />
                <span class="modal-type-icon" aria-hidden="true">📍</span>
                <span class="modal-type-text">
                  <span class="modal-type-name">信息标记</span>
                  <span class="modal-type-desc">展示景点、提示等信息</span>
                </span>
              </label>
              <label class="modal-type" :class="{ 'modal-type--active': type === 'link' }">
                <input v-model="type" type="radio" value="link" class="modal-type-input" />
                <span class="modal-type-icon" aria-hidden="true">➜</span>
                <span class="modal-type-text">
                  <span class="modal-type-name">场景跳转</span>
                  <span class="modal-type-desc">点击后切换到目标场景</span>
                </span>
              </label>
            </div>
          </div>

          <div class="modal-field" v-if="type === 'link'">
            <label class="modal-label" for="marker-target">目标场景</label>
            <select id="marker-target" v-model="targetSceneId" class="modal-input">
              <option v-for="s in targetScenes" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
            <p class="modal-hint">在全景或地图上点击该标记，将跳转到目标场景</p>
          </div>

          <div class="modal-field">
            <span class="modal-label">标记位置（经纬度）</span>
            <div class="modal-coords">
              <div class="modal-coords-item">
                <label class="modal-label modal-label--sub" for="marker-lng">经度</label>
                <input
                  id="marker-lng"
                  v-model="lng"
                  type="number"
                  step="0.000001"
                  class="modal-input"
                  placeholder="如 6.786770"
                />
              </div>
              <div class="modal-coords-item">
                <label class="modal-label modal-label--sub" for="marker-lat">纬度</label>
                <input
                  id="marker-lat"
                  v-model="lat"
                  type="number"
                  step="0.000001"
                  class="modal-input"
                  placeholder="如 44.582410"
                />
              </div>
            </div>
            <div class="modal-dist">
              <div class="modal-dist-head">
                <label class="modal-label modal-label--sub" for="marker-dist">距拍摄点距离</label>
                <span class="modal-dist-value">约 {{ Math.round(distM) }} 米</span>
              </div>
              <input
                id="marker-dist"
                :value="sliderDist"
                class="modal-dist-slider"
                type="range"
                min="50"
                max="3000"
                step="10"
                @input="onDistInput"
              />
              <p class="modal-hint">拖动滑块沿当前方向远近移动标记，全景与地图预览实时同步；也可直接修改上方经纬度</p>
            </div>
          </div>

          <div class="modal-actions">
            <button class="modal-btn modal-btn-cancel" @click="cancel">取消</button>
            <button
              class="modal-btn modal-btn-confirm"
              :disabled="!name.trim() || (type === 'link' && !targetSceneId)"
              @click="confirm"
            >
              {{ isEditing ? '保存修改' : '确认添加' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount, useId } from 'vue'
import type { MarkerData, MarkerPayload, MarkerType, Scene } from '@/types'
import { distanceMeters, bearingBetween, destination } from '@/utils/geo'

const props = defineProps<{
  visible: boolean
  coordinates: [number, number]
  /** 当前场景 id（用于排除目标场景选项） */
  currentSceneId: string
  /** 所有场景（目标场景下拉用） */
  scenes: Scene[]
  /** 编辑中的标记，为空表示新增 */
  editingMarker?: MarkerData | null
  /** 当前场景拍摄点坐标（距离滑块的基准） */
  sceneCoordinates: [number, number]
}>()

const emit = defineEmits<{
  confirm: [payload: MarkerPayload]
  cancel: []
  /** 弹窗内坐标被修改（距离滑块），用于实时同步预览 */
  'coords-change': [coords: [number, number]]
}>()

const modalTitleId = useId()
const name = ref('')
const description = ref('')
const lng = ref('')
const lat = ref('')
const type = ref<MarkerType>('info')
const targetSceneId = ref('')
const nameInput = ref<HTMLInputElement>()
/** 打开弹窗前聚焦的元素，关闭后恢复 */
let lastFocused: HTMLElement | null = null

const isEditing = computed(() => !!props.editingMarker)

const targetScenes = computed<Scene[]>(() =>
  props.scenes.filter(s => s.id !== props.currentSceneId)
)

function syncCoords() {
  lng.value = props.coordinates[0].toFixed(6)
  lat.value = props.coordinates[1].toFixed(6)
}

watch(() => props.visible, (val) => {
  if (val) {
    // 编辑模式预填；新增模式清空
    if (props.editingMarker) {
      const m = props.editingMarker
      name.value = m.name
      description.value = m.description
      type.value = m.type ?? 'info'
      targetSceneId.value = m.targetSceneId ?? props.scenes.find(s => s.id !== props.currentSceneId)?.id ?? ''
    } else {
      name.value = ''
      description.value = ''
      type.value = 'info'
      targetSceneId.value = props.scenes.find(s => s.id !== props.currentSceneId)?.id ?? ''
    }
    syncCoords()
    lastFocused = document.activeElement as HTMLElement | null
    nextTick(() => nameInput.value?.focus())
  } else {
    // 关闭后恢复焦点
    lastFocused?.focus?.()
    lastFocused = null
  }
})

// 地图选点等外部坐标变化时同步输入框
watch(() => props.coordinates, () => {
  if (props.visible) syncCoords()
})

/** 表单当前坐标（解析失败时回退到选点坐标） */
const formCoords = computed<[number, number]>(() => {
  const lo = Number.parseFloat(lng.value)
  const la = Number.parseFloat(lat.value)
  if (Number.isNaN(lo) || Number.isNaN(la)) return props.coordinates
  return [lo, la]
})

/** 标记距拍摄点的地面距离（米） */
const distM = computed<number>(() =>
  distanceMeters(props.sceneCoordinates, formCoords.value)
)

/** 滑块显示值：钳制在可选范围内（极近/极远时滑块贴边但数值照常显示） */
const sliderDist = computed<number>(() =>
  Math.min(3000, Math.max(50, Math.round(distM.value)))
)

/** 拖动距离滑块：沿当前方位角移动，保持方向不变 */
function onDistInput(e: Event) {
  const dist = Number((e.target as HTMLInputElement).value)
  const bearing = bearingBetween(props.sceneCoordinates, formCoords.value)
  const coords = destination(props.sceneCoordinates, bearing, dist)
  lng.value = coords[0].toFixed(6)
  lat.value = coords[1].toFixed(6)
  emit('coords-change', coords)
}

function cancel() {
  emit('cancel')
}

function confirm() {
  if (!name.value.trim()) return
  if (type.value === 'link' && !targetSceneId.value) return
  const lngNum = Number.parseFloat(lng.value)
  const latNum = Number.parseFloat(lat.value)
  const payload: MarkerPayload = {
    name: name.value.trim(),
    description: description.value.trim(),
    coordinates: [
      Number.isNaN(lngNum) ? props.coordinates[0] : Math.min(180, Math.max(-180, lngNum)),
      Number.isNaN(latNum) ? props.coordinates[1] : Math.min(90, Math.max(-90, latNum)),
    ],
    type: type.value,
    targetSceneId: type.value === 'link' ? targetSceneId.value : undefined,
  }
  emit('confirm', payload)
}

// Esc 关闭 + 简易焦点圈定（Tab 在弹窗内循环；排除 tabindex=-1 的容器自身）
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    // 阻止冒泡，避免 App 的全局 Esc 处理器在弹窗关闭后误退出添加模式
    e.stopPropagation()
    cancel()
    return
  }
  if (e.key !== 'Tab') return
  const focusable = Array.from(
    (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    )
  )
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement
  if (e.shiftKey && active === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}

// 弹窗关闭时若 lastFocused 已被移除（如删除标记），忽略
onBeforeUnmount(() => {
  lastFocused = null
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 12, 22, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  overflow-y: auto;
  padding: 16px;
}

.modal-content {
  background: #1e1e2e;
  border: 1px solid #333;
  border-radius: 14px;
  padding: 24px;
  width: 440px;
  max-width: 92vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  outline: none;
}

.modal-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #eee;
}

.modal-field {
  margin-bottom: 14px;
}

.modal-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #aaa;
}

.modal-label--sub {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.modal-coords {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.modal-input,
.modal-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #3a3a52;
  border-radius: 6px;
  background: #2a2a3e;
  color: #eee;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  resize: vertical;
}

.modal-input:focus,
.modal-textarea:focus {
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

.modal-input::placeholder,
.modal-textarea::placeholder {
  color: #666;
}

.modal-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #777;
  line-height: 1.5;
}

/* 距离滑块 */
.modal-dist {
  margin-top: 10px;
}

.modal-dist-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-dist-head .modal-label--sub {
  margin-bottom: 0;
}

.modal-dist-value {
  font-size: 12px;
  color: #4a9eff;
  font-variant-numeric: tabular-nums;
}

.modal-dist-slider {
  width: 100%;
  margin: 8px 0 0;
  accent-color: #4a9eff;
  cursor: pointer;
}

/* 类型选择卡片 */
.modal-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.modal-type {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1.5px solid #3a3a52;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.modal-type:hover {
  border-color: #4a9eff;
}

.modal-type--active {
  border-color: #4a9eff;
  background: rgba(74, 158, 255, 0.12);
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.15);
}

.modal-type-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.modal-type-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.modal-type-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.modal-type-name {
  font-size: 13px;
  font-weight: 600;
  color: #eee;
}

.modal-type-desc {
  font-size: 11px;
  color: #888;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn-cancel {
  background: #3a3a52;
  color: #ccc;
}

.modal-btn-cancel:hover {
  background: #4a4a62;
}

.modal-btn-confirm {
  background: #4a9eff;
  color: #fff;
}

.modal-btn-confirm:hover:not(:disabled) {
  background: #2f8bf5;
}

.modal-btn-confirm:disabled {
  background: #3a5a8a;
  cursor: not-allowed;
}

/* 过渡动效 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(16px) scale(0.96);
}
</style>
