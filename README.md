# OmniTools SaaS — 24/7 Automated Digital Utilities Suite ⚡

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-5%20Passing-brightgreen.svg)](test/api.test.js)
[![Zero-Dependency](https://img.shields.io/badge/Dependencies-0%20External-orange.svg)](#architecture)

> A modern, zero-dependency, automated 3-in-1 Micro-SaaS utility suite designed for high-intent search traffic and passive revenue. Built with vanilla Node.js, Tailwind CSS, and client-side SheetJS.

---

## 🌟 Live Demo & Web Deployment

- **Landing Portal**: `index.html`
- **DocTable AI (Bank Statement to Excel)**: `tool-table-extractor.html`
- **LeadPulse B2B (Targeted Lead Finder)**: `tool-lead-scraper.html`
- **RelayForm (Headless Form Relay)**: `tool-form-backend.html`
- **Pricing & Checkout**: `pricing.html`

---

## 🚀 The 3 Core Automated Utilities

### 1. 📊 DocTable AI — Bank Statement & Invoice Table Extractor
- **The Problem**: Accounting teams and small business owners manually retype transactions from bank PDFs (KBank, SCB, Chase, Bangkok Bank) into Excel.
- **The Solution**: Automatic column detection (Date, Description, Reference, Withdrawal, Deposit, Balance) with client-side SheetJS export into clean `.xlsx` and `.csv`.
- **Privacy First**: Zero credentials needed; runs client-side in-browser with zero data persistence.

### 2. 🎯 LeadPulse B2B — Targeted Business Lead Discovery
- **The Problem**: Agencies and B2B founders need local business leads (e.g., Dental Clinics, Solar Contractors, Law Firms) with verified direct contact info.
- **The Solution**: Query by industry and metropolitan area to extract enriched contact records: business name, verified email, direct phone line, Google Maps rating, and review counts.
- **Monetization**: 5 free unmasked leads per query; premium lock on complete 480+ contact datasets with 1-click checkout.

### 3. 🛡️ RelayForm — Headless Form Backend & Webhook Relay
- **The Problem**: Static websites (HTML, Webflow, Framer, React/Next.js) need form handling without maintaining a dedicated backend server or paying \$40/month for Formspree.
- **The Solution**: Point any form `action="https://.../api/f/{formId}"`. Automatically intercepts spam with built-in hidden honeypots (`_gotcha`), logs submissions, and supports CSV export.

---

## 🛠️ Architecture & Philosophy

- **Zero External Dependencies**: The backend uses 100% native Node.js core modules (`node:http`, `node:fs`, `node:path`, `node:test`, `node:assert`). No `express`, no heavy ORM, no vulnerability debt.
- **Dual-Mode Execution**:
  1. **Full-Stack Node.js**: Run locally or on serverless Node environments (Vercel, Render, Railway).
  2. **Static Client Fallback**: Can run 100% in-browser on GitHub Pages or Cloudflare Pages with graceful client-side parsers and storage simulation.
- **Modern Dark Glassmorphism**: Tailwind CSS, Lucide icons, responsive mobile-first layouts, and smooth animations.

---

## ⚡ Quickstart

### Prerequisites
- Node.js 18.0.0+ (Tested on Node.js v24)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/NTWKKM/autotool-saas.git
cd autotool-saas
```

### 2. Run the server
```bash
npm start
```
Open your browser at `http://localhost:3000`.

### 3. Run Automated Tests
```bash
npm test
```

All 5 core endpoint tests will execute via Node's native test runner:
```text
✔ API 1: POST /api/extract-table auto-parses transactions into normalized columns
✔ API 2: GET /api/leads generates enriched B2B leads with category and location
✔ API 3: POST /api/f/:formId captures headless form submissions
✔ API 4: POST /api/f/:formId honeypot filters spam bot submissions
✔ API 5: POST /api/checkout/mock validates payment simulation and issues token
ℹ pass 5 | fail 0
```

---

## 🌐 Public Web Deployment Guide

### Option A: GitHub Pages (Instant 100% Free Hosting)
1. Push this repository to GitHub under your account.
2. In your repository on GitHub, navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**. Your site will be live at:
   `https://<your-username>.github.io/autotool-saas/`

### Option B: Vercel (Full-Stack Serverless)
1. Import the repository into [Vercel](https://vercel.com).
2. Framework Preset: **Other**.
3. Output Directory: Leave blank (root).
4. Click **Deploy**. Vercel will host both static files and API routes automatically.

---

## 💰 24/7 Automated Monetization Engine

- **High-Intent Programmatic SEO**: Captures organic search intent for long-tail keywords ("convert bank statement to excel free", "b2b leads dental bangkok", "headless form endpoint").
- **Zero Social Media Marketing**: Relies exclusively on high-utility utility tools solving painful daily workflows.
- **Merchant of Record**: Ready for plug-and-play Lemon Squeezy or Stripe Payment Links.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Created with precision by **NTWKKM**.
