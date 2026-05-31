import React from "react";
import { CheckCircle2, UserCheck, Calendar } from "lucide-react";
import { CommunityEvent, EventRegistration } from "../types";

interface AdminAttendanceProps {
  events: CommunityEvent[];
  adminAttendanceEventId: string;
  setAdminAttendanceEventId: (id: string) => void;
  adminAttendanceQuery: string;
  setAdminAttendanceQuery: (q: string) => void;
  registrations: EventRegistration[];
  handleRecordAttendance: (e: React.FormEvent) => void;
  handleAttendanceChange: (id: string, currentStatus: string, newStatus: string) => void;
}

export default function AdminAttendance({
  events,
  adminAttendanceEventId,
  setAdminAttendanceEventId,
  adminAttendanceQuery,
  setAdminAttendanceQuery,
  registrations,
  handleRecordAttendance,
  handleAttendanceChange,
}: AdminAttendanceProps) {
  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Modul Kehadiran Member */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 text-left">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <h4 className="font-sans font-bold text-base text-zinc-900">Pencatatan Kehadiran Member (Scan Barcode / No Polisi)</h4>
        </div>
        <p className="text-zinc-650 text-xs leading-relaxed font-sans">
          Pindai Barcode Member ID (format: J5EVO-...) atau input langsung Nomor Plat Kendaraan (contoh: B 1111 XXX) untuk mendaftarkan dan memverifikasi Kehadiran Member pada kegiatan tertentu.
        </p>
        
        <form onSubmit={handleRecordAttendance} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-700 font-semibold font-sans">Pilih Kegiatan Touring Terkait *</label>
              <select
                required
                value={adminAttendanceEventId}
                onChange={(e) => setAdminAttendanceEventId(e.target.value)}
                className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-[#005c56] text-xs font-bold text-[#005c56] cursor-pointer"
              >
                <option value="">-- Pilih Kegiatan --</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.date})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-700 font-semibold font-sans">Plat Nomor / ID Member *</label>
              <input
                type="text"
                required
                placeholder="Contoh: B 1111 XXX atau J5EVO-202605-0002"
                value={adminAttendanceQuery}
                onChange={(e) => setAdminAttendanceQuery(e.target.value)}
                className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-[#005c56] text-xs font-mono font-bold uppercase placeholder:normal-case"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-xs rounded-xl transition duration-300 shadow-sm uppercase cursor-pointer"
          >
            Mulai Catat Kehadiran
          </button>
        </form>
      </div>

      {/* Registrations logs section */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-700" />
            <h4 className="font-sans font-bold text-base text-zinc-900">Lembar Monitoring & Kehadiran Peserta</h4>
          </div>
          <span className="px-2 py-0.5 bg-teal-50 border border-teal-150 text-[#005c56] text-[10px] rounded font-mono font-bold">
            {registrations.length} Pendaftar
          </span>
        </div>

        {registrations.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-8 font-medium">
            Belum ada partisipan yang masuk untuk mendaftar kegiatan apapun.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-3 pr-1 text-xs">
            {registrations.map((reg: any) => (
              <div
                key={reg.id}
                className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 text-sm">{reg.memberName}</span>
                    <span className="font-mono text-[#005c56] font-bold">({reg.memberPlate})</span>
                  </div>
                  <p className="text-zinc-700 font-semibold text-[10px]">
                    Tujuan: {reg.eventTitle}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Telp: {reg.memberPhone} | Terdaftar: {new Date(reg.registeredAt).toLocaleDateString("id-ID")}
                  </p>
                </div>

                {/* Quick Presence Status Switches for Admin */}
                <div className="space-y-1 text-right shrink-0">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAttendanceChange(reg.id, reg.status, "Attended")}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                        reg.status === "Attended"
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      }`}
                    >
                      HADIR
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(reg.id, reg.status, "Absent")}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                        reg.status === "Absent"
                          ? "bg-red-600 text-white"
                          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      }`}
                    >
                      ABSEN
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(reg.id, reg.status, "Registered")}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                        reg.status === "Registered"
                          ? "bg-zinc-400 text-white"
                          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      }`}
                    >
                      RESET
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
