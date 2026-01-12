import { create } from 'zustand';

export type ViewType = 'dashboard' | 'feed' | 'library' | 'project' | 'settings';

export interface Tab {
  id: string;
  type: 'editor' | 'project-page';
  title: string;
  data: {
    noteId?: string;
    projectId?: string;
  };
  isDirty?: boolean;
}

interface AppState {
  // 視圖導航
  currentView: ViewType;
  setView: (view: ViewType) => void;

  // 側邊欄
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;

  // 輔助面板
  auxPanelOpen: boolean;
  auxPanelTab: 'outline' | 'backlinks' | 'ai';
  setAuxPanelOpen: (open: boolean) => void;
  setAuxPanelTab: (tab: 'outline' | 'backlinks' | 'ai') => void;
  toggleAuxPanel: () => void;

  // Tab 系統
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Tab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string | null) => void;

  // 主題系統
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  setView: (view) => set({ currentView: view }),

  sidebarExpanded: false,
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),

  auxPanelOpen: false,
  auxPanelTab: 'outline',
  setAuxPanelOpen: (open) => set({ auxPanelOpen: open }),
  setAuxPanelTab: (tab) => set({ auxPanelTab: tab }),
  toggleAuxPanel: () => set((state) => ({ auxPanelOpen: !state.auxPanelOpen })),

  tabs: [],
  activeTabId: null,
  addTab: (tab) => set((state) => {
    const existing = state.tabs.find((t) => t.id === tab.id);
    if (existing) return { activeTabId: tab.id };
    return {
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
    };
  }),
  closeTab: (tabId) => set((state) => {
    const newTabs = state.tabs.filter((t) => t.id !== tabId);
    let newActiveId = state.activeTabId;
    if (state.activeTabId === tabId) {
      newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
    }
    return {
      tabs: newTabs,
      activeTabId: newActiveId,
    };
  }),
  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  theme: 'system',
  setTheme: (theme) => set({ theme }),
}));
