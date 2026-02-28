import React, { useState } from 'react';
import { Smartphone, Upload, CreditCard, CheckCircle, Info } from 'lucide-react';

interface PaymentSectionProps {
  onDeposit: (amount: number) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ onDeposit }) => {
  const [amount, setAmount] = useState<string>('20');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setScreenshot(event.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (val < 20) return;
    if (transactionId && screenshot) {
      setIsProcessing(true);
      // Simulate admin verification
      setTimeout(() => {
        onDeposit(val);
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-black tracking-tight">ሂሳብ ይሙሉ</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          ዝቅተኛ የክፍያ መጠን 20 ብር ነው። እባክዎ የከፈሉበትን የቴሌብር ማረጋገጫ ቁጥር ወይም ፎቶ ይላኩ።
        </p>
      </div>

      <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-3xl flex items-center gap-5">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <Smartphone className="text-white w-7 h-7" />
        </div>
        <div>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">የቴሌብር ቁጥር</p>
          <p className="text-2xl font-black tracking-wider">0913670635</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">የክፍያ መጠን (ETB)</label>
          <input 
            type="number" 
            min="20"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-xl"
            placeholder="20"
          />
          <p className="text-[10px] text-slate-500 ml-2 italic">* አነስተኛ መጠን 20 ብር</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">ማረጋገጫ ቁጥር (Ref Number)</label>
          <div className="relative">
            <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
              className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
              placeholder="AB123456789"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">የክፍያ ማረጋገጫ ፎቶ ይላኩ</label>
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`w-full border-2 border-dashed ${screenshot ? 'border-green-500/50 bg-green-500/5' : 'border-slate-800 bg-slate-800/50'} rounded-2xl py-10 flex flex-col items-center justify-center gap-3 transition-all group-hover:border-blue-500/30`}>
              {screenshot ? (
                <>
                  <CheckCircle className="w-10 h-10 text-green-500" />
                  <p className="text-sm text-green-400 font-black">ፎቶ ተመርጧል</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  <p className="text-sm text-slate-500 font-bold">ስክሪንሾት እዚህ ይጫኑ</p>
                </>
              )}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={!transactionId || !screenshot || isProcessing || Number(amount) < 20}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-95"
        >
          {isProcessing ? 'በማረጋገጥ ላይ...' : 'ክፍያውን አጠናቅ (Deposit)'}
        </button>
      </form>
    </div>
  );
};

export default PaymentSection;