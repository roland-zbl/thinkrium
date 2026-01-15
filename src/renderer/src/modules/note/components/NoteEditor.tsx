import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bold, Italic, Strikethrough, Code, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NoteEditorProps {
  noteId: string
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ noteId }) => {
  const [note, setNote] = useState<{ title: string; content: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const fetchedNote = await window.api.note.get(noteId)
        setNote({
          title: fetchedNote.title,
          content: fetchedNote.content || ''
        })
      } catch (error) {
        console.error(`Failed to fetch note ${noteId}:`, error)
        // TODO: Handle error state in UI
      }
    }
    fetchNote()
  }, [noteId])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (note) {
      setNote({ ...note, content: e.target.value })
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (note) {
      setNote({ ...note, title: e.target.value })
    }
  }

  const handleSave = async () => {
    if (!note) return
    setIsSaving(true)
    try {
      await window.api.note.update(noteId, { title: note.title, content: note.content })
      // TODO: Add user feedback (e.g., toast notification)
    } catch (error) {
      console.error(`Failed to save note ${noteId}:`, error)
    } finally {
      setIsSaving(false)
    }
  }

  const applyStyle = (style: 'bold' | 'italic' | 'strike' | 'code') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = note?.content.substring(start, end) || ''
    let markdown = ''

    switch (style) {
      case 'bold':
        markdown = `**${selectedText}**`
        break
      case 'italic':
        markdown = `*${selectedText}*`
        break
      case 'strike':
        markdown = `~~${selectedText}~~`
        break
      case 'code':
        markdown = `\`${selectedText}\``
        break
    }

    if (note) {
      const newContent = `${note.content.substring(0, start)}${markdown}${note.content.substring(end)}`
      setNote({ ...note, content: newContent })
    }
  }

  if (note === null) {
    return <div className="p-8">Loading note...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-2 border-b flex items-center justify-between">
        <input
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          className="text-xl font-bold bg-transparent border-none focus:outline-none w-full"
          placeholder="Untitled Note"
        />
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <div className="flex-none p-2 border-b flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => applyStyle('bold')}><Bold className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => applyStyle('italic')}><Italic className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => applyStyle('strike')}><Strikethrough className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => applyStyle('code')}><Code className="h-4 w-4" /></Button>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden p-4">
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={handleContentChange}
          className="w-full h-full p-4 border rounded-md resize-none bg-background focus:outline-none"
          placeholder="Start writing..."
        />
        <div className="prose prose-zinc dark:prose-invert max-w-none overflow-y-auto p-4 border rounded-md">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
