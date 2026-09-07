import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Monitor, Send, CheckCircle2 } from 'lucide-react';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    desktopEnabled: true,
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: '',
    discordEnabled: false,
    discordWebhookUrl: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/notify/settings');
      const data = await res.json();
      setSettings(data);
    } catch (e) {}
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/notify/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      setSettings(data.settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('Failed to save settings: ' + e.message);
    }
  };

  const handleTestNotification = async () => {
    try {
      const res = await fetch('/api/notify/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data.results);
    } catch (e) {
      alert('Error testing notification: ' + e.message);
    }
  };

  return (
    <div className="glass-panel">
      <div style={{ marginBottom: '24px' }}>
        <h3>Cross-Platform Alert & Notification Setup</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Configure where to receive instant CAPTCHA & Security Verification alerts across Desktop (Windows, Mac, Linux) and Mobile (Android, iOS).
        </p>
      </div>

      <div className="grid-2">
        {/* Desktop Notifications */}
        <div style={{
          background: 'rgba(11, 15, 23, 0.5)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Monitor size={22} style={{ color: '#00f2fe' }} />
            <h4 style={{ margin: 0 }}>Desktop OS Notifications</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Sends native Windows / macOS system popup notifications with audio pings when verification is needed.
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.desktopEnabled}
              onChange={e => setSettings(prev => ({ ...prev, desktopEnabled: e.target.checked }))}
            />
            <span style={{ fontSize: '0.95rem' }}>Enable Native Desktop OS Alerts & Sound</span>
          </label>
        </div>

        {/* Telegram Mobile Notifications (Android / iOS) */}
        <div style={{
          background: 'rgba(11, 15, 23, 0.5)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Smartphone size={22} style={{ color: '#10b981' }} />
            <h4 style={{ margin: 0 }}>Telegram Mobile Push (Android / iOS)</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Instant push alert sent directly to your phone's Telegram app when a CAPTCHA appears.
          </p>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
            <input
              type="checkbox"
              checked={settings.telegramEnabled}
              onChange={e => setSettings(prev => ({ ...prev, telegramEnabled: e.target.checked }))}
            />
            <span style={{ fontSize: '0.9rem' }}>Enable Telegram Push Alerts</span>
          </label>

          {settings.telegramEnabled && (
            <div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Telegram Bot Token</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 123456789:ABCdefGhIJK..."
                  value={settings.telegramBotToken}
                  onChange={e => setSettings(prev => ({ ...prev, telegramBotToken: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Telegram Chat ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 987654321"
                  value={settings.telegramChatId}
                  onChange={e => setSettings(prev => ({ ...prev, telegramChatId: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Discord Webhook */}
        <div style={{
          background: 'rgba(11, 15, 23, 0.5)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Bell size={22} style={{ color: '#4facfe' }} />
            <h4 style={{ margin: 0 }}>Discord Mobile / Desktop Webhook</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Dispatches notification embeds to your private Discord channel.
          </p>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
            <input
              type="checkbox"
              checked={settings.discordEnabled}
              onChange={e => setSettings(prev => ({ ...prev, discordEnabled: e.target.checked }))}
            />
            <span style={{ fontSize: '0.9rem' }}>Enable Discord Webhook</span>
          </label>

          {settings.discordEnabled && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Discord Webhook URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://discord.com/api/webhooks/..."
                value={settings.discordWebhookUrl}
                onChange={e => setSettings(prev => ({ ...prev, discordWebhookUrl: e.target.value }))}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          {savedSuccess ? <CheckCircle2 size={18} /> : <Bell size={18} />}
          {savedSuccess ? 'Saved Preferences!' : 'Save Notification Setup'}
        </button>

        <button className="btn btn-secondary" onClick={handleTestNotification}>
          <Send size={18} /> Send Test Alert Now
        </button>
      </div>

      {testResult && (
        <div style={{
          marginTop: '16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '0.85rem'
        }}>
          <strong>Test Alert Results:</strong>
          <ul style={{ margin: '4px 0 0 18px' }}>
            <li>Desktop Alert: {testResult.desktop ? '✅ Sent' : '❌ Disabled / Error'}</li>
            <li>Telegram Push: {testResult.telegram ? '✅ Sent' : '❌ Disabled'}</li>
            <li>Discord Webhook: {testResult.discord ? '✅ Sent' : '❌ Disabled'}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
