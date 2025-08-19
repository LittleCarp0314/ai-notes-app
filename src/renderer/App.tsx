import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';
import { useUIStore } from './stores/useUIStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { useNotesStore } from './stores/useNotesStore';
import { useFoldersStore } from './stores/useFoldersStore';
import { useTagsStore } from './stores/useTagsStore';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Toast from './components/Toast/Toast';

const App: React.FC = () => {
  const { theme, initializeUI } = useUIStore();
  const { loadSettings } = useSettingsStore();
  const { loadNotes } = useNotesStore();
  const { loadFolders } = useFoldersStore();
  const { loadTags } = useTagsStore();

  useEffect(() => {
    // 初始化应用
    const initializeApp = async () => {
      try {
        // 加载设置
        await loadSettings();
        
        // 加载数据
        await Promise.all([
          loadNotes(),
          loadFolders(),
          loadTags(),
        ]);

        // 初始化UI
        initializeUI();

        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [loadSettings, loadNotes, loadFolders, loadTags, initializeUI]);

  useEffect(() => {
    // 应用主题
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // 设置菜单事件监听器
    const unsubscribers: (() => void)[] = [];

    if (window.electronAPI) {
      // 新建笔记
      unsubscribers.push(
        window.electronAPI.menu.onNewNote(() => {
          // 触发新建笔记
          const event = new CustomEvent('menu:new-note');
          window.dispatchEvent(event);
        })
      );

      // 新建文件夹
      unsubscribers.push(
        window.electronAPI.menu.onNewFolder(() => {
          const event = new CustomEvent('menu:new-folder');
          window.dispatchEvent(event);
        })
      );

      // 切换侧边栏
      unsubscribers.push(
        window.electronAPI.menu.onToggleSidebar(() => {
          const event = new CustomEvent('menu:toggle-sidebar');
          window.dispatchEvent(event);
        })
      );

      // 搜索
      unsubscribers.push(
        window.electronAPI.menu.onFind(() => {
          const event = new CustomEvent('menu:find');
          window.dispatchEvent(event);
        })
      );

      // AI功能
      unsubscribers.push(
        window.electronAPI.menu.onAIOptimize(() => {
          const event = new CustomEvent('menu:ai-optimize');
          window.dispatchEvent(event);
        })
      );

      unsubscribers.push(
        window.electronAPI.menu.onAISummarize(() => {
          const event = new CustomEvent('menu:ai-summarize');
          window.dispatchEvent(event);
        })
      );

      unsubscribers.push(
        window.electronAPI.menu.onAITranslate(() => {
          const event = new CustomEvent('menu:ai-translate');
          window.dispatchEvent(event);
        })
      );

      // 设置
      unsubscribers.push(
        window.electronAPI.menu.onSettings(() => {
          const event = new CustomEvent('menu:settings');
          window.dispatchEvent(event);
        })
      );

      // 导入导出
      unsubscribers.push(
        window.electronAPI.menu.onImport(() => {
          const event = new CustomEvent('menu:import');
          window.dispatchEvent(event);
        })
      );

      unsubscribers.push(
        window.electronAPI.menu.onExport(() => {
          const event = new CustomEvent('menu:export');
          window.dispatchEvent(event);
        })
      );

      // 关于
      unsubscribers.push(
        window.electronAPI.menu.onAbout(() => {
          const event = new CustomEvent('menu:about');
          window.dispatchEvent(event);
        })
      );
    }

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<NotesPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="notes/:noteId" element={<NotesPage />} />
            <Route path="folder/:folderId" element={<NotesPage />} />
            <Route path="search" element={<NotesPage />} />
            <Route path="trash" element={<NotesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        <Toast />
      </div>
    </ErrorBoundary>
  );
};

export default App;