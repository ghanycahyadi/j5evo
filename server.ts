/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import * as XLSX from "xlsx";

import { Member, CommunityEvent, EventRegistration, DashboardStats, FAQ } from "./src/types";
import { INITIAL_MEMBERS, INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_FAQS, CAR_PHOTOS } from "./src/utils";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

const DEFAULT_SOCIALS = {
  instagram: { name: "Instagram", url: "https://www.instagram.com/j5evo.id", handle: "@j5evo.id", show: true },
  facebook: { name: "Facebook", url: "https://facebook.com/groups/j5evo.id", handle: "J5 EVO ID", show: true },
  twitter: { name: "X (Twitter)", url: "https://x.com/j5evo.id", handle: "@j5evo_id", show: true },
  tiktok: { name: "TikTok", url: "https://tiktok.com/@j5evo.id", handle: "@j5evo.id", show: true },
  threads: { name: "Threads", url: "https://threads.net/@j5evo.id", handle: "@j5evo.id", show: true }
};

interface DatabaseSchema {
  members: Member[];
  events: CommunityEvent[];
  registrations: EventRegistration[];
  faqs: FAQ[];
  socialMediaConfig?: any;
}

// Helper to load/save mock database
function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      members: INITIAL_MEMBERS.map(m => ({ ...m, membershipTier: m.membershipTier || "SILVER" })),
      events: INITIAL_EVENTS,
      registrations: INITIAL_REGISTRATIONS,
      faqs: INITIAL_FAQS,
      socialMediaConfig: DEFAULT_SOCIALS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed.faqs) {
      parsed.faqs = INITIAL_FAQS;
    }
    if (!parsed.socialMediaConfig) {
      parsed.socialMediaConfig = DEFAULT_SOCIALS;
    }
    if (parsed.members) {
      parsed.members = parsed.members.map((m: any) => ({
        ...m,
        membershipTier: m.membershipTier || "SILVER",
      }));
    }
    return parsed;
  } catch (error) {
    console.error("Failed to parse db.json, resetting to seeds:", error);
    const initialData: DatabaseSchema = {
      members: INITIAL_MEMBERS.map(m => ({ ...m, membershipTier: m.membershipTier || "SILVER" })),
      events: INITIAL_EVENTS,
      registrations: INITIAL_REGISTRATIONS,
      faqs: INITIAL_FAQS,
      socialMediaConfig: DEFAULT_SOCIALS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
    return initialData;
  }
}

function saveDatabase(data: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

async function startServer() {
  const app = express();
  
  // Parse larger JSON bodies for photo transfers (e.g. member car profile photo, event photo)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Ensure DB file is initialized
  const db = loadDatabase();
  console.log(`Initialized database with ${db.members.length} members and ${db.events.length} events.`);

  // =====================================
  // API ENDPOINTS
  // =====================================

  // Test endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
  });

  // GET all members
  app.get("/api/members", (req, res) => {
    const data = loadDatabase();
    res.json(data.members);
  });

  // POST register a new member (form submission)
  app.post("/api/members", (req, res) => {
    const { name, phone, address, province, city, plateNumber, chassisNumber, carPhoto, ownerPhoto, email, birthDate } = req.body;
    
    // Simple validation
    if (!name || !phone || !address || !plateNumber || !chassisNumber || !province || !city) {
      return res.status(400).json({ error: "Kolom Nama, No Hp, Alamat, Provinsi, Kota, Plast Nomor, dan No Rangka wajib diisi!" });
    }

    const data = loadDatabase();

    // Check if plateNumber or phone or chassisNumber already registered (case insensitive)
    const normalizedPlate = plateNumber.toUpperCase().replace(/\s+/g, "");
    const duplicatePlate = data.members.find(
      (m) => m.plateNumber.toUpperCase().replace(/\s+/g, "") === normalizedPlate
    );
    if (duplicatePlate) {
      return res.status(400).json({ error: `Nomor Plat kendaraan ${plateNumber} sudah terdaftar!` });
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    
    let nextIncrement = 1;
    if (data.members && data.members.length > 0) {
      const increments = data.members.map((m) => {
        const parts = m.id.split("-");
        if (parts.length === 3 && parts[0] === "J5EVO") {
          const num = parseInt(parts[2], 10);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      });
      const maxInc = Math.max(...increments, 0);
      nextIncrement = maxInc + 1;
    }
    const incrementStr = String(nextIncrement).padStart(4, "0");
    const generatedId = `J5EVO-${yyyy}${mm}-${incrementStr}`;

    const newMember: Member = {
      id: generatedId,
      name,
      phone,
      address,
      province,
      city,
      plateNumber: plateNumber.toUpperCase(),
      chassisNumber: chassisNumber.toUpperCase(),
      carPhoto: carPhoto || CAR_PHOTOS.defaultTeal,
      ownerPhoto: ownerPhoto || "", // Option default handler will fallback to avatar
      registeredAt: now.toISOString(),
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@jaecoo-member.net`,
      membershipTier: "SILVER",
      birthDate: birthDate || "",
    };

    data.members.unshift(newMember); // Add to the top of the list
    saveDatabase(data);

    res.status(201).json(newMember);
  });

  // GET single member profile by plate/ID or general query
  app.get("/api/members/:id", (req, res) => {
    const data = loadDatabase();
    const query = req.params.id;
    
    // Find by ID, exact plate number, or email matches
    const normalizedQuery = query.toUpperCase().replace(/\s+/g, "");
    const member = data.members.find(
      (m) =>
        m.id.toUpperCase() === query.toUpperCase() ||
        m.plateNumber.toUpperCase().replace(/\s+/g, "") === normalizedQuery ||
        m.email.toLowerCase() === query.toLowerCase()
    );

    if (!member) {
      return res.status(404).json({ error: "Data anggota tidak ditemukan." });
    }

    // Capture participation history for this member
    const memberRegs = data.registrations.filter((r) => r.memberId === member.id);
    const history = memberRegs.map((reg) => {
      const eventDetails = data.events.find((e) => e.id === reg.eventId);
      return {
        registrationId: reg.id,
        eventId: reg.eventId,
        eventTitle: eventDetails?.title || "Kegiatan Tidak Teridentifikasi",
        eventDate: eventDetails?.date || "",
        eventLocation: eventDetails?.location || "",
        registeredAt: reg.registeredAt,
        status: reg.status,
      };
    });

    res.json({
      member,
      history,
    });
  });

  // DELETE a member (Admin feature)
  app.delete("/api/members/:id", (req, res) => {
    const data = loadDatabase();
    const memberId = req.params.id;
    const memberIndex = data.members.findIndex((m) => m.id === memberId);
    
    if (memberIndex === -1) {
      return res.status(404).json({ error: "Anggota tidak ditemukan." });
    }

    data.members.splice(memberIndex, 1);
    // clean up their registrations
    data.registrations = data.registrations.filter((r) => r.memberId !== memberId);
    
    saveDatabase(data);
    res.json({ success: true, message: "Member berhasil dihapus." });
  });

  // PUT update a member (Admin feature - can alter fields including membershipTier)
  app.put("/api/members/:id", (req, res) => {
    const memberId = req.params.id;
    const { name, phone, address, province, city, plateNumber, chassisNumber, membershipTier, email, birthDate } = req.body;
    
    const data = loadDatabase();
    const member = data.members.find((m) => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: "Anggota tidak ditemukan." });
    }

    // Apply updates
    if (name !== undefined) member.name = name;
    if (phone !== undefined) member.phone = phone;
    if (address !== undefined) member.address = address;
    if (province !== undefined) member.province = province;
    if (city !== undefined) member.city = city;
    if (plateNumber !== undefined) member.plateNumber = plateNumber.toUpperCase();
    if (chassisNumber !== undefined) member.chassisNumber = chassisNumber.toUpperCase();
    if (email !== undefined) member.email = email;
    if (birthDate !== undefined) member.birthDate = birthDate;
    if (membershipTier !== undefined) {
      member.membershipTier = membershipTier; // 'GOLD' | 'SILVER'
    }

    saveDatabase(data);
    res.json({ success: true, message: "Member berhasil diperbarui.", member });
  });

  // GET all events
  app.get("/api/events", (req, res) => {
    const data = loadDatabase();
    // Sort upcoming events first, then completed
    const sortedEvents = [...data.events].sort((a, b) => {
      if (a.status === "upcoming" && b.status !== "upcoming") return -1;
      if (a.status !== "upcoming" && b.status === "upcoming") return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    res.json(sortedEvents);
  });

  // POST create a new event (Admin panel)
  app.post("/api/events", (req, res) => {
    const { title, description, date, location, image, slots, time } = req.body;

    if (!title || !date || !location) {
      return res.status(400).json({ error: "Kolom Judul, Tanggal, dan Lokasi wajib diisi!" });
    }

    const data = loadDatabase();
    const newEvent: CommunityEvent = {
      id: `evt_${Date.now()}`,
      title,
      description: description || "Belum ada deskripsi untuk kegiatan ini.",
      date,
      location,
      image: image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", // default to upcoming so registered members can register
      slots: slots ? parseInt(slots) : 30,
      time: time || "09:00 - Selesai",
    };

    data.events.unshift(newEvent);
    saveDatabase(data);

    res.status(201).json(newEvent);
  });

  // PUT update event details & attendee lists (Admin feature)
  app.put("/api/events/:id", (req, res) => {
    const eventId = req.params.id;
    const { title, description, date, location, image, slots, time, status, galleryImages, registrations } = req.body;

    const data = loadDatabase();
    const eventIndex = data.events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({ error: "Kegiatan tidak ditemukan." });
    }

    const event = data.events[eventIndex];

    // Update event fields
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (date !== undefined) event.date = date;
    if (location !== undefined) event.location = location;
    if (image !== undefined) event.image = image;
    if (slots !== undefined) event.slots = parseInt(slots);
    if (time !== undefined) event.time = time;
    if (status !== undefined) event.status = status;
    if (galleryImages !== undefined) event.galleryImages = galleryImages;

    // Synchronize attendance / registrations for this event if passed
    if (Array.isArray(registrations)) {
      // Filter out registrations for other events
      const otherRegs = data.registrations.filter((r) => r.eventId !== eventId);
      
      // Build new / updated registrations list for this event
      const eventRegs: EventRegistration[] = registrations.map((r: any, index: number) => {
        return {
          id: r.id || `reg_${eventId}_${Date.now()}_${index}`,
          memberId: r.memberId,
          eventId: eventId,
          registeredAt: r.registeredAt || new Date().toISOString(),
          status: r.status || "Registered",
          notes: r.notes || "",
        };
      });

      // Combine them
      data.registrations = [...otherRegs, ...eventRegs];
    }

    saveDatabase(data);
    res.json({ success: true, message: "Kegiatan & daftar kehadiran berhasil diperbarui.", event });
  });

  // GET list of registrations + detailed attendee info (Admin dashboard view)
  app.get("/api/registrations", (req, res) => {
    const data = loadDatabase();
    const list = data.registrations.map((reg) => {
      const member = data.members.find((m) => m.id === reg.memberId);
      const eventDetails = data.events.find((e) => e.id === reg.eventId);
      return {
        ...reg,
        memberName: member?.name || "Anggota Dinonaktifkan",
        memberPhone: member?.phone || "-",
        memberPlate: member?.plateNumber || "-",
        eventTitle: eventDetails?.title || "Kegiatan Terhapus",
        eventDate: eventDetails?.date || "",
        eventLocation: eventDetails?.location || "",
      };
    });
    res.json(list);
  });

  // POST member signs up for an event
  app.post("/api/events/:id/register", (req, res) => {
    const eventId = req.params.id;
    const { plateNumber, phone } = req.body;

    if (!plateNumber && !phone) {
      return res.status(400).json({ error: "Masukkan Nomor Plat atau No Handphone Anda yang telah terdaftar!" });
    }

    const data = loadDatabase();

    // Find event
    const eventDetails = data.events.find((e) => e.id === eventId);
    if (!eventDetails) {
      return res.status(404).json({ error: "Kegiatan tidak ditemukan." });
    }

    // Find member
    const member = data.members.find((m) => {
      const dbPlate = m.plateNumber.toUpperCase().replace(/\s+/g, "");
      const searchPlate = (plateNumber || "").toUpperCase().replace(/\s+/g, "");
      const dbPhone = m.phone.replace(/\s+/g, "");
      const searchPhone = (phone || "").replace(/\s+/g, "");
      
      return (searchPlate && dbPlate === searchPlate) || (searchPhone && dbPhone === searchPhone);
    });

    if (!member) {
      return res.status(404).json({ 
        error: "Akun belum terdaftar dalam sistem. Silakan isi Form Pendaftaran Member J5 Evo terlebih dahulu!" 
      });
    }

    // Check if copy is already registered
    const isAlreadyRegistered = data.registrations.some(
      (r) => r.memberId === member.id && r.eventId === eventId
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ error: "Anda sudah terdaftar untuk berpartisipasi dalam kegiatan ini!" });
    }

    // Check if slots are fully taken
    const registeredCount = data.registrations.filter((r) => r.eventId === eventId).length;
    if (registeredCount >= eventDetails.slots) {
      return res.status(400).json({ error: "Maaf, kuota kupon peserta untuk kegiatan ini sudah habis dipesan." });
    }

    // Register member
    const newRegistration: EventRegistration = {
      id: `reg_${Date.now()}`,
      memberId: member.id,
      eventId: eventId,
      registeredAt: new Date().toISOString(),
      status: "Registered",
    };

    data.registrations.push(newRegistration);
    saveDatabase(data);

    res.status(201).json({
      success: true,
      message: `Terima kasih ${member.name}, Anda berhasil mendaftar untuk: ${eventDetails.title}`,
      registration: newRegistration,
      member,
    });
  });

  // POST record attendance by scan/input of Member ID or Plate Number (Admin Scanning Feature)
  app.post("/api/events/:id/attendance-record", (req, res) => {
    const eventId = req.params.id;
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "No Polisi atau Member ID wajib diisi / dipindai!" });
    }

    const data = loadDatabase();

    // Find event
    const eventDetails = data.events.find((e) => e.id === eventId);
    if (!eventDetails) {
      return res.status(404).json({ error: "Kegiatan tidak ditemukan." });
    }

    // Find member by ID or Plate Number (case-insensitive & normalize spaces)
    const normalizedQuery = query.toUpperCase().replace(/\s+/g, "");
    const member = data.members.find((m) => {
      const dbPlate = m.plateNumber.toUpperCase().replace(/\s+/g, "");
      const dbId = m.id.toUpperCase();
      return dbPlate === normalizedQuery || dbId === normalizedQuery;
    });

    if (!member) {
      return res.status(404).json({ error: `Member dengan Plat atau ID '${query}' tidak ditemukan dalam database.` });
    }

    // Check if copy is already registered
    let registration = data.registrations.find(
      (r) => r.memberId === member.id && r.eventId === eventId
    );

    if (registration) {
      // Exists, update status to Attended
      registration.status = "Attended";
    } else {
      // Check if slots are fully taken
      const registeredCount = data.registrations.filter((r) => r.eventId === eventId).length;
      if (registeredCount >= eventDetails.slots) {
        return res.status(400).json({ error: "Gagal mencatatkan: Kuota peserta kegiatan sudah penuh." });
      }

      // Create new registration
      registration = {
        id: `reg_${Date.now()}`,
        memberId: member.id,
        eventId: eventId,
        registeredAt: new Date().toISOString(),
        status: "Attended",
      };
      data.registrations.push(registration);
    }

    saveDatabase(data);

    res.json({
      success: true,
      message: `Presensi berhasil dicatat! ${member.name} (${member.plateNumber}) status: HADIR`,
      member,
      registration,
    });
  });

  // POST update attendee status (confirm attendance - Admin)
  app.post("/api/registrations/:id/attendance", (req, res) => {
    const reqId = req.params.id;
    const { status } = req.body; // 'Registered' | 'Attended' | 'Absent'

    if (!["Registered", "Attended", "Absent"].includes(status)) {
      return res.status(400).json({ error: "Status kehadiran tidak valid." });
    }

    const data = loadDatabase();
    const registration = data.registrations.find((r) => r.id === reqId);

    if (!registration) {
      return res.status(404).json({ error: "Data pendaftaran tidak ditemukan." });
    }

    registration.status = status;
    saveDatabase(data);

    res.json({
      success: true,
      message: `Kehadiran dikonfirmasi sebagai: ${status}`,
      registration,
    });
  });

  // GET system statistic insights
  app.get("/api/stats", (req, res) => {
    const data = loadDatabase();
    const totalMembers = data.members.length;
    const totalEvents = data.events.length;
    const totalParticipations = data.registrations.length;
    
    // Count percentage of Attended registrations
    const attendedCount = data.registrations.filter((r) => r.status === "Attended").length;
    const totalConcludedRegs = data.registrations.filter((r) => r.status === "Attended" || r.status === "Absent").length;
    const attendanceRate = totalConcludedRegs > 0 ? Math.round((attendedCount / totalConcludedRegs) * 100) : 85; // 85% mock default

    const stats: DashboardStats = {
      totalMembers,
      totalEvents,
      totalParticipations,
      attendanceRate,
    };

    res.json(stats);
  });

  // GET download members list + attendance book as EXCEL (.xlsx)
  app.get("/api/export/excel", (req, res) => {
    const data = loadDatabase();

    // 1. Members Sheet
    const membersData = data.members.map((m, idx) => ({
      No: idx + 1,
      Nama: m.name,
      "No Handphone": m.phone,
      "Email Address": m.email,
      Alamat: m.address,
      "Nomor Plat": m.plateNumber,
      "Nomor Rangka": m.chassisNumber,
      "Waktu Terdaftar": new Date(m.registeredAt).toLocaleString("id-ID"),
    }));

    // 2. Attendance Registrations Sheet
    const registeredData = data.registrations.map((r, idx) => {
      const member = data.members.find((m) => m.id === r.memberId);
      const eventDetails = data.events.find((e) => e.id === r.eventId);
      return {
        No: idx + 1,
        "Nama Member": member?.name || "-",
        "No Handphone": member?.phone || "-",
        "Nomor Plat": member?.plateNumber || "-",
        "Nama Kegiatan": eventDetails?.title || "-",
        "Tanggal Kegiatan": eventDetails?.date || "-",
        Lokasi: eventDetails?.location || "-",
        "Status Kehadiran": r.status === "Registered" ? "Terdaftar (Menunggu)" : r.status === "Attended" ? "Hadir (Hadir)" : "Absen (Tidak Hadir)",
        "Tanggal Mendaftar": new Date(r.registeredAt).toLocaleString("id-ID"),
      };
    });

    const wb = XLSX.utils.book_new();

    const wsMembers = XLSX.utils.json_to_sheet(membersData);
    XLSX.utils.book_append_sheet(wb, wsMembers, "Daftar Member Komunitas");

    const wsRegs = XLSX.utils.json_to_sheet(registeredData);
    XLSX.utils.book_append_sheet(wb, wsRegs, "Daftar Kehadiran & Kegiatan");

    // Write buffer using sheetjs
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Laporan_Komunitas_J5_Evo.xlsx"
    );
    res.status(200).send(buf);
  });

  // GET all FAQs
  app.get("/api/faqs", (req, res) => {
    const data = loadDatabase();
    res.json(data.faqs || []);
  });

  // POST create a new FAQ (Admin)
  app.post("/api/faqs", (req, res) => {
    const { category, problem, frequency, solution } = req.body;
    if (!category || !problem || !solution) {
      return res.status(400).json({ error: "Kolom Kategori, Deskripsi Masalah, dan Solusi wajib diisi!" });
    }
    const data = loadDatabase();
    const newFaq: FAQ = {
      id: `faq_${Date.now()}`,
      category,
      problem,
      frequency: frequency || "Med",
      solution,
    };
    data.faqs.unshift(newFaq);
    saveDatabase(data);
    res.status(201).json(newFaq);
  });

  // DELETE an FAQ (Admin)
  app.delete("/api/faqs/:id", (req, res) => {
    const faqId = req.params.id;
    const data = loadDatabase();
    const faqIndex = data.faqs.findIndex((f) => f.id === faqId);
    if (faqIndex === -1) {
      return res.status(404).json({ error: "FAQ tidak ditemukan." });
    }
    data.faqs.splice(faqIndex, 1);
    saveDatabase(data);
    res.json({ success: true, message: "FAQ berhasil dihapus." });
  });

  // GET social configurations
  app.get("/api/socials", (req, res) => {
    const data = loadDatabase();
    res.json(data.socialMediaConfig || DEFAULT_SOCIALS);
  });

  // POST update social configurations (Admin)
  app.post("/api/socials", (req, res) => {
    const data = loadDatabase();
    data.socialMediaConfig = req.body;
    saveDatabase(data);
    res.json({ success: true, message: "Konfigurasi media sosial berhasil diperbarui.", config: data.socialMediaConfig });
  });

  // =====================================
  // VITE & STATIC FILES SERVING INTERACTION
  // =====================================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Member J5 Evo is listening dynamically on http://localhost:${PORT}`);
  });
}

startServer();
