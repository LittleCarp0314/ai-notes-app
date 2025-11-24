// Jest setup file
import '@testing-library/jest-dom';

// Mock Electron API
global.window = Object.create(window);
Object.defineProperty(window, 'electronAPI', {
  value: {
    notes: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
      search: jest.fn(),
      restore: jest.fn(),
      permanentlyDelete: jest.fn(),
    },
    folders: {
      create: jest.fn(),
      list: jest.fn(),
      delete: jest.fn(),
    },
    tags: {
      list: jest.fn(),
      create: jest.fn(),
    },
    settings: {
      get: jest.fn(),
      update: jest.fn(),
      reset: jest.fn(),
    },
    app: {
      getVersion: jest.fn(),
      getRecentNotes: jest.fn(),
    },
    file: {
      showOpenDialog: jest.fn(),
      showSaveDialog: jest.fn(),
      read: jest.fn(),
      write: jest.fn(),
    },
    menu: {
      onNewNote: jest.fn(),
      onNewFolder: jest.fn(),
      onImport: jest.fn(),
      onExport: jest.fn(),
      onSettings: jest.fn(),
      onFind: jest.fn(),
      onToggleSidebar: jest.fn(),
      onAIOptimize: jest.fn(),
      onAISummarize: jest.fn(),
      onAITranslate: jest.fn(),
      onAbout: jest.fn(),
    },
    platform: 'darwin',
  },
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});