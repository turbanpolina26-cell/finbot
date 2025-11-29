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

  // IDs currently playing remove animation
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  const handleRemoveClick = (id: string) => {
    // play animation first, then call parent delete
    if (removingIds.includes(id)) return;
    setRemovingIds((s) => [...s, id]);
    setTimeout(() => {
      try {
        onDeleteAccount(id);
      } finally {
        setRemovingIds((s) => s.filter(x => x !== id));
      }
    }, 350);
  };

    // Listen for global event from FAB to open savings modal (fallback)
    React.useEffect(() => {
        const handler = () => setIsModalOpen(true);
        window.addEventListener('openSavingsModal', handler as EventListener);
        return () => window.removeEventListener('openSavingsModal', handler as EventListener);
    }, []);
  
  // New Account State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [apy, setApy] = useState('');    // Robust sums: coerce amounts to numbers and ignore invalid values
    const totalCapital = accounts.reduce((sum, acc) => {
        const amt = Number(acc.amount) || 0;
        return sum + amt;
    }, 0);
  
    // Passive Income Calculation (guard NaN)
    const yearlyIncome = accounts.reduce((sum, acc) => {
        const amt = Number(acc.amount) || 0;
        const rate = Number(acc.apy) || 0;
        return sum + (amt * (rate / 100));
    }, 0);
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
      {/* Premium Capital Header */}
    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
      {/* Background gradient with animated elements */}
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
            <h2 className="text-6xl font-black text-tg-text tracking-tight mb-1">{totalCapital.toLocaleString()}</h2>
            <p className="text-tg-gold text-base font-semibold">₽</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-gradient-to-br from-tg-accent via-tg-accent to-tg-accent/80 hover:shadow-2xl hover:shadow-tg-accent/40 active:scale-95 px-5 py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg flex-shrink-0 group overflow-hidden relative">
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
            <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
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
    {/* End of Premium Capital Header */}

    {/* Projection Chart */}
      {accounts.length > 0 && (
          <div className="bg-tg-card p-4 rounded-3xl border border-white/5">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-bold text-tg-text uppercase tracking-wider flex items-center gap-2">
                     <GraphIcon size={14} /> Прогноз роста (1 год)
                 </h3>
                 <span className="text-xs font-bold text-tg-green">+{Math.floor(yearlyIncome).toLocaleString()} ₽</span>
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
                            contentStyle={{ backgroundColor: '#17212b', borderColor: '#d4af37', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                            itemStyle={{ color: '#d4af37', fontSize: '14px' }}
                            formatter={(value: number) => [`${value.toLocaleString()} ₽`, 'Капитал']}
                            labelStyle={{ color: '#8b9bb4', fontSize: '14px' }}
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
        </div>

        <div className="space-y-3">
            {accounts.length === 0 ? (
                <div className="text-center py-10 bg-tg-card/30 rounded-2xl border-dashed border border-white/10">
                    <p className="text-tg-muted mb-2">Нет счетов</p>
                    <p className="text-xs text-tg-muted/60">Добавьте вклад или накопительный счет,<br/>чтобы видеть пассивный доход.</p>
                </div>
            ) : (
                accounts.map((acc, idx) => {
                  const removing = removingIds.includes(acc.id);
                  return (
                  <div key={acc.id} className={`bg-tg-card p-4 rounded-2xl border border-white/5 flex justify-between items-center group transition-all duration-300 ${removing ? 'savings-removing' : 'animate-fade-in hover:border-white/10'}`} style={{animationDelay: `${idx * 50}ms`}}>
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
                        onClick={() => handleRemoveClick(acc.id)}
                        className="text-tg-muted/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-red-500/10"
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

      {/* Add Account Modal - Same Design as Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fade-in">
          <div className="add-transaction-modal bg-gradient-to-b from-tg-card to-tg-secondary w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl border-t border-white/10 shadow-2xl animate-slide-up relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-tg-accent/5 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-tg-text to-tg-muted bg-clip-text text-transparent">Новый счет</h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  aria-label="Закрыть модалку"
                  className="bg-white/6 hover:bg-white/12 active:scale-90 p-2 rounded-full text-tg-text transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Account Name */}
                <div className="group">
                  <label className="text-xs text-tg-muted ml-1 block mb-2 font-semibold uppercase tracking-wider">Название счета</label>
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
                    <label className="text-xs text-tg-muted ml-1 block mb-2 font-semibold uppercase tracking-wider">Сумма (₽)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-tg-card text-tg-text p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tg-accent/50 placeholder:text-tg-muted placeholder:opacity-90 transition-all duration-300 group-focus-within:ring-tg-accent font-mono text-base min-h-14"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-tg-muted font-semibold text-lg group-focus-within:text-tg-accent transition-colors pointer-events-none">₽</span>
                    </div>
                  </div>

                  {/* Rate */}
                  <div className="group">
                    <label className="text-xs text-tg-muted ml-1 block mb-2 font-semibold uppercase tracking-wider">Ставка (%)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={apy}
                        onChange={(e) => setApy(e.target.value)}
                        placeholder="0"
                        className="w-full bg-tg-card text-tg-text p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tg-accent/50 placeholder:text-tg-muted placeholder:opacity-90 transition-all duration-300 group-focus-within:ring-tg-accent font-mono text-base min-h-14"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-tg-muted font-semibold text-lg group-focus-within:text-tg-accent transition-colors pointer-events-none">%</span>
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
                        <p className="text-sm font-bold text-tg-green">{Math.floor((parseFloat(amount) * (parseFloat(apy) / 100)) / 365).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-tg-muted uppercase mb-1 font-bold">В месяц</p>
                        <p className="text-sm font-bold text-tg-green">{Math.floor((parseFloat(amount) * (parseFloat(apy) / 100)) / 12).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-tg-muted uppercase mb-1 font-bold">В год</p>
                        <p className="text-sm font-bold text-tg-gold">{Math.floor(parseFloat(amount) * (parseFloat(apy) / 100)).toLocaleString()}</p>
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
      )}

      {/* Floating Action Button removed — use header "Добавить" button or main FAB */}
    </div>
  );
};