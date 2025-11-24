import { contextBridge, ipcRenderer } from 'electron';
import { 
  IPCResponse, 
  CreateNoteInput, 
  UpdateNoteInput, 
  CreateFolderInput, 
  SearchQuery,
  AppSettings 
} from '../types';

// 定义暴露给渲染进程的API
const electronAPI = {
  // 笔记相关API
  notes: {
    create: (input: CreateNoteInput): Promise<IPCResponse> => 
      ipcRenderer.invoke('notes:create', input),
    
    update: (id: string, updates: UpdateNoteInput): Promise<IPCResponse> => 
      ipcRenderer.invoke('notes:update', id, updates),
    
    delete: (id: string): Promise<IPCResponse> => 
      ipcRenderer.invoke('notes:delete', id),
    
    get: (id: string): Promise<IPCResponse> => 
      ipcRenderer.invoke('notes:get', id),
    
    list: (folderId?: string): Promise<IPCResponse> => 
      ipcRenderer.invoke('notes:list', folderId),
    
    search: (query: SearchQuery): Promise<IPCResponse> => 
      ipcRenderer.invoke('notes:search', query),
    
    restore: (id: string): Promise<IPCResponse> => 
      ipcRenderer.invoke('notes:restore', id),
    
    permanentlyDelete: (id: string): Promise<IPCResponse> => 
      ipcRenderer.invoke('notes:permanently-delete', id),
  },

  // 文件夹相关API
  folders: {
    create: (input: CreateFolderInput): Promise<IPCResponse> => 
      ipcRenderer.invoke('folders:create', input),
    
    list: (): Promise<IPCResponse> => 
      ipcRenderer.invoke('folders:list'),
    
    delete: (id: string): Promise<IPCResponse> => 
      ipcRenderer.invoke('folders:delete', id),
  },

  // 标签相关API
  tags: {
    list: (): Promise<IPCResponse> => 
      ipcRenderer.invoke('tags:list'),
    
    create: (name: string, color?: string): Promise<IPCResponse> => 
      ipcRenderer.invoke('tags:create', name, color),
  },

  // 设置相关API
  settings: {
    get: (): Promise<IPCResponse> => 
      ipcRenderer.invoke('settings:get'),
    
    update: (updates: Partial<AppSettings>): Promise<IPCResponse> => 
      ipcRenderer.invoke('settings:update', updates),
    
    reset: (): Promise<IPCResponse> => 
      ipcRenderer.invoke('settings:reset'),
  },

  // 应用信息API
  app: {
    getVersion: (): Promise<IPCResponse> => 
      ipcRenderer.invoke('app:get-version'),
    
    getRecentNotes: (): Promise<IPCResponse> => 
      ipcRenderer.invoke('app:get-recent-notes'),
  },

  // 文件操作API
  file: {
    showOpenDialog: (options: any): Promise<IPCResponse> => 
      ipcRenderer.invoke('file:show-open-dialog', options),
    
    showSaveDialog: (options: any): Promise<IPCResponse> => 
      ipcRenderer.invoke('file:show-save-dialog', options),
    
    read: (filePath: string): Promise<IPCResponse> => 
      ipcRenderer.invoke('file:read', filePath),
    
    write: (filePath: string, content: string): Promise<IPCResponse> => 
      ipcRenderer.invoke('file:write', filePath, content),
  },

  // 菜单事件监听
  menu: {
    onNewNote: (callback: () => void) => {
      ipcRenderer.on('menu-new-note', callback);
      return () => ipcRenderer.removeListener('menu-new-note', callback);
    },
    
    onNewFolder: (callback: () => void) => {
      ipcRenderer.on('menu-new-folder', callback);
      return () => ipcRenderer.removeListener('menu-new-folder', callback);
    },
    
    onImport: (callback: () => void) => {
      ipcRenderer.on('menu-import', callback);
      return () => ipcRenderer.removeListener('menu-import', callback);
    },
    
    onExport: (callback: () => void) => {
      ipcRenderer.on('menu-export', callback);
      return () => ipcRenderer.removeListener('menu-export', callback);
    },
    
    onSettings: (callback: () => void) => {
      ipcRenderer.on('menu-settings', callback);
      return () => ipcRenderer.removeListener('menu-settings', callback);
    },
    
    onFind: (callback: () => void) => {
      ipcRenderer.on('menu-find', callback);
      return () => ipcRenderer.removeListener('menu-find', callback);
    },
    
    onToggleSidebar: (callback: () => void) => {
      ipcRenderer.on('menu-toggle-sidebar', callback);
      return () => ipcRenderer.removeListener('menu-toggle-sidebar', callback);
    },
    
    onAIOptimize: (callback: () => void) => {
      ipcRenderer.on('menu-ai-optimize', callback);
      return () => ipcRenderer.removeListener('menu-ai-optimize', callback);
    },
    
    onAISummarize: (callback: () => void) => {
      ipcRenderer.on('menu-ai-summarize', callback);
      return () => ipcRenderer.removeListener('menu-ai-summarize', callback);
    },
    
    onAITranslate: (callback: () => void) => {
      ipcRenderer.on('menu-ai-translate', callback);
      return () => ipcRenderer.removeListener('menu-ai-translate', callback);
    },
    
    onAbout: (callback: () => void) => {
      ipcRenderer.on('menu-about', callback);
      return () => ipcRenderer.removeListener('menu-about', callback);
    },
  },

  // 平台信息
  platform: process.platform,
};

// 将API暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 类型声明，供TypeScript使用
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}