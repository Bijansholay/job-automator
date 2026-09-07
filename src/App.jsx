import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import JobAnalyzer from './components/JobAnalyzer';
import AutoFillController from './components/AutoFillController';
import MasterResumeEditor from './components/MasterResumeEditor';
import ApplicationTracker from './components/ApplicationTracker';
import NotificationSettings from './components/NotificationSettings';

export default function App() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [masterResume, setMasterResume] = useState(null);
  const [automationData, setAutomationData] = useState(null);
  const [captchaAlert, setCaptchaAlert] = useState(false);

  useEffect(() => {
    fetchMasterResume();
  }, []);

  // Poll automation status for header alert badge
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const res = await fetch('/api/automate/status');
        const data = await res.json();
        if (data.status === 'CAPTCHA_DETECTED') {
          setCaptchaAlert(true);
        } else {
          setCaptchaAlert(false);
        }
      } catch (e) {}
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchMasterResume = async () => {
    try {
      const res = await fetch('/api/resume');
      const data = await res.json();
      setMasterResume(data);
    } catch (e) {
      console.error('Failed to load master resume:', e);
    }
  };

  const handleSaveMasterResume = async (updatedData) => {
    try {
      await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      setMasterResume(updatedData);
    } catch (e) {
      alert('Error saving master resume: ' + e.message);
    }
  };

  const handleStartAutomation = (data) => {
    setAutomationData(data);
    setActiveTab('automator');
  };

  const handleSaveApplicationRecord = async (appRecord) => {
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appRecord)
      });
    } catch (e) {}
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        captchaAlert={captchaAlert}
      />

      <main style={{ marginTop: '24px' }}>
        {activeTab === 'analyzer' && (
          <JobAnalyzer
            onStartAutomation={handleStartAutomation}
            onSaveApplication={handleSaveApplicationRecord}
          />
        )}

        {activeTab === 'automator' && (
          <AutoFillController
            automationData={automationData}
          />
        )}

        {activeTab === 'master' && (
          <MasterResumeEditor
            resumeData={masterResume}
            onSave={handleSaveMasterResume}
          />
        )}

        {activeTab === 'tracker' && (
          <ApplicationTracker />
        )}

        {activeTab === 'settings' && (
          <NotificationSettings />
        )}
      </main>
    </div>
  );
}
