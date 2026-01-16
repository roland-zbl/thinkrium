export interface Note {
  id: string
  title: string
  file_path?: string
  source_url?: string
  source_type?: 'web' | 'feed' | 'manual' | string
  source_item_id?: string
  content_text?: string
  tags: string[]
  aliases?: string[]
  created_at?: string
  updated_at?: string

  // UI Compatibility fields
  date?: string
  type?: string
  projects?: string[]
  content?: string
}

export interface DbNote {
  id: string
  title: string
  content?: string
  created_at?: string
  date?: string
  source_type?: string
  type?: string
  projects?: string[]
  tags?: string | string[]
}

export interface SaveNoteInput {
  title: string
  content: string
  sourceUrl?: string
  sourceType: 'web' | 'feed' | 'manual'
  sourceItemId?: string
  tags?: string[]
  personalNote?: string
}

export interface NoteFilter {
  limit?: number
  offset?: number
  type?: string
  tags?: string[]
}

export interface NoteUpdate {
  title?: string
  content?: string
  tags?: string[]
}
