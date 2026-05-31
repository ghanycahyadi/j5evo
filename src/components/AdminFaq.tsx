import React from "react";
import { HelpCircle, Trash2 } from "lucide-react";
import { FAQ } from "../types";

interface AdminFaqProps {
  faqs: FAQ[];
  adminFaqForm: {
    category: string;
    problem: string;
    solution: string;
    frequency: "High" | "Med" | "Low";
  };
  setAdminFaqForm: React.Dispatch<React.SetStateAction<any>>;
  handleCreateFaq: (e: React.FormEvent) => void;
  handleDeleteFaq: (id: string) => void;
  loading: boolean;
}

export default function AdminFaq({
  faqs,
  adminFaqForm,
  setAdminFaqForm,
  handleCreateFaq,
  handleDeleteFaq,
  loading,
}: AdminFaqProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 text-left font-sans text-xs">
      <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-700" />
          <h4 className="font-sans font-bold text-base text-zinc-900">Kelola Katalog FAQ &amp; Kendala Teknis</h4>
        </div>
        <span className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-[#005c56] text-[10px] rounded font-mono font-bold">
          {faqs.length} FAQ Terdaftar
        </span>
      </div>

      {/* Form to add new FAQ */}
      <form onSubmit={handleCreateFaq} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4 text-xs">
        <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#005c56] block">
          + Tambah Item FAQ Baru
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-zinc-[700] font-bold font-sans">Kategori FAQ *</label>
            <select
              required
              value={adminFaqForm.category}
              onChange={(e) => setAdminFaqForm({ ...adminFaqForm, category: e.target.value })}
              className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold"
            >
              <option value="Setir & Pengendalian">Setir &amp; Pengendalian</option>
              <option value="Pengereman & Traksi">Pengereman &amp; Traksi</option>
              <option value="Eksterior & Bodi">Eksterior &amp; Bodi</option>
              <option value="Baterai & Pengisian">Baterai &amp; Pengisian</option>
              <option value="ADAS & Sensor">ADAS &amp; Sensor</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-750 font-bold font-sans">Sifat / Frekuensi Kejadian *</label>
            <select
              required
              value={adminFaqForm.frequency}
              onChange={(e) => setAdminFaqForm({ ...adminFaqForm, frequency: e.target.value as any })}
              className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold"
            >
              <option value="High">Tinggi (High / Terbanyak)</option>
              <option value="Med">Sedang (Med / Sedang)</option>
              <option value="Low">Rendah (Low / Kasus Khusus)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-zinc-700 font-bold font-sans">Deskripsi Kendala/Masalah *</label>
          <textarea
            required
            rows={2}
            placeholder="Uraikan kendala yang dialami member... (e.g. Bunyi steering rack saat putar stir mentok)"
            value={adminFaqForm.problem}
            onChange={(e) => setAdminFaqForm({ ...adminFaqForm, problem: e.target.value })}
            className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-[#005c56] text-xs font-semibold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-zinc-700 font-bold font-sans">Solusi & Tindakan Perbaikan *</label>
          <textarea
            required
            rows={3}
            placeholder="Jelaskan langkah investigasi atau solusi perbaikan permanen..."
            value={adminFaqForm.solution}
            onChange={(e) => setAdminFaqForm({ ...adminFaqForm, solution: e.target.value })}
            className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-[#005c56] text-xs font-semibold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-xs rounded-lg transition shadow-xs uppercase cursor-pointer"
        >
          {loading ? "Sedang Menyimpan..." : "Simpan & Publikasikan FAQ"}
        </button>
      </form>

      {/* List of current FAQs with Delete action */}
      <div className="space-y-3 pt-4">
        <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-teal-800 block border-b border-zinc-150 pb-1 font-bold">
          Daftar Item FAQ Terdaftar (Hapus)
        </span>

        {faqs.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4 font-sans font-medium">Belum ada FAQ terdata.</p>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {faqs.map((f: any, index: number) => (
              <div
                key={f.id || index}
                className="p-3 rounded-xl bg-zinc-50 border border-zinc-205 flex items-start justify-between gap-3 text-xs text-left"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 bg-teal-50 border border-teal-150 text-[9px] font-mono font-bold text-teal-800 rounded">
                      {f.category}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {f.frequency === "High" ? "🔴 Tinggi" : f.frequency === "Med" ? "🟡 Sedang" : "🔵 Rendah"}
                    </span>
                  </div>
                  <p className="font-bold text-zinc-900 leading-snug line-clamp-1">{f.problem}</p>
                  <p className="text-[10px] text-zinc-550 leading-relaxed line-clamp-1 font-medium italic">{f.solution}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteFaq(f.id)}
                  className="p-2 text-red-650 hover:text-white bg-red-50 hover:bg-red-600 border border-red-100 rounded-lg transition duration-200 cursor-pointer flex-shrink-0"
                  title="Hapus FAQ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
