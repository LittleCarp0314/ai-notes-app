import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { useUIStore } from '../../stores/useUIStore';

const Layout: React.FC = () => {
  const { sidebarCollapsed, sidebarWidth } = useUIStore();

  return (
    <div className="app-container">
      <div 
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={{ width: sidebarCollapsed ? 0 : sidebarWidth }}
      >
        <Sidebar />
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;