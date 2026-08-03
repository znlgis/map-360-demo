import { ref, computed } from 'vue'
import type { Scene, MarkerData } from '@/types'
import { SCENES, DEFAULT_MARKERS } from '@/data/scenes'

let idCounter = DEFAULT_MARKERS.length + 1

export function useAppState() {
  const scenes = ref<Scene[]>([...SCENES])
  const currentSceneId = ref<string>(SCENES[0].id)
  const markers = ref<MarkerData[]>([...DEFAULT_MARKERS])

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

  return {
    scenes,
    currentSceneId,
    currentScene,
    markers,
    currentMarkers,
    switchScene,
    addMarker,
    removeMarker,
    generateId,
  }
}
