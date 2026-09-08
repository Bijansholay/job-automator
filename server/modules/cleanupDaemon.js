const fs = require('fs');
const path = require('path');
const os = require('os');
const automator = require('./automator');

// Interval frequency: default every 15 minutes
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;
// Max age for temporary files: 30 minutes
const MAX_TEMP_FILE_AGE_MS = 30 * 60 * 1000;

/**
 * Clean up old temporary files in os.tmpdir()
 */
function cleanTempFiles() {
  const tmpDir = os.tmpdir();
  const now = Date.now();
  let deletedCount = 0;

  try {
    const files = fs.readdirSync(tmpDir);
    files.forEach(file => {
      if (file.startsWith('captcha-') || file.startsWith('resume-preview-') || file.endsWith('.pdf')) {
        const filePath = path.join(tmpDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (now - stats.mtimeMs > MAX_TEMP_FILE_AGE_MS) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        } catch (e) {}
      }
    });

    if (deletedCount > 0) {
      console.log(`[CLEANUP DAEMON] Swept ${deletedCount} stale temporary files from ${tmpDir}.`);
    }
  } catch (err) {
    console.error('[CLEANUP DAEMON] Error sweeping temp files:', err.message);
  }
}

/**
 * Clean up stale browser sessions & trigger garbage collection
 */
async function cleanBrowserAndMemory() {
  try {
    const status = automator.getAutomationStatus();
    // If browser status has been completed or failed, close browser process
    if (status.status === 'COMPLETED' || status.status === 'FAILED') {
      await automator.stopWorkflow();
      console.log(`[CLEANUP DAEMON] Closed idle browser instance (Status: ${status.status}).`);
    }
  } catch (err) {
    console.error('[CLEANUP DAEMON] Error cleaning browser sessions:', err.message);
  }

  // Trigger Node.js V8 garbage collection if enabled
  if (global.gc) {
    try {
      global.gc();
      console.log('[CLEANUP DAEMON] V8 Garbage Collection executed.');
    } catch (e) {}
  }
}

/**
 * Initialize background cleanup daemon
 */
function startCleanupDaemon() {
  console.log('[CLEANUP DAEMON] Standby automated cleanup daemon initialized (Frequency: 15 mins).');
  
  // Run initial sweep on boot
  cleanTempFiles();
  cleanBrowserAndMemory();

  // Schedule recurring standby interval
  setInterval(async () => {
    console.log('[CLEANUP DAEMON] Executing standby optimization sweep...');
    cleanTempFiles();
    await cleanBrowserAndMemory();
  }, CLEANUP_INTERVAL_MS);
}

module.exports = {
  startCleanupDaemon,
  cleanTempFiles,
  cleanBrowserAndMemory
};
