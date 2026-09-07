const { chromium } = require('playwright');
const notifier = require('./notifier');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CAPTCHA_IMAGE_PATH = path.join(os.tmpdir(), 'captcha-latest.png');

let activeSession = {
  status: 'IDLE', // IDLE, RUNNING, CAPTCHA_DETECTED, PAUSED, COMPLETED, FAILED
  currentUrl: null,
  jobTitle: null,
  companyName: null,
  logs: [],
  browser: null,
  page: null,
  hasCaptchaImage: false
};

function getAutomationStatus() {
  return {
    status: activeSession.status,
    currentUrl: activeSession.currentUrl,
    jobTitle: activeSession.jobTitle,
    companyName: activeSession.companyName,
    hasCaptchaImage: activeSession.hasCaptchaImage,
    logs: activeSession.logs.slice(-15)
  };
}

function getCaptchaImagePath() {
  if (activeSession.hasCaptchaImage && fs.existsSync(CAPTCHA_IMAGE_PATH)) {
    return CAPTCHA_IMAGE_PATH;
  }
  return null;
}

function log(msg) {
  const time = new Date().toLocaleTimeString();
  const entry = `[${time}] ${msg}`;
  console.log(`[AUTOMATOR] ${entry}`);
  activeSession.logs.push(entry);
}

/**
 * Launch automated application workflow
 */
async function startApplicationWorkflow({ jobUrl, jobTitle, companyName, tailoredResume, resumePdfPath }) {
  if (activeSession.status === 'RUNNING' || activeSession.status === 'CAPTCHA_DETECTED') {
    throw new Error('An application process is already running!');
  }

  activeSession = {
    status: 'RUNNING',
    currentUrl: jobUrl,
    jobTitle: jobTitle || 'Target Position',
    companyName: companyName || 'Indeed Job',
    logs: [],
    browser: null,
    page: null,
    hasCaptchaImage: false
  };

  log(`Initializing browser session for ${activeSession.jobTitle} at ${activeSession.companyName}...`);

  try {
    let browser;
    const wsEndpoint = process.env.BROWSER_WS_ENDPOINT;
    const isHeadless = process.env.HEADLESS === 'true' || process.env.NODE_ENV === 'production';

    if (wsEndpoint) {
      log(`Connecting to remote browser cluster via WebSocket (${wsEndpoint})...`);
      browser = await chromium.connectOverCDP(wsEndpoint);
    } else {
      log(`Launching Chromium instance (headless: ${isHeadless})...`);
      browser = await chromium.launch({
        headless: isHeadless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled'
        ]
      });
    }

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    activeSession.browser = browser;
    activeSession.page = page;

    log(`Navigating to job application URL...`);
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });

    // Periodically check for CAPTCHA / Verification screens
    const captchaCheckInterval = setInterval(async () => {
      if (!activeSession.page || activeSession.page.isClosed()) {
        clearInterval(captchaCheckInterval);
        return;
      }

      const isCaptcha = await checkCaptchaOrVerification(page);
      if (isCaptcha && activeSession.status !== 'CAPTCHA_DETECTED') {
        activeSession.status = 'CAPTCHA_DETECTED';
        log(`🚨 SECURITY/CAPTCHA VERIFICATION DETECTED! Taking screenshot for UI dashboard...`);

        // Capture live screenshot for remote UI dashboard viewing
        try {
          await page.screenshot({ path: CAPTCHA_IMAGE_PATH, fullPage: false });
          activeSession.hasCaptchaImage = true;
          log(`CAPTCHA screenshot captured! Available in UI dashboard.`);
        } catch (e) {
          console.error('[AUTOMATOR] Failed to take CAPTCHA screenshot:', e.message);
        }

        // Send cross-platform notifications (Desktop & Mobile)
        await notifier.sendAlert({
          title: `Action Required: Human Verification Needed!`,
          message: `CAPTCHA or security verification encountered for ${activeSession.jobTitle} at ${activeSession.companyName}. Please complete verification.`,
          url: activeSession.currentUrl,
          type: 'captcha'
        });
      }
    }, 2000);

    // Auto-fill form fields where available
    log(`Scanning application page structure...`);
    await page.waitForTimeout(3000);

    // Look for Apply button
    const applyButton = page.locator('button:has-text("Apply now"), button:has-text("Apply on company site"), a:has-text("Apply now")').first();
    if (await applyButton.isVisible().catch(() => false)) {
      log(`Found Apply button, clicking...`);
      await applyButton.click();
      await page.waitForTimeout(2000);
    }

    // Attempt auto-fill standard inputs
    if (tailoredResume && tailoredResume.personalInfo) {
      const fullNameInput = page.locator('input[name*="name" i], input[id*="name" i]').first();
      if (await fullNameInput.isVisible().catch(() => false)) {
        log(`Pre-filling name: ${tailoredResume.personalInfo.fullName}`);
        await fullNameInput.fill(tailoredResume.personalInfo.fullName);
      }

      const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
      if (await emailInput.isVisible().catch(() => false)) {
        log(`Pre-filling email: ${tailoredResume.personalInfo.email}`);
        await emailInput.fill(tailoredResume.personalInfo.email);
      }

      const phoneInput = page.locator('input[type="tel"], input[name*="phone" i]').first();
      if (await phoneInput.isVisible().catch(() => false)) {
        log(`Pre-filling phone: ${tailoredResume.personalInfo.phone}`);
        await phoneInput.fill(tailoredResume.personalInfo.phone);
      }
    }

    // Attach resume PDF if file input is available
    if (resumePdfPath && fs.existsSync(resumePdfPath)) {
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible().catch(() => false)) {
        log(`Attaching tailored resume PDF...`);
        await fileInput.setInputFiles(resumePdfPath);
      }
    }

    log(`Form pre-filled! Monitoring session for final review / CAPTCHA resolution...`);

  } catch (err) {
    log(`Error during application automation: ${err.message}`);
    if (activeSession.status !== 'CAPTCHA_DETECTED') {
      activeSession.status = 'FAILED';
    }
  }
}

/**
 * Detect CAPTCHA, Cloudflare, 2FA or verification challenge in page DOM or iframes
 */
async function checkCaptchaOrVerification(page) {
  try {
    const pageText = await page.content();
    const lowerText = pageText.toLowerCase();

    const captchaKeywords = [
      'g-recaptcha',
      'hcaptcha',
      'cf-turnstile',
      'verify you are human',
      'security check',
      'press & hold',
      'select all images with',
      'cloudflare',
      'enter verification code',
      'enter 2fa code'
    ];

    for (const keyword of captchaKeywords) {
      if (lowerText.includes(keyword)) {
        return true;
      }
    }

    // Check iframes for CAPTCHA elements
    const frames = page.frames();
    for (const frame of frames) {
      const frameUrl = frame.url().toLowerCase();
      if (frameUrl.includes('recaptcha') || frameUrl.includes('hcaptcha') || frameUrl.includes('turnstile')) {
        return true;
      }
    }
  } catch (e) {
    // Page might be navigating
  }
  return false;
}

/**
 * User confirmed resolution of CAPTCHA
 */
function resolveCaptcha() {
  if (activeSession.status === 'CAPTCHA_DETECTED') {
    activeSession.status = 'RUNNING';
    activeSession.hasCaptchaImage = false;
    log(`User resolved CAPTCHA verification! Resuming auto-fill assistant...`);
    return true;
  }
  return false;
}

/**
 * Stop/cancel application session
 */
async function stopWorkflow() {
  if (activeSession.browser) {
    try {
      await activeSession.browser.close();
    } catch (e) {}
  }
  activeSession.status = 'IDLE';
  activeSession.hasCaptchaImage = false;
  log(`Workflow cancelled by user.`);
}

module.exports = {
  getAutomationStatus,
  getCaptchaImagePath,
  startApplicationWorkflow,
  resolveCaptcha,
  stopWorkflow
};
