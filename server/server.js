const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const db = require('./db/database');
const resumeTailor = require('./modules/resumeTailor');
const pdfGenerator = require('./modules/pdfGenerator');
const notifier = require('./modules/notifier');
const automator = require('./modules/automator');
const cleanupDaemon = require('./modules/cleanupDaemon');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint (for Cloud Load Balancers & Monitoring)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// --- REST API ENDPOINTS ---

// 1. Get Master Resume
app.get('/api/resume', (req, res) => {
  const masterResume = db.getMasterResume();
  res.json(masterResume);
});

// 2. Save Master Resume
app.post('/api/resume', (req, res) => {
  db.saveMasterResume(req.body);
  res.json({ success: true, message: 'Master resume updated successfully.' });
});

// 3. Tailor Resume for a Job Description
app.post('/api/tailor', async (req, res) => {
  const { jobTitle, companyName, jobDescription, apiKey } = req.body;
  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required.' });
  }

  const masterResume = db.getMasterResume();
  try {
    const result = await resumeTailor.generateTailoredResume(
      masterResume,
      jobTitle,
      companyName,
      jobDescription,
      apiKey || process.env.GEMINI_API_KEY
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to tailor resume: ' + err.message });
  }
});

// 4. Generate & Preview Resume HTML
app.post('/api/resume/preview-html', (req, res) => {
  const tailoredResumeData = req.body;
  const html = pdfGenerator.generateResumeHtml(tailoredResumeData);
  res.send(html);
});

// 5. Get Application History
app.get('/api/applications', (req, res) => {
  const apps = db.getApplications();
  res.json(apps);
});

// 6. Add/Save Application Record
app.post('/api/applications', (req, res) => {
  const newApp = db.addApplication(req.body);
  res.json({ success: true, application: newApp });
});

// 7. Notification Settings API
app.get('/api/notify/settings', (req, res) => {
  res.json(notifier.getSettings());
});

app.post('/api/notify/settings', (req, res) => {
  const updated = notifier.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

// 8. Test Dispatch Notification
app.post('/api/notify/test', async (req, res) => {
  const results = await notifier.sendAlert({
    title: 'Test JobCraft AI Notification',
    message: 'Cross-platform alert system active! Desktop & Mobile push alerts verified.',
    type: 'test'
  });
  res.json({ success: true, results });
});

// 9. Automation Endpoints
app.get('/api/automate/status', (req, res) => {
  res.json(automator.getAutomationStatus());
});

app.get('/api/automate/captcha-image', (req, res) => {
  const imagePath = automator.getCaptchaImagePath();
  if (imagePath && fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).send('No CAPTCHA image captured');
  }
});

app.post('/api/automate/start', async (req, res) => {
  const { jobUrl, jobTitle, companyName, tailoredResume } = req.body;
  if (!jobUrl) {
    return res.status(400).json({ error: 'Job URL is required' });
  }

  try {
    automator.startApplicationWorkflow({
      jobUrl,
      jobTitle,
      companyName,
      tailoredResume: tailoredResume || db.getMasterResume()
    });
    res.json({ success: true, message: 'Automation workflow started in background browser window.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/automate/resolve-captcha', (req, res) => {
  const resolved = automator.resolveCaptcha();
  res.json({ success: resolved });
});

app.post('/api/automate/stop', async (req, res) => {
  await automator.stopWorkflow();
  res.json({ success: true });
});

// Serve frontend production build if exists
const frontendBuildPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 JobCraft AI API Server listening on port ${PORT}`);
  console.log(`=================================================`);
  
  // Launch standby automated cleanup daemon
  cleanupDaemon.startCleanupDaemon();
});
