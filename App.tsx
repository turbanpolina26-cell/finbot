
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, LayoutDashboard, PieChart, X, Wallet, TrendingDown, TrendingUp, Palette, ChevronDown, Check, Wifi, WifiOff } from 'lucide-react';
import { Transaction, TransactionType, Category, User, SavingsAccount } from './types';
import { TransactionItem } from './components/TransactionItem';
import { ChartsView } from './components/ChartsView';
import { SavingsView } from './components/SavingsView';
import { fetchTransactions, addTransactionToDb, deleteTransactionFromDb, fetchSavings, addSavingToDb, deleteSavingFromDb, startPollingTransactions, stopPollingTransactions } from './services/convexClient';

// Updated Users
const USERS: User[] = [
  { id: 'u1', name: 'Илья', avatar: '🦁' }, 
  { id: 'u2', name: 'Полина', avatar: '🌸' }
];

const THEMES = [
  { id: 'obsidian', name: 'Obsidian (Dark)', color: '#0f1014' },
  { id: 'cotton-candy', name: 'Cotton Candy', color: '#130f26' },
  { id: 'aurora', name: 'Aurora (Light)', color: '#f0f2f5' },
  { id: 'forest', name: 'Forest (Nature)', color: '#0d1f12' },
];

const App: React.FC = () => {
  // --- Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // --- Debug / Mobile diagnostics ---
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const addDebug = (msg: string) => {
    try {
      setDebugLogs((s) => [new Date().toLocaleTimeString() + ' - ' + msg, ...s].slice(0, 12));
    } catch (e) {
      // ignore
    }
    console.log('[Debug]', msg);
  };

  // --- App State ---
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'savings'>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [dbError, setDbError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // --- Theme State ---
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('nura_theme') || 'obsidian';
  });
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // --- Form State ---
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

  // --- Initialization & Data Fetching ---
  useEffect(() => {
    // 1. Load Theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nura_theme', theme);

    // 2. Load Auth/User
    const initApp = async () => {
      console.log('[App] Initializing app...');
      addDebug('Initializing app');
      // Try to get Telegram WebApp Data
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        try { tg.ready(); tg.expand(); } catch(e){}
        console.log('[App] Telegram WebApp ready');
        addDebug('Telegram WebApp present');
      } else {
        addDebug('Telegram WebApp not detected');
      }

      const savedUser = localStorage.getItem('nura_user');
      console.log('[App] Saved user:', savedUser ? 'found' : 'not found');
      addDebug(savedUser ? 'Saved user found' : 'No saved user');
      
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
    };

    initApp();

    // 3. Fetch Data from Supabase with timeout
    const loadDataWithTimeout = async () => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase request timeout')), 15000)
      );
      
      try {
        console.log('[App] Starting data load...');
        addDebug('Starting data load');
        await Promise.race([loadData(), timeoutPromise]);
        console.log('[App] Data loaded successfully');
        addDebug('Data loaded successfully');
      } catch (error: any) {
        console.error('[App] Data load error:', error);
        addDebug('Data load error: ' + (error?.message || String(error)));
        // Don't block UI - continue with empty data
      }
    };

    loadDataWithTimeout();

    // 4. Polling fallback (no realtime, REST-only)
    const pollInterval = setInterval(() => {
      loadData().catch(err => console.warn('Polling update failed:', err));
    }, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
     document.documentElement.setAttribute('data-theme', theme);
     localStorage.setItem('nura_theme', theme);
  }, [theme]);

  const loadData = async () => {
    setIsSyncing(true);
    // Reset DB Error state before trying
    setDbError(false);

    try {
      const { data: txs, error: txError } = await fetchTransactions();
      if (txError) {
          console.warn('Transaction fetch error:', txError);
          // PGRST205 means table not found
          if (txError.code === 'PGRST205' || txError.message?.includes('does not exist')) {
              setDbError(true);
              setIsSyncing(false);
              return;
          }
      } else {
          setTransactions(txs || []);
      }

      const { data: svs, error: svError } = await fetchSavings();
      if (svError) {
          console.warn('Savings fetch error:', svError);
          if (svError.code === 'PGRST205' || svError.message?.includes('does not exist')) {
              setDbError(true);
              setIsSyncing(false);
              return;
          }
      } else {
          setSavingsAccounts(svs || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Handlers ---
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('nura_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('nura_user');
  };
  
  const handleAddTransaction = async () => {
    if (!amount || !currentUser) return;
    
    const newTransaction: Transaction = {
      id: '', // Generated by DB
      amount: parseFloat(amount),
      title: title || category,
      category,
      type,
      date: new Date().toISOString(),
      authorId: currentUser.id
    };

    setIsSyncing(true);
    await addTransactionToDb(newTransaction);
    // Wait a sec for realtime or reload manually if needed
    setTimeout(() => setIsSyncing(false), 500);

    setIsAddModalOpen(false);
    setAmount('');
    setTitle('');
  };

  const handleAddSavingsAccount = async (account: SavingsAccount) => {
    setIsSyncing(true);
    await addSavingToDb(account);
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleDeleteTransaction = async (id: string) => {
    setIsSyncing(true);
    await deleteTransactionFromDb(id);
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleDeleteSavingsAccount = async (id: string) => {
    setIsSyncing(true);
    await deleteSavingFromDb(id);
    setTimeout(() => setIsSyncing(false), 500);
  };

  // --- Calculated Values ---
  const totalBalance = transactions.reduce((acc, t) => 
    t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0
  );

  const monthExpenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((acc, t) => acc + t.amount, 0);

  // --- Auth Screen Render ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-tg-bg text-tg-text flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-tg-accent/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-tg-gold/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="z-10 w-full max-w-sm">
          <div className="flex justify-center mb-6">
             <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-tg-text to-tg-muted bg-clip-text text-transparent">Nura.</h1>
          </div>
          
          <div className="bg-tg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-center font-bold text-xl mb-2">Выберите профиль</h2>
            <p className="text-center text-sm text-tg-muted mb-8">Кто это?</p>
            
            <div className="grid grid-cols-2 gap-4">
              {USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="bg-tg-bg hover:bg-white/10 active:scale-95 transition-all p-6 rounded-xl flex flex-col items-center gap-3 border border-white/10 group hover:border-tg-accent/30"
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">{user.avatar}</span>
                  <span className="font-semibold text-sm text-tg-text group-hover:text-tg-accent">{user.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main App Render ---
  return (
    <div className="min-h-screen bg-tg-bg text-tg-text pb-28 font-sans selection:bg-tg-accent selection:text-white transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-white/5 px-5 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl tracking-tight text-tg-text">Nura.</h1>
            {isSyncing ? (
                <span className="text-xs text-tg-muted flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-tg-accent/50 animate-spin"></span>
                </span>
            ) : (
                <span className="w-2 h-2 rounded-full bg-tg-green/50 shadow-[0_0_8px_rgba(76,217,100,0.5)]"></span>
            )}
        </div>
        <div className="flex items-center gap-3">
             <div className="relative">
                <button 
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} 
                  className="p-2 rounded-full hover:bg-white/5 text-tg-muted flex items-center gap-1 transition-colors"
                >
                    <Palette size={20} />
                    <ChevronDown size={14} />
                </button>
                
                {isThemeMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-tg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30 animate-fade-in">
                    {THEMES.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => { setTheme(t.id); setIsThemeMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full border border-white/10" style={{backgroundColor: t.color}}></span>
                          {t.name}
                        </span>
                        {theme === t.id && <Check size={14} className="text-tg-accent" />}
                      </button>
                    ))}
                  </div>
                )}
             </div>

             <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 cursor-pointer" onClick={handleLogout}>
                <span className="text-sm">{currentUser?.avatar}</span>
                <span className="text-xs font-medium text-tg-muted hidden sm:inline">{currentUser?.name}</span>
             </div>
        </div>
      </header>

      <main className="p-5 max-w-lg mx-auto">
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            {/* Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-tg-secondary to-tg-card p-6 rounded-[2rem] shadow-2xl border border-white/5 group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-tg-accent/10 blur-3xl rounded-full group-hover:bg-tg-accent/20 transition-colors duration-500"></div>
               
               <div className="relative z-10">
                  <p className="text-tg-muted text-xs font-medium uppercase tracking-wider mb-2">Общий бюджет</p>
                  <h2 className="text-4xl font-bold text-tg-text mb-6">{totalBalance.toLocaleString()} ₽</h2>
                  
                  <div className="flex gap-3">
                    <div className="bg-black/20 p-3 rounded-2xl flex-1 backdrop-blur-sm border border-white/5">
                        <div className="flex items-center gap-1.5 text-tg-red mb-1">
                            <div className="p-1 bg-tg-red/10 rounded-full"><TrendingDown size={12} /></div>
                            <span className="text-[10px] font-medium uppercase opacity-70">Траты (мес)</span>
                        </div>
                        <p className="font-semibold text-lg">{monthExpenses.toLocaleString()} ₽</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Transactions List */}
            <div>
              <div className="flex justify-between items-end mb-4 px-2">
                <h3 className="font-bold text-lg text-tg-text">История</h3>
              </div>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                    <div className="text-center py-12 text-tg-muted text-sm bg-tg-card/30 rounded-3xl border border-white/5 border-dashed">
                      История пуста...
                    </div>
                ) : (
                    transactions.map(t => {
                        const author = USERS.find(u => u.id === t.authorId);
                        return <TransactionItem key={t.id} transaction={t} user={author} onDelete={handleDeleteTransaction} />;
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'savings' && (
            <SavingsView 
                accounts={savingsAccounts} 
                onAddAccount={handleAddSavingsAccount}
                onDeleteAccount={handleDeleteSavingsAccount}
            />
        )}

        {activeTab === 'stats' && (
          <ChartsView transactions={transactions} />
        )}
      </main>

      {/* FAB */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-5 bg-tg-text text-tg-bg p-4 rounded-[1.2rem] shadow-xl shadow-white/5 hover:scale-105 active:scale-95 transition-transform z-30 flex items-center justify-center"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-tg-card w-full max-w-md p-6 rounded-t-[2rem] sm:rounded-3xl border-t border-white/10 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-tg-text">Новая операция</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="bg-white/5 p-2 rounded-full text-tg-muted hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex gap-2 mb-6 bg-tg-bg p-1.5 rounded-2xl">
                <button 
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${type === TransactionType.EXPENSE ? 'bg-tg-secondary text-white shadow-md' : 'text-tg-muted hover:text-white'}`}
                    onClick={() => setType(TransactionType.EXPENSE)}
                >
                    Расход
                </button>
                <button 
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${type === TransactionType.INCOME ? 'bg-tg-secondary text-white shadow-md' : 'text-tg-muted hover:text-white'}`}
                    onClick={() => setType(TransactionType.INCOME)}
                >
                    Доход
                </button>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="text-xs text-tg-muted ml-1 block mb-2 font-medium">Сумма</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-tg-bg text-3xl font-bold text-tg-text p-5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-tg-accent placeholder-white/10"
                            autoFocus
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-tg-muted font-medium text-xl">₽</span>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-tg-muted ml-1 block mb-2 font-medium">Категория</label>
                    <div className="relative">
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Category)}
                            className="w-full bg-tg-bg text-tg-text p-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-tg-accent appearance-none"
                        >
                            {Object.values(Category).map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-tg-muted">
                            <TrendingDown size={16} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-tg-muted ml-1 block mb-2 font-medium">Комментарий</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Например: Ужин в ресторане"
                        className="w-full bg-tg-bg text-tg-text p-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-tg-accent placeholder-white/10"
                    />
                </div>

                <button 
                    onClick={handleAddTransaction}
                    className="w-full bg-tg-text text-tg-bg font-bold py-4 rounded-2xl mt-4 hover:brightness-90 active:scale-95 transition-all shadow-lg shadow-white/10"
                >
                    Сохранить
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Glass Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-high pb-safe pt-3 px-8 flex justify-between z-20 rounded-t-[2rem]">
        <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all ${activeTab === 'home' ? 'text-tg-text scale-105' : 'text-tg-muted hover:text-gray-400'}`}
        >
            <LayoutDashboard size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">Главная</span>
        </button>
        
        <button 
            onClick={() => setActiveTab('savings')}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all ${activeTab === 'savings' ? 'text-tg-gold scale-105' : 'text-tg-muted hover:text-gray-400'}`}
        >
            <Wallet size={24} strokeWidth={activeTab === 'savings' ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">Капитал</span>
        </button>

        <button 
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all ${activeTab === 'stats' ? 'text-tg-accent scale-105' : 'text-tg-muted hover:text-gray-400'}`}
        >
            <PieChart size={24} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">Отчеты</span>
        </button>
      </nav>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
