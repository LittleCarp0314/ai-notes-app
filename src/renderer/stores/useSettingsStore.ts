import { create } from 'zustand';
import { AppSettings, AIConfig } from '../../types';

interface SettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  error?: string;
}

interface SettingsActions {
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  updateAIConfig: (config: Partial<AIConfig>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // 初始状态
  settings: null,
  isLoading: false,
  error: undefined,

  // 加载设置
  loadSettings: async () => {
    try {
      set({ isLoading: true, error: undefined });
      
      if (window.electronAPI) {
        const response = await window.electronAPI.settings.get();
        if (response.success) {
          set({ settings: response.data, isLoading: false });
        } else {
          throw new Error(response.error || 'Failed to load settings');
        }
      } else {
        // 开发环境下的默认设置
        const defaultSettings: AppSettings = {
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
        set({ settings: defaultSettings, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load settings',
        isLoading: false 
      });
    }
  },

  // 更新设置
  updateSettings: async (updates: Partial<AppSettings>) => {
    try {
      set({ isLoading: true, error: undefined });
      
      if (window.electronAPI) {
        const response = await window.electronAPI.settings.update(updates);
        if (response.success) {
          set({ settings: response.data, isLoading: false });
        } else {
          throw new Error(response.error || 'Failed to update settings');
        }
      } else {
        // 开发环境下的模拟更新
        const currentSettings = get().settings;
        if (currentSettings) {
          const newSettings = { ...currentSettings, ...updates };
          set({ settings: newSettings, isLoading: false });
        }
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update settings',
        isLoading: false 
      });
    }
  },

  // 重置设置
  resetSettings: async () => {
    try {
      set({ isLoading: true, error: undefined });
      
      if (window.electronAPI) {
        const response = await window.electronAPI.settings.reset();
        if (response.success) {
          set({ settings: response.data, isLoading: false });
        } else {
          throw new Error(response.error || 'Failed to reset settings');
        }
      } else {
        // 开发环境下重新加载默认设置
        await get().loadSettings();
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to reset settings',
        isLoading: false 
      });
    }
  },

  // 更新AI配置
  updateAIConfig: async (config: Partial<AIConfig>) => {
    const currentSettings = get().settings;
    if (currentSettings) {
      const newAIConfig = { ...currentSettings.aiConfig, ...config };
      await get().updateSettings({ aiConfig: newAIConfig });
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
}));