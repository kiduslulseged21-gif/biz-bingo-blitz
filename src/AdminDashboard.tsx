import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { CheckCircle, Clock, Users, DollarSign, PieChart, RotateCcw, Wallet as WalletIcon, Check, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserData {
  id: string;
  phone: string;
  balance: number;
  created_at: string;
}

interface WithdrawalData {
  id: string;
  user_id: string;
  amount: number;
  phone: string;
  status: 'pending' | 'paid';
  created_at: string;
  users?: { phone: string };
}

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<'players' | 'withdrawals'>('players');
  const [users, setUsers] = useState<UserData[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchData();
    
    // Subscriptions for real-time updates
    const usersChannel = supabase.channel('admin_users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => fetchData())
      .subscribe();

    const withdrawChannel = supabase.channel('admin_withdraws')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(withdrawChannel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get users and their wallet balances
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, phone, created_at, wallets(balance)');

      if (usersError) throw usersError;

      const formattedUsers = (usersData || []).map((u: any) => ({
        id: u.id,
        phone: u.phone,
        created_at: u.created_at,
        balance: u.wallets?.balance || 0
      }));

      setUsers(formattedUsers);

      // Get withdrawals
      const { data: withdrawData, error: withdrawError } = await supabase
        .from('withdrawals')
        .select('*, users(phone)')
        .order('created_at', { ascending: false });

      if (withdrawError) throw withdrawError;
      setWithdrawals(withdrawData || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async (userId: string, currentBalance: number) => {
    const amount = Number(addAmount[userId]);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const { error } = await supabase
        .from('wallets')
        .update({ balance: currentBalance + amount })
        .eq('user_id', userId);

      if (error) throw error;
      
      setAddAmount({ ...addAmount, [userId]: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add balance');
    }
  };

  const handleMarkPaid = async (withdrawId: string) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'paid' })
        .eq('id', withdrawId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      alert('Failed to mark as paid');
    }
  };

  const filteredUsers = users.filter(u => u.phone.includes(searchTerm));
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  const totalDeposits = users.reduce((acc, u) => acc + u.balance, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-black tracking-tight">የአስተዳዳሪ ዳሽቦርድ (Admin)</h2>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-2xl border border-white/5">
          <Search size={18} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="በስልክ ፈልግ..."
            className="bg-transparent border-none outline-none text-sm font-bold w-40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={<Users className="text-blue-400" />} 
          label="ጠቅላላ ተጫዋቾች" 
          value={users.length.toString()} 
        />
        <StatCard 
          icon={<WalletIcon className="text-green-400" />} 
          label="ያለ ጠቅላላ ሒሳብ" 
          value={totalDeposits.toLocaleString()} 
          suffix="ETB"
        />
        <StatCard 
          icon={<Clock className="text-amber-400" />} 
          label="የሚጠበቅ የማውጫ" 
          value={pendingWithdrawals.length.toString()} 
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5">
        <button 
          onClick={() => setTab('players')}
          className={`pb-4 px-2 font-black text-sm transition-all ${tab === 'players' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500'}`}
        >
          ተጫዋቾች ({users.length})
        </button>
        <button 
          onClick={() => setTab('withdrawals')}
          className={`pb-4 px-2 font-black text-sm transition-all ${tab === 'withdrawals' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500'}`}
        >
          ገንዘብ ማውጫዎች ({pendingWithdrawals.length})
        </button>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="divide-y divide-white/5">
          {tab === 'players' ? (
            filteredUsers.length === 0 ? (
              <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                ምንም ተጫዋች አልተገኘም
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-400 border border-white/5">
                      {user.phone.slice(-2)}
                    </div>
                    <div>
                      <p className="font-black text-lg">{user.phone}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">
                        Balance: <span className="text-green-400">{user.balance.toLocaleString()} ETB</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Amount"
                      className="bg-slate-800 border border-white/5 rounded-xl px-4 py-2 w-24 text-sm font-bold outline-none focus:ring-1 focus:ring-blue-500"
                      value={addAmount[user.id] || ''}
                      onChange={(e) => setAddAmount({ ...addAmount, [user.id]: e.target.value })}
                    />
                    <button 
                      onClick={() => handleAddBalance(user.id, user.balance)}
                      className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                      title="Add Balance"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            pendingWithdrawals.length === 0 ? (
              <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                ምንም የሚጠበቅ የማውጫ ጥያቄ የለም
              </div>
            ) : (
              pendingWithdrawals.map((w) => (
                <div key={w.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center font-black text-blue-400 border border-blue-500/20">
                      <WalletIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-lg">{w.amount} ETB</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Phone: <span className="text-white">{w.phone}</span> • Date: <span className="text-white">{new Date(w.created_at).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleMarkPaid(w.id)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-6 py-2.5 rounded-xl font-black transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" /> ተከፍሏል (Mark Paid)
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, suffix }: { icon: React.ReactNode, label: string, value: string, suffix?: string }) => (
  <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] shadow-2xl group hover:border-blue-500/20 transition-all">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-white/5 rounded-xl group-hover:bg-blue-500/10 transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-black">{value}</span>
      {suffix && <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{suffix}</span>}
    </div>
  </div>
);

export default AdminDashboard;