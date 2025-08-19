import React, { useEffect, useState } from 'react';
import { Note } from '../../types';
import { useNotesStore } from '../stores/useNotesStore';
import { useUIStore } from '../stores/useUIStore';
import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';

const NotesPage: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { notes, loadNotes, createNote, currentNote, setCurrentNote } = useNotesStore();
  const { sidebarCollapsed } = useUIStore();

  // 加载笔记
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // 选择笔记
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setCurrentNote(note);
  };

  // 创建新笔记
  const handleCreateNote = async () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      tags: [],
      folderId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    };

    await createNote(newNote);
    setSelectedNote(newNote);
    setCurrentNote(newNote);
  };

  // 保存笔记
  const handleSaveNote = (note: Note) => {
    setSelectedNote(note);
    setCurrentNote(note);
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* 笔记列表 */}
      {!sidebarCollapsed && (
        <NoteList
          selectedNoteId={selectedNote?.id}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
        />
      )}

      {/* 笔记编辑器 */}
      <NoteEditor
        note={selectedNote}
        onSave={handleSaveNote}
      />
    </div>
  );
};

export default NotesPage;