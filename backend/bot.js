
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
import { createClient } from '@supabase/supabase-js';
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
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
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
console.log('   SUPABASE_URL:', SUPABASE_URL ? `✓ ${SUPABASE_URL}` : '✗ NOT SET');
console.log('   SUPABASE_KEY:', SUPABASE_KEY ? `✓ (${SUPABASE_KEY.length} chars)` : '✗ NOT SET');
console.log('   TARGET_CHAT_ID:', TARGET_CHAT_ID || '(will be set via /start)');
console.log('   WEB_APP_URL:', WEB_APP_URL ? `✓ ${WEB_APP_URL}` : '✗ NOT SET');

// --- VALIDATION ---
const errors = [];
if (!TELEGRAM_BOT_TOKEN) errors.push('TELEGRAM_BOT_TOKEN');
if (!SUPABASE_URL) errors.push('SUPABASE_URL');
if (!SUPABASE_KEY) errors.push('SUPABASE_KEY');

if (errors.length > 0) {
  console.error('❌ Missing required environment variables:', errors.join(', '));
  console.error('   Please ensure .env file exists at:', envPath);
  console.error('   See .env.example for instructions.');
  process.exit(1);
}

// --- INITIALIZATION ---
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 Nura Finance Bot is running...');
console.log('   ✓ Telegram Bot connected');
console.log('   ✓ Supabase connected');
if (!TARGET_CHAT_ID) {
  console.log('   ⚠️  TARGET_CHAT_ID not set. Send /start to the bot to register your chat ID.');
}

// --- REALTIME LISTENER ---
// Слушаем изменения в базе данных и отправляем уведомления
supabase
  .channel('backend-notifications')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'transactions' },
    (payload) => {
      const t = payload.new;
      console.log('New transaction detected:', t);
      
      const authorName = t.author_id === 'u1' ? '🦁 Илья' : (t.author_id === 'u2' ? '🌸 Полина' : 'Кто-то');
      const typeIcon = t.type === 'EXPENSE' ? '💸' : '💰';
      const amountStr = Number(t.amount).toLocaleString() + ' ₽';
      const when = new Date(t.created_at || Date.now()).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });

      // Basic sanitizer for Markdown (escape underscores and asterisks)
      const sanitize = (s) => (s ? String(s).replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1') : '—');

      const titleOrCategory = sanitize(t.title || t.category);

      const message = `${typeIcon} *Новая операция*\n\n${authorName}: ${titleOrCategory}\n*${t.type === 'EXPENSE' ? '-' : '+'}${amountStr}*\n_${when}_\n\n[📊 Открыть приложение](${WEB_APP_URL})`;

      if (TARGET_CHAT_ID && TARGET_CHAT_ID !== 'YOUR_CHAT_ID_HERE') {
        bot.sendMessage(TARGET_CHAT_ID, message, { parse_mode: 'Markdown', disable_web_page_preview: true })
          .catch((e) => console.error('Telegram send error:', e.message));
      } else {
        console.log('⚠️ Notification skipped. Set TARGET_CHAT_ID (env or in file).');
        console.log('Message Preview:', message);
      }
    }
  )
  .subscribe();

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

  bot.sendMessage(
    chatId,
    `Привет! 👋 Финансовый бот активен и сохранён в этот чат.\n\nКоманды:\n` +
      `/summary - показать последние операции\n` +
      `/help - список команд\n\n` 
     
    { parse_mode: 'Markdown' }
  );
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpText = `Доступные команды:\n` +
    `/summary - последние 5 операций и итоговые суммы\n` +
    `/help - показать это сообщение`;
  bot.sendMessage(chatId, helpText);
});

// Summary command: last 5 transactions + totals
bot.onText(/\/summary/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id,author_id,type,amount,title,category,created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Supabase summary error:', error.message || error);
      bot.sendMessage(chatId, 'Ошибка при получении данных. Попробуйте позже.');
      return;
    }

    if (!data || data.length === 0) {
      bot.sendMessage(chatId, 'Нет операций для отображения.');
      return;
    }

    const sanitize = (s) => (s ? String(s).replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1') : '—');

    let income = 0;
    let expense = 0;
    const lines = data.map((t) => {
      const when = new Date(t.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
      const amt = Number(t.amount);
      if (t.type === 'EXPENSE') expense += amt; else income += amt;
      const sign = t.type === 'EXPENSE' ? '-' : '+';
      const amountStr = amt.toLocaleString() + ' ₽';
      const title = sanitize(t.title || t.category || '—');
      return `${sign}${amountStr} — ${title} (${when})`;
    });

    const summary = `Последние операции:\n\n` + lines.join('\n') + `\n\nИтого: +${income.toLocaleString()} ₽ / -${expense.toLocaleString()} ₽`;
    bot.sendMessage(chatId, summary);
  } catch (err) {
    console.error('Summary handler error:', err.message);
    bot.sendMessage(chatId, 'Внутренняя ошибка. Попробуйте позже.');
  }
});
