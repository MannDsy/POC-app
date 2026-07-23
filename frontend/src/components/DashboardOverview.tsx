import { useNavigate } from 'react-router-dom';

export interface EmployeeProfile {
  id: number;
  gid: string;
  name: string;
  email: string;
  role: 'admin' | 'normal_user';
}

interface Props {
  employee: EmployeeProfile;
}

export default function DashboardOverview({ employee }: Props) {
  const navigate = useNavigate();

  return (
    <div>
      <div
        className="homepage-page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <div>
          <h2 className="homepage-page-title">Dashboard Overview</h2>
          <p className="homepage-page-subtitle">
            Manage your daily activities and profile details from here.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/interview/new')}
          style={{
            backgroundColor: 'var(--blue-2, #007fcd)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>Add Interview</span>
        </button>
      </div>

      <div className="homepage-card">
        <h3 className="homepage-card-title">Identity Reference</h3>
        <div className="homepage-info-row">
          <span className="homepage-info-label">Corporate GID:</span>
          <span className="homepage-info-value">{employee.gid}</span>
        </div>
        <div className="homepage-info-row">
          <span className="homepage-info-label">Routing Email:</span>
          <span className="homepage-info-value">{employee.email}</span>
        </div>
        <div className="homepage-info-row">
          <span className="homepage-info-label">Access Role:</span>
          <span className="homepage-info-value" style={{ textTransform: 'capitalize' }}>
            {employee.role.replace('_', ' ')}
          </span>
        </div>
      </div>
    </div>
  );
}