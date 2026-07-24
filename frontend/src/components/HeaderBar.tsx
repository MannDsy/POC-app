import React, { useEffect, useRef, useState } from 'react';
import logo from '../assets/eInfochips-Logo-white.svg';

export type HeaderTab = 'home' | 'tasks' | 'timesheet';
export type AppTheme = 'black' | 'blue';

interface HeaderBarProps {
  activeTab?: HeaderTab;
  userInitials?: string;
  theme?: AppTheme;
  onTabChange?: (tabName: HeaderTab) => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onThemeChange?: (theme: AppTheme) => void;
  onSearch?: (query: string) => void;
}

const THEME_OPTIONS: { key: AppTheme; label: string; color: string }[] = [
  { key: 'black', label: 'Black (Default)', color: '#000000' },
  { key: 'blue', label: 'Blue', color: '#0069aa' },
];

const NAV_ITEMS: { key: HeaderTab; label: string; icon: React.ReactElement }[] = [
  {
    key: 'home',
    label: 'Dashboard',
    icon: (
      <svg
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        viewBox="0 0 24 24"
        className="defaultSize navitemIcon"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'tasks',
    label: 'Tasks',
    icon: (
      <svg
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        viewBox="0 0 24 24"
        className="defaultSize navitemIcon"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20 2H8c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM8 16V4h12l.002 12H8z" />
        <path d="M4 8H2v12c0 1.103.897 2 2 2h12v-2H4V8z" />
      </svg>
    ),
  },
  {
    key: 'timesheet',
    label: 'Worklog',
    icon: (
      <svg
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        viewBox="0 0 24 24"
        className="defaultSize navitemIcon"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab = 'home',
  userInitials = 'U',
  theme = 'black',
  onTabChange,
  onProfileClick,
  onLogout,
  onThemeChange,
  onSearch,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Theme Modal States
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);

  // Keep internal modal state aligned with prop changes & reflect data attribute on mount
  useEffect(() => {
    setSelectedTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Search Bar States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside to close Profile dropdown and Search input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleApplyTheme = () => {
    if (onThemeChange) {
      onThemeChange(selectedTheme);
    }
    // Update global data-theme attribute on <html> element for CSS variable updates
    document.documentElement.setAttribute('data-theme', selectedTheme);
    setIsThemeModalOpen(false);
  };

  return (
    <>
      <header className="outerHeaderContainer" role="banner">
        {/* Brand / Logo Section */}
        <div className="logoDiv">
          <a href="/dashboard">
            <img src={logo} alt="eInfochips Logo" className="eicLogoImg headerLogo" />
          </a>
        </div>

        {/* Primary Nav */}
        <div className="centerDiv">
          <nav className="nav" aria-label="Primary">
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.key} className={`navItem ${activeTab === item.key ? 'activeItem' : ''}`}>
                  <a
                    className="navParent"
                    href={`#${item.key}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onTabChange && onTabChange(item.key);
                    }}
                  >
                    <span className="navFocusRing">
                      <span className="navIconHost">
                        <span>{item.icon}</span>
                      </span>
                      <span className="navLabel">{item.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="profileDiv">
          <div className="profileDiv-left">
            {/* Interactive Global Search Tooltip & Expansion Box */}
            <div className="tooltipWrapper" ref={searchRef}>
              <div className="ellipsisText tooltipChildBox tooltipActive" aria-label="Global search">
                {!isSearchOpen ? (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Open global search"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    onClick={() => setIsSearchOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setIsSearchOpen(true);
                    }}
                  >
                    <span>
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        className="defaultSize iconSearch"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: 'var(--icon-header-icons, #ffffff)' }}
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                    </span>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSearchSubmit}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: '#ffffff',
                      borderRadius: '8px',
                      padding: '4px 12px',
                      width: '240px',
                      boxSizing: 'border-box',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                    }}
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: '14px',
                        color: '#333333',
                        width: '100%',
                        padding: '2px 0',
                      }}
                    />
                    <button
                      type="submit"
                      aria-label="Search"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '6px',
                      }}
                    >
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        height="1.1em"
                        width="1.1em"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: '#888888' }}
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="" />

            {/* Info Tool */}
            <div className="tooltipWrapper">
              <div className="ellipsisText tooltipChildBox tooltipActive">
                <div className="copyright-info" role="button" tabIndex={0} aria-label="Application info">
                  <span>
                    <svg
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="defaultSize infoIcon"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ color: 'var(--icon-header-icons, #ffffff)' }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="whiteVerticalLine" />

          {/* User Profile Avatar Dropdown */}
          <div
            id="profileDropDownDiv"
            className="profileDropDownDiv"
            ref={profileRef}
            style={{ position: 'relative' }}
          >
            <div className="tooltipWrapper">
              <div className="ellipsisText tooltipChildBox tooltipActive" aria-label="Profile">
                <div className="dropdown-outer">
                  <button
                    className="isOnlySelectionDropdown"
                    style={{ background: 'transparent', cursor: 'pointer' }}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isProfileOpen}
                    aria-label={userInitials}
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                  >
                    <span className="dropdown-selected-value">{userInitials}</span>
                  </button>
                </div>
              </div>
            </div>

            {isProfileOpen && (
              <div
                className="dropDown-menu navDropdown__menu customDropDownContainer profileDropDown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  background: 'var(--white-1, #ffffff)',
                  borderRadius: '4px',
                  minWidth: '120px',
                  zIndex: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <ul className="dropdownItems" style={{ listStyle: 'none', margin: 0, padding: '4px 0' }}>
                  <li
                    style={{ padding: '10px 16px', cursor: 'pointer', color: 'var(--black-2, #333333)', fontSize: '.8125rem' }}
                    onClick={() => {
                      setIsProfileOpen(false);
                      onProfileClick && onProfileClick();
                    }}
                  >
                    My Profile
                  </li>
                  <li
                    style={{ padding: '10px 16px', cursor: 'pointer', color: 'var(--black-2, #333333)', fontSize: '.8125rem' }}
                    onClick={() => {
                      setIsProfileOpen(false);
                      setSelectedTheme(theme);
                      setIsThemeModalOpen(true);
                    }}
                  >
                    Theme
                  </li>
                  <li
                    style={{ padding: '10px 16px', cursor: 'pointer', color: 'var(--red-1, #ff2546)', fontSize: '.8125rem' }}
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout && onLogout();
                    }}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Theme Picker Modal Dialog */}
      {isThemeModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsThemeModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              width: '460px',
              maxWidth: '90%',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
              <h3 className="theme-text-primary" style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>
                Choose Theme
              </h3>
              <button
                onClick={() => setIsThemeModalOpen(false)}
                className="theme-button-outline"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Theme Options Cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
              {THEME_OPTIONS.map((option) => {
                const isSelected = selectedTheme === option.key;
                return (
                  <div
                    key={option.key}
                    onClick={() => setSelectedTheme(option.key)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--primary-color)' : '1px solid #e0e0e0',
                      background: isSelected ? 'var(--primary-light-bg)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: option.color,
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ fontSize: '14px', color: '#333333', fontWeight: isSelected ? 500 : 400 }}>
                        {option.label}
                      </span>
                    </div>
                    {isSelected && <span className="theme-text-primary" style={{ fontWeight: 'bold', fontSize: '16px' }}>✓</span>}
                  </div>
                );
              })}
            </div>

            {/* Footer Action Buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => setIsThemeModalOpen(false)}
                className="theme-button-outline"
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTheme}
                className="theme-button-primary"
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderBar;