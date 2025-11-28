import { createClient } from '@supabase/supabase-js';
import { Transaction, SavingsAccount, TransactionType, Category } from '../types';

// Provided credentials
const supabaseUrl = 'https://wdoymosbqdlqqzujgmax.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkb3ltb3NicWRscXF6dWpnbWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODMzMzQsImV4cCI6MjA3OTg1OTMzNH0.geEk2wzKj_jd4G7q1-O5-N-LKq9AztYVCjDWxm82vzo';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// --- Transactions API ---

export const fetchTransactions = async (): Promise<{ data: Transaction[] | null; error: any }> => {
  try {
    console.log('[Supabase] Fetching transactions...');
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[Supabase] Error (Transactions):', error);
      return { data: null, error };
    }

    console.log('[Supabase] Transactions fetched:', data?.length || 0);
    const mappedData = data ? data.map((item: any) => ({
      id: item.id,
      amount: item.amount,
      type: item.type as TransactionType,
      category: item.category as Category,
      title: item.title,
      date: item.date,
      authorId: item.author_id
    })) : [];

    return { data: mappedData, error: null };
  } catch (err) {
    console.error('[Supabase] Unexpected error fetching transactions:', err);
    return { data: null, error: err };
  }
};

export const addTransactionToDb = async (transaction: Transaction) => {
  const { error } = await supabase
    .from('transactions')
    .insert([{
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      title: transaction.title,
      date: transaction.date,
      author_id: transaction.authorId
    }]);

  if (error) console.error('Error adding transaction:', error);
};

export const deleteTransactionFromDb = async (id: string) => {
  console.log('[Supabase] Deleting transaction:', id);
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) console.error('[Supabase] Error deleting transaction:', error);
  else console.log('[Supabase] Transaction deleted successfully');
};

// --- Savings API ---

export const fetchSavings = async (): Promise<{ data: SavingsAccount[] | null; error: any }> => {
  try {
    console.log('[Supabase] Fetching savings...');
    const { data, error } = await supabase
      .from('savings')
      .select('*');

    if (error) {
      console.error('[Supabase] Error (Savings):', error);
      return { data: null, error };
    }

    console.log('[Supabase] Savings fetched:', data?.length || 0);
    const mappedData = data ? data.map((item: any) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      apy: item.apy,
      color: item.color
    })) : [];

    return { data: mappedData, error: null };
  } catch (err) {
    console.error('Unexpected error fetching savings:', err);
    return { data: null, error: err };
  }
};

export const addSavingToDb = async (account: SavingsAccount) => {
  const { error } = await supabase
    .from('savings')
    .insert([{
      name: account.name,
      amount: account.amount,
      apy: account.apy,
      color: account.color
    }]);
    
  if (error) console.error('Error adding saving:', error);
};

export const deleteSavingFromDb = async (id: string) => {
  const { error } = await supabase
    .from('savings')
    .delete()
    .eq('id', id);
    
  if (error) console.error('Error deleting saving:', error);
};