import React from "react";
import { Users, Pencil, Trash2, Cake, Gift, AlertTriangle, Copy, Send, Check, ShieldAlert } from "lucide-react";
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
  const [copiedWarning, setCopiedWarning] = React.useState(false);

  // Paginated server-side member states
  const [localMembers, setLocalMembers] = React.useState<Member[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalMembers, setTotalMembers] = React.useState(0);
  const [localLoading, setLocalLoading] = React.useState(false);

  const fetchLocalMembers = React.useCallback(async (page: number, search: string) => {
    try {
      setLocalLoading(true);
      const url = `/api/members?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && Array.isArray(data.members)) {
        setLocalMembers(data.members);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setTotalMembers(data.total || 0);
      }
    } catch (err) {
      console.error("Gagal mengambil data paginasi member:", err);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // Sync to database updates and paging
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLocalMembers(currentPage, searchQuery);
    }, currentPage === 1 ? 250 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery, members, fetchLocalMembers]);

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
                      src={m.ownerPhoto || m.carPhoto || "/logo.png"}
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

      {/* 📢 DYNAMIC DRAFT WA WARNING & INCOMPLETE MEMBERS CLASSIFIER */}
      {(() => {
        const incompleteList = members.map(m => {
          const op = m.ownerPhoto || "";
          const isPhotoMissing = m.hasOwnerPhoto !== undefined
            ? !m.hasOwnerPhoto
            : (!op || op.trim() === "" || op === "/logo.png" || 
               op.includes("unsplash.com/photo-1534528741775") ||
               op.includes("unsplash.com/photo-1507003211169") ||
               op.includes("unsplash.com/photo-1500648767791") ||
               op.includes("unsplash.com/photo-1494790108377"));
          const cleanChassis = (m.chassisNumber || "").trim().replace(/\s+/g, "");
          const isChassisInvalid = cleanChassis.length !== 17;
          
          const reasons: string[] = [];
          if (isPhotoMissing) reasons.push("Tidak Melampirkan Foto");
          if (isChassisInvalid) {
            const charCount = cleanChassis.length;
            reasons.push(charCount === 0 ? "No Rangka Kosong" : `No Rangka Invalid (${charCount} digit)`);
          }

          return {
            ...m,
            isPhotoMissing,
            isChassisInvalid,
            reasons
          };
        }).filter(m => m.isPhotoMissing || m.isChassisInvalid);

        // Group incomplete list by regional
        const groupedByRegional: { [reg: string]: typeof incompleteList } = {};
        incompleteList.forEach(m => {
          const reg = (m.regional || "J5 EVO - DKI JAKARTA").toUpperCase();
          if (!groupedByRegional[reg]) {
            groupedByRegional[reg] = [];
          }
          groupedByRegional[reg].push(m);
        });

        const buildWaText = () => {
          let listText = "";
          const regionals = Object.keys(groupedByRegional).sort();
          
          if (regionals.length === 0) {
            listText = "*(Tidak ada member dengan data tidak lengkap)*";
          } else {
            listText = regionals.map(reg => {
              const membersText = groupedByRegional[reg].map(m => {
                const statusStr = m.reasons.join(" & ");
                return `   - *${m.name}* (${statusStr})`;
              }).join("\n");
              return `*${reg}*\n${membersText}`;
            }).join("\n\n");
          }

          return `*⚠️ PENGUMUMAN PENTING & VERIFIKASI MEMBER J5 EVO INDONESIA ⚠️*

Yth. Rekan-rekan Member J5 EVO (Electric Vehicle Owner) Indonesia,

Dalam rangka pemeliharaan database keanggotaan nasional yang valid, tertib, dan akuntabel, kami mengimbau rekan-rekan di bawah ini untuk segera melakukan pembaruan data profiling mandiri pada website resmi J5 EVO.

Berikut adalah daftar member dengan rincian kekurangan data:

${listText}

*⚠️ TINDAKAN SEGERA DIWAJIBKAN:*
Harap segera masuk ke menu *Pencarian Member -> Edit Profil Mandiri* di aplikasi web resmi J5 EVO untuk mengunggah Foto Profil asli Anda dan mencantumkan 17 digit Nomor Rangka (Chassis) yang valid sesuai STNK.

*Bagi member yang tidak melakukan pembaruan atau melengkapi data, dengan sangat menyesal keanggotaan Anda akan di-nonaktifkan sementara dari keanggotaan resmi J5 EVO.*

Terima kasih atas kerja sama dan pengertiannya demi kerapihan dan keabsahan database komunitas kita bersama.

Salam kepengurusan,
*Admin J5 EVO Indonesia*`;
        };

        const warningMsg = buildWaText();

        const copyToClipboard = () => {
          navigator.clipboard.writeText(warningMsg);
          setCopiedWarning(true);
          setTimeout(() => setCopiedWarning(false), 2000);
        };

        const shareToWa = () => {
          const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(warningMsg)}`;
          window.open(waUrl, "_blank");
        };

        return (
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <ShieldAlert className="w-5 h-5 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-sans font-extrabold text-base text-zinc-900">
                    📢 Verifikasi Data Anggota Inkomplit &amp; Generator Peringatan WA
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    Saring otomatis berkas member yang tidak melampirkan foto profil asli atau nomor rangka tidak valid (bukan 17 digit).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-lg font-mono">
                  {incompleteList.length} Member Inkomplit
                </span>
              </div>
            </div>

            {incompleteList.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center space-y-1">
                <p className="text-emerald-800 font-extrabold text-sm">🎉 Luar Biasa! Semua Member 100% Lengkap &amp; Valid</p>
                <p className="text-[10.5px] text-emerald-600 font-medium">Tidak mendeteksi adanya member yang tidak melampirkan foto atau memiliki nomor rangka tidak valid.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* INCOMPLETE MEMBERS LIST */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-zinc-800 uppercase tracking-wider font-sans">
                    Daftar Anggota Bermasalah ({incompleteList.length}):
                  </p>
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {incompleteList.map((m) => (
                      <div key={m.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0 font-sans">
                          <img
                            src={m.ownerPhoto || m.carPhoto || "/logo.png"}
                            alt={m.name}
                            className="w-10 h-10 object-cover rounded-xl border border-zinc-250 shadow-2xs shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-950 truncate">{m.name}</p>
                            <p className="text-[9px] text-zinc-400 font-mono truncate">{m.regional}</p>
                            <p className="text-[9px] text-teal-700 font-semibold font-mono truncate">Plat: {m.plateNumber}</p>
                          </div>
                        </div>

                        {/* Badges reasons */}
                        <div className="text-right flex flex-col gap-1 shrink-0 font-sans">
                          {m.isPhotoMissing && (
                            <span className="px-2 py-0.5 bg-red-50 border border-red-100 text-red-700 text-[8.5px] rounded font-bold">
                              Tidak Ada Foto
                            </span>
                          )}
                          {m.isChassisInvalid && (
                            <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 text-[8.5px] rounded font-mono font-bold">
                              No Rangka Invalid
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WA MSG PREVIEW & TRIGGER */}
                <div className="space-y-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-800 uppercase tracking-wider font-sans">
                      Live Teks Pengumuman WA:
                    </p>
                    <span className="text-[9px] text-zinc-400 font-semibold">Teks akan disalin terformat</span>
                  </div>

                  <div className="flex-1 min-h-[220px] max-h-[280px] overflow-y-auto bg-zinc-950 text-zinc-300 p-4 rounded-2xl text-[10px] font-mono leading-relaxed select-all whitespace-pre-wrap border border-zinc-800 shadow-inner">
                    {warningMsg}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2 font-sans">
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-2xs text-xs cursor-pointer"
                    >
                      {copiedWarning ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600 animate-pulse" strokeWidth={3} />
                          <span className="text-emerald-700">Teks Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin Teks Peringatan</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={shareToWa}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Kirim ke Group WA</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        );
      })()}

      {/* Master Member list inside administrative workspace with Delete member action */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 text-left relative overflow-hidden">
        {localLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-30 flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-2xs font-mono font-bold text-teal-700 uppercase tracking-widest">Menyinkronkan...</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-sans font-bold text-base text-zinc-900">Daftar Member Komunitas Terdaftar</h4>
          <span className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-[#005c56] text-[10px] rounded font-mono font-bold self-start sm:self-auto">
            {searchQuery.trim() ? `Ditemukan ${totalMembers} member` : `${totalMembers} Member Terdaftar`}
          </span>
        </div>

        {/* Pencarian Member Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari berdasarkan nama, plat kendaraan, ID, HP/WA, regional, email, atau alamat..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 pl-9 pr-14 focus:outline-none focus:border-[#005c56] focus:bg-white text-xs font-semibold"
          />
          <div className="absolute left-3 top-2.5 text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2 top-1.5 text-[9px] bg-zinc-200 hover:bg-zinc-300 transition text-zinc-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
            >
              Hapus
            </button>
          )}
        </div>

        {localMembers.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6 font-medium">
            {searchQuery.trim() ? "Hasil pencarian tidak ditemukan." : "Belum ada database anggota terdaftar."}
          </p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {localMembers.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={m.ownerPhoto || m.carPhoto || "/logo.png"}
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

        {/* Pagination Action Controls */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-zinc-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-zinc-550">
            <span className="font-sans font-medium text-zinc-500">
              Menampilkan halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total <strong>{totalMembers}</strong> member)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100 transition disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer"
              >
                Sebelumnya
              </button>
              
              {/* Intelligent page numbers generation */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsisBefore && <span className="px-1.5 text-zinc-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded-lg transition flex items-center justify-center font-bold font-mono text-[11px] cursor-pointer ${
                          currentPage === p
                            ? "bg-[#005c56] text-white shadow-xs"
                            : "border border-zinc-200 text-zinc-700 hover:bg-zinc-55 hover:border-zinc-300"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100 transition disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
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
                  maxLength={17}
                  value={editMemberForm.chassisNumber || ""}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, chassisNumber: e.target.value.toUpperCase().replace(/\s+/g, "") })}
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

            {/* Kelola Galeri / Garasi Digital Member (Moderasi Admin) */}
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 mt-3 space-y-3 text-left">
              <span className="text-[10.5px] uppercase font-mono tracking-wider font-extrabold text-[#005c56] flex items-center gap-1">
                🛡️ Moderasi Garasi &amp; Galeri Member
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-[700] font-bold block">Nama Modifikasi EV</label>
                  <input
                    type="text"
                    value={editMemberForm.garageCarName || ""}
                    onChange={(e) => setEditMemberForm({ ...editMemberForm, garageCarName: e.target.value })}
                    placeholder="Contoh: Jaecoo J5 Edition"
                    className="w-full bg-white text-zinc-900 border border-[#005c56]/30 rounded-lg p-2.5 focus:outline-none focus:border-[#005c56] font-semibold"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-zinc-[700] font-bold block">Status Publikasi</label>
                  <div className="flex items-center gap-2 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editMemberForm.showInGarage}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, showInGarage: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                    <span className="font-semibold text-zinc-700">Tampilkan di Galeri Beranda</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs font-sans">
                <label className="text-zinc-[700] font-bold block">Deskripsi Modifikasi / Rincian Specs</label>
                <textarea
                  value={editMemberForm.garageDescription || ""}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, garageDescription: e.target.value })}
                  rows={2}
                  placeholder="Detail modifikasi..."
                  className="w-full bg-white text-zinc-900 border border-[#005c56]/30 rounded-lg p-2.5 focus:outline-none focus:border-[#005c56] font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <label className="text-zinc-[700] font-bold block-inline">Daftar Foto Galeri Member ({ (editMemberForm.garageImages || []).length } foto)</label>
                </div>

                {editMemberForm.garageImages && editMemberForm.garageImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {editMemberForm.garageImages.map((img: string, idx: number) => (
                      <div key={idx} className="relative aspect-video rounded-xl bg-zinc-100 overflow-hidden group border border-zinc-200">
                        <img
                          src={img}
                          alt={`Garasi Admin ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedImages = editMemberForm.garageImages.filter((_: any, i: number) => i !== idx);
                            let updatedCensorIndices = editMemberForm.censorPlateIndices || [];
                            updatedCensorIndices = updatedCensorIndices
                              .filter((id: number) => id !== idx)
                              .map((id: number) => (id > idx ? id - 1 : id));
                            
                            setEditMemberForm({
                              ...editMemberForm,
                              garageImages: updatedImages,
                              censorPlateIndices: updatedCensorIndices
                            });
                          }}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white font-extrabold text-[10px] uppercase gap-1"
                          title="Hapus foto ini"
                        >
                          <span className="bg-rose-600 px-2 py-1 rounded shadow-sm hover:bg-rose-700 transition">Hapus</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 italic">Member ini tidak memiliki foto di galeri / garasi digital.</p>
                )}
              </div>
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
