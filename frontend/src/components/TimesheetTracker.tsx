import React from 'react';

export default function TimesheetTracker() {
  return (
    <div>
      <div className="homepage-page-header">
        <h2 className="homepage-page-title">Timesheet Tracker</h2>
        <p className="homepage-page-subtitle">
          Log your daily hours and submission records.
        </p>
      </div>

      <div className="homepage-card">
        <h3 className="homepage-card-title">Timesheet Tracker</h3>
        <p style={{ color: 'var(--black-3, #595959)' }}>
          Timesheet logging grid and calendar view will appear here.
        </p>
      </div>
    </div>
  );
}