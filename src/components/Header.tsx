/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Car, Users, Calendar, Shield, Settings, Database, Activity, Award, Pencil } from "lucide-react";
import J5EvoLogo from "./J5EvoLogo";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
}

export default function Header({ activeTab, setActiveTab, isAdmin, setIsAdmin }: HeaderProps) {
  return (
    <>
      {/* 1. Mobile Fixed Logo & Brand Name Header (Hidden on Desktop) */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 px-4 flex items-center justify-between z-50 md:hidden shadow-xs">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("home")}>
          <div className="w-9 h-9 flex-shrink-0">
            <J5EvoLogo className="w-full h-full" color="#005c56" />
          </div>
          <div>
            <span className="font-sans font-extrabold text-sm tracking-tight bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text text-transparent block">
              J5 EVO
            </span>
            <p className="text-[8px] text-zinc-500 font-semibold -mt-0.5 tracking-wider uppercase leading-none">
              JACOOL J5 COMMUNITY
            </p>
          </div>
        </div>
        
        {/* Simple compact Role Toggle on mobile fixed header */}
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-full border border-zinc-200">
          <button
            onClick={() => {
              setIsAdmin(false);
              if (activeTab === "admin-dashboard") setActiveTab("home");
            }}
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all cursor-pointer ${
              !isAdmin ? "bg-teal-600 text-white shadow-xs" : "text-zinc-500"
            }`}
          >
            Member
          </button>
          <button
            onClick={() => {
              setIsAdmin(true);
              setActiveTab("admin-dashboard");
            }}
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all cursor-pointer ${
              isAdmin ? "bg-amber-500 text-zinc-950 shadow-xs" : "text-zinc-500"
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* 2. Main Header Element */}
      {/* On mobile: non-sticky, flows with normal scroll below fixed logo header.
          On desktop: remains sticky top-0. */}
      <header className="relative md:sticky md:top-0 z-40 bg-white border-b border-zinc-200 text-zinc-800 py-3 px-4 shadow-sm mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Branding (Hidden on mobile because it is fixed at the top of the mobile screen) */}
          <div className="hidden md:flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="w-12 h-12 flex-shrink-0 bg-transparent p-0.5">
              <J5EvoLogo className="w-full h-full" color="#005c56" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent block">
                  J5 EVO
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-medium -mt-0.5 leading-tight tracking-tight">
                Official licensed J5 community
              </p>
            </div>
          </div>

          {/* Desktop/Scrollable Mobile Navigation Links */}
          <nav className="flex items-center flex-wrap justify-center gap-1.5 md:gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeTab === "home"
                  ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
            >
              Beranda
            </button>
            
            <button
              onClick={() => setActiveTab("register-member")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeTab === "register-member"
                  ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
            >
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Daftar Member
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeTab === "events"
                  ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Kegiatan
            </button>

            <button
              onClick={() => setActiveTab("membership-lookup")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeTab === "membership-lookup"
                  ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
            >
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Profil & Riwayat
            </button>

            <button
              onClick={() => setActiveTab("sponsor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeTab === "sponsor"
                  ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
            >
              <Award className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
              Sponsor
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin-dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 relative border cursor-pointer ${
                  activeTab === "admin-dashboard"
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "text-amber-700 bg-amber-50/50 border-amber-200 hover:bg-amber-100"
                }`}
              >
                <Database className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* Desktop Role Toggle (Hidden on mobile since it is integrated into mobile logo bar) */}
          <div className="hidden md:flex items-center gap-2 bg-zinc-100 p-1 rounded-full border border-zinc-200 shadow-inner">
            <button
              onClick={() => {
                setIsAdmin(false);
                if (activeTab === "admin-dashboard") {
                  setActiveTab("home");
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                !isAdmin
                  ? "bg-teal-600 text-white shadow-md font-bold"
                  : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              🟢 Member
            </button>
            <button
              onClick={() => {
                setIsAdmin(true);
                // Redirect if they activate admin mode
                setActiveTab("admin-dashboard");
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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
    </>
  );
}
