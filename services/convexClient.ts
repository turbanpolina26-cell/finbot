import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Transaction, SavingsAccount } from "../types";

// Initialize Convex client from environment
const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL environment variable is not set");
}

const client = new ConvexClient(convexUrl);

// ===== Transactions =====

export const fetchTransactions = async (): Promise<{ data: Transaction[] | null; error: any }> => {
  try {
    const data = await client.query(api.functions.listTransactions);
    console.log("[Convex] Transactions fetched:", data.length);
    
    const mappedData = (data as any[]).map((item: any) => ({
      id: item._id,
      amount: item.amount,
      type: item.type,
      category: item.category,
      title: item.title,
      date: item.date,
      authorId: item.authorId,
    }));

    return { data: mappedData, error: null };
  } catch (err) {
    console.error("[Convex] Error fetching transactions:", err);
    return { data: null, error: err };
  }
};

export const fetchTransactionsWithCache = async (): Promise<{ data: Transaction[] | null; error: any }> => {
  // For now, just call fetchTransactions directly
  // (Convex handles caching on the backend; you can add client-side cache later)
  return fetchTransactions();
};

let pollingInterval: any = null;
export const startPollingTransactions = (onUpdate: (tx: Transaction[]) => void, intervalMs = 5000) => {
  if (pollingInterval) return;
  console.log("[Convex] Starting polling every", intervalMs, "ms");
  
  const poll = async () => {
    const result = await fetchTransactions();
    if (result.data) onUpdate(result.data);
  };
  
  poll();
  pollingInterval = setInterval(poll, intervalMs);
};

export const stopPollingTransactions = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log("[Convex] Polling stopped");
  }
};

export const addTransactionToDb = async (transaction: Transaction) => {
  try {
    const result = await client.mutation(api.functions.addTransaction, {
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      title: transaction.title,
      date: transaction.date,
      authorId: transaction.authorId,
    });
    console.log("[Convex] Transaction added:", result);
    return result;
  } catch (err) {
    console.error("[Convex] Error adding transaction:", err);
    return { error: err };
  }
};

export const deleteTransactionFromDb = async (id: string) => {
  try {
    await client.mutation(api.functions.deleteTransaction, { id: id as any });
    console.log("[Convex] Transaction deleted successfully");
    return { success: true };
  } catch (err) {
    console.error("[Convex] Error deleting transaction:", err);
    return { error: err };
  }
};

// ===== Savings =====

export const fetchSavings = async (): Promise<{ data: SavingsAccount[] | null; error: any }> => {
  try {
    const data = await client.query(api.functions.listSavings);
    console.log("[Convex] Savings fetched:", data.length);
    
    const mappedData = (data as any[]).map((item: any) => ({
      id: item._id,
      name: item.name,
      amount: item.amount,
      apy: item.apy,
      color: item.color,
    }));

    return { data: mappedData, error: null };
  } catch (err) {
    console.error("[Convex] Error fetching savings:", err);
    return { data: null, error: err };
  }
};

export const addSavingToDb = async (account: SavingsAccount) => {
  try {
    const result = await client.mutation(api.functions.addSaving, {
      name: account.name,
      amount: account.amount,
      apy: account.apy,
      color: account.color,
    });
    console.log("[Convex] Saving added:", result);
    return result;
  } catch (err) {
    console.error("[Convex] Error adding saving:", err);
    return { error: err };
  }
};

export const deleteSavingFromDb = async (id: string) => {
  try {
    await client.mutation(api.functions.deleteSaving, { id: id as any });
    console.log("[Convex] Saving deleted successfully");
    return { success: true };
  } catch (err) {
    console.error("[Convex] Error deleting saving:", err);
    return { error: err };
  }
};
