# 🔐 MeroAssets — Password Manager

A modern, multi-user password manager with **AES-256 encryption** (per-user keys) and **email-based verification**. Built with React, Tailwind CSS, Express, and MongoDB.

---

## ✨ Features

- **Multi-User** — Each email address gets its own vault with a unique encryption key
- **AES-256 Encryption** — All passwords encrypted at rest; never stored in plain text
- **Email 2FA Auth** — Reveal passwords only after email code verification
- **5-Minute Session Tokens** — Decryption sessions auto-expire; no persistent plaintext exposure
- **Auto-clipboard Clear** — Copied passwords are wiped from clipboard after 30 seconds
- **Full CRUD** — Add, edit, update, delete credentials anytime (password reveal stays locked behind OTP)
- **Categories & Favorites** — Organize by Social, Banking, Work, Shopping, Email, Gaming, etc.
- **Password Generator** — Configurable length (8–32), with uppercase, lowercase, numbers, symbols
- **Strength Meter** — Real-time visual strength analysis as you type
- **Site Favicons** — Auto-fetches site icons for quick visual identification
- **Search & Filter** — Instant search + category + favorites filter
- **Grid / List View** — Toggle between compact grid and list layouts
- **API Security** — Blocks non-browser clients (Postman, curl, etc.)

---

## 🛠 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend  | Node.js, Express 4                  |
| Database | MongoDB (via Mongoose)              |
| Crypto   | AES-256 via CryptoJS (per-user keys)|
| Auth     | Email codes via Nodemailer          |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

Create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/meroassets
PORT=5000
```

### 3. Start the App

**Terminal 1 — Backend:**
```bash
cd server && node index.js
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔒 How It Works

1. Visit `http://localhost:5173` — you'll see the login/register page
2. Enter your email — a **6-digit code** is sent (or printed to server console if SMTP is not configured)
3. Enter the **6-digit code** to verify your identity
4. You're in! Your own private vault 🎉

Each email is a separate user with a **unique AES-256 encryption key**. No one can see another user's passwords.

---

## 🔑 Security Model

```
                    SECURITY MODEL

  ADD PASSWORD
  User → plaintext → AES-256 encrypt (with YOUR key) → MongoDB

  VIEW PASSWORD
  User → Email code → Server verifies → Session token (5 min)
  → Token in sessionStorage → Decrypt with YOUR key → Reveal

  ISOLATION
  User A's credentials are filtered by userEmail + encrypted
  with User A's key → User B cannot access them

  API GATEKEEPING
  Non-browser clients (Postman, curl) blocked without custom header

  CLIPBOARD
  Copy → Auto-clear after 30 seconds

  SESSION
  Expires in 5 minutes → Must re-verify via email code
```

---

## 📁 Project Structure

```
meroassets/
├── server/
│   ├── index.js          # Express API + MongoDB + encryption
│   ├── .env              # Environment variables
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CredentialCard.jsx   # Password card UI
│   │   │   ├── CredentialForm.jsx   # Add/Edit modal
│   │   │   ├── OTPModal.jsx         # Email verification popup
│   │   │   └── PasswordHealth.jsx   # Password strength analysis
│   │   ├── pages/
│   │   │   ├── Setup.jsx            # Login/register (email + code)
│   │   │   └── Dashboard.jsx        # Main dashboard view
│   │   ├── utils/
│   │   │   └── api.js               # Axios + helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── start.sh
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| POST   | `/api/auth/start`     | Send verification code (auto-registers if new) |
| POST   | `/api/auth/verify`    | Verify code → get session token          |
| GET    | `/api/auth/status`    | Check if session token is valid          |
| GET    | `/api/auth/me`        | Get current user's email                 |

### Credentials (all require session token)
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/credentials`              | List yours (passwords masked) |
| GET    | `/api/credentials/:id/reveal`   | Decrypt & return password|
| POST   | `/api/credentials`              | Create new credential    |
| PUT    | `/api/credentials/:id`          | Update credential        |
| DELETE | `/api/credentials/:id`          | Delete credential        |
| GET    | `/api/stats`                    | Get your statistics      |

---

## 🎨 Customization

### Change Session Duration
In `server/index.js`, find and change `5 * 60 * 1000` (5 minutes in ms).

### Use MongoDB Atlas
Replace `MONGODB_URI` in `.env` with your Atlas connection string.

---

## 🛡 Security Notes

- Never commit `.env` to version control
- Use HTTPS in production (required for clipboard API)
- Set `CLIENT_ORIGIN` in `.env` to your frontend domain in production
- The AES encryption key is stored in MongoDB — back it up!
- Each user has a unique encryption key — data is fully isolated
- API routes require the `X-MeroAssets-Client` header — blocks Postman/curl

---

## 📜 License

MIT — use freely, stay secure 🔐
