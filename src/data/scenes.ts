import type { Scene, MarkerData, PsvMarkerConfig } from '../types'

export const BASE_URL = 'https://photo-sphere-viewer-data.netlify.app/assets/'

export const SCENES: Scene[] = [
  {
    id: 'mercantour',
    name: '默康图尔国家公园',
    description: '法国默康图尔国家公园，位于阿尔卑斯山脉南部',
    panorama: BASE_URL + 'sphere.jpg',
    coordinates: [6.78677, 44.58241],
    bearing: '120deg',
    defaultZoom: 14,
  },
  {
    id: 'key-biscayne',
    name: '比斯坎湾灯塔',
    description: '美国佛罗里达州比斯坎湾，开普佛罗里达灯塔',
    panorama: BASE_URL + 'tour/key-biscayne-1.jpg',
    coordinates: [-80.1556, 25.6742],
    bearing: '0deg',
    defaultZoom: 15,
  },
]

export const DEFAULT_MARKERS: MarkerData[] = [
  {
    id: 'm1',
    sceneId: 'mercantour',
    name: '山顶观测点',
    description: '此处海拔2350米，可远眺阿尔卑斯山脉主峰，视野极为开阔。',
    position: { yaw: 0.09, pitch: 0.32 },
    coordinates: [6.79077, 44.58041],
    createdAt: Date.now(),
  },
  {
    id: 'm2',
    sceneId: 'mercantour',
    name: '徒步路线起点',
    description: '由此出发，全程约8公里，预计耗时4小时，沿途有路标指引。',
    position: { yaw: 3.00, pitch: 0.15 },
    coordinates: [6.783, 44.5835],
    createdAt: Date.now(),
  },
  {
    id: 'm3',
    sceneId: 'mercantour',
    name: '高山湖泊',
    description: '冰川融化形成的天然湖泊，水质清澈见底，夏季水温约12°C。',
    position: { yaw: 0.22, pitch: -0.1 },
    coordinates: [6.792, 44.579],
    createdAt: Date.now(),
  },
  {
    id: 'm4',
    sceneId: 'key-biscayne',
    name: '灯塔入口',
    description: '开普佛罗里达灯塔始建于1825年，是佛罗里达州最古老的建筑之一。',
    position: { yaw: 2.48, pitch: 0.1 },
    coordinates: [-80.155, 25.6735],
    createdAt: Date.now(),
  },
  {
    id: 'm5',
    sceneId: 'key-biscayne',
    name: '海滩观景台',
    description: '此处可观赏大西洋日出，每年11月至次年4月为最佳观鸟季节。',
    position: { yaw: 5.35, pitch: 0.05 },
    coordinates: [-80.1565, 25.6748],
    createdAt: Date.now(),
  },
]

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/** 将 MarkerData 转换为 PSV markers-plugin 可用的配置 */
export function toPsvMarkerConfig(m: MarkerData): PsvMarkerConfig {
  const safeName = escapeHtml(m.name)
  const safeDesc = escapeHtml(m.description)
  return {
    id: m.id,
    tooltip: m.name,
    content: `<div class="psv-marker-content"><h3>${safeName}</h3><p>${safeDesc}</p></div>`,
    position: m.position,
    image: BASE_URL + 'pictos/pin-blue.png',
    size: { width: 32, height: 32 },
    anchor: 'bottom center',
    data: {
      plan: {
        coordinates: m.coordinates,
        size: 25,
        image: BASE_URL + 'pictos/pin-blue.png',
      },
    },
  }
}
