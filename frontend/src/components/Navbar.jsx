import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { renderDepartmentBadge } from '../api/departmentHelper';
import { smoothScrollTo } from '../utils/smoothScroll';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, details } = useContext(AuthContext);
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [navMousePos, setNavMousePos] = useState({ x: -500, y: -500 });
  
  // Shared Sliding Pill position state & item refs
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const itemRefs = useRef({});
  const navRef = useRef(null);

  const getRoleTheme = () => {
    if (!user) return {};
    if (user.role === 'admin') return { color: '#E0384D', text: 'Admin' };
    if (user.role === 'analyst') return { color: '#F5A623', text: 'Analyst' };
    if (user.role === 'citizen') return { color: '#4DA3FF', text: 'Citizen' };
    return { color: '#3B82F6', text: 'Officer' };
  };

  const theme = getRoleTheme();
  const isPublicPath = ['/', '/about', '/contact', '/overview'].includes(location.pathname);

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'analyst') return '/analyst/dashboard';
    if (user.role === 'citizen') return '/citizen/dashboard';
    return '/officer/dashboard';
  };

  // Detect Scroll position for Navbar Shrink & Glass Blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update Shared Sliding Pill Position when Active Section changes
  useEffect(() => {
    if (!isPublicPath) return;

    const currentItem = itemRefs.current[activeSection];
    if (currentItem) {
      setPillStyle({
        left: currentItem.offsetLeft,
        width: currentItem.offsetWidth,
        opacity: 1
      });
    }
  }, [activeSection, isPublicPath]);

  // ScrollSpy to detect active section
  useEffect(() => {
    if (!isPublicPath) return;

    const sections = [
      { id: 'hero', key: 'hero' },
      { id: 'what-is-crimepilot', key: 'features' },
      { id: 'crimepilot-ai', key: 'crimepilot-ai' },
      { id: 'capabilities', key: 'features' },
      { id: 'how-it-works', key: 'features' },
      { id: 'portals', key: 'portals' },
      { id: 'why-crimepilot', key: 'about' },
      { id: 'statistics', key: 'about' },
      { id: 'development-team', key: 'contact' },
    ];

    const handleScrollSpy = () => {
      const scrollPos = window.pageYOffset + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSection(sections[i].key);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [isPublicPath]);

  // Navbar mouse radial glow tracking
  const handleMouseMove = (e) => {
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      setNavMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleNavClick = (e, targetId, sectionKey) => {
    e.preventDefault();
    // 1. Immediately update active section & slide pill instantly
    setActiveSection(sectionKey);
    // 2. Start smooth page scrolling simultaneously
    smoothScrollTo(targetId, 900, 70);
  };

  const navItems = [
    { key: 'hero', label: 'Home', target: 'hero' },
    { key: 'features', label: 'Features', target: 'what-is-crimepilot' },
    { key: 'crimepilot-ai', label: 'CrimePilot AI', target: 'crimepilot-ai' },
    { key: 'portals', label: 'Portals', target: 'portals' },
    { key: 'about', label: 'About', target: 'why-crimepilot' },
    { key: 'contact', label: 'Contact', target: 'development-team' },
  ];

  return (
    <header
      ref={navRef}
      onMouseMove={handleMouseMove}
      style={{
        height: '72px',
        padding: '0 24px',
        borderBottom: isScrolled ? '1px solid rgba(0, 217, 255, 0.20)' : '1px solid rgba(255, 255, 255, 0.08)',
        background: isScrolled
          ? `radial-gradient(200px circle at ${navMousePos.x}px ${navMousePos.y}px, rgba(0, 217, 255, 0.08), transparent 80%), rgba(8, 12, 22, 0.92)`
          : `radial-gradient(200px circle at ${navMousePos.x}px ${navMousePos.y}px, rgba(0, 217, 255, 0.05), transparent 80%), rgba(11, 15, 25, 0.75)`,
        backdropFilter: isScrolled ? 'blur(22px)' : 'blur(18px)',
        WebkitBackdropFilter: isScrolled ? 'blur(22px)' : 'blur(18px)',
        boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 217, 255, 0.1)' : 'none',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 350ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'height, background, border-color, box-shadow'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* CrimePilot brand logo & title as a link to home */}
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              setActiveSection('hero');
              smoothScrollTo('hero', 900, 70);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none'
          }}
        >
          <img
            src="/assets/logo.webp"
            alt="CrimePilot Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              objectFit: 'cover'
            }}
          />
          <span
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#fff',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            CrimePilot
          </span>
        </Link>

        {!isPublicPath && (
          <button
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Right side controls & navigation */}
      {isPublicPath ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Navigation Links with Shared Sliding Active Glass Pill */}
          <nav style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
            {/* Continuous Shared Sliding Glowing Glass Pill (Spring Physics Animation) */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: `${pillStyle.width}px`,
                height: '34px',
                transform: `translate3d(${pillStyle.left}px, -50%, 0)`,
                borderRadius: '20px',
                backgroundColor: 'rgba(0, 217, 255, 0.14)',
                border: '1px solid rgba(0, 217, 255, 0.45)',
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.3), inset 0 0 10px rgba(0, 217, 255, 0.15)',
                transition: 'transform 380ms cubic-bezier(0.175, 0.885, 0.32, 1.1), width 380ms cubic-bezier(0.175, 0.885, 0.32, 1.1), opacity 300ms ease',
                opacity: pillStyle.opacity,
                pointerEvents: 'none',
                zIndex: 1,
                animation: 'pillBreathing 3.5s ease-in-out infinite',
                willChange: 'transform, width'
              }}
            />

            {navItems.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <a
                  key={item.key}
                  ref={(el) => (itemRefs.current[item.key] = el)}
                  href={`#${item.target}`}
                  onClick={(e) => handleNavClick(e, item.target, item.key)}
                  style={{
                    position: 'relative',
                    color: isActive ? '#00D9FF' : '#94a3b8',
                    textDecoration: 'none',
                    padding: '7px 14px',
                    borderRadius: '20px',
                    zIndex: 2,
                    transition: 'color 250ms ease, transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                    fontWeight: isActive ? '700' : '600',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#00D9FF';
                    e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isActive ? '#00D9FF' : '#94a3b8';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {user ? (
            <Link
              to={getDashboardUrl()}
              style={{
                textDecoration: 'none',
                color: '#fff',
                backgroundColor: theme.color || '#3B82F6',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.2s',
                boxShadow: `0 0 10px ${(theme.color || '#3B82F6')}44`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
              }}
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                color: '#fff',
                background: 'linear-gradient(135deg, #00D9FF, #0088ff)',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 280ms cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 0 12px rgba(0, 217, 255, 0.25)',
                display: 'inline-block',
                willChange: 'transform, box-shadow'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 217, 255, 0.6)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 217, 255, 0.25)';
              }}
            >
              Login
            </Link>
          )}
        </div>
      ) : (
        user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Department Division Badge */}
            {user.role !== 'citizen' && renderDepartmentBadge(user.email, { marginRight: '4px' })}

            {/* Role Badge */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.color,
                border: `1px solid ${theme.color}33`,
                backgroundColor: `${theme.color}10`,
                padding: '3px 8px',
                borderRadius: '4px',
              }}
            >
              {theme.text}
            </span>

            {/* Notification Bell Icon Component */}
            <NotificationBell />

            {/* User Dropdown Profile Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>
                {details?.full_name || user.email}
              </span>
              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )
      )}

      {/* Breathing Active Pill Animation Keyframes */}
      <style>{`
        @keyframes pillBreathing {
          0% { box-shadow: 0 0 18px rgba(0, 217, 255, 0.25), inset 0 0 8px rgba(0, 217, 255, 0.12); }
          50% { box-shadow: 0 0 28px rgba(0, 217, 255, 0.45), inset 0 0 14px rgba(0, 217, 255, 0.22); }
          100% { box-shadow: 0 0 18px rgba(0, 217, 255, 0.25), inset 0 0 8px rgba(0, 217, 255, 0.12); }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
