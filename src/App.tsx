import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Wallet, Settings, ArrowLeft, Info, LogOut, Phone } from 'lucide-react';
import { supabase } from './lib/supabase';
import LandingPage from './LandingPage';
import BusinessBingo from './BusinessBingo';
import PaymentSection from './PaymentSection';
import AdminDashboard from './AdminDashboard';
import WalletDisplay from './WalletDisplay';

export type Screen = 'login' | 'landing' | 'game' | 'deposit' | 'admin' | 'withdraw';

export interface UserProfile {
  id: string;
  phone: string;
  balance: number;
}

export interface Player {
  id: string;
  name: string;
  stake: number;
  status: 'waiting' | 'active';
  cards: number;
  transactionId?: string;
  isMe?: boolean;
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [screen, setScreen] = useState<Screen>('login');
  const [currentStake, setCurrentStake] = useState<number>(10);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session
  useEffect(() => {
    const savedPhone = localStorage.getItem('bingo_user_phone');
    if (savedPhone) {
      handleLogin(savedPhone);
    } else {
      setLoading(false);
    }
  }, []);

  // Real-time wallet balance subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`wallet-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setUser(prev => prev ? { ...prev, balance: payload.new.balance } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleLogin = async (phone: string) => {
    setLoading(true);
    try {
      let { data: existingUser, error } = await supabase
        .from('users')
        .select('id, phone')
        .eq('phone', phone)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      let userId = existingUser?.id;

      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ phone }])
          .select()
          .single();
        
        if (createError) throw createError;
        userId = newUser.id;
      }

      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (walletError) throw walletError;

      setUser({ id: userId, phone, balance: wallet.balance });
      localStorage.setItem('bingo_user_phone', phone);
      setScreen('landing');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('የመግቢያ ስህተት አጋጥሟል። እባክዎን እንደገና ይሞክሩ።');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bingo_user_phone');
    setUser(null);
    setScreen('login');
  };

  const handleSelectStake = async (stake: number) => {
    if (!user) return;
    
    if (user.balance < stake) {
      setErrorMessage('በቂ ሒሳብ የለዎትም። እባክዎ መጀመሪያ ሒሳብዎን ይሙሉ');
      return;
    }

    try {
      const { error } = await supabase
        .from('wallets')
        .update({ balance: user.balance - stake })
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentStake(stake);
      setScreen('game');
    } catch (err) {
      setErrorMessage('ክፍያው አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
    }
  };

  const handleWin = async (prize: number) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ balance: user.balance + prize })
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (err) {
      console.error('Win update failed', err);
    }
  };

  const activePlayersCount = Math.floor(Math.random() * 10) + 15; // Random simulated count for prize display

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-white/5 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => user && setScreen('landing')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">ARIF BINGO</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">BETESEB STYLE</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <WalletDisplay balance={user.balance} onWithdrawRequest={() => setScreen('withdraw')} />
            <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className={`p-2 rounded-xl transition-all ${isAdmin ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/5 text-slate-400 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

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

      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {screen === 'login' ? (
          <LoginForm onLogin={handleLogin} />
        ) : isAdmin ? (
          <div className="space-y-6">
             <button 
              onClick={() => setIsAdmin(false)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
            >
              <ArrowLeft className="w-5 h-5" /> ወደ ጨዋታው ተመለስ
            </button>
            <AdminDashboard />
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
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
                >
                  <ArrowLeft className="w-5 h-5" /> ተመለስ
                </button>
                <PaymentSection userId={user!.id} onBack={() => setScreen('landing')} />
              </div>
            )}
            {screen === 'withdraw' && (
              <WithdrawalForm 
                balance={user!.balance} 
                userId={user!.id} 
                onBack={() => setScreen('landing')} 
              />
            )}
            {screen === 'game' && (
              <BusinessBingo 
                stake={currentStake}
                walletBalance={user!.balance}
                onBack={() => setScreen('landing')}
                onWin={handleWin}
                playerName={user!.phone}
                activePlayersCount={activePlayersCount}
                isPlayerActive={true}
              />
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (phone: string) => void }) {
  const [phone, setPhone] = useState('09');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.startsWith('09') && /^\d*$/.test(val)) {
      setPhone(val);
    } else if (val === '' || val === '0') {
      setPhone('09');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl mt-10"
    >
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
          <Phone size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">እባክዎ ስልክ ቁጥርዎን ያስገቡ</h2>
        <p className="text-slate-400 text-sm italic">ለመጫወት መጀመሪያ መግቢያ ያስፈልጋል።</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">ስልክ ቁጥር (Phone Number)</label>
          <input 
            type="tel" 
            value={phone}
            onChange={handlePhoneChange}
            placeholder="09..."
            className="w-full bg-slate-800 border border-white/5 rounded-2xl py-5 px-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-xl"
          />
        </div>

        <button 
          onClick={() => onLogin(phone)}
          disabled={phone.length < 10}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-95"
        >
          ይግቡ (Login)
        </button>
      </div>
    </motion.div>
  );
}

function WithdrawalForm({ balance, userId, onBack }: { balance: number, userId: string, onBack: () => void }) {
  const [amount, setAmount] = useState('50');
  const [phone, setPhone] = useState('09');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.startsWith('09') && /^\d*$/.test(val)) {
      setPhone(val);
    } else if (val === '' || val === '0') {
      setPhone('09');
    }
  };

  const handleSubmit = async () => {
    const amt = Number(amount);
    if (amt < 50 || amt > balance) return;
    
    setLoading(true);
    try {
      const { error: wError } = await supabase
        .from('withdrawals')
        .insert([{ user_id: userId, amount: amt, phone, status: 'pending' }]);

      if (wError) throw wError;

      const { error: bError } = await supabase
        .from('wallets')
        .update({ balance: balance - amt })
        .eq('user_id', userId);

      if (bError) throw bError;

      setSuccess(true);
      setTimeout(onBack, 3000);
    } catch (err) {
      alert('የማውጫ ጥያቄው አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl mt-10"
      >
        <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto text-green-500">
          <Trophy size={40} />
        </div>
        <h2 className="text-2xl font-black">ጥያቄዎ ተልኳል!</h2>
        <p className="text-slate-400">አስተዳዳሪው ሲያረጋግጥ ገንዘቡ በቴሌብር ይላክለታል።</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl mt-10"
    >
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-black tracking-tight">ገንዘብ ማውጫ</h2>
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
          <p className="text-[10px] text-slate-500 ml-2 italic">ያለዎት ሒሳብ: {balance.toLocaleString()} ETB</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">ቴሌብር ስልክ ቁጥር</label>
          <input 
            type="tel" 
            value={phone}
            onChange={handlePhoneChange}
            placeholder="09..."
            className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading || phone.length < 10 || Number(amount) < 50 || Number(amount) > balance}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-95"
        >
          {loading ? 'እየላክን ነው።..' : 'ጥያቄውን ላክ'}
        </button>

        <button onClick={onBack} className="w-full text-slate-500 font-bold hover:text-white text-sm">
          ተመለስ
        </button>
      </div>
    </motion.div>
  );
}