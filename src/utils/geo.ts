import type { Scene } from '@/types'

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 解析 '120deg' 形式的方位角为角度数（顺时针自北） */
export function parseBearing(bearing: string): number {
  const n = parseFloat(bearing)
  return Number.isNaN(n) ? 0 : n
}

/** 全景点击位置（yaw）对应的地理方位角（度，顺时针自北） */
export function geoBearingOf(scene: Scene, yaw: number): number {
  return (parseBearing(scene.bearing) + (yaw * 180) / Math.PI + 360) % 360
}

/**
 * 由全景点击位置估算标记经纬度。
 * 方向：场景方位角 + 点击 yaw（与真实地理方向对齐）；
 * 距离：随俯仰角线性变化，仰角越大（仰望）越远、越小（俯视地面）越近。
 */
export function estimateGps(scene: Scene, yaw: number, pitch: number): [number, number] {
  const bearingRad = (geoBearingOf(scene, yaw) * Math.PI) / 180
  // 典型俯仰角范围约 -0.1 ~ 0.32，对应距离约 350m ~ 730m
  const dist = clamp(0.004 + pitch * 0.008, 0.001, 0.01)
  const [lng, lat] = scene.coordinates
  return [
    round6(lng + dist * Math.sin(bearingRad)),
    round6(lat + dist * Math.cos(bearingRad)),
  ]
}

/** 由地图坐标反推全景 yaw（pitch 归零），使 360 标记指向所选方向 */
export function yawFromGps(scene: Scene, coords: [number, number]): number {
  const [lng, lat] = scene.coordinates
  const angleDeg = (Math.atan2(coords[0] - lng, coords[1] - lat) * 180) / Math.PI
  const yawDeg = (angleDeg - parseBearing(scene.bearing) + 360) % 360
  // 归一到 (-π, π]，与 PSV 的 yaw 习惯一致
  const yawRad = (yawDeg * Math.PI) / 180
  return yawRad > Math.PI ? yawRad - 2 * Math.PI : yawRad
}
