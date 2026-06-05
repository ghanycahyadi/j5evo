import React, { useState, useEffect, useRef } from "react";
import { Gift, Play, RotateCcw, Trash2, Plus, Users, Award, Check, RefreshCw, X } from "lucide-react";
import { Member } from "../types";

// Synthesized Audio engine using Web Audio API (perfectly self-contained)
const playTickSound = () => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    // Quick tick sound - starts higher, drops instantly
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);
    
    // Low gain to prevent distortion/loudness
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (error) {
    console.warn("Audio Context playback failed or blocked initially:", error);
  }
};

const playChimeSound = () => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.1, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    
    const now = ctx.currentTime;
    // C Major Triad upward arpeggio for victory celebration!
    playNote(523.25, now, 0.15); // C5
    playNote(659.25, now + 0.12, 0.15); // E5
    playNote(783.99, now + 0.24, 0.15); // G5
    playNote(1046.50, now + 0.36, 0.50); // C6
  } catch (e) {
    console.warn("Victory chime skipped.", e);
  }
};

export interface WinnerLog {
  id: string;
  name: string;
  prize: string;
  time: string;
}

interface LuckyDrawWheelProps {
  members: Member[];
  showFeedback: (text: string, isError?: boolean) => void;
  eventTitle?: string;
  onClose?: () => void;
  winnerLogs?: WinnerLog[];
  onWinnerClaimed?: (winner: WinnerLog) => void;
  onClearWinners?: () => void;
  onRemoveSingleWinner?: (id: string) => void;
}

export default function LuckyDrawWheel({ 
  members, 
  showFeedback, 
  eventTitle, 
  onClose,
  winnerLogs: propWinnerLogs,
  onWinnerClaimed,
  onClearWinners,
  onRemoveSingleWinner
}: LuckyDrawWheelProps) {
  const [prizeName, setPrizeName] = useState("T-Shirt Premium J5 EVO");
  const [namesText, setNamesText] = useState("");
  const [activeCandidates, setActiveCandidates] = useState<string[]>([]);
  const [localWinnerLogs, setLocalWinnerLogs] = useState<WinnerLog[]>([]);

  const activeWinnerLogs = propWinnerLogs !== undefined ? propWinnerLogs : localWinnerLogs;
  
  // Animation state
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(null);

  // Canvas ref & angle params
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const velocityRef = useRef<number>(0);
  
  // Load default candidates from members list when component mounts or members list loaded
  useEffect(() => {
    if (members && members.length > 0) {
      let activeNames = members.map(m => m.name);
      
      // Auto-exclude names that have already won in the active winner logs
      if (activeWinnerLogs && activeWinnerLogs.length > 0) {
        const winnerNameSet = new Set(activeWinnerLogs.map(w => w.name));
        activeNames = activeNames.filter(name => !winnerNameSet.has(name));
      }
      
      setNamesText(activeNames.join("\n"));
      setActiveCandidates(activeNames);
    } else {
      // Mock defaults if zero members
      const sampleNames = [
        "Andi Wijaya", "Budi Santoso", "Citra Lestari", "Dedi Cahyadi", 
        "Eka Saputra", "Faisal Basri", "Gita Permata", "Hendra Adi"
      ];
      setNamesText(sampleNames.join("\n"));
      setActiveCandidates(sampleNames);
    }
  }, [members, activeWinnerLogs]);

  // Sync active candidates when names text structure changes
  const handleUpdateNamesFromText = (text: string) => {
    setNamesText(text);
    const parsed = text
      .split("\n")
      .map(n => n.trim())
      .filter(n => n.length > 0);
    setActiveCandidates(parsed);
  };

  // Populate from official active registered members
  const handleImportOfRegisteredMembers = () => {
    if (!members || members.length === 0) {
      showFeedback("Belum ada member resmi yang terdaftar.", true);
      return;
    }
    const officialNames = members.map(m => m.name);
    handleUpdateNamesFromText(officialNames.join("\n"));
    showFeedback(`Berhasil mengimpor ${officialNames.length} nama member resmi ke dalam undian!`);
  };

  // Draw wheel function
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) / 2 - 15;
    const center = { x: width / 2, y: height / 2 };

    ctx.clearRect(0, 0, width, height);

    const len = activeCandidates.length;
    if (len === 0) {
      // Empty wheel state
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#f8fafc";
      ctx.fill();
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.save();
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Silakan isi nama peserta", center.x, center.y);
      ctx.restore();
      return;
    }

    const sliceAngle = (2 * Math.PI) / len;

    // Segment color list (J5 Premium theme colors)
    const colors = [
      "#005c56", // Dark Teal
      "#14b8a6", // Bright Teal
      "#0ea5e9", // Sky Blue
      "#004c47", // Deeper Teal
      "#12b3a0", // Soft Teal
      "#0284c7"  // Darker Sky
    ];

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(angle);

    for (let i = 0; i < len; i++) {
      const startA = i * sliceAngle;
      const endA = (i + 1) * sliceAngle;
      
      // Draw segment path
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startA, endA);
      ctx.closePath();

      // Segment fill color
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // Premium border lines between segments
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Segment label text
      ctx.save();
      ctx.rotate(startA + sliceAngle / 2);
      ctx.fillStyle = "#ffffff";
      
      // Adjust font size based on text count dynamically
      const fontSize = len > 35 ? "7px" : len > 20 ? "9px" : len > 10 ? "11px" : "13px";
      ctx.font = `black ${fontSize} sans-serif`;
      
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      // Cap text length if too long
      const text = activeCandidates[i];
      const cappedText = text.length > 15 ? text.slice(0, 13) + ".." : text;
      ctx.fillText(cappedText, radius - 25, 0);
      ctx.restore();
    }

    ctx.restore();

    // 2. Draw outer chrome/neon ring border
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#005c56";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Neon bright cyan halo
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(20, 184, 166, 0.4)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Draw dot bulb indicators around the rim of the wheel
    const bulbCount = Math.max(12, len * 2);
    for (let i = 0; i < bulbCount; i++) {
      const bulbAngle = (i * 2 * Math.PI) / bulbCount;
      const bulbX = center.x + (radius - 4) * Math.cos(bulbAngle);
      const bulbY = center.y + (radius - 4) * Math.sin(bulbAngle);

      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 3, 0, 2 * Math.PI);
      const activeBulb = Math.floor(angle * 12) % 2 === 0;
      ctx.fillStyle = i % 2 === (activeBulb ? 0 : 1) ? "#f59e0b" : "#ffffff";
      ctx.fill();
    }

    // 4. Center premium hub
    ctx.beginPath();
    ctx.arc(center.x, center.y, 24, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 8;
    ctx.strokeStyle = "#005c56";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Draw little inner shiny element
    ctx.beginPath();
    ctx.arc(center.x, center.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#005c56";
    ctx.fill();
  };

  // Redraw the wheel whenever candidates list is updated
  useEffect(() => {
    drawWheel(angleRef.current);
  }, [activeCandidates]);

  // Start spinning engine
  const handleStartSpin = () => {
    if (activeCandidates.length === 0) {
      showFeedback("Mohon isi daftar peserta atau edit teks name sebelum memutar wheel!", true);
      return;
    }
    if (!prizeName.trim()) {
      showFeedback("Lengkapi kolom Nama Hadiah terlebih dahulu sebelum memulai undian!", true);
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    // Huge random speed impulse (e.g. 0.35 to 0.45 px per step)
    velocityRef.current = 0.35 + Math.random() * 0.15;
    
    let lastSegmentIdx = -1;
    const sliceAngle = (2 * Math.PI) / activeCandidates.length;

    const animate = () => {
      angleRef.current += velocityRef.current;
      // Gradual air friction deceleration
      velocityRef.current *= 0.985;

      drawWheel(angleRef.current);

      // Play high-quality physical tick sound when crossing segment boundaries
      const currentSegmentIdx = Math.floor(angleRef.current / sliceAngle);
      if (currentSegmentIdx !== lastSegmentIdx) {
        lastSegmentIdx = currentSegmentIdx;
        playTickSound();
      }

      if (velocityRef.current > 0.001) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        // Spin finished gracefully
        setIsSpinning(false);
        velocityRef.current = 0;

        // Calculate winning index under the top arrow pointer (12 o'clock, which is -Math.PI / 2 radians)
        const finalAngle = angleRef.current % (2 * Math.PI);
        const rawIndex = Math.floor((3 * Math.PI / 2 - finalAngle + 2 * Math.PI) / sliceAngle) % activeCandidates.length;
        const winnerIndex = (rawIndex + activeCandidates.length) % activeCandidates.length;
        const chosenWinner = activeCandidates[winnerIndex];

        if (chosenWinner) {
          setCurrentWinner(chosenWinner);
          setShowWinnerModal(true);
          playChimeSound(); // 🏆 Play celebration sound!
        }
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
  };

  // Instantly cancel/abort spinning wheel
  const handleCancelSpin = () => {
    if (!isSpinning) return;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setIsSpinning(false);
    velocityRef.current = 0;
    showFeedback("Pemutaran undian berhadiah berhasil dibatalkan.", true);
  };

  // Claim Award: register the winner, save history and subtract their name from active pool as requested
  const handleClaimAwardAndRemove = () => {
    if (!currentWinner) return;

    // Remove the winner from lists
    const updatedCandidates = activeCandidates.filter(c => c !== currentWinner);
    setActiveCandidates(updatedCandidates);
    setNamesText(updatedCandidates.join("\n"));

    // Add log
    const newLog: WinnerLog = {
      id: Math.random().toString(36).substr(2, 9),
      name: currentWinner,
      prize: prizeName,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };

    if (onWinnerClaimed) {
      onWinnerClaimed(newLog);
    } else {
      setLocalWinnerLogs([newLog, ...localWinnerLogs]);
    }

    setShowWinnerModal(false);
    setCurrentWinner(null);
    showFeedback(`Selamat! ${currentWinner} memenangkan ${prizeName}. Peserta dikeluarkan dari putaran berikutnya.`);
  };

  // Resets the list and database sync
  const handleResetWheel = () => {
    if (onClearWinners) {
      onClearWinners();
    } else {
      setLocalWinnerLogs([]);
    }
    
    if (members && members.length > 0) {
      const activeNames = members.map(m => m.name);
      setNamesText(activeNames.join("\n"));
      setActiveCandidates(activeNames);
    } else {
      setActiveCandidates([]);
      setNamesText("");
    }
    showFeedback("Wheel of Names berhasil di-reset ke data awal.");
  };

  const handleRedrawImmediately = () => {
    setShowWinnerModal(false);
    setCurrentWinner(null);
    showFeedback("Hasil undian dibatalkan. Memutar ulang roda...");
    setTimeout(() => {
      handleStartSpin();
    }, 200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative text-left">
      {/* 🔮 Cosmic Premium Title Block - Styled to align with the premium light theme */}
      <div className="bg-zinc-50 border border-zinc-200/80 p-7 rounded-3xl text-left text-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden pr-12">
        <div id="wheel-sparkle-bg" className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-500/5 via-transparent to-transparent pointer-events-none"></div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 p-2 rounded-full transition z-30 cursor-pointer"
            title="Tutup Undian"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-teal-50 p-1.5 rounded-xl text-teal-700 shadow-3xs">
              <Gift className="w-5 h-5 text-teal-700" />
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-teal-700">
              OFFICIAL EVENT GIVEAWAY ENGINE
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans text-zinc-950">
            {eventTitle ? `Undian: ${eventTitle}` : "Random Wheel of Names"}
          </h2>
          <p className="text-xs text-zinc-500 font-medium max-w-xl leading-relaxed font-sans">
            {eventTitle 
              ? `Memutar nama peserta yang terdaftar pada kegiatan "${eventTitle}" untuk membagikan doorprize / hadiah secara adil.`
              : "Gunakan roda undian cerdas untuk membagikan doorprize / hadiah secara adil kepada member terdaftar J5 EVO Indonesia yang telah bergabung."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10 shrink-0">
          {!eventTitle && (
            <button
              type="button"
              onClick={handleImportOfRegisteredMembers}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition border border-zinc-250 cursor-pointer hover:scale-[1.02] shadow-3xs"
            >
              <Users className="w-4 h-4 text-teal-700" />
              Impor Member Resmi
            </button>
          )}
          
          <button
            type="button"
            onClick={handleResetWheel}
            className="px-4 py-2.5 bg-[#005c56] hover:bg-[#004c47] text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition hover:shadow-md cursor-pointer border-transparent shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Peserta Awal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        {/* Core Settings Form Left Column */}
        <div className="lg:col-span-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-200/80 space-y-6">
          <div className="space-y-1 pb-4 border-b border-zinc-200">
            <h3 className="text-base font-extrabold text-zinc-950">1. Atur Parameter Hadiah</h3>
            <p className="text-[11px] text-zinc-500">Tuliskan nama hadiah sebelum memutar roda undian.</p>
          </div>

          {/* Prize Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 block">Nama Hadiah Undian</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-450">
                <Award className="w-4 h-4 text-rose-550" />
              </span>
              <input
                type="text"
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                disabled={isSpinning}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-250 rounded-xl text-sm font-bold text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-teal-500/30 focus:border-teal-600 disabled:opacity-60 transition shadow-3xs"
                placeholder="Contoh: Jaket Official J5 EVO"
              />
            </div>
          </div>

          <div className="space-y-1 pt-4 border-t border-zinc-200 pb-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-teal-750 uppercase tracking-wider">
                Daftar Roda Nama ({activeCandidates.length} nama)
              </h3>
              <span className="text-[10px] text-zinc-400">Satu nama per baris</span>
            </div>
          </div>

          {/* Candidates Name text-area editing input */}
          <div className="space-y-2">
            <textarea
              value={namesText}
              onChange={(e) => handleUpdateNamesFromText(e.target.value)}
              disabled={isSpinning}
              rows={8}
              className="w-full p-3.5 bg-white font-mono text-xs text-zinc-805 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500/30 focus:border-teal-600 disabled:opacity-65 resize-y transition leading-relaxed shadow-3xs"
              placeholder="Ketik/Paste nama di sini, pisahkan dengan baris baru (ENTER)..."
            />
          </div>

          <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
            <p className="text-[10px] text-teal-800 leading-normal font-medium">
              💡 <strong>Tips Event:</strong> Anda bisa menambahkan tamu atau peserta non-member eksternal secara langsung ke dalam kolom teks di atas.
            </p>
          </div>
        </div>

        {/* Dynamic Canvas Spin Wheel Middle Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-200/80 flex flex-col items-center justify-center relative min-h-[460px] shadow-3xs">
          
          {/* Wheel Selector Pointer At the Top */}
          <div className="absolute top-4 z-20 flex flex-col items-center">
            {/* Triangular pointer */}
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-rose-600 drop-shadow-[0_4px_6px_rgba(225,29,72,0.3)]"></div>
          </div>

          {/* Interactive HTML5 Canvas Container */}
          <div className="relative my-4 aspect-square max-w-full flex items-center justify-center select-none">
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="max-w-[280px] sm:max-w-[340px] md:max-w-[380px] h-auto rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.06)] bg-transparent border border-zinc-150"
            />
          </div>

          {/* Controls button below the wheel */}
          <div className="w-full flex gap-3 pt-6 max-w-sm">
            {!isSpinning ? (
              <button
                type="button"
                onClick={handleStartSpin}
                disabled={activeCandidates.length === 0}
                className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-100 disabled:text-zinc-400 font-extrabold text-sm text-zinc-950 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <Play className="w-4 h-4 fill-zinc-950 text-zinc-950" />
                Putar Roda Undian!
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelSpin}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 font-extrabold text-sm text-white rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <div className="w-2.5 h-2.5 bg-white animate-ping rounded-full"></div>
                Batalkan Putaran
              </button>
            )}
          </div>
        </div>

        {/* Real-time Event Winners Log Right Column */}
        <div className="lg:col-span-3 bg-zinc-50 p-6 rounded-2xl border border-zinc-200/80 space-y-5 min-h-[460px] flex flex-col">
          <div className="space-y-1 pb-3 border-b border-zinc-205 flex-shrink-0">
            <h3 className="text-sm font-extrabold text-zinc-900">Daftar Pemenang Hadiah</h3>
            <p className="text-[10px] text-zinc-500">Histori perolehan doorprize di sesi ini.</p>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
            {activeWinnerLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-2.5">
                <Gift className="w-9 h-9 text-zinc-350 stroke-[1.5]" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-500">Belum Ada Pemenang</p>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Silakan mulai undian di sebelah kiri untuk menentukan pemenang hadiah pertama.
                  </p>
                </div>
              </div>
            ) : (
              activeWinnerLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-white border border-zinc-200 rounded-xl relative group overflow-hidden text-left shadow-3xs"
                >
                  {/* Small gold left tag */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-650"></div>

                  <div className="pl-1.5 space-y-1">
                    <div className="flex justify-between items-center bg-white">
                      <span className="text-xs font-black text-zinc-800 leading-none">{log.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-zinc-400 font-mono">{log.time}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Reset hasil menang untuk ${log.name}? Nama ini akan dimasukkan kembali ke roda undian.`)) {
                              if (onRemoveSingleWinner) {
                                onRemoveSingleWinner(log.id);
                              } else {
                                setLocalWinnerLogs(prev => prev.filter(w => w.id !== log.id));
                              }
                              showFeedback(`Pemenang ${log.name} berhasil di-reset.`);
                            }
                          }}
                          className="text-zinc-400 hover:text-red-500 p-0.5 rounded transition cursor-pointer"
                          title="Hapus pemenang & kembalikan ke roda"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-[11px] text-[#005c56] font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-rose-500" />
                      <span>{log.prize}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reset all logs action */}
          {activeWinnerLogs.length > 0 && (
            <button
              onClick={() => {
                if (onClearWinners) {
                  onClearWinners();
                } else {
                  setLocalWinnerLogs([]);
                }
                showFeedback("Seluruh histori pemenang undian sukses dibersihkan.");
              }}
              className="w-full py-2 bg-zinc-100 hover:bg-zinc-205 text-zinc-650 border border-zinc-200 font-bold text-[10px] rounded-lg transition uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
              Reset Histori Pemenang
            </button>
          )}
        </div>
      </div>

      {/* 🎉 GLOWING NEON WINNER CELEBRATION POPUP MODAL */}
      {showWinnerModal && currentWinner && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white border border-zinc-205 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center space-y-6 overflow-hidden transform duration-300 animate-scaleIn">
            
            {/* Glowing gold background neon stripes */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_1px_5px_#f59e0b]"></div>

            <div className="space-y-2">
              <span className="text-[9px] font-mono tracking-widest text-teal-700 uppercase font-bold block bg-teal-50 px-2.5 py-1 rounded-full max-w-max mx-auto border border-teal-100">
                Pemenang Undian Resmi!
              </span>
              <h3 className="text-xl font-black text-zinc-900 font-sans tracking-tight">🎉 Selamat Kepada Pemenang!</h3>
            </div>

            {/* Winner Plate Name Display */}
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-inner space-y-3 select-none">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto border border-amber-200/55">
                <Gift className="w-6 h-6 animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider font-medium">Berdasarkan Undian Roda:</p>
                <h4 className="text-2xl font-black text-teal-800 font-sans tracking-tight leading-none">
                  {currentWinner}
                </h4>
              </div>

              <div className="pt-2 border-t border-zinc-200/85 flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs uppercase bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-150 max-w-max mx-auto">
                <Award className="w-4 h-4 text-rose-500" />
                <span>Memenangkan: <strong className="text-zinc-800 text-xs">{prizeName}</strong></span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 font-medium">
              Menyetujui &quot;Klaim &amp; Lanjutkan&quot; akan menambahkan nama pemenang ke histori log giveaway, dan mengeluarkan nama ini secara otomatis dari daftar putar berikutnya agar tidak terjadi kemenangan ganda.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleClaimAwardAndRemove}
                className="w-full py-3 bg-[#005c56] hover:bg-[#004c47] text-white font-black text-xs rounded-xl transition cursor-pointer shadow-[0_4px_12px_rgba(0,92,86,0.15)] hover:scale-[1.01] flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-white stroke-[3]" />
                Klaim &amp; Lanjutkan Undian
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRedrawImmediately}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] uppercase font-mono tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                  Batal &amp; Putar Ulang
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowWinnerModal(false);
                    setCurrentWinner(null);
                    showFeedback("Sesi perayaan undian ditutup tanpa klaim.", true);
                  }}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-zinc-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Tutup Sementara
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
