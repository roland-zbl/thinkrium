import React from 'react';
import { useAppStore } from '../../stores/app.store';
import { cn } from '../../lib/utils';
import { DashboardView } from '../../modules/dashboard/DashboardView';
import { FeedView } from '../../modules/feed/FeedView';
import { LibraryView } from '../../modules/library/LibraryView';
import { ProjectListView } from '../../modules/project/ProjectListView';
import { ProjectPageView } from '../../modules/project/ProjectPageView';

// 預留模塊視圖
const EditorPlaceholder = ({ id }: { id: string }) => <div className="p-8 text-2xl">正在編輯筆記: {id}</div>;

export const MainContent: React.FC = () => {
    const { currentView, activeTabId, tabs } = useAppStore();

    const isTabView = activeTabId !== null;

    return (
        <main className="flex-1 relative overflow-hidden bg-background">
            {/* 導航視圖：使用 display: none 保持狀態 */}
            <div className={cn("absolute inset-0", (isTabView || currentView !== 'dashboard') && "hidden")}>
                <DashboardView />
            </div>
            <div className={cn("absolute inset-0", (isTabView || currentView !== 'feed') && "hidden")}>
                <FeedView />
            </div>
            <div className={cn("absolute inset-0", (isTabView || currentView !== 'library') && "hidden")}>
                <LibraryView />
            </div>
            <div className={cn("absolute inset-0", (isTabView || currentView !== 'project') && "hidden")}>
                <ProjectListView />
            </div>

            {/* Tab 視圖 */}
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    className={cn("absolute inset-0 bg-background", activeTabId !== tab.id && "hidden")}
                >
                    {tab.type === 'editor' ? (
                        <EditorPlaceholder id={tab.data.noteId || tab.id} />
                    ) : (
                        <ProjectPageView id={tab.data.projectId || tab.id} />
                    )}
                </div>
            ))}
        </main>
    );
};
