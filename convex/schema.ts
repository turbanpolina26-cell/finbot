import { defineSchema, defineTable, v } from "convex/server";

export default defineSchema({
  transactions: defineTable({
    amount: v.number(),
    type: v.string(), // "income" or "expense"
    category: v.string(),
    title: v.string(),
    date: v.string(),
    authorId: v.string(),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_author", ["authorId"]),

  savings: defineTable({
    name: v.string(),
    amount: v.number(),
    apy: v.number(), // annual percentage yield
    color: v.string(),
    createdAt: v.number(),
  })
    .index("by_name", ["name"]),
});
