const fs = require('fs');
const path = require('path');

// Determine data directory (supports environment override for persistent cloud volumes)
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

const MASTER_RESUME_FILE = path.join(DATA_DIR, 'master_resume.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure directory exists
function ensureDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[DB] Error creating data directory:', err.message);
  }
}

// Helper to load JSON safely
function readJson(filePath, defaultValue) {
  ensureDirectory();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`[DB] Error reading ${filePath}:`, err.message);
  }
  return defaultValue;
}

// Helper to save JSON safely
function writeJson(filePath, data) {
  ensureDirectory();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`[DB] Error writing ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Database API Adapter
 */
const db = {
  // Master Resume
  getMasterResume: () => {
    return readJson(MASTER_RESUME_FILE, {});
  },
  saveMasterResume: (resumeData) => {
    return writeJson(MASTER_RESUME_FILE, resumeData);
  },

  // Job Applications
  getApplications: () => {
    return readJson(APPLICATIONS_FILE, []);
  },
  addApplication: (appRecord) => {
    const apps = readJson(APPLICATIONS_FILE, []);
    const newApp = {
      id: 'app-' + Date.now(),
      dateApplied: new Date().toISOString(),
      status: appRecord.status || 'Applied',
      ...appRecord
    };
    apps.unshift(newApp);
    writeJson(APPLICATIONS_FILE, apps);
    return newApp;
  },

  // Notification Settings
  getSettings: () => {
    return readJson(SETTINGS_FILE, {
      desktopEnabled: process.env.NODE_ENV !== 'production', // disable desktop popup by default in cloud prod
      telegramEnabled: false,
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
      telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
      discordEnabled: false,
      discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || ''
    });
  },
  saveSettings: (settings) => {
    writeJson(SETTINGS_FILE, settings);
    return settings;
  }
};

module.exports = db;
