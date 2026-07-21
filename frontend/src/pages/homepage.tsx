import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

        // DYNAMIC CHANGE: Retrieve the email typed during login from storage
        const loggedInEmail = sessionStorage.getItem("loggedInUserEmail");

        // Safety check: If no email exists in storage, stop and throw an error
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

  // Handle logout by clearing the session storage
  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUserEmail");
    window.location.href = "/"; // Redirect back to landing/login page
  };

  if (loading) return <div style={styles.centeredMessage}>Loading Corporate Dashboard...</div>;
  if (error) return <div style={{ ...styles.centeredMessage, color: '#ef4444' }}>Error: {error}</div>;
  if (!employee) return <div style={styles.centeredMessage}>No active profile context detected.</div>;

  return (
    <div style={styles.layoutContainer}>
      {/* HEADER SECTION */}
      <header style={styles.header}>
        <div style={styles.logo}>eInfochips Portal</div>
        <div style={styles.userInfo}>
          <span>Welcome, <strong>{employee.name}</strong></span>
          <span style={{
            ...styles.badge,
            backgroundColor: employee.role === 'admin' ? '#ef4444' : '#3b82f6'
          }}>
            {employee.role === 'admin' ? 'Admin Profile' : 'Standard User'}
          </span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.mainContainer}>
        {/* LEFT SIDE MENU SECTION */}
        <aside style={styles.sidebar}>
          <nav>
            <ul style={styles.menuList}>
              <li style={styles.menuTitle}>GENERAL MODULES</li>
              <li style={styles.menuItem}>🏠 Home Workspace</li>
              <li style={styles.menuItem}>📁 My Assigned Tasks</li>
              <li style={styles.menuItem}>🕒 Timesheet Tracker</li>

              {/* Conditional Administrative Items */}
              {employee.role === 'admin' && (
                <>
                  <li style={{ ...styles.menuTitle, ...styles.adminTitle }}>ADMIN MANAGEMENT</li>
                  <li style={{ ...styles.menuItem, ...styles.adminItem }}>👥 Employee Controls Directory</li>
                  <li style={{ ...styles.menuItem, ...styles.adminItem }}>🔑 System Access Logs</li>
                </>
              )}
            </ul>
          </nav>
        </aside>

        {/* MAIN WORKSPACE CONTAINER */}
        <main style={styles.contentArea}>
          <h2>Dashboard Panel Overview</h2>
          <div style={styles.card}>
            <h3>Identity Reference</h3>
            <p><strong>Corporate GID:</strong> {employee.gid}</p>
            <p><strong>Routing Email:</strong> {employee.email}</p>
          </div>
        </main>
      </div>
    </div>
  );
}

// Layout styling parameters
const styles: { [key: string]: React.CSSProperties } = {
  layoutContainer: { display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', fontFamily: 'sans-serif', overflow: 'hidden' },
  header: { height: '60px', backgroundColor: '#1e293b', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', zIndex: 10 },
  logo: { fontSize: '1.25rem', fontWeight: 'bold' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', color: '#ffffff', textTransform: 'uppercase' },
  logoutBtn: { backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' },
  mainContainer: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '260px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0' },
  menuList: { listStyleType: 'none', padding: 0, margin: 0 },
  menuTitle: { padding: '16px 20px 8px 20px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '1.2px' },
  adminTitle: { color: '#b91c1c', marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' },
  menuItem: { padding: '12px 20px', color: '#334155', cursor: 'pointer', fontSize: '0.9rem' },
  adminItem: { color: '#991b1b' },
  contentArea: { flex: 1, padding: '32px', backgroundColor: '#f1f5f9', overflowY: 'auto' },
  card: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '20px' },
  centeredMessage: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.1rem', color: '#475569' }
};