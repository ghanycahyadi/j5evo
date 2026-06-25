import React, { useState, useEffect, useRef } from "react";
import { 
  Tv, 
  Volume2, 
  VolumeX, 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Maximize, 
  Minimize, 
  Search, 
  Car, 
  Bell, 
  QrCode,
  Smartphone,
  ChevronLeft
} from "lucide-react";
import { CommunityEvent } from "../types";
import J5EvoLogo from "./J5EvoLogo";

interface ProjectorBoardProps {
  event: CommunityEvent;
  onClose: () => void;
}

export default function ProjectorBoard({ event, onClose }: ProjectorBoardProps) {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioNeedsInteraction, setAudioNeedsInteraction] = useState(true);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Welcome Overlay Queue
  const [currentWelcome, setCurrentWelcome] = useState<any | null>(null);
  const welcomeQueueRef = useRef<any[]>([]);
  const isWelcomingRef = useRef(false);
  const knownAttendeeIdsRef = useRef<Set<string>>(new Set());

  // Initialize AudioContext
  const initAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        setAudioContext(ctx);
      }
      setAudioNeedsInteraction(false);
      // Play a quick test sound
      playChimeSound();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
      setAudioNeedsInteraction(false);
    }
  };

  // Synthesize beautiful bell sound using Web Audio API
  const playChimeSound = () => {
    if (isMuted) return;
    try {
      const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);
      
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // High-pitched crystal bell sound
      const now = ctx.currentTime;
      
      // Node 1: Fundamental
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.4);
      
      // Node 2: Harmonious fifth
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.51, now); // E6

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 1.3);

      osc2.start(now);
      osc2.stop(now + 0.9);
    } catch (err) {
      console.error("Failed to synthesize chime sound", err);
    }
  };

  // Speak the attendee name aloud
  const speakGreeting = (name: string) => {
    if (isMuted) return;
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // stop current speech
        const text = `Selamat datang, Kak ${name}!`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "id-ID"; // Indonesian voice
        utterance.rate = 0.95; // slightly slower for clarity
        utterance.pitch = 1.0;
        
        // Try to find an Indonesian voice specifically
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(voice => voice.lang.includes("id") || voice.lang.includes("ID"));
        if (idVoice) {
          utterance.voice = idVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen failed:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle Fullscreen state change (e.g. if user presses Esc)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Sync Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendees list and detect new arrivals
  const fetchAttendees = async (isInitial = false) => {
    try {
      const res = await fetch("/api/registrations");
      if (!res.ok) return;
      const data = await res.json();
      
      // Filter registrations for this event with status "Attended"
      const eventAttendees = data
        .filter((reg: any) => reg.eventId === event.id && reg.status === "Attended")
        .sort((a: any, b: any) => {
          // Newest first
          const dateA = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
          const dateB = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
          return dateB - dateA;
        });

      if (isInitial) {
        // Just populate the initial set without triggering greetings
        const initialSet = new Set<string>();
        eventAttendees.forEach((att: any) => {
          initialSet.add(att.id);
        });
        knownAttendeeIdsRef.current = initialSet;
        setAttendees(eventAttendees);
      } else {
        // Detect new ones!
        const newlyArrived: any[] = [];
        eventAttendees.forEach((att: any) => {
          if (!knownAttendeeIdsRef.current.has(att.id)) {
            newlyArrived.push(att);
            knownAttendeeIdsRef.current.add(att.id);
          }
        });

        // Add newly arrived to queue (newest should be processed)
        if (newlyArrived.length > 0) {
          // Sort reverse so oldest of the new ones triggers first
          newlyArrived.reverse().forEach(att => {
            welcomeQueueRef.current.push(att);
          });
          processWelcomeQueue();
        }

        setAttendees(eventAttendees);
      }
    } catch (err) {
      console.error("Error fetching attendees for projector screen:", err);
    } finally {
      setLoading(false);
    }
  };

  // Process the welcome overlay queue sequentially
  const processWelcomeQueue = () => {
    if (isWelcomingRef.current || welcomeQueueRef.current.length === 0) return;

    isWelcomingRef.current = true;
    const nextAttendee = welcomeQueueRef.current.shift();
    setCurrentWelcome(nextAttendee);

    // Play welcome sound and speech Synthesis
    playChimeSound();
    // Use a tiny timeout to let the sound start, then speak
    setTimeout(() => {
      speakGreeting(nextAttendee.memberName);
    }, 150);

    // Display welcome banner for 5 seconds, then dismiss and check queue again
    setTimeout(() => {
      setCurrentWelcome(null);
      isWelcomingRef.current = false;
      // Wait another half second for fade-out, then process next
      setTimeout(() => {
        processWelcomeQueue();
      }, 500);
    }, 5500);
  };

  // Poll attendees every 3 seconds
  useEffect(() => {
    // Initial fetch
    fetchAttendees(true);

    const interval = setInterval(() => {
      fetchAttendees(false);
    }, 3000);

    return () => {
      clearInterval(interval);
      window.speechSynthesis.cancel();
    };
  }, [event.id]);

  const totalRegistered = attendees.length;
  const attendanceUrl = `${window.location.origin}/beranda?absen_event=${event.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(attendanceUrl)}`;

  // Indonesian Day/Date Formatter
  const formattedDate = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Generates simple falling CSS confetti particles
  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    if (currentWelcome) {
      // Generate some random falling particles
      const newParticles = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // percentage
        delay: Math.random() * 3, // seconds
        duration: 2.5 + Math.random() * 2.5, // seconds
        size: 8 + Math.random() * 20, // px
        angle: Math.random() * 360,
        color: [
          "#2dd4bf", // teal-400
          "#14b8a6", // teal-500
          "#06b6d4", // cyan-500
          "#22c55e", // green-500
          "#eab308", // yellow-500
          "#f43f5e", // rose-500
          "#a855f7"  // purple-500
        ][Math.floor(Math.random() * 7)],
        emoji: ["🎉", "✨", "⚡", "🚗", "🌟", "🔥"][Math.floor(Math.random() * 6)]
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [currentWelcome]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[500] bg-zinc-950 text-white flex flex-col select-none overflow-hidden font-sans"
    >
      {/* 🔔 FLOATING AUDIO ENABLER HERO BAR */}
      {audioNeedsInteraction && (
        <div className="absolute inset-0 bg-zinc-950/95 z-[600] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl text-center">
            <div className="w-20 h-20 bg-teal-950/60 border border-teal-500/30 text-teal-400 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Tv className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black font-sans uppercase tracking-wide text-zinc-100">Layar Sambutan J5 EVO</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Tekan tombol di bawah untuk menyalakan audio sistem. Ini penting agar ucapan selamat datang suara robot (Text-to-Speech) &amp; bel kedatangan berbunyi otomatis di pengeras suara projector.
              </p>
            </div>
            <button
              onClick={initAudio}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-[#005c56] hover:from-teal-400 hover:to-teal-600 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              MULAI MONITORING (BUNYI AKTIF)
            </button>
          </div>
        </div>
      )}

      {/* 🏆 FULLSCREEN CONGRATULATIONS OVERLAY (WELCOME SHOW) */}
      {currentWelcome && (
        <div className="absolute inset-0 z-[550] bg-zinc-950/98 flex flex-col items-center justify-center p-6 text-center overflow-hidden animate-fadeIn">
          {/* Confetti container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute text-xl select-none"
                style={{
                  left: `${p.left}%`,
                  top: `-10%`,
                  color: p.color,
                  fontSize: `${p.size}px`,
                  transform: `rotate(${p.angle}deg)`,
                  animation: `fallAndSpin ${p.duration}s linear ${p.delay}s infinite`,
                }}
              >
                {p.emoji}
              </div>
            ))}
          </div>

          <style>{`
            @keyframes fallAndSpin {
              0% {
                top: -10%;
                transform: translateY(0) rotate(0deg);
                opacity: 1;
              }
              100% {
                top: 110%;
                transform: translateY(0) rotate(360deg);
                opacity: 0.2;
              }
            }
          `}</style>

          {/* Core Congrats Box */}
          <div className="max-w-2xl w-full bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-teal-500/40 rounded-[36px] p-10 md:p-14 space-y-8 shadow-2xl relative animate-scaleIn duration-500">
            {/* Outer golden glow aura */}
            <div className="absolute inset-0 rounded-[36px] bg-teal-500/5 blur-3xl -z-10 animate-pulse" />

            <div className="flex flex-col items-center justify-center space-y-3">
              <J5EvoLogo className="w-20 h-20 animate-pulse filter drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]" color="#2dd4bf" bgFill="#18181b" />
              <div className="inline-flex items-center gap-2 bg-teal-950/80 border border-teal-500/30 px-5 py-2 rounded-full text-teal-400 text-xs font-mono font-black tracking-widest uppercase animate-bounce">
                <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" /> MEMBER BARU DATANG
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-zinc-400 font-sans text-lg md:text-xl font-bold tracking-wide uppercase">Selamat Datang di Lokasi Acara</h2>
              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-teal-200 font-sans uppercase tracking-tight break-words leading-tight filter drop-shadow-md">
                {currentWelcome.memberName}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl px-6 py-3.5 text-center flex-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-black block">No Polisi</span>
                <span className="text-xl md:text-2xl font-black text-teal-400 font-mono tracking-wider mt-0.5 block uppercase">
                  {currentWelcome.memberPlate}
                </span>
              </div>

              {currentWelcome.pax && currentWelcome.pax > 1 && (
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl px-6 py-3.5 text-center flex-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-black block">Jumlah Pax</span>
                  <span className="text-xl md:text-2xl font-black text-yellow-400 font-mono mt-0.5 block">
                    {currentWelcome.pax} PAX
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm font-mono text-teal-400/80 tracking-wide animate-pulse">
              ✓ Presensi Anda telah diverifikasi otomatis oleh Sistem J5 EVO
            </p>
          </div>
        </div>
      )}

      {/* 🚀 TOP STATUS HEADER BAR */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-xl text-zinc-300 hover:text-white transition cursor-pointer"
            title="Kembali ke Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <J5EvoLogo className="w-10 h-10 shrink-0 filter drop-shadow-[0_0_8px_rgba(20,184,166,0.2)]" color="#14b8a6" bgFill="#18181b" />
          
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <h2 className="text-sm font-mono font-black text-teal-400 uppercase tracking-widest leading-none">ABSENSI MEMBER J5 EVO COMMUNITY</h2>
            </div>
            <h1 className="text-base font-sans font-black text-white truncate max-w-[320px] sm:max-w-md md:max-w-xl mt-1 leading-none">{event.title}</h1>
          </div>
        </div>

        {/* Dynamic clocks & settings controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Live digital time ticker */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-right font-mono flex items-center gap-3">
            <Clock className="w-4 h-4 text-teal-400 animate-pulse" />
            <div className="text-xs leading-none">
              <div className="text-zinc-100 font-black text-sm tracking-widest">
                {currentTime.toLocaleTimeString("id-ID", { hour12: false })}
              </div>
              <div className="text-[9px] text-zinc-500 font-bold mt-0.5">{formattedDate}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle button */}
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (audioContext && audioContext.state === "suspended") {
                  audioContext.resume();
                }
              }}
              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isMuted 
                  ? "bg-red-950/60 border-red-800 text-red-400 hover:bg-red-900" 
                  : "bg-teal-950/60 border-teal-800 text-teal-400 hover:bg-teal-900"
              }`}
              title={isMuted ? "Aktifkan Bunyi Kedatangan" : "Bisukan Bunyi"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 stroke-[2.5]" /> : <Volume2 className="w-4 h-4 stroke-[2.5]" />}
            </button>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition cursor-pointer flex items-center justify-center"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4 stroke-[2.5]" /> : <Maximize className="w-4 h-4 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 MAIN PROJECTOR DISPLAY GRID */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* LEFT COLUMN: QR Code Scanner Stage, Stats Counter & Information (Size 5/12) */}
        <section className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-zinc-800 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          
          <div className="space-y-6">
            {/* Massive Interactive Counter Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl -z-10" />
              <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest font-black block">KEHADIRAN ANGGOTA LOKASI</span>
              
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300 font-mono tracking-tight filter drop-shadow-sm">
                  {totalRegistered}
                </span>
                <span className="text-zinc-500 font-mono text-sm font-bold">/ {event.slots} SLOT</span>
              </div>
              
              <p className="text-xs text-zinc-400 font-sans max-w-xs mx-auto leading-relaxed">
                Tercatat hadir resmi dalam sistem registrasi kegiatan pre-event J5 EVO.
              </p>
            </div>

            {/* QR Scanner Stage for screen display */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-teal-400">
                <QrCode className="w-5 h-5" />
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-200">ABSENSI MEMBER J5 EVO</h3>
              </div>

              <div className="bg-white p-4 rounded-2xl max-w-[210px] mx-auto shadow-md border border-zinc-200 animate-fadeIn relative group">
                <img 
                  src={qrCodeUrl} 
                  alt="Scan QR" 
                  className="w-full h-full object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs text-zinc-300 font-bold leading-tight">PINDAI QR DIATAS DENGAN KAMERA HP KAKAK</p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Lalu isi Plat Nomor &amp; PIN 6 Digit untuk rekam presensi mandiri Anda!
                </p>
              </div>
            </div>
          </div>

          {/* Event details block at footer of col */}
          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl flex items-center gap-4 text-left">
            <div className="w-10 h-10 bg-[#005c56]/30 border border-[#005c56]/40 rounded-xl text-teal-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="text-zinc-400 font-medium">Kegiatan J5 EVO Indonesia</div>
              <div className="text-zinc-100 font-bold mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{event.date}</span>
                <span className="text-zinc-600">|</span>
                <span>{event.location}</span>
              </div>
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Realtime attendance feed (Size 7/12) */}
        <section className="lg:col-span-7 p-6 md:p-8 flex flex-col overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400 animate-pulse" />
              <h2 className="font-sans font-extrabold text-base tracking-tight text-white uppercase">DAFTAR HADIR TERKINI ({totalRegistered})</h2>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-[10px] text-zinc-400 font-mono font-bold">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-ping" /> REALTIME
            </div>
          </div>

          {/* Table list */}
          <div className="flex-1 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-2 space-y-2">
            {attendees.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 animate-pulse">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-300">Belum Ada Presensi Tercatat</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                    Menunggu member memindai QR Code atau di-absenkan oleh Admin di meja registrasi.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-2">
                {attendees.map((reg, index) => {
                  const arrivalTime = reg.registeredAt 
                    ? new Date(reg.registeredAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) 
                    : "--:--";

                  // Highlight the most recent checkin (first item) with a subtle pulsing teal ring
                  const isNewest = index === 0;

                  return (
                    <div 
                      key={reg.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                        isNewest 
                          ? "bg-[#005c56]/20 border-teal-500 shadow-md ring-2 ring-teal-500/20 scale-[1.01] animate-pulse" 
                          : "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden text-left">
                        {/* Member index or avatar replacement icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-xs shrink-0 ${
                          isNewest 
                            ? "bg-teal-500 text-zinc-950" 
                            : "bg-zinc-800 border border-zinc-700 text-zinc-300"
                        }`}>
                          {attendees.length - index}
                        </div>

                        <div className="overflow-hidden leading-tight">
                          <div className="font-sans font-black text-white text-xs truncate uppercase tracking-tight">{reg.memberName}</div>
                          <div className="font-mono text-[9px] text-zinc-400 mt-0.5 flex items-center gap-1.5 uppercase">
                            <span className="font-black text-teal-400">{reg.memberPlate}</span>
                            <span>•</span>
                            <span className="truncate">{reg.memberPhone?.slice(0, 4)}***{reg.memberPhone?.slice(-3)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Time and check status pill */}
                      <div className="text-right shrink-0 pl-2">
                        <div className="text-[10px] font-mono font-black text-zinc-100">{arrivalTime} WIB</div>
                        <div className="inline-flex items-center gap-1 mt-1 text-[8px] font-mono font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 border border-teal-900/50 px-1.5 py-0.5 rounded">
                          {reg.pax ? `${reg.pax} PAX` : "1 PAX"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
