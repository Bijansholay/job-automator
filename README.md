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

---

## 📁 Repository Structure

```text
job-automator/
├── Dockerfile                  # Production Docker container build
├── docker-compose.yml          # Local container testing & VPS deployment
├── render.yaml                 # 1-Click Render.com deployment blueprint
├── vite.config.js              # Vite dev server configuration & API proxy
├── .env.example                # Environment variables template
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

## ☁️ Deployment (Cloud VPS / PaaS)

### Option 1: Render.com (1-Click Blueprint)
1. Push this repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Blueprint**.
3. Select your repository. Render will automatically detect `render.yaml`, mount a 1GB persistent disk, install Playwright dependencies, and deploy the service.

### Option 2: Docker / Docker Compose (Railway, DigitalOcean, AWS EC2/Lightsail)
Run the containerized application with persistent storage volume:

```bash
docker-compose up -d --build
```

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
