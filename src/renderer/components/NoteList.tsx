import React, { useMemo } from 'react';
import { Note } from '../../types';
import { useNotesStore } from '../stores/useNotesStore';
import { useUIStore } from '../stores/useUIStore';
import { 
  DocumentTextIcon,
  BookmarkIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

interface NoteListProps {
  selectedNoteId?: string;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  selectedNoteId,
  onSelectNote,
  onCreateNote,
}) => {
  const { notes, deleteNote, searchQuery, setSearchQuery } = useNotesStore();
  const { sidebarCollapsed } = useUIStore();

  // 过滤和排序笔记
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }

    // 按更新时间排序
    return filtered.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [notes, searchQuery]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return date.toLocaleDateString();
  };

  // 获取笔记预览文本
  const getPreviewText = (content: string, maxLength = 100) => {
    const text = content.replace(/[#*`\n]/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // 删除笔记
  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这个笔记吗？')) {
      await deleteNote(noteId);
    }
  };

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            笔记
          </h2>
          <button
            onClick={onCreateNote}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="新建笔记"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 笔记列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <DocumentTextIcon className="w-12 h-12 mb-4" />
            <p className="text-sm text-center">
              {searchQuery ? '没有找到匹配的笔记' : '还没有笔记'}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreateNote}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                创建第一个笔记
              </button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors group ${
                  selectedNoteId === note.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-1 flex-1">
                    {note.title || '无标题'}
                  </h3>
                  <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {note.isFavorite && (
                      <BookmarkSolidIcon className="w-4 h-4 text-yellow-500" />
                    )}
                    <button
                      onClick={(e) => handleDeleteNote(e, note.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      title="删除笔记"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 笔记预览 */}
                {note.content && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {getPreviewText(note.content)}
                  </p>
                )}

                {/* 标签 */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* 时间戳 */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatDate(note.updatedAt)}</span>
                  {note.isFavorite && (
                    <BookmarkSolidIcon className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {filteredNotes.length} 个笔记
          {searchQuery && ` · 搜索: "${searchQuery}"`}
        </p>
      </div>
    </div>
  );
};

export default NoteList;