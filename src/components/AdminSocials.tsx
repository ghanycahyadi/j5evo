import React from "react";
import { Share2, CheckCircle2 } from "lucide-react";

interface AdminSocialsProps {
  editSocialsForm: any;
  setEditSocialsForm: React.Dispatch<React.SetStateAction<any>>;
  handleUpdateSocialsSubmit: (e: React.FormEvent) => void;
}

export default function AdminSocials({
  editSocialsForm,
  setEditSocialsForm,
  handleUpdateSocialsSubmit,
}: AdminSocialsProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 text-left font-sans text-xs">
      <div className="flex items-center gap-2 border-b pb-3 border-zinc-150">
        <Share2 className="w-5 h-5 text-teal-700 font-bold" />
        <h4 className="font-sans font-bold text-base text-zinc-900">Kelola Link & Tampilan Sosial Media</h4>
      </div>

      {editSocialsForm ? (
        <form onSubmit={handleUpdateSocialsSubmit} className="space-y-4 text-xs">
          <p className="text-zinc-[600] text-xs leading-relaxed">
            Aktifkan, ubah URL tautan, dan ubah username platform sosial media resmi J5 EVO Indonesia yang ditampilkan di Header / Hero utama.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(editSocialsForm).map((platformKey) => {
              const item = editSocialsForm[platformKey];
              return (
                <div key={platformKey} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#005c56] uppercase text-[10px] tracking-wider font-mono">
                      {item.name}
                    </span>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.show}
                        onChange={(e) => {
                          setEditSocialsForm({
                            ...editSocialsForm,
                            [platformKey]: { ...item, show: e.target.checked }
                          });
                        }}
                        className="rounded border-zinc-300 text-teal-650 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-zinc-700">Tampilkan</span>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-[600] font-sans text-2xs block">Nama akun/Handle</label>
                    <input
                      type="text"
                      required
                      value={item.handle || ""}
                      onChange={(e) => {
                        setEditSocialsForm({
                          ...editSocialsForm,
                          [platformKey]: { ...item, handle: e.target.value }
                        });
                      }}
                      className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-teal-500 text-xs font-semibold"
                      placeholder="@j5evo.id"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-[600] font-sans text-2xs block">Link URL</label>
                    <input
                      type="url"
                      required
                      value={item.url || ""}
                      onChange={(e) => {
                        setEditSocialsForm({
                          ...editSocialsForm,
                          [platformKey]: { ...item, url: e.target.value }
                        });
                      }}
                      className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-teal-500 text-xs font-semibold font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2 border-t border-zinc-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl hover:scale-102 active:scale-98 transition shadow-xs cursor-pointer uppercase flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simpan Konfigurasi Sosial Media</span>
            </button>
          </div>
        </form>
      ) : (
        <p className="text-zinc-500 font-medium py-3 text-xs text-center font-sans">
          Sedang memuat data konfigurasi sosial media...
        </p>
      )}
    </div>
  );
}
