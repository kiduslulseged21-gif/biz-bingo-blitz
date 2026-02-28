import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Wallet, Settings, ArrowLeft, Play, Info, LogOut, ReceiptText } from 'lucide-react';
import LandingPage from './LandingPage';
import BusinessBingo from './BusinessBingo';
import PaymentSection from './PaymentSection';
import AdminDashboard from './AdminDashboard';
import WalletDisplay from './WalletDisplay';

// --- Types ---
export type Screen = 'landing' | 'game' | 'deposit' | 'admin' | 'withdraw';

export interface Player {
  id: string;
  name: string;
  stake: number;
  status: 'waiting' | 'active';
  cards: number;
  transactionId?: string;
  isMe?: boolean;
}

export interface Withdrawal {
  id: string;
  amount: number;
  phone: string;
  status: 'pending' | 'paid';
  createdAt: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [currentStake, setCurrentStake] = useState<number>(10);
  const [playerName] = useState<string>('እርስዎ (You)');
  const [players, setPlayers] = useState<Player[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load wallet from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('arif_bingo_wallet');
    if (savedWallet) setWalletBalance(Number(savedWallet));

    const savedWithdrawals = localStorage.getItem('arif_bingo_withdrawals');
    if (savedWithdrawals) setWithdrawals(JSON.parse(savedWithdrawals));
    
    // Initial simulated players
    const simulated = [
      { id: '1', name: 'አበበ', stake: 10, status: 'active', cards: 1 },
      { id: '2', name: 'ሳሙኤል', stake: 10, status: 'active', cards: 2 },
      { id: '3', name: 'መረሻ', stake: 20, status: 'waiting', cards: 1, transactionId: 'TX123' },
      { id: '4', name: 'ፋሲካ', stake: 20, status: 'active', cards: 1 },
    ];
    setPlayers(simulated as Player[]);
  }, []);

  useEffect(() => {
    localStorage.setItem('arif_bingo_wallet', walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem('arif_bingo_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  const handleSelectStake = (stake: number) => {
    if (walletBalance < stake) {
      setErrorMessage('በቂ ሂሳብ የለዎትም። እባክዎ መጀመሪያ ሂሳብዎን ይሙሉ');
      return;
    }
    
    // Check if already in game
    const existing = players.find(p => p.isMe);
    if (existing) {
      setScreen('game');
      return;
    }

    const newMe: Player = {
      id: 'me',
      name: playerName,
      stake: stake,
      status: 'waiting',
      cards: 2,
      isMe: true
    };

    setWalletBalance(prev => prev - stake);
    setPlayers(prev => [...prev, newMe]);
    setCurrentStake(stake);
    setScreen('game');
  };

  const handleDeposit = (amount: number) => {
    setWalletBalance(prev => prev + amount);
    setScreen('landing');
  };

  const handleWithdrawSubmit = (amount: number, phone: string) => {
    if (walletBalance < amount) {
      setErrorMessage('በቂ ሂሳብ የለዎትም');
      return;
    }
    if (amount < 50) {
      setErrorMessage('ዝቅተኛው የማውጫ መጠን 50 ብር ነው።');
      return;
    }

    const newWithdrawal: Withdrawal = {
      id: Date.now().toString(),
      amount,
      phone,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setWalletBalance(prev => prev - amount);
    setWithdrawals(prev => [newWithdrawal, ...prev]);
    setScreen('landing');
    setErrorMessage('የማውጫ ጥያቄዎ ተልኳል። አስተዳዳሪው ሲያረጋግጥ ይላክለታል።');
  };

  const activePlayers = players.filter(p => p.status === 'active');
  const me = players.find(p => p.isMe);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-white/5 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen('landing')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">ARIF BINGO</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">BETESEB STYLE</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <WalletDisplay balance={walletBalance} onWithdrawRequest={() => setScreen('withdraw')} />
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className={`p-2 rounded-xl transition-all ${isAdmin ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Error/Info Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3"
          >
            <Info className="w-5 h-5" />
            <span className="text-sm">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-4 text-xs bg-black/20 px-2 py-1 rounded-lg">ዝጋ</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {isAdmin ? (
          <div className="space-y-6">
             <button 
              onClick={() => setIsAdmin(false)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> ወደ ጨዋታው ተመለስ
            </button>
            <AdminDashboard 
              players={players}
              withdrawals={withdrawals}
              onReset={() => {
                setPlayers([]);
                setScreen('landing');
              }}
              onVerify={(id) => {
                setPlayers(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
              }}
              onMarkWithdrawalPaid={(id) => {
                setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'paid' } : w));
              }}
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {screen === 'landing' && (
              <LandingPage 
                onPlay10={() => handleSelectStake(10)} 
                onPlay20={() => handleSelectStake(20)}
                onDepositClick={() => setScreen('deposit')}
              />
            )}
            {screen === 'deposit' && (
              <div className="space-y-6">
                <button 
                  onClick={() => setScreen('landing')}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" /> ተመለስ
                </button>
                <PaymentSection onDeposit={handleDeposit} />
              </div>
            )}
            {screen === 'withdraw' && (
              <WithdrawalForm 
                balance={walletBalance} 
                onSubmit={handleWithdrawSubmit} 
                onBack={() => setScreen('landing')} 
              />
            )}
            {screen === 'game' && (
              <BusinessBingo 
                stake={currentStake}
                walletBalance={walletBalance}
                onBack={() => setScreen('landing')}
                playerName={playerName}
                activePlayersCount={activePlayers.length}
                isPlayerActive={me?.status === 'active'}
              />
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

function WithdrawalForm({ balance, onSubmit, onBack }: { balance: number, onSubmit: (amount: number, phone: string) => void, onBack: () => void }) {
  const [amount, setAmount] = useState('50');
  const [phone, setPhone] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl"
    >
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-black tracking-tight">ገንዘብ ማውጫ (Withdraw)</h2>
        <p className="text-slate-400 text-sm">ዝቅተኛው የማውጫ መጠን 50 ብር ነው።</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">የማውጫ መጠን (ETB)</label>
          <input 
            type="number" 
            min="50"
            max={balance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-xl"
          />
          <p className="text-[10px] text-slate-500 ml-2 italic">ያለዎት ሂሳብ: {balance.toLocaleString()} ETB</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">ቴሌብር ስልክ ቁጥር</label>
          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09..."
            className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
          />
        </div>

        <button 
          onClick={() => onSubmit(Number(amount), phone)}
          disabled={!phone || Number(amount) < 50 || Number(amount) > balance}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-95"
        >
          ጥያቄውን ላክ
        </button>

        <button onClick={onBack} className="w-full text-slate-500 font-bold hover:text-white text-sm">
          ተመለስ
        </button>
      </div>
    </motion.div>
  );
}