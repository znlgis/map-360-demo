import type { Scene, MarkerData, PsvMarkerConfig } from '@/types'

export const BASE_URL = 'https://photo-sphere-viewer-data.netlify.app/assets/'

/** 添加标记时预览 pin 的固定标记 id（App 与 PsvContainer 共用） */
export const PREVIEW_ID = '__preview__'

/** 场景跳转标记使用的本地图标 */
export const LINK_ICON = '/icons/link-pin.svg'

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
    coordinates: [6.79405, 44.578734],
    createdAt: Date.now(),
    type: 'info',
  },
  {
    id: 'm2',
    sceneId: 'mercantour',
    name: '徒步路线起点',
    description: '由此出发，全程约8公里，预计耗时4小时，沿途有路标指引。',
    position: { yaw: 3.00, pitch: 0.15 },
    coordinates: [6.780099, 44.584332],
    createdAt: Date.now(),
    type: 'info',
  },
  {
    id: 'm3',
    sceneId: 'mercantour',
    name: '高山湖泊',
    description: '冰川融化形成的天然湖泊，水质清澈见底，夏季水温约12°C。',
    position: { yaw: 0.22, pitch: -0.1 },
    coordinates: [6.790205, 44.580145],
    createdAt: Date.now(),
    type: 'info',
  },
  {
    id: 'm4',
    sceneId: 'key-biscayne',
    name: '灯塔入口',
    description: '开普佛罗里达灯塔始建于1825年，是佛罗里达州最古老的建筑之一。',
    position: { yaw: 2.48, pitch: 0.1 },
    coordinates: [-80.152355, 25.670418],
    createdAt: Date.now(),
    type: 'info',
  },
  {
    id: 'm5',
    sceneId: 'key-biscayne',
    name: '海滩观景台',
    description: '此处可观赏大西洋日出，每年11月至次年4月为最佳观鸟季节。',
    position: { yaw: 5.35, pitch: 0.05 },
    coordinates: [-80.159524, 25.676838],
    createdAt: Date.now(),
    type: 'info',
  },
  {
    id: 'm6',
    sceneId: 'mercantour',
    name: '前往比斯坎湾灯塔',
    description: '点击跳转到比斯坎湾灯塔场景，探索佛罗里达海岸风光。',
    position: { yaw: 4.5, pitch: 0.1 },
    coordinates: [6.788817, 44.586973],
    createdAt: Date.now(),
    type: 'link',
    targetSceneId: 'key-biscayne',
  },
  {
    id: 'm7',
    sceneId: 'key-biscayne',
    name: '返回默康图尔国家公园',
    description: '点击跳转回默康图尔国家公园，继续阿尔卑斯山之旅。',
    position: { yaw: 1.2, pitch: 0.15 },
    coordinates: [-80.150305, 25.676068],
    createdAt: Date.now(),
    type: 'link',
    targetSceneId: 'mercantour',
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
  const isLink = m.type === 'link'
  const safeName = escapeHtml(m.name)
  const safeDesc = escapeHtml(m.description)
  const tooltip = isLink ? `${safeName}（跳转）` : safeName
  return {
    id: m.id,
    tooltip,
    content: `<div class="psv-marker-content"><h3>${safeName}</h3><p>${safeDesc}</p></div>`,
    position: m.position,
    // 跳转标记使用本地绿色箭头图标，信息标记使用蓝色 pin
    image: isLink ? LINK_ICON : BASE_URL + 'pictos/pin-blue.png',
    size: { width: 32, height: 32 },
    anchor: 'bottom center',
    className: isLink ? 'psv-marker--link' : '',
    data: {
      plan: {
        coordinates: m.coordinates,
        size: 28,
        image: isLink ? LINK_ICON : BASE_URL + 'pictos/pin-blue.png',
      },
    },
  }
}
