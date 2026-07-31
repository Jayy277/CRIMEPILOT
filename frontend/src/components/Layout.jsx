import React, { useContext, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import PageTransition from './PageTransition';

const Layout = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const getPortalClass = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'theme-admin';
    if (user.role === 'analyst') return 'theme-analyst';
    if (user.role === 'citizen') return 'theme-citizen';
    return 'theme-officer';
  };

  const isPublicPath = ['/', '/about', '/contact', '/overview'].includes(location.pathname);

  // If public route, allow normal page scroll; for portals, enforce strict 100vh viewport containment
  const isPortalView = user && !isPublicPath;

  return (
    <div
      className={getPortalClass()}
      style={{
        height: isPortalView ? '100vh' : 'auto',
        minHeight: isPortalView ? '100vh' : '100vh',
        width: '100vw',
        overflow: isPortalView ? 'hidden' : 'visible',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0F1420',
        color: '#f8fafc'
      }}
    >
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div
        style={{
          display: 'flex',
          flex: 1,
          height: isPortalView ? 'calc(100vh - 72px)' : 'auto',
          minHeight: 0,
          overflow: isPortalView ? 'hidden' : 'visible'
        }}
      >
        {isPortalView && <Sidebar isOpen={sidebarOpen} />}
        <main
          className="portal-main-container"
          style={{
            flex: 1,
            minHeight: 0,
            height: isPortalView ? '100%' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            overflowY: isPortalView ? 'auto' : 'visible',
            padding: '24px 24px 32px 24px',
            backgroundColor: '#0F1420',
            background: 'radial-gradient(circle at top right, rgba(var(--theme-accent-rgb, 59, 130, 246), 0.03) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(var(--theme-accent-rgb, 59, 130, 246), 0.03) 0%, transparent 50%)',
            scrollBehavior: 'smooth'
          }}
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default Layout;
