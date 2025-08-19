import { create } from 'zustand';
import { Folder, CreateFolderInput } from '../../types';

interface FoldersState {
  folders: Folder[];
  isLoading: boolean;
  error?: string;
}

interface FoldersActions {
  loadFolders: () => Promise<void>;
  createFolder: (input: CreateFolderInput) => Promise<Folder | null>;
  deleteFolder: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  getFolderById: (id: string) => Folder | undefined;
  getFolderTree: () => FolderTreeNode[];
}

interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
  level: number;
}

type FoldersStore = FoldersState & FoldersActions;

export const useFoldersStore = create<FoldersStore>((set, get) => ({
  // 初始状态
  folders: [],
  isLoading: false,
  error: undefined,

  // 加载文件夹
  loadFolders: async () => {
    try {
      set({ isLoading: true, error: undefined });
      
      if (window.electronAPI) {
        const response = await window.electronAPI.folders.list();
        if (response.success) {
          set({ folders: response.data, isLoading: false });
        } else {
          throw new Error(response.error || 'Failed to load folders');
        }
      } else {
        // 开发环境下的模拟数据
        const mockFolders: Folder[] = [
          {
            id: '1',
            name: 'Work',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            name: 'Personal',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '3',
            name: 'Projects',
            parentId: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        set({ folders: mockFolders, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load folders',
        isLoading: false 
      });
    }
  },

  // 创建文件夹
  createFolder: async (input: CreateFolderInput) => {
    try {
      set({ isLoading: true, error: undefined });
      
      if (window.electronAPI) {
        const response = await window.electronAPI.folders.create(input);
        if (response.success) {
          const newFolder = response.data;
          set(state => ({ 
            folders: [...state.folders, newFolder],
            isLoading: false 
          }));
          return newFolder;
        } else {
          throw new Error(response.error || 'Failed to create folder');
        }
      } else {
        // 开发环境下的模拟创建
        const newFolder: Folder = {
          id: Date.now().toString(),
          name: input.name,
          parentId: input.parentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ 
          folders: [...state.folders, newFolder],
          isLoading: false 
        }));
        return newFolder;
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create folder',
        isLoading: false 
      });
      return null;
    }
  },

  // 删除文件夹
  deleteFolder: async (id: string) => {
    try {
      set({ isLoading: true, error: undefined });
      
      if (window.electronAPI) {
        const response = await window.electronAPI.folders.delete(id);
        if (response.success) {
          set(state => ({
            folders: state.folders.filter(folder => folder.id !== id),
            isLoading: false
          }));
        } else {
          throw new Error(response.error || 'Failed to delete folder');
        }
      } else {
        // 开发环境下的模拟删除
        set(state => ({
          folders: state.folders.filter(folder => folder.id !== id),
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete folder',
        isLoading: false 
      });
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

  // 根据ID获取文件夹
  getFolderById: (id: string) => {
    return get().folders.find(folder => folder.id === id);
  },

  // 获取文件夹树结构
  getFolderTree: () => {
    const { folders } = get();
    
    // 构建文件夹树
    const buildTree = (parentId?: string, level = 0): FolderTreeNode[] => {
      return folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id, level + 1),
          level,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    };

    return buildTree();
  },
}));

export type { FolderTreeNode };