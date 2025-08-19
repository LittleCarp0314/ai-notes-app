import { create } from 'zustand';
import { Note } from '../../types';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  searchQuery: string;
  isLoading: boolean;
  error?: string;
}

interface NotesActions {
  // 数据加载
  loadNotes: () => Promise<void>;
  
  // CRUD操作
  createNote: (note: Note) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // 状态管理
  setCurrentNote: (note: Note | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  
  // 工具方法
  getNoteById: (id: string) => Note | undefined;
}

type NotesStore = NotesState & NotesActions;

export const useNotesStore = create<NotesStore>((set, get) => ({
  // 初始状态
  notes: [],
  currentNote: null,
  searchQuery: '',
  isLoading: false,
  error: undefined,

  // 加载笔记列表
  loadNotes: async () => {
    try {
      set({ isLoading: true, error: undefined });
      
      if (window.electronAPI) {
        const response = await window.electronAPI.notes.list();
        if (response.success) {
          set({ notes: response.data, isLoading: false });
        } else {
          throw new Error(response.error || 'Failed to load notes');
        }
      } else {
        // 开发环境下的模拟数据
        const mockNotes: Note[] = [
          {
            id: '1',
            title: 'Welcome to AI Notes',
            content: '# Welcome to AI Notes\n\nThis is your first note. You can edit it by clicking here.\n\n## Features\n- **Rich text editing** with Monaco Editor\n- **AI assistance** for content generation\n- **Full-text search** across all notes\n- **Folder organization** for better structure\n- **Tag system** for flexible categorization\n\nStart typing to see the magic happen!',
            tags: ['welcome', 'getting-started'],
            folderId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isFavorite: true,
          },
          {
            id: '2',
            title: 'Getting Started Guide',
            content: '# Getting Started with AI Notes\n\n## Creating Notes\n1. Click the **+** button in the sidebar\n2. Start typing your content\n3. Notes are automatically saved\n\n## Organizing Notes\n- Use **folders** to group related notes\n- Add **tags** for flexible categorization\n- Mark important notes as **favorites**\n\n## AI Features\n- Get content suggestions\n- Generate summaries\n- Improve writing style\n\n## Search\n- Use the search box to find notes quickly\n- Search works across titles, content, and tags\n\nHappy note-taking! 📝',
            tags: ['guide', 'tutorial', 'help'],
            folderId: null,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
            isFavorite: false,
          },
          {
            id: '3',
            title: 'Project Ideas',
            content: '# Project Ideas 💡\n\n## Web Development\n- [ ] Personal portfolio website\n- [ ] E-commerce platform\n- [ ] Social media dashboard\n- [ ] Task management app\n\n## Mobile Apps\n- [ ] Fitness tracker\n- [ ] Recipe organizer\n- [ ] Language learning app\n- [ ] Budget manager\n\n## AI/ML Projects\n- [ ] Chatbot for customer service\n- [ ] Image classification system\n- [ ] Recommendation engine\n- [ ] Natural language processing tool\n\n## Notes\n- Remember to start small and iterate\n- Focus on solving real problems\n- Document the development process',
            tags: ['projects', 'ideas', 'development'],
            folderId: null,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            updatedAt: new Date(Date.now() - 1800000).toISOString(),
            isFavorite: false,
          },
        ];
        set({ notes: mockNotes, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load notes',
        isLoading: false 
      });
    }
  },

  // 创建笔记
  createNote: async (note: Note) => {
    try {
      set({ isLoading: true, error: undefined });
      
      if (window.electronAPI) {
        const response = await window.electronAPI.notes.create(note);
        if (response.success) {
          const newNote = response.data;
          set(state => ({ 
            notes: [newNote, ...state.notes],
            currentNote: newNote,
            isLoading: false 
          }));
        } else {
          throw new Error(response.error || 'Failed to create note');
        }
      } else {
        // 开发环境下的模拟创建
        set(state => ({ 
          notes: [note, ...state.notes],
          currentNote: note,
          isLoading: false 
        }));
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create note',
        isLoading: false 
      });
    }
  },

  // 更新笔记
  updateNote: async (note: Note) => {
    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.notes.update(note.id, note);
        if (response.success) {
          const updatedNote = response.data;
          set(state => ({
            notes: state.notes.map(n => 
              n.id === note.id ? updatedNote : n
            ),
            currentNote: state.currentNote?.id === note.id ? updatedNote : state.currentNote,
          }));
        } else {
          throw new Error(response.error || 'Failed to update note');
        }
      } else {
        // 开发环境下的模拟更新
        set(state => ({
          notes: state.notes.map(n => 
            n.id === note.id ? note : n
          ),
          currentNote: state.currentNote?.id === note.id ? note : state.currentNote,
        }));
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update note',
      });
    }
  },

  // 删除笔记
  deleteNote: async (id: string) => {
    try {
      set({ isLoading: true, error: undefined });
      
      if (window.electronAPI) {
        const response = await window.electronAPI.notes.delete(id);
        if (response.success) {
          set(state => ({
            notes: state.notes.filter(note => note.id !== id),
            currentNote: state.currentNote?.id === id ? null : state.currentNote,
            isLoading: false
          }));
        } else {
          throw new Error(response.error || 'Failed to delete note');
        }
      } else {
        // 开发环境下的模拟删除
        set(state => ({
          notes: state.notes.filter(note => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete note',
        isLoading: false 
      });
    }
  },

  // 设置当前笔记
  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note });
  },

  // 设置搜索查询
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // 设置加载状态
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // 设置错误
  setError: (error?: string) => {
    set({ error });
  },

  // 根据ID获取笔记
  getNoteById: (id: string) => {
    return get().notes.find(note => note.id === id);
  },
}));