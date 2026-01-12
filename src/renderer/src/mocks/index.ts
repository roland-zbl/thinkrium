// src/renderer/src/mocks/index.ts

export const mockSubscriptions = [
  { id: 'sub-1', name: 'GameLook', category: '遊戲媒體', unreadCount: 5 },
  { id: 'sub-2', name: '觸樂', category: '遊戲媒體', unreadCount: 12 },
  { id: 'sub-3', name: 'GMTK', category: '開發者', unreadCount: 0 }
]

export const mockFeedItems = [
  {
    id: 'item-1',
    title: 'AI 遊戲開發的回顧與展望',
    source: 'GameLook',
    date: '5分鐘前',
    status: 'unread',
    summary: '這篇文章討論了 2025 年 AI 在遊戲開發中的實際應用案例...',
    content:
      '完整內容：這篇文章詳細討論了 AI 在程序化生成、NPC 對話以及美術自動化生產中的突破。儘管目前仍有技術邊度，但 Larian 等大廠已經開始嘗試...'
  },
  {
    id: 'item-2',
    title: 'Larian 公開下一款遊戲方向',
    source: '觸樂',
    date: '1小時前',
    status: 'read',
    summary: 'Swen 在訪談中表示，下一款遊戲將會比柏德之門3更具野心...',
    content:
      'Swen Vincke 表示：我們不想重複自己。柏德之門3 是個巔峰，但我們已經在嘗試新的敘事機制。這次的重點會放在「動態後果」系統上。'
  }
]

export const mockProjects = [
  {
    id: 'proj-1',
    title: 'vol.40',
    status: 'active',
    targetDate: '2026-01-12',
    materialCount: 5,
    deliverableCount: 0,
    notes: '這週主要想談 Larian 和任天堂的策略對比。'
  },
  {
    id: 'proj-2',
    title: '星鐵分析',
    status: 'active',
    targetDate: null,
    materialCount: 12,
    deliverableCount: 0,
    notes: '分析 2.0 版本後的數據增長趨勢。'
  },
  {
    id: 'proj-3',
    title: '追蹤Larian',
    status: 'pending',
    targetDate: null,
    materialCount: 5,
    deliverableCount: 0,
    notes: ''
  },
  {
    id: 'proj-4',
    title: 'vol.39',
    status: 'completed',
    targetDate: '2026-01-05',
    materialCount: 8,
    deliverableCount: 1,
    notes: '已發布。'
  }
]

export const mockNotes = [
  { id: 'note-1', title: '2026-01-09', date: '2026-01-09', type: 'daily', projects: [], tags: [] },
  {
    id: 'note-2',
    title: 'Larian公開下一款遊戲方向',
    date: '2026-01-06',
    type: 'note',
    projects: ['vol.40'],
    tags: ['遊戲', 'AI']
  },
  {
    id: 'note-3',
    title: '任天堂Q3財報',
    date: '2026-01-05',
    type: 'note',
    projects: ['vol.40'],
    tags: ['遊戲']
  }
]
