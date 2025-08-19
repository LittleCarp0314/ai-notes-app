// 核心数据模型
export interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  noteId: string;
  filename: string;
  filepath: string;
  filesize: number;
  mimetype: string;
  createdAt: Date;
}

// AI配置
export interface AIConfig {
  provider: 'openai' | 'claude' | 'custom';
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxTokens: number;
  temperature?: number;
}

// 应用设置
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  fontFamily: string;
  autoSave: boolean;
  aiConfig: AIConfig;
  shortcuts: Record<string, string>;
  sidebarWidth: number;
  editorSettings: {
    wordWrap: boolean;
    lineNumbers: boolean;
    minimap: boolean;
  };
}

// 搜索相关
export interface SearchQuery {
  text: string;
  tags?: string[];
  folderId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchResult {
  note: Note;
  highlights: string[];
  score: number;
}

// 创建和更新输入类型
export interface CreateNoteInput {
  title: string;
  content?: string;
  folderId?: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  folderId?: string;
  tags?: string[];
}

export interface CreateFolderInput {
  name: string;
  parentId?: string;
}

// AI服务相关
export interface OptimizeOptions {
  type: 'grammar' | 'clarity' | 'conciseness' | 'tone';
  targetTone?: 'formal' | 'casual' | 'professional';
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// IPC通信类型
export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// UI状态类型
export interface UIState {
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  currentView: 'notes' | 'search' | 'settings' | 'trash';
  theme: 'light' | 'dark';
  isLoading: boolean;
  selectedNoteId?: string;
  selectedFolderId?: string;
}

// 错误类型
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public operation: string, details?: any) {
    super(message, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, public statusCode?: number, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, public provider: string, details?: any) {
    super(message, 'AI_SERVICE_ERROR', details);
    this.name = 'AIServiceError';
  }
}