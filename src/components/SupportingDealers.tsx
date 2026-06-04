/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, MapPin, Navigation, Copy, Check, ShieldAlert, Award } from "lucide-react";

interface Dealer {
  id: string;
  name: string;
  address: string;
  isComingSoon?: boolean;
  phone?: string;
  mapsUrl: string;
}

const DEALERS_DATA: Dealer[] = [
  {
    id: "dl-1",
    name: "JAECOO ANDALAN MAMPANG",
    address: "Jl. Mampang Prapatan Raya, No. 20, Desa/Kelurahan Tegal Parang, Kec. Mampang Prapatan, Kota Adm. Jakarta Selatan, Provinsi DKI Jakarta, Kode Pos: 12790",
    mapsUrl: "https://maps.google.com/?q=Jaecoo+Andalan+Mampang,+Jl.+Mampang+Prapatan+Raya+No.20,+Tegal+Parang,+Mampang+Prapatan,+South+Jakarta+City,+Jakarta+12790"
  },
  {
    id: "dl-2",
    name: "JAECOO 1S ANDALAN SCBD PARK (COMING SOON)",
    address: "Sudirman Central Business District (SCBD, Jl. Jend. Sudirman kav 52-53 No.LOT 6-8, RT.5/RW.1, Senayan, Kec. Kby. Baru, Daerah Khusus Ibukota Jakarta 12190",
    isComingSoon: true,
    mapsUrl: "https://maps.google.com/?q=SCBD+Park,+Senayan,+Kebayoran+Baru,+South+Jakarta+City,+Jakarta+12190"
  },
  {
    id: "dl-3",
    name: "JAECOO ANDALAN SUMMARECON BEKASI (COMING SOON)",
    address: "AXC Summarecon Bekasi Blok VA10 - VA11, Jl. Bulevar Timur Rt. 003 Rw. 002, Marga Mulya, Bekasi Utara, Kota Bekasi, Jawa Barat 17142",
    isComingSoon: true,
    mapsUrl: "https://maps.google.com/?q=AXC+Summarecon+Bekasi,+Marga+Mulya,+Bekasi+Utara,+Bekasi+City,+West+Java+17142"
  },
  {
    id: "dl-4",
    name: "JAECOO ANDALAN TANGERANG BSD (COMING SOON)",
    address: "Jl. BSD Boulevard Utara, Lengkong Kulon, Kec. Pagedangan, Kabupaten Tangerang, Banten 15331",
    isComingSoon: true,
    mapsUrl: "https://maps.google.com/?q=BSD+Boulevard+Utara,+Lengkong+Kulon,+Pagedangan,+Tangerang+Regency,+Banten+15331"
  },
  {
    id: "dl-5",
    name: "JAECOO ANDALAN SURABAYA GUBENG (COMING SOON)",
    address: "Jl. Raya Gubeng No. 17, Gubeng, Kec. Gubeng, Kota Surabaya, Jawa Timur 60281",
    isComingSoon: true,
    mapsUrl: "https://maps.google.com/?q=Jl.+Raya+Gubeng+No.17,+Gubeng,+Kec.+Gubeng,+Surabaya,+East+Java+60281"
  }
];

interface SupportingDealersProps {
  dealers?: Dealer[];
}

export default function SupportingDealers({ dealers }: SupportingDealersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 2;

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCopyAddress = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const activeDealers = (dealers && dealers.length > 0) ? dealers : DEALERS_DATA;

  const filteredDealers = activeDealers.filter((dealer) => {
    const q = searchQuery.toLowerCase();
    return (
      dealer.name.toLowerCase().includes(q) ||
      dealer.address.toLowerCase().includes(q)
    );
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredDealers.length / ITEMS_PER_PAGE);
  const paginatedDealers = filteredDealers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div id="supporting-dealers-section" className="space-y-6 text-left bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-6 bg-[#005c56] rounded-md shadow-xs"></div>
              <h3 className="font-sans font-black tracking-wider text-xl text-[#005c56] uppercase">Supporting Dealer</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed max-w-md">
              Daftar dealer resmi JAECOO pendukung komunitas J5 EVO Indonesia.
            </p>
          </div>

          {/* Improved Search Box */}
          <div className="relative w-full sm:w-48 h-10 bg-zinc-50 border border-zinc-200 shadow-3xs rounded-xl flex items-center px-3.5 transition-all focus-within:bg-white focus-within:border-[#005c56] focus-within:ring-2 focus-within:ring-[#005c56]/10 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Dealer"
              className="w-full bg-transparent text-zinc-900 focus:outline-none text-xs font-bold placeholder:text-zinc-400 py-1.5 pr-6"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-450">
              <Search className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Grid Layout of Dealers */}
        {paginatedDealers.length === 0 ? (
          <div className="p-10 text-center text-zinc-450 bg-zinc-50 border border-dashed border-zinc-250 rounded-2xl flex flex-col items-center justify-center gap-2">
            <ShieldAlert className="w-8 h-8 text-zinc-350" />
            <p className="text-xs font-bold text-zinc-700">Tidak ada dealer yang cocok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {paginatedDealers.map((dealer) => (
              <div
                key={dealer.id}
                className={`bg-zinc-50/50 border rounded-2xl p-5 flex flex-col justify-between shadow-3xs transition-all duration-300 relative overflow-hidden group hover:bg-white hover:-translate-y-0.5 ${
                  dealer.isComingSoon 
                    ? "border-amber-200/60 hover:border-amber-400 bg-gradient-to-b from-zinc-50/50 to-amber-50/10" 
                    : "border-zinc-200 hover:border-[#005c56]/40"
                }`}
              >
                {/* Top Section */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[#005c56] shadow-4xs shrink-0 group-hover:bg-[#005c56]/10 group-hover:border-[#005c56]/20 transition-colors">
                      <MapPin className="w-4 h-4 text-[#005c56]" />
                    </div>

                    {dealer.isComingSoon ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[8px] font-mono font-extrabold rounded-md uppercase tracking-wider">
                        SOON
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-teal-50 text-[#005c56] border border-teal-150 text-[8px] font-mono font-extrabold rounded-md uppercase tracking-wider flex items-center gap-0.5 shadow-4xs">
                        <Award className="w-2.5 h-2.5" /> PARTNER
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-sans font-extrabold text-xs sm:text-sm text-zinc-900 leading-snug tracking-wide group-hover:text-[#005c56] transition-colors uppercase">
                      {dealer.name}
                    </h4>
                    <p className="text-[10.5px] text-zinc-500 leading-relaxed font-sans line-clamp-3 min-h-[3.2rem] uppercase">
                      {dealer.address}
                    </p>
                  </div>
                </div>

                {/* Action Buttons styled in grid */}
                <div className="grid grid-cols-2 gap-1.5 mt-4 pt-3 border-t border-zinc-100">
                  <a
                    href={dealer.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-1.5 bg-white hover:bg-[#005c56] hover:text-white border border-zinc-200 hover:border-[#005c56] rounded-lg text-[10px] font-bold text-zinc-700 transition-all cursor-pointer"
                  >
                    <Navigation className="w-3 h-3 shrink-0" />
                    <span>Rute</span>
                  </a>
                  
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(dealer.id, dealer.address)}
                    className="flex items-center justify-center gap-1 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-650 transition-all cursor-pointer"
                  >
                    {copiedId === dealer.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 font-extrabold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Elegant Centered Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-2 rounded-xl mt-4 shrink-0">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 text-[9px] font-bold rounded-lg hover:bg-zinc-100 disabled:opacity-40 transition-all cursor-pointer select-none disabled:cursor-not-allowed shadow-4xs"
          >
            ← Prev
          </button>
          
          <div className="flex items-center gap-1 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg text-zinc-500 font-bold font-mono text-[10px]">
            Page <span className="text-[#005c56] font-extrabold">{currentPage}</span> / {totalPages}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 text-[9px] font-bold rounded-lg hover:bg-zinc-100 disabled:opacity-40 transition-all cursor-pointer select-none disabled:cursor-not-allowed shadow-4xs"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
