import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== TRANSACTIONS =====

export const listTransactions = query({
  args: {},
  handler: async (ctx) => {
    const transactions = await ctx.db
      .query("transactions")
      .order("desc")
      .collect();
    return transactions;
  },
});

export const addTransaction = mutation({
  args: {
    amount: v.number(),
    type: v.string(),
    category: v.string(),
    title: v.string(),
    date: v.string(),
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    const transactionId = await ctx.db.insert("transactions", {
      ...args,
      createdAt: Date.now(),
    });
    return transactionId;
  },
});

export const deleteTransaction = mutation({
  args: {
    id: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ===== SAVINGS =====

export const listSavings = query({
  args: {},
  handler: async (ctx) => {
    const savings = await ctx.db.query("savings").collect();
    return savings;
  },
});

export const addSaving = mutation({
  args: {
    name: v.string(),
    amount: v.number(),
    apy: v.number(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const savingId = await ctx.db.insert("savings", {
      ...args,
      createdAt: Date.now(),
    });
    return savingId;
  },
});

export const deleteSaving = mutation({
  args: {
    id: v.id("savings"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
