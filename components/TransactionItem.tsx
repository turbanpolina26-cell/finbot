
import React, { useState } from 'react';
import { Transaction, TransactionType, User } from '../types';
import { Coffee, Car, Gamepad2, ShoppingBag, Receipt, DollarSign, HelpCircle, Plane, HeartPulse, Trash2, Check } from 'lucide-react';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const dateObj = new Date(transaction.date);
  
  // Format: "Сегодня, 14:30" or "12 Окт, 14:30"
  const isToday = new Date().toDateString() === dateObj.toDateString();
  const dateStr = isToday 
    ? `Сегодня, ${dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
    : dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const handleDelete = async () => {
    setIsDeleting(true);
    // Trigger haptic if available
    if (navigator.vibrate) navigator.vibrate(50);
    
    // Wait for animation
    setTimeout(() => {
      if (onDelete) onDelete(transaction.id);
    }, 300);
  };

  if (isDeleting) {
    return (
      <div className="flex items-center justify-between p-4 mb-2 bg-red-500/20 rounded-2xl border border-red-500/30 animate-slide-up transition-all duration-300 opacity-0">
        <div className="flex items-center gap-3.5 flex-1">
          <div className="p-2.5 rounded-full bg-red-500/30 animate-pulse">
            <Check size={18} className="text-red-400" />
          </div>
          <p className="text-sm text-red-300 font-semibold">Удалено...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 mb-2 bg-tg-card/50 rounded-2xl border border-white/5 active:bg-tg-card transition-colors group hover:border-red-500/20 hover:bg-tg-card/70 min-h-[70px]">
      <div className="flex items-center gap-3.5 flex-1">
        <div className={`p-2.5 rounded-full shadow-sm ${isExpense ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 text-tg-red' : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-tg-green'}`}>
          {getIcon(transaction.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-tg-text text-[15px] truncate">{transaction.title || transaction.category}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {user && (
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-tg-muted flex items-center gap-1">
                 {user.avatar} {user.name}
              </span>
            )}
            <p className="text-xs text-tg-muted">{dateStr}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-3">
        <div className={`font-bold text-[15px] tracking-wide whitespace-nowrap ${isExpense ? 'text-tg-text' : 'text-tg-green'}`}>
          {isExpense ? '-' : '+'}{transaction.amount.toLocaleString()} ₽
        </div>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-lg text-tg-muted hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90 min-w-10 min-h-10 flex items-center justify-center"
            title="Удалить"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
