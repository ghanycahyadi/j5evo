import React from "react";
import { Users, Pencil, Trash2, Cake, Gift } from "lucide-react";
import { Member } from "../types";

interface AdminMembersProps {
  members: Member[];
  regionals: string[];
  editingMemberId: string | null;
  setEditingMemberId: (id: string | null) => void;
  editMemberForm: any | null;
  setEditMemberForm: (form: any | null) => void;
  handleUpdateMemberTier: (id: string, currentTier: string, newTier: "SILVER" | "GOLD") => void;
  handleDeleteMember: (id: string, name: string) => void;
  handleEditMemberSubmit: (e: React.FormEvent) => void;
}

export default function AdminMembers({
  members,
  regionals,
  editingMemberId,
  setEditingMemberId,
  editMemberForm,
  setEditMemberForm,
  handleUpdateMemberTier,
  handleDeleteMember,
  handleEditMemberSubmit,
}: AdminMembersProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Helper to check if a birthDate string is today
  const isBirthdayToday = (birthDateStr: string) => {
    if (!birthDateStr) return false;
    const parts = birthDateStr.split("-");
    if (parts.length !== 3) return false;
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    const today = new Date();
    return month === (today.getMonth() + 1) && day === today.getDate();
  };

  // Helper to calculate age
  const getAge = (birthDateStr: string) => {
    if (!birthDateStr) return null;
    const parts = birthDateStr.split("-");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    const today = new Date();
    let age = today.getFullYear() - year;
    const m = (today.getMonth() + 1) - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age--;
    }
    return age;
  };

  // Helper to format Indonesian display date
  const formatIndonesianDate = (birthDateStr: string) => {
    if (!birthDateStr) return "";
    const parts = birthDateStr.split("-");
    if (parts.length !== 3) return birthDateStr;
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const indonesianMonths = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthName = indonesianMonths[monthIndex] || parts[1];
    return `${day} ${monthName}`;
  };

  // Helper to generate WhatsApp prefilled link
  const getWhatsAppLink = (phone: string, name: string, age: number | null) => {
    const cleanedPhone = (phone || "").replace(/[^0-9]/g, "");
    let targetPhone = cleanedPhone;
    if (targetPhone.startsWith("0")) {
      targetPhone = "62" + targetPhone.slice(1);
    }
    const ageText = age ? ` yang ke-${age}` : "";
    const message = encodeURIComponent(
      `Halo Om ${name}, Selamat Ulang Tahun${ageText} dari Keluarga Besar J5 EVO INDONESIA! Semoga sehat selalu, panjang umur, banyak rejeki, dan terus solid bersama J5 EVO! 🥳🎂🎉`
    );
    return `https://wa.me/${targetPhone}?text=${message}`;
  };

  const todayBirthdays = members.filter((m) => m.birthDate && isBirthdayToday(m.birthDate));

  // Helper to split a plate number "B 1234 JAE" into [p1, p2, p3] safely
  const parsePlate = (plateStr: string) => {
    const parts = (plateStr || "").trim().split(/\s+/);
    const p1 = parts[0] || "";
    const p2 = parts[1] || "";
    const p3 = parts[2] || "";
    return [p1, p2, p3];
  };

  const p1 = editMemberForm ? parsePlate(editMemberForm.plateNumber)[0] : "";
  const p2 = editMemberForm ? parsePlate(editMemberForm.plateNumber)[1] : "";
  const p3 = editMemberForm ? parsePlate(editMemberForm.plateNumber)[2] : "";

  const handlePlatePartChange = (partIndex: 1 | 2 | 3, value: string) => {
    const parts = parsePlate(editMemberForm?.plateNumber || "");
    let newP1 = parts[0];
    let newP2 = parts[1];
    let newP3 = parts[2];

    if (partIndex === 1) {
      newP1 = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
    } else if (partIndex === 2) {
      newP2 = value.replace(/[^0-9]/g, "").slice(0, 4);
    } else if (partIndex === 3) {
      newP3 = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
    }

    const merged = `${newP1} ${newP2} ${newP3}`.trim().replace(/\s+/g, " ");
    setEditMemberForm({ ...editMemberForm, plateNumber: merged });
  };

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.plateNumber.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      (m.regional && m.regional.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.address && m.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* 🎂 SECTION: MEMBER BERULANG TAHUN HARI INI */}
      <div className="bg-gradient-to-r from-pink-50 to-amber-50 p-6 rounded-3xl border border-pink-200/60 shadow-sm text-left space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-100 rounded-xl text-pink-600 animate-bounce">
            <Cake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-base text-zinc-900">🎂 Member Berulang Tahun Hari Ini</h4>
            <p className="text-[10px] text-zinc-500 font-medium">Beri ucapan selamat dan jalin keakraban sesama anggota komunitas</p>
          </div>
        </div>

        {todayBirthdays.length === 0 ? (
          <div className="py-2 flex items-center gap-2 text-zinc-400 font-medium font-sans">
            <Gift className="w-4 h-4 text-zinc-300 animate-pulse" />
            <span className="text-2xs text-zinc-500">Tidak ada member yang berulang tahun hari ini ({formatIndonesianDate(new Date().toISOString().split('T')[0])}).</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {todayBirthdays.map((m) => {
              const age = m.birthDate ? getAge(m.birthDate) : null;
              const waLink = getWhatsAppLink(m.phone, m.name, age);
              return (
                <div key={m.id} className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-pink-100 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={m.ownerPhoto || m.carPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                      alt={m.name}
                      className="w-10 h-10 object-cover rounded-xl border border-pink-100 shadow-2xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 text-xs truncate">{m.name}</p>
                      <p className="text-[9px] text-pink-600 font-bold font-mono">
                        {age ? `Ultah ke-${age} 🎉` : "Hari Ini! 🎈"}
                      </p>
                      <p className="text-[9px] text-zinc-400 font-mono truncate">{m.regional}</p>
                    </div>
                  </div>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg border border-emerald-100 transition duration-200 cursor-pointer shrink-0 font-bold text-[10px] flex items-center gap-1 shadow-2xs text-center"
                    title="Kirim Ucapan WA"
                  >
                    Kirim Ucapan
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Master Member list inside administrative workspace with Delete member action */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-sans font-bold text-base text-zinc-900">Daftar Member Komunitas Terdaftar</h4>
          <span className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-[#005c56] text-[10px] rounded font-mono font-bold self-start sm:self-auto">
            {searchQuery.trim() ? `${filteredMembers.length} dari ${members.length}` : members.length} Member Terverifikasi
          </span>
        </div>

        {/* Pencarian Member Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari berdasarkan nama, plat kendaraan, ID, HP/WA, regional, email, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 pl-9 pr-14 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
          />
          <div className="absolute left-3 top-2.5 text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1.5 text-[9px] bg-zinc-200 hover:bg-zinc-300 transition text-zinc-700 px-2 py-0.5 rounded-md font-bold"
            >
              Hapus
            </button>
          )}
        </div>

        {filteredMembers.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6 font-medium">
            {searchQuery.trim() ? "Hasil pencarian tidak ditemukan." : "Belum ada database anggota terdaftar."}
          </p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={m.ownerPhoto || m.carPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                    alt={m.name}
                    className="w-10 h-12 object-cover rounded border border-zinc-200 shrink-0 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">{m.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      ID: <strong className="text-zinc-800 font-mono text-[11px]">{m.id}</strong> | Plat: <strong className="text-teal-700 font-mono">{m.plateNumber}</strong>
                    </p>
                    <p className="text-[9px] text-zinc-400 font-mono">
                      Chasis: {m.chassisNumber} {m.birthDate ? `| Ultah: ${m.birthDate}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {/* Manage Tier Selector */}
                  <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1">
                    <span className="text-[9px] text-zinc-400 px-1 font-bold uppercase whitespace-nowrap">TIER:</span>
                    <select
                      value={m.membershipTier || "SILVER"}
                      onChange={(e) => handleUpdateMemberTier(m.id, m.membershipTier || "SILVER", e.target.value as any)}
                      className="bg-transparent border-0 font-bold focus:ring-0 text-[#005c56] text-[11px] cursor-pointer outline-none"
                    >
                      <option value="SILVER">SILVER</option>
                      <option value="GOLD">GOLD (Pendiri)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setEditingMemberId(m.id);
                      setEditMemberForm({ ...m });
                      setTimeout(() => {
                        const el = document.getElementById("edit-member-section-anchor");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    }}
                    className="p-2 text-teal-650 hover:text-white bg-teal-50 hover:bg-teal-650 border border-teal-100 rounded-lg transition cursor-pointer"
                    title="Edit Data Member"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteMember(m.id, m.name)}
                    className="p-2 text-red-605 hover:text-white bg-red-50 hover:bg-red-600 border border-red-100 rounded-lg transition cursor-pointer"
                    title="Hapus / Nonaktifkan Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INTERACTIVE MEMBER EDITING PANEL (ADMIN ONLY) */}
      {editingMemberId && editMemberForm && (
        <div id="edit-member-section-anchor" className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-3xl border-2 border-teal-500 shadow-md space-y-4 animate-fade-in scroll-mt-6 text-left">
          <div className="flex items-center justify-between border-b border-teal-100 pb-3">
            <div className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-teal-700" />
              <div>
                <h4 className="font-sans font-bold text-base text-zinc-900">Sunting Profile Member</h4>
                <p className="text-2xs text-[#005c56] font-mono font-bold">ID: {editingMemberId}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingMemberId(null);
                setEditMemberForm(null);
              }}
              className="p-1 px-2.5 bg-zinc-150 hover:bg-zinc-200 rounded-lg text-xs font-bold text-zinc-700 transition"
            >
              Batal
            </button>
          </div>

          <form onSubmit={handleEditMemberSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              <div className="space-y-1">
                <label className="text-zinc-[700] font-bold block">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editMemberForm.name || ""}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, name: e.target.value })}
                  className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-[700] font-bold block">No WhatsApp / HP *</label>
                <input
                  type="text"
                  required
                  value={editMemberForm.phone || ""}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, phone: e.target.value.replace(/[^0-9+]/g, "") })}
                  className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-[700] font-bold block">Alamat Email</label>
                <input
                  type="email"
                  value={editMemberForm.email || ""}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, email: e.target.value })}
                  className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-[700] font-bold block">Plat Nomor *</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="B"
                    value={p1}
                    onChange={(e) => handlePlatePartChange(1, e.target.value)}
                    className="w-1/4 bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-center font-mono font-bold uppercase"
                    maxLength={2}
                  />
                  <input
                    type="text"
                    required
                    placeholder="1234"
                    value={p2}
                    onChange={(e) => handlePlatePartChange(2, e.target.value)}
                    className="w-2/4 bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-center font-mono font-bold"
                    maxLength={4}
                  />
                  <input
                    type="text"
                    required
                    placeholder="ABC"
                    value={p3}
                    onChange={(e) => handlePlatePartChange(3, e.target.value)}
                    className="w-1/4 bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-center font-mono font-bold uppercase"
                    maxLength={3}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-[700] font-bold block">No Rangka *</label>
                <input
                  type="text"
                  required
                  value={editMemberForm.chassisNumber || ""}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, chassisNumber: e.target.value.toUpperCase() })}
                  className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-[700] font-bold block">Tanggal Lahir</label>
                <input
                  type="date"
                  value={editMemberForm.birthDate || ""}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, birthDate: e.target.value })}
                  className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-[700] font-bold block">Regional *</label>
                <select
                  required
                  value={editMemberForm.regional || ""}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, regional: e.target.value })}
                  className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
                >
                  <option value="">-- Pilih Regional --</option>
                  {(regionals.length > 0 ? regionals : [
                    "J5 EVO - DKI JAKARTA",
                    "J5 EVO - JAWA BARAT",
                    "J5 EVO - JAWA TENGAH & DIY",
                    "J5 EVO - JAWA TIMUR",
                    "J5 EVO - SULAWESI SELATAN",
                    "J5 EVO - TANGERANG RAYA"
                  ]).map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-[700] font-bold block">Membership Tier *</label>
                <select
                  value={editMemberForm.membershipTier || "SILVER"}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, membershipTier: e.target.value })}
                  className="w-full bg-white text-zinc-900 border border-teal-300 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-bold text-[#005c56]"
                >
                  <option value="SILVER">SILVER</option>
                  <option value="GOLD">GOLD (Pendiri)</option>
                </select>
              </div>

            </div>

            <div className="space-y-1">
              <label className="text-zinc-[700] font-bold block">Alamat Lengkap *</label>
              <textarea
                required
                value={editMemberForm.address || ""}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, address: e.target.value })}
                rows={2}
                className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-teal-100">
              <button
                type="button"
                onClick={() => {
                  setEditingMemberId(null);
                  setEditMemberForm(null);
                }}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl hover:scale-102 active:scale-98 transition shadow-sm cursor-pointer"
              >
                Simpan Perubahan Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
