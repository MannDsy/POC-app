import { useState, useEffect } from 'react';

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
  return (
    <div>
      <div className="homepage-page-header">
        <h2 className="homepage-page-title">Dashboard Overview</h2>
        <p className="homepage-page-subtitle">
          Manage your daily activities and profile details from here.
        </p>
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