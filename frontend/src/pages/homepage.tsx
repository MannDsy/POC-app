import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';

// Import Modular Components
import DashboardOverview from '../components/DashboardOverview';
import type { EmployeeProfile } from '../components/DashboardOverview';
import AssignedTasks from '../components/AssignedTasks';
import TimesheetTracker from '../components/TimesheetTracker';
import EmployeeDirectory from '../components/EmployeeDirectory';
import SystemAccessLogs from '../components/SystemAccessLogs';

type TabType = 'home' | 'tasks' | 'timesheet' | 'directory' | 'logs';

export default function HomePage() {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const loggedInEmail = sessionStorage.getItem("loggedInUserEmail");

      if (!loggedInEmail) {
        setError("No active login session found. Please complete authentication.");
        setLoading(false);
        return;
      }

      const response = await axios.get<EmployeeProfile>(
        `http://localhost:5000/api/users/profile?email=${loggedInEmail}`
      );

      setEmployee(response.data);
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.response?.data?.message || "Failed to establish server profiling.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        fetchProfile();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUserEmail");
    window.location.replace("/");
  };

  if (loading) {
    return (
      <div className="custom-theme-black homepage-centered-message">
        <div className="homepage-spinner"></div>
        <span>Loading Workspace Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="custom-theme-black homepage-centered-message">
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
      <div className="custom-theme-black homepage-centered-message">
        No active profile context detected.
      </div>
    );
  }

  return (
    <div className="custom-theme-black homepage-layout">
      {/* HEADER SECTION */}
      <header className="homepage-header">
        <div className="homepage-logo">
          <span className="homepage-logo-accent">eInfochips</span> Portal
        </div>
        <div className="homepage-user-info">
          <span className="homepage-user-name">
            Welcome, <strong>{employee.name}</strong>
          </span>
          <span
            className={`homepage-badge ${
              employee.role === 'admin' ? 'homepage-badge-admin' : 'homepage-badge-user'
            }`}
          >
            {employee.role === 'admin' ? 'Admin Profile' : 'Standard User'}
          </span>
          <button className="homepage-logout-btn" onClick={handleLogout}>
            Logout
          </button>
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

        {/* MAIN CONTENT WORKSPACE */}
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