import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from "../types";

// Safely initialize Gemini. If API_KEY is missing (dev/build env), it won't crash immediately,
// but methods will fail if called.
const apiKey = process.env.API_KEY || 'dummy_key_for_build';
const ai = new GoogleGenAI({ apiKey });

export const analyzeFinances = async (transactions: Transaction[]): Promise<string> => {
  if (apiKey === 'dummy_key_for_build') {
    return "Ошибка: API ключ Gemini не найден. Добавьте API_KEY в настройки окружения.";
  }

  // Filter for expenses mostly, as that's where "problems" usually are
  const recentTransactions = transactions
    .slice(0, 50) // Analyze last 50 transactions to keep context small
    .map(t => ({
      date: t.date,
      category: t.category,
      amount: t.amount,
      type: t.type,
      title: t.title
    }));

  const prompt = `
    Ты - строгий, но справедливый финансовый советник в Telegram-боте.
    Проанализируй эти транзакции (JSON):
    ${JSON.stringify(recentTransactions)}

    Твоя задача:
    1. Найти "проблемную зону" (категорию, где слишком много трат).
    2. Посчитать, сколько потрачено в этой зоне.
    3. Дать короткий, конкретный совет, как сэкономить.
    4. Использовать эмодзи.
    5. Ответ должен быть на русском языке.
    6. Не используй markdown форматирование заголовков (##), используй жирный текст для акцентов.
    7. Будь краток (максимум 3-4 предложения).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Не удалось проанализировать данные.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Произошла ошибка при соединении с финансовым AI мозгом. Возможно, неверный API ключ.";
  }
};