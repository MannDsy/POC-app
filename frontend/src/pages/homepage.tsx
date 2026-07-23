import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  useEffect(() => {
    const user = sessionStorage.getItem("loggedInUserEmail");
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const loggedInEmail = sessionStorage.getItem("loggedInUserEmail");
  
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (!loggedInEmail) return "black";
    const saved = localStorage.getItem(`theme:${loggedInEmail.trim().toLowerCase()}`);
    return saved === "blue" ? "blue" : "black";
  });

  const themeClass = theme === "blue" ? "custom-theme-blue" : "custom-theme-black";
  
  // Dynamic primary theme color for buttons & highlights based on selected theme
  const primaryThemeColor = theme === "blue" ? "#0069aa" : "#1e293b";
  const lightAccentColor = theme === "blue" ? "#eff6ff" : "#f1f5f9";

  // Interview Modal & Form States
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('');
  const [candidateEmail, setCandidateEmail] = useState<string>('');
  const [candidatePhone, setCandidatePhone] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (selected: ThemeType) => {
    setTheme(selected);
    if (loggedInEmail) {
      localStorage.setItem(`theme:${loggedInEmail.trim().toLowerCase()}`, selected);
    }
    localStorage.setItem("lastUsedTheme", selected);
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showThemeOptions, setShowThemeOptions] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch profile from API
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

  // Lifecycle event listeners
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
    navigate("/login", { replace: true });
  };

  const handleProfileClick = () => {
    setActiveTab('home');
    setIsDropdownOpen(false);
    setShowThemeOptions(false);
  };

  const handleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Interview Initiated:", {
      candidateName,
      candidateEmail,
      candidatePhone,
      selectedPhoto,
    });
    setIsInterviewModalOpen(false);
    setCandidateName('');
    setCandidateEmail('');
    setCandidatePhone('');
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div className={`${themeClass} homepage-centered-message`}>
        <div className="homepage-spinner"></div>
        <span>Loading Workspace Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${themeClass} homepage-centered-message`}>
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
      <div className={`${themeClass} homepage-centered-message`}>
        No active profile context detected.
      </div>
    );
  }

  return (
    <div className={`${themeClass} homepage-layout`}>
      {/* HEADER SECTION */}
      <HeaderBar
        activeTab={activeTab as any}
        userInitials={getInitialsFromEmail(employee.email || loggedInEmail)}
        theme={theme}
        onThemeChange={handleThemeChange}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />

      <div className="homepage-main" style={{ paddingTop: '48px', position: 'relative' }}>
        {/* SIDEBAR NAVBAR */}
        <Navbar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          role={employee.role}
        />

        {/* MAIN WORKSPACE VIEW WITH FLOATING "START INTERVIEW" BUTTON */}
        <main className="homepage-content" style={{ marginLeft: '20px', flex: 1, position: 'relative' }}>
          {/* Absolutely Positioned Button with Dynamic Theme Color */}
          <button
            onClick={() => setIsInterviewModalOpen(true)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '24px',
              zIndex: 10,
              backgroundColor: primaryThemeColor,
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 18px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            }}
          >
            <span>Start Interview</span>
            <span style={{ fontSize: '16px' }}>→</span>
          </button>

          {activeTab === 'home' && <DashboardOverview employee={employee} />}
          {activeTab === 'tasks' && <AssignedTasks />}
          {activeTab === 'timesheet' && <TimesheetTracker />}
          {activeTab === 'directory' && employee.role === 'admin' && <EmployeeDirectory />}
          {activeTab === 'logs' && employee.role === 'admin' && <SystemAccessLogs />}
        </main>
      </div>

      {/* INTERVIEW DETAILS MODAL FORM */}
      {isInterviewModalOpen && (
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
            zIndex: 1100,
          }}
          onClick={() => setIsInterviewModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '520px',
              maxWidth: '92%',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title */}
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
              Interview Details
            </h2>

            {/* Subheading Divider */}
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#334155',
                paddingBottom: '8px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '20px',
              }}
            >
              Candidate Information
            </div>

            <form onSubmit={handleInterviewSubmit}>
              {/* Candidate Name Input */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Candidate Name <span style={{ color: primaryThemeColor }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name of the candidate"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Candidate Email Input */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Candidate Email <span style={{ color: primaryThemeColor }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="candidate@example.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Candidate Phone Input */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Candidate Phone Number <span style={{ color: primaryThemeColor }}>*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 234 567 8900"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Candidate Photo Picker */}
              <div style={{ marginBottom: '28px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Candidate Photo <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedPhoto(e.target.files[0]);
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      backgroundColor: lightAccentColor,
                      color: primaryThemeColor,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Choose File
                  </button>

                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {selectedPhoto ? selectedPhoto.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              {/* Primary Submit Button linked to theme color */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: primaryThemeColor,
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 12px ${primaryThemeColor}33`,
                  transition: 'all 0.3s ease',
                }}
              >
                <span>Start Interview</span>
                <span>→</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}