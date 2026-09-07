import React from 'react';
import { Briefcase, FileText, Bot, Bell, Layers } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, captchaAlert }) {
  return (
    <header className="header-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0b0f17',
          fontWeight: 'bold'
        }}>
          <Bot size={26} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
            JobCraft <span className="gradient-text">AI</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Resume Reformatter & Indeed Application Assistant
          </p>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyzer')}
        >
          <FileText size={18} />
          Tailor Resume
        </button>

        <button
          className={`nav-tab ${activeTab === 'automator' ? 'active' : ''}`}
          onClick={() => setActiveTab('automator')}
        >
          <Bot size={18} />
          Auto-Fill Assistant
          {captchaAlert && (
            <span className="badge badge-ruby" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
              ALERT
            </span>
          )}
        </button>

        <button
          className={`nav-tab ${activeTab === 'master' ? 'active' : ''}`}
          onClick={() => setActiveTab('master')}
        >
          <Layers size={18} />
          Master Resume
        </button>

        <button
          className={`nav-tab ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          <Briefcase size={18} />
          Tracker
        </button>

        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Bell size={18} />
          Alerts Setup
        </button>
      </nav>
    </header>
  );
}
