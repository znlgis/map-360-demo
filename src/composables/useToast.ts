import { ref } from 'vue'

export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

// 模块级单例：所有调用方共享同一份 toast 列表
const toasts = ref<ToastItem[]>([])
let toastSeq = 0
/** 记录自动关闭定时器，dismiss 时一并清理 */
const timers = new Map<number, ReturnType<typeof setTimeout>>()

export function useToast() {
  function show(message: string, type: ToastItem['type'] = 'info', duration = 2800): void {
    const id = ++toastSeq
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      const timer = setTimeout(() => dismiss(id), duration)
      timers.set(id, timer)
    }
  }

  function dismiss(id: number): void {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      toasts.value.splice(idx, 1)
    }
  }

  return { toasts, show, dismiss }
}
