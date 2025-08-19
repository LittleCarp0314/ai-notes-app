import { BrowserWindow, app } from 'electron';
import Store from 'electron-store';
import { DatabaseManager } from '../database/DatabaseManager';
import { AppSettings, AIConfig } from '../../types';

export class AppManager {
  private store: Store<AppSettings>;
  // private databaseManager: DatabaseManager;

  constructor(_databaseManager: DatabaseManager) {
    // this.databaseManager = databaseManager;
    this.store = new Store<AppSettings>({
      name: 'app-settings',
      defaults: this.getDefaultSettings(),
    });
  }

  async initialize(): Promise<void> {
    try {
      // 设置应用用户模型ID（Windows）
      if (process.platform === 'win32') {
        app.setAppUserModelId('com.ai-notes-app.app');
      }

      // 防止多实例运行
      const gotTheLock = app.requestSingleInstanceLock();
      if (!gotTheLock) {
        app.quit();
        return;
      }

      app.on('second-instance', () => {
        // 当运行第二个实例时，将焦点放在主窗口上
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.focus();
        }
      });

      console.log('AppManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AppManager:', error);
      throw error;
    }
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: 'auto',
      fontSize: 14,
      fontFamily: 'Inter',
      autoSave: true,
      aiConfig: {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        maxTokens: 2000,
        temperature: 0.7,
      },
      shortcuts: {
        'new-note': 'CmdOrCtrl+N',
        'new-folder': 'CmdOrCtrl+Shift+N',
        'search': 'CmdOrCtrl+F',
        'toggle-sidebar': 'CmdOrCtrl+B',
        'ai-optimize': 'CmdOrCtrl+Shift+O',
        'ai-summarize': 'CmdOrCtrl+Shift+S',
        'ai-translate': 'CmdOrCtrl+Shift+T',
      },
      sidebarWidth: 280,
      editorSettings: {
        wordWrap: true,
        lineNumbers: true,
        minimap: false,
      },
    };
  }

  // 设置管理
  getSettings(): AppSettings {
    return this.store.store;
  }

  updateSettings(updates: Partial<AppSettings>): void {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    this.store.store = newSettings;
  }

  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.store.get(key) as AppSettings[K];
  }

  setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.store.set(key, value);
  }

  // AI配置管理
  getAIConfig(): AIConfig {
    return this.getSetting('aiConfig');
  }

  updateAIConfig(config: Partial<AIConfig>): void {
    const currentConfig = this.getAIConfig();
    const newConfig = { ...currentConfig, ...config };
    this.setSetting('aiConfig', newConfig);
  }

  // 应用状态管理
  getAppVersion(): string {
    return app.getVersion();
  }

  getAppPath(): string {
    return app.getAppPath();
  }

  getUserDataPath(): string {
    return app.getPath('userData');
  }

  // 窗口状态管理
  saveWindowState(windowState: {
    x: number;
    y: number;
    width: number;
    height: number;
    isMaximized: boolean;
  }): void {
    this.store.set('windowState', windowState);
  }

  getWindowState(): {
    x: number;
    y: number;
    width: number;
    height: number;
    isMaximized: boolean;
  } | null {
    return this.store.get('windowState') as any || null;
  }

  // 最近使用的文件
  addRecentNote(noteId: string): void {
    const recentNotes = this.getRecentNotes();
    const filtered = recentNotes.filter(id => id !== noteId);
    filtered.unshift(noteId);
    
    // 只保留最近10个
    const limited = filtered.slice(0, 10);
    this.store.set('recentNotes', limited);
  }

  getRecentNotes(): string[] {
    return this.store.get('recentNotes', []) as string[];
  }

  // 导入导出设置
  exportSettings(): AppSettings {
    return this.getSettings();
  }

  importSettings(settings: Partial<AppSettings>): void {
    this.updateSettings(settings);
  }

  // 重置设置
  resetSettings(): void {
    this.store.clear();
    this.store.store = this.getDefaultSettings();
  }

  // 备份和恢复
  async createBackup(): Promise<string> {
    // 这里可以实现数据库备份逻辑
    // 返回备份文件路径
    throw new Error('Backup functionality not implemented yet');
  }

  async restoreFromBackup(_backupPath: string): Promise<void> {
    // 这里可以实现从备份恢复的逻辑
    throw new Error('Restore functionality not implemented yet');
  }

  // 清理和维护
  async cleanup(): Promise<void> {
    try {
      // 清理临时文件
      // 清理过期的缓存
      // 优化数据库
      console.log('Cleanup completed');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}