import React, { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Note } from '../../types';
import { useNotesStore } from '../stores/useNotesStore';
import { useUIStore } from '../stores/useUIStore';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  CodeBracketIcon,
  BookmarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

interface NoteEditorProps {
  note: Note | null;
  onSave?: (note: Note) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { updateNote, createNote } = useNotesStore();
  const { theme } = useUIStore();

  // 加载笔记内容
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setLastSaved(new Date(note.updatedAt));
    } else {
      setTitle('');
      setContent('');
      setLastSaved(null);
    }
  }, [note]);

  // 自动保存功能
  const autoSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    try {
      const now = new Date();
      
      if (note) {
        // 更新现有笔记
        const updatedNote: Note = {
          ...note,
          title: title.trim() || '无标题',
          content,
          updatedAt: now.toISOString(),
        };
        await updateNote(updatedNote);
        onSave?.(updatedNote);
      } else {
        // 创建新笔记
        const newNote: Note = {
          id: crypto.randomUUID(),
          title: title.trim() || '无标题',
          content,
          folderId: null,
          tags: [],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          isFavorite: false,
        };
        await createNote(newNote);
        onSave?.(newNote);
      }
      
      setLastSaved(now);
    } catch (error) {
      console.error('保存笔记失败:', error);
    } finally {
      setIsSaving(false);
    }
  }, [note, title, content, updateNote, createNote, onSave]);

  // 防抖保存
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(autoSave, 1000);
  }, [autoSave]);

  // 内容变化处理
  const handleContentChange = useCallback((value: string | undefined) => {
    setContent(value || '');
    debouncedSave();
  }, [debouncedSave]);

  // 标题变化处理
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    debouncedSave();
  }, [debouncedSave]);

  // 切换收藏状态
  const toggleFavorite = useCallback(async () => {
    if (!note) return;
    
    const updatedNote: Note = {
      ...note,
      isFavorite: !note.isFavorite,
      updatedAt: new Date().toISOString(),
    };
    
    await updateNote(updatedNote);
    onSave?.(updatedNote);
  }, [note, updateNote, onSave]);

  // 编辑器挂载处理
  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;
    
    // 设置编辑器快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      autoSave();
    });
    
    // 设置编辑器选项
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.6,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'none',
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
    });
  }, [autoSave]);

  // 格式化最后保存时间
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚保存';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前保存`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前保存`;
    return date.toLocaleDateString();
  };

  // 渲染Markdown预览
  const renderPreview = () => {
    // 简单的Markdown渲染（后续可以用react-markdown替换）
    const htmlContent = content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');

    return (
      <div 
        className="prose prose-sm max-w-none p-4 h-full overflow-auto"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  if (!note && !title && !content) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            选择一个笔记开始编辑
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            或者创建一个新笔记
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* 编辑器工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 flex-1">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="笔记标题..."
            className="text-lg font-semibold bg-transparent border-none outline-none flex-1 text-gray-900 dark:text-gray-100 placeholder-gray-500"
          />
          
          {note && (
            <button
              onClick={toggleFavorite}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {note.isFavorite ? (
                <BookmarkSolidIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <BookmarkIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* 保存状态 */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {isSaving ? (
              <span>保存中...</span>
            ) : lastSaved ? (
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{formatLastSaved(lastSaved)}</span>
              </div>
            ) : null}
          </div>

          {/* 预览切换 */}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`p-2 rounded ${
              isPreview 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
            title={isPreview ? '编辑模式' : '预览模式'}
          >
            {isPreview ? (
              <CodeBracketIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* 编辑器内容区域 */}
      <div className="flex-1 relative">
        {isPreview ? (
          renderPreview()
        ) : (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={content}
            onChange={handleContentChange}
            onMount={handleEditorDidMount}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              wordWrap: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineHeight: 1.6,
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: 'none',
              hideCursorInOverviewRuler: true,
              overviewRulerBorder: false,
              automaticLayout: true,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default NoteEditor;