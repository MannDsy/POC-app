import React, { useState } from 'react';

export type TabType = 'home' | 'tasks' | 'timesheet' | 'directory' | 'logs';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  role?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  key: TabType;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const ICONS = {
  overview: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  tickets: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <path d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  directory: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  logs: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
};

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Overview', icon: ICONS.overview },
  { key: 'tasks', label: 'Tickets', icon: ICONS.tickets },
  { key: 'timesheet', label: 'Spent Time', icon: ICONS.clock },
  { key: 'directory', label: 'Employee Directory', icon: ICONS.directory, adminOnly: true },
  { key: 'logs', label: 'System Access Logs', icon: ICONS.logs, adminOnly: true },
];

export default function Navbar({
  activeTab,
  onTabChange,
  role,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse,
}: NavbarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = externalIsCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin');

  return (
    <nav className={`nb-sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Secondary">
      <style>{`
        .nb-sidebar {
          width: 220px;
          min-width: 220px;
          height: 100%;
          background: #fff;
          border-right: 1px solid #e5e9ee;
          padding: 12px 0;
          box-sizing: border-box;
          transition: width 0.25s ease, min-width 0.25s ease;
          display: flex;
          flex-direction: column;
        }

        .nb-sidebar.collapsed {
          width: 60px;
          min-width: 60px;
        }

        .nb-list { 
          list-style: none; 
          margin: 0; 
          padding: 0; 
          flex-grow: 1;
        }

        .nb-item { 
          margin: 2px 8px; 
          border-radius: 6px; 
          overflow: hidden; 
        }

        .nb-button {
          width: 100%;
          display: flex; 
          align-items: center; 
          gap: 12px;
          padding: 10px 12px;
          background: none; 
          border: none; 
          cursor: pointer;
          border-left: 3px solid transparent;
          border-radius: 6px;
          font-size: 14.5px; 
          font-weight: 500;
          color: #43505c;
          text-align: left;
          white-space: nowrap;
        }

        .nb-button:hover { 
          background: color-mix(in srgb, var(--blue-1, #0069aa) 6%, white); 
        }

        .nb-item.active .nb-button {
          background: color-mix(in srgb, var(--blue-1, #0069aa) 10%, white);
          border-left-color: var(--blue-1, #0069aa);
          color: var(--blue-1, #0069aa);
        }

        .nb-icon { 
          display: flex; 
          align-items: center; 
          flex-shrink: 0; 
        }

        /* Bottom Toggle Container */
        .sideBarToogleIcon {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 12px 12px 0 12px;
          border-top: 1px solid #f0f3f6;
          margin-top: auto;
        }

        .nb-sidebar.collapsed .sideBarToogleIcon {
          justify-content: center;
          padding: 12px 0 0 0;
        }

        /* Toggle Icon styling matching overview/tickets theme behavior */
        .arrowIcon {
          color: var(--blue-1, #0069aa);
          transition: transform 0.3s ease;
        }

        .nb-sidebar.collapsed .arrowIcon {
          transform: rotate(180deg);
        }

        .nb-sidebar.collapsed .nb-label {
          display: none;
        }

        .nb-sidebar.collapsed .nb-button {
          justify-content: center;
          padding: 10px 0;
        }
      `}</style>

      {/* Navigation List */}
      <ul className="nb-list">
        {visibleItems.map((item) => (
          <li key={item.key} className={`nb-item ${activeTab === item.key ? 'active' : ''}`}>
            <button
              type="button"
              className="nb-button"
              onClick={() => onTabChange(item.key)}
              title={isCollapsed ? item.label : undefined}
              aria-current={activeTab === item.key ? 'page' : undefined}
            >
              <span className="nb-icon">{item.icon}</span>
              <span className="nb-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Toggle Icon Footer */}
      <div className="sideBarToogleIcon">
        <span
          role="button"
          tabIndex={0}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleToggle();
          }}
          style={{ display: 'inline-flex', cursor: 'pointer' }}
        >
          <span>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              className="defaultSize arrowIcon"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.071 4.92902L11.4852 6.34323L6.82834 11.0001L16.0002 11.0002L16.0002 13.0002L6.82839 13.0001L11.4852 17.6569L10.071 19.0712L2.99994 12.0001L10.071 4.92902ZM18.0001 19V5.00003H20.0001V19H18.0001Z"></path>
            </svg>
          </span>
        </span>
      </div>
    </nav>
  );
}