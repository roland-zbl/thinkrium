export interface Note {
  id: string
  title: string
  file_path: string
  source_url?: string
  source_type: 'web' | 'feed' | 'manual'
  source_item_id?: string
  content_text: string
  tags: string[]
  aliases: string[]
  created_at: string
  updated_at: string
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
