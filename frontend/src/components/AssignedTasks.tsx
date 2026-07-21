import React from 'react';

export default function AssignedTasks() {
  return (
    <div>
      <div className="homepage-page-header">
        <h2 className="homepage-page-title">My Assigned Tasks</h2>
        <p className="homepage-page-subtitle">
          Track and manage your active project assignments.
        </p>
      </div>

      <div className="homepage-card">
        <h3 className="homepage-card-title">My Assigned Tasks</h3>
        <p style={{ color: 'var(--black-3, #595959)' }}>
          Task details and status board will appear here.
        </p>
      </div>
    </div>
  );
}