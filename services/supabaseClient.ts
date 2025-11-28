import { Transaction, SavingsAccount, TransactionType, Category } from '../types';

// Cloudflare Worker proxy URL (no direct Supabase WebSocket/Realtime)
const WORKER_URL = 'https://finbot-proxy-worker.turbanpolina26.workers.dev';

// Lightweight stub client (no realtime init)
export const supabase = {
  from: (table: string) => ({
    select: () => ({
      order: () => ({ limit: async () => ({ data: [], error: null }) }),
      limit: async () => ({ data: [], error: null })
    }),
    insert: async (data: any) => ({ error: null }),
    delete: () => ({ eq: async () => ({ error: null }) })
  }),
  channel: () => {
    const self = {
      on: function() { return this; },
      subscribe: async function() { return {}; }
    };
    return self;
  }
};

// Helper function for retries
const retryAsync = async <T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.warn('[Worker] Retrying after error:', error);
      await new Promise(r => setTimeout(r, delay));
      return retryAsync(fn, retries - 1, delay);
    }
    throw error;
  }
};

// Cache helpers
const CACHE_KEY = 'finbot_cached_transactions_v1';
const getCachedTransactions = (): Transaction[] => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};
const setCachedTransactions = (data: Transaction[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Cache error:', e);
  }
};

// --- Transactions API ---

export const fetchTransactions = async (): Promise<{ data: Transaction[] | null; error: any }> => {
  try {
    console.log('[Worker] Fetching transactions...');
    const res = await retryAsync(() =>
      fetch(`${WORKER_URL}/api/transactions`)
    );
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('[Worker] Invalid response:', data);
      return { data: null, error: 'Invalid response' };
    }

    console.log('[Worker] Transactions fetched:', data.length);
    const mappedData = data.map((item: any) => ({
      id: item.id,
      amount: item.amount,
      type: item.type as TransactionType,
      category: item.category as Category,
      title: item.title,
      date: item.date,
      authorId: item.author_id
    }));

    return { data: mappedData, error: null };
  } catch (err) {
    console.error('[Worker] Error fetching transactions:', err);
    return { data: null, error: err };
  }
};

// Fetch with localStorage cache (returns cached immediately, updates in background)
export const fetchTransactionsWithCache = async (): Promise<{ data: Transaction[] | null; error: any }> => {
  const cached = getCachedTransactions();
  if (cached.length > 0) {
    // Return cached data immediately
    console.log('[Cache] Using cached transactions:', cached.length);
    // Fetch fresh data in background
    fetchTransactions().then(result => {
      if (result.data) setCachedTransactions(result.data);
    }).catch(e => console.warn('[Cache] Background fetch failed:', e));
    return { data: cached, error: null };
  }
  // No cache, fetch fresh
  const result = await fetchTransactions();
  if (result.data) setCachedTransactions(result.data);
  return result;
};

// Polling fallback
let pollingInterval: any = null;
export const startPollingTransactions = (onUpdate: (tx: Transaction[]) => void, intervalMs = 5000) => {
  if (pollingInterval) return; // Already polling
  console.log('[Worker] Starting polling every', intervalMs, 'ms');
  const poll = async () => {
    const result = await fetchTransactions();
    if (result.data) onUpdate(result.data);
  };
  poll(); // Immediate fetch
  pollingInterval = setInterval(poll, intervalMs);
};

export const stopPollingTransactions = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('[Worker] Polling stopped');
  }
};

export const addTransactionToDb = async (transaction: Transaction) => {
  try {
    const res = await fetch(`${WORKER_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        title: transaction.title,
        date: transaction.date,
        author_id: transaction.authorId
      })
    });
    const result = await res.json();
    if (!res.ok) console.error('[Worker] Error adding transaction:', result);
    return result;
  } catch (err) {
    console.error('[Worker] Error adding transaction:', err);
    return { error: err };
  }
};

export const deleteTransactionFromDb = async (id: string) => {
  try {
    console.log('[Worker] Deleting transaction:', id);
    const res = await fetch(`${WORKER_URL}/api/deleteTransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: id
    });
    const result = await res.json();
    if (res.ok) console.log('[Worker] Transaction deleted successfully');
    else console.error('[Worker] Error deleting transaction:', result);
    return result;
  } catch (err) {
    console.error('[Worker] Error deleting transaction:', err);
    return { error: err };
  }
};

// --- Savings API ---

export const fetchSavings = async (): Promise<{ data: SavingsAccount[] | null; error: any }> => {
  try {
    console.log('[Worker] Fetching savings...');
    const res = await retryAsync(() =>
      fetch(`${WORKER_URL}/api/savings`)
    );
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('[Worker] Invalid savings response:', data);
      return { data: null, error: 'Invalid response' };
    }

    console.log('[Worker] Savings fetched:', data.length);
    const mappedData = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      apy: item.apy,
      color: item.color
    }));

    return { data: mappedData, error: null };
  } catch (err) {
    console.error('[Worker] Error fetching savings:', err);
    return { data: null, error: err };
  }
};

export const addSavingToDb = async (account: SavingsAccount) => {
  try {
    const res = await fetch(`${WORKER_URL}/api/savings`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        name: account.name,
        amount: account.amount,
        apy: account.apy,
        color: account.color
      })
    });
    const result = await res.json();
    if (!res.ok) console.error('[Worker] Error adding saving:', result);
    return result;
  } catch (err) {
    console.error('[Worker] Error adding saving:', err);
    return { error: err };
  }
};

export const deleteSavingFromDb = async (id: string) => {
  try {
    const res = await fetch(`${WORKER_URL}/api/deleteSaving`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: id
    });
    const result = await res.json();
    if (res.ok) console.log('[Worker] Saving deleted successfully');
    else console.error('[Worker] Error deleting saving:', result);
    return result;
  } catch (err) {
    console.error('[Worker] Error deleting saving:', err);
    return { error: err };
  }
};