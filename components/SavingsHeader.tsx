import React from 'react';
import { PiggyBank } from 'lucide-react';

interface SavingsHeaderProps {
  totalCapital: number;
  dailyIncome: number;
  monthlyIncome: number;
  yearlyIncome: number;
  onAddClick: () => void;
}

export const SavingsHeader: React.FC<SavingsHeaderProps> = ({
  totalCapital,
  dailyIncome,
  monthlyIncome,
  yearlyIncome,
  onAddClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-tg-gold/10 via-tg-secondary to-tg-card"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-tg-gold/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-tg-accent/5 blur-2xl rounded-full"></div>

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Header with capital amount and add button */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-2">
              <PiggyBank size={24} className="text-tg-gold" />
              <p className="text-tg-gold text-xs font-bold tracking-widest uppercase">Пассивный доход</p>
            </div>
            <h2 className="text-6xl font-black text-tg-text tracking-tight mb-1">
              {totalCapital.toLocaleString()}
            </h2>
            <p className="text-tg-gold text-base font-semibold">₽</p>
          </div>
          <button
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 bg-gradient-to-br from-tg-accent via-tg-accent to-tg-accent/80 hover:shadow-2xl hover:shadow-tg-accent/40 active:scale-95 px-5 py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg flex-shrink-0 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
            <span className="relative z-10 text-2xl group-hover:rotate-90 transition-transform duration-300">+</span>
            <span className="relative z-10 hidden sm:inline text-base">Добавить</span>
          </button>
        </div>

        {/* Income breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <p className="text-[11px] text-tg-muted uppercase font-bold tracking-wider mb-2">В День</p>
            <p className="text-lg font-bold text-tg-green">{Math.floor(dailyIncome).toLocaleString()} ₽</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <p className="text-[11px] text-tg-muted uppercase font-bold tracking-wider mb-2">В Месяц</p>
            <p className="text-lg font-bold text-tg-green">{Math.floor(monthlyIncome).toLocaleString()} ₽</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <p className="text-[11px] text-tg-muted uppercase font-bold tracking-wider mb-2">В Год</p>
            <p className="text-lg font-bold text-tg-gold">{Math.floor(yearlyIncome).toLocaleString()} ₽</p>
          </div>
        </div>
      </div>
    </div>
  );
};
