import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Search, 
  RefreshCw, 
  Activity, 
  ArrowUpRight, 
  ChevronRight, 
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  BadgeAlert,
  ArrowRightLeft,
  FileCode2,
  Lock,
  Unlock,
  User,
  ShieldAlert
} from "lucide-react";

interface ScreenerSignal {
  "Waktu Screen": string;
  "Waktu Candle": string;
  "Ticker": string;
  "Sektor": string;
  "Harga": number;
  "Pola": string;
  "Sinyal": string;
  "TP 1": number;
  "TP 1(%)": string;
  "TP 2": number;
  "TP 2(%)": string;
  "SL": number;
  "Risk(%)": string;
  "RR Ratio": string;
  "Momentum": string;
  "Status Akhir": string;
  "Chg(%)"?: number;
}

export default function ScreenerDashboard() {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return localStorage.getItem("screener_unlocked_session") === "true";
    } catch {
      return false;
    }
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (usernameInput.trim().toLowerCase() === "ghany" && passwordInput === "ghanyalgo15m") {
      setIsUnlocked(true);
      try {
        localStorage.setItem("screener_unlocked_session", "true");
      } catch (err) {}
    } else {
      setLoginError("Kombinasi Username & Password tidak cocok!");
    }
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    try {
      localStorage.removeItem("screener_unlocked_session");
    } catch (err) {}
    setUsernameInput("");
    setPasswordInput("");
  };

  const [data, setData] = useState<ScreenerSignal[]>([]);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [signalFilter, setSignalFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [showGuide, setShowGuide] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<"all" | "date">("all");

  const fetchScreenerData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/screener");
      if (!res.ok) throw new Error("Gagal mengambil data screener.");
      const result = await res.json();
      if (Array.isArray(result)) {
        // Sort by BUY (VALIDATED) first, then running, then alphabetically
        const sorted = [...result].sort((a, b) => {
          if (a.Sinyal === "BUY (VALIDATED)" && b.Sinyal !== "BUY (VALIDATED)") return -1;
          if (a.Sinyal !== "BUY (VALIDATED)" && b.Sinyal === "BUY (VALIDATED)") return 1;
          return a.Ticker.localeCompare(b.Ticker);
        });
        setData(sorted);

        // Auto-select the latest date from sorted
        const dates = Array.from(
          new Set(sorted.map(item => item["Waktu Candle"] || item["Waktu Screen"]?.split(" ")[0]).filter(Boolean))
        ).sort().reverse();
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      } else {
        setData([]);
      }
      setLastRefreshed(new Date().toLocaleTimeString("id-ID"));
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Gagal memuat database screener. Pastikan file 'db_screener.json' sudah terisi di server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchScreenerData();
    }
  }, [isUnlocked]);

  // Extract unique dates sorted newest to oldest
  const uniqueDates: string[] = Array.from(
    new Set<string>(
      data
        .map(item => item["Waktu Candle"] || item["Waktu Screen"]?.split(" ")[0])
        .filter((val): val is string => !!val)
    )
  ).sort().reverse();

  // Get unique sectors and signals for filters
  const uniqueSectors = Array.from(new Set(data.map(item => item.Sektor).filter(Boolean)));
  const uniqueSignals = Array.from(new Set(data.map(item => item.Sinyal).filter(Boolean)));

  // Filter by selected date first
  const dateFilteredData = data.filter(item => {
    const itemDate = item["Waktu Candle"] || item["Waktu Screen"]?.split(" ")[0];
    return selectedDate === "" || itemDate === selectedDate;
  });

  // Filter criteria on top of date filtered data
  const filteredData = dateFilteredData.filter(item => {
    const matchesSearch = item.Ticker.toLowerCase().includes(search.toLowerCase()) ||
                          item.Sektor.toLowerCase().includes(search.toLowerCase());
    const matchesSector = sectorFilter === "" || item.Sektor === sectorFilter;
    const matchesSignal = signalFilter === "" || item.Sinyal === signalFilter;
    return matchesSearch && matchesSector && matchesSignal;
  });

  // Count highlights based on dateFilteredData
  const totalScanned = dateFilteredData.length;
  const buyValidatedCount = dateFilteredData.filter(item => item.Sinyal === "BUY (VALIDATED)").length;
  const waitingValidationCount = dateFilteredData.filter(item => item.Sinyal === "Tunggu Validasi").length;
  const highRiskCount = dateFilteredData.filter(item => item.Sinyal === "RISIKO TINGGI").length;

  // Premium SMC Performance Analysis Calculations
  const winsAll = data.filter(item => {
    const status = (item["Status Akhir"] || "").toUpperCase();
    return status.includes("HIT TP") || status.includes("CUAN") || status.includes("PROFIT");
  }).length;
  
  const lossesAll = data.filter(item => {
    const status = (item["Status Akhir"] || "").toUpperCase();
    return status.includes("HIT SL") || status.includes("RUGI") || status.includes("LOST");
  }).length;
  
  const runningAll = data.filter(item => {
    const status = (item["Status Akhir"] || "").toUpperCase();
    return status.includes("RUNNING") || status === "" || !item["Status Akhir"];
  }).length;
  
  const closedAll = winsAll + lossesAll;
  const winRateAll = closedAll > 0 ? Math.round((winsAll / closedAll) * 100) : 0;

  // Selected date statistics
  const winsSelected = dateFilteredData.filter(item => {
    const status = (item["Status Akhir"] || "").toUpperCase();
    return status.includes("HIT TP") || status.includes("CUAN") || status.includes("PROFIT");
  }).length;
  
  const lossesSelected = dateFilteredData.filter(item => {
    const status = (item["Status Akhir"] || "").toUpperCase();
    return status.includes("HIT SL") || status.includes("RUGI") || status.includes("LOST");
  }).length;
  
  const runningSelected = dateFilteredData.filter(item => {
    const status = (item["Status Akhir"] || "").toUpperCase();
    return status.includes("RUNNING") || status === "" || !item["Status Akhir"];
  }).length;
  
  const closedSelected = winsSelected + lossesSelected;
  const winRateSelected = closedSelected > 0 ? Math.round((winsSelected / closedSelected) * 100) : 0;

  const activeWins = statsPeriod === "all" ? winsAll : winsSelected;
  const activeLosses = statsPeriod === "all" ? lossesAll : lossesSelected;
  const activeRunning = statsPeriod === "all" ? runningAll : runningSelected;
  const activeClosed = statsPeriod === "all" ? closedAll : closedSelected;
  const activeWinRate = statsPeriod === "all" ? winRateAll : winRateSelected;


  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case "BUY (VALIDATED)":
        return (
          <span className="px-2.5 py-1 text-xs font-extrabold uppercase rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit shadow-3xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            BUY
          </span>
        );
      case "Tunggu Validasi":
        return (
          <span className="px-2.5 py-1 text-xs font-extrabold uppercase rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit shadow-3xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            WAITING
          </span>
        );
      case "RISIKO TINGGI":
        return (
          <span className="px-2.5 py-1 text-xs font-extrabold uppercase rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit shadow-3xs">
            <BadgeAlert className="w-3.5 h-3.5 text-rose-600" />
            HIGH RISK
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center gap-1 w-fit">
            {signal}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    if (status.includes("HIT TP")) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
          {status}
        </span>
      );
    }
    if (status.includes("HIT SL")) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded bg-rose-100 text-rose-800 uppercase tracking-wider">
          {status}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-mono font-extrabold rounded bg-teal-50 text-teal-750 border border-teal-200 uppercase tracking-wider animate-pulse">
        {status}
      </span>
    );
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-850 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-left text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
          
          <div className="space-y-6 relative z-10">
            <div className="space-y-2 text-center">
              <div className="mx-auto w-12 h-12 bg-teal-500/10 rounded-2xl border border-teal-500/20 flex items-center justify-center shadow-inner">
                <Lock className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-4 uppercase">
                SMC PRO ACCESS
              </h2>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Sistem tertutup terenkripsi. Silakan masukkan kredensial khusus Anda untuk membuka kunci SMC Screener.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider text-zinc-405 uppercase font-bold">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Username khusus Anda..."
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 text-sm font-bold text-white placeholder-zinc-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500/30 focus:border-teal-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider text-zinc-405 uppercase font-bold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password..."
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 text-sm font-bold text-white placeholder-zinc-650 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500/30 focus:border-teal-500/50"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-405 flex items-start gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-zinc-950 font-black text-xs rounded-xl transition-all duration-300 shadow-md hover:shadow-teal-500/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Unlock className="w-4 h-4" />
                Unlock Terminal
              </button>
            </form>

            <div className="pt-2 border-t border-zinc-800 text-center">
              <span className="text-[9px] text-zinc-500 font-mono tracking-wide">
                Hanya untuk pemilik sistem utama.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8 text-left">
      {/* Dynamic Header Frame aligned with Premium Web Template */}
      <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-500/5 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-teal-50 p-1.5 rounded-xl border border-teal-100 shadow-3xs">
              <TrendingUp className="w-5 h-5 text-teal-700" />
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-teal-700">
              SMC ALGO AUTOMATED SCREENER
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 font-sans">
            SMC Market Monitoring
          </h1>
          <p className="text-sm text-zinc-650 max-w-2xl font-medium">
            Sistem penyaring harga saham otomatis berbasis algoritma Smart Money Concept (SMC) &amp; Sweep Liquidation. Membantu mendeteksi momentum sinyal beli valid secara berkala terintegrasi data yfinance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-xl text-zinc-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
          >
            <HelpCircle className="w-4 h-4 text-teal-650" />
            Panduan Crontab
          </button>
          <button
            type="button"
            onClick={fetchScreenerData}
            disabled={loading}
            className="px-5 py-2.5 bg-[#005c56] hover:bg-[#004c47] text-white font-black text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
          >
            <Lock className="w-4 h-4 text-rose-600" />
            Lock Screener
          </button>
        </div>
      </div>

      {/* Debian server execution hint component */}
      {showGuide && (
        <div className="bg-teal-50/50 border border-teal-200/50 rounded-2xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-teal-700" />
            <h3 className="text-sm font-extrabold text-teal-900 uppercase tracking-wide">
              Panduan Integrasi Script Python di Debian Server Anda
            </h3>
          </div>
          <p className="text-xs text-teal-950 leading-relaxed max-w-4xl font-medium">
            Untuk menjalankan script <code className="bg-teal-100/60 px-1 py-0.5 rounded text-teal-900 font-mono">screen/screener.py</code> secara berkala setiap 15 menit dan menyimpannya langsung ke database JSON ini, Anda bisa mengunggah script ke folder website di VPS Debian, lalu jalankan crontab berikut:
          </p>
          <div className="p-4 bg-zinc-950 text-zinc-150 font-mono text-xs rounded-xl space-y-2 select-all overflow-x-auto shadow-inner">
            <p className="text-zinc-500"># Jalankan editor crontab dengan perintah: crontab -e</p>
            <p>*/15 * * * * cd /opt/j5-evo-community &amp;&amp; python3 screen/screener.py &gt;&gt; screen/screener.log 2&amp;1</p>
          </div>
          <p className="text-xs text-zinc-550 italic">
            * Catatan: Pastikan paket <code className="font-mono">pandas</code>, <code className="font-mono">yfinance</code>, <code className="font-mono">tqdm</code>, dan <code className="font-mono">tabulate</code> sudah terinstall via pip.
          </p>
        </div>
      )}

      {/* Premium SMC Performance Analyzer Panel */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white rounded-3xl p-6 md:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        {/* Background ambient radial light */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Column 1: Title, toggle switch, and description */}
          <div className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider rounded bg-teal-500/20 text-teal-350 border border-teal-500/30">
                  Live Stats Engine
                </span>
                <span className="text-zinc-500 text-xs font-mono">• Terkoneksi ke db_screener.json</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
                Analisis Winrate &amp; Performa SMC
              </h2>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Menghitung winrate, rasio profitabilitas, serta melacak status akumulasi posisi (laba vs rugi) secara real-time dari data transaksi yang Anda perbarui.
              </p>
            </div>

            {/* Toggle pill buttons */}
            <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => setStatsPeriod("all")}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  statsPeriod === "all"
                    ? "bg-teal-500 text-zinc-950 shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Semua Riwayat Saham ({data.length})
              </button>
              <button
                type="button"
                onClick={() => setStatsPeriod("date")}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  statsPeriod === "date"
                    ? "bg-teal-500 text-zinc-950 shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Tanggal Terpilih ({dateFilteredData.length})
              </button>
            </div>
          </div>

          {/* Column 2: Dashboard Visual Progress Circle / Ring */}
          <div className="flex flex-wrap items-center gap-8 md:gap-12">
            <div className="flex items-center gap-4.5">
              <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                {/* SVG circular progress indicator */}
                <svg className="w-full h-full transform -rotate-95">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    className="stroke-zinc-850"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    className="stroke-teal-400 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * activeWinRate) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl md:text-2xl font-black text-white">{activeWinRate}%</span>
                  <span className="text-[8px] font-mono tracking-wider text-zinc-500 uppercase font-black">WIN RATE</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-black mb-1">Rasio Win/Loss</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-teal-450">{activeWins}</span>
                  <span className="text-xs text-zinc-500">Won</span>
                  <span className="text-zinc-650">/</span>
                  <span className="text-xl font-extrabold text-rose-500">{activeLosses}</span>
                  <span className="text-xs text-zinc-500">Lost</span>
                </div>
                <p className="text-[10px] font-medium text-zinc-500 mt-1">
                  Dari total {activeClosed} posisi diselesaikan
                </p>
              </div>
            </div>

            {/* Column 3: Live Position Status (Profit vs Lost and current outlook) */}
            <div className="min-w-[180px] p-4.5 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-3">
              <div>
                <p className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-bold">STATUS POSISI SEKARANG</p>
                <div className="mt-1 flex items-center gap-2">
                  {activeRunning > 0 ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                      </span>
                      <span className="text-xs font-extrabold text-teal-405 uppercase tracking-wide">
                        {activeRunning} POSISI AKTIF (RUNNING)
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                      TIDAK ADA POSISI RUNNING
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-850 space-y-1">
                <p className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase font-bold">HASIL AKUMULASI</p>
                {activeWins > activeLosses ? (
                  <div className="px-2 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-extrabold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Suku Profit (CUAN MENDOMINASI)
                  </div>
                ) : activeLosses > activeWins ? (
                  <div className="px-2 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 font-extrabold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    Suku Rugi (SL MENDOMINASI)
                  </div>
                ) : activeClosed === 0 ? (
                  <div className="px-2 py-1.5 bg-zinc-800/40 border border-zinc-800 rounded-lg text-zinc-400 font-semibold text-[11px] uppercase tracking-wide">
                    Belum ada posisi selesai
                  </div>
                ) : (
                  <div className="px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 font-extrabold text-[11px] uppercase tracking-wide">
                    SEIMBANG (BREAK EVEN)
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Statistics Row Card Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-zinc-50 text-zinc-600 rounded-xl border border-zinc-100">
            <Layers className="w-5 h-5 text-zinc-700" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider font-mono text-zinc-400">Total Saham</p>
            <p className="text-2xl font-black text-zinc-950">{totalScanned}</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider font-mono text-emerald-500">Buy Validated</p>
            <p className="text-2xl font-black text-emerald-850">{buyValidatedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider font-mono text-amber-500">Tunggu Validasi</p>
            <p className="text-2xl font-black text-amber-850">{waitingValidationCount}</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <AlertTriangle className="w-5 h-5 text-rose-700" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider font-mono text-rose-500">Risiko Tinggi</p>
            <p className="text-2xl font-black text-rose-850">{highRiskCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Section */}
      <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl space-y-3 shadow-3xs">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Ticker Saham atau Sektor..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 text-sm font-bold text-zinc-800 placeholder-zinc-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-[#005c56]"
            />
          </div>

          <div className="flex flex-wrap gap-2.5">
            {/* Premium Date Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase hidden sm:inline">Tanggal:</span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100/75 border border-teal-200 rounded-xl text-xs font-extrabold text-teal-900 focus:outline-none cursor-pointer shadow-3xs transition-all"
              >
                <option value="">Tampilkan Semua Hari</option>
                {uniqueDates.map((dateVal) => {
                  let dateLabel = dateVal;
                  try {
                    const months = [
                      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                    ];
                    const parts = dateVal.split("-");
                    if (parts.length === 3) {
                      const d = parseInt(parts[2], 10);
                      const m = months[parseInt(parts[1], 10) - 1];
                      const y = parts[0];
                      dateLabel = `${d} ${m} ${y}`;
                    }
                  } catch (e) {}

                  const isLatest = uniqueDates[0] === dateVal;
                  return (
                    <option key={dateVal} value={dateVal}>
                      {dateLabel} {isLatest ? "(Terbaru)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-extrabold text-zinc-700 focus:outline-none cursor-pointer"
            >
              <option value="">Semua Sektor</option>
              {uniqueSectors.map((sector) => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <select
              value={signalFilter}
              onChange={(e) => setSignalFilter(e.target.value)}
              className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-extrabold text-zinc-700 focus:outline-none cursor-pointer"
            >
              <option value="">Semua Sinyal</option>
              {uniqueSignals.map((signal) => (
                <option key={signal} value={signal}>{signal}</option>
              ))}
            </select>

            {(search || sectorFilter || signalFilter || selectedDate !== (uniqueDates[0] || "")) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSectorFilter("");
                  setSignalFilter("");
                  if (uniqueDates.length > 0) {
                    setSelectedDate(uniqueDates[0]);
                  } else {
                    setSelectedDate("");
                  }
                }}
                className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-750 font-bold text-xs rounded-xl transition cursor-pointer border border-zinc-200"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {lastRefreshed && (
          <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>Terakhir sinkronisasi: {lastRefreshed} WIB</span>
          </div>
        )}
      </div>

      {/* Main Results Table Container */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-3xs">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#005c56] animate-spin mx-auto" />
            <p className="text-sm font-bold text-zinc-500">Menghubungkan ke db_screener.json...</p>
          </div>
        ) : errorMsg ? (
          <div className="py-20 px-8 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-zinc-800">Gagal Membaca Data</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {errorMsg}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchScreenerData}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition"
            >
              Coba Hubungkan Ulang
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 text-center space-y-3 px-4">
            <Activity className="w-10 h-10 text-zinc-300 stroke-[1.5] mx-auto animate-pulse" />
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-zinc-600">Tidak Ada Hasil Screener SMC</p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Tidak ada emiten saham yang memenuhi filter pencarian Anda saat ini. Coba sesuaikan kata kunci atau filter sektor.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/70 border-b border-zinc-150">
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">Ticker</th>
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">Sektor</th>
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">Harga</th>
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">Pola SMC</th>
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">Sinyal</th>
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">TP 1 (%)</th>
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">TP 2 (%)</th>
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">Stop Loss</th>
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">Risk (%)</th>
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">RR Ratio</th>
                    <th className="px-5 py-4 text-[10px] font-mono tracking-wider text-zinc-400 font-extrabold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredData.map((item, idx) => (
                    <tr key={`${item.Ticker}-${idx}`} className="hover:bg-zinc-50/50 transition">
                      <td className="px-5 py-4.5">
                        <div className="font-extrabold text-sm text-zinc-900 flex items-center gap-1.5 select-all">
                          <span>{item.Ticker}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-teal-650 transition" />
                        </div>
                        <span className="text-[9px] text-zinc-400 font-mono block mt-0.5">Siklus: {item["Waktu Candle"]}</span>
                      </td>
                      <td className="px-5 py-4.5">
                        <span className="text-xs font-semibold text-zinc-600 block max-w-[150px] truncate" title={item.Sektor}>
                          {item.Sektor || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4.5 font-mono text-xs font-extrabold text-zinc-805">
                        {item.Harga.toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-4.5">
                        <div className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-teal-600" />
                          <span>{item.Pola || "-"}</span>
                        </div>
                        {item.Momentum && item.Momentum !== "-" && (
                          <span className="inline-block px-1.5 py-0.5 text-[8px] font-mono font-black rounded bg-orange-50 text-orange-600 border border-orange-200 mt-1 uppercase">
                            MOMENTUM: {item.Momentum}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4.5">
                        {getSignalBadge(item.Sinyal)}
                      </td>
                      <td className="px-5 py-4.5">
                        <div className="font-mono text-xs font-bold text-zinc-800">{item["TP 1"].toLocaleString("id-ID")}</div>
                        <span className="text-[10px] font-mono font-bold text-emerald-600">+{item["TP 1(%)"]}</span>
                      </td>
                      <td className="px-5 py-4.5">
                        <div className="font-mono text-xs font-bold text-zinc-800">{item["TP 2"].toLocaleString("id-ID")}</div>
                        <span className="text-[10px] font-mono font-bold text-emerald-600">+{item["TP 2(%)"]}</span>
                      </td>
                      <td className="px-5 py-4.5 font-mono text-xs font-bold text-zinc-750">
                        {item.SL.toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-4.5 font-mono text-xs font-bold text-rose-600">
                        {item["Risk(%)"]}
                      </td>
                      <td className="px-5 py-4.5 font-mono text-xs font-extrabold text-zinc-800">
                        {item["RR Ratio"]}
                      </td>
                      <td className="px-5 py-4.5">
                        {getStatusBadge(item["Status Akhir"])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View optimized list layout cards */}
            <div className="md:hidden divide-y divide-zinc-150">
              {filteredData.map((item, idx) => (
                <div key={`mobile-${item.Ticker}-${idx}`} className="p-5 space-y-4 hover:bg-zinc-50/50 transition">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-base text-zinc-900 tracking-tight select-all">{item.Ticker}</h4>
                        <span className="px-1.5 py-0.5 text-[8px] bg-zinc-100 text-zinc-500 rounded font-mono font-bold">{item["Waktu Candle"]}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-semibold">{item.Sektor}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {getSignalBadge(item.Sinyal)}
                      {getStatusBadge(item["Status Akhir"])}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4.5 p-3 rounded-2xl bg-zinc-50/80 border border-zinc-200/50 text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-zinc-400 font-mono mb-0.5">Harga Running</p>
                      <p className="font-mono font-black text-zinc-805">{item.Harga.toLocaleString("id-ID")}</p>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase font-bold text-zinc-400 font-mono mb-0.5">SMC Pattern</p>
                      <p className="font-sans font-bold text-zinc-700 flex items-center gap-1 truncate" title={item.Pola}>
                        <Activity className="w-3.5 h-3.5 text-teal-650 flex-shrink-0" />
                        <span>{item.Pola}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase font-bold text-zinc-400 font-mono mb-0.5">Take Profit 1</p>
                      <p className="font-mono font-bold text-zinc-800">{item["TP 1"].toLocaleString("id-ID")}</p>
                      <p className="text-[10px] font-mono font-bold text-emerald-600 mt-0.5">+{item["TP 1(%)"]}</p>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase font-bold text-zinc-400 font-mono mb-0.5">Take Profit 2</p>
                      <p className="font-mono font-bold text-zinc-800">{item["TP 2"].toLocaleString("id-ID")}</p>
                      <p className="text-[10px] font-mono font-bold text-emerald-600 mt-0.5">+{item["TP 2(%)"]}</p>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase font-bold text-zinc-400 font-mono mb-0.5">Stop Loss</p>
                      <p className="font-mono font-bold text-zinc-750">{item.SL.toLocaleString("id-ID")}</p>
                      <p className="text-[10px] font-mono font-bold text-rose-600 mt-0.5">{item["Risk(%)"]}</p>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase font-bold text-zinc-400 font-mono mb-0.5">Risk/Reward</p>
                      <p className="font-mono font-black text-zinc-800 mt-0.5">{item["RR Ratio"]}</p>
                    </div>
                  </div>

                  {item.Momentum && item.Momentum !== "-" && (
                    <div className="px-3 py-1.5 bg-orange-50/50 border border-orange-100 rounded-xl text-[10px] font-medium text-orange-700 flex items-center justify-between">
                      <span className="font-mono font-black tracking-wider uppercase">Momentum Active:</span>
                      <span className="font-mono font-black bg-orange-100 px-2 py-0.5 rounded text-orange-800">{item.Momentum}</span>
                    </div>
                  )}

                  <div className="text-[9px] text-zinc-400 font-mono text-right">
                    ⏱️ Screen: {item["Waktu Screen"]}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
