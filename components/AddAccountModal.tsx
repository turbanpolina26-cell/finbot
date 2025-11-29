import React, { useState } from 'react';
import { SavingsAccount } from '../types';
import { X, PiggyBank } from 'lucide-react';

const COLORS = ['#d4af37', '#4caf50', '#2196f3', '#9c27b0', '#ff9800'];

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: SavingsAccount) => void;
  existingAccountsCount: number;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
  existingAccountsCount,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [apy, setApy] = useState('');

  const handleAdd = () => {
    if (!name || !amount || !apy) return;

    const newAcc: SavingsAccount = {
      id: Date.now().toString(),
      name,
      amount: parseFloat(amount),
      apy: parseFloat(apy),
      color: COLORS[existingAccountsCount % COLORS.length],
    };

    onAddAccount(newAcc);
    onClose();
    setName('');
    setAmount('');
    setApy('');
  };

  if (!isOpen) return null;

  const dailyIncome = (parseFloat(amount) * (parseFloat(apy) / 100)) / 365 || 0;
  const monthlyIncome = (parseFloat(amount) * (parseFloat(apy) / 100)) / 12 || 0;
  const yearlyIncome = parseFloat(amount) * (parseFloat(apy) / 100) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div className="add-transaction-modal bg-gradient-to-b from-tg-card to-tg-secondary w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl animate-slide-up relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-tg-accent/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-tg-text to-tg-muted bg-clip-text text-transparent">
              Новый счет
            </h3>
            <button
              onClick={onClose}
              aria-label="Закрыть модалку"
              className="bg-white/6 hover:bg-white/12 active:scale-90 p-2 rounded-full text-tg-text transition-all duration-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5">
            {/* Account Name */}
            <div className="group">
              <label className="text-xs text-tg-muted ml-1 block mb-2 font-semibold uppercase tracking-wider">
                Название счета
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Альфа Вклад"
                className="w-full bg-tg-card text-tg-text p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tg-accent/50 placeholder:text-tg-muted placeholder:opacity-90 transition-all duration-300 group-focus-within:ring-tg-accent text-base min-h-14"
              />
            </div>

            {/* Amount and Rate Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div className="group">
                <label className="text-xs text-tg-muted ml-1 block mb-2 font-semibold uppercase tracking-wider">
                  Сумма (₽)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-tg-card text-tg-text p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tg-accent/50 placeholder:text-tg-muted placeholder:opacity-90 transition-all duration-300 group-focus-within:ring-tg-accent font-mono text-base min-h-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-tg-muted font-semibold text-lg group-focus-within:text-tg-accent transition-colors pointer-events-none">
                    ₽
                  </span>
                </div>
              </div>

              {/* Rate */}
              <div className="group">
                <label className="text-xs text-tg-muted ml-1 block mb-2 font-semibold uppercase tracking-wider">
                  Ставка (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={apy}
                    onChange={(e) => setApy(e.target.value)}
                    placeholder="0"
                    className="w-full bg-tg-card text-tg-text p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tg-accent/50 placeholder:text-tg-muted placeholder:opacity-90 transition-all duration-300 group-focus-within:ring-tg-accent font-mono text-base min-h-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-tg-muted font-semibold text-lg group-focus-within:text-tg-accent transition-colors pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Income Preview Box */}
            {amount && apy && (
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 transition-all duration-300">
                <p className="text-xs text-tg-muted mb-3 font-semibold uppercase tracking-wider">Примерный доход:</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] text-tg-muted uppercase mb-1 font-bold">В день</p>
                    <p className="text-sm font-bold text-tg-green">{Math.floor(dailyIncome).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-tg-muted uppercase mb-1 font-bold">В месяц</p>
                    <p className="text-sm font-bold text-tg-green">{Math.floor(monthlyIncome).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-tg-muted uppercase mb-1 font-bold">В год</p>
                    <p className="text-sm font-bold text-tg-gold">{Math.floor(yearlyIncome).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAdd}
              disabled={!name || !amount || !apy}
              className="w-full bg-gradient-to-r from-tg-accent to-tg-accent/80 text-white font-bold py-4 rounded-2xl mt-6 hover:shadow-lg hover:shadow-tg-accent/30 active:scale-95 transition-all duration-300 shadow-md shadow-tg-accent/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PiggyBank size={20} />
              <span>Добавить счет</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
