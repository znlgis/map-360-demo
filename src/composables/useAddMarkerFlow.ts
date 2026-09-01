import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { MarkerData, MarkerPayload, Scene } from '@/types'
import { PREVIEW_ID } from '@/data/scenes'
import { estimateGps, yawFromGps, distanceMeters } from '@/utils/geo'

interface UseAddMarkerFlowOptions {
  currentScene: ComputedRef<Scene>
  currentMarkers: ComputedRef<MarkerData[]>
  onAdd: (payload: Omit<MarkerData, 'id' | 'createdAt'>) => void
  onUpdate: (id: string, payload: Partial<Omit<MarkerData, 'id' | 'createdAt'>>) => void
}

/**
 * 添加/编辑标记的完整状态机：
 * - 显式进入添加模式，点击全景或地图选点
 * - 预览 pin（红色脉冲）在确认前实时同步
 * - 弹窗取消后保留预览，可重新选点
 * - 编辑模式复用同一套流程，区分 pendingId
 */
export function useAddMarkerFlow(options: UseAddMarkerFlowOptions) {
  const { currentScene, currentMarkers, onAdd, onUpdate } = options

  const adding = ref(false)
  /** 弹窗是否打开（添加或编辑共用） */
  const showModal = ref(false)
  /** 编辑中的标记 id，为空表示新增 */
  const editingId = ref<string | null>(null)
  const pendingPosition = ref<{ yaw: number; pitch: number } | null>(null)
  const pendingCoords = ref<[number, number] | null>(null)

  /** 弹窗显示的坐标（优先选点，其次编辑中标记原坐标，兜底场景中心） */
  const modalCoords = computed<[number, number]>(() =>
    pendingCoords.value ?? editingMarker.value?.coordinates ?? currentScene.value.coordinates
  )

  /** 正在编辑的标记对象 */
  const editingMarker = computed<MarkerData | null>(() =>
    editingId.value
      ? currentMarkers.value.find(x => x.id === editingId.value) ?? null
      : null
  )

  /**
   * 待确认标记的预览 pin（红色脉冲），确认前同步显示在全景与地图上。
   * 编辑模式：仅当位置与原有标记不同（重新选点）时才显示，避免与蓝 pin 重叠。
   */
  const previewMarker = computed<MarkerData | null>(() => {
    if (!pendingPosition.value || !pendingCoords.value) return null
    const ed = editingMarker.value
    if (
      ed &&
      ed.position.yaw === pendingPosition.value.yaw &&
      ed.position.pitch === pendingPosition.value.pitch &&
      ed.coordinates[0] === pendingCoords.value[0] &&
      ed.coordinates[1] === pendingCoords.value[1]
    ) {
      return null
    }
    return {
      id: PREVIEW_ID,
      sceneId: currentScene.value.id,
      name: '',
      description: '',
      position: pendingPosition.value,
      coordinates: pendingCoords.value,
      createdAt: 0,
    }
  })

  function startAddMarker() {
    if (adding.value) return
    adding.value = true
    editingId.value = null
    pendingPosition.value = null
    pendingCoords.value = null
  }

  function openEdit(marker: MarkerData) {
    adding.value = true
    editingId.value = marker.id
    pendingPosition.value = { ...marker.position }
    pendingCoords.value = [...marker.coordinates] as [number, number]
    showModal.value = true
  }

  /** 完全退出添加/编辑模式并清理预览 */
  function exitAdding() {
    adding.value = false
    editingId.value = null
    pendingPosition.value = null
    pendingCoords.value = null
    showModal.value = false
  }

  function onClickEmpty(position: { yaw: number; pitch: number }) {
    if (!adding.value) return
    pendingPosition.value = position
    // 按场景方位角估算经纬度，方向与点击方位一致
    pendingCoords.value = estimateGps(currentScene.value, position.yaw, position.pitch)
    showModal.value = true
  }

  function onMapPick(coords: [number, number]) {
    if (!adding.value) return
    pendingCoords.value = coords
    // 反推 yaw，使 360 预览 pin 朝向地图所选方向
    const yaw = yawFromGps(currentScene.value, coords)
    pendingPosition.value = pendingPosition.value
      ? { ...pendingPosition.value, yaw }
      : { yaw, pitch: 0 }
    showModal.value = true
  }

  /** 弹窗取消：保留预览和添加模式，便于重新选点 */
  function onModalCancel() {
    showModal.value = false
  }

  /**
   * 弹窗内坐标被修改（如距离滑块拖动）时实时同步预览。
   * 滑块沿固定方位角移动，方向不变，故 yaw 无需重算；
   * 但距离变化需按 dist = 450 + pitch*800 逆式回推 pitch，
   * 否则预览 pin 纵向位置不随滑块移动，确认后与地图距离脱节。
   */
  function onModalCoordsChange(coords: [number, number]) {
    if (!pendingPosition.value) return
    pendingCoords.value = coords
    // 钳制到 estimateGps 的模型范围 [120, 1100]，保证逆式与正向模型一致
    const distM = Math.min(1100, Math.max(120, distanceMeters(currentScene.value.coordinates, coords)))
    pendingPosition.value = { ...pendingPosition.value, pitch: (distM - 450) / 800 }
  }

  function onModalConfirm(payload: MarkerPayload) {
    if (!pendingPosition.value) return
    // 手动修改过坐标时，重新反推 yaw，保持 360 视图方向与地图一致
    const coordsEdited =
      !pendingCoords.value ||
      payload.coordinates[0] !== pendingCoords.value[0] ||
      payload.coordinates[1] !== pendingCoords.value[1]
    const position = coordsEdited
      ? {
          yaw: yawFromGps(currentScene.value, payload.coordinates),
          pitch: pendingPosition.value.pitch,
        }
      : pendingPosition.value
    const base = {
      name: payload.name,
      description: payload.description,
      coordinates: payload.coordinates,
      type: payload.type,
      targetSceneId: payload.targetSceneId,
      position,
    }
    if (editingId.value) {
      onUpdate(editingId.value, base)
    } else {
      onAdd({ sceneId: currentScene.value.id, ...base })
    }
    exitAdding()
  }

  return {
    adding,
    showModal,
    editingId,
    editingMarker,
    modalCoords,
    previewMarker,
    startAddMarker,
    openEdit,
    exitAdding,
    onClickEmpty,
    onMapPick,
    onModalCancel,
    onModalCoordsChange,
    onModalConfirm,
  }
}
