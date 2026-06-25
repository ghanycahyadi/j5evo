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

      {/* Section Cetak QR Code Presensi Kegiatan */}
      {adminAttendanceEventId && (
        (() => {
          const selectedEvent = events.find((e) => e.id === adminAttendanceEventId);
          if (!selectedEvent) return null;

          const attendanceUrl = `${window.location.origin}/beranda?absen_event=${selectedEvent.id}`;
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(attendanceUrl)}`;

          return (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 text-left animate-fadeIn">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#005c56]" />
                <h4 className="font-sans font-bold text-base text-zinc-900">QR Code Presensi Mandiri Member</h4>
              </div>
              <p className="text-zinc-650 text-xs leading-relaxed font-sans">
                Tampilkan QR Code ini di tablet/layar proyektor saat acara berlangsung, atau cetak lembar QR di bawah agar member bisa melakukan <strong>Absen Mandiri</strong> menggunakan handphone mereka masing-masing tanpa antre di meja panitia.
              </p>

              <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-150">
                <div id="printable-qr-card" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm text-center max-w-[280px] w-full flex-shrink-0 flex flex-col items-center justify-center space-y-3">
                  <div className="text-[10px] font-mono font-black text-[#005c56] tracking-widest uppercase">J5 EVO INDONESIA</div>
                  <div className="border border-zinc-100 p-2.5 rounded-xl bg-white shadow-xs">
                    <img
                      src={qrCodeUrl}
                      alt="Presence QR Code"
                      className="w-40 h-40 object-contain mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-sans font-bold text-zinc-900 leading-snug">{selectedEvent.title}</div>
                    <div className="text-[9px] font-mono text-zinc-500">{selectedEvent.date}</div>
                  </div>
                  <div className="text-[8px] font-sans font-medium text-zinc-400 max-w-[180px]">
                    Pindai dengan kamera HP untuk presensi mandiri
                  </div>
                </div>

                <div className="space-y-3 flex-1 text-xs text-left">
                  <h5 className="font-sans font-bold text-zinc-800 text-sm">Informasi QR Presensi:</h5>
                  <div className="space-y-1.5 font-sans text-zinc-600">
                    <p className="flex items-start gap-1.5">
                      <span className="text-[#005c56] font-bold">1.</span>
                      <span>URL Tujuan: <code className="bg-zinc-150 px-1 py-0.5 rounded text-[10px] font-mono break-all text-[#005c56]">{attendanceUrl}</code></span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="text-[#005c56] font-bold">2.</span>
                      <span>Member tidak perlu login admin, cukup memasukkan Plat Nomor Kendaraan &amp; PIN 6 Digit mereka saja.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="text-[#005c56] font-bold">3.</span>
                      <span>Cetak QR ini untuk diletakkan di meja registrasi masuk kegiatan.</span>
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const printWindow = window.open("", "_blank");
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Cetak QR Absen - ${selectedEvent.title}</title>
                                <style>
                                  body {
                                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    height: 100vh;
                                    margin: 0;
                                    background: #f4f4f5;
                                  }
                                  .card {
                                    background: white;
                                    padding: 40px;
                                    border-radius: 24px;
                                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                                    text-align: center;
                                    max-width: 400px;
                                    border: 2px solid #e4e4e7;
                                  }
                                  .brand {
                                    font-size: 14px;
                                    font-weight: 900;
                                    letter-spacing: 2px;
                                    color: #005c56;
                                    text-transform: uppercase;
                                    margin-bottom: 20px;
                                  }
                                  .qr-wrapper {
                                    background: #ffffff;
                                    padding: 15px;
                                    border-radius: 16px;
                                    display: inline-block;
                                    border: 1px solid #e4e4e7;
                                    margin-bottom: 20px;
                                  }
                                  .qr-image {
                                    width: 250px;
                                    height: 250px;
                                  }
                                  .title {
                                    font-size: 18px;
                                    font-weight: 800;
                                    color: #18181b;
                                    margin: 0 0 8px 0;
                                    line-height: 1.4;
                                  }
                                  .meta {
                                    font-size: 12px;
                                    font-family: monospace;
                                    color: #71717a;
                                    margin-bottom: 15px;
                                  }
                                  .instruction {
                                    font-size: 11px;
                                    color: #a1a1aa;
                                    font-weight: 500;
                                  }
                                  @media print {
                                    body {
                                      background: white;
                                    }
                                    .card {
                                      box-shadow: none;
                                      border: none;
                                      padding: 0;
                                    }
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="card">
                                  <div class="brand">J5 EVO INDONESIA</div>
                                  <div class="qr-wrapper">
                                    <img class="qr-image" src="${qrCodeUrl}" alt="QR" />
                                  </div>
                                  <h1 class="title">${selectedEvent.title}</h1>
                                  <div class="meta">TANGGAL: ${selectedEvent.date} | TEMPAT: ${selectedEvent.location || "Lokasi Acara"}</div>
                                  <div class="instruction">PINDAI QR UNTUK MELAKUKAN PRESENSI MANDIRI</div>
                                </div>
                                <script>
                                  window.onload = function() {
                                    window.print();
                                  };
                                </script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                      className="px-4 py-2 bg-[#005c56] hover:bg-[#004843] text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer inline-flex items-center gap-1"
                    >
                      Cetak QR Code (Print)
                    </button>
                    <a
                      href={qrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xs rounded-lg transition cursor-pointer inline-flex items-center gap-1 text-center"
                    >
                      Unduh QR Code (Buka Gambar)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}

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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-900 text-sm">{reg.memberName}</span>
                    <span className="font-mono text-[#005c56] font-bold">({reg.memberPlate})</span>
                    <span className="font-mono text-[9px] font-bold text-amber-850 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/50 uppercase select-none shrink-0">
                      {reg.pax ? `${reg.pax} PAX` : "1 PAX"}
                    </span>
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
