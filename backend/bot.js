
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
