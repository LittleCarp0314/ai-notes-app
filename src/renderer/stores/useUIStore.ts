import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // 侧边栏状态
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  
  // 当前视图
  currentView: 'notes' | 'search' | 'settings' | 'trash';
  
  // 主题
  theme: 'light' | 'dark' | 'auto';
  
  // 加载状态
  isLoading: boolean;
  
  // 选中状态
  selectedNoteId?: string;
  selectedFolderId?: string;
  
  // 搜索状态
  searchQuery: string;
  searchVisible: boolean;
  
  // 模态框状态
  modals: {
    newNote: boolean;
    newFolder: boolean;
    settings: boolean;
    about: boolean;
    deleteConfirm: boolean;
  };
  
  // 错误状态
  error?: string;
}

interface UIActions {
  // 侧边栏操作
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  
  // 视图操作
  setCurrentView: (view: UIState['currentView']) => void;
  
  // 主题操作
  setTheme: (theme: UIState['theme']) => void;
  toggleTheme: () => void;
  
  // 加载状态
  setLoading: (loading: boolean) => void;
  
  // 选中操作
  selectNote: (noteId?: string) => void;
  selectFolder: (folderId?: string) => void;
  
  // 搜索操作
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;
  showSearch: () => void;
  hideSearch: () => void;
  
  // 模态框操作
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  // 错误处理
  setError: (error?: string) => void;
  clearError: () => void;
  
  // 初始化
  initializeUI: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      sidebarWidth: 280,
      sidebarCollapsed: false,
      currentView: 'notes',
      theme: 'auto',
      isLoading: false,
      selectedNoteId: undefined,
      selectedFolderId: undefined,
      searchQuery: '',
      searchVisible: false,
      modals: {
        newNote: false,
        newFolder: false,
        settings: false,
        about: false,
        deleteConfirm: false,
      },
      error: undefined,

      // 侧边栏操作
      setSidebarWidth: (width: number) => {
        set({ sidebarWidth: Math.max(200, Math.min(400, width)) });
      },

      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      collapseSidebar: () => {
        set({ sidebarCollapsed: true });
      },

      expandSidebar: () => {
        set({ sidebarCollapsed: false });
      },

      // 视图操作
      setCurrentView: (view: UIState['currentView']) => {
        set({ currentView: view });
      },

      // 主题操作
      setTheme: (theme: UIState['theme']) => {
        set({ theme });
        
        // 应用主题到DOM
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          // auto模式，根据系统主题
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // 加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 选中操作
      selectNote: (noteId?: string) => {
        set({ selectedNoteId: noteId });
      },

      selectFolder: (folderId?: string) => {
        set({ selectedFolderId: folderId, selectedNoteId: undefined });
      },

      // 搜索操作
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      toggleSearch: () => {
        set(state => ({ searchVisible: !state.searchVisible }));
      },

      showSearch: () => {
        set({ searchVisible: true });
      },

      hideSearch: () => {
        set({ searchVisible: false, searchQuery: '' });
      },

      // 模态框操作
      openModal: (modal: keyof UIState['modals']) => {
        set(state => ({
          modals: { ...state.modals, [modal]: true }
        }));
      },

      closeModal: (modal: keyof UIState['modals']) => {
        set(state => ({
          modals: { ...state.modals, [modal]: false }
        }));
      },

      closeAllModals: () => {
        set({
          modals: {
            newNote: false,
            newFolder: false,
            settings: false,
            about: false,
            deleteConfirm: false,
          }
        });
      },

      // 错误处理
      setError: (error?: string) => {
        set({ error });
      },

      clearError: () => {
        set({ error: undefined });
      },

      // 初始化
      initializeUI: () => {
        const { theme } = get();
        
        // 应用主题
        get().setTheme(theme);
        
        // 监听系统主题变化
        if (theme === 'auto') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = () => {
            if (get().theme === 'auto') {
              get().setTheme('auto');
            }
          };
          mediaQuery.addEventListener('change', handleChange);
        }

        // 监听菜单事件
        const handleMenuToggleSidebar = () => {
          get().toggleSidebar();
        };

        const handleMenuFind = () => {
          get().showSearch();
        };

        const handleMenuSettings = () => {
          get().openModal('settings');
        };

        const handleMenuAbout = () => {
          get().openModal('about');
        };

        window.addEventListener('menu:toggle-sidebar', handleMenuToggleSidebar);
        window.addEventListener('menu:find', handleMenuFind);
        window.addEventListener('menu:settings', handleMenuSettings);
        window.addEventListener('menu:about', handleMenuAbout);

        // 清理函数
        return () => {
          window.removeEventListener('menu:toggle-sidebar', handleMenuToggleSidebar);
          window.removeEventListener('menu:find', handleMenuFind);
          window.removeEventListener('menu:settings', handleMenuSettings);
          window.removeEventListener('menu:about', handleMenuAbout);
        };
      },
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);