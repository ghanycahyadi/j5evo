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
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {regionals.map((reg, index) => {
              const count = members.filter((m) => m.regional === reg).length;
              const isEditing = editingRegionalIndex === index;

              return (
                <div key={index} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1">
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
                        <p className="font-bold text-zinc-900 truncate">{reg}</p>
                        <span className="text-[10px] text-teal-800 font-bold bg-teal-50 border border-teal-150 px-1.5 rounded font-mono">
                          {count} Member
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
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
                          onClick={() => handleDeleteRegional(index)}
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
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 text-left">
          <Users className="w-5 h-5 text-teal-700" />
          <div>
            <h4 className="font-sans font-bold text-base text-zinc-900">Pemetaan Anggota Regional</h4>
            <p className="text-2xs text-zinc-500 font-medium font-sans">Daftar anggota resmi J5 EVO yang tergabung dalam regional masing-masing.</p>
          </div>
        </div>

        <div className="space-y-5 text-left">
          {regionals.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">Belum ada regional terdaftar.</p>
          ) : (
            <div className="space-y-4">
              {regionals.map((reg, index) => {
                const regMembers = members.filter((m) => m.regional === reg);
                
                return (
                  <div key={index} className="border border-zinc-200 rounded-2xl overflow-hidden text-xs">
                    <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200 flex justify-between items-center bg-gradient-to-r from-zinc-50/50 to-white">
                      <span className="font-black text-zinc-900 font-sans tracking-wide uppercase">{reg}</span>
                      <span className="px-2 py-0.5 bg-teal-50 border border-teal-150 rounded text-teal-850 font-mono font-bold text-[10px]">
                        {regMembers.length} Anggota Terdaftar
                      </span>
                    </div>

                    <div className="p-3.5 space-y-2.5 max-h-60 overflow-y-auto bg-white/40">
                      {regMembers.length === 0 ? (
                        <p className="text-2xs text-zinc-400 italic">Belum ada anggota dipetakan ke regional ini.</p>
                      ) : (
                        regMembers.map((m) => (
                          <div key={m.id} className="flex items-center justify-between gap-3 p-2 hover:bg-zinc-50/50 rounded-xl transition border border-dashed border-zinc-200">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={m.ownerPhoto || m.carPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                                alt={m.name}
                                className="w-8 h-10 object-cover rounded-lg border border-zinc-200 shrink-0 shadow-3xs"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0 text-left">
                                <p className="font-black text-zinc-950 text-xs truncate max-w-[150px]">{m.name}</p>
                                <p className="text-[10px] text-zinc-500 font-mono">ID: {m.id} | Plat: {m.plateNumber}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-zinc-100 text-zinc-700 rounded border">
                              {m.membershipTier || "SILVER"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
