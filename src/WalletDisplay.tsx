import React from 'react';
import { ArrowUpCircle } from 'lucide-react';

interface WalletDisplayProps {
  balance: number;
  onWithdrawRequest: () => void;
}

const WalletDisplay: React.FC<WalletDisplayProps> = ({ balance, onWithdrawRequest }) => {
  return (
    <div className="bg-slate-900 border border-white/5 pl-4 pr-1.5 py-1.5 rounded-2xl flex items-center gap-4 shadow-xl">
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-0.5">የአሁኑ ሒሳብ</span>
        <span className="text-lg font-black text-white tabular-nums leading-none">
          {balance.toLocaleString()} <span className="text-xs text-blue-500">ETB</span>
        </span>
      </div>
      <button 
        onClick={onWithdrawRequest}
        title="ገንዘብ ማውጣት (Withdraw)"
        className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 hover:bg-blue-600/20 transition-all text-blue-400"
      >
        <ArrowUpCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

export default WalletDisplay;