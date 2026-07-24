import React, { useState } from 'react';

interface EmployeeRow {
  id: string;
  gid: string;
  name: string;
  email: string;
  isActive: number; // 1 for Active, 0 for Inactive
  isAdmin: number;  // 1 for Admin, 0 for User
}

export default function EmployeeDirectory() {
  const createEmptyRow = (): EmployeeRow => ({
    id: Math.random().toString(36).substring(2, 9),
    gid: '',
    name: '',
    email: '',
    isActive: 1,
    isAdmin: 0,
  });

  const [rows, setRows] = useState<EmployeeRow[]>([createEmptyRow()]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAddRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const handleInputChange = (id: string, field: keyof EmployeeRow, value: any) => {
  // Reset status message on user input change
  if (statusMessage) setStatusMessage(null);

  setRows((prevRows) =>
    prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
  );
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Validation RegEx patterns
    const isNumericOnly = /^\d+$/;
    const isDomainValid = /^[a-zA-Z0-9._%+-]+@einfochips\.com$/i;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNum = i + 1;
      const trimmedGid = r.gid.trim();
      const trimmedName = r.name.trim();
      const trimmedEmail = r.email.trim();

      // 1. GID Validation (Numeric Only)
      if (!trimmedGid) {
        setStatusMessage({ type: 'error', text: `Row ${rowNum}: GID is required.` });
        return;
      }
      if (!isNumericOnly.test(trimmedGid)) {
        setStatusMessage({ type: 'error', text: `Row ${rowNum}: GID must contain numbers only.` });
        return;
      }

      // 2. Name Validation (Alphanumeric, but NOT purely numbers)
      if (!trimmedName) {
        setStatusMessage({ type: 'error', text: `Row ${rowNum}: Interviewer Name is required.` });
        return;
      }
      if (isNumericOnly.test(trimmedName)) {
        setStatusMessage({ type: 'error', text: `Row ${rowNum}: Name cannot consist of numbers only.` });
        return;
      }

      // 3. Email Validation (Must end with @einfochips.com)
      if (!trimmedEmail) {
        setStatusMessage({ type: 'error', text: `Row ${rowNum}: Email ID is required.` });
        return;
      }
      if (!isDomainValid.test(trimmedEmail)) {
        setStatusMessage({ type: 'error', text: `Row ${rowNum}: Email must be a valid '@einfochips.com' address.` });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/employees/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          rows.map(({ gid, name, email, isActive, isAdmin }) => ({
            gid: gid.trim(),
            name: name.trim(),
            email: email.trim(),
            isActive,
            isAdmin,
          }))
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update directory.');
      }

      setStatusMessage({ type: 'success', text: 'Panelist/User records updated successfully!' });
      setRows([createEmptyRow()]);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network request failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px 36px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Page Title */}
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
        Interviewer Directory
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
        Manage interviewers, panelist status, and system access levels.
      </p>

      {/* Main Container Card */}
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid var(--border-color)',
        }}
      >
        <h2 className="theme-text-primary" style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px 0' }}>
          Add/Update Interviewer List 
        </h2>

        {/* Status Notification */}
        {statusMessage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            }}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Dynamic Rows */}
          {rows.map((row) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 2fr 2.5fr 1.5fr 1.5fr auto',
                gap: '12px',
                alignItems: 'center',
                backgroundColor: 'var(--primary-light-bg)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                marginBottom: '16px',
              }}
            >
              {/* GID (Numbers Only) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  GID <span className="theme-text-primary">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="GID"
                  value={row.gid}
                  onChange={(e) => handleInputChange(row.id, 'gid', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Name (Alphanumeric, not numbers only) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Name <span className="theme-text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={row.name}
                  onChange={(e) => handleInputChange(row.id, 'name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Email (@einfochips.com enforced) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Official Email <span className="theme-text-primary">*</span>
                </label>
                <input
                  type="email"
                  placeholder="name@einfochips.com"
                  value={row.email}
                  onChange={(e) => handleInputChange(row.id, 'email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Panel Status Radio Buttons */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Panel Status
                </label>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#1e293b' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      className="theme-accent-input"
                      name={`isActive-${row.id}`}
                      checked={row.isActive === 1}
                      onChange={() => handleInputChange(row.id, 'isActive', 1)}
                    />
                    Active
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      className="theme-accent-input"
                      name={`isActive-${row.id}`}
                      checked={row.isActive === 0}
                      onChange={() => handleInputChange(row.id, 'isActive', 0)}
                    />
                    Inactive
                  </label>
                </div>
              </div>

              {/* Access Level Radio Buttons */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Access Level
                </label>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#1e293b' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      className="theme-accent-input"
                      name={`isAdmin-${row.id}`}
                      checked={row.isAdmin === 1}
                      onChange={() => handleInputChange(row.id, 'isAdmin', 1)}
                    />
                    Admin
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      className="theme-accent-input"
                      name={`isAdmin-${row.id}`}
                      checked={row.isAdmin === 0}
                      onChange={() => handleInputChange(row.id, 'isAdmin', 0)}
                    />
                    User
                  </label>
                </div>
              </div>

              {/* Delete Row Button */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', visibility: 'hidden', marginBottom: '4px' }}>Remove</label>
                <button
                  type="button"
                  onClick={() => handleRemoveRow(row.id)}
                  disabled={rows.length === 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: rows.length === 1 ? '#cbd5e1' : '#ef4444',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                    padding: '6px 8px',
                  }}
                  title="Remove Row"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={handleAddRow}
              className="theme-button-outline"
              style={{
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Add Interviewer
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="theme-button-primary"
              style={{
                borderRadius: '8px',
                padding: '10px 28px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Saving Records...' : 'Save & Sync Panelists'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}