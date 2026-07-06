import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import PageTransition from './PageTransition';

const Layout = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getPortalClass = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'theme-admin';
    if (user.role === 'analyst') return 'theme-analyst';
    if (user.role === 'citizen') return 'theme-citizen';
    return 'theme-officer';
  };

  return (
    <div className={getPortalClass()} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1420', color: '#f8fafc' }}>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)' }}>
        {user && <Sidebar isOpen={sidebarOpen} />}
        <main style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          backgroundColor: '#0F1420',
          background: 'radial-gradient(circle at top right, rgba(var(--theme-accent-rgb, 59, 130, 246), 0.03) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(var(--theme-accent-rgb, 59, 130, 246), 0.03) 0%, transparent 50%)'
        }}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default Layout;
