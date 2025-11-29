
/**
 * BACKEND SERVER FOR NURA FINANCE
 * 
 * Instructions:
 * 1. Copy .env.example to .env and fill in your secrets
 * 2. Install dependencies: npm install
 * 3. Run this script: npm run start-bot
 */

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import TelegramBot from 'node-telegram-bot-api';

// Ensure .env is loaded from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const CHAT_ID_PATH = path.join(projectRoot, '.target_chat_id');

// Manually load .env if dotenv didn't pick it up
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// --- CONFIGURATION ---
// Load environment variables from .env file (via dotenv/config)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://bejewelled-lebkuchen-ddb2b1.netlify.app';

// Chat ID where notifications will be sent.
// Can be obtained via /start command or set in .env
let TARGET_CHAT_ID = process.env.TARGET_CHAT_ID || '';

// Try to read persisted chat id from file
try {
  if (!TARGET_CHAT_ID && fs.existsSync(CHAT_ID_PATH)) {
    const saved = fs.readFileSync(CHAT_ID_PATH, 'utf-8').trim();
    if (saved) TARGET_CHAT_ID = saved;
  }
} catch (err) {
  console.warn('Could not read persisted chat id:', err.message);
}

// Debug: Log loaded values (without exposing full secrets)
console.log('📋 Loaded environment variables:');
console.log('   TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? '✓ set' : '✗ NOT SET');
// Supabase removed: not used in this deployment
console.log('   TARGET_CHAT_ID:', TARGET_CHAT_ID || '(will be set via /start)');
console.log('   WEB_APP_URL:', WEB_APP_URL ? `✓ ${WEB_APP_URL}` : '✗ NOT SET');

// --- VALIDATION ---
const errors = [];
if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ Missing required environment variable: TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

// --- INITIALIZATION ---
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 Nura Finance Bot is running...');
console.log('   ✓ Telegram Bot connected');
if (!TARGET_CHAT_ID) {
  console.log('   ⚠️  TARGET_CHAT_ID not set. Send /start to the bot to register your chat ID.');
}

// Realtime DB notifications removed (Supabase not used here).
// If you want to re-enable DB-driven notifications later, implement a provider
// and add the listener back.

// --- Simple JSON storage (local) ---
const DATA_PATH = path.join(projectRoot, 'backend', 'data.json');

function loadData() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      const init = { operations: [], users: {}, meta: {} };
      fs.writeFileSync(DATA_PATH, JSON.stringify(init, null, 2), 'utf-8');
      return init;
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.error('Failed to load data file:', err.message);
    return { operations: [], users: {}, meta: {} };
  }
}

function saveData(d) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(d, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save data file:', err.message);
  }
}

function addOperation(op) {
  const d = loadData();
  d.operations.unshift(op); // newest first
  saveData(d);
}

function getTotals() {
  const d = loadData();
  let income = 0, expense = 0;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let todayExpense = 0, monthExpense = 0;

  for (const t of d.operations) {
    const amt = Number(t.amount) || 0;
    if (t.type === 'INCOME') income += amt; else expense += amt;
    const when = new Date(t.created_at);
    if (t.type === 'EXPENSE' && when >= startOfDay) todayExpense += amt;
    if (t.type === 'EXPENSE' && when >= startOfMonth) monthExpense += amt;
  }

  const balance = income - expense;
  return { income, expense, balance, todayExpense, monthExpense };
}

function formatMoney(n) { return Number(n).toLocaleString('ru-RU') + ' ₽'; }


// Команда /start для получения ID чата
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`User started bot. Chat ID: ${chatId}`);
  TARGET_CHAT_ID = String(chatId);
  // Persist chat id to disk so bot can resume after restart
  try {
    fs.writeFileSync(CHAT_ID_PATH, TARGET_CHAT_ID, 'utf-8');
    console.log('Persisted TARGET_CHAT_ID to', CHAT_ID_PATH);
  } catch (err) {
    console.error('Failed to persist TARGET_CHAT_ID:', err.message);
  }
  const startMsg = `Привет! 👋 Финансовый бот активен и сохранён в этот чат.\n\nКоманды:\n/summary - показать последние операции\n/help - список команд`;
  bot.sendMessage(chatId, startMsg, { parse_mode: 'Markdown' });
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpText = `Доступные команды:\n/summary - последние операции (временно недоступно)\n/help - показать это сообщение`;
  bot.sendMessage(chatId, helpText);
});

// Summary command (stubbed because DB is disabled)
bot.onText(/\/summary/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Команда /summary временно недоступна: источник данных отключён.');
});

// Log command: /log <amount> <category> [note]
bot.onText(/\/log\s+(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const text = match && match[1] ? match[1].trim() : '';
  if (!text) {
    bot.sendMessage(chatId, 'Формат: /log <сумма> <категория> [описание]\nПримеры:\n/log -1500 groceries Магазин\n/log +20000 salary Зарплата');
    return;
  }

  // parse
  const parts = text.split(/\s+/);
  const amountRaw = parts.shift();
  const amountNum = Number(amountRaw.replace(/[^0-9\-+.]/g, '')) || 0;
  const sign = amountRaw.trim().startsWith('-') ? -1 : (amountRaw.trim().startsWith('+') ? 1 : -1);
  const amount = Math.abs(amountNum) * (sign === -1 ? 1 : -1) * (sign === -1 ? 1 : -1); // keep positive number but track type below
  // determine type
  const isIncome = amountRaw.trim().startsWith('+');
  const type = isIncome ? 'INCOME' : 'EXPENSE';

  const category = parts.length > 0 ? parts.shift() : 'other';
  const note = parts.join(' ') || '';

  const op = {
    id: 'op_' + Date.now(),
    amount: Math.abs(amountNum),
    type,
    category,
    note,
    author: (msg.from && (msg.from.username || (msg.from.first_name || '') + ' ' + (msg.from.last_name || '')) ) || 'user',
    created_at: new Date().toISOString(),
  };

  addOperation(op);

  const confirm = `✅ Операция добавлена:\n${type === 'EXPENSE' ? '-' : '+'}${formatMoney(op.amount)} — ${op.category}${op.note ? ' — ' + op.note : ''}`;
  bot.sendMessage(chatId, confirm);

  // send notification to target chat (if different) or the same chat
  const notifyChat = TARGET_CHAT_ID || chatId;
  const notifyMsg = `${type === 'EXPENSE' ? '💸' : '💰'} Новая операция:\n${op.author}: ${op.category} — ${type === 'EXPENSE' ? '-' : '+'}${formatMoney(op.amount)}\n${op.note}\n[Открыть приложение](${WEB_APP_URL})`;
  bot.sendMessage(notifyChat, notifyMsg, { parse_mode: 'Markdown', disable_web_page_preview: true }).catch(() => {});
});

// Balance command: quick totals
bot.onText(/\/balance/, (msg) => {
  const chatId = msg.chat.id;
  const t = getTotals();
  const text = `Баланс: ${formatMoney(t.balance)}\nДоходы: ${formatMoney(t.income)}\nРасходы: ${formatMoney(t.expense)}\nРасходы сегодня: ${formatMoney(t.todayExpense)}\nРасходы за месяц: ${formatMoney(t.monthExpense)}`;
  bot.sendMessage(chatId, text);
});

// Daily summary scheduler: send at 21:00 server time
function scheduleDailyReport(hour = 21, minute = 0) {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const ms = next - now;
  setTimeout(() => {
    try { sendDailyReport(); } catch (e) { console.error('Daily report error:', e.message); }
    // schedule every 24h
    setInterval(() => { try { sendDailyReport(); } catch (e) { console.error('Daily report error:', e.message); } }, 24 * 60 * 60 * 1000);
  }, ms);
}

function sendDailyReport() {
  const chat = TARGET_CHAT_ID;
  if (!chat) return console.log('Daily report skipped: TARGET_CHAT_ID not set');
  const t = getTotals();
  const body = `Ежедневный отчёт — ${new Date().toLocaleDateString('ru-RU')}:\nБаланс: ${formatMoney(t.balance)}\nКапитал (итог): ${formatMoney(t.income - t.expense)}\nРасходы за сегодня: ${formatMoney(t.todayExpense)}\nРасходы за месяц: ${formatMoney(t.monthExpense)}`;
  bot.sendMessage(chat, body).catch((e) => console.error('Send daily report failed:', e.message));
}

// Start scheduler
scheduleDailyReport(21, 0);
