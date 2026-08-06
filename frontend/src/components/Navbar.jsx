import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { renderDepartmentBadge } from '../api/departmentHelper';
import { smoothScrollTo } from '../utils/smoothScroll';
import { FiChevronDown, FiChevronRight, FiUser, FiEdit, FiShield, FiBarChart2 } from 'react-icons/fi';

const CrownIcon = ({ size = 16, color = '#fbbf24' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    <path d="M3 20h18" />
  </svg>
);

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, details } = useContext(AuthContext);
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [navMousePos, setNavMousePos] = useState({ x: -500, y: -500 });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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

        {isPublicPath && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="public-mobile-hamburger"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '12px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Right side controls & navigation */}
      {isPublicPath ? (
        <div className="public-nav-controls" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Navigation Links with Shared Sliding Active Glass Pill */}
          <nav className="desktop-public-nav" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
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
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: 'linear-gradient(135deg, #00D9FF, #0088ff)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  fontFamily: 'Outfit, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 280ms cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: dropdownOpen ? '0 0 25px rgba(0, 217, 255, 0.6)' : '0 0 12px rgba(0, 217, 255, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 217, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  if (!dropdownOpen) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 217, 255, 0.25)';
                  }
                }}
              >
                Login / Register
                <FiChevronDown
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 250ms ease',
                    fontSize: '14px'
                  }}
                />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '270px',
                    backgroundColor: 'rgba(11, 18, 32, 0.98)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 217, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    padding: '16px',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transformOrigin: 'top right',
                    animation: 'dropdownFadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* CITIZEN PORTAL */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#10B981', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
                      Citizen Portal
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Link
                        to="/login?role=citizen"
                        onClick={() => setDropdownOpen(false)}
                        className="dropdown-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          color: '#e2e8f0',
                          textDecoration: 'none',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FiUser style={{ color: '#10B981', fontSize: '15px' }} />
                          <span>Citizen Login</span>
                        </div>
                        <FiChevronRight className="arrow-icon" style={{ color: '#94a3b8', opacity: 0.5, transition: 'all 0.2s' }} />
                      </Link>
                      <Link
                        to="/citizen/register"
                        onClick={() => setDropdownOpen(false)}
                        className="dropdown-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          color: '#e2e8f0',
                          textDecoration: 'none',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FiEdit style={{ color: '#10B981', fontSize: '14px' }} />
                          <span>Citizen Register</span>
                        </div>
                        <FiChevronRight className="arrow-icon" style={{ color: '#94a3b8', opacity: 0.5, transition: 'all 0.2s' }} />
                      </Link>
                    </div>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

                  {/* OFFICER PORTAL */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#00D9FF', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
                      Officer Portal
                    </div>
                    <Link
                      to="/login?role=officer"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                        textDecoration: 'none',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiShield style={{ color: '#00D9FF', fontSize: '15px' }} />
                        <span>Officer Login</span>
                      </div>
                      <FiChevronRight className="arrow-icon" style={{ color: '#94a3b8', opacity: 0.5, transition: 'all 0.2s' }} />
                    </Link>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

                  {/* ANALYST PORTAL */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#A855F7', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
                      Analyst Portal
                    </div>
                    <Link
                      to="/login?role=analyst"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                        textDecoration: 'none',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiBarChart2 style={{ color: '#A855F7', fontSize: '15px' }} />
                        <span>Analyst Login</span>
                      </div>
                      <FiChevronRight className="arrow-icon" style={{ color: '#94a3b8', opacity: 0.5, transition: 'all 0.2s' }} />
                    </Link>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

                  {/* ADMIN PORTAL */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#EF4444', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
                      Admin Portal
                    </div>
                    <Link
                      to="/login?role=admin"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                        textDecoration: 'none',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CrownIcon size={14} color="#EF4444" />
                        <span>Admin Login</span>
                      </div>
                      <FiChevronRight className="arrow-icon" style={{ color: '#94a3b8', opacity: 0.5, transition: 'all 0.2s' }} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
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

      {/* Public Mobile Slide-in Navigation Drawer */}
      {isPublicPath && mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.96)',
            backdropFilter: 'blur(20px)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: '16px',
            overflowY: 'auto',
            borderTop: '1px solid rgba(0, 217, 255, 0.2)'
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.key}
              href={`#${item.target}`}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, item.target, item.key);
              }}
              style={{
                color: activeSection === item.key ? '#00D9FF' : '#94a3b8',
                fontSize: '16px',
                fontWeight: '700',
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: activeSection === item.key ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                border: activeSection === item.key ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent'
              }}
            >
              {item.label}
            </a>
          ))}

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {user ? (
              <Link
                to={getDashboardUrl()}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#fff',
                  backgroundColor: theme.color || '#3B82F6',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700'
                }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #00D9FF, #0088ff)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700'
                }}
              >
                Sign In to Portal
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Breathing Active Pill & Dropdown Animation Styles */}
      <style>{`
        @keyframes pillBreathing {
          0% { box-shadow: 0 0 18px rgba(0, 217, 255, 0.25), inset 0 0 8px rgba(0, 217, 255, 0.12); }
          50% { box-shadow: 0 0 28px rgba(0, 217, 255, 0.45), inset 0 0 14px rgba(0, 217, 255, 0.22); }
          100% { box-shadow: 0 0 18px rgba(0, 217, 255, 0.25), inset 0 0 8px rgba(0, 217, 255, 0.12); }
        }
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .dropdown-item:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: #ffffff !important;
        }
        .dropdown-item:hover .arrow-icon {
          opacity: 1 !important;
          color: #00D9FF !important;
          transform: translateX(4px);
        }
        .public-mobile-hamburger {
          display: none !important;
        }
        @media (max-width: 767px) {
          .public-mobile-hamburger {
            display: flex !important;
          }
          .desktop-public-nav {
            display: none !important;
          }
          .public-nav-controls > *:not(.public-mobile-hamburger) {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
