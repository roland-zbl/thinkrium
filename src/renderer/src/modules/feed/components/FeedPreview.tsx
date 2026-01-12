import React, { useState, useEffect } from 'react';
import { Bookmark, Send, ExternalLink, X, FileText, FolderPlus } from 'lucide-react';
import { useFeedStore } from '../store/feed.store';
import { tokens } from '../../../styles/tokens';
import { cn } from '../../../lib/utils';
import { useAppStore } from '../../../stores/app.store';

export const FeedPreview: React.FC = () => {
    const { selectedItemId, items, saveItem, selectItem } = useFeedStore();
    const { addTab } = useAppStore();
    const [quickNote, setQuickNote] = useState('');

    const item = items.find(i => i.id === selectedItemId);

    // 當選擇變更時清空速記
    useEffect(() => {
        setQuickNote('');
    }, [selectedItemId]);

    if (!item) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/40 backdrop-blur">
                <FileText size={64} className="mb-6 opacity-20" />
                <span className="text-base font-medium">選擇一個項目來查看詳細內容</span>
            </div>
        );
    }

    const handleSave = () => {
        if (item.status === 'saved') {
            // 如果已保存，再次點擊則開啟編輯
            addTab({
                id: `edit-${item.id}`,
                type: 'editor',
                title: item.title,
                data: { noteId: undefined },
                isDirty: false
            });
        } else {
            // 如果未保存，僅執行保存，不跳轉
            saveItem(item.id);
        }
    };

    return (
        <div className="h-full flex flex-col relative" style={{ backgroundColor: tokens.colors.bgElevated }}>
            {/* 工具欄 */}
            <div className="h-14 border-b flex items-center justify-between px-6 shrink-0" style={{ borderColor: tokens.colors.bgSubtle }}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => selectItem(null)}
                        className="hover:bg-black/5 dark:hover:bg-white/5 p-1.5 rounded transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest truncate max-w-[200px]">
                        {item.source}
                    </span>
                </div>
                <div className="flex gap-3">
                    <button className="p-2 hover:text-primary text-muted-foreground transition-colors" title="在瀏覽器開啟">
                        <ExternalLink size={20} />
                    </button>
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('open-project-selector', {
                                detail: { itemId: item.id }
                            }));
                        }}
                        className="p-2 hover:text-primary text-muted-foreground transition-colors"
                        title="加入專案 (P)"
                    >
                        <FolderPlus size={20} />
                    </button>
                    <button
                        onClick={handleSave}
                        className={cn(
                            "flex items-center gap-2 text-xs px-3 py-1.5 rounded transition-colors font-bold",
                            item.status === 'saved'
                                ? "bg-black/5 dark:bg-white/10 text-foreground/80 hover:bg-black/10 dark:hover:bg-white/20"
                                : "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
                        )}
                    >
                        <Bookmark size={16} fill={item.status === 'saved' ? "currentColor" : "none"} />
                        {item.status === 'saved' ? '編輯筆記' : '保存為筆記'}
                    </button>
                </div>
            </div>

            {/* 內文區 */}
            <div className="flex-1 overflow-auto p-8 scrollbar-hide">
                <h2 className="text-3xl font-bold mb-8 leading-snug text-foreground">{item.title}</h2>
                <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                    <p className="text-foreground/90 leading-loose whitespace-pre-wrap whitespace-pre-line text-lg/loose font-serif-cn">
                        {/* 這裡模擬文章內容，使用 font-serif-cn (若有自定義) 或預設 sans，重點是 text-lg 和 leading-loose */}
                        {item.content}
                    </p>
                </div>
            </div>

            {/* 速記區 (Quick Note) */}
            <div className="p-4 border-t bg-muted/40 backdrop-blur" style={{ borderColor: tokens.colors.bgSubtle }}>
                <div className="flex flex-col gap-3 relative">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">速記 (Quick Note)</span>
                        <span className="text-xs text-muted-foreground">{quickNote.length} 字</span>
                    </div>
                    <textarea
                        value={quickNote}
                        onChange={(e) => setQuickNote(e.target.value)}
                        placeholder="紀錄您的靈感或重點摘要..."
                        className="w-full h-28 bg-black/5 dark:bg-white/5 border border-border rounded-xl p-4 text-base focus:outline-none focus:border-primary/50 transition-colors resize-none no-scrollbar placeholder:text-muted-foreground/60 text-foreground"
                    />
                    <button
                        disabled={!quickNote.trim()}
                        className={cn(
                            "absolute bottom-3 right-3 p-2 rounded transition-all",
                            quickNote.trim() ? "text-primary hover:bg-primary/10" : "text-muted-foreground opacity-50"
                        )}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
