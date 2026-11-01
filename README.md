# PrivaScan - Personal Data Exposure Scanner & Removal Management Platform

> **A commercial-grade, privacy-first SaaS platform designed to discover where personal information is publicly exposed across the internet and manage lawful removal under the India Digital Personal Data Protection Act (DPDP Act, 2023) and GDPR.**

---

## 🌟 Key Highlights & Real Data Guarantee

Unlike mock demonstrations or simulated tools, **PrivaScan runs real live queries and checks against authentic public sources and breach registries**:
- **Zero Mock Data**: Every scan queries live public breach archives, real OSINT directories, Git commit logs, and telecom records.
- **Authentic Exposure Intelligence**:
  - **Live Breach Indexing**: Direct integration with XposedOrNot public breach analytics (200+ verified corporate leak catalogs).
  - **Public Profile Discovery**: Gravatar public identity indexing, GitHub commit author email tracing, and 18+ live social platforms.
  - **Telecom & Caller-ID Footprint**: Libphonenumber carrier verification, TRAI DND (1909) India registration procedures, and Truecaller unlisting pipeline.
  - **Search Engine Dorking**: Targeted queries for leaked PDFs, confidential spreadsheets, Pastebin dumps, and Google *Results about you* de-indexing tools.
- **Lawful Remediation Workflows**:
  - Automated Statutory Demand Notices under **India DPDP Act 2023 (Section 12)**, **EU GDPR (Article 17)**, and **California CCPA (§ 1798.105)**.
  - Direct `mailto:` dispatcher with pre-filled Data Protection Officer (DPO) emails, subject, and statutory citations.
  - Directory of 16+ major data brokers and aggregators (Truecaller, Justdial, IndiaMART, Spokeo, Whitepages, ZoomInfo, Apollo.io, Lusha, etc.) with exact opt-out URLs and turnaround times.

---

## 🏛️ The 4 Core Product Stages

1. **Discover**: Authorized scanning of public breach indices, directories, telecom carriers, and search engines.
2. **Analyze**: Categorized exposure findings with match confidence indicators, compromised fields (passwords, phone numbers, addresses), and risk scoring.
3. **Request Removal**: Consent-driven statutory notice generation, direct DPO dispatch, and guided manual opt-outs.
4. **Monitor**: Progress tracking (Submitted, In Progress, Verified Removed, Manual Action Required) with verifiable audit histories.

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch (Windows)
Double-click [`start.bat`](file:///e:/mail%20id%20used%20detector/start.bat) or run in your terminal:
```bash
python run_app.py
```
This launches the unified server at **`http://localhost:8000`** and opens your default browser automatically.

### Option 2: Run Backend and Frontend in Development Mode
**Backend:**
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

**Frontend (Vite React):**
```bash
cd frontend
npm run dev
```

---

## 📂 Project Architecture

```
e:\mail id used detector\
├── backend\
│   ├── main.py                     # FastAPI application entry point & static SPA router
│   ├── database.py                 # SQLite database schema (Users, Scans, Findings, Removals, Consent)
│   ├── auth.py                     # JWT token authentication & SHA-256 salted password hashing
│   ├── connectors\
│   │   ├── email_breach.py         # Live XposedOrNot breach analytics API connector
│   │   ├── gravatar.py             # Gravatar public directory profile lookup
│   │   ├── github_osint.py         # GitHub public commit log and profile search
│   │   ├── phone_osint.py          # Libphonenumber telecom metadata & Truecaller/TRAI DND
│   │   ├── username_osint.py       # Concurrent real HTTP checks on 18+ public platforms
│   │   ├── google_dorks.py         # Search engine dorking & Google "Results about you"
│   │   ├── broker_registry.py      # Database of 16+ data brokers with opt-out URLs & DPO emails
│   │   └── legal_generator.py      # DPDP 2023 / GDPR Art. 17 / CCPA statutory notice engine
│   └── routers\
│       ├── auth_routes.py          # Register, Login, JWT session management
│       ├── identifier_routes.py    # Monitored identifiers (Add, Mask, Verify, Delete)
│       ├── scan_routes.py          # Real-time discovery execution & findings retrieval
│       ├── consent_routes.py       # Consent ledger & revocation
│       ├── removal_routes.py       # Removal requests, statutory notices & status updates
│       └── stats_routes.py         # Dashboard metrics, data portability export & account purge
├── frontend\
│   ├── src\
│   │   ├── App.jsx                 # Central application controller & state manager
│   │   ├── api.js                  # REST API client
│   │   └── components\
│   │       ├── Navbar.jsx          # Top navigation & system status
│   │       ├── DashboardView.jsx   # Executive posture, risk meter, metrics, and activity
│   │       ├── ScanView.jsx        # Stage 1 & 2: Live discovery scanner & exposure report
│   │       ├── RemovalsView.jsx    # Stage 3 & 4: Removal requests & progress tracking
│   │       ├── IdentifiersView.jsx # Monitored contact points & privacy masking
│   │       ├── BrokersView.jsx     # Curated directory of 16+ global & India brokers
│   │       ├── ConsentView.jsx     # Verifiable consent ledger & audit log
│   │       ├── PricingView.jsx     # Commercial SaaS business plans (Free, Pro, Family, Enterprise)
│   │       ├── SettingsView.jsx    # Data portability export (.json) & account purge
│   │       ├── AuthModal.jsx       # Sign in / Register modal with instant demo access
│   │       ├── ConsentModal.jsx    # Transparent pre-scan authorization checkpoint
│   │       └── LegalNoticeModal.jsx# Interactive statutory notice generator & mailto launcher
│   └── dist\                       # Production static bundle served by FastAPI
├── run_app.py                      # Production startup script with auto browser launcher
├── start.bat                       # Windows double-click runner
└── test_e2e.py                     # Full stack end-to-end integration test suite
```

---

## 💼 Business & Monetization Model

The application comes pre-built with commercial business tiers:
1. **Community Defense (Free)**: 1 monitored identifier, basic exposure reports, and manual removal guidance.
2. **Pro Privacy Shield (₹499/mo / $9/mo)**: Continuous monitoring, automated DPDP Act 2023 & GDPR notices, 5 identifiers, weekly re-scans.
3. **Family Guard (₹1,299/mo / $19/mo)**: Covers up to 5 family members (25 identifiers), individual consent workflows, robocall suppression.
4. **Executive & Enterprise (₹4,999/mo / $59/mo)**: B2B protection for leadership teams, custom DPO correspondence, compliance exports.

---

## ⚖️ Legal & Regulatory Compliance

- **India DPDP Act 2023**: Implements Section 12 (Right to Correction and Erasure) and Section 13 (Grievance Redressal).
- **EU GDPR**: Implements Article 17 (Right to Erasure / Right to be Forgotten) and Article 20 (Right to Data Portability).
- **US CCPA / CPRA**: Implements Cal. Civ. Code § 1798.105 (Consumers' Right to Delete Personal Information).
- **Cryptographic Audit Trail**: Every authorization and consent grant is logged with UTC timestamps and purpose tags.
