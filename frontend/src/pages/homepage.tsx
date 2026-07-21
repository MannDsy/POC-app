import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../index.css';

// Import Modular View Components
import DashboardOverview, { type EmployeeProfile } from '../components/DashboardOverview';
import AssignedTasks from '../components/AssignedTasks';
import TimesheetTracker from '../components/TimesheetTracker';
import EmployeeDirectory from '../components/EmployeeDirectory';
import SystemAccessLogs from '../components/SystemAccessLogs';

type TabType = 'home' | 'tasks' | 'timesheet' | 'directory' | 'logs';
type ThemeType = 'black' | 'blue';

export default function HomePage() {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Initialize theme based on user-scoped storage key
  const loggedInEmail = sessionStorage.getItem("loggedInUserEmail");
  const initialThemeKey = loggedInEmail ? `appTheme_${loggedInEmail}` : "appTheme";

  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem(initialThemeKey) as ThemeType) || "black";
  });

  // Dropdown & Submenu Visibility State
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showThemeOptions, setShowThemeOptions] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch user profile from API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const activeEmail = sessionStorage.getItem("loggedInUserEmail");

      if (!activeEmail) {
        setError("No active login session found. Please complete authentication.");
        setLoading(false);
        return;
      }

      const response = await axios.get<EmployeeProfile>(
        `http://localhost:5000/api/users/profile?email=${activeEmail}`
      );

      setEmployee(response.data);
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.response?.data?.message || "Failed to establish server profiling.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Load saved theme preferences whenever employee context updates
  useEffect(() => {
    if (employee?.email) {
      const userSavedTheme = localStorage.getItem(`appTheme_${employee.email}`) as ThemeType;
      if (userSavedTheme) {
        setTheme(userSavedTheme);
      } else {
        setTheme("black");
      }
    }
  }, [employee]);

  // 3. Page lifecycle and click-outside listener
  useEffect(() => {
    fetchProfile();

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        fetchProfile();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setShowThemeOptions(false);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handlers
  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUserEmail");
    window.location.replace("/");
  };

  const handleProfileClick = () => {
    setActiveTab('home');
    setIsDropdownOpen(false);
    setShowThemeOptions(false);
  };

  const handleThemeChange = (selectedTheme: ThemeType) => {
    setTheme(selectedTheme);
    
    if (employee?.email) {
      localStorage.setItem(`appTheme_${employee.email}`, selectedTheme);
    } else {
      localStorage.setItem("appTheme", selectedTheme);
    }

    setIsDropdownOpen(false);
    setShowThemeOptions(false);
  };

  if (loading) {
    return (
      <div className={`theme-${theme} homepage-centered-message`}>
        <div className="homepage-spinner"></div>
        <span>Loading Workspace Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`theme-${theme} homepage-centered-message`}>
        <div className="homepage-error-card">
          <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>
            Authentication Error
          </div>
          <div>{error}</div>
          <button className="homepage-return-btn" onClick={handleLogout}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className={`theme-${theme} homepage-centered-message`}>
        No active profile context detected.
      </div>
    );
  }

  return (
    <div className={`theme-${theme} homepage-layout`}>
      {/* HEADER SECTION */}
      <header className="homepage-header">
        <div className="homepage-logo">
          <span className="homepage-logo-accent">eInfochips</span> Portal
        </div>

        <div className="homepage-user-info">
          {/* User Role Badge */}
          <span
            className={`homepage-badge ${
              employee.role === 'admin' ? 'homepage-badge-admin' : 'homepage-badge-user'
            }`}
          >
            {employee.role === 'admin' ? 'Admin Profile' : 'Standard User'}
          </span>

          {/* User Name Dropdown Trigger */}
          <div className="homepage-user-menu" ref={dropdownRef}>
            <div
              className="homepage-user-trigger"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setShowThemeOptions(false);
              }}
            >
              <span className="homepage-user-name">
                Welcome, <strong>{employee.name}</strong>
              </span>
              <span className={`homepage-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                ▼
              </span>
            </div>

            {/* Header Dropdown Menu */}
            {isDropdownOpen && (
              <ul className="homepage-dropdown-menu">
                <li className="homepage-dropdown-item" onClick={handleProfileClick}>
                  👤 Profile
                </li>

                {/* Theme Switcher Toggle */}
                <li
                  className="homepage-dropdown-item"
                  onClick={() => setShowThemeOptions(!showThemeOptions)}
                  style={{ justifyContent: 'space-between' }}
                >
                  <span>🎨 Theme</span>
                  <span style={{ fontSize: '0.7rem' }}>{showThemeOptions ? '▲' : '▼'}</span>
                </li>

                {/* Submenu Theme Items */}
                {showThemeOptions && (
                  <>
                    <li
                      className={`homepage-dropdown-subitem ${theme === 'black' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('black')}
                    >
                      <span>⚫ Dark Black</span>
                      {theme === 'black' && <span>✓</span>}
                    </li>
                    <li
                      className={`homepage-dropdown-subitem ${theme === 'blue' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('blue')}
                    >
                      <span>🔵 Classic Blue</span>
                      {theme === 'blue' && <span>✓</span>}
                    </li>
                  </>
                )}

                <li className="homepage-dropdown-divider" />
                
                <li
                  className="homepage-dropdown-item homepage-dropdown-logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      <div className="homepage-main">
        {/* SIDEBAR NAVIGATION */}
        <aside className="homepage-sidebar">
          <nav>
            <ul className="homepage-menu-list">
              <li className="homepage-menu-title">GENERAL MODULES</li>
              
              <li
                className={`homepage-menu-item ${activeTab === 'home' ? 'homepage-menu-item-active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                🏠 Home Workspace
              </li>

              <li
                className={`homepage-menu-item ${activeTab === 'tasks' ? 'homepage-menu-item-active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                📁 My Assigned Tasks
              </li>

              <li
                className={`homepage-menu-item ${activeTab === 'timesheet' ? 'homepage-menu-item-active' : ''}`}
                onClick={() => setActiveTab('timesheet')}
              >
                🕒 Timesheet Tracker
              </li>

              {employee.role === 'admin' && (
                <>
                  <li className="homepage-menu-title homepage-menu-title-admin">
                    ADMIN MANAGEMENT
                  </li>
                  <li
                    className={`homepage-menu-item ${activeTab === 'directory' ? 'homepage-menu-item-active' : ''}`}
                    onClick={() => setActiveTab('directory')}
                  >
                    👥 Employee Directory
                  </li>
                  <li
                    className={`homepage-menu-item ${activeTab === 'logs' ? 'homepage-menu-item-active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                  >
                    🔑 System Access Logs
                  </li>
                </>
              )}
            </ul>
          </nav>
        </aside>

        {/* MAIN WORKSPACE VIEW */}
        <main className="homepage-content">
          {activeTab === 'home' && <DashboardOverview employee={employee} />}
          {activeTab === 'tasks' && <AssignedTasks />}
          {activeTab === 'timesheet' && <TimesheetTracker />}
          {activeTab === 'directory' && employee.role === 'admin' && <EmployeeDirectory />}
          {activeTab === 'logs' && employee.role === 'admin' && <SystemAccessLogs />}
        </main>
      </div>
    </div>
  );
}