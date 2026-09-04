import type { Scene, MarkerData, PsvMarkerConfig, CubemapFace } from '@/types'

export const BASE_URL = 'https://photo-sphere-viewer-data.netlify.app/assets/'

/** 添加标记时预览 pin 的固定标记 id（App 与 PsvContainer 共用） */
export const PREVIEW_ID = '__preview__'

/** 场景跳转标记使用的本地图标 */
export const LINK_ICON = '/icons/link-pin.svg'

/**
 * 立方体贴图六面图。
 * 命名采用 three.js 标准立方体映射：px=+X、nx=-X、py=+Y、ny=-Y、pz=+Z、nz=-Z。
 * PSV 的 cubemap 对象形式按材质顺序 [left,right,top,bottom,back,front] 对应
 * 盒体六个面 [+X,-X,+Y,-Y,+Z,-Z]，因此：left=px、right=nx、top=py、bottom=ny、front=pz、back=nz。
 */
const CUBEMAP_MOUNTAINS: Record<CubemapFace, string> = {
  left: BASE_URL + 'cubemap/px.jpg',
  right: BASE_URL + 'cubemap/nx.jpg',
  top: BASE_URL + 'cubemap/py.jpg',
  bottom: BASE_URL + 'cubemap/ny.jpg',
  front: BASE_URL + 'cubemap/pz.jpg',
  back: BASE_URL + 'cubemap/nz.jpg',
}

export const SCENES: Scene[] = [
  {
    id: 'mercantour',
    name: '默康图尔国家公园',
    description: '法国默康图尔国家公园，位于阿尔卑斯山脉南部',
    panorama: BASE_URL + 'sphere.jpg',
    thumbnail: BASE_URL + 'sphere.jpg',
    coordinates: [6.78677, 44.58241],
    bearing: '120deg',
    defaultZoom: 14,
    links: [
      {
        targetSceneId: 'key-biscayne',
        position: { yaw: 1.2, pitch: 0.1 },
        name: '前往比斯坎湾灯塔',
      },
    ],
  },
  {
    id: 'key-biscayne',
    name: '比斯坎湾灯塔',
    description: '美国佛罗里达州比斯坎湾，开普佛罗里达灯塔',
    panorama: BASE_URL + 'tour/key-biscayne-1.jpg',
    thumbnail: BASE_URL + 'tour/key-biscayne-1.jpg',
    coordinates: [-80.1556, 25.6742],
    bearing: '0deg',
    defaultZoom: 15,
    links: [
      {
        targetSceneId: 'mercantour',
        position: { yaw: 4.5, pitch: 0.1 },
        name: '返回默康图尔国家公园',
      },
      {
        targetSceneId: 'key-biscayne-2',
        position: { yaw: 2.5, pitch: 0.05 },
        name: '前往灯塔花园',
      },
    ],
  },
  {
    id: 'key-biscayne-2',
    name: '灯塔花园',
    description: '比斯坎湾灯塔周边的热带花园，绿意盎然',
    panorama: BASE_URL + 'tour/key-biscayne-2.jpg',
    thumbnail: BASE_URL + 'tour/key-biscayne-2.jpg',
    coordinates: [-80.1541, 25.6731],
    bearing: '90deg',
    defaultZoom: 15,
    links: [
      {
        targetSceneId: 'key-biscayne',
        position: { yaw: 5.5, pitch: 0.05 },
        name: '返回灯塔',
      },
      {
        targetSceneId: 'key-biscayne-3',
        position: { yaw: 2.0, pitch: 0.1 },
        name: '前往海滨栈道',
      },
    ],
  },
  {
    id: 'key-biscayne-3',
    name: '海滨栈道',
    description: '通往海滩的木栈道，可远眺大西洋',
    panorama: BASE_URL + 'tour/key-biscayne-3.jpg',
    thumbnail: BASE_URL + 'tour/key-biscayne-3.jpg',
    coordinates: [-80.1572, 25.6758],
    bearing: '270deg',
    defaultZoom: 15,
    links: [
      {
        targetSceneId: 'key-biscayne-2',
        position: { yaw: 5.0, pitch: 0.05 },
        name: '返回灯塔花园',
      },
    ],
  },
  {
    id: 'cubemap-mountains',
    name: '立方体山脉（Cubemap）',
    description: '使用立方体贴图（六面独立图片）渲染的全景，演示 cubemap 适配器',
    panorama: CUBEMAP_MOUNTAINS,
    adapter: 'cubemap',
    thumbnail: BASE_URL + 'cubemap/pz.jpg',
    coordinates: [7.6586, 45.9763],
    bearing: '0deg',
    defaultZoom: 13,
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
    id: 'm8',
    sceneId: 'key-biscayne-2',
    name: '百年老榕树',
    description: '花园中央的百年榕树，树冠覆盖面积超过 300 平方米。',
    position: { yaw: 1.3, pitch: 0.1 },
    coordinates: [-80.1532, 25.6728],
    createdAt: Date.now(),
    type: 'info',
  },
  {
    id: 'm9',
    sceneId: 'key-biscayne-3',
    name: '观鸟平台',
    description: '栈道尽头的观鸟平台，可观察白鹭与鹈鹕栖息。',
    position: { yaw: 3.2, pitch: 0.05 },
    coordinates: [-80.1579, 25.6761],
    createdAt: Date.now(),
    type: 'info',
  },
  {
    id: 'm10',
    sceneId: 'cubemap-mountains',
    name: '山峰主峰',
    description: '立方体贴图渲染的山脉主峰，验证 cubemap 适配器的六面拼接。',
    position: { yaw: 1.0, pitch: 0.15 },
    coordinates: [7.662, 45.978],
    createdAt: Date.now(),
    type: 'info',
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
