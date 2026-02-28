import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, MousePointer2, Zap, ArrowLeft, Trophy, Timer, AlertCircle, Loader2 } from 'lucide-react';
import { Howl } from 'howler';
import Confetti from 'react-confetti';

interface BusinessBingoProps {
  stake: number;
  walletBalance: number;
  onBack: () => void;
  playerName: string;
  activePlayersCount: number;
  isPlayerActive: boolean;
}

const sfx = {
  ball: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1084/1084-preview.mp3'], volume: 0.5 }),
  win: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'], volume: 0.7 }),
  click: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], volume: 0.3 }),
  start: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2600/2600-preview.mp3'], volume: 0.5 }),
};

const generateCard = (id: number) => {
  const cardNums: (number | null)[] = [];
  const columns = [
    { min: 1, max: 15 },
    { min: 16, max: 30 },
    { min: 31, max: 45 },
    { min: 46, max: 60 },
    { min: 61, max: 75 }
  ];

  columns.forEach((col) => {
    const available = Array.from({ length: col.max - col.min + 1 }, (_, i) => i + col.min);
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * available.length);
      cardNums.push(available.splice(idx, 1)[0]);
    }
  });

  const transposed: (number | null)[] = new Array(25);
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      transposed[i * 5 + j] = cardNums[j * 5 + i];
    }
  }
  transposed[12] = null; // FREE SPACE
  return { id, numbers: transposed };
};

const WIN_PATTERNS = [
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
];

const BusinessBingo: React.FC<BusinessBingoProps> = ({ stake, walletBalance, onBack, playerName, activePlayersCount, isPlayerActive }) => {
  const [cards] = useState(() => [generateCard(1), generateCard(2)]);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [markedIndices, setMarkedIndices] = useState<{ [cardId: number]: Set<number> }>({ 1: new Set([12]), 2: new Set([12]) });
  const [isAutoMark, setIsAutoMark] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<{ name: string; cardId: number; prize: number } | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const prizePool = (activePlayersCount * stake) * 0.7;

  // Wait for 5 players and active status
  const canStart = activePlayersCount >= 5 && isPlayerActive;

  useEffect(() => {
    if (canStart && countdown > 0 && !gameStarted) {
      const timer = setTimeout(() => {
        if (countdown === 10) sfx.ball.play(); // Warning ding
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (canStart && countdown === 0 && !gameStarted) {
      setGameStarted(true);
      sfx.start.play();
    }
  }, [canStart, countdown, gameStarted]);

  // Ball calling
  useEffect(() => {
    if (gameStarted && !isGameOver) {
      const interval = setInterval(() => {
        setCalledNumbers(prev => {
          if (prev.length >= 75) {
            setIsGameOver(true);
            return prev;
          }
          const available = Array.from({ length: 75 }, (_, i) => i + 1).filter(n => !prev.includes(n));
          const next = available[Math.floor(Math.random() * available.length)];
          sfx.ball.play();
          return [...prev, next];
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, isGameOver]);

  const currentBall = calledNumbers[calledNumbers.length - 1];

  // Auto-mark logic
  useEffect(() => {
    if (isAutoMark && currentBall) {
      cards.forEach(card => {
        const idx = card.numbers.indexOf(currentBall);
        if (idx !== -1) {
          handleMark(card.id, idx);
        }
      });
    }
  }, [currentBall, isAutoMark, cards]);

  const handleMark = (cardId: number, index: number) => {
    if (isGameOver) return;
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    const num = card.numbers[index];
    if (num !== null && !calledNumbers.includes(num)) return;

    setMarkedIndices(prev => {
      const next = { ...prev };
      const set = new Set(next[cardId]);
      if (set.has(index)) {
        if (index !== 12) set.delete(index);
      } else {
        set.add(index);
        sfx.click.play();
      }
      next[cardId] = set;
      
      // Check Win
      if (WIN_PATTERNS.some(p => p.every(idx => next[cardId].has(idx)))) {
        setWinner({ name: playerName, cardId, prize: prizePool });
        setIsGameOver(true);
        sfx.win.play();
      }
      
      return next;
    });
  };

  if (!isPlayerActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500 text-center">
        <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center animate-pulse">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black">ክፍያዎ እየተረጋገጠ ነው...</h2>
          <p className="text-slate-400 max-w-sm">እባክዎ ለአፍታ ይጠብቁ። አስተዳዳሪው ክፍያዎን ሲያረጋግጥ በራስ-ሰር ወደ ጨዋታው ይገባሉ።</p>
        </div>
        <button onClick={onBack} className="text-slate-500 font-bold hover:text-white flex items-center gap-2">
          <ArrowLeft size={18} /> ወደ መጀመሪያው ገጽ ተመለስ
        </button>
      </div>
    );
  }

  if (activePlayersCount < 5) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500 text-center">
        <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 animate-bounce" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black">ተጫዋቾች እየጠበቁ ነው...</h2>
          <p className="text-slate-400 max-w-md">5 ተጫዋቾች ሲሞሉ ጨዋታው ይጀምራል። በአሁኑ ሰዓት {activePlayersCount} ተጫዋቾች አሉ (Verified)።</p>
        </div>
        <div className="bg-slate-800/50 px-6 py-3 rounded-2xl border border-white/5 font-black text-blue-400">
          Waiting: {5 - activePlayersCount} More
        </div>
        <button onClick={onBack} className="text-slate-500 font-bold hover:text-white flex items-center gap-2">
          <ArrowLeft size={18} /> ተመለስ
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {isGameOver && winner && <Confetti recycle={false} numberOfPieces={500} />}

      {/* Top Banner for Countdown */}
      {!gameStarted && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-blue-600 p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-blue-600/20"
        >
          <div className="flex items-center gap-3">
            <Timer className="w-6 h-6 animate-pulse" />
            <span className="font-black">ጨዋታው ሊጀምር {countdown} ሰከንዶች ቀርተዋል...</span>
          </div>
          <div className="font-black bg-white/20 px-4 py-1 rounded-lg">
            {activePlayersCount} Players
          </div>
        </motion.div>
      )}

      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-white/10 p-6 rounded-[2rem] flex flex-col justify-center">
          <p className="text-green-400 text-xs font-black uppercase tracking-widest mb-1">ጠቅላላ ሽልማት (Prize Pool)</p>
          <p className="text-3xl font-black text-green-400">{prizePool.toLocaleString()} <span className="text-sm text-slate-500">ETB</span></p>
        </div>

        <div className="bg-slate-800/50 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">ተጫዋቾች</p>
            <p className="text-3xl font-black">{activePlayersCount}</p>
          </div>
          <Trophy className="w-10 h-10 text-blue-500/50" />
        </div>
      </div>

      {/* Main Board */}
      <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start gap-10">
          {/* Left: Ball Display */}
          <div className="flex flex-col items-center gap-8 w-full lg:w-1/4">
            <div className="space-y-1 text-center w-full">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">የወጣው ቁጥር (Ball)</h3>
              <div className="relative mx-auto w-32 h-32 md:w-48 md:h-48">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBall}
                    initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-5xl md:text-7xl font-black shadow-[0_0_60px_rgba(37,99,235,0.4)] border-4 border-white/10"
                  >
                    {currentBall || '--'}
                  </motion.div>
                </AnimatePresence>
                {!gameStarted && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md rounded-full flex flex-col items-center justify-center border-2 border-dashed border-white/10">
                    <span className="text-4xl font-black">{countdown}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full space-y-4 bg-white/5 p-4 rounded-3xl border border-white/5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ያለፉ ቁጥሮች</span>
                <span className="text-xs font-bold text-blue-400">{calledNumbers.length}/75</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {calledNumbers.slice().reverse().map(n => (
                  <div key={n} className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/20">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Bingo Cards */}
          <div className="flex-1 w-full space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setIsAutoMark(false)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${!isAutoMark ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                  ማንዋል (Manual)
                </button>
                <button 
                  onClick={() => setIsAutoMark(true)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${isAutoMark ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                  ራስ-ሰር (Auto)
                </button>
              </div>
              <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors text-xs font-bold flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> ተመለስ
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map(card => (
                <div key={card.id} className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ካርድ #{card.id}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 md:gap-2 bg-slate-800/30 p-3 md:p-4 rounded-[1.5rem] border border-white/5 backdrop-blur-sm">
                    {['B', 'I', 'N', 'G', 'O'].map(l => (
                      <div key={l} className="text-center font-black text-blue-500 text-lg">{l}</div>
                    ))}
                    {card.numbers.map((num, i) => {
                      const isMarked = markedIndices[card.id]?.has(i);
                      const isCalled = num === null || calledNumbers.includes(num);
                      const isWinningNum = isMarked && isGameOver && winner?.cardId === card.id;

                      return (
                        <button
                          key={i}
                          onClick={() => handleMark(card.id, i)}
                          disabled={isGameOver || (num !== null && !isCalled)}
                          className={`
                            aspect-square rounded-lg md:rounded-xl text-sm md:text-xl font-black transition-all duration-300 flex items-center justify-center relative overflow-hidden
                            ${num === null ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400' : 
                              isMarked ? (isWinningNum ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-blue-600 text-white shadow-lg') :
                              isCalled ? 'bg-slate-700 border border-blue-500/20 text-white' :
                              'bg-slate-800/50 border border-white/5 text-slate-700'
                            }
                          `}
                        >
                          {num === null ? 'ነፃ' : num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {isGameOver && winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                <Trophy size={40} className="text-white" />
              </div>
              
              <h2 className="text-4xl font-black mb-1">ቢንጎ!</h2>
              <p className="text-slate-400 font-bold mb-6 text-xs uppercase tracking-widest">አሸናፊ ተገኝቷል</p>

              <div className="bg-white/5 rounded-3xl p-6 mb-6 border border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">አሸናፊ</p>
                <p className="text-2xl font-black text-blue-400 mb-4">{winner.name}</p>
                <div className="h-px bg-white/5 w-10 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ሽልማት</p>
                <p className="text-4xl font-black text-green-400">{winner.prize.toLocaleString()} <span className="text-sm">ETB</span></p>
              </div>

              <button 
                onClick={onBack}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-500 transition-all active:scale-95"
              >
                ዝጋ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessBingo;