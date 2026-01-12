import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { useAppStore } from '../../stores/app.store';
import { useFeedStore } from '../../modules/feed/store/feed.store';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { AuxPanel } from './AuxPanel';
import { TabBar } from './TabBar';
import { ProjectSelectorDialog } from '../../modules/project/components/ProjectSelectorDialog';
import { tokens } from '../../styles/tokens';


export const AppShell: React.FC = () => {
    const { tabs, auxPanelOpen, setView, setActiveTab, theme } = useAppStore();
    const { saveItem } = useFeedStore();
    const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
    const [draggedItemTitle, setDraggedItemTitle] = useState<string | null>(null);
    const [pendingSaveItemId, setPendingSaveItemId] = useState<string | null>(null);

    // Theme Effect
    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);

            // Listener for system changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                const newTheme = mediaQuery.matches ? 'dark' : 'light';
                root.classList.remove('light', 'dark');
                root.classList.add(newTheme);
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            root.classList.add(theme);
            return undefined;
        }
    }, [theme]);

    const showTabBar = tabs.length > 0;

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // 全域快捷鍵：Ctrl+1~4 切換視圖
    useHotkeys('ctrl+1', (e) => {
        e.preventDefault();
        setActiveTab(null);
        setView('dashboard');
    }, { enableOnFormTags: true });

    useHotkeys('ctrl+2', (e) => {
        e.preventDefault();
        setActiveTab(null);
        setView('feed');
    }, { enableOnFormTags: true });

    useHotkeys('ctrl+3', (e) => {
        e.preventDefault();
        setActiveTab(null);
        setView('library');
    }, { enableOnFormTags: true });

    useHotkeys('ctrl+4', (e) => {
        e.preventDefault();
        setActiveTab(null);
        setView('project');
    }, { enableOnFormTags: true });

    // P 鍵開啟專案選擇器
    // 監聽來自 FeedView 的 P 鍵事件 (透過 window dispatch 或 全域 store flag，這裡簡單用全域 hotkey)
    // 但 FeedView 已經有 P 鍵了。我們需要讓 FeedView 呼叫這裡的 open。
    // 我們可以將 setProjectSelectorOpen 暴露給 store 或 context，但這有點麻煩。
    // 簡單解法：AppShell 也監聽 P，但只在特定條件下？
    // 更好解法：在 FeedView 的 P 鍵 handler 中，設置一個 global event 或 store action。
    // 這裡我們假設 FeedView 的 P 鍵暫時只 log，我們待會更新 FeedView 來呼叫這裡的功能。
    // 或者，我們把 ProjectSelectorDialog 放在 AppShell，並暴露控制方法。
    // 暫時：AppShell 處理 DragEnd 的選擇器開啟。FeedView 的 P 鍵我們在 FeedView 裡直接處理 (如果能 render Dialog)。
    // 為了統一，我們讓 ProjectSelectorDialog 只在 AppShell 渲染，並透過自定義事件 'open-project-selector' 觸發。

    React.useEffect(() => {
        const handleOpenSelector = (e: CustomEvent<{ itemId: string }>) => {
            setPendingSaveItemId(e.detail.itemId);
            setProjectSelectorOpen(true);
        };
        window.addEventListener('open-project-selector' as any, handleOpenSelector);
        return () => window.removeEventListener('open-project-selector' as any, handleOpenSelector);
    }, []);

    const handleDragStart = (event: any) => {
        const { active } = event;
        // 假設 active.data.current.title 存在
        if (active.data.current?.title) {
            setDraggedItemTitle(active.data.current.title);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setDraggedItemTitle(null);

        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        // Feed Item -> Project
        if (activeId.startsWith('feed-item-')) {
            const itemId = activeId.replace('feed-item-', '');

            // 拖曳到 Sidebar 的 "Project" 圖標 -> 開啟選擇器
            if (overId === 'nav-project') {
                setPendingSaveItemId(itemId);
                setProjectSelectorOpen(true);
            }
            // 拖曳到具體專案 -> 直接加入
            else if (overId.startsWith('project-')) {
                const projectId = overId.replace('project-', '');
                console.log(`[Drag] Adding item ${itemId} to project ${projectId}`);
                saveItem(itemId); // 先保存
                // TODO: 真正的 "AddToProject" 邏輯 (目前 saveItem 只是變更狀態)
                // 這裡我們模擬加入專案
                alert(`已將文章加入專案: ${projectId} (模擬)`);
            }
        }
    };

    const handleProjectSelect = (projectId: string) => {
        if (pendingSaveItemId) {
            console.log(`[Selector] Adding item ${pendingSaveItemId} to project ${projectId}`);
            saveItem(pendingSaveItemId);
            // TODO: Add to project logic
        }
        setPendingSaveItemId(null);
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div
                className="flex h-screen w-screen overflow-hidden text-sm"
                style={{ backgroundColor: tokens.colors.bgBase, color: tokens.colors.textPrimary }}
            >
                {/* 側邊導航 */}
                <div className="flex-none h-full z-50">
                    <Sidebar />
                </div>

                {/* 主內容區 */}
                <div className="flex-1 flex flex-col min-w-0 h-full relative z-0">
                    {/* Tab Bar (if visible) */}
                    {showTabBar && (
                        <div className="flex-none z-10">
                            <TabBar />
                        </div>
                    )}

                    {/* Content View */}
                    <div className="flex-1 overflow-hidden relative flex flex-col">
                        <MainContent />
                    </div>
                </div>

                {/* 輔助面板 (右側) */}
                {auxPanelOpen && <AuxPanel />}

                {/* 專案選擇器 Modal */}
                <ProjectSelectorDialog
                    isOpen={projectSelectorOpen}
                    onClose={() => setProjectSelectorOpen(false)}
                    onSelect={handleProjectSelect}
                />

                {/* Drag Overlay (Optional visual feedback) */}
                <DragOverlay>
                    {draggedItemTitle ? (
                        <div className="bg-zinc-800 text-white p-3 rounded shadow-xl border border-white/10 opacity-90 w-[300px] truncate pointer-events-none">
                            {draggedItemTitle}
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};
