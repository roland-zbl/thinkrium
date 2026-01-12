import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { SubscriptionSidebar } from './components/SubscriptionSidebar';
import { FeedItemList } from './components/FeedItemList';
import { FeedPreview } from './components/FeedPreview';
import { useFeedStore } from './store/feed.store';
import { useAppStore } from '../../stores/app.store';

export const FeedView: React.FC = () => {
    const { selectedItemId, items, selectItem, saveItem } = useFeedStore();
    const { addTab } = useAppStore();

    // 獲取當前選中的項目
    const selectedItem = items.find(i => i.id === selectedItemId);

    // J 鍵：選擇下一個項目
    useHotkeys('j', () => {
        const currentIndex = items.findIndex(i => i.id === selectedItemId);
        if (currentIndex < items.length - 1) {
            selectItem(items[currentIndex + 1].id);
        }
    }, { preventDefault: true });

    // K 鍵：選擇上一個項目
    useHotkeys('k', () => {
        const currentIndex = items.findIndex(i => i.id === selectedItemId);
        if (currentIndex > 0) {
            selectItem(items[currentIndex - 1].id);
        }
    }, { preventDefault: true });

    // S 鍵：保存為筆記
    useHotkeys('s', () => {
        if (selectedItemId) saveItem(selectedItemId);
    }, { enableOnFormTags: false });

    // E 鍵：保存並編輯
    useHotkeys('e', () => {
        if (selectedItemId && selectedItem) {
            saveItem(selectedItemId);
            addTab({
                id: `edit-${selectedItemId}`,
                type: 'editor',
                title: selectedItem.title,
                data: { noteId: undefined }, // 修正：應確保後續邏輯處理 undefined noteId
                isDirty: false
            });
        }
    }, { enableOnFormTags: false });

    // P 鍵：加入專案
    useHotkeys('p', () => {
        if (selectedItemId) {
            window.dispatchEvent(new CustomEvent('open-project-selector', {
                detail: { itemId: selectedItemId }
            }));
        }
    }, { enableOnFormTags: false });

    // Space 鍵：切換預覽（選中/取消選中）
    useHotkeys('space', (e) => {
        e.preventDefault();
        if (selectedItemId) {
            selectItem(null); // 取消選中，關閉預覽
        }
    }, { preventDefault: true, enableOnFormTags: false });

    // ESC 鍵：關閉預覽
    useHotkeys('esc', () => {
        selectItem(null);
    });

    return (
        <div className="h-full w-full overflow-hidden flex flex-col bg-background">
            <Group
                key={selectedItemId ? "feed-open" : "feed-closed"}
                orientation="horizontal"
                className="flex-1"
                style={{ height: '100%' }}
                id="feed-layout-group"
            >
                {/* 第一欄：訂閱側邊欄 */}
                <Panel defaultSize={selectedItemId ? 20 : 25} minSize={15} className="h-full bg-muted/40 backdrop-blur">
                    <div className="h-full w-full overflow-hidden">
                        <SubscriptionSidebar />
                    </div>
                </Panel>

                <Separator
                    className="w-1 hover:bg-primary/30 transition-colors cursor-col-resize relative z-10 bg-black/5 dark:bg-white/5"
                />

                {/* 第二欄：項目列表 */}
                <Panel defaultSize={selectedItemId ? 30 : 75} minSize={30} className="h-full">
                    <div className="h-full w-full overflow-hidden">
                        <FeedItemList />
                    </div>
                </Panel>

                {selectedItemId && (
                    <Separator
                        className="w-1 hover:bg-primary/30 transition-colors cursor-col-resize relative z-10 bg-black/5 dark:bg-white/5"
                    />
                )}

                {selectedItemId && (
                    <Panel
                        defaultSize={50}
                        minSize={30}
                        className="h-full"
                    >
                        <div className="h-full w-full overflow-hidden">
                            <FeedPreview />
                        </div>
                    </Panel>
                )}
            </Group>
        </div>
    );
};
