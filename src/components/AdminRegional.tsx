import React from "react";
import { Globe, Users, Pencil, Trash2 } from "lucide-react";
import { Member } from "../types";

interface AdminRegionalProps {
  regionals: string[];
  members: Member[];
  newRegionalName: string;
  setNewRegionalName: (v: string) => void;
  editingRegionalIndex: number | null;
  setEditingRegionalIndex: (v: number | null) => void;
  editingRegionalValue: string;
  setEditingRegionalValue: (v: string) => void;
  handleCreateRegional: (e: React.FormEvent) => void;
  handleUpdateRegional: (idx: number) => void;
  handleDeleteRegional: (idx: number) => void;
}

export default function AdminRegional({
  regionals,
  members,
  newRegionalName,
  setNewRegionalName,
  editingRegionalIndex,
  setEditingRegionalIndex,
  editingRegionalValue,
  setEditingRegionalValue,
  handleCreateRegional,
  handleUpdateRegional,
  handleDeleteRegional,
}: AdminRegionalProps) {
  const [selectedReg, setSelectedReg] = React.useState<string | null>(null);
  const [regMembers, setRegMembers] = React.useState<Member[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalMembers, setTotalMembers] = React.useState(0);
  const [localLoading, setLocalLoading] = React.useState(false);

  // Auto select first regional if none is selected
  React.useEffect(() => {
    if (regionals.length > 0 && !selectedReg) {
      setSelectedReg(regionals[0]);
    }
  }, [regionals, selectedReg]);

  const fetchRegMembers = React.useCallback(async (regionalName: string, page: number) => {
    try {
      setLocalLoading(true);
      // Fetch members specifically filtered by this regional name, including their photo attachments
      const url = `/api/members?regional=${encodeURIComponent(regionalName)}&page=${page}&limit=5`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRegMembers(data.members || []);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setTotalMembers(data.total || 0);
      }
    } catch (err) {
      console.error("Gagal memuat anggota regional resmi:", err);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // Synchronize listing on selected regional changes, current page, or prop database updates
  React.useEffect(() => {
    if (selectedReg) {
      fetchRegMembers(selectedReg, currentPage);
    } else {
      setRegMembers([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalMembers(0);
    }
  }, [selectedReg, currentPage, members, fetchRegMembers]);

  const handleSelectRegional = (reg: string) => {
    setSelectedReg(reg);
    setCurrentPage(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn text-xs">
      {/* Left Column: Manage Regional List (5 cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-teal-700" />
          <h4 className="font-sans font-bold text-base text-zinc-900 text-left">Tambah & Kelola Wilayah Regional</h4>
        </div>

        <form onSubmit={handleCreateRegional} className="space-y-3 text-xs text-left">
          <div className="space-y-1">
            <label className="text-zinc-[700] font-bold font-sans">Nama Regional Baru *</label>
            <input
              type="text"
              required
              placeholder="Contoh: J5 EVO - BALI"
              value={newRegionalName}
              onChange={(e) => setNewRegionalName(e.target.value)}
              className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-xs rounded-xl transition duration-350 shadow-sm uppercase cursor-pointer"
          >
            + Tambah Regional Baru
          </button>
        </form>

        <div className="space-y-3.5 border-t border-zinc-100 pt-4 text-left">
          <h5 className="text-xs font-bold font-sans text-zinc-805">Daftar Regional Komunitas</h5>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {regionals.map((reg, index) => {
              const count = members.filter((m) => m.regional === reg).length;
              const isEditing = editingRegionalIndex === index;
              const isSelected = selectedReg === reg;

              return (
                <div
                  key={index}
                  onClick={() => !isEditing && handleSelectRegional(reg)}
                  className={`p-3 border rounded-xl flex items-center justify-between gap-3 text-xs transition-all duration-200 ${
                    isEditing
                      ? "bg-zinc-50 border-zinc-200"
                      : isSelected
                      ? "bg-teal-50/40 border-teal-600 shadow-2xs ring-1 ring-teal-600/10 cursor-pointer"
                      : "bg-zinc-50 border border-zinc-200 hover:border-zinc-350 cursor-pointer"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingRegionalValue}
                        onChange={(e) => setEditingRegionalValue(e.target.value)}
                        className="bg-white border border-teal-300 p-1 rounded font-semibold text-xs flex-1 focus:outline-none text-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateRegional(index)}
                        className="px-2 py-1 bg-emerald-600 text-white font-semibold text-[10px] rounded"
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingRegionalIndex(null)}
                        className="px-2 py-1 bg-zinc-300 text-zinc-700 font-semibold text-[10px] rounded"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold truncate ${isSelected ? "text-teal-900" : "text-zinc-900"}`}>{reg}</p>
                        <span className="text-[10px] text-teal-800 font-bold bg-teal-50 border border-teal-150 px-1.5 py-0.5 rounded font-mono">
                          {count} Member
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRegionalIndex(index);
                            setEditingRegionalValue(reg);
                          }}
                          className="p-1.5 text-teal-650 hover:text-teal-900 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg cursor-pointer"
                          title="Edit nama regional"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRegional(index);
                          }}
                          className="p-1.5 text-red-650 hover:text-red-900 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg cursor-pointer"
                          title="Hapus regional"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: View members of selected Regional (7 cols) */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6 relative overflow-hidden">
        {localLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-30 flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-mono font-bold text-teal-700 uppercase tracking-widest">Sinkronisasi data...</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3 text-left">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            <div>
              <h4 className="font-sans font-bold text-base text-zinc-900">Pemetaan Anggota Regional</h4>
              <p className="text-2xs text-zinc-500 font-medium font-sans">Daftar anggota resmi J5 EVO yang tergabung dalam regional masing-masing.</p>
            </div>
          </div>
          {selectedReg && (
            <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-[#005c56] text-[10px] rounded-lg font-bold uppercase font-mono tracking-wider self-start sm:self-auto shadow-2xs">
              {selectedReg}
            </span>
          )}
        </div>

        <div className="space-y-4 text-left">
          {!selectedReg ? (
            <div className="py-12 text-center text-zinc-500 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
              <p className="text-xs font-semibold">Silakan pilih regional di sebelah kiri untuk melihat daftar anggota.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 space-y-2.5 min-h-[300px] bg-zinc-50/30 rounded-2xl border border-zinc-150">
                {regMembers.length === 0 ? (
                  <div className="py-16 text-center text-zinc-400">
                    <p className="text-xs italic font-medium">Belum ada anggota dipetakan ke regional ini.</p>
                  </div>
                ) : (
                  regMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 p-3 bg-white hover:bg-zinc-50/80 rounded-xl transition-all duration-150 border border-zinc-200 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.ownerPhoto || m.carPhoto || "/logo.png"}
                          alt={m.name}
                          className="w-10 h-12 object-cover rounded-xl border border-zinc-200 shrink-0 shadow-2xs"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 text-left space-y-1">
                          <p className="font-extrabold text-zinc-950 text-xs sm:text-sm truncate leading-tight">{m.name}</p>
                          <p className="text-3xs sm:text-2xs text-zinc-500 font-mono">
                            ID: <span className="font-bold text-zinc-700">{m.id}</span> | Plat: <span className="font-bold text-teal-800">{m.plateNumber}</span>
                          </p>
                          <p className="text-3xs text-zinc-400 font-sans">
                            HP: <span className="font-mono">{m.phone || "Tidak ada Telepon"}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-zinc-500">
                  <span className="font-sans font-medium text-zinc-500">
                    Menampilkan Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total <strong>{totalMembers}</strong> anggota)
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="px-2.5 py-1 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-medium cursor-pointer transition disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      Sebelumnya
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="px-2.5 py-1 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-medium cursor-pointer transition disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
