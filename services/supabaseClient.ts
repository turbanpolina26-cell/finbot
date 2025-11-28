import { Transaction, SavingsAccount, TransactionType, Category } from '../types';

// Read runtime config from a global injected by index.html
const runtimeConfig = (typeof window !== 'undefined' && (window as any).__FINBOT_SUPABASE) || {};
const SUPABASE_URL = runtimeConfig.url || (import.meta.env.VITE_SUPABASE_URL as string) || '';
const SUPABASE_KEY = runtimeConfig.key || (import.meta.env.VITE_SUPABASE_KEY as string) || '';

const makeHeaders = (extra: Record<string,string> = {}) => {
  const h: Record<string,string> = {
    'apikey': SUPABASE_KEY || '',
    'Authorization': SUPABASE_KEY ? `Bearer ${SUPABASE_KEY}` : '',
    'Accept': 'application/json'
  };
  Object.entries(extra).forEach(([k,v])=>{ if (v) h[k]=v; });
  // Remove empty values to avoid invalid header errors
  Object.keys(h).forEach(k=>{ if (!h[k]) delete h[k]; });
  return h;
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
    if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');
    const url = new URL(`${SUPABASE_URL}/rest/v1/transactions`);
    url.searchParams.set('select', '*');
    url.searchParams.set('order', 'date.desc');

    const res = await retryAsync(() => fetch(url.toString(), { headers: makeHeaders() }));
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('[Supabase] Invalid response:', data);
      return { data: null, error: 'Invalid response' };
    }

    console.log('[Supabase] Transactions fetched:', data.length);
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
    console.error('[Supabase] Error fetching transactions:', err);
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
    if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' }, makeHeaders()),
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
    if (!res.ok) console.error('[Supabase] Error adding transaction:', result);
    return result;
  } catch (err) {
    console.error('[Supabase] Error adding transaction:', err);
    return { error: err };
  }
};

export const deleteTransactionFromDb = async (id: string) => {
  try {
    if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');
    const url = new URL(`${SUPABASE_URL}/rest/v1/transactions`);
    url.searchParams.set('id', `eq.${id}`);
    const res = await fetch(url.toString(), {
      method: 'DELETE',
      headers: Object.assign({ 'Prefer': 'return=representation' }, makeHeaders())
    });
    const result = res.ok ? { success: true } : await res.json();
    if (res.ok) console.log('[Supabase] Transaction deleted successfully');
    else console.error('[Supabase] Error deleting transaction:', result);
    return result;
  } catch (err) {
    console.error('[Supabase] Error deleting transaction:', err);
    return { error: err };
  }
};

// --- Savings API ---

export const fetchSavings = async (): Promise<{ data: SavingsAccount[] | null; error: any }> => {
  try {
    if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');
    const url = new URL(`${SUPABASE_URL}/rest/v1/savings`);
    url.searchParams.set('select', '*');
    const res = await retryAsync(() => fetch(url.toString(), { headers: makeHeaders() }));
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('[Supabase] Invalid savings response:', data);
      return { data: null, error: 'Invalid response' };
    }

    console.log('[Supabase] Savings fetched:', data.length);
    const mappedData = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      apy: item.apy,
      color: item.color
    }));

    return { data: mappedData, error: null };
  } catch (err) {
    console.error('[Supabase] Error fetching savings:', err);
    return { data: null, error: err };
  }
};

export const addSavingToDb = async (account: SavingsAccount) => {
  try {
    if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/savings`, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' }, makeHeaders()),
      body: JSON.stringify({
        name: account.name,
        amount: account.amount,
        apy: account.apy,
        color: account.color
      })
    });
    const result = await res.json();
    if (!res.ok) console.error('[Supabase] Error adding saving:', result);
    return result;
  } catch (err) {
    console.error('[Supabase] Error adding saving:', err);
    return { error: err };
  }
};

export const deleteSavingFromDb = async (id: string) => {
  try {
    if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');
    const url = new URL(`${SUPABASE_URL}/rest/v1/savings`);
    url.searchParams.set('id', `eq.${id}`);
    const res = await fetch(url.toString(), {
      method: 'DELETE',
      headers: Object.assign({ 'Prefer': 'return=representation' }, makeHeaders())
    });
    const result = res.ok ? { success: true } : await res.json();
    if (res.ok) console.log('[Supabase] Saving deleted successfully');
    else console.error('[Supabase] Error deleting saving:', result);
    return result;
  } catch (err) {
    console.error('[Supabase] Error deleting saving:', err);
    return { error: err };
  }
};