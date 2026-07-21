import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';

interface EmployeeProfile {
  id: number;
  gid: string;
  name: string;
  email: string;
  role: 'admin' | 'normal_user';
}

export default function HomePage() {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retrieve the email typed during login from storage
        const loggedInEmail = sessionStorage.getItem("loggedInUserEmail");

        // Safety check: If no email exists in storage
        if (!loggedInEmail) {
          setError("No active login session found. Please complete the OTP authentication.");
          setLoading(false);
          return;
        }

        // Pass the dynamic email into your API route
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

    fetchProfile();
  }, []);

  // Handle logout by clearing session storage
  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUserEmail");
    window.location.href = "/"; // Redirect back to landing/login page
  };

  if (loading) {
    return (
      <div className="custom-theme-black" style={styles.centeredMessage}>
        <div style={styles.spinner}></div>
        <span>Loading Workspace Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="custom-theme-black" style={styles.centeredMessage}>
        <div style={styles.errorCard}>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>
            Authentication Error
          </div>
          <div>{error}</div>
          <button style={styles.returnBtn} onClick={handleLogout}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="custom-theme-black" style={styles.centeredMessage}>
        No active profile context detected.
      </div>
    );
  }

  return (
    <div className="custom-theme-black" style={styles.layoutContainer}>
      {/* HEADER SECTION */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={{ color: 'var(--blue-2, #007fcd)' }}>eInfochips</span> Portal
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>
            Welcome, <strong>{employee.name}</strong>
          </span>
          <span
            style={{
              ...styles.badge,
              backgroundColor:
                employee.role === 'admin'
                  ? 'var(--red-1, #ff2546)'
                  : 'var(--blue-2, #007fcd)',
            }}
          >
            {employee.role === 'admin' ? 'Admin Profile' : 'Standard User'}
          </span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.mainContainer}>
        {/* LEFT SIDE NAVIGATION MENU */}
        <aside style={styles.sidebar}>
          <nav>
            <ul style={styles.menuList}>
              <li style={styles.menuTitle}>GENERAL MODULES</li>
              <li style={{ ...styles.menuItem, ...styles.menuItemActive }}>
                🏠 Home Workspace
              </li>
              <li style={styles.menuItem}>📁 My Assigned Tasks</li>
              <li style={styles.menuItem}>🕒 Timesheet Tracker</li>

              {/* Conditional Administrative Items */}
              {employee.role === 'admin' && (
                <>
                  <li style={{ ...styles.menuTitle, ...styles.adminTitle }}>
                    ADMIN MANAGEMENT
                  </li>
                  <li style={{ ...styles.menuItem, ...styles.adminItem }}>
                    👥 Employee Directory
                  </li>
                  <li style={{ ...styles.menuItem, ...styles.adminItem }}>
                    🔑 System Access Logs
                  </li>
                </>
              )}
            </ul>
          </nav>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main style={styles.contentArea}>
          <div style={styles.pageHeader}>
            <h2 style={styles.pageTitle}>Dashboard Overview</h2>
            <p style={styles.pageSubtitle}>
              Manage your daily activities and profile details from here.
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Identity Reference</h3>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Corporate GID:</span>
              <span style={styles.infoValue}>{employee.gid}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Routing Email:</span>
              <span style={styles.infoValue}>{employee.email}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Access Role:</span>
              <span style={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                {employee.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Modernized Theme-Aware Layout Styling
const styles: { [key: string]: React.CSSProperties } = {
  layoutContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--white-8, #F5F5F5)',
    overflow: 'hidden',
    fontFamily: "'Poppins', sans-serif",
  },
  header: {
    height: '64px',
    backgroundColor: 'var(--navbar-bg, #0D0D0D)',
    color: 'var(--white-1, #ffffff)',
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
    zIndex: 10,
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: '600',
    letterSpacing: '-0.3px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    fontSize: '0.9rem',
    color: 'var(--white-7, #EBEBEB)',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: 'var(--red-1, #ff2546)',
    border: '1px solid var(--red-1, #ff2546)',
    padding: '6px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  mainContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--white-1, #ffffff)',
    borderRight: '1px solid var(--mui-divider, #EBEBEB)',
    padding: '20px 0',
  },
  menuList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  menuTitle: {
    padding: '12px 24px 6px 24px',
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--black-3, #595959)',
    letterSpacing: '1px',
  },
  adminTitle: {
    color: 'var(--red-1, #ff2546)',
    marginTop: '16px',
    borderTop: '1px solid var(--mui-divider, #EBEBEB)',
    paddingTop: '20px',
  },
  menuItem: {
    padding: '12px 24px',
    color: 'var(--black-2, #333333)',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: 400,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background 0.2s ease',
  },
  menuItemActive: {
    backgroundColor: 'var(--white-6, #FAFAFA)',
    color: 'var(--blue-2, #007fcd)',
    fontWeight: 600,
    borderLeft: '4px solid var(--blue-2, #007fcd)',
  },
  adminItem: {
    color: 'var(--black-2, #333333)',
  },
  contentArea: {
    flex: 1,
    padding: '36px 48px',
    backgroundColor: 'var(--white-8, #F5F5F5)',
    overflowY: 'auto',
  },
  pageHeader: {
    marginBottom: '24px',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--black-2, #333333)',
  },
  pageSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '0.875rem',
    color: 'var(--black-3, #595959)',
  },
  card: {
    backgroundColor: 'var(--white-1, #ffffff)',
    padding: '28px',
    borderRadius: '12px',
    border: '1px solid var(--mui-divider, #EBEBEB)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
    maxWidth: '600px',
  },
  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--black-2, #333333)',
    borderBottom: '1px solid var(--mui-divider, #EBEBEB)',
    paddingBottom: '12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px dashed var(--mui-divider, #EBEBEB)',
    fontSize: '0.9rem',
  },
  infoLabel: {
    color: 'var(--black-3, #595959)',
    fontWeight: 500,
  },
  infoValue: {
    color: 'var(--black-2, #333333)',
    fontWeight: 600,
  },
  centeredMessage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1rem',
    color: 'var(--black-3, #595959)',
    backgroundColor: 'var(--white-8, #F5F5F5)',
    gap: '12px',
  },
  errorCard: {
    backgroundColor: 'var(--status-blocked, #ffe7e7)',
    color: 'var(--red-1, #ff2546)',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid var(--red-4, #ff9cb3)',
    textAlign: 'center',
    maxWidth: '400px',
  },
  returnBtn: {
    marginTop: '16px',
    backgroundColor: 'var(--red-1, #ff2546)',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid var(--mui-divider, #EBEBEB)',
    borderTop: '3px solid var(--blue-2, #007fcd)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};