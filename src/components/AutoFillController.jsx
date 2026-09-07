import React, { useState, useEffect } from 'react';
import { Bot, AlertOctagon, CheckCircle2, ExternalLink, Play, Square, RefreshCw, Smartphone, Monitor } from 'lucide-react';

export default function AutoFillController({ automationData }) {
  const [status, setStatus] = useState({
    status: 'IDLE',
    currentUrl: '',
    jobTitle: '',
    companyName: '',
    logs: []
  });
  const [targetJobUrl, setTargetJobUrl] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('Senior Software Engineer');
  const [targetCompany, setTargetCompany] = useState('Indeed Employer');

  useEffect(() => {
    if (automationData?.jobUrl) {
      setTargetJobUrl(automationData.jobUrl);
      setTargetJobTitle(automationData.jobTitle || 'Target Position');
      setTargetCompany(automationData.companyName || 'Indeed Employer');
    }
  }, [automationData]);

  // Poll automation status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/automate/status');
        const data = await res.json();
        setStatus(data);
      } catch (e) {}
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    if (!targetJobUrl) {
      alert('Please provide a job URL.');
      return;
    }
    try {
      await fetch('/api/automate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobUrl: targetJobUrl,
          jobTitle: targetJobTitle,
          companyName: targetCompany,
          tailoredResume: automationData?.tailoredResume
        })
      });
    } catch (e) {
      alert('Error starting automator: ' + e.message);
    }
  };

  const handleResolveCaptcha = async () => {
    try {
      await fetch('/api/automate/resolve-captcha', { method: 'POST' });
    } catch (e) {}
  };

  const handleStop = async () => {
    try {
      await fetch('/api/automate/stop', { method: 'POST' });
    } catch (e) {}
  };

  const isCaptcha = status.status === 'CAPTCHA_DETECTED';
  const liveUrl = status.currentUrl || targetJobUrl;

  return (
    <div className="glass-panel">
      {/* CAPTCHA REAL-TIME ALERT BANNER */}
      {isCaptcha && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.4) 100%)',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
          animation: 'pulse-danger 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <AlertOctagon size={36} style={{ color: '#ef4444', flexShrink: 0, marginTop: '4px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ color: '#ffffff', margin: 0 }}>🚨 HUMAN VERIFICATION / CAPTCHA REQUIRED!</h3>
                <span className="badge badge-ruby">ACTION REQUIRED</span>
              </div>
              <p style={{ margin: '8px 0 14px 0', fontSize: '0.92rem', color: '#fecaca' }}>
                The automated script encountered a verification check for <strong>{status.jobTitle}</strong>. Open the target application page in a new browser tab to solve it directly.
              </p>

              <div style={{
                display: 'flex',
                gap: '16px',
                background: 'rgba(0,0,0,0.3)',
                padding: '10px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.85rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7' }}>
                  <Monitor size={16} /> Alert Dispatched
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93c5fd' }}>
                  <Smartphone size={16} /> Mobile Push Dispatched
                </span>
              </div>

              {status.hasCaptchaImage && (
                <div style={{ marginBottom: '16px', background: '#000000', padding: '10px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginBottom: '8px', fontWeight: 600 }}>
                    📷 Cloud Live Snapshot (Verification Screen):
                  </div>
                  <img
                    src={`/api/automate/captcha-image?t=${Date.now()}`}
                    alt="CAPTCHA Verification Screen"
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px', border: '1px solid #374151', objectFit: 'contain' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                      background: '#3b82f6',
                      color: '#ffffff',
                      padding: '10px 20px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600
                    }}
                  >
                    <ExternalLink size={18} /> Step 1: Open Job Page in Browser
                  </a>
                )}

                <button
                  className="btn btn-primary"
                  style={{ background: '#10b981', color: '#ffffff', padding: '10px 20px', fontWeight: 600 }}
                  onClick={handleResolveCaptcha}
                >
                  <CheckCircle2 size={18} /> Step 2: Verification Complete — Resume Assistant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3>Indeed Auto-Fill Assistant</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Automates form-filling & resume uploading while giving you 1-click control.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="status-dot active" />
          <span className={`badge ${isCaptcha ? 'badge-ruby' : status.status === 'RUNNING' ? 'badge-cyan' : 'badge-emerald'}`}>
            STATUS: {status.status}
          </span>
        </div>
      </div>

      <div className="grid-2">
        {/* Workflow Controls */}
        <div>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              className="form-input"
              value={targetJobTitle}
              onChange={e => setTargetJobTitle(e.target.value)}
              disabled={status.status === 'RUNNING' || isCaptcha}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              value={targetCompany}
              onChange={e => setTargetCompany(e.target.value)}
              disabled={status.status === 'RUNNING' || isCaptcha}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Indeed Job Posting URL</label>
            <input
              type="url"
              className="form-input"
              value={targetJobUrl}
              onChange={e => setTargetJobUrl(e.target.value)}
              disabled={status.status === 'RUNNING' || isCaptcha}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            {status.status === 'RUNNING' || isCaptcha ? (
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleStop}>
                <Square size={18} /> Stop Browser Assistant
              </button>
            ) : (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleStart}>
                <Play size={18} /> Start Auto-Fill Assistant
              </button>
            )}
          </div>
        </div>

        {/* Console Logs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="form-label">Browser Live Activity Feed</span>
            <RefreshCw size={14} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          </div>
          <div className="log-box">
            {status.logs && status.logs.length > 0 ? (
              status.logs.map((log, i) => (
                <div key={i} className="log-item">{log}</div>
              ))
            ) : (
              <div style={{ color: 'var(--text-dim)' }}>Session idle. Click Start to launch automation browser.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
