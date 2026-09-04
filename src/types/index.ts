/** 全景适配器类型：等距圆柱 / 立方体贴图 */
export type SceneAdapter = 'equirectangular' | 'cubemap'

/** 立方体贴图的六个面 */
export type CubemapFace = 'left' | 'front' | 'right' | 'back' | 'top' | 'bottom'

/**
 * 全景图数据源：
 * - string：等距圆柱全景图 URL
 * - Record<CubemapFace, string>：立方体贴图（六面独立图片）
 */
export type PanoramaSource = string | Record<CubemapFace, string>

/** 虚拟导览：场景间跳转链接（3D 箭头） */
export interface SceneLink {
  /** 目标场景 id */
  targetSceneId: string
  /** 箭头在全景中的位置 */
  position: { yaw: number; pitch: number }
  /** 箭头悬浮提示文案 */
  name?: string
}

export interface Scene {
  id: string
  name: string
  description: string
  /** 全景数据源（等距圆柱 URL 或立方体六面图） */
  panorama: PanoramaSource
  /** 全景适配器类型，缺省为等距圆柱 */
  adapter?: SceneAdapter
  /** 缩略图（画廊用），缺省回退到全景图 */
  thumbnail?: string
  coordinates: [number, number]
  bearing: string
  defaultZoom: number
  /** 虚拟导览链接（3D 箭头） */
  links?: SceneLink[]
}

/** 可切换的 PSV 功能开关（用于功能展示面板） */
export interface FeatureFlags {
  /** 自动旋转 */
  autorotate: boolean
  /** 罗盘 */
  compass: boolean
  /** 陀螺仪（仅移动设备） */
  gyroscope: boolean
  /** 设置面板 */
  settings: boolean
  /** 缩略图画廊 */
  gallery: boolean
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
