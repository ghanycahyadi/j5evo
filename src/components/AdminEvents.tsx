import React, { useState } from "react";
import { Calendar, Pencil, Trash2, X, PlusCircle, CheckCircle2, Share2, Copy } from "lucide-react";
import { CommunityEvent, Member, EventRegistration } from "../types";

interface AdminEventsProps {
  events: CommunityEvent[];
  members: Member[];
  registrations: EventRegistration[];
  newEvent: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    slots: number;
    image: string;
  };
  setNewEvent: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  editingEventId: string | null;
  setEditingEventId: (id: string | null) => void;
  editEventForm: any | null;
  setEditEventForm: React.Dispatch<React.SetStateAction<any>>;
  handleCreateEvent: (e: React.FormEvent) => void;
  handleEditEventSubmit: (e: React.FormEvent) => void;
  handleDeleteEvent: (id: string, title: string) => void;
  startEditingEvent: (evt: CommunityEvent) => void | Promise<void>;
  compressImage: (fileOrBase64: File | string, maxW?: number, maxH?: number, qual?: number) => Promise<string>;
}

export default function AdminEvents({
  events,
  members,
  registrations,
  newEvent,
  setNewEvent,
  loading,
  editingEventId,
  setEditingEventId,
  editEventForm,
  setEditEventForm,
  handleCreateEvent,
  handleEditEventSubmit,
  handleDeleteEvent,
  startEditingEvent,
  compressImage,
}: AdminEventsProps) {
  const [shareCopied, setShareCopied] = useState(false);

  const generateShareMessage = (evtId: string, form: any) => {
    const eventTitle = form.title || "Kegiatan J5 EVO";
    const eventDate = form.date || "-";
    const eventTime = form.time || "-";
    const eventLocation = form.location || "-";
    const eventDesc = form.description || "";
    
    const curRegs = registrations.filter((r) => r.eventId === evtId);
    const totalPaxSum = curRegs.reduce((acc, r) => acc + (r.pax || 1), 0);
    
    let participantText = "";
    if (curRegs.length === 0) {
      participantText = "_(Belum ada peserta yang mendaftar)_";
    } else {
      participantText = curRegs.map((reg, idx) => {
        const mb = members.find((m) => m.id === reg.memberId);
        const name = mb ? mb.name.toUpperCase() : "Anggota J5 EVO";
        const plate = mb ? mb.plateNumber.toUpperCase() : "-";
        const paxCount = reg.pax || 1;
        return `${idx + 1}. ${name} - ${plate} (${paxCount} PAX)`;
      }).join("\n");
    }

    return `📢 *INFORMASI KEGIATAN KOMUNITAS J5 EVO* 📢

*${eventTitle.toUpperCase()}*

📅 *Tanggal:* ${eventDate}
🕒 *Waktu:* ${eventTime}
📍 *Lokasi:* ${eventLocation}

📝 *Agenda & Keterangan:*
${eventDesc}

---
👥 *Daftar Peserta Terdaftar (${curRegs.length} Mobil / ${totalPaxSum} Pax):*
${participantText}

---
Ayo rekan-rekan J5 EVO segera bergabung dan daftarkan diri Anda di aplikasi web J5 EVO! 🚗💨`;
  };

  const handleShareToWhatsApp = (evtId: string, form: any) => {
    const message = generateShareMessage(evtId, form);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const handleCopyToClipboard = (evtId: string, form: any) => {
    const message = generateShareMessage(evtId, form);
    navigator.clipboard.writeText(message);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* 1. Kelola & Daftar Kegiatan Komunitas Card */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-700" />
            <h4 className="font-sans font-bold text-base text-zinc-900">Daftar & Kelola Kegiatan Komunitas</h4>
          </div>
          <span className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-[#005c56] text-[10px] rounded font-mono font-bold">
            {events.length} Kegiatan Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((evt) => (
            <div key={evt.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-teal-400 transition flex gap-3 items-center">
              <img
                src={evt.image || "/event_banner.jpeg"}
                alt={evt.title}
                className="w-16 h-16 rounded-xl object-cover border border-zinc-200 flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className={`px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase rounded ${
                    evt.status === "upcoming" ? "bg-blue-100 text-blue-800" :
                    evt.status === "ongoing" ? "bg-amber-100 text-amber-800" :
                    "bg-zinc-200 text-zinc-700"
                  }`}>
                    {evt.status === "upcoming" ? "Mendatang" : evt.status === "ongoing" ? "Berjalan" : "Selesai"}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    📷 {evt.galleryImages?.length || 0} Foto
                  </span>
                </div>
                <h5 className="text-xs font-black text-zinc-900 truncate mt-1">{evt.title}</h5>
                <p className="text-[10px] text-zinc-500 font-medium truncate">📍 {evt.location}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => startEditingEvent(evt)}
                  className="px-2 py-1 bg-teal-50 hover:bg-[#005c56] text-[#005c56] hover:text-white border border-teal-200 rounded-lg text-[9px] font-bold transition flex-shrink-0 cursor-pointer shadow-3xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(evt.id, evt.title)}
                  className="px-2 py-1 bg-red-55 hover:bg-red-650 text-red-656 hover:text-white border border-red-200 rounded-lg text-[9px] font-bold transition flex-shrink-0 cursor-pointer shadow-3xs"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Selected Event Editor Panel */}
      {editingEventId && editEventForm && (
        <div id="editor-section-anchor" className="bg-white p-6 md:p-8 rounded-3xl border border-teal-200 shadow-md space-y-6 animate-fadeIn relative text-left">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              setEditingEventId(null);
              setEditEventForm(null);
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition text-zinc-500 hover:text-zinc-805 border border-zinc-200 cursor-pointer"
            title="Selesai Edit"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 border-b border-teal-100 pb-3">
            <Pencil className="w-5 h-5 text-[#005c56]" />
            <div>
              <h4 className="font-sans font-bold text-base text-zinc-900">Program Kelola &amp; Rincian Kegiatan</h4>
              <p className="text-2xs text-[#005c56] font-mono font-bold">ID: {editingEventId}</p>
            </div>
          </div>

          <form onSubmit={handleEditEventSubmit} className="space-y-6 text-xs text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-zinc-[700] font-bold block">Nama Kegiatan *</label>
                  <input
                    type="text"
                    required
                    value={editEventForm.title || ""}
                    onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold text-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-[700] font-bold block">Tanggal Pelaksanaan *</label>
                    <input
                      type="date"
                      required
                      value={editEventForm.date || ""}
                      onChange={(e) => setEditEventForm({ ...editEventForm, date: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold text-zinc-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-[700] font-bold block">Waktu / Jam *</label>
                    <input
                      type="text"
                      required
                      value={editEventForm.time || ""}
                      onChange={(e) => setEditEventForm({ ...editEventForm, time: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold text-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-[700] font-bold block">Lokasi Titik Kumpul *</label>
                  <input
                    type="text"
                    required
                    value={editEventForm.location || ""}
                    onChange={(e) => setEditEventForm({ ...editEventForm, location: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold text-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-[700] font-bold block">Kuota Maksimum Peserta *</label>
                    <input
                      type="number"
                      required
                      value={editEventForm.slots || 100}
                      onChange={(e) => setEditEventForm({ ...editEventForm, slots: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold text-zinc-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-[700] font-bold block">Status Kegiatan</label>
                    <select
                      value={editEventForm.status || "upcoming"}
                      onChange={(e) => setEditEventForm({ ...editEventForm, status: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-extrabold text-[#005c56] cursor-pointer"
                    >
                      <option value="upcoming">MENDA TANG (Upcoming)</option>
                      <option value="ongoing">BERJALAN (Ongoing)</option>
                      <option value="completed">SELESAI (Completed)</option>
                    </select>
                  </div>
                </div>

                {/* Cover Banner Image Edit */}
                <div className="space-y-1 border border-zinc-200 bg-zinc-50 p-4 rounded-2xl shadow-3xs">
                  <label className="text-zinc-[700] font-bold block mb-1">Cover Event Image J5</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const reader = new FileReader();
                          const promise = new Promise<string>((res) => {
                            reader.onload = () => res(reader.result as string);
                          });
                          reader.readAsDataURL(file);
                          const b64 = await promise;
                          const compressed = await compressImage(b64);
                          setEditEventForm({ ...editEventForm, image: compressed });
                        } catch (err) {
                          console.error("Cover image loading failed in editor:", err);
                        }
                      }
                    }}
                    className="w-full border border-dashed border-zinc-250 bg-white p-2.5 rounded-lg focus:outline-none cursor-pointer hover:border-teal-500 text-[10px] font-semibold text-zinc-500"
                  />
                  {editEventForm.image && (
                    <div className="mt-2.5 relative w-36 aspect-video rounded-xl border border-zinc-200 overflow-hidden shadow-3xs">
                      <img
                        src={editEventForm.image}
                        alt="Event Cover Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-zinc-950/75 text-white text-[8px] rounded font-mono font-bold uppercase select-none">Cover Aktif</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-zinc-[700] font-bold block">Deskripsi & Agenda Touring *</label>
                  <textarea
                    required
                    rows={3}
                    value={editEventForm.description || ""}
                    onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-semibold text-zinc-900 leading-relaxed"
                  />
                </div>

                <div className="space-y-2 border border-zinc-200 rounded-2xl p-4 bg-zinc-50 shadow-3xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-zinc-750 font-mono tracking-wider uppercase block">
                      LAMPIRAN FOTO DOKUMENTASI (CMS {editEventForm.galleryImages?.length || 0})
                    </span>
                    <label className="cursor-pointer text-[#005c56] hover:underline font-bold text-[10px] font-sans">
                      + Tambah Foto
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files) return;
                          const orig = editEventForm.galleryImages || [];
                          const updated = [...orig];
                          for (let i = 0; i < files.length; i++) {
                            try {
                              const rdr = new FileReader();
                              const p = new Promise<string>((res) => {
                                rdr.onload = () => res(rdr.result as string);
                              });
                              rdr.readAsDataURL(files[i]);
                              const b64 = await p;
                              const compressed = await compressImage(b64);
                              updated.push(compressed);
                            } catch (err) {
                              console.error("Compression failed:", err);
                            }
                          }
                          setEditEventForm({ ...editEventForm, galleryImages: updated });
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                    Foto di bawah ini akan tampil sebagai Slide Album/Galeri di Beranda bagi semua member.
                  </p>

                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pt-2">
                    {editEventForm.galleryImages && editEventForm.galleryImages.map((img: string, idx: number) => (
                      <div key={idx} className="relative aspect-video rounded-lg border overflow-hidden bg-zinc-150 group">
                        <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...(editEventForm.galleryImages || [])];
                            updated.splice(idx, 1);
                            setEditEventForm({ ...editEventForm, galleryImages: updated });
                          }}
                          className="absolute inset-0 bg-red-650/90 flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Daftar Peserta Terdaftar di Kegiatan Ini (Admin View) */}
            <div className="border-t border-zinc-150 pt-4.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-teal-50/40 to-emerald-50/30 p-3 rounded-2xl border border-teal-100/40">
                <div>
                  <span className="font-bold text-[10px] text-zinc-750 font-mono tracking-wider uppercase block">
                    DAFTAR PESERTA YANG MENDAFTAR ({registrations.filter((r) => r.eventId === editingEventId).length})
                  </span>
                  <p className="text-[9px] text-[#005c56] font-mono mt-0.5 font-bold">
                    ID: {editingEventId} • Total Pax: {registrations.filter((r) => r.eventId === editingEventId).reduce((acc, r) => acc + (r.pax || 1), 0)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(editingEventId!, editEventForm)}
                    className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-250 rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-zinc-500" />
                    {shareCopied ? "Tersalin! ✅" : "Salin Info"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareToWhatsApp(editingEventId!, editEventForm)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer shadow-3xs"
                  >
                    <Share2 className="w-3 h-3 text-white" />
                    Bagikan Ke WA Group
                  </button>
                </div>
              </div>
              {registrations.filter((r) => r.eventId === editingEventId).length === 0 ? (
                <p className="text-zinc-400 text-[10px] italic font-sans font-semibold">
                  Belum ada peserta terdaftar untuk kegiatan ini.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto bg-zinc-50 border border-zinc-200/70 p-3 rounded-2xl">
                  {registrations
                    .filter((r) => r.eventId === editingEventId)
                    .map((reg, idx) => {
                      const m = members.find((mb) => mb.id === reg.memberId);
                      return (
                        <div
                          key={reg.id || idx}
                          className="flex justify-between items-center text-2xs p-2.5 rounded-xl bg-white border border-zinc-200 shadow-3xs"
                        >
                          <div className="space-y-0.5 truncate leading-tight">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-zinc-805 uppercase block truncate max-w-[120px]">
                                {m ? m.name : "Anggota J5 EVO"}
                              </span>
                              <span className="text-[8px] font-mono font-bold text-amber-850 bg-amber-50 px-1 py-0.2 rounded border border-amber-200/50 uppercase select-none shrink-0">
                                {reg.pax ? `${reg.pax} PAX` : "1 PAX"}
                              </span>
                            </div>
                            <span className="text-[9px] text-zinc-450 font-sans block truncate">
                              📞 {m ? m.phone : "-"}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] font-black text-[#005c56] bg-teal-50 px-2 py-0.5 rounded border border-teal-100 uppercase shrink-0">
                            {m ? m.plateNumber.toUpperCase() : "-"}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-150 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditingEventId(null);
                  setEditEventForm(null);
                }}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Selesai Edit
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#005c56] hover:bg-[#004843] text-white font-black text-xs rounded-xl transition duration-200 flex items-center gap-1 cursor-pointer shadow-sm uppercase"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {loading ? "Sedang Menyimpan..." : "Simpan Semua Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Form Create Event */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6 text-left">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-700" />
          <h3 className="font-sans font-bold text-lg text-zinc-900">Tambahkan Kegiatan Baru</h3>
        </div>

        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          {/* Nama Kegiatan */}
          <div className="space-y-1">
            <label className="text-zinc-750 font-bold font-sans">Nama Kegiatan (Judul)*</label>
            <input
              type="text"
              required
              placeholder="Contoh: J5 Evo x Jaecoo Gathering"
              value={newEvent.title || ""}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tanggal (datepicker saja) */}
            <div className="space-y-1 sm:col-span-1">
              <label className="text-zinc-700 font-bold font-sans">Tanggal Pelaksanaan *</label>
              <input
                type="date"
                required
                value={newEvent.date || ""}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 focus:bg-white text-xs font-semibold"
              />
            </div>
            {/* Jam */}
            <div className="space-y-1">
              <label className="text-zinc-700 font-bold font-sans">Waktu / Jam (Format WIB)*</label>
              <input
                type="text"
                required
                placeholder="e.g. 08:00 - 15:00 WIB"
                value={newEvent.time || ""}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 focus:bg-white text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lokasi */}
            <div className="space-y-1">
              <label className="text-zinc-700 font-bold font-sans">Titik Kumpul / Lokasi *</label>
              <input
                type="text"
                required
                placeholder="e.g. Melasti Beach, Kuta Selatan, Bali"
                value={newEvent.location || ""}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 focus:bg-white text-xs font-semibold"
              />
            </div>
            {/* Kuota */}
            <div className="space-y-1">
              <label className="text-zinc-700 font-bold font-sans">Kuota Anggota Maksimal *</label>
              <input
                type="number"
                required
                min={2}
                value={newEvent.slots || ""}
                onChange={(e) => setNewEvent({ ...newEvent, slots: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 focus:bg-white text-xs font-semibold"
              />
            </div>
          </div>

          {/* Banner Image */}
          <div className="space-y-1">
            <label className="text-zinc-700 font-bold font-sans">Cover Event Image J5</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const reader = new FileReader();
                    const promise = new Promise<string>((res) => {
                      reader.onload = () => res(reader.result as string);
                    });
                    reader.readAsDataURL(file);
                    const b64 = await promise;
                    const compressed = await compressImage(b64);
                    setNewEvent({ ...newEvent, image: compressed });
                  } catch (err) {
                    console.error("Image loading failed:", err);
                  }
                }
              }}
              className="w-full border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-3 rounded-xl focus:outline-none cursor-pointer hover:border-teal-400"
            />
            {newEvent.image && (
              <img
                src={newEvent.image}
                alt="Cover preview"
                className="w-32 h-20 object-cover border rounded mt-2 shadow-xs"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1">
            <label className="text-zinc-700 font-bold font-sans">Deskripsi Detail & Agenda Acara *</label>
            <textarea
              required
              rows={3}
              placeholder="Uraikan rincian rute touring, perlengkapan wajib, syarat dan agenda lengkap agar member paham..."
              value={newEvent.description || ""}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 focus:bg-white text-xs font-semibold leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-xs rounded-xl shadow-md transition uppercase cursor-pointer flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Publikasikan Kegiatan ini
          </button>
        </form>
      </div>
    </div>
  );
}
