import { create } from 'zustand';
import { mockFeedItems, mockSubscriptions } from '../../../mocks';

export interface FeedItem {
  id: string;
  title: string;
  source: string;
  date: string;
  status: 'unread' | 'read' | 'saved';
  summary: string;
  content: string;
}

export interface Subscription {
  id: string;
  name: string;
  category: string;
  unreadCount: number;
}

interface FeedState {
  items: FeedItem[];
  subscriptions: Subscription[];
  selectedItemId: string | null;
  activeSubscriptionId: string | null; // null means 'All'
  filter: 'all' | 'unread' | 'saved';

  // Actions
  setFilter: (filter: 'all' | 'unread' | 'saved') => void;
  selectItem: (id: string | null) => void;
  setActiveSubscription: (id: string | null) => void;
  markAsRead: (id: string) => void;
  saveItem: (id: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  items: mockFeedItems as FeedItem[],
  subscriptions: mockSubscriptions,
  selectedItemId: null,
  activeSubscriptionId: null,
  filter: 'all',

  setFilter: (filter) => set({ filter }),
  selectItem: (id) => set({ selectedItemId: id }),
  setActiveSubscription: (id) => set({ activeSubscriptionId: id, selectedItemId: null }),
  markAsRead: (id) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, status: item.status === 'unread' ? 'read' : item.status } : item
    )
  })),
  saveItem: (id) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, status: 'saved' } : item
    )
  })),
}));
