import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  messages: ToastMessage[];
}

// 全局Toast状态管理
let toastState: ToastState = { messages: [] };
let listeners: Array<(state: ToastState) => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener(toastState));
};

export const showToast = (toast: Omit<ToastMessage, 'id'>) => {
  const id = Date.now().toString();
  const newToast: ToastMessage = {
    id,
    duration: 5000,
    ...toast,
  };
  
  toastState.messages.push(newToast);
  notifyListeners();

  // 自动移除
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }
};

export const removeToast = (id: string) => {
  toastState.messages = toastState.messages.filter(msg => msg.id !== id);
  notifyListeners();
};

const Toast: React.FC = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (state: ToastState) => {
      setMessages([...state.messages]);
    };
    
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`
            max-w-sm w-full shadow-lg rounded-lg border p-4 
            ${getBackgroundColor(message.type)}
            animate-fade-in
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(message.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {message.title}
              </p>
              {message.message && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {message.message}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:text-gray-600 dark:focus:text-gray-200"
                onClick={() => removeToast(message.id)}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;