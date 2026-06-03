/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import * as XLSX from "xlsx";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Initialize environment variables from .env file
dotenv.config();

import { Member, CommunityEvent, EventRegistration, DashboardStats, FAQ } from "./src/types";
import { INITIAL_MEMBERS, INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_FAQS, CAR_PHOTOS } from "./src/utils";

const PORT = 3000;

// Resolve DB_FILE based on potential relative paths
const getDbFilePath = (): string => {
  const rootPath = process.cwd();
  
  // Safe ESM / CommonJS __dirname derivation
  let appDir = rootPath;
  if (typeof __dirname !== "undefined") {
    appDir = __dirname;
  } else {
    try {
      appDir = path.dirname(fileURLToPath(import.meta.url));
    } catch (_) {}
  }
  
  const projectRootFromDist = path.join(appDir, "..");
  
  const candidatePaths = [
    path.join(rootPath, "db.json"),
    path.join(projectRootFromDist, "db.json"),
    path.join(appDir, "db.json")
  ];
  
  // Find the first one that exists
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  // Default fallback if none exists yet
  return path.join(rootPath, "db.json");
};

const DB_FILE = getDbFilePath();
const DB_BACKUP_FILE = DB_FILE + ".bak";

console.log(`[Database] Active Database file path: ${DB_FILE}`);
console.log(`[Database] Active Database backup path: ${DB_BACKUP_FILE}`);

const DEFAULT_SOCIALS = {
  instagram: { name: "Instagram", url: "https://www.instagram.com/j5evo.id", handle: "@j5evo.id", show: true },
  facebook: { name: "Facebook", url: "https://facebook.com/groups/j5evo.id", handle: "J5 EVO ID", show: true },
  twitter: { name: "X (Twitter)", url: "https://x.com/j5evo.id", handle: "@j5evo_id", show: true },
  tiktok: { name: "TikTok", url: "https://tiktok.com/@j5evo.id", handle: "@j5evo.id", show: true },
  threads: { name: "Threads", url: "https://threads.net/@j5evo.id", handle: "@j5evo.id", show: true }
};

const DEFAULT_REGIONALS = [
  "J5 EVO - INDONESIA",
  "J5 EVO - DKI JAKARTA",
  "J5 EVO - JAWA BARAT",
  "J5 EVO - JAWA TENGAH & DIY",
  "J5 EVO - JAWA TIMUR",
  "J5 EVO - TANGERANG RAYA",
  "J5 EVO - SULAWESI SELATAN"
];

const DEFAULT_HOME_CONTENT = {
  heroTitle: "Keluarga Besar J5 EVO Indonesia",
  heroSubtitle: "Satu wadah pemersatu silaturahmi, ekspedisi petualangan, edukasi teknis, serta inovasi berkendara ramah lingkungan bagi seluruh pemilik dan peminat unit mobil listrik premium JAECOO J5 EV di Indonesia.",
  aboutTitle: "Official Community of J5 EVO Indonesia",
  aboutDescription: "J5 EVO (Electric Vehicle Owner) — Official licensed J5 community from ATPM Jaecoo Indonesia Partners.",
  emblemTitle: "Komunitas J5 EVO Indonesia",
  emblemDesc: "Logo resmi Tameng J5 Evo melambangkan ketahanan baterai (Tameng Hijau), keamanan ADAS 2+, dan kekuatan sinergi seluruh member JAECOO Indonesia.",
  emblemWatermark: "OFFICIAL J5 EVO MEMBER",
  emblemLogo: "",
  slides: [] as string[]
};

const DEFAULT_SPONSORS = [
];

interface DatabaseSchema {
  members: Member[];
  events: CommunityEvent[];
  registrations: EventRegistration[];
  faqs: FAQ[];
  socialMediaConfig?: any;
  regionals?: string[];
  sponsors?: any[];
  admins?: any[];
  homeContent?: any;
}

// Helper to load/save mock database with atomic writes and backup recovery
function loadDatabase(): DatabaseSchema {
  // If the DB file does not exist, look for a backup first
  if (!fs.existsSync(DB_FILE) && fs.existsSync(DB_BACKUP_FILE)) {
    try {
      console.log(`[Backup] DB_FILE missing, but DB_BACKUP_FILE found. Restoring from backup...`);
      fs.copyFileSync(DB_BACKUP_FILE, DB_FILE);
    } catch (err) {
      console.error(`[Backup] Failed to copy backup to main DB file:`, err);
    }
  }

  // If still not exist, initialize seed data
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      members: INITIAL_MEMBERS.map(m => {
        let memberReg = "J5 EVO - DKI JAKARTA";
        if (m.city && m.city.toLowerCase().includes("tangerang")) {
          memberReg = "J5 EVO - TANGERANG RAYA";
        }
        return {
          ...m,
          membershipTier: m.membershipTier || "SILVER",
          regional: memberReg,
          pin: m.pin || "123456"
        };
      }),
      events: INITIAL_EVENTS,
      registrations: INITIAL_REGISTRATIONS,
      faqs: INITIAL_FAQS,
      socialMediaConfig: DEFAULT_SOCIALS,
      regionals: DEFAULT_REGIONALS,
      sponsors: DEFAULT_SPONSORS,
      admins: [{ id: "admin_default", username: "admin", password: "j5evopas" }],
      homeContent: DEFAULT_HOME_CONTENT
    };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
    } catch (writeErr) {
      console.error(`[Database] Failed to write initial db.json:`, writeErr);
    }
    return initialData;
  }

  let raw = "";
  try {
    raw = fs.readFileSync(DB_FILE, "utf8");
    // Handle empty file as error to trigger backup load
    if (!raw || raw.trim() === "") {
      throw new Error("db.json file is empty");
    }
    const parsed = JSON.parse(raw);
    
    // Fill defaults
    if (!parsed.faqs) parsed.faqs = INITIAL_FAQS;
    if (!parsed.socialMediaConfig) parsed.socialMediaConfig = DEFAULT_SOCIALS;
    if (!parsed.regionals) parsed.regionals = DEFAULT_REGIONALS;
    if (!parsed.sponsors) parsed.sponsors = DEFAULT_SPONSORS;
    if (!parsed.admins) {
      parsed.admins = [{ id: "admin_default", username: "admin", password: "j5evopas" }];
    }
    if (!parsed.homeContent) parsed.homeContent = DEFAULT_HOME_CONTENT;
    if (parsed.members) {
      parsed.members = parsed.members.map((m: any) => {
        let memberReg = m.regional;
        if (!memberReg) {
          memberReg = "J5 EVO - DKI JAKARTA";
          if (m.city && m.city.toLowerCase().includes("tangerang")) {
            memberReg = "J5 EVO - TANGERANG RAYA";
          }
        }
        return {
          ...m,
          membershipTier: m.membershipTier || "SILVER",
          regional: memberReg,
          pin: m.pin || "123456"
        };
      });
    }
    return parsed;
  } catch (error) {
    console.error(`[Database Rescue] Failed to parse active db.json. Checking backups... Error:`, error);
    
    // Try to load from backup
    if (fs.existsSync(DB_BACKUP_FILE)) {
      try {
        console.log(`[Database Rescue] Recovering database from system backup: ${DB_BACKUP_FILE}`);
        const backupRaw = fs.readFileSync(DB_BACKUP_FILE, "utf8");
        const backupParsed = JSON.parse(backupRaw);
        
        // Solid recovery: write it back to clean the active corrupted db.json
        fs.writeFileSync(DB_FILE, backupRaw, "utf8");
        console.log(`[Database Rescue] Success! Database fully restored from backup.`);
        return backupParsed;
      } catch (backupErr) {
        console.error(`[Database Rescue] Backup file was also unreadable or corrupted:`, backupErr);
      }
    }

    // Absolutely worst case fallback to seed data
    console.warn(`[Database Rescue] Crucial warnings: No backup available or backup is corrupt. Resetting to initial mock schema seeds.`);
    const initialData: DatabaseSchema = {
      members: INITIAL_MEMBERS.map(m => {
        let memberReg = "J5 EVO - DKI JAKARTA";
        if (m.city && m.city.toLowerCase().includes("tangerang")) {
          memberReg = "J5 EVO - TANGERANG RAYA";
        }
        return { ...m, membershipTier: m.membershipTier || "SILVER", regional: memberReg, pin: m.pin || "123456" };
      }),
      events: INITIAL_EVENTS,
      registrations: INITIAL_REGISTRATIONS,
      faqs: INITIAL_FAQS,
      socialMediaConfig: DEFAULT_SOCIALS,
      regionals: DEFAULT_REGIONALS,
      sponsors: DEFAULT_SPONSORS,
      admins: [{ id: "admin_default", username: "admin", password: "j5evopas" }],
      homeContent: DEFAULT_HOME_CONTENT
    };

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
    } catch (saveError) {
      console.error(`[Database] Failed to write fallback db.json:`, saveError);
    }
    return initialData;
  }
}

// Atomic database persistence helper
function saveDatabase(data: DatabaseSchema) {
  const tmpFile = DB_FILE + ".tmp";
  try {
    // 1. Create a backup of the current DB file before writing the new one (if it exists)
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, DB_BACKUP_FILE);
      } catch (backupError) {
        console.warn(`[Backup] Warning: Failed to copy backup of database:`, backupError);
      }
    }
    
    // 2. Write to a temporary file first (atomic write)
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf8");
    
    // 3. Atomically rename/replace tmps over to active DB_FILE
    fs.renameSync(tmpFile, DB_FILE);
  } catch (error) {
    console.error(`[Database Save Fail] Critical error executing atomic save:`, error);
    // Cleanup temporary file if it was created
    if (fs.existsSync(tmpFile)) {
      try {
        fs.unlinkSync(tmpFile);
      } catch (_) {}
    }
  }
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

  // GET all members / paginated members
  app.get("/api/members", (req, res) => {
    const data = loadDatabase();
    
    const search = (req.query.search as string || "").trim().toLowerCase();
    const regional = (req.query.regional as string || "").trim().toLowerCase();
    const page = req.query.page ? parseInt(req.query.page as string) : null;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : null;
    const excludePhotos = req.query.exclude_photos === "true";
    const all = req.query.all === "true" || req.query.limit === "all";

    let filtered = [...data.members];
    
    // Regional filter
    if (regional) {
      filtered = filtered.filter(m => (m.regional || "").trim().toLowerCase() === regional);
    }
    
    // Search filter
    if (search) {
      filtered = filtered.filter(m => 
        (m.name || "").toLowerCase().includes(search) ||
        (m.id || "").toLowerCase().includes(search) ||
        (m.plateNumber || "").toLowerCase().includes(search) ||
        (m.phone || "").toLowerCase().includes(search) ||
        (m.regional || "").toLowerCase().includes(search) ||
        (m.email || "").toLowerCase().includes(search) ||
        (m.address || "").toLowerCase().includes(search)
      );
    }

    // Exclude heavy photos if requested
    if (excludePhotos) {
      filtered = filtered.map(m => {
        const { carPhoto, ...rest } = m;
        const op = m.ownerPhoto || "";
        const isDefaultOrPlaceholder = !op || op.trim() === "" || op === "/logo.png" || 
          op.includes("unsplash.com/photo-1534528741775") ||
          op.includes("unsplash.com/photo-1507003211169") ||
          op.includes("unsplash.com/photo-1500648767791") ||
          op.includes("unsplash.com/photo-1494790108377");
        return {
          ...rest,
          ownerPhoto: m.ownerPhoto,
          hasOwnerPhoto: !isDefaultOrPlaceholder
        } as any;
      });
    }

    // If 'all' is requested, return the raw list directly (backward-compatible Array response)
    if (all) {
      return res.json(filtered);
    }

    // Default to paginated if page/limit is specified OR by default (as requested by user)
    const activePage = page || 1;
    const activeLimit = limit || 10;
    
    const startIndex = (activePage - 1) * activeLimit;
    const endIndex = startIndex + activeLimit;
    const paginatedItems = filtered.slice(startIndex, endIndex);

    res.json({
      members: paginatedItems,
      total: filtered.length,
      page: activePage,
      totalPages: Math.ceil(filtered.length / activeLimit),
      limit: activeLimit
    });
  });

  // POST register a new member (form submission)
  app.post("/api/members", (req, res) => {
    const { name, phone, address, regional, plateNumber, chassisNumber, carPhoto, ownerPhoto, email, birthDate, pin } = req.body;
    
    // Simple validation
    if (!name || !phone || !address || !plateNumber || !chassisNumber || !regional || !email || !pin) {
      return res.status(400).json({ error: "Kolom Nama, No Hp, Alamat, Regional, Plat Nomor, No Rangka, Alamat Email Aktif, dan PIN 6 Digit wajib diisi!" });
    }

    // Owner Photo is mandatory
    if (!ownerPhoto || typeof ownerPhoto !== "string" || ownerPhoto.trim() === "") {
      return res.status(400).json({ error: "Foto Profil Pemilik Kendaraan wajib diunggah/mandatory!" });
    }

    // Chassis Number length checking: must be exactly 17 characters
    const sanitizedChassis = (chassisNumber || "").trim().replace(/\s+/g, "");
    if (sanitizedChassis.length !== 17) {
      return res.status(400).json({ error: "Nomor Rangka Kendaraan (Chassis Number) harus terdiri dari tepat 17 karakter!" });
    }

    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({ error: "PIN harus terdiri dari tepat 6 digit angka!" });
    }

    const data = loadDatabase();

    // Check if plateNumber or chassisNumber already registered (case insensitive)
    const normalizedPlate = plateNumber.toUpperCase().replace(/\s+/g, "");
    const duplicatePlate = data.members.find(
      (m) => m.plateNumber.toUpperCase().replace(/\s+/g, "") === normalizedPlate
    );
    if (duplicatePlate) {
      return res.status(400).json({ error: `Nomor Plat kendaraan ${plateNumber} sudah terdaftar!` });
    }

    const duplicateEmail = data.members.find(
      (m) => m.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (duplicateEmail) {
      return res.status(400).json({ error: `Alamat email ${email} sudah terdaftar!` });
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
      regional,
      plateNumber: plateNumber.toUpperCase(),
      chassisNumber: chassisNumber.toUpperCase(),
      carPhoto: carPhoto || CAR_PHOTOS.defaultTeal,
      ownerPhoto: ownerPhoto || "", // Option default handler will fallback to avatar
      registeredAt: now.toISOString(),
      email: email,
      pin: pin,
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
    const { name, phone, address, regional, plateNumber, chassisNumber, membershipTier, email, birthDate, ownerPhoto, pin } = req.body;
    
    const data = loadDatabase();
    const member = data.members.find((m) => m.id === memberId);
    if (!member) {
      return res.status(404).json({ error: "Anggota tidak ditemukan." });
    }

    if (pin !== undefined) {
      if (!/^\d{6}$/.test(pin)) {
        return res.status(400).json({ error: "PIN harus terdiri dari tepat 6 digit angka!" });
      }
      member.pin = pin;
    }

    // Apply updates
    if (name !== undefined) member.name = name;
    if (phone !== undefined) member.phone = phone;
    if (address !== undefined) member.address = address;
    if (regional !== undefined) member.regional = regional;
    if (plateNumber !== undefined) member.plateNumber = plateNumber.toUpperCase();
    if (chassisNumber !== undefined) {
      const sanitizedChassis = chassisNumber.trim().replace(/\s+/g, "");
      if (sanitizedChassis.length !== 17) {
        return res.status(400).json({ error: "Nomor Rangka Kendaraan (Chassis Number) harus terdiri dari tepat 17 karakter!" });
      }
      member.chassisNumber = sanitizedChassis.toUpperCase();
    }
    if (email !== undefined) member.email = email;
    if (birthDate !== undefined) member.birthDate = birthDate;
    if (ownerPhoto !== undefined) {
      if (!ownerPhoto || typeof ownerPhoto !== "string" || ownerPhoto.trim() === "") {
        return res.status(400).json({ error: "Foto Profil Pemilik Kendaraan wajib diunggah/mandatory dan tidak boleh kosong!" });
      }
      member.ownerPhoto = ownerPhoto;
    }
    if (membershipTier !== undefined) {
      member.membershipTier = membershipTier; // 'GOLD' | 'SILVER'
    }

    saveDatabase(data);
    res.json({ success: true, message: "Member berhasil diperbarui.", member });
  });

  // GET all events (stripped of heavy galleryImages for fast initial loading)
  app.get("/api/events", (req, res) => {
    const data = loadDatabase();
    // Sort upcoming events first, then completed
    const sortedEvents = [...data.events].sort((a, b) => {
      if (a.status === "upcoming" && b.status !== "upcoming") return -1;
      if (a.status !== "upcoming" && b.status === "upcoming") return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Strip gallery images array (keeps only size / presence check)
    const compactEvents = sortedEvents.map((evt) => {
      return {
        ...evt,
        galleryImages: [], // strip heavy base64 strings
        galleryCount: evt.galleryImages ? evt.galleryImages.length : 0
      };
    });

    res.json(compactEvents);
  });

  // GET specific event's gallery images (Loads on-demand when opening album!)
  app.get("/api/events/:id/gallery", (req, res) => {
    const data = loadDatabase();
    const event = data.events.find((e) => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Kegiatan tidak ditemukan." });
    }
    res.json(event.galleryImages || []);
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

  // DELETE event by ID
  app.delete("/api/events/:id", (req, res) => {
    const eventId = req.params.id;
    const data = loadDatabase();
    
    const eventIndex = data.events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({ error: "Kegiatan tidak ditemukan." });
    }
    
    // Remove the event
    data.events.splice(eventIndex, 1);
    
    // Also remove registrations related to this event
    data.registrations = data.registrations.filter((r) => r.eventId !== eventId);
    
    saveDatabase(data);
    res.json({ success: true, message: "Kegiatan berhasil dihapus." });
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
    const { plateNumber, pin, pax } = req.body;

    if (!plateNumber || !pin) {
      return res.status(400).json({ error: "Masukkan Nomor Plat Kendaraan dan PIN 6 Digit Anda!" });
    }

    const data = loadDatabase();

    // Find event
    const eventDetails = data.events.find((e) => e.id === eventId);
    if (!eventDetails) {
      return res.status(404).json({ error: "Kegiatan tidak ditemukan." });
    }

    // Find member by plateNumber
    const searchPlate = (plateNumber || "").toUpperCase().replace(/\s+/g, "");
    const member = data.members.find((m) => {
      const dbPlate = m.plateNumber.toUpperCase().replace(/\s+/g, "");
      return dbPlate === searchPlate;
    });

    if (!member) {
      return res.status(404).json({ 
        error: "Nomor plat kendaraan belum terdaftar dalam sistem. Silakan isi Form Pendaftaran Member J5 Evo terlebih dahulu!" 
      });
    }

    // Verify PIN matches
    if (member.pin !== pin) {
      return res.status(401).json({ error: "PIN yang Anda masukkan salah!" });
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

    const paxCount = parseInt(pax) || 1;

    // Register member
    const newRegistration: EventRegistration = {
      id: `reg_${Date.now()}`,
      memberId: member.id,
      eventId: eventId,
      registeredAt: new Date().toISOString(),
      status: "Registered",
      pax: paxCount,
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

  // POST cancel/unregister from an event
  app.post("/api/events/:id/unregister", (req, res) => {
    const eventId = req.params.id;
    const { plateNumber, pin } = req.body;

    if (!plateNumber || !pin) {
      return res.status(400).json({ error: "Masukkan Nomor Plat Kendaraan dan PIN 6 Digit Anda!" });
    }

    const data = loadDatabase();

    // Find event
    const eventDetails = data.events.find((e) => e.id === eventId);
    if (!eventDetails) {
      return res.status(404).json({ error: "Kegiatan tidak ditemukan." });
    }

    // Find member by plateNumber
    const searchPlate = (plateNumber || "").toUpperCase().replace(/\s+/g, "");
    const member = data.members.find((m) => {
      const dbPlate = m.plateNumber.toUpperCase().replace(/\s+/g, "");
      return dbPlate === searchPlate;
    });

    if (!member) {
      return res.status(404).json({ 
        error: "Nomor plat kendaraan belum terdaftar dalam sistem. Silakan daftarkan diri terlebih dahulu!" 
      });
    }

    // Verify PIN matches
    if (member.pin !== pin) {
      return res.status(401).json({ error: "PIN yang Anda masukkan salah!" });
    }

    // Find registration to cancel
    const regIndex = data.registrations.findIndex(
      (r) => r.memberId === member.id && r.eventId === eventId
    );

    if (regIndex === -1) {
      return res.status(400).json({ error: "Anda belum terdaftar untuk berpartisipasi dalam kegiatan ini!" });
    }

    // Check if the event registration is already finalized/attended
    const existingReg = data.registrations[regIndex];
    if (existingReg.status === "Attended") {
      return res.status(400).json({ error: "Keikutsertaan tidak dapat dibatalkan karena Anda sudah melakukan absensi kehadiran di lokasi (Attended)!" });
    }

    // Remove registration
    data.registrations.splice(regIndex, 1);
    saveDatabase(data);

    res.status(200).json({
      success: true,
      message: `Keikutsertaan Anda (${member.name}) untuk kegiatan: ${eventDetails.title} berhasil dibatalkan.`,
    });
  });

  // Helper to send real SMTP PIN Reset Email using NodeMailer
  const sendPinResetEmail = async (to: string, name: string, pin: string, plateNumber: string) => {
    const host = process.env.SMTP_HOST;
    const portStr = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === "true";

    if (!host || !user || !pass) {
      console.warn("SMTP settings are not configured in system environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS).");
      return { success: false, error: "SMTP credentials not configured" };
    }

    const port = parseInt(portStr || "465", 10);

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure, // true for 465, false for other ports (like 587 or 25)
        auth: {
          user,
          pass,
        },
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: `"J5 EVO Indonesia" <${user}>`,
        to,
        subject: "Reset PIN Komunitas J5 EVO Indonesia",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0d9488; font-weight: 800; letter-spacing: 0.05em; margin: 0; font-size: 24px;">J5 EVO INDONESIA</h2>
              <p style="color: #64748b; font-size: 11px; text-transform: uppercase; margin: 4px 0 0 0; letter-spacing: 0.1em; font-weight: 700;">Official Member PIN Reset</p>
            </div>
            
            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
              <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">Halo Rekan <strong>${name}</strong>,</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">Kami menerima permintaan untuk mengirimkan kembali PIN keanggotaan terdaftar Anda untuk Plat nomor kendaraan berikut:</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 0 0 24px 0; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Plat Nomor Kendaraan</p>
                <p style="margin: 0 0 16px 0; font-size: 20px; color: #0f172a; font-weight: 850; font-family: monospace; letter-spacing: 1px;">${plateNumber}</p>
                
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">PIN Keanggotaan Anda</p>
                <p style="margin: 0; font-size: 32px; color: #0d9488; font-weight: 900; letter-spacing: 6px; font-family: monospace;">${pin}</p>
              </div>
              
              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">Gunakan kode PIN rahasia di atas dalam formulir masuk login / pendaftaran event J5 EVO Indonesia di portal utama.</p>
              <p style="font-size: 12px; color: #ef4444; font-weight: 600; margin: 0; background-color: #fef2f2; padding: 10px; border-radius: 8px; border: 1px solid #fee2e2;">Demi keamanan berkendara dan integritas pendaftaran, mohon jangan pernah menyebarkan kode PIN ini kepada siapa pun murni demi keamanan.</p>
            </div>
            
            <div style="margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; line-height: 1.6; margin: 0;">
                Email ini dikirim secara otomatis oleh Server J5 EVO Indonesia.<br/>
                Jika Anda merasa tidak melakukan pendaftaran atau permintaan ini, silakan abaikan pesan ini.<br/>
                &copy; 2026 J5 EVO Indonesia.
              </p>
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully via NodeMailer. ID:", info.messageId);
      return { success: true };
    } catch (e: any) {
      console.error("Nodemailer SMTP delivery error:", e);
      return { success: false, error: e.message || String(e) };
    }
  };

  // POST reset PIN for member
  app.post("/api/members/reset-pin", async (req, res) => {
    const { identity } = req.body; // email only now
    
    if (!identity) {
      return res.status(400).json({ error: "Alamat Email Terdaftar wajib diisi!" });
    }

    const data = loadDatabase();
    
    // Find member by email only
    const searchEmail = identity.trim().toLowerCase();
    const member = data.members.find((m) => m.email.trim().toLowerCase() === searchEmail);

    if (!member) {
      return res.status(404).json({ error: "Email Anggota tidak ditemukan. Pastikan alamat email tersebut terdaftar!" });
    }

    // Attempt real email send
    const mailResult = await sendPinResetEmail(member.email, member.name, member.pin, member.plateNumber);

    res.json({
      success: true,
      message: mailResult.success 
        ? `Kode PIN Anda telah dikirimkan ke email terdaftar Anda: ${member.email}`
        : `Permintaan reset PIN diterima. Namun gagal mengirim email. Error: ${mailResult.error || "Gagal menghubungi server mail (SMTP)"}`,
      smtpSent: mailResult.success,
      smtpError: mailResult.error || null,
      email: member.email,
      name: member.name,
      plateNumber: member.plateNumber
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
        "Jumlah Pax": r.pax || 1,
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

  // GET all regionals
  app.get("/api/regionals", (req, res) => {
    const data = loadDatabase();
    res.json(data.regionals || DEFAULT_REGIONALS);
  });

  // POST add new regional
  app.post("/api/regionals", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Nama regional tidak boleh kosong" });
    const data = loadDatabase();
    if (!data.regionals) data.regionals = [...DEFAULT_REGIONALS];
    if (data.regionals.includes(name)) {
      return res.status(400).json({ error: "Regional sudah terdaftar!" });
    }
    data.regionals.push(name);
    saveDatabase(data);
    res.status(201).json({ success: true, regionals: data.regionals });
  });

  // PUT update regional
  app.put("/api/regionals/:index", (req, res) => {
    const index = parseInt(req.params.index, 10);
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Nama regional tidak boleh kosong" });
    const data = loadDatabase();
    if (!data.regionals || !data.regionals[index]) {
      return res.status(404).json({ error: "Regional tidak ditemukan" });
    }
    const oldName = data.regionals[index];
    data.regionals[index] = name;
    
    // Update members having this regional
    if (data.members) {
      data.members.forEach((m) => {
        if (m.regional === oldName) {
          m.regional = name;
        }
      });
    }
    saveDatabase(data);
    res.json({ success: true, regionals: data.regionals });
  });

  // DELETE a regional
  app.delete("/api/regionals/:index", (req, res) => {
    const index = parseInt(req.params.index, 10);
    const data = loadDatabase();
    if (!data.regionals || !data.regionals[index]) {
      return res.status(404).json({ error: "Regional tidak ditemukan" });
    }
    data.regionals.splice(index, 1);
    saveDatabase(data);
    res.json({ success: true, regionals: data.regionals });
  });

  // GET all sponsors
  app.get("/api/sponsors", (req, res) => {
    const data = loadDatabase();
    let sponsorsList = data.sponsors || DEFAULT_SPONSORS;
    
    const excludePhotos = req.query.exclude_photos === "true";
    if (excludePhotos) {
      sponsorsList = sponsorsList.map((s: any) => {
        const products = (s.products || []).map((p: any) => {
          const { photos, ...rest } = p;
          return { ...rest, photos: [] };
        });
        return { ...s, products };
      });
    }
    res.json(sponsorsList);
  });

  // GET single sponsor details including product photos
  app.get("/api/sponsors/:id", (req, res) => {
    const data = loadDatabase();
    const sponsorsList = data.sponsors || DEFAULT_SPONSORS;
    const sponsor = sponsorsList.find((s: any) => s.id === req.params.id);
    if (!sponsor) {
      return res.status(404).json({ error: "Sponsor tidak ditemukan" });
    }
    res.json(sponsor);
  });

  // POST create a sponsor
  app.post("/api/sponsors", (req, res) => {
    const { name, contact, logo, description, products, username, password } = req.body;
    if (!name) return res.status(400).json({ error: "Nama sponsor wajib diisi" });
    const data = loadDatabase();
    if (!data.sponsors) data.sponsors = [];
    const newSponsor = {
      id: `sp_${Date.now()}`,
      name,
      contact: contact || "",
      logo: logo || "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=200&q=80",
      description: description || "",
      username: username || "",
      password: password || "",
      products: products || []
    };
    data.sponsors.push(newSponsor);
    saveDatabase(data);
    res.status(201).json(newSponsor);
  });

  // PUT update a sponsor
  app.put("/api/sponsors/:id", (req, res) => {
    const { name, contact, logo, description, products, username, password } = req.body;
    const data = loadDatabase();
    if (!data.sponsors) data.sponsors = [];
    const sponsorIndex = data.sponsors.findIndex(s => s.id === req.params.id);
    if (sponsorIndex === -1) {
      return res.status(404).json({ error: "Sponsor tidak ditemukan" });
    }
    const sponsor = data.sponsors[sponsorIndex];
    if (name !== undefined) sponsor.name = name;
    if (contact !== undefined) sponsor.contact = contact;
    if (logo !== undefined) sponsor.logo = logo;
    if (description !== undefined) sponsor.description = description;
    if (products !== undefined) sponsor.products = products;
    if (username !== undefined) sponsor.username = username;
    if (password !== undefined) sponsor.password = password;
    
    saveDatabase(data);
    res.json({ success: true, sponsor });
  });

  // DELETE a sponsor
  app.delete("/api/sponsors/:id", (req, res) => {
    const data = loadDatabase();
    if (!data.sponsors) data.sponsors = [];
    const sponsorIndex = data.sponsors.findIndex(s => s.id === req.params.id);
    if (sponsorIndex === -1) {
      return res.status(404).json({ error: "Sponsor tidak ditemukan" });
    }
    data.sponsors.splice(sponsorIndex, 1);
    saveDatabase(data);
    res.json({ success: true, message: "Sponsor berhasil dihapus" });
  });

  // ==================== AUTH & ADMIN CONFIG MANAGEMENT ENDPOINTS ====================

  // POST auth/login
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password wajib diisi." });
    }

    const data = loadDatabase();

    // 1. Check inside admins
    const adminUser = (data.admins || []).find(
      (a) => a.username.trim().toLowerCase() === username.trim().toLowerCase()
    );
    if (adminUser) {
      if (adminUser.password === password) {
        return res.json({
          role: "admin",
          username: adminUser.username,
          id: adminUser.id,
          token: "admin-session-token"
        });
      } else {
        return res.status(400).json({ error: "Password admin salah!" });
      }
    }

    // 2. Check inside sponsors
    const sponsorUser = (data.sponsors || []).find(
      (s) => s.username?.trim().toLowerCase() === username.trim().toLowerCase()
    );
    if (sponsorUser) {
      if (sponsorUser.password === password) {
        return res.json({
          role: "sponsor",
          username: sponsorUser.username,
          sponsorId: sponsorUser.id,
          name: sponsorUser.name,
          token: `sponsor-session-token-${sponsorUser.id}`
        });
      } else {
        return res.status(400).json({ error: "Password sponsor salah!" });
      }
    }

    return res.status(400).json({ error: "Username tidak terdaftar sebagai admin atau sponsor!" });
  });

  // GET list of admins
  app.get("/api/admins", (req, res) => {
    const data = loadDatabase();
    res.json(data.admins || []);
  });

  // POST create administrative user
  app.post("/api/admins", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password wajib diisi." });
    }

    const data = loadDatabase();
    if (!data.admins) data.admins = [];

    const exists = data.admins.some(
      (a) => a.username.trim().toLowerCase() === username.trim().toLowerCase()
    );
    if (exists) {
      return res.status(400).json({ error: "Username sudah digunakan!" });
    }

    const newAdmin = {
      id: `admin_${Date.now()}`,
      username: username.trim(),
      password: password
    };
    data.admins.push(newAdmin);
    saveDatabase(data);
    res.status(201).json(newAdmin);
  });

  // PUT update administrative user (username / password / base admin change)
  app.put("/api/admins/:id", (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    const data = loadDatabase();
    if (!data.admins) data.admins = [];

    const adminIndex = data.admins.findIndex((a) => a.id === id);
    if (adminIndex === -1) {
      return res.status(404).json({ error: "Akun admin tidak ditemukan." });
    }

    const admin = data.admins[adminIndex];

    if (username !== undefined) {
      const exists = data.admins.some(
        (a) => a.id !== id && a.username.trim().toLowerCase() === username.trim().toLowerCase()
      );
      if (exists) {
        return res.status(400).json({ error: "Username sudah digunakan oleh admin lain!" });
      }
      admin.username = username.trim();
    }

    if (password !== undefined) {
      admin.password = password;
    }

    saveDatabase(data);
    res.json(admin);
  });

  // DELETE administrative user
  app.delete("/api/admins/:id", (req, res) => {
    const { id } = req.params;
    const data = loadDatabase();
    if (!data.admins) data.admins = [];

    if (data.admins.length <= 1) {
      return res.status(400).json({ error: "Tidak dapat menghapus admin terakhir!" });
    }

    const adminIndex = data.admins.findIndex((a) => a.id === id);
    if (adminIndex === -1) {
      return res.status(404).json({ error: "Akun admin tidak ditemukan." });
    }

    data.admins.splice(adminIndex, 1);
    saveDatabase(data);
    res.json({ success: true, message: "Akun admin berhasil dihapus." });
  });

  // GET home page content
  app.get("/api/home-content", (req, res) => {
    const data = loadDatabase();
    res.json(data.homeContent || DEFAULT_HOME_CONTENT);
  });

  // GET slides of home page content specifically
  app.get("/api/home-content/slides", (req, res) => {
    const data = loadDatabase();
    const hc = data.homeContent || DEFAULT_HOME_CONTENT;
    res.json(hc.slides || []);
  });

  // PUT slides of home page content specifically (separate segment save)
  app.put("/api/home-content/slides", (req, res) => {
    const { slides } = req.body;
    if (!Array.isArray(slides)) {
      return res.status(400).json({ error: "Slides must be an array" });
    }
    const data = loadDatabase();
    if (!data.homeContent) data.homeContent = { ...DEFAULT_HOME_CONTENT };
    data.homeContent.slides = slides;
    saveDatabase(data);
    res.json({ success: true, slides: data.homeContent.slides });
  });

  // POST & PUT update home page content
  const handleUpdateHomeContent = (req, res) => {
    const { heroTitle, heroSubtitle, aboutTitle, aboutDescription, heroBadge, emblemTitle, emblemDesc, emblemWatermark, emblemLogo, slides } = req.body;
    const data = loadDatabase();
    if (!data.homeContent) data.homeContent = { ...DEFAULT_HOME_CONTENT };
    
    if (heroTitle !== undefined) data.homeContent.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) data.homeContent.heroSubtitle = heroSubtitle;
    if (aboutTitle !== undefined) data.homeContent.aboutTitle = aboutTitle;
    if (aboutDescription !== undefined) data.homeContent.aboutDescription = aboutDescription;
    if (heroBadge !== undefined) data.homeContent.heroBadge = heroBadge;
    if (emblemTitle !== undefined) data.homeContent.emblemTitle = emblemTitle;
    if (emblemDesc !== undefined) data.homeContent.emblemDesc = emblemDesc;
    if (emblemWatermark !== undefined) data.homeContent.emblemWatermark = emblemWatermark;
    if (emblemLogo !== undefined) data.homeContent.emblemLogo = emblemLogo;
    if (slides !== undefined) data.homeContent.slides = slides;
    
    saveDatabase(data);
    res.json({ success: true, homeContent: data.homeContent });
  };

  app.post("/api/home-content", handleUpdateHomeContent);
  app.put("/api/home-content", handleUpdateHomeContent);

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
