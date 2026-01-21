import React from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { FilterBar } from '@/modules/library/components/FilterBar'
import { NoteTable } from '@/modules/library/components/NoteTable'
import { NotePreview } from '@/modules/library/components/NotePreview'
import { useLibraryStore } from './store/library.store'
import { useAppStore } from '@/stores/app.store'

export const LibraryView: React.FC = () => {
  const { selectedNoteId, fetchNotes } = useLibraryStore()
  const { currentView } = useAppStore()

  React.useEffect(() => {
    if (currentView === 'library') {
      fetchNotes()
    }
  }, [fetchNotes, currentView])

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-background">
      <div className="flex-none p-4 pb-0">
        <FilterBar />
      </div>

      <div className="flex-1 overflow-hidden p-4 pt-2">
        <Group
          key={selectedNoteId ? 'lib-open' : 'lib-closed'}
          orientation="horizontal"
          className="h-full w-full rounded-lg border border-border overflow-hidden"
        >
          {/* 左側：筆記列表 */}
          <Panel defaultSize={selectedNoteId ? 50 : 100} minSize={30} className="h-full">
            <div className="h-full w-full overflow-hidden">
              <NoteTable />
            </div>
          </Panel>

          {selectedNoteId && (
            <Separator className="w-1 hover:bg-primary/30 transition-colors cursor-col-resize relative z-10 bg-black/5 dark:bg-white/5" />
          )}

          {selectedNoteId && (
            <Panel defaultSize={50} minSize={30} className="h-full">
              <div className="h-full w-full overflow-hidden">
                <NotePreview />
              </div>
            </Panel>
          )}
        </Group>
      </div>
    </div>
  )
}
