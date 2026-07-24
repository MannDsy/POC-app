import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Skill {
  id: number;
  name: string;
}

export default function StartInterviewPage() {
  const navigate = useNavigate();

  // Derive theme the same way Login.tsx does, since this page is a
  // separate top-level route with no connection to homepage.tsx's state.
  const [primaryThemeColor] = useState<string>(() => {
    const loggedInEmail = sessionStorage.getItem("loggedInUserEmail");
    const savedTheme = loggedInEmail
      ? localStorage.getItem(`theme:${loggedInEmail.trim().toLowerCase()}`)
      : localStorage.getItem("lastUsedTheme");
    return savedTheme === "blue" ? "#0069aa" : "#121212";
  });

  // If someone lands on this page without a valid session, send them to Login.
  useEffect(() => {
    const user = sessionStorage.getItem("loggedInUserEmail");
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const [candidateName, setCandidateName] = useState<string>('');
  const [candidateEmail, setCandidateEmail] = useState<string>('');
  const [candidatePhone, setCandidatePhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

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
  const [experienceRange, setExperienceRange] = useState<string>('');

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
  const [primarySkills, setPrimarySkills] = useState<string[]>([]);
  const [primarySearch, setPrimarySearch] = useState<string>('');
  const [isPrimaryDropdownOpen, setIsPrimaryDropdownOpen] = useState<boolean>(false);
  const [primaryCustomInput, setPrimaryCustomInput] = useState<string>('');
  const primaryFieldRef = React.useRef<HTMLDivElement>(null);

  // ---- Secondary Skill (multi-select) ----
  const [secondarySkills, setSecondarySkills] = useState<string[]>([]);
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
    if (trimmed && !primarySkills.includes(trimmed)) {
      setPrimarySkills((prev) => [...prev, trimmed]);
    }
    setPrimaryCustomInput('');
  };

  const addCustomSecondarySkill = () => {
    const trimmed = secondaryCustomInput.trim();
    if (trimmed && !secondarySkills.includes(trimmed)) {
      setSecondarySkills((prev) => [...prev, trimmed]);
    }
    setSecondaryCustomInput('');
  };

  const handleCancel = () => {
    navigate('/home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (primarySkills.length === 0) {
      alert('Please select at least one primary skill.');
      return;
    }

    if (!experienceRange) {
      alert('Please select years of experience.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post('/api/interviews', {
        candidateName,
        candidateEmail,
        candidatePhone: candidatePhone || undefined,
        primarySkills,
        secondarySkills: secondarySkills.length > 0 ? secondarySkills : undefined,
        experienceRange,
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
      setSubmitting(false);
    }
  };

  const filteredPrimarySkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(primarySearch.toLowerCase())
  );

  const filteredSecondarySkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(secondarySearch.toLowerCase())
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

  return (
    /* OUTER SCROLL WRAPPER — creates its own independent scrolling context
       sized to the full viewport height, so long content (or an open
       dropdown) scrolls inside it regardless of any global body/html
       overflow settings elsewhere in this app. */
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        overflowY: 'auto',
        boxSizing: 'border-box',
        padding: '40px 20px 80px',
        background: '#f1f5f9',
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
              onChange={(e) => setCandidateName(e.target.value)}
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
              placeholder="+1 234 567 8900"
              value={candidatePhone}
              onChange={(e) => setCandidatePhone(e.target.value)}
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
                      e.stopPropagation(); // don't toggle the dropdown when removing a chip
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
              disabled={submitting}
              style={{
                flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff', color: '#334155', fontSize: '15px', fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 2, padding: '12px', borderRadius: '8px', border: 'none',
                backgroundColor: primaryThemeColor, color: '#ffffff', fontSize: '15px',
                fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                boxShadow: `0 4px 12px ${primaryThemeColor}33`, transition: 'all 0.3s ease',
              }}
            >
              <span>{submitting ? 'Starting...' : 'Start Interview'}</span>
              {!submitting && <span>→</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}