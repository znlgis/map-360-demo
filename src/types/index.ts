export interface Scene {
  id: string
  name: string
  description: string
  panorama: string
  coordinates: [number, number]
  bearing: string
  defaultZoom: number
}

/** 标记类型：info 普通信息标记；link 场景跳转标记 */
export type MarkerType = 'info' | 'link'

export interface MarkerData {
  id: string
  sceneId: string
  name: string
  description: string
  position: { yaw: number; pitch: number }
  coordinates: [number, number]
  createdAt: number
  /** 标记类型，旧数据缺省视为 info */
  type?: MarkerType
  /** type='link' 时的目标场景 */
  targetSceneId?: string
}

/** 弹窗确认后携带的表单数据（不含 position，位置由选点决定） */
export interface MarkerPayload {
  name: string
  description: string
  coordinates: [number, number]
  type: MarkerType
  targetSceneId?: string
}

/** PSV markers-plugin 使用的配置格式（含 data.plan 联动字段） */
export interface PsvMarkerConfig {
  id: string
  tooltip: string
  content: string
  position: { yaw: number; pitch: number }
  image: string
  size: { width: number; height: number }
  anchor: string
  /** 附加到 marker 容器的 CSS 类 */
  className?: string
  data: {
    plan: {
      coordinates: [number, number]
      size: number
      image: string
    }
  }
}
