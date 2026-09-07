# JobCraft AI — AI Job Application & Resume Reformatter 🚀

**JobCraft AI** is an intelligent, full-stack application designed to streamline job applications. It extracts target job keywords, dynamically tailors resumes and cover letters using AI, automates browser form-filling using Playwright, captures live CAPTCHA challenges for remote resolution, and sends real-time push notifications across Desktop OS and Mobile (Telegram & Discord).

---

## ✨ Features

* **🧠 AI-Powered Resume & Cover Letter Tailoring**
  * Parses job postings to extract critical technical skills, tools, and domain keywords.
  * Calculates an **ATS Keyword Match Score (%)** comparing your baseline resume against target requirements.
  * Dynamically re-writes summaries and work experience highlights using a smart local rule engine or deep AI re-writing via **Google Gemini API**.
  * Generates ATS-optimized HTML/CSS resume previews.

* **🤖 Playwright Browser Automation**
  * Launches browser sessions to navigate job postings (such as Indeed and direct application portals).
  * Automatically pre-fills applicant contact details (Full Name, Email, Phone, Location) and uploads tailored resumes.
  * Live console log feed for monitoring DOM element detection and form interaction.

* **🚨 CAPTCHA & Security Alert System**
  * Detects CAPTCHA, Cloudflare Turnstile, hCaptcha, and 2FA verification prompts in real-time.
  * **Live Screenshot Capture**: Takes a snapshot of the verification screen and displays it directly in the web UI for remote viewing.
  * **Cross-Platform Push Notifications**:
    * **Desktop OS Alerts**: Native macOS/Windows notifications with audio chimes.
    * **Mobile Push Alerts**: Instant notifications via **Telegram Bot** (iOS & Android).
    * **Discord Webhooks**: Rich embed alerts in private Discord channels.

* **💾 Persistent Storage & Application Tracking**
  * Centralized database adapter storing baseline personal profiles, skills, and work experience.
  * Keeps a complete application history tracking company names, job titles, application dates, match scores, and direct job links.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS (Glassmorphism design system)
* **Backend**: Node.js, Express.js, CORS
* **Automation**: Playwright (Chromium)
* **Notifications**: `node-notifier`, Telegram Bot API, Discord Webhooks API
* **AI Integration**: Google Gemini API (`@google/generativelanguage`)
* **CI/CD**: GitHub Actions, Docker, Docker Compose

---

## 📁 Repository Structure

```text
job-automator/
├── Dockerfile                  # Production Docker container build
├── docker-compose.yml          # Local container testing & VPS deployment
├── render.yaml                 # Render.com deployment blueprint
├── vite.config.js              # Vite dev server configuration & API proxy
├── .env.example                # Environment variables template
├── scripts/
│   └── deploy-aws.sh           # AWS automated setup & deployment script
├── .github/
│   └── workflows/
│       └── deploy-aws-lightsail.yml # GitHub Actions automated CI/CD for AWS
├── server/
│   ├── server.js               # Express API server & static build host
│   ├── db/
│   │   └── database.js         # Unified database storage module
│   └── modules/
│       ├── automator.js        # Playwright browser engine & screenshot capture
│       ├── notifier.js         # Telegram, Discord & Desktop alert dispatcher
│       ├── pdfGenerator.js     # ATS HTML resume template generator
│       └── resumeTailor.js     # AI keyword parser & resume re-writer
└── src/
    ├── App.jsx                 # Root React layout & tab router
    ├── components/
    │   ├── JobAnalyzer.jsx     # Job description parser & resume reformatter
    │   ├── AutoFillController.jsx # Browser automation controller & live feed
    │   ├── MasterResumeEditor.jsx # Baseline resume storage editor
    │   ├── ApplicationTracker.jsx # Application history table
    │   └── NotificationSettings.jsx # Cross-platform alert setup
    └── styles/
        └── index.css           # Premium glassmorphism design tokens & styles
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Bijansholay/job-automator.git
cd job-automator
npm install
```

Install Playwright Chromium browser binaries:
```bash
npx playwright install chromium
```

### 3. Running Locally
Start the backend Express server (Port `5001`):
```bash
npm run server
```

In a second terminal, start the Vite frontend server (Port `3000`):
```bash
npm run dev
```

Open your browser to `http://localhost:3000`.

---

## ☁️ AWS Deployment (AWS Lightsail / EC2)

Deploying on **AWS Lightsail** or **AWS EC2** provides dedicated RAM (1GB to 2GB+) with zero memory throttling for Playwright browser automation.

### 1. Create an AWS Lightsail or EC2 Instance
* Log into the **AWS Management Console** -> Go to **AWS Lightsail** (or EC2).
* Click **Create Instance** -> Choose **Ubuntu 22.04 LTS**.
* Select the **$3.50/mo** or **$7/mo** plan (1GB - 2GB RAM).
* Under **Networking**, open HTTP port **80** and Custom TCP port **5001**.

### 2. Connect & Run Automated Deployment Script
SSH into your AWS instance and run:

```bash
curl -fsSL https://raw.githubusercontent.com/Bijansholay/job-automator/main/scripts/deploy-aws.sh | bash
```

This automated script will:
1. Install Docker, Docker Compose, and Git automatically.
2. Clone `job-automator` repository into `/var/www/job-automator`.
3. Build and launch the container on port `5001`.

### 3. Automated CI/CD Setup with GitHub Actions (Optional)
To deploy automatically on `git push` to `main`, add these **Secrets** in your GitHub Repo (**Settings** -> **Secrets and variables** -> **Actions**):

* `LIGHTSAIL_HOST`: Your AWS Instance Public IP address (e.g. `54.123.45.67`)
* `LIGHTSAIL_USER`: `ubuntu`
* `LIGHTSAIL_KEY`: Your SSH Private RSA Key (`cat ~/.ssh/id_rsa` or downloaded `.pem` key file)

Whenever you push code to `main`, GitHub Actions will automatically deploy to AWS!

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` to configure optional integrations:

```env
PORT=5001
NODE_ENV=production
HEADLESS=true

# Optional: Remote Browser Cluster (e.g. Browserless.io)
# BROWSER_WS_ENDPOINT=wss://chrome.browserless.io?token=YOUR_TOKEN

# Optional: Google Gemini AI API Key
# GEMINI_API_KEY=AIzaSy...

# Optional: Telegram Push Alerts
# TELEGRAM_BOT_TOKEN=123456789:ABCdef...
# TELEGRAM_CHAT_ID=987654321

# Optional: Discord Webhook
# DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

---

## 📝 License

This project is licensed under the MIT License.
