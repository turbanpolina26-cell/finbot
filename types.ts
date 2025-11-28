
export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME'
}

export enum Category {
  FOOD = 'Еда',
  TRANSPORT = 'Транспорт',
  ENTERTAINMENT = 'Развлечения',
  SHOPPING = 'Шопинг',
  BILLS = 'Счета',
  SALARY = 'Зарплата',
  TRAVEL = 'Путешествия',
  HEALTH = 'Здоровье',
  OTHER = 'Другое'
}

export interface User {
  id: string;
  name: string; // e.g., 'Alex'
  avatar: string; // emoji or url
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  title: string;
  date: string; // ISO string
  authorId: string; // User.id who created this
}

export interface SavingsAccount {
  id: string;
  name: string; // "Сбер накопительный"
  amount: number; // 500000
  apy: number; // Annual Percentage Yield (e.g., 12%)
  color: string; // Visual color for the card
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}
