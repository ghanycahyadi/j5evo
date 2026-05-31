import React from "react";
import { Award, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Sponsor } from "../types";

interface AdminSponsorsProps {
  sponsors: Sponsor[];
  sponsorForm: {
    name: string;
    contact: string;
    logo: string;
    description: string;
    products: any[];
  };
  setSponsorForm: React.Dispatch<React.SetStateAction<any>>;
  tempProduct: {
    name: string;
    photos: string[];
    price: number;
    showPrice: boolean;
  };
  setTempProduct: React.Dispatch<React.SetStateAction<any>>;
  editingSponsorId: string | null;
  setEditingSponsorId: (id: string | null) => void;
  handleSaveSponsor: (e: React.FormEvent) => void;
  handleDeleteSponsor: (id: string, name: string) => void;
  handleProductPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addStagedProduct: () => void;
  removeStagedProduct: (idx: number) => void;
  compressImage: (fileOrBase64: File | string, maxW?: number, maxH?: number, qual?: number) => Promise<string>;
}

export default function AdminSponsors({
  sponsors,
  sponsorForm,
  setSponsorForm,
  tempProduct,
  setTempProduct,
  editingSponsorId,
  setEditingSponsorId,
  handleSaveSponsor,
  handleDeleteSponsor,
  handleProductPhotoUpload,
  addStagedProduct,
  removeStagedProduct,
  compressImage,
}: AdminSponsorsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn text-xs">
      {/* Left Column: Form Add/Edit Sponsor (6 cols) */}
      <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6 text-left">
        <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h4 className="font-sans font-bold text-base text-zinc-900">
              {editingSponsorId ? "Edit Partner Sponsor J5" : "Daftarkan Sponsor & Mitra Baru"}
            </h4>
          </div>
          {editingSponsorId && (
            <button
              type="button"
              onClick={() => {
                setEditingSponsorId(null);
                setSponsorForm({ name: "", contact: "", logo: "", description: "", products: [] });
              }}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSaveSponsor} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-[700] font-bold block">Nama Sponsor *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Hankook Tire Indonesia"
                value={sponsorForm.name || ""}
                onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold text-zinc-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-[700] font-bold block">Kontak Sponsor / WA *</label>
              <input
                type="text"
                required
                placeholder="Contoh: +62 812..."
                value={sponsorForm.contact || ""}
                onChange={(e) => setSponsorForm({ ...sponsorForm, contact: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold text-zinc-900 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-[700] font-bold block">Logo Brand Sponsor</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  try {
                    const base = await compressImage(f, 300, 300, 0.85);
                    setSponsorForm({ ...sponsorForm, logo: base });
                  } catch (err) {
                    console.error("Logo compression failed", err);
                  }
                }
              }}
              className="w-full border p-1 rounded-lg text-xs cursor-pointer bg-zinc-50"
            />
            {sponsorForm.logo && (
              <img src={sponsorForm.logo} className="w-16 h-16 object-contain p-1 border rounded bg-zinc-50 mt-1.5 shadow-2xs" alt="Sponsor logo" referrerPolicy="no-referrer" />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-zinc-[700] font-bold block">Deskripsi Sponsor</label>
            <textarea
              rows={2}
              placeholder="Sebutkan benefit khusus member J5 EVO (Diskon aksesoris, voucher, dll)..."
              value={sponsorForm.description || ""}
              onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold text-zinc-900"
            />
          </div>

          {/* Staged Products Management Sub-Form */}
          <div className="border border-teal-100 rounded-2xl p-4 bg-teal-50/20 space-y-4">
            <span className="font-black text-teal-850 text-[10px] tracking-wider uppercase font-mono block">
              + Tambah Produk Jualan Ke Sponsor Ini (Multiple)
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-zinc-650 block">Nama Produk</label>
                <input
                  type="text"
                  placeholder="Velg Sport Jaecoo J5 18\"
                  value={tempProduct.name || ""}
                  onChange={(e) => setTempProduct({ ...tempProduct, name: e.target.value })}
                  className="w-full bg-white border border-zinc-250 p-2 rounded-lg text-xs text-zinc-905"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-650 block">Harga Produk (IDR)</label>
                <input
                  type="number"
                  placeholder="2500000"
                  value={tempProduct.price || ""}
                  onChange={(e) => setTempProduct({ ...tempProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-zinc-250 p-2 rounded-lg text-xs text-zinc-905 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-zinc-200">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempProduct.showPrice}
                  onChange={(e) => setTempProduct({ ...tempProduct, showPrice: e.target.checked })}
                  className="rounded border-zinc-300 text-teal-650 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-zinc-700">Tampilkan Harga di Publik</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-medium">Jika tidak dicap, harga akan tampil sebagai "Hubungi Sponsor"</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-650 block">Foto Produk (Bisa Pilih Beberapa)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleProductPhotoUpload}
                className="w-full p-1 bg-white border border-zinc-200 rounded-lg text-xs cursor-pointer text-zinc-650"
              />
              {tempProduct.photos && tempProduct.photos.length > 0 && (
                <div className="flex gap-2 p-2 bg-white rounded border border-zinc-150 overflow-x-auto">
                  {tempProduct.photos.map((src, i) => (
                    <div key={i} className="relative w-12 h-12 rounded border bg-zinc-50 overflow-hidden grow-0 shrink-0 shadow-3xs">
                      <img src={src} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setTempProduct(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))}
                        className="absolute top-0 right-0 bg-red-600 text-white text-[8px] leading-none px-1 rounded-bl font-sans"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addStagedProduct}
              className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-bold text-2xs uppercase tracking-wider transition shadow-3xs"
            >
              ✔ Masukkan Produk Ke Daftar
            </button>
          </div>

          {/* Staged products list */}
          {sponsorForm.products && sponsorForm.products.length > 0 && (
            <div className="space-y-2 border-t border-zinc-100 pt-3 text-left">
              <h5 className="font-bold text-zinc-805 text-xs font-sans uppercase tracking-wide">
                Katalog Produk Disiapkan ({sponsorForm.products.length})
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {sponsorForm.products.map((p, idx) => (
                  <div key={idx} className="p-3 bg-zinc-50 border border-zinc-205 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 pr-1">
                      <p className="font-bold text-zinc-900 truncate">{p.name}</p>
                      <p className="font-mono text-[10px] text-teal-800 font-bold mt-0.5">
                        {p.showPrice ? `Rp ${p.price.toLocaleString("id-ID")}` : "Harga disembunyikan"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStagedProduct(idx)}
                      className="text-red-650 hover:text-red-900 hover:underline text-[10px] font-black shrink-0 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-sm rounded-xl transition duration-300 shadow shadow-md uppercase cursor-pointer"
          >
            {editingSponsorId ? "Simpan Perubahan Sponsor" : "Simpan & Daftarkan Sponsor Baru"}
          </button>
        </form>
      </div>

      {/* Right Column: List of registered Sponsors (6 cols) */}
      <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6 text-left">
        <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-700" />
            <h4 className="font-sans font-bold text-base text-zinc-900">
              Mitra Sponsor Aktif ({sponsors.length})
            </h4>
          </div>
        </div>

        {sponsors.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            Belum ada mitra ko-sponsor resmi yang terdaftar di pangkalan data J5 EVO.
          </p>
        ) : (
          <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
            {sponsors.map((spr) => (
              <div key={spr.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3.5 transition hover:border-teal-400">
                <div className="flex gap-3 items-center justify-between">
                  <div className="flex gap-2.5 items-center min-w-0">
                    {spr.logo ? (
                      <img src={spr.logo} className="w-11 h-11 object-contain p-1 rounded-xl bg-white border border-zinc-200" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-teal-800 text-white flex items-center justify-center font-extrabold text-xs shrink-0 font-mono">
                        {spr.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h5 className="font-bold text-zinc-900 truncate text-xs">{spr.name}</h5>
                      <p className="text-[10px] text-teal-800 font-mono mt-0.5 font-bold">Contact: {spr.contact || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSponsorId(spr.id);
                        setSponsorForm({
                          name: spr.name || "",
                          contact: spr.contact || "",
                          logo: spr.logo || "",
                          description: spr.description || "",
                          products: spr.products || []
                        });
                      }}
                      className="p-1.5 px-3 bg-white border border-zinc-200 hover:border-teal-300 text-teal-800 hover:bg-zinc-50 rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSponsor(spr.id, spr.name)}
                      className="p-1.5 px-3 bg-red-50 border border-red-150 text-red-650 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {spr.description && (
                  <p className="text-[10px] text-zinc-650 leading-relaxed bg-white/70 p-2.5 border border-zinc-150 rounded-xl font-medium">
                    {spr.description}
                  </p>
                )}

                {spr.products && spr.products.length > 0 && (
                  <div className="space-y-1.5 border-t border-zinc-200/60 pt-2.5 text-left">
                    <span className="text-[9px] font-mono tracking-widest text-zinc-400 block uppercase font-bold">PRODUK TERPASANG ({spr.products.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {spr.products.map((p: any, i: number) => (
                        <span key={i} className="text-[9px] bg-white border border-zinc-200 px-2 py-0.5 rounded-full font-sans text-zinc-650 leading-none">
                          {p.name} {p.showPrice ? `(Rp ${p.price.toLocaleString("id-ID")})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
