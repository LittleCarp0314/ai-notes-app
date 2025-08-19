import { app, BrowserWindow, Menu, shell } from 'electron';
import { join } from 'path';
import { isDev } from './utils/env';
import { AppManager } from './services/AppManager';
import { DatabaseManager } from './database/DatabaseManager';
import { setupIpcHandlers } from './ipc/handlers';

// 保持对窗口对象的全局引用，如果不这样做，当JavaScript对象被垃圾回收时，窗口将自动关闭
let mainWindow: BrowserWindow | null = null;
let appManager: AppManager;
let databaseManager: DatabaseManager;

const createWindow = (): void => {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // enableRemoteModule: false, // 已弃用
      preload: join(__dirname, '../preload/preload.js'),
    },
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    if (isDev) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

// 创建应用菜单
const createMenu = (): void => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-note');
          },
        },
        {
          label: 'New Folder',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-folder');
          },
        },
        { type: 'separator' },
        {
          label: 'Import',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow?.webContents.send('menu-import');
          },
        },
        {
          label: 'Export',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow?.webContents.send('menu-export');
          },
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow?.webContents.send('menu-settings');
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            mainWindow?.webContents.send('menu-find');
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow?.webContents.send('menu-toggle-sidebar');
          },
        },
      ],
    },
    {
      label: 'AI',
      submenu: [
        {
          label: 'Optimize Text',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            mainWindow?.webContents.send('menu-ai-optimize');
          },
        },
        {
          label: 'Summarize',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('menu-ai-summarize');
          },
        },
        {
          label: 'Translate',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => {
            mainWindow?.webContents.send('menu-ai-translate');
          },
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About',
          click: () => {
            mainWindow?.webContents.send('menu-about');
          },
        },
      ],
    },
  ];

  // macOS特殊处理
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });

    // Window menu
    (template[4].submenu as Electron.MenuItemConstructorOptions[]).push(
      { type: 'separator' },
      { role: 'front' },
      { type: 'separator' },
      { role: 'window' }
    );
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// 应用初始化
const initialize = async (): Promise<void> => {
  try {
    // 初始化数据库
    databaseManager = new DatabaseManager();
    await databaseManager.initialize();

    // 初始化应用管理器
    appManager = new AppManager(databaseManager);
    await appManager.initialize();

    // 设置IPC处理器
    setupIpcHandlers(databaseManager, appManager);

    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
};

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(async () => {
  await initialize();
  createWindow();
  createMenu();

  app.on('activate', () => {
    // 在macOS上，当点击dock图标并且没有其他窗口打开时，通常会重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用和它们的菜单栏通常会保持活跃状态，直到用户使用Cmd + Q明确退出
  if (process.platform !== 'darwin') app.quit();
});

// 在这个文件中，你可以包含应用特定的主进程代码的其余部分
// 你也可以将它们放在单独的文件中并在这里引入

// 应用退出前的清理工作
app.on('before-quit', async () => {
  try {
    if (databaseManager) {
      await databaseManager.close();
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});