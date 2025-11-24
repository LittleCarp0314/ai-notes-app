import { create } from 'zustand';
import { Tag } from '../../types';

interface TagsState {
  tags: Tag[];
  isLoading: boolean;
  error?: string;
}

interface TagsActions {
  loadTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag | null>;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  getTagByName: (name: string) => Tag | undefined;
  getTagColors: () => string[];
}

type TagsStore = TagsState & TagsActions;

export const useTagsStore = create<TagsStore>((set, get) => ({
  // 初始状态
  tags: [],
  isLoading: false,
  error: undefined,

  // 加载标签
  loadTags: async () => {
    try {
      set({ isLoading: true, error: undefined });
      
      if (window.electronAPI) {
        const response = await window.electronAPI.tags.list();
        if (response.success) {
          set({ tags: response.data, isLoading: false });
        } else {
          throw new Error(response.error || 'Failed to load tags');
        }
      } else {
        // 开发环境下的模拟数据
        const mockTags: Tag[] = [
          {
            id: '1',
            name: 'work',
            color: '#3b82f6',
            createdAt: new Date(),
          },
          {
            id: '2',
            name: 'personal',
            color: '#10b981',
            createdAt: new Date(),
          },
          {
            id: '3',
            name: 'important',
            color: '#ef4444',
            createdAt: new Date(),
          },
          {
            id: '4',
            name: 'idea',
            color: '#f59e0b',
            createdAt: new Date(),
          },
          {
            id: '5',
            name: 'tutorial',
            color: '#8b5cf6',
            createdAt: new Date(),
          },
        ];
        set({ tags: mockTags, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load tags',
        isLoading: false 
      });
    }
  },

  // 创建标签
  createTag: async (name: string, color?: string) => {
    try {
      set({ isLoading: true, error: undefined });
      
      // 检查标签是否已存在
      const existingTag = get().getTagByName(name);
      if (existingTag) {
        set({ isLoading: false });
        return existingTag;
      }
      
      if (window.electronAPI) {
        const response = await window.electronAPI.tags.create(name, color);
        if (response.success) {
          const newTag = response.data;
          set(state => ({ 
            tags: [...state.tags, newTag],
            isLoading: false 
          }));
          return newTag;
        } else {
          throw new Error(response.error || 'Failed to create tag');
        }
      } else {
        // 开发环境下的模拟创建
        const colors = get().getTagColors();
        const newTag: Tag = {
          id: Date.now().toString(),
          name,
          color: color || colors[Math.floor(Math.random() * colors.length)],
          createdAt: new Date(),
        };
        set(state => ({ 
          tags: [...state.tags, newTag],
          isLoading: false 
        }));
        return newTag;
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create tag',
        isLoading: false 
      });
      return null;
    }
  },

  // 设置加载状态
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // 设置错误
  setError: (error?: string) => {
    set({ error });
  },

  // 根据名称获取标签
  getTagByName: (name: string) => {
    return get().tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
  },

  // 获取预定义的标签颜色
  getTagColors: () => {
    return [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // yellow
      '#ef4444', // red
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#f97316', // orange
      '#84cc16', // lime
      '#ec4899', // pink
      '#6b7280', // gray
    ];
  },
}));