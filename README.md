# Finbot - Financial Analytics App 💰

A React web app for managing transactions and passive income (capital) accounts. Real-time sync with Convex backend, designed for financial tracking with delightful UI/UX.

## ✨ Features

- 📊 **Transaction Tracking** — Add, view, and delete transactions with smooth animations
- 💼 **Savings/Capital Management** — Track investment accounts with APY calculations
- 📈 **Income Projections** — Visualize 12-month growth with Recharts charts
- 🎨 **Beautiful UI** — Dark theme with gradient effects, smooth animations, accessible design
- ⚡ **Real-time Sync** — Convex backend for instant updates across devices
- 🔐 **Secure** — Server-side validation, environment variables for secrets
- 📱 **Mobile Responsive** — Touch-friendly on all devices (375px to 1920px)
- ♿ **Accessible** — WCAG AA compliant, keyboard navigation, screen reader support

## 📁 Project Structure

```
finbot-analytics/
├── components/
│   ├── UI/                    # Shared component library (Button, Input, Card, Modal, etc.)
│   ├── SavingsView.tsx        # Capital/savings main view
│   ├── SavingsHeader.tsx      # Header with balance and income breakdown
│   ├── AccountsList.tsx       # List of savings accounts
│   ├── AddAccountModal.tsx    # Modal to add new account
│   ├── ProjectionChart.tsx    # Growth projection chart
│   ├── TransactionItem.tsx    # Individual transaction component
│   ├── ChartsView.tsx         # Analytics charts
│   └── ...
├── services/
│   ├── convexClient.ts        # Convex client configuration
│   ├── geminiService.ts       # AI/LLM integration (Google Gemini)
│   ├── utils.ts               # Utility functions (format, calculate, parse)
│   └── __tests__/             # Unit tests for services
├── convex/
│   ├── functions.ts           # Convex API endpoints
│   ├── schema.ts              # Data model schema
│   └── _generated/            # Auto-generated Convex types
├── App.tsx                    # Main application component
├── index.tsx                  # React entry point
├── types.ts                   # Shared TypeScript interfaces
├── index.css                  # Global styles, animations, themes
├── tailwind.config.js         # Design tokens (colors, spacing, motion)
├── DESIGN.md                  # Design system documentation
├── ARCHITECTURE.md            # Architecture & development guide
├── CONTRIBUTING.md            # Contributing guidelines
├── package.json
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy template and add your Convex project ID:

```bash
cp .env.example .env
```

Edit `.env` with your Convex credentials.

### 3. Run Development Server

```bash
npm run dev
```

Opens at `http://localhost:3001` (or next available port).

### 4. Build for Production

```bash
npm run build
npm run preview  # Test production build locally
```

## 📚 Documentation

- **[DESIGN.md](./DESIGN.md)** — Color tokens, spacing scale, typography, animations, component patterns
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Project structure, state management, data flow, testing strategy
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — PR workflow, commit conventions, code style, linting rules

## 🔧 Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm test             # Run unit tests (if configured)
```

## 🎯 Key Features Explained

### Transactions
Add daily expenses, categorize, and track spending. Auto-calculate balance. Delete with undo.

### Savings/Capital
Track investment accounts (bank deposits, stocks, crypto) with APY rates.  
See daily, monthly, yearly passive income.

### Projections
12-month chart showing compound interest growth with monthly breakdown.

### Budget Header
Shows total balance (transactions only, excludes savings).

## 🎨 Design System

All components follow a cohesive design system defined in `DESIGN.md`:

- **Colors**: Dark theme with semantic colors (profit=green, loss=red)
- **Spacing**: 4px, 8px, 12px, 16px, 24px, 32px scale
- **Motion**: fast (150ms), normal (300ms), slow (500ms) durations
- **Typography**: H1–XS scale with consistent font weights
- **Accessibility**: WCAG AA contrast, focus styles, ARIA labels

## 🧪 Testing

### Unit Tests
```bash
npm test  # Run Jest + React Testing Library tests
```

### Manual Testing
- **Mobile**: 375px, 768px, 1024px widths
- **Keyboard**: Tab, Enter, Escape navigation
- **Screen Reader**: Test with NVDA, JAWS, or Mac VoiceOver
- **Performance**: Lighthouse audit (target >90)

### E2E Tests (Cypress, if configured)
```bash
npm run e2e         # Run Cypress tests
npm run e2e:ui      # Open Cypress UI
```

## 🔒 Security

- ✅ No API keys in frontend code (use env variables)
- ✅ Server-side validation for all inputs
- ✅ XSS protection via React's built-in escaping
- ✅ CSRF protection via Convex (when deployed)
- ✅ Rate limiting on sensitive endpoints

### Environment Variables

Never commit `.env`! Create `.env.example` with template:

```
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_GEMINI_API_KEY=your-key-here  # if using Gemini
```

## 📦 Dependencies

### Core
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **Vite** — Fast build tool

### UI & Animations
- **lucide-react** — 300+ icons
- **Recharts** — React chart library
- **Framer Motion** — Advanced animations (optional)

### Backend & State
- **Convex** — Backend API & real-time sync
- **React Hooks** — State management

### Dev Tools
- **ESLint** — Code linting
- **Prettier** — Code formatting
- **Jest** — Unit testing (optional)
- **Cypress** — E2E testing (optional)

## 🚢 Deployment

### Staging
```bash
npm run build
npm run deploy:staging  # Deploy to staging Convex instance
```

### Production
```bash
npm run build
npm run deploy:prod    # Deploy to production
# Monitor for errors:
npm run monitor        # Check Sentry/error logs
```

Deploy to:
- **Netlify** — Frontend (auto-deploy on git push)
- **Convex** — Backend (auto-sync with git)

## 🐛 Debugging

### Development
- Open `DevTools` (F12 → Console tab)
- Check for errors/warnings
- Use React DevTools extension for component inspection

### Lighthouse Audit
```bash
npm run build
npm run preview
# Open DevTools → Lighthouse tab
# Target: Performance >90, Accessibility >95, Best Practices >90
```

### Network Issues
- DevTools → Network tab
- Monitor Convex API calls
- Check browser console for CORS errors

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Branch naming conventions
- Commit message format
- Testing requirements before PR
- Code style guidelines

## 📜 License

MIT © 2025 Finbot Contributors

## 📧 Support

For issues, feature requests, or questions:
1. Check [existing issues](https://github.com/turbanpolina26-cell/finbot/issues)
2. Create a new issue with clear description
3. For security issues, email privately (do not create public issue)

---

**Happy tracking!** 💸📊✨


Edit `.env`:

```env
# Telegram Bot Token (from @BotFather on Telegram)
TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE

# Supabase API (from Project Settings → API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_public_key

# Your Netlify deployment
WEB_APP_URL=https://bejewelled-lebkuchen-ddb2b1.netlify.app

# Chat ID (set via /start command, optional)
TARGET_CHAT_ID=your_telegram_chat_id
```

### 3. Get Your Credentials

#### Telegram Bot Token
1. Message `@BotFather` on Telegram
2. Use `/newbot` → follow prompts
3. Copy the token provided

#### Supabase Keys
1. Go to Supabase Dashboard → Your Project
2. Click **Settings** → **API**
3. Copy **Project URL** and **anon public** key

#### Telegram Chat ID
1. Start the bot: `npm run start-bot`
2. Send `/start` to your bot in Telegram
3. Check console for `Chat ID: XXXXXXXXX`
4. Add to `.env`: `TARGET_CHAT_ID=XXXXXXXXX`

### 4. Start the Bot

```bash
npm run start-bot
```

Output:
```
📋 Loaded environment variables:
   TELEGRAM_BOT_TOKEN: ✓ set
   SUPABASE_URL: ✓ https://wdoymosbqdlqqzujgmax.supabase.co
   SUPABASE_KEY: ✓ (208 chars)
   TARGET_CHAT_ID: 750363011
   WEB_APP_URL: ✓ https://bejewelled-lebkuchen-ddb2b1.netlify.app
🤖 Nura Finance Bot is running...
   ✓ Telegram Bot connected
   ✓ Supabase connected
```

### 5. Run Web App Locally

```bash
npm run dev
```

Opens at `http://localhost:5173`

## 🧪 Testing the Bot

1. Start bot: `npm run start-bot`
2. Message bot on Telegram: `/start`
3. Bot responds with link to web app
4. Add a transaction in the web app or Supabase
5. Bot sends Telegram notification with link

Example notification:
```
💸 Новая операция

🦁 Илья: Groceries
-₽1,200

[📊 Открыть приложение](https://bejewelled-lebkuchen-ddb2b1.netlify.app)
```

## 📦 Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start frontend dev server (Vite) |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run start-bot` | Start Telegram bot (Node.js) |

## 🌐 Deployment

### Web App (Netlify)

The React frontend is automatically deployed to Netlify when you push to GitHub.

**For detailed deployment instructions**, see [`DEPLOYMENT.md`](./DEPLOYMENT.md)

Quick summary:
1. Push code to GitHub
2. Netlify auto-builds and deploys
3. Live at your Netlify URL

### Telegram Bot

The bot must run continuously. Options:
- **Local Machine**: `npm run start-bot` (simple, not 24/7)
- **VPS**: Deploy to DigitalOcean, AWS, or similar
- **Serverless**: Use Vercel/AWS Lambda (requires webhooks instead of polling)
- **Service Manager**: Use NSSM on Windows for persistent service

## 🔐 Security

⚠️ **Critical Security Notes:**

- ✅ `.env` is in `.gitignore` — never commit secrets
- ✅ Use strong, unique Telegram bot tokens
- ✅ Keep Supabase keys private
- ✅ For production: use secret management (AWS Secrets, GitHub Secrets, etc.)
- ✅ Never expose keys in logs or error messages

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript |
| UI Components | Lucide React, Recharts |
| Backend | Node.js, Telegram Bot API |
| Database | Supabase (PostgreSQL) |
| API Integration | Google Gemini API |
| Hosting | Netlify (frontend) |

## 📝 Bot Commands

| Command | Action |
|---------|--------|
| `/start` | Register chat ID & receive web app link |

## 🌐 Web App Integration

The Netlify web app is automatically linked in all bot messages. Users can click to:
- View transaction history
- See analytics charts
- Track savings goals
- Manage budgets

**Web App URL:** https://bejewelled-lebkuchen-ddb2b1.netlify.app

## 🐛 Troubleshooting

### Bot won't start
```bash
# Check Node version
node -v  # Should be 16+

# Reinstall deps
rm -r node_modules
npm install

# Check .env file exists
ls -la .env
```

### No notifications received
- Verify `TARGET_CHAT_ID` is set in `.env`
- Check Supabase `transactions` table exists
- Ensure table has proper insert triggers
- Monitor bot logs: `npm run start-bot`

### Web app link broken
- Verify `WEB_APP_URL` in `.env`
- Check Netlify deployment is live
- Test URL manually in browser

### Telegram connection issues
- Verify internet connection
- Check token hasn't expired
- Message `@BotFather` for token status
- Verify no IP restrictions

## 📚 Documentation

- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)

## 📄 License

Private project — Nura Finance

---

Made with ❤️ for financial tracking