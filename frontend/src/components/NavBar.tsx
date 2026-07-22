import React from 'react';

export type TabType = 'home' | 'tasks' | 'timesheet' | 'directory' | 'logs';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  role?: string;
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

export default function Navbar({ activeTab, onTabChange, role }: NavbarProps) {
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin');

  return (
    <nav className="nb-sidebar" aria-label="Secondary">
      <style>{`
        .nb-sidebar {
          width: 220px;
          min-width: 220px;
          background: #fff;
          border-right: 1px solid #e5e9ee;
          padding: 12px 0;
          box-sizing: border-box;
        }
        .nb-list { list-style: none; margin: 0; padding: 0; }
        .nb-item { margin: 2px 8px; border-radius: 6px; overflow: hidden; }
        .nb-button {
          width: 100%;
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          background: none; border: none; cursor: pointer;
          border-left: 3px solid transparent;
          border-radius: 6px;
          font-size: 14.5px; font-weight: 500;
          color: #43505c;
          text-align: left;
        }
        .nb-button:hover { background: color-mix(in srgb, var(--blue-1, #0069aa) 6%, white); }
        .nb-item.active .nb-button {
          background: color-mix(in srgb, var(--blue-1, #0069aa) 10%, white);
          border-left-color: var(--blue-1, #0069aa);
          color: var(--blue-1, #0069aa);
        }
        .nb-icon { display: flex; align-items: center; flex-shrink: 0; }
      `}</style>

      <ul className="nb-list">
        {visibleItems.map((item) => (
          <li key={item.key} className={`nb-item ${activeTab === item.key ? 'active' : ''}`}>
            <button
              type="button"
              className="nb-button"
              onClick={() => onTabChange(item.key)}
              aria-current={activeTab === item.key ? 'page' : undefined}
            >
              <span className="nb-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}