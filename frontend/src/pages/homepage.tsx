import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../index.css';

// Import Modular View Components
import DashboardOverview, { type EmployeeProfile } from '../components/DashboardOverview';
import AssignedTasks from '../components/AssignedTasks';
import TimesheetTracker from '../components/TimesheetTracker';
import EmployeeDirectory from '../components/EmployeeDirectory';
import SystemAccessLogs from '../components/SystemAccessLogs';
import HeaderBar from '../components/HeaderBar';
import Navbar, { type TabType } from '../components/NavBar';

type ThemeType = 'black' | 'blue';

// Helper to extract uppercase initials from email (e.g. john.doe@company.com -> JD)
const getInitialsFromEmail = (email?: string | null): string => {
  if (!email) return 'U';

  const username = email.split('@')[0];
  if (!username) return 'U';

  const parts = username.split(/[._-]/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return username.slice(0, 2).toUpperCase();
};

export default function HomePage() {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Theme setup
  const loggedInEmail = sessionStorage.getItem("loggedInUserEmail");
  const initialThemeKey = loggedInEmail ? `appTheme_${loggedInEmail}` : "appTheme";

  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem(initialThemeKey) as ThemeType) || "black";
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showThemeOptions, setShowThemeOptions] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Synchronize HTML data-theme attribute with state
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 2. Fetch profile from API
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

  // 3. Load saved theme preferences
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

  // 4. Lifecycle event listeners
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

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUserEmail");
    window.location.replace("/");
  };

  const handleProfileClick = () => {
    setActiveTab('home');
    setIsDropdownOpen(false);
    setShowThemeOptions(false);
  };

  if (loading) {
    return (
      <div className={`theme-${theme} homepage-centered-message`} data-theme={theme}>
        <div className="homepage-spinner"></div>
        <span>Loading Workspace Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`theme-${theme} homepage-centered-message`} data-theme={theme}>
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
      <div className={`theme-${theme} homepage-centered-message`} data-theme={theme}>
        No active profile context detected.
      </div>
    );
  }

  return (
    <div className={`theme-${theme} homepage-layout`} data-theme={theme}>
      {/* HEADER SECTION - HeaderBar renders its own .outerHeaderContainer (fixed, top: 0) */}
      <HeaderBar
        activeTab={activeTab}
        userInitials={getInitialsFromEmail(employee.email || loggedInEmail)}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />

      {/*
        .sidebarouter (rendered by Navbar) is position: fixed, top: 48px, width: 250px (see index.css).
        Since the header and sidebar are both taken out of normal flow, this wrapper only needs to
        push the main content area down/right past them - it doesn't need to be a flex row itself.
      */}
      <div className="homepage-main" style={{ paddingTop: '48px' }}>
        {/* NEW MODULAR SIDEBAR NAVBAR */}
        <Navbar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          role={employee.role}
        />

        {/* MAIN WORKSPACE VIEW */}
        <main className="homepage-content" style={{ marginLeft: '250px' }}>
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