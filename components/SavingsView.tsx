import React, { useState } from 'react';
import { SavingsAccount } from '../types';
import { Plus, TrendingUp, PiggyBank, Wallet, Trash2, X, AreaChart as GraphIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  accounts: SavingsAccount[];
  onAddAccount: (account: SavingsAccount) => void;
  onDeleteAccount: (id: string) => void;
}

const COLORS = ['#d4af37', '#4caf50', '#2196f3', '#9c27b0', '#ff9800'];

export const SavingsView: React.FC<Props> = ({ accounts, onAddAccount, onDeleteAccount }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Account State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [apy, setApy] = useState('');

  const totalCapital = accounts.reduce((sum, acc) => sum + acc.amount, 0);
  
  // Passive Income Calculation
  const yearlyIncome = accounts.reduce((sum, acc) => sum + (acc.amount * (acc.apy / 100)), 0);
  const monthlyIncome = yearlyIncome / 12;
  const dailyIncome = yearlyIncome / 365;

  // Generate Projection Data for Chart (Next 12 Months)
  const projectionData = Array.from({ length: 13 }, (_, i) => {
    // Calculate total value after i months with compound interest (monthly)
    // Formula: P * (1 + r/n)^(nt)
    // Here we approximate simple monthly compounding for visualization
    const projectedValue = accounts.reduce((sum, acc) => {
        const r = acc.apy / 100;
        return sum + (acc.amount * Math.pow(1 + r/12, i));
    }, 0);

    const d = new Date();
    d.setMonth(d.getMonth() + i);
    
    return {
        month: d.toLocaleDateString('ru-RU', { month: 'short' }),
        value: Math.round(projectedValue),
        income: Math.round(projectedValue - totalCapital)
    };
  });

  const handleAdd = () => {
    if (!name || !amount || !apy) return;
    
    const newAcc: SavingsAccount = {
      id: Date.now().toString(),
      name,
      amount: parseFloat(amount),
      apy: parseFloat(apy),
      color: COLORS[accounts.length % COLORS.length]
    };

    onAddAccount(newAcc);
    setIsModalOpen(false);
    setName('');
    setAmount('');
    setApy('');
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header Summary */}
      <div className="bg-gradient-to-br from-[#2c2718] to-[#1a1c24] border border-[#d4af37]/20 p-6 rounded-3xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <PiggyBank size={120} className="text-[#d4af37]" />
        </div>
        
        <p className="text-[#d4af37] text-sm font-medium tracking-wider mb-2 uppercase">Общий капитал</p>
        <h2 className="text-4xl font-bold text-white mb-6">{totalCapital.toLocaleString()} ₽</h2>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/5">
                <p className="text-[10px] text-tg-muted uppercase">В День</p>
                <p className="text-sm font-semibold text-tg-green">+{Math.floor(dailyIncome).toLocaleString()}</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/5">
                <p className="text-[10px] text-tg-muted uppercase">В Месяц</p>
                <p className="text-sm font-semibold text-tg-green">+{Math.floor(monthlyIncome).toLocaleString()}</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/5">
                <p className="text-[10px] text-tg-muted uppercase">В Год</p>
                <p className="text-sm font-semibold text-[#d4af37]">+{Math.floor(yearlyIncome).toLocaleString()}</p>
            </div>
        </div>
      </div>

      {/* Projection Chart */}
      {accounts.length > 0 && (
          <div className="bg-tg-card p-4 rounded-3xl border border-white/5">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-bold text-tg-muted uppercase tracking-wider flex items-center gap-2">
                     <GraphIcon size={14} /> Прогноз роста (1 год)
                 </h3>
                 <span className="text-xs text-tg-green">+{Math.floor(yearlyIncome).toLocaleString()} ₽</span>
             </div>
             <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#17212b', borderColor: '#d4af37', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#d4af37' }}
                            formatter={(value: number) => [`${value.toLocaleString()} ₽`, 'Капитал']}
                            labelStyle={{ color: '#8b9bb4' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
      )}

      {/* Savings List */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-bold text-lg flex items-center gap-2 text-tg-text">
                <Wallet className="text-tg-muted" size={20} />
                Активные счета
            </h3>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="text-xs bg-tg-card border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-white/5 transition-colors text-tg-text"
            >
                <Plus size={14} /> Добавить
            </button>
        </div>

        <div className="space-y-3">
            {accounts.length === 0 ? (
                <div className="text-center py-10 bg-tg-card/30 rounded-2xl border-dashed border border-white/10">
                    <p className="text-tg-muted mb-2">Нет счетов</p>
                    <p className="text-xs text-tg-muted/60">Добавьте вклад или накопительный счет,<br/>чтобы видеть пассивный доход.</p>
                </div>
            ) : (
                accounts.map(acc => (
                    <div key={acc.id} className="bg-tg-card p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
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
                                <p className="text-[10px] text-tg-green">+{Math.floor((acc.amount * (acc.apy/100))/365)} ₽/день</p>
                            </div>
                            <button 
                                onClick={() => onDeleteAccount(acc.id)}
                                className="text-tg-muted/30 hover:text-red-400 transition-colors p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-tg-card w-full max-w-md p-6 rounded-t-3xl sm:rounded-2xl border-t border-white/10 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-tg-text">Новый актив</h3>
                <button onClick={() => setIsModalOpen(false)} className="bg-white/5 p-2 rounded-full text-tg-muted hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="text-xs text-tg-muted ml-1 block mb-1">Название счета</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Например: Альфа Вклад"
                        className="w-full bg-tg-bg text-tg-text p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-tg-accent border border-white/5"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-tg-muted ml-1 block mb-1">Сумма (₽)</label>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-tg-bg text-tg-text p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-tg-accent border border-white/5 font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-tg-muted ml-1 block mb-1">Ставка (%)</label>
                        <input 
                            type="number" 
                            value={apy}
                            onChange={(e) => setApy(e.target.value)}
                            placeholder="16"
                            className="w-full bg-tg-bg text-tg-text p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-tg-accent border border-white/5 font-mono"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleAdd}
                    className="w-full bg-tg-gold text-black font-bold py-3.5 rounded-xl mt-4 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-tg-gold/20"
                >
                    Начать копить
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};