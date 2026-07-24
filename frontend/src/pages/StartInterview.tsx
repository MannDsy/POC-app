import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';

import HeaderBar from '../components/HeaderBar';
import Navbar, { type TabType } from '../components/NavBar';

interface Skill {
  id: number;
  name: string;
}

type ThemeType = 'black' | 'blue';

interface EmployeeProfile {
  id: number;
  gid: string;
  name: string;
  email: string;
  role: 'admin' | 'normal_user';
}

// Helper to extract uppercase initials from email (mirrors homepage.tsx)
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

export default function StartInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInEmail = sessionStorage.getItem('loggedInUserEmail');

  // If we were sent back here from the question-type step, prefill the form
  // instead of making the interviewer retype everything.
  const draft = location.state as {
    candidateName?: string;
    candidateEmail?: string;
    candidatePhone?: string;
    primarySkills?: string[];
    secondarySkills?: string[];
    experienceRange?: string;
  } | null;

  // If someone lands on this page without a valid session, send them to Login.
  useEffect(() => {
    if (!loggedInEmail) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // ---- Employee profile (needed for HeaderBar initials + Navbar role gating) ----
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

  // ---- Theme, kept in sync with the same per-user localStorage key homepage.tsx uses ----
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

  // ---- Header dropdown handlers ----
  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUserEmail');
    navigate('/login', { replace: true });
  };

  const handleProfileClick = () => {
    // Profile lives on the Home page's Overview tab
    navigate('/home', { state: { tab: 'home' } });
  };

  // ---- Sidebar tab navigation: this page has no tabs of its own, so any
  // tab click sends the user back to /home and asks it to open that tab. ----
  const handleTabChange = (tab: TabType) => {
    navigate('/home', { state: { tab } });
  };

  const [candidateName, setCandidateName] = useState<string>(draft?.candidateName ?? '');
  const [candidateEmail, setCandidateEmail] = useState<string>(draft?.candidateEmail ?? '');
  const [candidatePhone, setCandidatePhone] = useState<string>(draft?.candidatePhone ?? '');

  // ---- Skills, fetched from the skills table via /api/skills ----
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState<boolean>(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setSkillsLoading(true);
        const response = await api.get('/api/skills');
        if (response.data.success) {
          setSkills(response.data.skills);
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
        setSkillsError('Failed to load skill list. Please refresh the page.');
      } finally {
        setSkillsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // ---- Years of Experience, fetched from /api/experience-ranges ----
  const [experienceRanges, setExperienceRanges] = useState<{ id: number; label: string }[]>([]);
  const [experienceLoading, setExperienceLoading] = useState<boolean>(true);
  const [experienceRange, setExperienceRange] = useState<string>(draft?.experienceRange ?? '');

  useEffect(() => {
    const fetchExperienceRanges = async () => {
      try {
        setExperienceLoading(true);
        const response = await api.get('/api/experience-ranges');
        if (response.data.success) {
          setExperienceRanges(response.data.experienceRanges);
        }
      } catch (err) {
        console.error('Failed to load experience ranges:', err);
      } finally {
        setExperienceLoading(false);
      }
    };
    fetchExperienceRanges();
  }, []);

  // ---- Primary Skill (multi-select) ----
  const [primarySkills, setPrimarySkills] = useState<string[]>(draft?.primarySkills ?? []);
  const [primarySearch, setPrimarySearch] = useState<string>('');
  const [isPrimaryDropdownOpen, setIsPrimaryDropdownOpen] = useState<boolean>(false);
  const [primaryCustomInput, setPrimaryCustomInput] = useState<string>('');
  const primaryFieldRef = React.useRef<HTMLDivElement>(null);

  // ---- Secondary Skill (multi-select) ----
  const [secondarySkills, setSecondarySkills] = useState<string[]>(draft?.secondarySkills ?? []);
  const [secondarySearch, setSecondarySearch] = useState<string>('');
  const [isSecondaryDropdownOpen, setIsSecondaryDropdownOpen] = useState<boolean>(false);
  const [secondaryCustomInput, setSecondaryCustomInput] = useState<string>('');
  const secondaryFieldRef = React.useRef<HTMLDivElement>(null);

  // Click-outside-to-close for both dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (primaryFieldRef.current && !primaryFieldRef.current.contains(event.target as Node)) {
        setIsPrimaryDropdownOpen(false);
      }
      if (secondaryFieldRef.current && !secondaryFieldRef.current.contains(event.target as Node)) {
        setIsSecondaryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePrimarySkill = (name: string) => {
    setPrimarySkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const toggleSecondarySkill = (name: string) => {
    setSecondarySkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const addCustomPrimarySkill = () => {
    const trimmed = primaryCustomInput.trim();
    const alreadyInSecondary = secondarySkills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyInSecondary) {
      alert(`"${trimmed}" is already selected as a secondary skill. A skill can only be selected once.`);
      return;
    }

    if (trimmed && !primarySkills.includes(trimmed)) {
      setPrimarySkills((prev) => [...prev, trimmed]);
    }
    setPrimaryCustomInput('');
  };

  const addCustomSecondarySkill = () => {
    const trimmed = secondaryCustomInput.trim();
    const alreadyInPrimary = primarySkills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyInPrimary) {
      alert(`"${trimmed}" is already selected as a primary skill. A skill can only be selected once.`);
      return;
    }

    if (trimmed && !secondarySkills.includes(trimmed)) {
      setSecondarySkills((prev) => [...prev, trimmed]);
    }
    setSecondaryCustomInput('');
  };

  const handleCancel = () => {
    navigate('/home');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[A-Za-z\s]+$/.test(candidateName.trim())) {
      alert('Candidate name should only contain alphabets and spaces.');
      return;
    }

    if (candidatePhone && !/^\d{10}$/.test(candidatePhone)) {
      alert('Candidate phone number must be exactly 10 digits.');
      return;
    }

    if (primarySkills.length === 0) {
      alert('Please select at least one primary skill.');
      return;
    }

    if (!experienceRange) {
      alert('Please select years of experience.');
      return;
    }

    // Candidate details are collected here; the interview record itself
    // isn't created until the next page, where the interviewer picks
    // default vs. custom questions.
    navigate('/interview/questions', {
      state: {
        candidateName,
        candidateEmail,
        candidatePhone: candidatePhone || undefined,
        primarySkills,
        secondarySkills: secondarySkills.length > 0 ? secondarySkills : undefined,
        experienceRange,
      },
    });
  };

  // A skill selected as Primary can't also show up as a Secondary option,
  // and vice versa — each skill may only be picked once, in one field.
  const filteredPrimarySkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(primarySearch.toLowerCase()) &&
      !secondarySkills.includes(skill.name)
  );

  const filteredSecondarySkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(secondarySearch.toLowerCase()) &&
      !primarySkills.includes(skill.name)
  );

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#eef2ff',
    color: '#334155',
    border: '1px solid #c7d2fe',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '13px',
    fontWeight: 500,
  };

  const chipRemoveStyle: React.CSSProperties = {
    cursor: 'pointer',
    fontWeight: 700,
    color: '#64748b',
    lineHeight: 1,
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
        <Navbar
          activeTab={'home'}
          onTabChange={handleTabChange}
          role={employee?.role}
        />

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
                maxWidth: '640px',
                margin: '0 auto',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '32px 32px 40px 32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              {/* Page Title */}
              <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>
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

              {/* Scrollbar styling for the skill dropdowns */}
              <style>{`
                .dropdown-scroll::-webkit-scrollbar {
                  width: 6px;
                }
                .dropdown-scroll::-webkit-scrollbar-thumb {
                  background-color: #cbd5e1;
                  border-radius: 4px;
                }
              `}</style>

              {skillsError && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                  {skillsError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Candidate Name Input */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Candidate Name <span style={{ color: primaryThemeColor }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name of the candidate"
                    value={candidateName}
                    onChange={(e) => {
                      // Only letters and spaces allowed — strips numbers/symbols as they type
                      const lettersOnly = e.target.value.replace(/[^A-Za-z\s]/g, '');
                      setCandidateName(lettersOnly);
                    }}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Candidate Email Input */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Candidate Email <span style={{ color: primaryThemeColor }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="candidate@example.com"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Candidate Phone Input (Optional) */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Candidate Phone Number <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit phone number"
                    value={candidatePhone}
                    maxLength={10}
                    onChange={(e) => {
                      // Digits only, capped at 10 characters as they type
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      setCandidatePhone(digitsOnly);
                    }}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* PRIMARY SKILLS — MULTI-SELECT */}
                <div style={{ marginBottom: '18px', position: 'relative' }} ref={primaryFieldRef}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Primary Skill(s) <span style={{ color: primaryThemeColor }}>*</span>
                    <span style={{ color: '#94a3b8', fontWeight: 400 }}> — select one or more</span>
                  </label>

                  {/* Trigger box — selected skill chips render INSIDE this box */}
                  <div
                    onClick={() => {
                      setIsPrimaryDropdownOpen(!isPrimaryDropdownOpen);
                      setIsSecondaryDropdownOpen(false);
                    }}
                    style={{
                      width: '100%', minHeight: '44px', padding: '8px 14px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', fontSize: '14px',
                      backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex',
                      flexWrap: 'wrap', gap: '6px', alignItems: 'center',
                      justifyContent: primarySkills.length ? 'flex-start' : 'space-between',
                      boxSizing: 'border-box',
                    }}
                  >
                    {primarySkills.length === 0 && (
                      <span style={{ color: '#94a3b8' }}>
                        {skillsLoading ? 'Loading skills...' : 'Select primary skill(s)'}
                      </span>
                    )}

                    {primarySkills.map((name) => (
                      <span key={name} style={chipStyle}>
                        {name}
                        <span
                          style={chipRemoveStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePrimarySkill(name);
                          }}
                        >
                          ×
                        </span>
                      </span>
                    ))}

                    <span style={{ fontSize: '10px', color: '#64748b', marginLeft: 'auto', paddingLeft: '6px' }}>
                      {isPrimaryDropdownOpen ? '▲' : '▼'}
                    </span>
                  </div>

                  {isPrimaryDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, marginTop: '4px', padding: '8px',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Search technology..."
                        value={primarySearch}
                        onChange={(e) => setPrimarySearch(e.target.value)}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: '6px',
                          border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '6px',
                          outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                      <div className="dropdown-scroll" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredPrimarySkills.map((skill) => {
                          const checked = primarySkills.includes(skill.name);
                          return (
                            <div
                              key={skill.id}
                              onClick={() => togglePrimarySkill(skill.name)}
                              style={{
                                padding: '8px 10px', fontSize: '14px', cursor: 'pointer',
                                borderRadius: '4px', color: '#334155', display: 'flex',
                                alignItems: 'center', gap: '10px',
                                backgroundColor: checked ? '#f1f5f9' : 'transparent',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = checked ? '#f1f5f9' : 'transparent')}
                            >
                              <input type="checkbox" checked={checked} readOnly style={{ pointerEvents: 'none' }} />
                              {skill.name}
                            </div>
                          );
                        })}
                        {!skillsLoading && filteredPrimarySkills.length === 0 && (
                          <div style={{ padding: '8px', fontSize: '13px', color: '#94a3b8' }}>No skills matched</div>
                        )}
                      </div>

                      {/* Add a custom skill not in the list */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                        <input
                          type="text"
                          placeholder="Add a custom skill..."
                          value={primaryCustomInput}
                          onChange={(e) => setPrimaryCustomInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomPrimarySkill();
                            }
                          }}
                          style={{
                            flex: 1, padding: '8px 10px', borderRadius: '6px',
                            border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                          }}
                        />
                        <button
                          type="button"
                          onClick={addCustomPrimarySkill}
                          style={{
                            padding: '8px 12px', borderRadius: '6px', border: 'none',
                            backgroundColor: primaryThemeColor, color: '#fff', fontSize: '13px',
                            fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECONDARY SKILLS — MULTI-SELECT */}
                <div style={{ marginBottom: '28px', position: 'relative' }} ref={secondaryFieldRef}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Secondary Skill(s) <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional, select one or more)</span>
                  </label>

                  <div
                    onClick={() => {
                      setIsSecondaryDropdownOpen(!isSecondaryDropdownOpen);
                      setIsPrimaryDropdownOpen(false);
                    }}
                    style={{
                      width: '100%', minHeight: '44px', padding: '8px 14px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', fontSize: '14px',
                      backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex',
                      flexWrap: 'wrap', gap: '6px', alignItems: 'center',
                      justifyContent: secondarySkills.length ? 'flex-start' : 'space-between',
                      boxSizing: 'border-box',
                    }}
                  >
                    {secondarySkills.length === 0 && (
                      <span style={{ color: '#94a3b8' }}>
                        {skillsLoading ? 'Loading skills...' : 'Select secondary skill(s)'}
                      </span>
                    )}

                    {secondarySkills.map((name) => (
                      <span key={name} style={chipStyle}>
                        {name}
                        <span
                          style={chipRemoveStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSecondarySkill(name);
                          }}
                        >
                          ×
                        </span>
                      </span>
                    ))}

                    <span style={{ fontSize: '10px', color: '#64748b', marginLeft: 'auto', paddingLeft: '6px' }}>
                      {isSecondaryDropdownOpen ? '▲' : '▼'}
                    </span>
                  </div>

                  {isSecondaryDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, marginTop: '4px', padding: '8px',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Search technology..."
                        value={secondarySearch}
                        onChange={(e) => setSecondarySearch(e.target.value)}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: '6px',
                          border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '6px',
                          outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                      <div className="dropdown-scroll" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredSecondarySkills.map((skill) => {
                          const checked = secondarySkills.includes(skill.name);
                          return (
                            <div
                              key={skill.id}
                              onClick={() => toggleSecondarySkill(skill.name)}
                              style={{
                                padding: '8px 10px', fontSize: '14px', cursor: 'pointer',
                                borderRadius: '4px', color: '#334155', display: 'flex',
                                alignItems: 'center', gap: '10px',
                                backgroundColor: checked ? '#f1f5f9' : 'transparent',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = checked ? '#f1f5f9' : 'transparent')}
                            >
                              <input type="checkbox" checked={checked} readOnly style={{ pointerEvents: 'none' }} />
                              {skill.name}
                            </div>
                          );
                        })}
                        {!skillsLoading && filteredSecondarySkills.length === 0 && (
                          <div style={{ padding: '8px', fontSize: '13px', color: '#94a3b8' }}>No skills matched</div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                        <input
                          type="text"
                          placeholder="Add a custom skill..."
                          value={secondaryCustomInput}
                          onChange={(e) => setSecondaryCustomInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomSecondarySkill();
                            }
                          }}
                          style={{
                            flex: 1, padding: '8px 10px', borderRadius: '6px',
                            border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                          }}
                        />
                        <button
                          type="button"
                          onClick={addCustomSecondarySkill}
                          style={{
                            padding: '8px 12px', borderRadius: '6px', border: 'none',
                            backgroundColor: primaryThemeColor, color: '#fff', fontSize: '13px',
                            fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* YEARS OF EXPERIENCE — SINGLE SELECT */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                    Years of Experience <span style={{ color: primaryThemeColor }}>*</span>
                  </label>

                  {experienceLoading ? (
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Loading options...</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {experienceRanges.map((range) => {
                        const selected = experienceRange === range.label;
                        return (
                          <button
                            key={range.id}
                            type="button"
                            onClick={() => setExperienceRange(range.label)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '999px',
                              border: selected ? `1px solid ${primaryThemeColor}` : '1px solid #cbd5e1',
                              backgroundColor: selected ? primaryThemeColor : '#ffffff',
                              color: selected ? '#ffffff' : '#334155',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {range.label} {range.label !== 'More than 15' ? 'yrs' : ''}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons: Cancel + Submit side by side */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff', color: '#334155', fontSize: '15px', fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      flex: 2, padding: '12px', borderRadius: '8px', border: 'none',
                      backgroundColor: primaryThemeColor, color: '#ffffff', fontSize: '15px',
                      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                      boxShadow: `0 4px 12px ${primaryThemeColor}33`, transition: 'all 0.3s ease',
                    }}
                  >
                    <span>Continue</span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}