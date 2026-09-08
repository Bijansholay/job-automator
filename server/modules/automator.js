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
 * Clean up active browser session to free memory
 */
async function closeActiveBrowser() {
  if (activeSession.browser) {
    try {
      log('Closing previous browser instance to free system RAM...');
      await activeSession.browser.close();
    } catch (e) {}
    activeSession.browser = null;
    activeSession.page = null;
  }
}

/**
 * Launch automated application workflow with 512MB RAM constraints
 */
async function startApplicationWorkflow({ jobUrl, jobTitle, companyName, tailoredResume, resumePdfPath }) {
  if (activeSession.status === 'RUNNING' || activeSession.status === 'CAPTCHA_DETECTED') {
    // If a session is already running, clean it up before restarting
    await closeActiveBrowser();
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

  log(`Initializing ultra-lean browser session for ${activeSession.jobTitle}...`);

  try {
    let browser;
    const wsEndpoint = process.env.BROWSER_WS_ENDPOINT;
    const isHeadless = process.env.HEADLESS === 'true' || process.env.NODE_ENV === 'production';
    const customExecPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined;

    if (wsEndpoint) {
      log(`Connecting to remote browser cluster via WebSocket (${wsEndpoint})...`);
      browser = await chromium.connectOverCDP(wsEndpoint);
    } else {
      log(`Launching optimized Chromium instance (headless: ${isHeadless})...`);
      browser = await chromium.launch({
        executablePath: customExecPath,
        headless: isHeadless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',                  // Crucial for 512MB RAM containers
          '--no-zygote',                        // Disable process pooling
          '--disable-extensions',               // Disable extension overhead
          '--disable-accelerated-2d-canvas',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-pages',
          '--disable-ipc-flooding-protection',
          '--disable-renderer-backgrounding',
          '--js-flags="--max-old-space-size=128"', // Limit Chromium V8 heap to 128MB
          '--renderer-process-limit=1',        // Force single renderer process
          '--disable-blink-features=AutomationControlled'
        ]
      });
    }

    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    activeSession.browser = browser;
    activeSession.page = page;

    log(`Navigating to job application URL...`);
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });

    // Check for CAPTCHA / Verification screens
    const captchaCheckInterval = setInterval(async () => {
      if (!activeSession.page || activeSession.page.isClosed()) {
        clearInterval(captchaCheckInterval);
        return;
      }

      const isCaptcha = await checkCaptchaOrVerification(page);
      if (isCaptcha && activeSession.status !== 'CAPTCHA_DETECTED') {
        activeSession.status = 'CAPTCHA_DETECTED';
        log(`🚨 SECURITY/CAPTCHA VERIFICATION DETECTED! Taking screenshot for UI dashboard...`);

        try {
          await page.screenshot({ path: CAPTCHA_IMAGE_PATH, fullPage: false });
          activeSession.hasCaptchaImage = true;
          log(`CAPTCHA screenshot captured! Available in UI dashboard.`);
        } catch (e) {
          console.error('[AUTOMATOR] Failed to take CAPTCHA screenshot:', e.message);
        }

        await notifier.sendAlert({
          title: `Action Required: Human Verification Needed!`,
          message: `CAPTCHA or security verification encountered for ${activeSession.jobTitle} at ${activeSession.companyName}. Please complete verification.`,
          url: activeSession.currentUrl,
          type: 'captcha'
        });
      }
    }, 2500);

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

    log(`Form pre-filled! Session ready.`);

  } catch (err) {
    log(`Error during application automation: ${err.message}`);
    if (activeSession.status !== 'CAPTCHA_DETECTED') {
      activeSession.status = 'FAILED';
    }
    await closeActiveBrowser();
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

    const frames = page.frames();
    for (const frame of frames) {
      const frameUrl = frame.url().toLowerCase();
      if (frameUrl.includes('recaptcha') || frameUrl.includes('hcaptcha') || frameUrl.includes('turnstile')) {
        return true;
      }
    }
  } catch (e) {}
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
 * Stop/cancel application session and free memory
 */
async function stopWorkflow() {
  await closeActiveBrowser();
  activeSession.status = 'IDLE';
  activeSession.hasCaptchaImage = false;
  log(`Workflow cancelled by user. RAM freed.`);
}

module.exports = {
  getAutomationStatus,
  getCaptchaImagePath,
  startApplicationWorkflow,
  resolveCaptcha,
  stopWorkflow
};
