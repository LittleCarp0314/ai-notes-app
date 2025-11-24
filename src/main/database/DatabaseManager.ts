import Database from 'better-sqlite3';
import { join } from 'path';
import { getAppDataPath } from '../utils/env';
import { Note, Folder, Tag, CreateNoteInput, UpdateNoteInput, CreateFolderInput, SearchQuery } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseManager {
  private db: Database.Database | null = null;

  async initialize(): Promise<void> {
    try {
      const dbPath = join(getAppDataPath(), 'notes.db');
      this.db = new Database(dbPath);
      
      // 启用外键约束
      this.db.pragma('foreign_keys = ON');
      
      // 创建表结构
      await this.createTables();
      
      // 创建索引
      await this.createIndexes();
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // 创建文件夹表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
      )
    `);

    // 创建笔记表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        folder_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
      )
    `);

    // 创建标签表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建笔记标签关联表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS note_tags (
        note_id TEXT,
        tag_id TEXT,
        PRIMARY KEY (note_id, tag_id),
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    // 创建附件表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        note_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        filesize INTEGER,
        mimetype TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
      )
    `);

    // 创建全文搜索表
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
        title, content, tags,
        content='notes',
        content_rowid='rowid'
      )
    `);
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // 创建索引以提高查询性能
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
      CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
      CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
      CREATE INDEX IF NOT EXISTS idx_notes_is_deleted ON notes(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
      CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id);
      CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id);
    `);
  }

  // 笔记相关操作
  async createNote(input: CreateNoteInput): Promise<Note> {
    if (!this.db) throw new Error('Database not initialized');

    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO notes (id, title, content, folder_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, input.title, input.content || '', input.folderId || null, now, now);

    // 处理标签
    if (input.tags && input.tags.length > 0) {
      await this.addTagsToNote(id, input.tags);
    }

    // 更新全文搜索索引
    this.updateFTSIndex(id);

    return this.getNoteById(id);
  }

  async updateNote(id: string, updates: UpdateNoteInput): Promise<Note> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    if (updates.folderId !== undefined) {
      fields.push('folder_id = ?');
      values.push(updates.folderId);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    if (fields.length > 1) { // 除了updated_at之外还有其他字段
      const stmt = this.db.prepare(`
        UPDATE notes SET ${fields.join(', ')} WHERE id = ?
      `);
      stmt.run(...values);
    }

    // 处理标签更新
    if (updates.tags !== undefined) {
      await this.updateNoteTags(id, updates.tags);
    }

    // 更新全文搜索索引
    this.updateFTSIndex(id);

    return this.getNoteById(id);
  }

  async deleteNote(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('UPDATE notes SET is_deleted = TRUE WHERE id = ?');
    stmt.run(id);
  }

  async permanentlyDeleteNote(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run(id);
  }

  async restoreNote(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('UPDATE notes SET is_deleted = FALSE WHERE id = ?');
    stmt.run(id);
  }

  async getNoteById(id: string): Promise<Note> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM notes WHERE id = ? AND is_deleted = FALSE
    `);
    const row = stmt.get(id) as any;
    
    if (!row) {
      throw new Error(`Note with id ${id} not found`);
    }

    const tags = await this.getNoteTagNames(id);
    
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      folderId: row.folder_id,
      tags,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      isDeleted: Boolean(row.is_deleted),
    };
  }

  async getNotesByFolder(folderId?: string): Promise<Note[]> {
    if (!this.db) throw new Error('Database not initialized');

    let stmt;
    if (folderId) {
      stmt = this.db.prepare(`
        SELECT * FROM notes 
        WHERE folder_id = ? AND is_deleted = FALSE 
        ORDER BY updated_at DESC
      `);
    } else {
      stmt = this.db.prepare(`
        SELECT * FROM notes 
        WHERE folder_id IS NULL AND is_deleted = FALSE 
        ORDER BY updated_at DESC
      `);
    }

    const rows = stmt.all(folderId) as any[];
    const notes: Note[] = [];

    for (const row of rows) {
      const tags = await this.getNoteTagNames(row.id);
      notes.push({
        id: row.id,
        title: row.title,
        content: row.content,
        folderId: row.folder_id,
        tags,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        isDeleted: Boolean(row.is_deleted),
      });
    }

    return notes;
  }

  async searchNotes(query: SearchQuery): Promise<Note[]> {
    if (!this.db) throw new Error('Database not initialized');

    let sql = `
      SELECT DISTINCT n.* FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.is_deleted = FALSE
    `;
    const params: any[] = [];

    // 全文搜索
    if (query.text) {
      sql += ` AND (n.title LIKE ? OR n.content LIKE ?)`;
      params.push(`%${query.text}%`, `%${query.text}%`);
    }

    // 标签筛选
    if (query.tags && query.tags.length > 0) {
      sql += ` AND t.name IN (${query.tags.map(() => '?').join(',')})`;
      params.push(...query.tags);
    }

    // 文件夹筛选
    if (query.folderId) {
      sql += ` AND n.folder_id = ?`;
      params.push(query.folderId);
    }

    // 日期范围筛选
    if (query.dateRange) {
      sql += ` AND n.created_at BETWEEN ? AND ?`;
      params.push(query.dateRange.start.toISOString(), query.dateRange.end.toISOString());
    }

    sql += ` ORDER BY n.updated_at DESC`;

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    const notes: Note[] = [];

    for (const row of rows) {
      const tags = await this.getNoteTagNames(row.id);
      notes.push({
        id: row.id,
        title: row.title,
        content: row.content,
        folderId: row.folder_id,
        tags,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        isDeleted: Boolean(row.is_deleted),
      });
    }

    return notes;
  }

  // 文件夹相关操作
  async createFolder(input: CreateFolderInput): Promise<Folder> {
    if (!this.db) throw new Error('Database not initialized');

    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO folders (id, name, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, input.name, input.parentId || null, now, now);

    return this.getFolderById(id);
  }

  async getFolderById(id: string): Promise<Folder> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM folders WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) {
      throw new Error(`Folder with id ${id} not found`);
    }

    return {
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getAllFolders(): Promise<Folder[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM folders ORDER BY name');
    const rows = stmt.all() as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async deleteFolder(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // 将该文件夹下的笔记移动到根目录
    const updateNotesStmt = this.db.prepare('UPDATE notes SET folder_id = NULL WHERE folder_id = ?');
    updateNotesStmt.run(id);

    // 删除文件夹
    const deleteFolderStmt = this.db.prepare('DELETE FROM folders WHERE id = ?');
    deleteFolderStmt.run(id);
  }

  // 标签相关操作
  async createTag(name: string, color?: string): Promise<Tag> {
    if (!this.db) throw new Error('Database not initialized');

    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO tags (id, name, color, created_at)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(id, name, color || null, now);

    // 如果标签已存在，获取现有标签
    const existingStmt = this.db.prepare('SELECT * FROM tags WHERE name = ?');
    const row = existingStmt.get(name) as any;

    return {
      id: row.id,
      name: row.name,
      color: row.color,
      createdAt: new Date(row.created_at),
    };
  }

  async getAllTags(): Promise<Tag[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM tags ORDER BY name');
    const rows = stmt.all() as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
      createdAt: new Date(row.created_at),
    }));
  }

  private async addTagsToNote(noteId: string, tagNames: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const tagName of tagNames) {
      // 创建或获取标签
      const tag = await this.createTag(tagName);
      
      // 关联笔记和标签
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO note_tags (note_id, tag_id)
        VALUES (?, ?)
      `);
      stmt.run(noteId, tag.id);
    }
  }

  private async updateNoteTags(noteId: string, tagNames: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // 删除现有标签关联
    const deleteStmt = this.db.prepare('DELETE FROM note_tags WHERE note_id = ?');
    deleteStmt.run(noteId);

    // 添加新标签
    if (tagNames.length > 0) {
      await this.addTagsToNote(noteId, tagNames);
    }
  }

  private async getNoteTagNames(noteId: string): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT t.name FROM tags t
      JOIN note_tags nt ON t.id = nt.tag_id
      WHERE nt.note_id = ?
    `);
    const rows = stmt.all(noteId) as any[];

    return rows.map(row => row.name);
  }

  private updateFTSIndex(noteId: string): void {
    if (!this.db) throw new Error('Database not initialized');

    // 更新全文搜索索引
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO notes_fts (rowid, title, content, tags)
      SELECT n.rowid, n.title, n.content, 
             GROUP_CONCAT(t.name, ' ') as tags
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.id = ?
      GROUP BY n.id
    `);
    stmt.run(noteId);
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}