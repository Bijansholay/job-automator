const notifier = require('node-notifier');
const path = require('path');
const https = require('https');
const http = require('http');
const db = require('../db/database');

function getSettings() {
  return db.getSettings();
}

function updateSettings(newSettings) {
  return db.saveNotificationSettings(newSettings);
}

/**
 * Dispatch cross-platform notifications (Desktop & Mobile)
 */
async function sendAlert({ title, message, url, type = 'captcha' }) {
  const currentSettings = db.getSettings();
  console.log(`[NOTIFIER] Alert triggered: [${type.toUpperCase()}] ${title} - ${message}`);

  const results = {
    desktop: false,
    telegram: false,
    discord: false
  };

  // 1. Desktop Notification (Windows, macOS, Linux)
  if (currentSettings.desktopEnabled && process.env.NODE_ENV !== 'production') {
    try {
      notifier.notify({
        title: `🚨 ${title}`,
        message: message,
        sound: true,
        wait: false
      });
      results.desktop = true;
    } catch (err) {
      console.warn('[NOTIFIER] Native desktop notification suppressed (cloud/serverless environment):', err.message);
    }
  }

  // 2. Telegram Bot Notification (Android / iOS)
  if (currentSettings.telegramEnabled && currentSettings.telegramBotToken && currentSettings.telegramChatId) {
    try {
      const text = `🚨 *JobCraft AI Alert*\n\n*${title}*\n${message}\n\n🔗 [Open Application Page](${url || '#'})`;
      await sendTelegramMessage(currentSettings.telegramBotToken, currentSettings.telegramChatId, text);
      results.telegram = true;
    } catch (err) {
      console.error('[NOTIFIER] Telegram alert error:', err.message);
    }
  }

  // 3. Discord Webhook (Android / iOS / Desktop)
  if (currentSettings.discordEnabled && currentSettings.discordWebhookUrl) {
    try {
      const payload = {
        embeds: [{
          title: `🚨 ${title}`,
          description: message,
          color: 15158332, // Red
          fields: url ? [{ name: 'Job Link', value: url }] : [],
          timestamp: new Date().toISOString()
        }]
      };
      await sendDiscordWebhook(currentSettings.discordWebhookUrl, payload);
      results.discord = true;
    } catch (err) {
      console.error('[NOTIFIER] Discord alert error:', err.message);
    }
  }

  return results;
}

function sendTelegramMessage(token, chatId, text) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function sendDiscordWebhook(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const urlObj = new URL(webhookUrl);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = {
  sendAlert,
  getSettings,
  updateSettings
};
