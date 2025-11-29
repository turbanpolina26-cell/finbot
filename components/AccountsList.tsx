import React from 'react';
import { SavingsAccount } from '../types';
import { Trash2, Wallet } from 'lucide-react';

interface AccountsListProps {
  accounts: SavingsAccount[];
  removingIds: string[];
  onRemoveClick: (id: string) => void;
}

export const AccountsList: React.FC<AccountsListProps> = ({ accounts, removingIds, onRemoveClick }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-lg flex items-center gap-2 text-tg-text">
          <Wallet className="text-tg-muted" size={20} />
          Активные счета
        </h3>
      </div>

      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div className="text-center py-10 bg-tg-card/30 rounded-2xl border-dashed border border-white/10">
            <p className="text-tg-muted mb-2">Нет счетов</p>
            <p className="text-xs text-tg-muted/60">
              Добавьте вклад или накопительный счет,<br />
              чтобы видеть пассивный доход.
            </p>
          </div>
        ) : (
          accounts.map((acc, idx) => {
            const removing = removingIds.includes(acc.id);
            return (
              <div
                key={acc.id}
                className={`bg-tg-card p-4 rounded-2xl border border-white/5 flex justify-between items-center group transition-all duration-300 ${
                  removing ? 'savings-removing' : 'animate-fade-in hover:border-white/10'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: acc.color }}></div>
                  <div>
                    <p className="font-semibold text-sm text-tg-text">{acc.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-tg-muted bg-white/5 px-1.5 rounded">{acc.apy}% годовых</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-tg-text">{acc.amount.toLocaleString()} ₽</p>
                    <p className="text-[10px] text-tg-green">+{Math.floor((acc.amount * (acc.apy / 100)) / 365)} ₽/день</p>
                  </div>
                  <button
                    onClick={() => onRemoveClick(acc.id)}
                    className="text-tg-muted/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-red-500/10"
                    aria-label={`Удалить счет ${acc.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
