import React, { useState, useEffect } from "react";
import { Shield, Key, UserPlus, Trash2, Pencil, CheckCircle, AlertCircle, Database, Image as ImageIcon, Cpu, Play, RefreshCw } from "lucide-react";
import { Member } from "../types";
import { compressImage } from "../utils";

interface AdminAccount {
  id: string;
  username: string;
  password?: string;
}

interface AdminManagerProps {
  currentUsername: string;
}

export default function AdminManager({ currentUsername }: AdminManagerProps) {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Form states map
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // States for database photo compression tool (Bebaskan Ruang Penyimpanan)
  const [scannedMembers, setScannedMembers] = useState<boolean>(false);
  const [bloatedMembers, setBloatedMembers] = useState<Member[]>([]);
  const [checkingDb, setCheckingDb] = useState<boolean>(false);
  const [optimizeLoading, setOptimizeLoading] = useState<boolean>(false);
  const [optimizeLogs, setOptimizeLogs] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [spaceSavedText, setSpaceSavedText] = useState<string>("");

  const scanDatabaseForBloat = async () => {
    try {
      setCheckingDb(true);
      setErrorMsg("");
      setSuccessMsg("");
      // Fetch all members with full data (including photos)
      const res = await fetch("/api/members?all=true&exclude_photos=false");
      if (res.ok) {
        const data: Member[] = await res.json();
        
        // Find members whose ownerPhoto is a base64 string AND length > 100,000 chars (approx > 75KB)
        const bloated = data.filter(
          (m) => m.ownerPhoto && m.ownerPhoto.startsWith("data:image/") && m.ownerPhoto.length > 100000
        );
        setBloatedMembers(bloated);
        setScannedMembers(true);
      } else {
        setErrorMsg("Gagal melakukan pemindaian data foto dari pangkalan data.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Koneksi gagal saat memindai pangkalan data.");
    } finally {
      setCheckingDb(false);
    }
  };

  const optimizeAllBloatedPhotos = async () => {
    if (bloatedMembers.length === 0) return;
    
    setOptimizeLoading(true);
    setOptimizeLogs(["[MULAI] Memulai proses kompresi & optimasi ukuran foto profil anggota..."]);
    setCurrentProgress(0);
    let curedCount = 0;
    let initialBytesCombined = 0;
    let compressedBytesCombined = 0;

    for (let i = 0; i < bloatedMembers.length; i++) {
      const member = bloatedMembers[i];
      const origSizeText = member.ownerPhoto ? member.ownerPhoto.length : 0;
      const origSizeKB = Math.round((origSizeText * 0.75) / 1024);
      initialBytesCombined += origSizeText * 0.75;

      setOptimizeLogs((prev) => [
        ...prev,
        `[Memproses] Anggota (${i + 1}/${bloatedMembers.length}): ${member.name} (Plat: ${member.plateNumber}) | Ukuran lama: ~${origSizeKB} KB...`
      ]);

      try {
        if (!member.ownerPhoto) throw new Error("File foto kosong");
        
        // Compress base64 to 600x600 JPEG, 0.82 quality
        const compressed = await compressImage(member.ownerPhoto, 600, 600, 0.82);
        const compSizeText = compressed.length;
        const compSizeKB = Math.round((compSizeText * 0.75) / 1024);
        compressedBytesCombined += compSizeText * 0.75;

        // PUT request to save back to database
        const saveRes = await fetch(`/api/members/${member.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerPhoto: compressed }),
        });

        if (saveRes.ok) {
          curedCount++;
          setOptimizeLogs((prev) => [
            ...prev,
            `  ✓ BERHASIL: Foto ${member.name} berhasil disusutkan dari ~${origSizeKB} KB menjadi ~${compSizeKB} KB! (Sirkulasi data menyusut ${Math.round((1 - compSizeText / origSizeText) * 100)}%)`
          ]);
        } else {
          compressedBytesCombined += origSizeText * 0.75; // fallback
          setOptimizeLogs((prev) => [
            ...prev,
            `  ✗ GAGAL: Respons server tidak valid saat menyimpan data ${member.name}.`
          ]);
        }
      } catch (err: any) {
        compressedBytesCombined += origSizeText * 0.75; // fallback
        setOptimizeLogs((prev) => [
          ...prev,
          `  ✗ EROR: Gagal memproses kompresi untuk ${member.name}. Error: ${err.message || String(err)}`
        ]);
        console.error(err);
      }

      // Update progress
      setCurrentProgress(Math.round(((i + 1) / bloatedMembers.length) * 100));
    }

    const savedBytes = initialBytesCombined - compressedBytesCombined;
    const mbSaved = Math.max(0, Math.round(savedBytes / 1024 / 1024 * 100) / 100);
    
    setOptimizeLogs((prev) => [
      ...prev,
      `[SELESAI] Semua proses kompresi berhasil diselesaikan!`,
      `[SISTEM] Berhasil memisahkan data & mengompres ${curedCount} dari ${bloatedMembers.length} foto anggota lama.`,
      `[HASIL] Kapasitas pangkalan data yang berhasil diselamatkan: ~${mbSaved} MegaBytes (MB) ! 🎉`
    ]);
    
    setSpaceSavedText(`Kompresi selesai! Total ruang pangkalan data dibebaskan: ~${mbSaved} MegaBytes (MB).`);
    setOptimizeLoading(false);
    
    // Clear targeted bloated lists
    setBloatedMembers([]);
    setSuccessMsg(`Berhasil mengompres ${curedCount} foto profil berukuran raksasa! Pangkalan data telah dioptimasikan sepenuhnya dan seluruh foto regional kini dapat dimuat secara instan.`);
  };

  // Load admins list from backend
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admins");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      } else {
        setErrorMsg("Gagal memuat dafar akun administrator.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Koneksi gagal saat memuat daftar admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleCreateOrUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!usernameInput.trim() || !passwordInput) {
      setErrorMsg("Username dan password tidak boleh kosong!");
      return;
    }

    try {
      if (editingId) {
        // UPDATE existing administrator account
        const res = await fetch(`/api/admins/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: usernameInput.trim(),
            password: passwordInput,
          }),
        });

        if (res.ok) {
          setSuccessMsg(`Berhasil memperbarui password / nama akun admin "${usernameInput.trim()}"!`);
          setEditingId(null);
          setUsernameInput("");
          setPasswordInput("");
          fetchAdmins();
        } else {
          const errData = await res.json();
          setErrorMsg(errData.error || "Gagal memperbarui akun admin.");
        }
      } else {
        // CREATE new administrator account
        const res = await fetch("/api/admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: usernameInput.trim(),
            password: passwordInput,
          }),
        });

        if (res.ok) {
          setSuccessMsg(`Berhasil menambahkan akun admin baru "${usernameInput.trim()}"!`);
          setUsernameInput("");
          setPasswordInput("");
          fetchAdmins();
        } else {
          const errData = await res.json();
          setErrorMsg(errData.error || "Gagal menambahkan akun admin.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menghubungi server untuk menyimpan akun admin.");
    }
  };

  const handleDeleteAdmin = async (id: string, name: string) => {
    clearMessages();

    if (name.toLowerCase() === currentUsername.toLowerCase()) {
      setErrorMsg("Kamu tidak bisa menghapus akun admin yang sedang aktif digunakan login!");
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun admin "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admins/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSuccessMsg(`Akun administrator "${name}" telah berhasil dihapus.`);
        fetchAdmins();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Gagal menghapus akun admin.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menghubungi server untuk menghapus akun admin.");
    }
  };

  return (
    <div id="admin-accounts-manager" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn text-xs">
      
      {/* LEFT COLUMN: Create/Edit Admin Account Form */}
      <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6 text-left">
        <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#005c56]" />
            <h4 className="font-sans font-bold text-base text-zinc-900">
              {editingId ? "Ubah Sandi / Nama Admin" : "Tambah Akun Administrator Baru"}
            </h4>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setUsernameInput("");
                setPasswordInput("");
                clearMessages();
              }}
              className="text-xs font-bold text-red-650 hover:underline cursor-pointer"
            >
              Batal
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 bg-red-50 p-3.5 rounded-xl border border-red-200 text-red-750 font-semibold leading-relaxed">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 bg-emerald-50 p-3.5 rounded-xl border border-emerald-250 text-emerald-800 font-semibold leading-relaxed">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateOrUpdateAdmin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-zinc-[700] font-bold block">Username Admin *</label>
            <input
              type="text"
              required
              disabled={editingId === "admin_default"} // prevent renaming original seed for safety
              placeholder="Contoh: admin_jawatengah"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-250 disabled:bg-zinc-150 disabled:cursor-not-allowed rounded-lg p-2.5 focus:outline-none focus:border-[#005c56] focus:bg-white text-xs font-semibold text-zinc-900 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-[700] font-bold block">
              {editingId ? "Kata Sandi Baru *" : "Kata Sandi Admin *"}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Masukkan password atau PIN rahasia..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-[#005c56] focus:bg-white text-xs font-semibold text-zinc-900 font-mono"
              />
              <Key className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-sm rounded-xl transition duration-300 shadow shadow-md uppercase cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>{editingId ? "Simpan Perubahan Password" : "Buat Akun Admin"}</span>
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: Admin Accounts List */}
      <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6 text-left">
        <div id="admin-list-header" className="flex items-center justify-between border-b pb-3 border-zinc-150">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-700" />
            <h4 className="font-sans font-bold text-base text-zinc-900">
              Daftar Administrator Resmi ({admins.length})
            </h4>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500 font-mono">
            Sedang mengambil daftar admin...
          </div>
        ) : admins.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            Gagal mengambil pangkalan data administrator.
          </p>
        ) : (
          <div className="space-y-3 max-h-[85vh] overflow-y-auto pr-1">
            {admins.map((acc) => (
              <div key={acc.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-4 transition hover:border-[#005c56]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#005c56]/10 text-[#005c56] flex items-center justify-center font-extrabold text-xs shrink-0">
                    {acc.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-900 text-xs font-mono">{acc.username}</h5>
                    <p className="text-[10px] text-zinc-400 font-mono select-all">Password: {acc.password || "••••••••"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(acc.id);
                      setUsernameInput(acc.username);
                      setPasswordInput(acc.password || "");
                      clearMessages();
                    }}
                    className="p-1.5 px-3 bg-white border border-zinc-200 hover:border-teal-300 text-teal-800 hover:bg-zinc-50 rounded-lg text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3 shrink-0" />
                    <span>Ubah Sandi</span>
                  </button>
                  {acc.id !== "admin_default" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAdmin(acc.id, acc.username)}
                      className="p-1.5 bg-red-50 border border-red-150 text-red-650 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                      title="Hapus Admin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SYSTEM UTILITY: Database Photo Optimization and Memory Rescue (Bebaskan Penyimpanan) */}
      <div id="database-photo-optimizer-rescue" className="lg:col-span-12 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6 text-left mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-zinc-150">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
              <Database className="w-5 h-5 shrink-0 animate-pulse" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-base text-zinc-900 leading-tight">Optimasi & Kompresor Foto Database</h4>
              <p className="text-[10px] text-zinc-500 font-medium font-sans max-w-2xl leading-relaxed">
                Deteksi dan kompres foto profil berukuran besar (hasil unggahan kamera asli) menjadi 600x600 JPG tajam. Mempersingkat waktu loading regional dan menghemat ruang server hingga 95%.
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={scanDatabaseForBloat}
            disabled={checkingDb || optimizeLoading}
            className="p-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 disabled:opacity-40 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto border border-zinc-200 shadow-3xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${checkingDb ? "animate-spin" : ""}`} />
            <span>{checkingDb ? "Memindai Database..." : "Pindai Ukuran Foto Database"}</span>
          </button>
        </div>

        {scannedMembers && (
          <div className="space-y-4 animate-fadeIn">
            {bloatedMembers.length === 0 ? (
              <div className="p-5 text-center text-zinc-500 border border-teal-200 bg-teal-50/20 rounded-2xl">
                <p className="text-xs font-bold text-[#005c56] flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-teal-600" />
                  <span>Kondisi Database Sangat Prima!</span>
                </p>
                <p className="text-[10px] text-zinc-500 font-sans mt-1">
                  Tidak ditemukan foto berukuran raksasa di pangkalan data saat ini. Seluruh foto profil sudah dikompres dengan sempurna.
                </p>
              </div>
            ) : (
              <div className="space-y-4 col-span-12">
                <div className="p-4 bg-amber-50/50 border border-amber-250 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-amber-805 flex items-center gap-2 text-amber-900">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                      <span>Terdeteksi {bloatedMembers.length} Anggota dengan Foto Belum Terkompresi</span>
                    </p>
                    <p className="text-[10px] text-amber-900/80 font-sans font-medium">
                      Satu atau lebih foto profil berukuran besar terdeteksi dalam data. Foto-foto ini berpotensi memperlambat browser dan panel pemetaan regional karena ukurannya yang belum dioptimasi menjadi 600x600 JPG tajam.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={optimizeAllBloatedPhotos}
                    disabled={optimizeLoading}
                    className="py-2.5 px-5 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-xs rounded-xl shadow-sm transition duration-150 cursor-pointer flex items-center gap-2 shrink-0 border border-teal-850"
                  >
                    <Cpu className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>Kompres Sekarang ({bloatedMembers.length} Unit)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {bloatedMembers.map((m) => {
                    const origLen = m.ownerPhoto ? m.ownerPhoto.length : 0;
                    const origSizeKB = Math.round((origLen * 0.75) / 1024);
                    return (
                      <div key={m.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={m.ownerPhoto}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900 truncate text-[11px] leading-snug">{m.name}</p>
                            <p className="text-[9px] text-[#005c56] font-mono leading-none tracking-tight">{m.plateNumber}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-red-650 bg-red-100/50 px-2 py-0.5 rounded-lg border border-red-200/50 shrink-0">
                          ~{origSizeKB} KB
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {(optimizeLoading || optimizeLogs.length > 0) && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold">
              <span className="flex items-center gap-1.5 text-zinc-700">
                <Cpu className={`w-3.5 h-3.5 shrink-0 ${optimizeLoading ? "animate-spin" : ""}`} />
                <span>Status Proses Optimasi</span>
              </span>
              <span className="font-mono">{currentProgress}% Selesai</span>
            </div>

            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#005c56] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${currentProgress}%` }}
              ></div>
            </div>

            <div className="bg-zinc-950 font-mono text-[10px] text-zinc-100 p-4 border border-zinc-900 rounded-xl max-h-56 overflow-y-auto space-y-1 text-left scrollbar-thin scrollbar-thumb-zinc-800">
              {optimizeLogs.map((log, index) => (
                <div key={index} className={log.startsWith("  ✓") ? "text-emerald-400" : log.startsWith("  ✗") ? "text-red-400" : "text-zinc-300"}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
