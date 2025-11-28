# Nura Finance Bot 💰

A Telegram bot for financial notifications integrated with Supabase and a React web app dashboard.

## ✨ Features

- 📱 **Telegram Notifications** — Instant alerts for new transactions
- 💾 **Supabase Integration** — Real-time database synchronization  
- 📊 **Web Dashboard** — React app deployed on Netlify
- 🔐 **Secure Configuration** — Environment variables for secrets management
- 🔔 **Real-time Updates** — WebSocket connection to Supabase for instant notifications

## 📁 Project Structure

```
finbot-analytics/
├── backend/
│   └── bot.js                 # Telegram bot server (Node.js)
├── components/
│   ├── ChartsView.tsx         # Transaction charts
│   ├── SavingsView.tsx        # Savings analytics
│   └── TransactionItem.tsx    # Transaction list item
├── services/
│   ├── geminiService.ts       # Google Gemini API integration
│   └── supabaseClient.ts      # Supabase client config
├── App.tsx                    # Main React app
├── index.tsx                  # React entry point
├── .env                       # Environment variables (⚠️ not in repo)
├── .env.example               # Template for .env
├── package.json
├── vite.config.ts
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy template and fill with your credentials:

```bash
cp .env.example .env
```

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