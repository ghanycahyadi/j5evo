/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Car, Users, Calendar, Shield, Settings, Database, Activity } from "lucide-react";
import J5EvoLogo from "./J5EvoLogo";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
}

export default function Header({ activeTab, setActiveTab, isAdmin, setIsAdmin }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-zinc-200 text-zinc-800 py-3 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Branding Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
          {/* Custom J5 EVO Shield Logo matching user's uploaded layout */}
          <div className="w-12 h-12 flex-shrink-0 bg-transparent p-0.5 animate-fadeIn">
            <J5EvoLogo className="w-full h-full" color="#005c56" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                J5 EVO
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium -mt-0.5 leading-tight tracking-tight">
              Official licensed J5 community
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex items-center flex-wrap justify-center gap-1.5 md:gap-2">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === "home"
                ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-sm"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            Beranda
          </button>
          
          <button
            onClick={() => setActiveTab("register-member")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === "register-member"
                ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-sm"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            <Users className="w-4 h-4" />
            Daftar Member
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === "events"
                ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-sm"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Kegiatan
          </button>

          <button
            onClick={() => setActiveTab("membership-lookup")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === "membership-lookup"
                ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-sm"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            <Shield className="w-4 h-4" />
            Profil & Riwayat
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin-dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 relative border ${
                activeTab === "admin-dashboard"
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "text-amber-700 bg-amber-50/50 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Database className="w-4 h-4 text-amber-600" />
              Panel Admin
            </button>
          )}
        </nav>

        {/* Role Toggle Controls */}
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-full border border-zinc-200 shadow-inner">
          <button
            onClick={() => {
              setIsAdmin(false);
              if (activeTab === "admin-dashboard") {
                setActiveTab("home");
              }
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              !isAdmin
                ? "bg-teal-600 text-white shadow-md font-bold"
                : "text-zinc-500 hover:text-zinc-805"
            }`}
          >
            🟢 Member
          </button>
          <button
            onClick={() => {
              setIsAdmin(true);
              // also redirect to admin if they enable it to see dashboard easily
              setActiveTab("admin-dashboard");
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isAdmin
                ? "bg-amber-500 text-zinc-950 shadow-md font-extrabold"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            🔴 Admin
          </button>
        </div>

      </div>
    </header>
  );
}
