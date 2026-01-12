import React, { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useFeedStore } from '../store/feed.store';
import { FeedItemCard } from './FeedItemCard';
import { FilterTabs } from './FilterTabs';
import { tokens } from '../../../styles/tokens';

export const FeedItemList: React.FC = () => {
    const { items, activeSubscriptionId, filter, selectedItemId, selectItem } = useFeedStore();
    const parentRef = useRef<HTMLDivElement>(null);

    // 根據訂閱源和狀態過濾列表
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchSub = activeSubscriptionId ? item.source === useFeedStore.getState().subscriptions.find(s => s.id === activeSubscriptionId)?.name : true;
            const matchStatus = filter === 'all' ? true : (filter === 'unread' ? item.status === 'unread' : item.status === 'saved');
            return matchSub && matchStatus;
        });
    }, [items, activeSubscriptionId, filter]);

    const virtualizer = useVirtualizer({
        count: filteredItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 140, // 卡片大約高度 (含 Padding)
        overscan: 5,
    });

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: tokens.colors.bgBase }}>
            <FilterTabs />

            <div
                ref={parentRef}
                className="flex-1 overflow-auto scrollbar-hide relative"
            >
                {filteredItems.length > 0 ? (
                    <div
                        style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {virtualizer.getVirtualItems().map((virtualItem) => {
                            const item = filteredItems[virtualItem.index];
                            return (
                                <div
                                    key={item.id}
                                    data-index={virtualItem.index}
                                    ref={virtualizer.measureElement}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        transform: `translateY(${virtualItem.start}px)`,
                                    }}
                                >
                                    <FeedItemCard
                                        item={item}
                                        isActive={selectedItemId === item.id}
                                        onClick={() => selectItem(item.id)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-white/20 text-sm italic">
                        目前沒有符合條件的項目
                    </div>
                )}
            </div>
        </div>
    );
};
