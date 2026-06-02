import React, { useState, useEffect } from "react";
import { Shield, Key, UserPlus, Trash2, Pencil, CheckCircle, AlertCircle } from "lucide-react";

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
    </div>
  );
}
