<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-content">
        <h3 class="modal-title">添加标记</h3>
        <div class="modal-field">
          <label class="modal-label">标记名称</label>
          <input
            ref="nameInput"
            v-model="name"
            class="modal-input"
            placeholder="请输入标记名称"
            @keyup.enter="confirm"
          />
        </div>
        <div class="modal-field">
          <label class="modal-label">描述信息（选填）</label>
          <textarea
            v-model="description"
            class="modal-textarea"
            placeholder="请输入描述信息"
            rows="3"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="$emit('cancel')">取消</button>
          <button class="modal-btn modal-btn-confirm" :disabled="!name.trim()" @click="confirm">确认添加</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  confirm: [name: string, description: string]
  cancel: []
}>()

const name = ref('')
const description = ref('')
const nameInput = ref<HTMLInputElement>()

watch(() => props.visible, (val) => {
  if (val) {
    name.value = ''
    description.value = ''
    nextTick(() => nameInput.value?.focus())
  }
})

function confirm() {
  if (!name.value.trim()) return
  emit('confirm', name.value.trim(), description.value.trim())
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
.modal-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #222;
}
.modal-field {
  margin-bottom: 14px;
}
.modal-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #555;
}
.modal-input,
.modal-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
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
  transition: opacity 0.2s;
}
.modal-btn:hover {
  opacity: 0.85;
}
.modal-btn-cancel {
  background: #eee;
  color: #555;
}
.modal-btn-confirm {
  background: #4a9eff;
  color: #fff;
}
.modal-btn-confirm:disabled {
  background: #a0c4ff;
  cursor: not-allowed;
}
</style>
