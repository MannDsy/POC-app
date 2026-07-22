import React, { useEffect, useRef, useState } from 'react';
import logo from '../assets/eInfochips-Logo-white.png';
export type HeaderTab = 'home' | 'tasks' | 'timesheet';
export type AppTheme = 'black' | 'blue';

interface HeaderBarProps {
  activeTab?: string;
  userInitials?: string;
  theme?: AppTheme;
  onTabChange?: (tabName: string) => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onThemeChange?: (theme: AppTheme) => void;
}

const THEME_OPTIONS: { key: AppTheme; label: string; swatchClass: string }[] = [
  { key: 'black', label: 'Black (Default)', swatchClass: 'theme-picker-swatch--dark' },
  { key: 'blue', label: 'Blue', swatchClass: '' },
];

function getSavedTheme(fallback: AppTheme): AppTheme {
  try {
    const email = sessionStorage.getItem('loggedInUserEmail');
    if (email) {
      const saved = localStorage.getItem(`theme:${email.trim().toLowerCase()}`);
      if (saved === 'blue' || saved === 'black') return saved;
    }
  } catch {
    // localStorage/sessionStorage unavailable — fall back to the given default
  }
  return fallback;
}

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
        fill="currentColor"
        strokeWidth="0"
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
        strokeLinecap="round"
        strokeLinejoin="round"
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
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // The `theme` prop is treated as an initial hint only — this component owns the
  // live selection itself and applies it directly to the document, so the header,
  // sidebar, and rest of the page all update immediately, regardless of whether
  // a parent component ever feeds a new `theme` prop back in.
  const [activeTheme, setActiveTheme] = useState<AppTheme>(() => getSavedTheme(theme));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setShowThemeOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
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

      {/* Global Actions & Profile Section */}
      <div className="profileDiv">
        <div className="profileDiv-left">
          {/* Global Search Tool */}
          <div className="tooltipWrapper">
            <div className="ellipsisText tooltipChildBox tooltipActive" aria-label="Global search">
              <div role="button" tabIndex={0} aria-label="Open global search">
                <span>
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    className="defaultSize iconSearch"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

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
                    xmlns="http://www.w3.org/2000/svg"
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
                minWidth: '160px',
                zIndex: 600,
              }}
            >
              <ul className="dropdownItems" style={{ listStyle: 'none', margin: 0, padding: '4px 0' }}>
                <li
                  style={{ padding: '10px 16px', cursor: 'pointer', color: 'var(--black-2, #333333)', fontSize: '.8125rem' }}
                  onClick={() => {
                    setIsProfileOpen(false);
                    setShowThemeOptions(false);
                    onProfileClick && onProfileClick();
                  }}
                >
                  My Profile
                </li>
                <li
                  style={{ padding: '10px 16px', cursor: 'pointer', color: 'var(--black-2, #333333)', fontSize: '.8125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => setShowThemeOptions((prev) => !prev)}
                >
                  <span>Theme</span>
                  <span style={{ fontSize: '.7rem', color: 'var(--black-3, #595959)' }}>{showThemeOptions ? '▲' : '▼'}</span>
                </li>

                {showThemeOptions && (
                  <li style={{ padding: '0 12px 8px' }}>
                    <div className="theme-picker-grid">
                      {THEME_OPTIONS.map((option) => (
                        <div
                          key={option.key}
                          className={`theme-picker-item ${activeTheme === option.key ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTheme(option.key);
                            try {
                              const email = sessionStorage.getItem('loggedInUserEmail');
                              if (email) {
                                localStorage.setItem(`theme:${email.trim().toLowerCase()}`, option.key);
                              }
                            } catch {
                              // localStorage/sessionStorage unavailable — theme just won't persist across sessions
                            }
                            onThemeChange && onThemeChange(option.key);
                          }}
                        >
                          <span
                            className={`theme-picker-swatch ${option.swatchClass}`}
                            style={{ background: option.key === 'black' ? '#121212' : '#0069aa' }}
                          />
                          <span className="theme-picker-label">{option.label}</span>
                          {activeTheme === option.key && <span className="theme-picker-check">✓</span>}
                        </div>
                      ))}
                    </div>
                  </li>
                )}

                <li
                  style={{ padding: '10px 16px', cursor: 'pointer', color: 'var(--red-1, #ff2546)', fontSize: '.8125rem' }}
                  onClick={() => {
                    setIsProfileOpen(false);
                    setShowThemeOptions(false);
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
  );
};

export default HeaderBar;