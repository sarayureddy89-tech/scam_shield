# 🛡️ ScamShield

> **AI-powered, explainable personal digital-safety and scam-prevention assistant.**

ScamShield is a full-stack web application that helps users identify suspicious **messages, URLs, QR codes, and payment requests**.

Instead of simply saying **"Scam" or "Safe"**, ScamShield explains **why** something is suspicious, shows the technical signals that contributed to the score, and provides clear next actions to help users stay safe.

---

## ✨ Core Concept

### Detect → Explain → Protect

ScamShield follows a transparent and explainable risk-analysis approach:

1. 🔍 **Detect** suspicious signals
2. 🧠 **Explain** why those signals matter
3. 📊 **Score** the risk from 0–100
4. 🚦 **Classify** the risk level
5. 🛡️ **Protect** the user with recommended safe actions

The system is designed to be transparent and auditable rather than producing an unexplained black-box result.

---

# 🚀 Features

## 📩 1. Message Scanner

Analyze SMS, email, and other text messages for common social-engineering indicators.

### Detects:

- ⚠️ Urgency and pressure
- 🚨 Fear/threat language
- 🎁 Prize and reward bait
- 🔐 OTP, PIN, CVV and password requests
- 🪪 PAN and Aadhaar requests
- 🏦 Banking-detail requests
- 🏢 Brand/authority impersonation
- ❗ High-pressure formatting

The result provides:

- Risk score
- Risk level
- Explanation
- Technical evidence
- Recommended safe actions

---

## 🔗 2. URL Scanner

Analyze suspicious links before users interact with them.

### Checks for:

- Suspicious top-level domains
- IP-based URLs
- Lookalike / typosquatted domains
- Excessive subdomains
- Suspicious verification/lure patterns
- Blacklisted or reported domains
- Shortened/redirect links where applicable

---

## 📱 3. QR Code Scanner

Scan QR codes and analyze their decoded payload.

Supports:

- 🌐 URL QR codes
- 💳 UPI payment QR codes
- 📝 Plain-text QR codes
- 🖼️ QR image uploads
- 📋 Direct decoded-payload input

QR payloads are automatically routed to the appropriate analyzer.

---

## 💳 4. Payment / UPI Scanner

Analyze payment requests using multiple risk signals.

### Checks for:

- 💰 Unusually high payment amounts
- ⚠️ Malformed UPI handles
- 🚨 Reported scam UPI IDs
- 🔍 Unrecognized PSP handle suffixes
- 🎯 Suspicious lure keywords
- ⏱️ Payment requests combined with urgency/social-engineering language

---

## 🔐 5. Authentication

ScamShield includes user authentication with:

- User signup
- User login
- JWT-based authentication
- Protected user history
- Logout
- User-specific scan records

---

## 📊 6. Scan History

Authenticated users can view their previous scans.

History provides:

- Scan type
- Input summary
- Risk score
- Risk level
- Timestamp
- Scam-avoidance statistics

User-specific scan ownership is enforced for individual scan lookups.

---

## 🌐 7. Community Reports

Users can explicitly report suspicious content to the community.

Features include:

- Report suspicious content
- View community reports
- View reports made by the user
- Community-level visibility of reported scams

---

## 📱 8. Responsive UI

The application is designed to work across different screen sizes.

The navigation includes a responsive mobile menu with:

- Scan
- History
- About
- Sign in / Sign out
- Scan Now

---

# 🎯 Risk Scoring

ScamShield uses a transparent weighted-signal system.

## Risk Levels

| Score | Risk Level |
|------:|------------|
| 0–24 | 🟢 LOW |
| 25–49 | 🟡 MEDIUM |
| 50–74 | 🟠 HIGH |
| 75–100 | 🔴 CRITICAL |

The final score is clamped between **0 and 100**.

Every detected signal contains:

- Signal name
- Weight
- Explanation/detail

This makes the final result auditable.

### Example

```text
Reward / greed bait       +18
Urgency language          +15
Credential request        +30
--------------------------------
Total                      63
Risk Level               HIGH


```

The user doesn't just receive a score — they can see **what contributed to that score**.

---

# 🧠 Technical Approach

ScamShield currently uses a lightweight, offline-friendly **rule-based detection approach**.

## Message Analysis

Uses:

- Keyword matching
- Phrase matching
- Regular expressions
- Brand/authority matching
- Formatting analysis

## URL Analysis

Uses:

- URL parsing
- Suspicious domain detection
- TLD analysis
- Typosquatting/lookalike detection
- URL structure analysis
- Reputation/blacklist signals

## Payment Analysis

Uses:

- UPI validation
- Amount-based rules
- Payment risk indicators
- Social-engineering signals

## QR Analysis

Uses:

- QR decoding
- Payload type identification
- URL/payment/text routing
- Appropriate analyzer selection

## Risk Fusion Engine

The individual analyzer results are combined into a single transparent result containing:

```text
Risk Score
    ↓
Risk Level
    ↓
Why?
    ↓
Technical Evidence
    ↓
Recommended Safe Actions
```

This provides an explainable result instead of a black-box prediction.

The architecture also allows the current rule-based NLP layer to be extended or replaced with a trained ML model in the future.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │    User / Browser    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ React + Vite         │
                    │ Frontend             │
                    │                      │
                    │ Message Scanner      │
                    │ URL Scanner          │
                    │ QR Scanner           │
                    │ Payment Scanner      │
                    │ History              │
                    │ Community Reports    │
                    └──────────┬───────────┘
                               │
                         REST API / JSON
                               │
                               ▼
                    ┌──────────────────────┐
                    │ FastAPI Backend      │
                    │                      │
                    │ Authentication       │
                    │ Scan Routes          │
                    │ Community Routes     │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │ NLP         │  │ URL         │  │ Payment     │
       │ Analyzer    │  │ Analyzer    │  │ Analyzer    │
       └─────────────┘  └─────────────┘  └─────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ QR Analyzer          │
                    │ + Payload Routing    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Risk Fusion Engine   │
                    │                      │
                    │ Score + Level        │
                    │ Why + Evidence       │
                    │ Safe Actions         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ SQLite Database      │
                    │                      │
                    │ Users                │
                    │ Scans                │
                    │ Community Reports    │
                    └──────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

- React 18
- Vite
- React Router
- Tailwind CSS
- Lucide React
- Recharts
- jsQR

## Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT Authentication
- Password Hashing

## Testing

- pytest
- Risk-engine unit tests

## Deployment

- **Frontend:** Vercel
- **Backend:** Render

---

# 📁 Project Structure

```text
scam_shield/
│
├── backend/
│   ├── app/
│   │   ├── analyzers/
│   │   │   ├── nlp_analyzer.py
│   │   │   ├── url_analyzer.py
│   │   │   ├── qr_analyzer.py
│   │   │   ├── payment_analyzer.py
│   │   │   └── risk_fusion_engine.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth_router.py
│   │   │   ├── scan_router.py
│   │   │   └── community_router.py
│   │   │
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── schemas.py
│   │   └── main.py
│   │
│   └── tests/
│       └── test_risk_engine.py
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── lib/
    │
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

# 🔌 API Endpoints

## Health

```text
GET /api/health
```

## Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

## Scanning

```text
POST /api/scan/message
POST /api/scan/url
POST /api/scan/qr
POST /api/scan/payment
```

## History

```text
GET /api/scan/history
GET /api/scan/{scan_id}
```

## Community

```text
POST /api/community/report
GET /api/community/reports
```

---

# 💻 Run Locally

## Backend

Navigate to the backend directory:

```powershell
cd backend
```

Create a virtual environment:

```powershell
python -m venv venv312
```

Activate the virtual environment on Windows PowerShell:

```powershell
.\venv312\Scripts\Activate.ps1
```

Install the required dependencies:

```powershell
pip install -r requirements.txt
```

Start the FastAPI backend:

```powershell
python -m uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend

Navigate to the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---

# 🔐 Environment Configuration

For production deployment, the frontend communicates with the deployed backend using the following environment variable:

```text
VITE_API_URL=https://scam-shield-1-wazv.onrender.com
```

The frontend API client uses the environment variable to build API requests.

### ⚠️ Important Security Note

Sensitive information should never be committed to the public GitHub repository.

Examples include:

- JWT secrets
- Passwords
- API keys
- Private tokens
- Database credentials

Sensitive configuration should be stored using environment variables.

---

# 🧪 Testing

The backend includes an automated risk-engine test suite.

Run the tests using:

```powershell
pytest
```

## Current Test Result

```text
18 passed
0 failed
```

The automated tests cover:

- Risk-band boundaries
- Score clamping
- URL detection
- Suspicious TLD detection
- Typosquatting
- IP-based URLs
- Urgency detection
- Reward detection
- Credential-request detection
- Payment validation
- High payment amounts
- QR payload routing
- Risk fusion
- Technical evidence
- Safe-message behavior

---

# 🌍 Deployment

ScamShield is deployed as a full-stack application using **Vercel + Render**.

## Backend — Render

The FastAPI backend is deployed on Render.

Backend:

```text
https://scam-shield-1-wazv.onrender.com
```

Swagger API Documentation:

```text
https://scam-shield-1-wazv.onrender.com/docs
```

## Frontend — Vercel

The React frontend is deployed on Vercel.

### Live Application

```text
https://scam-shield-flame.vercel.app
```

The Vercel frontend communicates with the Render backend through the `VITE_API_URL` environment variable.

---

# 🎥 Demo Video

A complete project demonstration video will be added here.

### ▶️ Demo Video

```text
PASTE GOOGLE DRIVE / YOUTUBE / VIDEO LINK HERE
```

> **Note:** The demo video link will be updated after the final demonstration video is uploaded.

The demo will showcase:

- User signup and login
- Message scam detection
- Suspicious URL detection
- QR code scanning
- UPI/payment request analysis
- Risk score generation
- Risk-level classification
- Explanation of detected signals
- Technical evidence
- Recommended safe actions
- Scan history
- Community reports
- Responsive navigation
- Live deployed application

---

# 🔒 Security

ScamShield includes several security-focused features.

### Authentication

Users authenticate using JWT-based authentication.

### User-Specific History

Authenticated scan records are associated with their respective users.

### Scan Ownership Protection

Individual user-owned scan records include an authorization check to prevent unrelated users from retrieving another user's scan.

### Environment Variables

Sensitive backend/frontend configuration is kept outside the source code using environment variables where appropriate.

---

# 📌 Current Project Status

## ✅ Completed

- [x] FastAPI backend
- [x] React + Vite frontend
- [x] Message scam analyzer
- [x] URL analyzer
- [x] QR code analyzer
- [x] Payment / UPI analyzer
- [x] Risk Fusion Engine
- [x] 0–100 risk scoring
- [x] Explainable technical evidence
- [x] Recommended safe actions
- [x] User signup
- [x] User login
- [x] JWT authentication
- [x] Scan history
- [x] Community reports
- [x] QR image upload
- [x] Responsive navigation
- [x] Mobile-friendly navbar
- [x] Backend automated tests
- [x] 18/18 tests passing
- [x] Render backend deployment
- [x] Vercel frontend deployment
- [x] Vercel → Render API connection
- [x] Scan ownership authorization improvement

---

# 🔮 Future Improvements

ScamShield can be extended further with:

- 🤖 Advanced NLP / Machine Learning models
- 🧠 AI-based scam classification
- 🌐 Larger real-time threat-intelligence datasets
- 🪪 Improved KYC/phishing-lure detection
- 🛡️ API rate limiting
- 🔐 Stronger production CORS configuration
- 🧪 More comprehensive API integration tests
- 📱 Improved QR image processing
- 🚨 Additional scam categories
- 📊 Advanced analytics/dashboard features
- 🌍 Browser extension
- 📲 Mobile application
- 🔔 Real-time scam alerts

---

# 🏆 Why ScamShield?

Traditional scam detection systems often provide users with only a simple result:

> **Safe or Scam**

ScamShield focuses on **explainability**.

Instead, users receive:

```text
             Risk Score
                 ↓
             Risk Level
                 ↓
                Why?
                 ↓
        Technical Evidence
                 ↓
        What To Do Next
```

This allows users to understand:

- **What suspicious signals were detected**
- **How much each signal contributed**
- **Why the content may be dangerous**
- **What actions they should avoid**
- **What they should do next**

The goal is not only to **detect scams**, but also to help users make **safer digital decisions**.

---

# 🎯 Project Goal

The goal of ScamShield is to provide an accessible and explainable digital-safety assistant capable of analyzing common scam channels from a single platform:

```text
📩 Message
🔗 URL
📱 QR Code
💳 Payment / UPI
```

By combining multiple specialized analyzers with a transparent Risk Fusion Engine, ScamShield provides users with an understandable risk assessment instead of an unexplained prediction.

---

# 👥 Project

## 🛡️ ScamShield

**An explainable digital-safety assistant for detecting and responding safely to online scams.**

---

# 📄 License

A suitable open-source license can be added if the project is released for public reuse or contribution.
