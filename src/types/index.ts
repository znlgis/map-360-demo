export interface Scene {
  id: string
  name: string
  description: string
  panorama: string
  coordinates: [number, number]
  bearing: string
  defaultZoom: number
}

export interface MarkerData {
  id: string
  sceneId: string
  name: string
  description: string
  position: { yaw: number; pitch: number }
  coordinates: [number, number]
  createdAt: number
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
  data: {
    plan: {
      coordinates: [number, number]
      size: number
      image: string
    }
  }
}
