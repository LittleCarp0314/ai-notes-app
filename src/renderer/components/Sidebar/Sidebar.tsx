import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FolderIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  TrashIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useNotesStore } from '../../stores/useNotesStore';
import { useFoldersStore } from '../../stores/useFoldersStore';
import { useUIStore } from '../../stores/useUIStore';
import { FolderTreeNode } from '../../stores/useFoldersStore';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notes } = useNotesStore();
  const { getFolderTree, createFolder } = useFoldersStore();
  const { selectedFolderId, selectFolder, openModal } = useUIStore();
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const folderTree = getFolderTree();
  const rootNotes = notes.filter(note => !note.folderId && !note.isDeleted);

  useEffect(() => {
    // 监听菜单事件
    const handleNewNote = () => {
      openModal('newNote');
    };

    const handleNewFolder = () => {
      setShowNewFolderInput(true);
    };

    window.addEventListener('menu:new-note', handleNewNote);
    window.addEventListener('menu:new-folder', handleNewFolder);

    return () => {
      window.removeEventListener('menu:new-note', handleNewNote);
      window.removeEventListener('menu:new-folder', handleNewFolder);
    };
  }, [openModal]);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderSelect = (folderId?: string) => {
    selectFolder(folderId);
    navigate(folderId ? `/folder/${folderId}` : '/notes');
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder({ name: newFolderName.trim() });
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateFolder();
    } else if (e.key === 'Escape') {
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const renderFolderTree = (nodes: FolderTreeNode[]) => {
    return nodes.map(folder => {
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolderId === folder.id;
      const folderNotes = notes.filter(note => note.folderId === folder.id && !note.isDeleted);
      
      return (
        <div key={folder.id}>
          <div
            className={`list-item ${isSelected ? 'active' : ''}`}
            style={{ paddingLeft: `${12 + folder.level * 16}px` }}
            onClick={() => handleFolderSelect(folder.id)}
          >
            <button
              className="flex items-center justify-center w-4 h-4 mr-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
            >
              {folder.children.length > 0 ? (
                isExpanded ? (
                  <ChevronDownIcon className="w-3 h-3" />
                ) : (
                  <ChevronRightIcon className="w-3 h-3" />
                )
              ) : (
                <div className="w-3 h-3" />
              )}
            </button>
            <FolderIcon className="w-4 h-4 mr-2 text-blue-500" />
            <span className="flex-1 truncate">{folder.name}</span>
            <span className="text-xs text-gray-500 ml-2">
              {folderNotes.length}
            </span>
          </div>
          {isExpanded && folder.children.length > 0 && (
            <div>
              {renderFolderTree(folder.children)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Notes
        </h1>
      </div>

      {/* 导航菜单 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2">
          {/* 所有笔记 */}
          <div
            className={`list-item ${!selectedFolderId && location.pathname === '/notes' ? 'active' : ''}`}
            onClick={() => handleFolderSelect()}
          >
            <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-500" />
            <span className="flex-1">All Notes</span>
            <span className="text-xs text-gray-500 ml-2">
              {rootNotes.length}
            </span>
          </div>

          {/* 搜索 */}
          <div
            className={`list-item ${location.pathname === '/search' ? 'active' : ''}`}
            onClick={() => navigate('/search')}
          >
            <MagnifyingGlassIcon className="w-4 h-4 mr-2 text-gray-500" />
            <span className="flex-1">Search</span>
          </div>

          {/* 回收站 */}
          <div
            className={`list-item ${location.pathname === '/trash' ? 'active' : ''}`}
            onClick={() => navigate('/trash')}
          >
            <TrashIcon className="w-4 h-4 mr-2 text-gray-500" />
            <span className="flex-1">Trash</span>
          </div>
        </div>

        {/* 文件夹 */}
        <div className="mt-4">
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Folders
            </h3>
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              onClick={() => setShowNewFolderInput(true)}
              title="New Folder"
            >
              <PlusIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="px-2">
            {/* 新建文件夹输入框 */}
            {showNewFolderInput && (
              <div className="mb-2 px-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={() => {
                    if (!newFolderName.trim()) {
                      setShowNewFolderInput(false);
                    }
                  }}
                  placeholder="Folder name"
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            )}

            {/* 文件夹树 */}
            {renderFolderTree(folderTree)}
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {notes.filter(note => !note.isDeleted).length} notes
        </div>
      </div>
    </div>
  );
};

export default Sidebar;