import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';

import HeaderBar from '../components/HeaderBar';
import Navbar, { type TabType } from '../components/NavBar';

type ThemeType = 'black' | 'blue';
type QuestionType = 'default' | 'custom';

interface EmployeeProfile {
  id: number;
  gid: string;
  name: string;
  email: string;
  role: 'admin' | 'normal_user';
}

// Data handed off from StartInterview.tsx via navigate(..., { state })
interface CandidateDraft {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  primarySkills: string[];
  secondarySkills?: string[];
  experienceRange: string;
}

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

export default function SelectQuestionTypePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInEmail = sessionStorage.getItem('loggedInUserEmail');

  const candidate = (location.state as CandidateDraft | null) ?? null;

  // Guard: this page only makes sense as a continuation of the
  // "Start Interview" form. If someone lands here directly (refresh,
  // back button, typed URL), send them back to fill the form in first.
  useEffect(() => {
    if (!loggedInEmail) {
      navigate('/login', { replace: true });
      return;
    }
    if (!candidate) {
      navigate('/interview/new', { replace: true });
    }
  }, [candidate, loggedInEmail, navigate]);

  // ---- Employee profile (HeaderBar initials + Navbar role gating) ----
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        if (!loggedInEmail) {
          setProfileLoading(false);
          return;
        }
        const response = await axios.get<EmployeeProfile>(
          `http://localhost:5000/api/users/profile?email=${loggedInEmail}`
        );
        setEmployee(response.data);
      } catch (err: any) {
        console.error('Profile fetch error:', err);
        setProfileError(err.response?.data?.message || 'Failed to establish server profiling.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [loggedInEmail]);

  // ---- Theme, same per-user localStorage key used across the app ----
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (!loggedInEmail) return 'black';
    const saved = localStorage.getItem(`theme:${loggedInEmail.trim().toLowerCase()}`);
    return saved === 'blue' ? 'blue' : 'black';
  });

  const themeClass = theme === 'blue' ? 'custom-theme-blue' : 'custom-theme-black';
  const primaryThemeColor = theme === 'blue' ? '#0069aa' : '#121212';

  const handleThemeChange = (selected: ThemeType) => {
    setTheme(selected);
    if (loggedInEmail) {
      localStorage.setItem(`theme:${loggedInEmail.trim().toLowerCase()}`, selected);
    }
    localStorage.setItem('lastUsedTheme', selected);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUserEmail');
    navigate('/login', { replace: true });
  };

  const handleProfileClick = () => {
    navigate('/home', { state: { tab: 'home' } });
  };

  const handleTabChange = (tab: TabType) => {
    navigate('/home', { state: { tab } });
  };

  // ---- Creating the interview record once a question type is chosen ----
  const [creating, setCreating] = useState<QuestionType | null>(null);

  const handleSelectQuestionType = async (questionType: QuestionType) => {
    if (!candidate) return;

    try {
      setCreating(questionType);

      const response = await api.post('/api/interviews', {
        candidateName: candidate.candidateName,
        candidateEmail: candidate.candidateEmail,
        candidatePhone: candidate.candidatePhone,
        primarySkills: candidate.primarySkills,
        secondarySkills: candidate.secondarySkills,
        experienceRange: candidate.experienceRange,
        questionType,
      });

      if (response.data.success) {
        navigate('/home');
      }
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        'Failed to start interview. Please try again.'
      );
    } finally {
      setCreating(null);
    }
  };

  if (profileLoading) {
    return (
      <div className={`${themeClass} homepage-centered-message`}>
        <div className="homepage-spinner"></div>
        <span>Loading Workspace Dashboard...</span>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className={`${themeClass} homepage-centered-message`}>
        <div className="homepage-error-card">
          <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>
            Authentication Error
          </div>
          <div>{profileError}</div>
          <button className="homepage-return-btn" onClick={handleLogout}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!candidate) {
    // useEffect above is already redirecting; render nothing meanwhile.
    return null;
  }

  const optionCardStyle = (disabled: boolean): React.CSSProperties => ({
    flex: 1,
    textAlign: 'left',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  });

  return (
    <div className={`${themeClass} homepage-layout`}>
      {/* HEADER SECTION */}
      <HeaderBar
        activeTab={'home' as any}
        userInitials={getInitialsFromEmail(employee?.email || loggedInEmail)}
        theme={theme}
        onThemeChange={handleThemeChange}
        onTabChange={(tab) => handleTabChange(tab as TabType)}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />

      <div className="homepage-main" style={{ paddingTop: '48px', position: 'relative' }}>
        {/* SIDEBAR NAVBAR */}
        <Navbar activeTab={'home'} onTabChange={handleTabChange} role={employee?.role} />

        {/* MAIN WORKSPACE VIEW */}
        <main className="homepage-content" style={{ marginLeft: '20px', flex: 1, position: 'relative' }}>
          <div
            style={{
              minHeight: 'calc(100vh - 48px)',
              boxSizing: 'border-box',
              padding: '20px 0 60px',
            }}
          >
            <div
              style={{
                maxWidth: '720px',
                margin: '0 auto',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>
                Interview Questions
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b' }}>
                Choose how questions should be prepared for{' '}
                <strong style={{ color: '#334155' }}>{candidate.candidateName}</strong>'s interview.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {/* Default Questions */}
                <button
                  type="button"
                  onClick={() => handleSelectQuestionType('default')}
                  disabled={creating !== null}
                  style={optionCardStyle(creating !== null)}
                >
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Use Default Questions
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                    Automatically pull a standard question set based on the candidate's selected
                    primary and secondary skills.
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 600, color: primaryThemeColor }}>
                    {creating === 'default' ? 'Starting interview...' : 'Continue with default →'}
                  </div>
                </button>

                {/* Custom Questions */}
                <button
                  type="button"
                  onClick={() => handleSelectQuestionType('custom')}
                  disabled={creating !== null}
                  style={optionCardStyle(creating !== null)}
                >
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Use Custom Questions
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                    Start the interview and add your own questions instead of the default set.
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 600, color: primaryThemeColor }}>
                    {creating === 'custom' ? 'Starting interview...' : 'Continue with custom →'}
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('/interview/new', { state: candidate })}
                disabled={creating !== null}
                style={{
                  marginTop: '24px',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '13px',
                  cursor: creating !== null ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                ← Back to candidate details
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}