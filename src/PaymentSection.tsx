import React, { useState } from 'react';
import { Smartphone, Receipt, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentSectionProps {
  userId: string;
  onBack: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ userId, onBack }) => {
  const [copied, setCopied] = useState(false);

  const telebirrNumber = "0912345678"; // Simulated admin number

  const copyToClipboard = () => {
    navigator.clipboard.writeText(telebirrNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-10"
    >
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-600/20">
          <Smartphone size={40} className="text-white" />
        </div>
        <h2 className="text-4xl font-black tracking-tight">ሒሳብ ይሙሉ። (Deposit)</h2>
        <p className="text-slate-400 text-lg">ዝቅተኛ የማውጫ መጠን 20 ETB ነው።</p>
      </div>

      <div className="space-y-8">
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-blue-400 uppercase tracking-widest">ቴሌብር ቁጥር (Telebirr)</span>
            <Receipt className="text-blue-500" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-3xl md:text-4xl font-black tracking-wider">{telebirrNumber}</p>
            <button 
              onClick={copyToClipboard}
              className="p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all active:scale-95"
            >
              {copied ? <Check size={24} /> : <Copy size={24} />}
            </button>
          </div>
          <p className="text-xs text-blue-300 font-bold">እባክዎ በዚህ ቁጥር ላይ ገንዘብ ያስገቡ። ክፍያው አስተዳዳሪው ጋር ሲደርስ ሒሳብዎ ይሞላል።</p>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">የአስተዳዳሪው ስልክ</p>
            <p className="font-bold">0911223344</p>
          </div>
          <a href="tel:0911223344" className="text-blue-400 font-black text-sm hover:underline">ለመጠየቅ ይደውሉ</a>
        </div>

        <button 
          onClick={onBack}
          className="w-full text-slate-500 font-bold hover:text-white transition-all py-2"
        >
          ተመለስ
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentSection;