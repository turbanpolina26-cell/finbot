
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Plus, LayoutDashboard, PieChart, X, Wallet, TrendingDown, TrendingUp, 
  Palette, ChevronDown, Check, ArrowUpRight, ArrowDownLeft, Settings, 
  Bell, Eye, EyeOff, Send
} from 'lucide-react';
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
  { id: 'obsidian', name: 'Obsidian', color: '#0f1014' },
  { id: 'cotton-candy', name: 'Cotton Candy', color: '#130f26' },
  { id: 'aurora', name: 'Aurora', color: '#f0f2f5' },
  { id: 'forest', name: 'Forest', color: '#0d1f12' },
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

    try {
      setIsSyncing(true);
      await addTransactionToDb(newTransaction);
      // Wait a sec for realtime or reload manually if needed
      setTimeout(() => setIsSyncing(false), 500);

      setIsAddModalOpen(false);
      setAmount('');
      setTitle('');
    } catch (error) {
      console.error('Error adding transaction:', error);
      setIsSyncing(false);
      alert('Error adding transaction. Please try again.');
    }
  };

  const handleAddSavingsAccount = async (account: SavingsAccount) => {
    try {
      setIsSyncing(true);
      await addSavingToDb(account);
      setTimeout(() => setIsSyncing(false), 500);
    } catch (error) {
      console.error('Error adding savings account:', error);
      setIsSyncing(false);
      alert('Error adding savings account. Please try again.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      setIsSyncing(true);
      await deleteTransactionFromDb(id);
      setTimeout(() => setIsSyncing(false), 500);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setIsSyncing(false);
      alert('Error deleting transaction. Please try again.');
    }
  };

  const handleDeleteSavingsAccount = async (id: string) => {
    try {
      setIsSyncing(true);
      await deleteSavingFromDb(id);
      setTimeout(() => setIsSyncing(false), 500);
    } catch (error) {
      console.error('Error deleting savings account:', error);
      setIsSyncing(false);
      alert('Error deleting savings account. Please try again.');
    }
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
      {/* Premium Header */}
      <header className="fixed top-0 left-0 right-0 z-20 glass-high border-b border-white/5 px-5 py-4 flex justify-between items-center transition-all duration-300 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <h1 className="font-bold text-2xl tracking-tight text-tg-text">Nura</h1>
            <div className="absolute -bottom-0.5 left-0 h-0.5 w-8 bg-gradient-to-r from-tg-accent to-transparent"></div>
          </div>
          {isSyncing ? (
            <span className="text-xs text-tg-accent/80 flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-tg-accent animate-spin"></span>
              Синхро...
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-tg-green/70 shadow-[0_0_12px_rgba(76,217,100,0.6)] animate-pulse"></span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} 
              className="p-2.5 rounded-full hover:bg-white/10 text-tg-muted hover:text-tg-text flex items-center gap-1 transition-all duration-300 hover:shadow-lg hover:shadow-tg-accent/10"
            >
              <Palette size={20} />
            </button>
            
            {isThemeMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-tg-card/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30 animate-fade-in backdrop-blur-xl">
                {THEMES.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => { setTheme(t.id); setIsThemeMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex items-center justify-between transition-colors duration-200 group border-b border-white/5 last:border-0"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors" style={{backgroundColor: t.color}}></span>
                      <span className="font-medium text-tg-text group-hover:text-tg-accent transition-colors">{t.name}</span>
                    </span>
                    {theme === t.id && <Check size={16} className="text-tg-accent animate-pulse" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2.5 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 px-3.5 py-2 rounded-full border border-white/10 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
          >
            <span className="text-base">{currentUser?.avatar}</span>
            <span className="text-xs font-semibold text-tg-text hidden sm:inline">{currentUser?.name}</span>
          </button>
        </div>
      </header>

      <main className="pt-20 px-5 max-w-lg mx-auto pb-32">
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            {/* Premium Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-tg-secondary via-tg-card to-tg-secondary p-8 rounded-3xl shadow-2xl border border-white/10 group">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-tg-accent/15 blur-3xl rounded-full group-hover:bg-tg-accent/25 transition-all duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-tg-gold/10 blur-3xl rounded-full group-hover:bg-tg-gold/15 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <p className="text-tg-muted text-xs font-bold uppercase tracking-widest mb-2">Ваш Бюджет</p>
                <h2 className="text-5xl font-black text-tg-text mb-8 tracking-tight">
                  {totalBalance.toLocaleString()}
                  <span className="text-3xl text-tg-muted ml-2">₽</span>
                </h2>
                
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 hover:bg-black/30 p-4 rounded-2xl backdrop-blur-sm border border-white/5 transition-all duration-300 group/stat">
                    <div className="flex items-center gap-1.5 text-red-400 mb-2">
                      <div className="p-1.5 bg-red-500/10 rounded-full group-hover/stat:bg-red-500/20 transition-colors">
                        <TrendingDown size={14} />
                      </div>
                      <span className="text-[10px] font-bold uppercase opacity-75">Траты (мес)</span>
                    </div>
                    <p className="font-bold text-xl text-tg-text">{monthExpenses.toLocaleString()} ₽</p>
                  </div>
                  
                  <div className="bg-black/20 hover:bg-black/30 p-4 rounded-2xl backdrop-blur-sm border border-white/5 transition-all duration-300 group/stat">
                    <div className="flex items-center gap-1.5 text-green-400 mb-2">
                      <div className="p-1.5 bg-green-500/10 rounded-full group-hover/stat:bg-green-500/20 transition-colors">
                        <TrendingUp size={14} />
                      </div>
                      <span className="text-[10px] font-bold uppercase opacity-75">Всего трат</span>
                    </div>
                    <p className="font-bold text-xl text-tg-text">{transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, t) => a + t.amount, 0).toLocaleString()} ₽</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div>
              <div className="flex justify-between items-end mb-5 px-2">
                <h3 className="font-bold text-xl text-tg-text">История транзакций</h3>
                <span className="text-xs text-tg-muted font-semibold">{transactions.length} шт</span>
              </div>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-16 text-tg-muted text-sm bg-tg-card/30 rounded-3xl border-2 border-white/5 border-dashed">
                    <div className="text-4xl mb-3">📭</div>
                    История пуста. Добавьте первую транзакцию!
                  </div>
                ) : (
                  transactions.map((t, idx) => {
                    const author = USERS.find(u => u.id === t.authorId);
                    return (
                      <div key={t.id} className="animate-fade-in" style={{animationDelay: `${idx * 50}ms`}}>
                        <TransactionItem transaction={t} user={author} onDelete={handleDeleteTransaction} />
                      </div>
                    );
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

      {/* FAB (Floating Action Button) - Premium Design */}
      <div className="fixed bottom-28 right-6 z-40 group">
        {/* Background blur effect on hover */}
        <div className="absolute inset-0 bg-tg-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150"></div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-tg-accent to-tg-accent/80 shadow-2xl shadow-tg-accent/30 hover:shadow-tg-accent/50 active:scale-90 transition-all duration-300 flex items-center justify-center group/btn overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 animate-pulse"></div>
          
          {/* Icon */}
          <Plus size={28} strokeWidth={2.5} className="text-white relative z-10 group-hover/btn:scale-110 transition-transform duration-300" />
          
          {/* Glow ring */}
          <div className="absolute inset-1 border-2 border-white/30 rounded-full opacity-0 group-hover/btn:opacity-100 animate-pulse"></div>
        </button>
      </div>

      {/* Add Transaction Modal - Premium Design */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-lg animate-fade-in">
          <div className="bg-gradient-to-b from-tg-card to-tg-secondary w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl border-t border-white/10 shadow-2xl animate-slide-up relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-tg-accent/5 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-tg-text to-tg-muted bg-clip-text text-transparent">Новая операция</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="bg-white/10 hover:bg-white/20 active:scale-90 p-2 rounded-full text-tg-muted hover:text-white transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Type toggle - Smooth Animation */}
              <div className="flex gap-2 mb-6 bg-tg-bg/50 p-1.5 rounded-2xl border border-white/5">
                <button 
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    type === TransactionType.EXPENSE 
                      ? 'bg-gradient-to-r from-red-500/80 to-orange-500/80 text-white shadow-lg shadow-red-500/30' 
                      : 'text-tg-muted hover:text-white'
                  }`}
                  onClick={() => setType(TransactionType.EXPENSE)}
                >
                  <ArrowDownLeft size={16} />
                  Расход
                </button>
                <button 
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    type === TransactionType.INCOME 
                      ? 'bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white shadow-lg shadow-green-500/30' 
                      : 'text-tg-muted hover:text-white'
                  }`}
                  onClick={() => setType(TransactionType.INCOME)}
                >
                  <ArrowUpRight size={16} />
                  Доход
                </button>
              </div>

              <div className="space-y-5">
                {/* Amount Input */}
                <div className="group">
                  <label className="text-xs text-tg-muted ml-1 block mb-2 font-semibold uppercase tracking-wider">Сумма</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-tg-bg/70 text-4xl font-bold text-tg-text p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tg-accent/50 placeholder-tg-muted/60 transition-all duration-300 group-focus-within:ring-tg-accent min-h-16"
                      autoFocus
                      inputMode="decimal"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-tg-muted font-semibold text-2xl group-focus-within:text-tg-accent transition-colors pointer-events-none">₽</span>
                  </div>
                </div>

                {/* Category Select */}
                <div className="group">
                  <label className="text-xs text-tg-muted ml-1 block mb-2 font-semibold uppercase tracking-wider">Категория</label>
                  <div className="relative">
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full bg-tg-bg/70 text-tg-text p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tg-accent/50 appearance-none transition-all duration-300 font-medium cursor-pointer group-focus-within:ring-tg-accent text-base min-h-14"
                    >
                      {Object.values(Category).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-tg-muted group-focus-within:text-tg-accent transition-colors">
                      <TrendingDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Comment Input */}
                <div className="group">
                  <label className="text-xs text-tg-muted ml-1 block mb-2 font-semibold uppercase tracking-wider">Комментарий</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: Ужин в ресторане"
                    className="w-full bg-tg-bg/70 text-tg-text p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tg-accent/50 placeholder-tg-muted/60 transition-all duration-300 group-focus-within:ring-tg-accent text-base min-h-14"
                  />
                </div>

                {/* Save Button */}
                <button 
                  onClick={handleAddTransaction}
                  className="w-full bg-gradient-to-r from-tg-accent to-tg-accent/80 text-white font-bold py-4 rounded-2xl mt-6 hover:shadow-lg hover:shadow-tg-accent/30 active:scale-95 transition-all duration-300 shadow-md shadow-tg-accent/20 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass-high pb-safe pt-4 px-4 flex justify-around items-center z-20 rounded-t-3xl border-t border-white/10">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 min-h-14 min-w-14 active:scale-95 active:bg-white/5 ${ 
            activeTab === 'home' 
              ? 'bg-tg-accent/20 text-tg-accent shadow-lg shadow-tg-accent/20 scale-105' 
              : 'text-tg-muted'
          }`}
        >
          <div className="relative">
            <LayoutDashboard size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            {activeTab === 'home' && <div className="absolute inset-0 bg-tg-accent/20 blur-md rounded-full"></div>}
          </div>
          <span className="text-[11px] font-semibold tracking-wide">Главная</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('savings')}
          className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 min-h-14 min-w-14 active:scale-95 active:bg-white/5 ${
            activeTab === 'savings' 
              ? 'bg-tg-gold/20 text-tg-gold shadow-lg shadow-tg-gold/20 scale-105' 
              : 'text-tg-muted'
          }`}
        >
          <div className="relative">
            <Wallet size={24} strokeWidth={activeTab === 'savings' ? 2.5 : 2} />
            {activeTab === 'savings' && <div className="absolute inset-0 bg-tg-gold/20 blur-md rounded-full"></div>}
          </div>
          <span className="text-[11px] font-semibold tracking-wide">Капитал</span>
        </button>

        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 min-h-14 min-w-14 active:scale-95 active:bg-white/5 ${
            activeTab === 'stats' 
              ? 'bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/20 scale-105' 
              : 'text-tg-muted'
          }`}
        >
          <div className="relative">
            <PieChart size={24} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
            {activeTab === 'stats' && <div className="absolute inset-0 bg-purple-500/20 blur-md rounded-full"></div>}
          </div>
          <span className="text-[11px] font-semibold tracking-wide">Отчеты</span>
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
