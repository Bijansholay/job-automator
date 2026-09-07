import React, { useState, useEffect } from 'react';
import { Briefcase, ExternalLink, Calendar, CheckCircle } from 'lucide-react';

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApplications(data);
    } catch (e) {}
  };

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3>Job Application Tracker</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            History of tailored applications, job descriptions matched, and submission statuses.
          </p>
        </div>
        <div className="badge badge-cyan" style={{ fontSize: '0.9rem' }}>
          Total Applications: {applications.length}
        </div>
      </div>

      {applications.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: 'var(--text-muted)',
          border: '1px dashed var(--border-color)',
          borderRadius: '12px'
        }}>
          <Briefcase size={36} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <p>No job applications tracked yet. Tailor a resume to get started!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px' }}>Role & Company</th>
                <th style={{ padding: '12px' }}>Match Score</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Link</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <strong>{app.jobTitle}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.companyName}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-emerald">{app.matchScore || 85}% Match</span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Calendar size={12} style={{ marginRight: '4px' }} />
                    {new Date(app.dateApplied).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-cyan">
                      <CheckCircle size={12} /> {app.status || 'Applied'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {app.jobUrl && (
                      <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4facfe' }}>
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
