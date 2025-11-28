
import React from 'react';
import { Transaction, TransactionType, User } from '../types';
import { Coffee, Car, Gamepad2, ShoppingBag, Receipt, DollarSign, HelpCircle, Plane, HeartPulse, Trash2 } from 'lucide-react';

interface Props {
  transaction: Transaction;
  user?: User; // The author
  onDelete?: (id: string) => void;
}

const getIcon = (category: string) => {
  switch (category) {
    case 'Еда': return <Coffee size={18} />;
    case 'Транспорт': return <Car size={18} />;
    case 'Развлечения': return <Gamepad2 size={18} />;
    case 'Шопинг': return <ShoppingBag size={18} />;
    case 'Счета': return <Receipt size={18} />;
    case 'Зарплата': return <DollarSign size={18} />;
    case 'Путешествия': return <Plane size={18} />;
    case 'Здоровье': return <HeartPulse size={18} />;
    default: return <HelpCircle size={18} />;
  }
};

export const TransactionItem: React.FC<Props> = ({ transaction, user, onDelete }) => {
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const dateObj = new Date(transaction.date);
  
  // Format: "Сегодня, 14:30" or "12 Окт, 14:30"
  const isToday = new Date().toDateString() === dateObj.toDateString();
  const dateStr = isToday 
    ? `Сегодня, ${dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
    : dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-between p-4 mb-2 bg-tg-card/50 rounded-2xl border border-white/5 active:bg-tg-card transition-colors group hover:border-red-500/20">
      <div className="flex items-center gap-3.5 flex-1">
        <div className={`p-2.5 rounded-full shadow-sm ${isExpense ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 text-tg-red' : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-tg-green'}`}>
          {getIcon(transaction.category)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-tg-text text-[15px]">{transaction.title || transaction.category}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {user && (
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-tg-muted flex items-center gap-1">
                 {user.avatar} {user.name}
              </span>
            )}
            <p className="text-xs text-tg-muted">{dateStr}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`font-bold text-[15px] tracking-wide ${isExpense ? 'text-tg-text' : 'text-tg-green'}`}>
          {isExpense ? '-' : '+'}{transaction.amount.toLocaleString()} ₽
        </div>
        {onDelete && (
          <button
            onClick={() => {
              if (confirm('Удалить эту запись?')) {
                onDelete(transaction.id);
              }
            }}
            className="p-2 rounded-lg text-tg-muted hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
            title="Удалить"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
