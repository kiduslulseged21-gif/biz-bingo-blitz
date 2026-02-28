import React, { useState } from 'react';
import { Player, Withdrawal } from './App';
import { CheckCircle, Clock, Users, DollarSign, PieChart, RotateCcw, Image as ImageIcon, Wallet as WalletIcon, Check } from 'lucide-react';

interface AdminDashboardProps {
  players: Player[];
  withdrawals: Withdrawal[];
  onReset: () => void;
  onVerify: (id: string) => void;
  onMarkWithdrawalPaid: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  players, 
  withdrawals,
  onReset,
  onVerify,
  onMarkWithdrawalPaid
}) => {
  const [tab, setTab] = useState<'players' | 'withdrawals'>('players');

  const activePlayers = players.filter(p => p.status === 'active');
  const pendingPlayers = players.filter(p => p.status === 'waiting');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  
  const totalStake = activePlayers.reduce((acc, p) => acc + p.stake, 0);
  const adminCommission = totalStake * 0.3;
  const winnerPrize = totalStake * 0.7;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-black tracking-tight">የአስተዳዳሪ ዳሽቦርድ (Admin)</h2>
        <button 
          onClick={onReset}
          className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-6 py-3 rounded-2xl font-bold transition-all border border-red-500/20"
        >
          <RotateCcw className="w-5 h-5" /> ጨዋታውን ቀይር (Reset)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="text-blue-400" />} 
          label="ንቁ ተጫዋቾች" 
          value={activePlayers.length.toString()} 
          suffix="/ 200"
        />
        <StatCard 
          icon={<DollarSign className="text-green-400" />} 
          label="ጠቅላላ ገቢ" 
          value={totalStake.toLocaleString()} 
          suffix="ETB"
        />
        <StatCard 
          icon={<PieChart className="text-purple-400" />} 
          label="ኮሚሽን (30%)" 
          value={adminCommission.toLocaleString()} 
          suffix="ETB"
        />
        <StatCard 
          icon={<CheckCircle className="text-yellow-400" />} 
          label="የአሸናፊ ሽልማት" 
          value={winnerPrize.toLocaleString()} 
          suffix="ETB"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5">
        <button 
          onClick={() => setTab('players')}
          className={`pb-4 px-2 font-black text-sm transition-all ${tab === 'players' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500'}`}
        >
          ተጫዋቾች ({pendingPlayers.length})
        </button>
        <button 
          onClick={() => setTab('withdrawals')}
          className={`pb-4 px-2 font-black text-sm transition-all ${tab === 'withdrawals' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500'}`}
        >
          ገንዘብ ማውጫዎች ({pendingWithdrawals.length})
        </button>
      </div>

      {/* Verification Queue */}
      <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-6 bg-white/5 border-b border-white/5">
          <h3 className="font-black flex items-center gap-3">
            {tab === 'players' ? <Clock className="w-6 h-6 text-amber-500" /> : <WalletIcon className="w-6 h-6 text-blue-500" />}
            {tab === 'players' ? `ማረጋገጫ የሚጠብቁ (${pendingPlayers.length})` : `ገንዘብ ማውጣት የጠየቁ (${pendingWithdrawals.length})`}
          </h3>
        </div>
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
          {tab === 'players' ? (
            pendingPlayers.length === 0 ? (
              <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                ምንም የሚጠባበቅ ክፍያ የለም
              </div>
            ) : (
              pendingPlayers.map((player) => (
                <div key={player.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-400 border border-white/5">
                      {player.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-lg">{player.name} {player.isMe && <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded ml-2">እርስዎ</span>}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Stake: <span className="text-white">{player.stake} ETB</span> • Ref: <span className="text-white">{player.transactionId || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest px-4 py-2 bg-white/5 rounded-xl border border-white/5 transition-all">
                      <ImageIcon className="w-4 h-4" /> ፎቶ እይ
                    </button>
                    <button 
                      onClick={() => onVerify(player.id)}
                      className="bg-green-600 hover:bg-green-500 text-white text-xs px-6 py-2.5 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-green-900/20"
                    >
                      አረጋግጥ
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            pendingWithdrawals.length === 0 ? (
              <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                ምንም የሚጠባበቅ የማውጫ ጥያቄ የለም
              </div>
            ) : (
              pendingWithdrawals.map((w) => (
                <div key={w.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center font-black text-blue-400 border border-blue-500/20">
                      <ArrowCcwIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-lg">{w.amount} ETB</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Phone: <span className="text-white">{w.phone}</span> • Date: <span className="text-white">{new Date(w.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onMarkWithdrawalPaid(w.id)}
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

function ArrowCcwIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export default AdminDashboard;