import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Configure allowed origins via environment variable (comma-separated).
// If not provided, allow all origins (useful for quick testing). For production, set PROXY_ALLOWED_ORIGINS.
const allowedOriginsEnv = process.env.PROXY_ALLOWED_ORIGINS || '*';
const allowedOrigins = allowedOriginsEnv === '*' ? ['*'] : allowedOriginsEnv.split(',').map(s => s.trim());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser tools like curl/postman
    if (allowedOrigins[0] === '*' || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','apikey','x-client-info'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.text({ type: 'text/plain', limit: '1mb' }));

// Simple REST-like endpoints to avoid CORS preflight in restrictive mobile WebViews.
// - GET /api/transactions -> fetch transactions (no preflight)
// - POST /api/transactions (Content-Type: text/plain) -> add transaction (no preflight)
// - POST /api/deleteTransaction (Content-Type: text/plain) -> delete transaction by id
// Similar endpoints for savings.

const buildSupabaseUrl = (path) => `https://${SUPABASE_REST_HOST}/rest/v1/${path}`;

app.get('/api/transactions', async (req, res) => {
  try {
    const serverKey = process.env.SUPABASE_KEY || '';
    const url = buildSupabaseUrl('transactions?select=*') + '&order=date.desc&limit=100';
    const response = await axios.get(url, {
      headers: {
        Authorization: serverKey.startsWith('Bearer ') ? serverKey : `Bearer ${serverKey}`,
        apikey: serverKey.startsWith('Bearer ') ? serverKey.replace(/^Bearer\s+/i, '') : serverKey,
      },
      timeout: Number(process.env.PROXY_TIMEOUT_MS) || 15000,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('[API] transactions GET error', err?.message || err);
    res.status(err.response?.status || 500).json({ error: err.message || err });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    // Expecting text/plain body containing JSON array/object
    const payloadText = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const body = payloadText ? JSON.parse(payloadText) : [];
    const serverKey = process.env.SUPABASE_KEY || '';
    const url = buildSupabaseUrl('transactions');
    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: serverKey.startsWith('Bearer ') ? serverKey : `Bearer ${serverKey}`,
        apikey: serverKey.startsWith('Bearer ') ? serverKey.replace(/^Bearer\s+/i, '') : serverKey,
      },
      timeout: Number(process.env.PROXY_TIMEOUT_MS) || 15000,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('[API] transactions POST error', err?.message || err);
    res.status(err.response?.status || 500).json({ error: err.message || err });
  }
});

app.post('/api/deleteTransaction', async (req, res) => {
  try {
    const payloadText = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const parsed = payloadText ? JSON.parse(payloadText) : {};
    const id = parsed.id || parsed;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const serverKey = process.env.SUPABASE_KEY || '';
    const url = buildSupabaseUrl(`transactions?id=eq.${encodeURIComponent(id)}`);
    const response = await axios.delete(url, {
      headers: {
        Authorization: serverKey.startsWith('Bearer ') ? serverKey : `Bearer ${serverKey}`,
        apikey: serverKey.startsWith('Bearer ') ? serverKey.replace(/^Bearer\s+/i, '') : serverKey,
      },
      timeout: Number(process.env.PROXY_TIMEOUT_MS) || 15000,
    });
    res.status(response.status).json(response.data || { success: true });
  } catch (err) {
    console.error('[API] deleteTransaction error', err?.message || err);
    res.status(err.response?.status || 500).json({ error: err.message || err });
  }
});

// Savings endpoints
app.get('/api/savings', async (req, res) => {
  try {
    const serverKey = process.env.SUPABASE_KEY || '';
    const url = buildSupabaseUrl('savings?select=*');
    const response = await axios.get(url, {
      headers: {
        Authorization: serverKey.startsWith('Bearer ') ? serverKey : `Bearer ${serverKey}`,
        apikey: serverKey.startsWith('Bearer\s+') ? serverKey.replace(/^Bearer\s+/i, '') : serverKey,
      },
      timeout: Number(process.env.PROXY_TIMEOUT_MS) || 15000,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('[API] savings GET error', err?.message || err);
    res.status(err.response?.status || 500).json({ error: err.message || err });
  }
});

app.post('/api/savings', async (req, res) => {
  try {
    const payloadText = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const body = payloadText ? JSON.parse(payloadText) : [];
    const serverKey = process.env.SUPABASE_KEY || '';
    const url = buildSupabaseUrl('savings');
    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: serverKey.startsWith('Bearer ') ? serverKey : `Bearer ${serverKey}`,
        apikey: serverKey.startsWith('Bearer\s+') ? serverKey.replace(/^Bearer\s+/i, '') : serverKey,
      },
      timeout: Number(process.env.PROXY_TIMEOUT_MS) || 15000,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('[API] savings POST error', err?.message || err);
    res.status(err.response?.status || 500).json({ error: err.message || err });
  }
});

app.post('/api/deleteSaving', async (req, res) => {
  try {
    const payloadText = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const parsed = payloadText ? JSON.parse(payloadText) : {};
    const id = parsed.id || parsed;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const serverKey = process.env.SUPABASE_KEY || '';
    const url = buildSupabaseUrl(`savings?id=eq.${encodeURIComponent(id)}`);
    const response = await axios.delete(url, {
      headers: {
        Authorization: serverKey.startsWith('Bearer ') ? serverKey : `Bearer ${serverKey}`,
        apikey: serverKey.startsWith('Bearer\s+') ? serverKey.replace(/^Bearer\s+/i, '') : serverKey,
      },
      timeout: Number(process.env.PROXY_TIMEOUT_MS) || 15000,
    });
    res.status(response.status).json(response.data || { success: true });
  } catch (err) {
    console.error('[API] deleteSaving error', err?.message || err);
    res.status(err.response?.status || 500).json({ error: err.message || err });
  }
});

// Basic health
app.get('/', (req, res) => res.json({ ok: true, service: 'finbot-proxy' }));

// Only allow proxying to the Supabase REST endpoint. This prevents the server becoming an open proxy.
const SUPABASE_REST_HOST = process.env.SUPABASE_REST_HOST || 'wdoymosbqdlqqzujgmax.supabase.co';

app.options('/supabase', cors(corsOptions));

app.post('/supabase', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, data = {} } = req.body || {};

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid `url` in request body' });
    }

    // Basic safety: only allow requests to Supabase REST host
    try {
      const u = new URL(url);
      if (!u.hostname.endsWith(SUPABASE_REST_HOST)) {
        return res.status(403).json({ error: 'Forbidden host' });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    console.log(`[Proxy] ${method} -> ${url} from ${req.ip} origin=${req.headers.origin || '-'} `);

    // Build forward headers: prefer client headers, but inject server-side SUPABASE_KEY when provided
    const serverKey = process.env.SUPABASE_KEY || null;
    const forwardHeaders = { ...(headers || {}) };
    if (serverKey) {
      const authValue = String(serverKey).startsWith('Bearer ') ? String(serverKey) : `Bearer ${String(serverKey)}`;
      if (!forwardHeaders.Authorization && !forwardHeaders.authorization) {
        forwardHeaders['Authorization'] = authValue;
      }
      if (!forwardHeaders.apikey) {
        forwardHeaders['apikey'] = authValue.replace(/^Bearer\s+/i, '');
      }
    }

    const axiosConfig = {
      url,
      method,
      headers: forwardHeaders,
      data: data || {},
      timeout: Number(process.env.PROXY_TIMEOUT_MS) || 15000,
      validateStatus: () => true, // we'll forward status
    };

    const response = await axios(axiosConfig);

    // Forward response status and data
    // avoid leaking hop-by-hop headers
    const headersToSet = { ...response.headers };
    delete headersToSet['transfer-encoding'];
    res.status(response.status).set(headersToSet).send(response.data);
  } catch (error) {
    console.error('[Proxy] Error:', error?.message || error);
    const status = error.response?.status || 500;
    const details = error.response?.data || null;
    res.status(status).json({ error: error.message, details });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOriginsEnv}`);
  console.log(`SUPABASE_REST_HOST=${SUPABASE_REST_HOST}`);
  // Start bot.js as a child process so a single service starts both proxy and bot.
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const botPath = path.join(__dirname, 'bot.js');
    console.log(`Starting bot from ${botPath}`);
    const botProcess = spawn(process.execPath, [botPath], {
      cwd: __dirname,
      env: process.env,
      stdio: 'inherit'
    });
    botProcess.on('exit', (code, signal) => {
      console.log(`Bot process exited with code=${code} signal=${signal}`);
    });
    botProcess.on('error', (err) => {
      console.error('Failed to start bot process:', err);
    });
  } catch (e) {
    console.error('Error while trying to start bot:', e);
  }
});

// npx wrangler deploy


