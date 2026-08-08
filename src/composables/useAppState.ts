import { ref, computed, watch } from 'vue'
import type { Scene, MarkerData } from '@/types'
import { SCENES, DEFAULT_MARKERS } from '@/data/scenes'

const STORAGE_KEY = 'map-360-demo:markers:v1'

function isValidMarker(m: unknown): m is MarkerData {
  if (typeof m !== 'object' || m === null) return false
  const o = m as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.sceneId === 'string' &&
    typeof o.name === 'string' &&
    typeof o.description === 'string' &&
    typeof o.createdAt === 'number' &&
    typeof o.position === 'object' && o.position !== null &&
    typeof (o.position as Record<string, unknown>).yaw === 'number' &&
    typeof (o.position as Record<string, unknown>).pitch === 'number' &&
    Array.isArray(o.coordinates) && o.coordinates.length === 2 &&
    o.coordinates.every(c => typeof c === 'number')
  )
}

/** 从 localStorage 恢复标记，失败或数据非法时回退到预设 */
function loadMarkers(): MarkerData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter(isValidMarker)
      }
    }
  } catch {
    // localStorage 不可用或数据损坏时静默回退
  }
  return [...DEFAULT_MARKERS]
}

/** 依据现有标记 id 计算自增起点，避免刷新后 id 冲突 */
function nextIdFrom(markers: MarkerData[]): number {
  let max = 0
  for (const m of markers) {
    const n = Number(m.id.replace(/^m/, ''))
    if (!Number.isNaN(n)) {
      max = Math.max(max, n)
    }
  }
  return max + 1
}

const initialMarkers = loadMarkers()
let idCounter = nextIdFrom(initialMarkers)

export function useAppState() {
  const scenes = ref<Scene[]>([...SCENES])
  const currentSceneId = ref<string>(SCENES[0].id)
  const markers = ref<MarkerData[]>(initialMarkers)

  // 标记变化时持久化（首次不写盘，默认数据仅在首次变更后落盘）
  watch(markers, (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch {
      // 超出配额等异常时静默忽略，不影响使用
    }
  }, { deep: true })

  const currentScene = computed<Scene>(() =>
    scenes.value.find(s => s.id === currentSceneId.value) ?? scenes.value[0]
  )

  const currentMarkers = computed<MarkerData[]>(() =>
    markers.value.filter(m => m.sceneId === currentSceneId.value)
  )

  function generateId(): string {
    return 'm' + (idCounter++)
  }

  function switchScene(id: string): void {
    if (scenes.value.some(s => s.id === id)) {
      currentSceneId.value = id
    }
  }

  function addMarker(data: Omit<MarkerData, 'id' | 'createdAt'>): MarkerData {
    const marker: MarkerData = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    }
    markers.value.push(marker)
    return marker
  }

  function removeMarker(id: string): void {
    const idx = markers.value.findIndex(m => m.id === id)
    if (idx !== -1) {
      markers.value.splice(idx, 1)
    }
  }

  /** 恢复为预设标记，并清空持久化数据 */
  function resetMarkers(): void {
    markers.value = [...DEFAULT_MARKERS].map(m => ({ ...m, createdAt: Date.now() }))
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 忽略清理失败
    }
  }

  return {
    scenes,
    currentSceneId,
    currentScene,
    markers,
    currentMarkers,
    switchScene,
    addMarker,
    removeMarker,
    resetMarkers,
    generateId,
  }
}
