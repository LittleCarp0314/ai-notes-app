import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// 确保DOM已加载
const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

// 创建React根节点并渲染应用
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);