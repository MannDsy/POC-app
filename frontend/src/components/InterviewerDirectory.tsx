import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

interface EmployeeRow {
  id: string;
  gid: string;
  name: string;
  email: string;
  isActive: number; // 1 for Active, 0 for Inactive
  isAdmin: number;  // 1 for Admin, 0 for User
}

export default function InterviewerDirectory() {
  const createEmptyRow = (): EmployeeRow => ({
    id: Math.random().toString(36).substring(2, 9),
    gid: '',
    name: '',
    email: '',
    isActive: 1,
    isAdmin: 0,
  });

  const [rows, setRows] = useState<EmployeeRow[]>([createEmptyRow()]);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    
    // Clean up error for removed row
    setRowErrors((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleInputChange = (id: string, field: keyof EmployeeRow, value: any) => {
    if (statusMessage) setStatusMessage(null);
    if (importError) setImportError(null);

    // Clear error for the specific row when user modifies its input
    if (rowErrors[id]) {
      setRowErrors((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }

    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // --- Import .xls / CSV File Upload Logic ---
  const handleImportButtonClick = () => {
    setStatusMessage(null);
    setImportError(null);
    setRowErrors({});
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const fileName = file.name.toLowerCase();
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    const validMimeTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    // File format check
    if (!hasValidExtension && !validMimeTypes.includes(file.type)) {
      setImportError('Importing file failed. Invalid file format.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        if (!buffer) throw new Error('Unreadable binary content.');

        const workbook = XLSX.read(buffer, { type: 'binary' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('No valid sheet found.');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawData || rawData.length === 0) {
          throw new Error('Sheet is empty or structure is incompatible.');
        }

        // --- Column Name Validation Logic ---
        const actualKeys = Object.keys(rawData[0]).map((key) =>
          key.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        );

        const requiredFieldsConfig: { name: string; keys: string[] }[] = [
          { name: 'GID', keys: ['gid', 'id', 'empid', 'employeeid'] },
          { name: 'NAME', keys: ['name', 'fullname', 'interviewer', 'interviewername'] },
          { name: 'EMAIL', keys: ['email', 'officialemail', 'emailid', 'mail'] },
          { name: 'isActive', keys: ['isactive', 'status', 'panelstatus', 'active'] },
          { name: 'isAdmin', keys: ['isadmin', 'role', 'accesslevel', 'admin'] },
        ];

        const missingFields: string[] = [];

        for (const field of requiredFieldsConfig) {
          const isPresent = field.keys.some((possibleKey) => actualKeys.includes(possibleKey));
          if (!isPresent) {
            missingFields.push(field.name);
          }
        }

        if (missingFields.length > 0) {
          setImportError(`Missing required column(s): ${missingFields.join(', ')}.`);
          return;
        }

        const getValueByKeys = (rowObj: Record<string, any>, possibleKeys: string[]): string => {
          for (const key of Object.keys(rowObj)) {
            const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            if (possibleKeys.includes(cleanKey)) {
              return String(rowObj[key] ?? '').trim();
            }
          }
          return '';
        };

        const importedRows: EmployeeRow[] = rawData.map((item) => {
          const gidVal = getValueByKeys(item, ['gid', 'id', 'empid', 'employeeid']);
          const nameVal = getValueByKeys(item, ['name', 'fullname', 'interviewer', 'interviewername']);
          const emailVal = getValueByKeys(item, ['email', 'officialemail', 'emailid', 'mail']);
          const activeVal = getValueByKeys(item, ['isactive', 'status', 'panelstatus', 'active']);
          const adminVal = getValueByKeys(item, ['isadmin', 'role', 'accesslevel', 'admin']);

          const parsedIsActive =
            activeVal === '0' ||
            activeVal.toLowerCase() === 'inactive' ||
            activeVal.toLowerCase() === 'false' ? 0 : 1;

          const parsedIsAdmin =
            adminVal === '1' ||
            adminVal.toLowerCase() === 'admin' ||
            adminVal.toLowerCase() === 'true' ? 1 : 0;

          return {
            id: Math.random().toString(36).substring(2, 9),
            gid: gidVal,
            name: nameVal,
            email: emailVal,
            isActive: parsedIsActive,
            isAdmin: parsedIsAdmin,
          };
        });

        setRows([...importedRows]);
        setRowErrors({});
        setImportError(null);
        setStatusMessage({
          type: 'success',
          text: `Upload successful! Loaded ${importedRows.length} record(s) from "${file.name}".`,
        });
      } catch (err) {
        console.error('File import error:', err);
        setImportError('Importing file failed.');
      }
    };

    reader.onerror = () => {
      setImportError('Importing file failed.');
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setImportError(null);
    setRowErrors({});

    // --- Validation Logic ---
    const isNumericOnly = /^\d+$/;
    const isDomainValid = /^[a-zA-Z0-9._%+-]+@einfochips\.com$/i;
    const newErrors: Record<string, string> = {};

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const trimmedGid = r.gid.trim();
      const trimmedName = r.name.trim();
      const trimmedEmail = r.email.trim();

      if (!trimmedGid) {
        newErrors[r.id] = 'Interviewer ID (GID) is required.';
      } else if (!isNumericOnly.test(trimmedGid)) {
        newErrors[r.id] = 'GID must contain numbers only.';
      } else if (!trimmedName) {
        newErrors[r.id] = 'Interviewer Name is required.';
      } else if (isNumericOnly.test(trimmedName)) {
        newErrors[r.id] = 'Name cannot consist of numbers only.';
      } else if (!trimmedEmail) {
        newErrors[r.id] = 'Email ID is required.';
      } else if (!isDomainValid.test(trimmedEmail)) {
        newErrors[r.id] = "Email must be a valid '@einfochips.com' address.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setRowErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/employees/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

      const text = await response.text();
      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100) || response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to save records.`);
      }

      setStatusMessage({ type: 'success', text: data.message || 'Panelist/User records updated successfully!' });
      setRows([createEmptyRow()]);
      setRowErrors({});
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network request failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '0 3px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header Container with Title & Import Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          margin: '0 0 24px 0',
        }}
      >
        <div>
          <h1 className="theme-text-primary" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>
            Interviewer Directory
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
            Manage interviewers, panelist status, and system access levels.
          </p>
        </div>

        {/* Import Button Container with Pointing Error Tooltip */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv, .xls, .xlsx, text/csv, application/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={handleImportButtonClick}
            className="theme-button-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              border: 'none',
              transition: 'opacity 0.2s ease',
            }}
          >
            {/* Spreadsheet Icon */}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Import .xls
          </button>

          {/* Pointing Error Box for Import Action */}
          {importError && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                zIndex: 10,
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {/* Upward pointing arrow */}
              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '24px',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '6px solid #fecaca',
                }}
              />
              <span>{importError}</span>
            </div>
          )}
        </div>
      </div>

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
        <form onSubmit={handleSubmit}>
          {/* Section Header with "Add/Update Interviewer List" and relocated "Save & Sync Panelists" button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2 className="theme-text-primary" style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
              Add/Update Interviewer List
            </h2>

            <button
              type="submit"
              disabled={isSubmitting}
              className="theme-button-primary"
              style={{
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Saving Records...' : 'Save & Sync Panelists'}
            </button>
          </div>

          {/* Global Status Notification */}
          {statusMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: statusMessage.type === 'success' ? 'var(--success-bg, #f0fdf4)' : 'var(--error-bg, #fef2f2)',
                color: statusMessage.type === 'success' ? 'var(--success-color, #166534)' : 'var(--error-color, #991b1b)',
                border: `1px solid ${statusMessage.type === 'success' ? 'var(--success-border, #bbf7d0)' : 'var(--error-border, #fecaca)'}`,
              }}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Dynamic Rows */}
          {rows.map((row) => {
            const rowError = rowErrors[row.id];

            return (
              <div
                key={row.id}
                style={{
                  backgroundColor: 'var(--primary-light-bg)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: rowError ? '1px solid #f87171' : '1px solid var(--border-color)',
                  marginBottom: '16px',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                }}
              >
                {/* Per-Row Inline Error Message */}
                {rowError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#dc2626',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '12px',
                    }}
                  >
                    <span>{rowError}</span>
                  </div>
                )}

                {/* Grid Inputs Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 2fr 2.5fr 1.5fr 1.5fr auto',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                >
                  {/* GID */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-color, #334155)', marginBottom: '4px' }}>
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
                        border: rowError && rowError.includes('GID') ? '1px solid #ef4444' : '1px solid var(--border-color, #cbd5e1)',
                        backgroundColor: 'var(--input-bg, #ffffff)',
                        color: 'var(--text-color, #1e293b)',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-color, #334155)', marginBottom: '4px' }}>
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
                        border: rowError && rowError.includes('Name') ? '1px solid #ef4444' : '1px solid var(--border-color, #cbd5e1)',
                        backgroundColor: 'var(--input-bg, #ffffff)',
                        color: 'var(--text-color, #1e293b)',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-color, #334155)', marginBottom: '4px' }}>
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
                        border: rowError && rowError.includes('Email') ? '1px solid #ef4444' : '1px solid var(--border-color, #cbd5e1)',
                        backgroundColor: 'var(--input-bg, #ffffff)',
                        color: 'var(--text-color, #1e293b)',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Panel Status Radio Buttons */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-color, #334155)', marginBottom: '6px' }}>
                      Panel Status
                    </label>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-color, #1e293b)' }}>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-color, #334155)', marginBottom: '6px' }}>
                      Access Level
                    </label>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-color, #1e293b)' }}>
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
                        color: rows.length === 1 ? 'var(--border-color, #cbd5e1)' : '#ef4444',
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
              </div>
            );
          })}

          {/* Bottom Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '20px' }}>
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
          </div>
        </form>
      </div>
    </div>
  );
}