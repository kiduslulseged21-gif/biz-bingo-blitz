import React from 'react';
import { motion } from 'framer-motion';
import { Play, CreditCard, Star, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onPlay10: () => void;
  onPlay20: () => void;
  onDepositClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onPlay10, onPlay20, onDepositClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto text-center space-y-12 py-8"
    >
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]"
        >
          እንኳን ወደ አሪፍ ቢንጎ በሰላም መጡ
        </motion.div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
          ለመጫወት ይምረጡ
        </h2>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          የሚፈልጉትን የካርድ ዋጋ በመምረጥ ወደ ጨዋታው ይግቡ። ትልቅ ያሸንፉ!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Play 10 */}
        <button
          onClick={onPlay10}
          className="group relative bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-900/40"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Star className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-2xl font-black">10</span>
            </div>
            <div>
              <h3 className="text-3xl font-black">Play 10</h3>
              <p className="text-blue-100/60 font-bold uppercase tracking-widest text-xs mt-1">በ10 ብር ተጫወት</p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-white font-bold bg-white/10 px-6 py-2 rounded-xl">
              <Play className="w-4 h-4 fill-current" /> አሁኑኑ ጀምር
            </div>
          </div>
        </button>

        {/* Play 20 */}
        <button
          onClick={onPlay20}
          className="group relative bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-[2.5rem] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-purple-900/40"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-2xl font-black">20</span>
            </div>
            <div>
              <h3 className="text-3xl font-black">Play 20</h3>
              <p className="text-purple-100/60 font-bold uppercase tracking-widest text-xs mt-1">በ20 ብር ተጫወት</p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-white font-bold bg-white/10 px-6 py-2 rounded-xl">
              <Play className="w-4 h-4 fill-current" /> አሁኑኑ ጀምር
            </div>
          </div>
        </button>
      </div>

      <div className="pt-8">
        <button 
          onClick={onDepositClick}
          className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-2xl transition-all text-slate-300 font-bold"
        >
          <CreditCard className="w-5 h-5 text-blue-400" />
          ሒሳብ ይሙሉ። (Deposit)
        </button>
      </div>
    </motion.div>
  );
};

export default LandingPage;