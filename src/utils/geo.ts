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

/** 每度纬度对应的地面距离（米），地球椭球近似 */
const M_PER_DEG_LAT = 110574

/** 每度经度对应的地面距离（米），随纬度收缩（乘 cos(纬度)） */
function mPerDegLng(lat: number): number {
  return 111320 * Math.cos((lat * Math.PI) / 180)
}

/**
 * 全景点击位置（yaw）对应的地理方位角（度，顺时针自北）。
 * 与 PlanPlugin 的镜头指向公式一致：真实方位角 = 场景 bearing + yaw。
 */
export function geoBearingOf(scene: Scene, yaw: number): number {
  return (parseBearing(scene.bearing) + (yaw * 180) / Math.PI + 360) % 360
}

/**
 * 由全景点击位置估算标记经纬度。
 * 方向：场景方位角 + 点击 yaw（与 PlanPlugin 视锥方向一致）；
 * 距离：随俯仰角线性变化，仰角越大（仰望）越远、越小（俯视地面）越近。
 *
 * 关键：经度/纬度每度对应的地面距离不同（相差 cos(纬度) 因子），
 * 必须先在"米"空间按方位角分解，再换算回度数；
 * 否则标记落在地图上的实际方向会偏转（中纬度地区可达 10° 左右）。
 */
export function estimateGps(scene: Scene, yaw: number, pitch: number): [number, number] {
  const bearingRad = (geoBearingOf(scene, yaw) * Math.PI) / 180
  // 典型俯仰角范围约 -0.1 ~ 0.32，对应距离约 370m ~ 710m
  const distM = clamp(450 + pitch * 800, 120, 1100)
  const [lng, lat] = scene.coordinates
  return [
    round6(lng + (distM * Math.sin(bearingRad)) / mPerDegLng(lat)),
    round6(lat + (distM * Math.cos(bearingRad)) / M_PER_DEG_LAT),
  ]
}

/**
 * 由地图坐标反推全景 yaw，使 360 标记指向所选的真实地面方向。
 * 经纬度差先换算为米，求真实方位角后再扣除场景 bearing。
 */
export function yawFromGps(scene: Scene, coords: [number, number]): number {
  const [lng, lat] = scene.coordinates
  const east = (coords[0] - lng) * mPerDegLng(lat)
  const north = (coords[1] - lat) * M_PER_DEG_LAT
  const angleDeg = (Math.atan2(east, north) * 180) / Math.PI
  const yawDeg = (angleDeg - parseBearing(scene.bearing) + 360) % 360
  // 归一到 (-π, π]，与 PSV 的 yaw 习惯一致
  const yawRad = (yawDeg * Math.PI) / 180
  return yawRad > Math.PI ? yawRad - 2 * Math.PI : yawRad
}
