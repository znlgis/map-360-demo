<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite" aria-atomic="false">
      <!-- TransitionGroup 默认渲染 span，需显式指定 tag 才能正确应用 flex 布局 -->
      <TransitionGroup name="toast" tag="div" class="toast-stack">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="alert"
          @click="dismiss(toast.id)"
        >
          <span class="toast-icon" aria-hidden="true">{{ iconOf(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import type { ToastItem } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

function iconOf(type: ToastItem['type']): string {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    default:
      return 'ℹ'
  }
}
</script>

<style scoped>
.toast-host {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 20000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

.toast-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  color: #fff;
  background: rgba(28, 30, 48, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  cursor: pointer;
  pointer-events: auto;
  max-width: 80vw;
}

.toast-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.toast--success .toast-icon {
  color: #4ade80;
}

.toast--error .toast-icon {
  color: #f87171;
}

.toast--info .toast-icon {
  color: #60a5fa;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px) scale(0.96);
}
</style>
