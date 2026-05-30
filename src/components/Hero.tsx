/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ChevronRight, Sparkles, Instagram, Facebook, Twitter, Music, MessageSquare } from "lucide-react";

interface HeroProps {
  onRegisterClick: () => void;
  onExploreEventsClick: () => void;
  socials?: {
    instagram?: { name: string; url: string; handle: string; show: boolean };
    facebook?: { name: string; url: string; handle: string; show: boolean };
    twitter?: { name: string; url: string; handle: string; show: boolean };
    tiktok?: { name: string; url: string; handle: string; show: boolean };
    threads?: { name: string; url: string; handle: string; show: boolean };
  };
}

export default function Hero({ onRegisterClick, onExploreEventsClick, socials }: HeroProps) {
  // Fallbacks if not loaded or passed
  const activeSocials = socials || {
    instagram: { name: "Instagram", url: "https://www.instagram.com/j5evo.id", handle: "@j5evo.id", show: true },
    facebook: { name: "Facebook", url: "https://facebook.com/groups/j5evo.id", handle: "J5 EVO ID", show: true },
    twitter: { name: "X (Twitter)", url: "https://x.com/j5evo.id", handle: "@j5evo_id", show: true },
    tiktok: { name: "TikTok", url: "https://tiktok.com/@j5evo.id", handle: "@j5evo.id", show: true },
    threads: { name: "Threads", url: "https://threads.net/@j5evo.id", handle: "@j5evo.id", show: true }
  };
  return (
    <div className="relative text-zinc-800 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-sky-50 py-16 md:py-24 px-6 rounded-3xl border border-teal-100 shadow-xl">
      {/* Visual background atmospheric lights */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl -translate-y-12"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/25 rounded-full blur-3xl translate-y-12"></div>
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948805_1px,transparent_1px),linear-gradient(to_bottom,#0d948805_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Banner Text Columns (8) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100/60 border border-teal-200 rounded-full text-xs text-teal-800 font-mono font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Official Community of J5 EVO Indonesia</span>
          </div>

          <h1 className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight text-zinc-900">
            Keluarga Besar <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600">
              J5 EVO Indonesia
            </span>
          </h1>

          <p className="text-base text-zinc-700 leading-relaxed font-sans max-w-2xl font-semibold">
            J5 EVO (Electric Vehicle Owner) — Official licensed J5 community from ATPM Jaecoo Indonesia Partners
          </p>

          <p className="text-sm text-zinc-600 leading-relaxed font-sans max-w-2xl font-medium">
            Satu wadah pemersatu silaturahmi, ekspedisi petualangan, edukasi teknis, serta inovasi berkendara ramah lingkungan bagi seluruh pemilik dan peminat unit mobil listrik premium JAECOO J5 EV di Indonesia.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
               onClick={onRegisterClick}
               className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm md:text-base rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(13,148,136,0.2)] hover:shadow-[0_4px_16px_rgba(13,148,136,0.35)] flex items-center gap-1 focus:outline-none"
            >
              Daftar Member Sekarang
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button
               onClick={onExploreEventsClick}
               className="px-6 py-3 bg-white hover:bg-zinc-50 text-teal-800 border border-teal-200 rounded-xl shadow-xs transition duration-350 text-sm md:text-base font-bold focus:outline-none"
            >
              Lihat Kegiatan Komunitas
            </button>
          </div>

          {/* Icon highlights (Social Media Channels) */}
          <div className="pt-4 border-t border-teal-100 flex flex-wrap gap-3">
            {activeSocials.instagram && activeSocials.instagram.show && (
              <a
                href={activeSocials.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:bg-teal-50 px-3 py-1.5 rounded-xl transition duration-300 group/link border border-teal-100/30"
                id="social-instagram"
              >
                <Instagram className="w-4 h-4 text-pink-600 group-hover/link:scale-110 transition duration-200" />
                <div>
                  <h4 className="text-[11px] font-bold text-zinc-800 leading-none">{activeSocials.instagram.name}</h4>
                  <p className="text-[9px] text-zinc-400 font-mono">{activeSocials.instagram.handle}</p>
                </div>
              </a>
            )}

            {activeSocials.facebook && activeSocials.facebook.show && (
              <a
                href={activeSocials.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:bg-teal-50 px-3 py-1.5 rounded-xl transition duration-300 group/link border border-teal-100/30"
                id="social-facebook"
              >
                <Facebook className="w-4 h-4 text-blue-600 group-hover/link:scale-110 transition duration-200" />
                <div>
                  <h4 className="text-[11px] font-bold text-zinc-800 leading-none">{activeSocials.facebook.name}</h4>
                  <p className="text-[9px] text-zinc-400 font-mono">{activeSocials.facebook.handle}</p>
                </div>
              </a>
            )}

            {activeSocials.twitter && activeSocials.twitter.show && (
              <a
                href={activeSocials.twitter.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:bg-teal-50 px-3 py-1.5 rounded-xl transition duration-300 group/link border border-teal-100/30"
                id="social-x"
              >
                <Twitter className="w-4 h-4 text-zinc-900 group-hover/link:scale-110 transition duration-200" />
                <div>
                  <h4 className="text-[11px] font-bold text-zinc-800 leading-none">{activeSocials.twitter.name}</h4>
                  <p className="text-[9px] text-zinc-400 font-mono">{activeSocials.twitter.handle}</p>
                </div>
              </a>
            )}

            {activeSocials.tiktok && activeSocials.tiktok.show && (
              <a
                href={activeSocials.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:bg-teal-50 px-3 py-1.5 rounded-xl transition duration-300 group/link border border-teal-100/30"
                id="social-tiktok"
              >
                <Music className="w-4 h-4 text-rose-600 group-hover/link:scale-110 transition duration-200" />
                <div>
                  <h4 className="text-[11px] font-bold text-zinc-800 leading-none">{activeSocials.tiktok.name}</h4>
                  <p className="text-[9px] text-zinc-400 font-mono">{activeSocials.tiktok.handle}</p>
                </div>
              </a>
            )}

            {activeSocials.threads && activeSocials.threads.show && (
              <a
                href={activeSocials.threads.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:bg-teal-50 px-3 py-1.5 rounded-xl transition duration-300 group/link border border-teal-100/30"
                id="social-threads"
              >
                <MessageSquare className="w-4 h-4 text-zinc-900 group-hover/link:scale-110 transition duration-200" />
                <div>
                  <h4 className="text-[11px] font-bold text-zinc-800 leading-none">{activeSocials.threads.name}</h4>
                  <p className="text-[9px] text-zinc-400 font-mono">{activeSocials.threads.handle}</p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Visual Display side-box (5) */}
        <div className="lg:col-span-5 relative group flex justify-center">
          <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-teal-50 to-white p-6 border border-teal-200/80 shadow-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
            {/* Soft decorative background illustration */}
            <div className="absolute inset-0 bg-[#F0FDFA]/30"></div>
            
            {/* Visual Vector SUV Art */}
            <div className="relative flex flex-col items-center text-center z-10 space-y-3">
              <div className="w-16 h-16 bg-teal-100 border border-teal-200 rounded-full flex items-center justify-center text-teal-600 mb-1 animate-pulse">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                  {/* Modern car icon */}
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 6h11l1.39 4H5.11L6.5 6zM6.5 16c-.83 0-1.5-.67-1.5-1s.67-1 1.5-1 1.5.67 1.5 1-.67 1-1.5 1zm11 0c-.83 0-1.5-.67-1.5-1s.67-1 1.5-1 1.5.67 1.5 1-.67 1-1.5 1z" />
                </svg>
              </div>
              <span className="text-[10px] text-teal-750 font-mono tracking-widest uppercase font-bold block">
                JAECOO J5 EV INDONESIA
              </span>
              <h4 className="text-lg font-bold text-teal-900 mb-1 font-sans">
                SUV EV Kelas Masa Depan 🇮🇩
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans font-medium">
                Kapasitas baterai besar <strong className="text-teal-700 font-mono font-extrabold">61.2 kWh</strong>, dual motor responsive, asisten cerdas ADAS level 2, kenyamanan kabin mewah kedap suara, dijamin siap menjelajah nusantara ramah lingkungan.
              </p>
              
              {/* Badge specifications */}
              <div className="flex gap-2 pt-2 flex-wrap justify-center">
                <span className="px-2 py-1 rounded text-[9px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-150 shadow-2xs">
                  ⚡ Max 450 KM
                </span>
                <span className="px-2 py-1 rounded text-[9px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-150 shadow-2xs">
                  🚀 61.2 kWh
                </span>
                <span className="px-2 py-1 rounded text-[9px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-150 shadow-2xs">
                  📱 Smart ADAS
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
