import { ipcMain } from 'electron';
import { DatabaseManager } from '../database/DatabaseManager';
import { AppManager } from '../services/AppManager';
import { 
  IPCResponse, 
  CreateNoteInput, 
  UpdateNoteInput, 
  CreateFolderInput, 
  SearchQuery,
  AppSettings 
} from '../../types';

export function setupIpcHandlers(
  databaseManager: DatabaseManager,
  appManager: AppManager
): void {
  // 笔记相关处理器
  ipcMain.handle('notes:create', async (_, input: CreateNoteInput): Promise<IPCResponse> => {
    try {
      const note = await databaseManager.createNote(input);
      appManager.addRecentNote(note.id);
      return { success: true, data: note };
    } catch (error) {
      console.error('Failed to create note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('notes:update', async (_, id: string, updates: UpdateNoteInput): Promise<IPCResponse> => {
    try {
      const note = await databaseManager.updateNote(id, updates);
      appManager.addRecentNote(note.id);
      return { success: true, data: note };
    } catch (error) {
      console.error('Failed to update note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('notes:delete', async (_, id: string): Promise<IPCResponse> => {
    try {
      await databaseManager.deleteNote(id);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('notes:get', async (_, id: string): Promise<IPCResponse> => {
    try {
      const note = await databaseManager.getNoteById(id);
      return { success: true, data: note };
    } catch (error) {
      console.error('Failed to get note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('notes:list', async (_, folderId?: string): Promise<IPCResponse> => {
    try {
      const notes = await databaseManager.getNotesByFolder(folderId);
      return { success: true, data: notes };
    } catch (error) {
      console.error('Failed to list notes:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('notes:search', async (_, query: SearchQuery): Promise<IPCResponse> => {
    try {
      const notes = await databaseManager.searchNotes(query);
      return { success: true, data: notes };
    } catch (error) {
      console.error('Failed to search notes:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('notes:restore', async (_, id: string): Promise<IPCResponse> => {
    try {
      await databaseManager.restoreNote(id);
      return { success: true };
    } catch (error) {
      console.error('Failed to restore note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('notes:permanently-delete', async (_, id: string): Promise<IPCResponse> => {
    try {
      await databaseManager.permanentlyDeleteNote(id);
      return { success: true };
    } catch (error) {
      console.error('Failed to permanently delete note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // 文件夹相关处理器
  ipcMain.handle('folders:create', async (_, input: CreateFolderInput): Promise<IPCResponse> => {
    try {
      const folder = await databaseManager.createFolder(input);
      return { success: true, data: folder };
    } catch (error) {
      console.error('Failed to create folder:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('folders:list', async (): Promise<IPCResponse> => {
    try {
      const folders = await databaseManager.getAllFolders();
      return { success: true, data: folders };
    } catch (error) {
      console.error('Failed to list folders:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('folders:delete', async (_, id: string): Promise<IPCResponse> => {
    try {
      await databaseManager.deleteFolder(id);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete folder:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // 标签相关处理器
  ipcMain.handle('tags:list', async (): Promise<IPCResponse> => {
    try {
      const tags = await databaseManager.getAllTags();
      return { success: true, data: tags };
    } catch (error) {
      console.error('Failed to list tags:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('tags:create', async (_, name: string, color?: string): Promise<IPCResponse> => {
    try {
      const tag = await databaseManager.createTag(name, color);
      return { success: true, data: tag };
    } catch (error) {
      console.error('Failed to create tag:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // 设置相关处理器
  ipcMain.handle('settings:get', async (): Promise<IPCResponse> => {
    try {
      const settings = appManager.getSettings();
      return { success: true, data: settings };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('settings:update', async (_, updates: Partial<AppSettings>): Promise<IPCResponse> => {
    try {
      appManager.updateSettings(updates);
      const settings = appManager.getSettings();
      return { success: true, data: settings };
    } catch (error) {
      console.error('Failed to update settings:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('settings:reset', async (): Promise<IPCResponse> => {
    try {
      appManager.resetSettings();
      const settings = appManager.getSettings();
      return { success: true, data: settings };
    } catch (error) {
      console.error('Failed to reset settings:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // 应用信息处理器
  ipcMain.handle('app:get-version', async (): Promise<IPCResponse> => {
    try {
      const version = appManager.getAppVersion();
      return { success: true, data: version };
    } catch (error) {
      console.error('Failed to get app version:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('app:get-recent-notes', async (): Promise<IPCResponse> => {
    try {
      const recentNotes = appManager.getRecentNotes();
      return { success: true, data: recentNotes };
    } catch (error) {
      console.error('Failed to get recent notes:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // 文件操作处理器
  ipcMain.handle('file:show-open-dialog', async (_, options): Promise<IPCResponse> => {
    try {
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog(options);
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to show open dialog:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('file:show-save-dialog', async (_, options): Promise<IPCResponse> => {
    try {
      const { dialog } = require('electron');
      const result = await dialog.showSaveDialog(options);
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to show save dialog:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('file:read', async (_, filePath: string): Promise<IPCResponse> => {
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, data: content };
    } catch (error) {
      console.error('Failed to read file:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('file:write', async (_, filePath: string, content: string): Promise<IPCResponse> => {
    try {
      const fs = require('fs').promises;
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Failed to write file:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  console.log('IPC handlers setup completed');
}