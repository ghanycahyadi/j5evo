/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Shield,
  Sparkles,
  Search,
  CheckCircle2,
  FileText,
  PlusCircle,
  Clock,
  MapPin,
  MessageSquare,
  ChevronRight,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Car,
  TrendingUp,
  Download,
  Trash2,
  Info,
  Trophy,
  Award,
  User,
  IdCard,
  Smartphone,
  HelpCircle,
  X,
  Shuffle,
  RefreshCw,
  Pencil,
  Folder,
  Gift,
  Share2,
  Cake,
  ChevronLeft
} from "lucide-react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import J5EvoLogo from "./components/J5EvoLogo";
import { toPng } from "html-to-image";
import { Member, CommunityEvent, EventRegistration, DashboardStats, FAQ } from "./types";
import { formatDate, CAR_PHOTOS, getGoogleMapsUrl } from "./utils";

// Mock J5 EV News Articles
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  image: string;
  readTime: string;
}

const J5_NEWS: NewsArticle[] = [
  {
    id: "news_1",
    title: "JAECOO J5 EV Siap Mengaspal di Indonesia: Mengusung Baterai LFP 61.2 kWh & ADAS Level 2+",
    summary: "Kendaraan listrik petualang ramah lingkungan JAECOO J5 EV menyajikan efisiensi superior, kabin premium, dan ketangguhan suspensi kelas dunia siap memikat pasar EV Indonesia.",
    source: "OtoMedia Indonesia",
    date: "28 Mei 2026",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    readTime: "4 menit"
  },
  {
    id: "news_2",
    title: "Komunitas J5 EVO Indonesia Selenggarakan Kampanye Penghijauan 'Green Drive, Clear Future'",
    summary: "Sejalan dengan filosofi nihil emisi J5 EV, member J5 EVO menanam 1.000 bibit mangrove di pesisir utara Jakarta sebagai komitmen keberlanjutan ekosistem bumi nusantara.",
    source: "EcoGreen Press",
    date: "15 Mei 2026",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    readTime: "3 menit"
  },
  {
    id: "news_3",
    title: "Uji Nyali Jalur Menanjak Cipularang: JAECOO J5 Membuktikan Torsi Instan Tanpa Batas",
    summary: "Evaluasi lapangan membuktikan bahwa motor listrik responsif J5 EV tidak mengalami kendala mendaki tanjakan curam dalam kondisi beban penuh, hemat konsumsi daya hingga 14.2 kWh/100km.",
    source: "EV-Evolution ID",
    date: "03 Mei 2026",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    readTime: "5 menit"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // States for administrative authentication gate
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername.trim().toLowerCase() === "admin" && adminPassword === "j5evopas") {
      setAdminAuthenticated(true);
      setLoginError("");
      showFeedback("Login berhasil! Selamat datang di Panel Admin.");
    } else {
      setLoginError("Username atau password salah!");
    }
  };

  const handleAdminLogout = () => {
    setAdminAuthenticated(false);
    setAdminUsername("");
    setAdminPassword("");
    setIsAdmin(false);
    setActiveTab("home");
    showFeedback("Anda telah keluar dari Panel Admin secara aman.");
  };

  // States for dynamic system datasets
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalEvents: 0,
    totalParticipations: 0,
    attendanceRate: 85
  });

  // Loading & Action indicators
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
  } | null>(null);

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; isDanger?: boolean }
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      },
      confirmText: options?.confirmText || "Ya, Lanjutkan",
      cancelText: options?.cancelText || "Batal",
      isDanger: options?.isDanger !== false,
    });
  };

  // Form states - Member Registration Form (Google-style matches attachment)
  const [regForm, setRegForm] = useState({
    name: "",
    phone: "",
    address: "",
    province: "",
    city: "",
    plateNumber: "",
    chassisNumber: "",
    email: "",
    carPhoto: CAR_PHOTOS.defaultTeal,
    ownerPhoto: "",
    birthDate: ""
  });
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [lastRegisteredMember, setLastRegisteredMember] = useState<Member | null>(null);

  // States - Participation Signup Forms per Event
  const [eventJoiningId, setEventJoiningId] = useState<string | null>(null);
  const [joinForm, setJoinForm] = useState({
    plateNumber: "",
    phone: ""
  });

  // Lookup Membership State
  const [lookupQuery, setLookupQuery] = useState<string>("");
  const [lookupResult, setLookupResult] = useState<{ member: Member; history: any[] } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Admin New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    image: "",
    slots: 30,
    time: "09:00 - Selesai"
  });

  // FAQ implementation state variables
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>("Semua");
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>("");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [adminFaqForm, setAdminFaqForm] = useState({
    category: "Setir & Pengendalian",
    problem: "",
    frequency: "Med" as "High" | "Med" | "Low",
    solution: ""
  });
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);

  // Gallery image lightbox and randomized pool
  const INITIAL_GALLERY_ITEMS = [
    {
      id: 1,
      badge: "EVENTS - JAECOO LAND",
      title: "Jaecoo Land 2026 Jakarta",
      desc: "Keseruan talkshow interaktif & gathering akbar pengurus pusat bersanding gagah unit J5 EV.",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      badge: "ANNIVERSARY - 1 YEAR",
      title: "Milestone of Trust Celebration",
      desc: "Merayakan sepak terjang satu tahun Jaecoo berkiprah di tanah air bersama barisan armada mobil listrik premium.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      badge: "KOPDAR - SHARING TIPS",
      title: "Technical Discussion Circle",
      desc: "Suasana akrab bedah tuntas kecanggihan ADAS, perawatan baterai, serta persiapan rute touring berkendara jauh.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      badge: "EVENTS - YED 2026",
      title: "Kopdar Yogyakarta J5 EVO",
      desc: "Satu tujuan, satu semangat, satu keluarga besar Jaecoo Indonesia. Brosur rincian agenda kumpul resmi.",
      image: "/event_banner.jpeg",
    }
  ];

  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<any | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [socials, setSocials] = useState<any>(null);
  const [editSocialsForm, setEditSocialsForm] = useState<any>(null);

  const [selectedAlbumPhotos, setSelectedAlbumPhotos] = useState<any[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  const openGalleryPopup = (photos: any[], index: number) => {
    setSelectedAlbumPhotos(photos);
    setCurrentPhotoIndex(index);
    setSelectedGalleryImage(photos[index]);
  };

  const handleNextPhoto = () => {
    if (selectedAlbumPhotos.length <= 1) return;
    const nextIdx = (currentPhotoIndex + 1) % selectedAlbumPhotos.length;
    setCurrentPhotoIndex(nextIdx);
    setSelectedGalleryImage(selectedAlbumPhotos[nextIdx]);
  };

  const handlePrevPhoto = () => {
    if (selectedAlbumPhotos.length <= 1) return;
    const prevIdx = (currentPhotoIndex - 1 + selectedAlbumPhotos.length) % selectedAlbumPhotos.length;
    setCurrentPhotoIndex(prevIdx);
    setSelectedGalleryImage(selectedAlbumPhotos[prevIdx]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedGalleryImage) return;
      if (e.key === "ArrowRight" || e.key === "Right") {
        handleNextPhoto();
      } else if (e.key === "ArrowLeft" || e.key === "Left") {
        handlePrevPhoto();
      } else if (e.key === "Escape") {
        setSelectedGalleryImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGalleryImage, selectedAlbumPhotos, currentPhotoIndex]);

  useEffect(() => {
    const items: any[] = [];
    events.forEach((evt) => {
      if (evt.galleryImages && Array.isArray(evt.galleryImages)) {
        evt.galleryImages.forEach((img, idx) => {
          items.push({
            id: `${evt.id}_g_${idx}_${img.substring(10, 20)}`,
            badge: `${evt.title.toUpperCase()}`,
            title: evt.title,
            desc: `Foto dokumentasi #${idx + 1} kegiatan`,
            image: img
          });
        });
      }
    });

    if (items.length > 0) {
      setGalleryItems(items);
    } else {
      setGalleryItems([...INITIAL_GALLERY_ITEMS]);
    }
  }, [events]);

  // Admin module state for Kehadiran Member
  const [adminAttendanceEventId, setAdminAttendanceEventId] = useState<string>("");
  const [adminAttendanceQuery, setAdminAttendanceQuery] = useState<string>("");

  // States for event editing & gallery image management
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventForm, setEditEventForm] = useState<any | null>(null);
  const [editEventSearchMember, setEditEventSearchMember] = useState<string>("");

  // States for member editing within the admin workspace
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberForm, setEditMemberForm] = useState<any | null>(null);

  // Fetch initial database items on mount and handle deep linking scan QR codes
  useEffect(() => {
    fetchData();

    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("lookup") || params.get("scan");
    if (searchParam) {
      setActiveTab("membership-lookup");
      setLookupQuery(searchParam.toUpperCase());
      
      const autoLookup = async () => {
        try {
          setLoading(true);
          setLookupError(null);
          const res = await fetch(`/api/members/${encodeURIComponent(searchParam.trim())}`);
          const data = await res.json();
          if (!res.ok) {
            setLookupError(data.error || "Data kepesertaan tidak ditemukan dalam sistem J5 EVO.");
            setLookupResult(null);
          } else {
            setLookupResult(data);
          }
        } catch (err) {
          setLookupError("Kesalahan server mendeteksi pencarian otomatis.");
          setLookupResult(null);
        } finally {
          setLoading(false);
        }
      };
      autoLookup();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, eRes, rRes, sRes, fRes, socRes] = await Promise.all([
        fetch("/api/members").then((r) => r.json()),
        fetch("/api/events").then((r) => r.json()),
        fetch("/api/registrations").then((r) => r.json()),
        fetch("/api/stats").then((r) => r.json()),
        fetch("/api/faqs").then((r) => r.json()),
        fetch("/api/socials").then((r) => r.json()).catch(() => null)
      ]);

      if (Array.isArray(mRes)) setMembers(mRes);
      if (Array.isArray(eRes)) setEvents(eRes);
      if (Array.isArray(rRes)) setRegistrations(rRes);
      if (sRes && !sRes.error) setStats(sRes);
      if (Array.isArray(fRes)) setFaqs(fRes);
      if (socRes && !socRes.error) {
        setSocials(socRes);
        setEditSocialsForm(socRes);
      }
    } catch (err) {
      console.error("Error communicating with full-stack J5 API:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFaqForm.category || !adminFaqForm.problem || !adminFaqForm.solution) {
      showFeedback("Mohon lengkapi Kategori, Deskripsi Masalah, dan Solusi FAQ!", true);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminFaqForm)
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback(data.error || "Gagal menyimpan FAQ baru.", true);
        return;
      }
      showFeedback("FAQ Baru berhasil ditambahkan.");
      setAdminFaqForm({
        category: "Setir & Pengendalian",
        problem: "",
        frequency: "Med",
        solution: ""
      });
      fetchData();
    } catch (err) {
      showFeedback("Eror menyimpan FAQ baru.", true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    triggerConfirm(
      "Hapus FAQ",
      "Apakah Anda yakin ingin menghapus FAQ ini? Informasi ini tidak akan ditampilkan lagi setelah dihapus.",
      async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/faqs/${faqId}`, {
            method: "DELETE"
          });
          const data = await res.json();
          if (!res.ok) {
            showFeedback(data.error || "Gagal menghapus FAQ.", true);
            return;
          }
          showFeedback("FAQ berhasil dihapus.");
          fetchData();
        } catch (err) {
          showFeedback("Eror menghapus FAQ.", true);
        } finally {
          setLoading(false);
        }
      },
      { confirmText: "Ya, Hapus", isDanger: true }
    );
  };

  const handleUpdateSocialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSocialsForm) return;
    try {
      setLoading(true);
      const res = await fetch("/api/socials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSocialsForm)
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback(data.error || "Gagal memperbarui konfigurasi media sosial.", true);
        return;
      }
      showFeedback("Konfigurasi media sosial berhasil disimpan!");
      fetchData();
    } catch (err) {
      showFeedback("Gagal memperbarui konfigurasi media sosial.", true);
    } finally {
      setLoading(false);
    }
  };

  // Trigger feedback banner helper
  const showFeedback = (text: string, isError: boolean = false) => {
    setFeedbackMessage({ text, isError });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 6000);
  };

  // Clean form helper
  const clearForm = () => {
    setRegForm({
      name: "",
      phone: "",
      address: "",
      province: "",
      city: "",
      plateNumber: "",
      chassisNumber: "",
      email: "",
      carPhoto: CAR_PHOTOS.defaultTeal,
      ownerPhoto: ""
    });
  };

  // Submit Member Registration Form (Google Form style layout)
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.phone || !regForm.address || !regForm.plateNumber || !regForm.chassisNumber || !regForm.province || !regForm.city) {
      showFeedback("Mohon isi semua kolom bertanda bintang (*) merah wajib diisi!", true);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();

      if (!res.ok) {
        showFeedback(data.error || "Gagal mengirim formulir pendaftaran.", true);
        return;
      }

      setLastRegisteredMember(data);
      setFormSubmitted(true);
      showFeedback(`Selamat! Member ${data.name} dengan kendaraan berplat ${data.plateNumber} terdata sukses.`);
      // Refresh list & statistics
      fetchData();
    } catch (err) {
      showFeedback("Terjadi kesalahan jaringan rute API.", true);
    } finally {
      setLoading(false);
    }
  };

  // Lookup Membership Profile & Participation History
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) {
      setLookupError("Silakan masukkan Nomor Plat Kendaraan, Email, atau ID Anggota!");
      setLookupResult(null);
      return;
    }

    try {
      setLoading(true);
      setLookupError(null);
      const res = await fetch(`/api/members/${encodeURIComponent(lookupQuery.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setLookupError(data.error || "Data kepesertaan tidak ditemukan dalam sistem J5 EVO.");
        setLookupResult(null);
        return;
      }

      setLookupResult(data);
    } catch (err) {
      setLookupError("Kesalahan server mendeteksi pencarian anggota.");
    } finally {
      setLoading(false);
    }
  };

  // Member signs up for an event
  const registerForEvent = async (e: React.FormEvent, eventId: string) => {
    e.preventDefault();
    if (!joinForm.plateNumber && !joinForm.phone) {
      showFeedback("Tentukan Nomor Plat atau No Whatsapp terdaftar untuk mencocokkan akun!", true);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(joinForm)
      });
      const data = await res.json();

      if (!res.ok) {
        showFeedback(data.error || "Pendaftaran kegiatan gagal.", true);
        return;
      }

      showFeedback(data.message || "Berhasil bergabung!");
      setEventJoiningId(null);
      setJoinForm({ plateNumber: "", phone: "" });
      fetchData(); // reload statistics and lists
    } catch (err) {
      showFeedback("Eror saat registrasi keterlibatan kegiatan.", true);
    } finally {
      setLoading(false);
    }
  };

  // Admin marks attendance status for a participant
  const handleAttendanceChange = async (regId: string, currentStatus: string, nextStatus: "Registered" | "Attended" | "Absent") => {
    try {
      const res = await fetch(`/api/registrations/${regId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback(data.error || "Gagal memperbarui status.", true);
        return;
      }
      showFeedback(`Status absen diperbarui ke: ${nextStatus}`);
      fetchData();
    } catch (err) {
      showFeedback("Gagal memperbarui database kehadiran.", true);
    }
  };

  // Admin creates a new Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      showFeedback("Mohon lengkapi Judul, Tanggal, dan Lokasi Kegiatan Baru!", true);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent)
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback(data.error || "Gagal membuat event baru.", true);
        return;
      }

      showFeedback(`Kegiatan Baru '${data.title}' berhasil dipublikasikan.`);
      // Reset form
      setNewEvent({
        title: "",
        description: "",
        date: "",
        location: "",
        image: "",
        slots: 30
      });
      fetchData();
    } catch (err) {
      showFeedback("Eror memposting data kegiatan.", true);
    } finally {
      setLoading(false);
    }
  };

  // Convert selected event banner image to base64
  const handleEventPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to start editing an event in admin mode
  const startEditingEvent = (evt: CommunityEvent) => {
    const eventRegs = registrations.filter((r) => r.eventId === evt.id);
    
    setEditingEventId(evt.id);
    setEditEventForm({
      id: evt.id,
      title: evt.title,
      date: evt.date,
      time: evt.time || "09:00 - Selesai",
      location: evt.location,
      description: evt.description,
      slots: evt.slots || 50,
      image: evt.image || "",
      status: evt.status,
      galleryImages: evt.galleryImages || [],
      registrations: eventRegs,
    });
    setEditEventSearchMember("");
    
    // Scroll to editor smoothly
    setTimeout(() => {
      document.getElementById("editor-section-anchor")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Toggle member status for the event currently being edited
  const handleToggleMemberAttendanceInForm = (member: Member, nextStatus: "Registered" | "Attended" | "Absent" | "None") => {
    if (!editEventForm) return;

    setEditEventForm((prev: any) => {
      if (!prev) return null;
      const currentRegs = [...prev.registrations];
      const existingIndex = currentRegs.findIndex((r) => r.memberId === member.id);

      if (nextStatus === "None") {
        const filtered = currentRegs.filter((r) => r.memberId !== member.id);
        return { ...prev, registrations: filtered };
      } else {
        if (existingIndex > -1) {
          currentRegs[existingIndex] = {
            ...currentRegs[existingIndex],
            status: nextStatus,
            memberName: member.name,
            memberPlate: member.plateNumber,
            memberPhone: member.phone
          };
        } else {
          currentRegs.push({
            id: `reg_${prev.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            memberId: member.id,
            eventId: prev.id,
            status: nextStatus,
            registeredAt: new Date().toISOString(),
            notes: "",
            memberName: member.name,
            memberPlate: member.plateNumber,
            memberPhone: member.phone
          });
        }
        return { ...prev, registrations: currentRegs };
      }
    });
  };

  // Handle uploading multiple documentation gallery photos at once
  const handleMultipleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showFeedback(`Memproses ${files.length} dokumen foto...`);
    const loadPromises = Array.from(files).map((file: any) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Gagal membaca file"));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loadPromises)
      .then((base64Images) => {
        setEditEventForm((prev: any) => {
          if (!prev) return null;
          const updatedImages = [...prev.galleryImages, ...base64Images];
          return { ...prev, galleryImages: updatedImages };
        });
        showFeedback(`Sukses! ${files.length} foto dimasukkan ke galeri kegiatan ini.`);
      })
      .catch((err) => {
        showFeedback("Gagal memuat beberapa foto galeri.", true);
      });
  };

  // Save the edited event & synchronized registrations to the DB
  const handleSaveEditedEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventForm) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/events/${editEventForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editEventForm.title,
          description: editEventForm.description,
          date: editEventForm.date,
          time: editEventForm.time,
          location: editEventForm.location,
          image: editEventForm.image,
          slots: editEventForm.slots,
          status: editEventForm.status,
          galleryImages: editEventForm.galleryImages,
          registrations: editEventForm.registrations,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showFeedback(data.error || "Gagal memperbarui kegiatan.", true);
        return;
      }

      showFeedback(`Sukses! Kegiatan '${editEventForm.title}' berhasil diperbarui.`);
      setEditingEventId(null);
      setEditEventForm(null);
      fetchData();
    } catch (err) {
      showFeedback("Terjadi kesalahan teknis saat memperbarui kegiatan.", true);
    } finally {
      setLoading(false);
    }
  };

  // Submit record attendance from admin panel
  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAttendanceEventId) {
      showFeedback("Pilih kegiatan terlebih dahulu!", true);
      return;
    }
    if (!adminAttendanceQuery.trim()) {
      showFeedback("Masukkan No Polisi atau Member ID terlebih dahulu!", true);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/events/${adminAttendanceEventId}/attendance-record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: adminAttendanceQuery.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback(data.error || "Gagal mencatat kehadiran.", true);
      } else {
        showFeedback(data.message || "Kehadiran berhasil dicatat!");
        setAdminAttendanceQuery(""); // clear input field
        fetchData(); // reload registrations and statistics
      }
    } catch (err) {
      showFeedback("Gagal menghubungi server untuk pencatatan kehadiran.", true);
    } finally {
      setLoading(false);
    }
  };

  // Admin updates member membership tier (GOLD or SILVER)
  const handleUpdateMemberTier = async (memberId: string, currentTier: "GOLD" | "SILVER", newTier: "GOLD" | "SILVER") => {
    if (currentTier === newTier) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipTier: newTier })
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback(data.error || "Gagal mengubah jenis membership.", true);
        return;
      }
      showFeedback(`Jenis membership berhasil diubah menjadi ${newTier}!`);
      
      // If looked up this same member list details, refresh lookup details
      if (lookupResult && lookupResult.member.id === memberId) {
        setLookupResult({
          ...lookupResult,
          member: {
            ...lookupResult.member,
            membershipTier: newTier
          }
        });
      }
      fetchData();
    } catch (err) {
      showFeedback("Terjadi kesalahan teknis saat mengubah jenis membership.", true);
    } finally {
      setLoading(false);
    }
  };

  // Download member card as PNG using html-to-image with transparent corners
  const handleDownloadCard = async () => {
    const node = document.getElementById("premium-member-card");
    if (!node || !lookupResult) return;
    try {
      setLoading(true);
      showFeedback("Mempersiapkan gambar kartu anggota...");
      
      // Store original styles to restore them later
      const originalWidth = node.style.width;
      const originalMaxWidth = node.style.maxWidth;
      const originalMinWidth = node.style.minWidth;
      
      // Enforce absolute strict dimensions on the rendering element itself
      // to ensure html-to-image clone has the exact layout boundaries of a premium physical card.
      node.style.width = "480px";
      node.style.maxWidth = "480px";
      node.style.minWidth = "480px";
      
      // Capture actual computed height under strict 480px layout
      const exportHeight = node.offsetHeight;
      
      const dataUrl = await toPng(node, {
        pixelRatio: 2.5, // 2.5x export resolution for ultra-sharp rendering
        width: 480,
        height: exportHeight,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          margin: "0",
          boxShadow: "none", // Skip outer layout shadow for clean transparency edge
        }
      });
      
      // Securely restore original screen display styles
      node.style.width = originalWidth;
      node.style.maxWidth = originalMaxWidth;
      node.style.minWidth = originalMinWidth;
      
      const link = document.createElement("a");
      link.download = `KARTU_MEMBER_J5_${lookupResult.member.id}.png`;
      link.href = dataUrl;
      link.click();
      showFeedback("Kartu Anggota berhasil diunduh sebagai PNG!");
    } catch (err) {
      console.error(err);
      showFeedback("Gagal mengunduh kartu. Silakan coba lagi.", true);
    } finally {
      setLoading(false);
    }
  };

  // Admin deletes a member
  const handleDeleteMember = async (memberId: string, memberName: string) => {
    triggerConfirm(
      "Hapus Anggota Komunitas",
      `Apakah Anda yakin ingin menonaktifkan & menghapus member '${memberName}'? Seluruh riwayat kehadiran terkait akan ikut dibersihkan.`,
      async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/members/${encodeURIComponent(memberId)}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) {
            showFeedback(data.error || "Gagal menghapus member.", true);
            return;
          }

          showFeedback(`Member ${memberName} berhasil dihapus.`);
          // If looked up this same member, clear lookup list
          if (lookupResult && lookupResult.member.id === memberId) {
            setLookupResult(null);
          }
          fetchData();
        } catch (err) {
          showFeedback("Kesalahan memproses penghapusan anggota.", true);
        } finally {
          setLoading(false);
        }
      },
      { confirmText: "Ya, Hapus Member", isDanger: true }
    );
  };

  // Submit revised details for a Member of J5 EVO
  const handleEditMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMemberForm || !editingMemberId) return;

    if (!editMemberForm.name || !editMemberForm.phone || !editMemberForm.address || !editMemberForm.plateNumber || !editMemberForm.chassisNumber || !editMemberForm.province || !editMemberForm.city) {
      showFeedback("Mohon isi semua kolom wajib (nama, hp, alamat, provinsi, kota, no plat, no rangka)!", true);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/members/${encodeURIComponent(editingMemberId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMemberForm)
      });
      const data = await res.json();

      if (!res.ok) {
        showFeedback(data.error || "Gagal memperbarui data member.", true);
        return;
      }

      showFeedback(`Sukses memperbarui data member ${editMemberForm.name}.`);
      setEditingMemberId(null);
      setEditMemberForm(null);
      
      // If looked up this same member, let's update lookup screen as well!
      if (lookupResult && lookupResult.member.id === editingMemberId) {
        setLookupResult({
          ...lookupResult,
          member: data.member
        });
      }

      fetchData(); // reload list
    } catch (err) {
      showFeedback("Terjadi kesalahan jaringan rute API.", true);
    } finally {
      setLoading(false);
    }
  };

  // Trigger browser download for community database EXCEL reporting
  const handleExportExcel = () => {
    showFeedback("Menyiapkan dokumen Excel (.xlsx)... Mengunduh laporan.");
    window.location.href = "/api/export/excel";
  };

  // Divide events for display
  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const pastEvents = events.filter((e) => e.status === "completed" || e.status === "ongoing");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900 pb-16">
      
      {/* Floating System Notification */}
      {feedbackMessage && (
        <div id="system-toast" className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl shadow-xl transition-all duration-300 flex items-start gap-3 border ${
          feedbackMessage.isError 
            ? "bg-red-50 border-red-200 text-red-900" 
            : "bg-teal-50 border-teal-200 text-teal-900"
        }`}>
          {feedbackMessage.isError ? (
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-550 font-bold mb-0.5">Notifikasi Sistem</p>
            <p className="text-sm font-medium leading-relaxed">{feedbackMessage.text}</p>
          </div>
        </div>
      )}

      {/* Header component */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* TAB 1: INTERACTIVE HOMEPAGE */}
        {activeTab === "home" && (
          <div id="tab-home" className="space-y-12 animate-fadeIn">
            
            {/* Visual Hero Intro Header */}
            <Hero 
              socials={socials}
              onRegisterClick={() => setActiveTab("register-member")} 
              onExploreEventsClick={() => {
                const el = document.getElementById("events-section-anchor");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* LIVE SYSTEM STATS STATISTIK MEMBER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-teal-700 font-bold block">Jumlah Member</span>
                  <span className="text-3xl font-extrabold text-zinc-900 font-mono mt-0.5 block">{stats.totalMembers}</span>
                  <span className="text-xs text-zinc-500 mt-0.5 block">Terdaftar resmi di RI</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-700 font-bold block">Total Kegiatan</span>
                  <span className="text-3xl font-extrabold text-zinc-900 font-mono mt-0.5 block">{stats.totalEvents}</span>
                  <span className="text-xs text-zinc-500 mt-0.5 block">Selesai & Direncanakan</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-teal-700 font-bold block">Jumlah Sponsor</span>
                  <span className="text-3xl font-extrabold text-[#005c56] font-mono mt-0.5 block">12 Brand</span>
                  <span className="text-xs text-zinc-500 mt-0.5 block">Mitra Kolaborasi Resmi</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#005c56]">
                  <Award className="w-6 h-6 text-[#005c56]" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-amber-700 font-bold block">Sponsor Utama</span>
                  <span className="text-2xl font-extrabold text-amber-700 font-sans mt-1 block">ATPM Jaecoo</span>
                  <span className="text-xs text-zinc-500 mt-0.5 block">Mitra ATPM Indonesia</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* JAECOO J5 EV - DETAILED VEHICLE INFO GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Product Spotlight & Image Section (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider text-teal-800 bg-teal-50 rounded-full border border-teal-200 uppercase font-bold">
                      Premium SUV Spotlight
                    </span>
                    <span className="text-teal-600 text-xs font-bold">● Intelligent Electric Car</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-900 leading-tight">
                    JAECOO J5 EV: Estetika Off-Road Klasik Berpadu Teknologi Berkelanjutan
                  </h3>
                  
                  <p className="text-zinc-650 text-sm mt-3 leading-relaxed font-medium">
                    Dibangun khusus untuk generasi petualang cerdas Indonesia. Dengan bodi bersudut tegas yang kokoh, grille depan dinamis futuristik khas Jaecoo, serta ditenagai oleh mesin listrik 100% senyap berkemampuan jelajah ekorun mengesankan hingga ratusan kilometer tanpa kendala emisi.
                  </p>
                </div>

                {/* Grid of Key Features */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-150">
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10px] block font-mono font-bold">🔋 KAPASITAS BATERAI</span>
                    <span className="text-teal-800 text-base font-extrabold font-mono">61.2 kWh (LFP)</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10px] block font-mono font-bold">📏 ESTIMASI JARAK</span>
                    <span className="text-teal-800 text-base font-extrabold font-mono">Max 450 KM (CLTC)</span>
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-zinc-500 text-[10px] block font-mono font-bold">⚡ KECEPATAN PENGISIAN</span>
                    <span className="text-teal-800 text-base font-extrabold font-mono">DC 30% to 80% (28m)</span>
                  </div>
                </div>

                {/* Interactive Car Spec Accent */}
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-150 flex items-center gap-3 shadow-xs">
                  <Car className="w-8 h-8 text-teal-600 flex-shrink-0" />
                  <p className="text-xs text-zinc-700 font-medium">
                    <strong className="text-teal-800">Tahukah Anda?</strong> Jaecoo J5 EV mengadopsi teknologi pengereman regeneratif cerdas berkekuatan 3-Level yang mengisi ulang baterai Anda saat melepas pedal gas di jalanan macet Indonesia!
                  </p>
                </div>
              </div>

              {/* J5 EV Design Sketch Concept Box */}
              <div className="lg:col-span-5 bg-gradient-to-br from-teal-50 to-white border border-teal-100 p-6 rounded-3xl flex flex-col justify-center shadow-sm">
                <span className="text-xs font-mono text-teal-700 uppercase tracking-widest block mb-1 font-bold">
                  OFFICIAL AVATAR EMBLEM
                </span>
                <h4 className="text-lg font-extrabold text-teal-950 mb-3">Komunitas J5 EVO Indonesia</h4>
                
                {/* Community Art representation */}
                <div className="bg-white p-4 rounded-2xl border border-teal-100 flex justify-center mb-4 shadow-inner">
                  {/* Community Logo replica */}
                  <div className="w-40 h-40 flex items-center justify-center p-2 rounded-xl relative overflow-hidden bg-transparent">
                    <J5EvoLogo className="w-full h-full" color="#005c56" />
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Logo resmi Tameng J5 Evo melambangkan ketahanan baterai (Tameng Hijau), keamanan ADAS 2+, dan kekuatan sinergi seluruh member JAECOO Indonesia.
                </p>
              </div>

            </div>

            {/* PHOTO KEGIATAN BY ALBUM */}
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-6 bg-teal-600 rounded-sm"></div>
                  <h3 className="font-sans font-bold text-xl text-zinc-900">Galeri Foto Kegiatan</h3>
                </div>
                {selectedAlbum && (
                  <button
                    onClick={() => setSelectedAlbum(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-250 rounded-xl text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-3xs"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>← Lihat Semua Album</span>
                  </button>
                )}
              </div>

              {galleryItems.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-400 font-sans">
                  Belum ada dokumentasi foto kegiatan yang diunggah sementara ini.
                </div>
              ) : !selectedAlbum ? (
                /* Album Grid Selection View */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {(() => {
                    const albumsMap = galleryItems.reduce((acc: { [key: string]: any[] }, item) => {
                      if (!acc[item.title]) {
                        acc[item.title] = [];
                      }
                      acc[item.title].push(item);
                      return acc;
                    }, {});

                    return Object.keys(albumsMap).map((title) => {
                      const photos = albumsMap[title];
                      const albumPreview = photos[0]?.image || "/event_banner.jpeg";
                      const albumCount = photos.length;

                      return (
                        <div
                          key={title}
                          onClick={() => openGalleryPopup(photos, 0)}
                          className="group relative rounded-2xl overflow-hidden border border-zinc-200 aspect-[4/3] bg-zinc-900 shadow-sm cursor-pointer transform hover:scale-[1.01] hover:shadow-md transition duration-300"
                        >
                          <img
                            src={albumPreview}
                            alt={title}
                            className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                            referrerPolicy="no-referrer"
                          />
                          {/* Folder/Album decoration tag */}
                          <div className="absolute top-3 left-3 px-2 py-1 bg-white/95 border border-zinc-200 rounded-lg text-[9px] font-mono font-black text-teal-800 tracking-wider shadow-sm flex items-center gap-1">
                            <Folder className="w-3 h-3 text-teal-600" />
                            <span>ALBUM KEGIATAN</span>
                          </div>

                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-teal-650 text-white rounded-lg text-[10px] font-mono font-black tracking-wider shadow-sm flex items-center gap-1 shrink-0">
                            <span>{albumCount} FOTO DOCO</span>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent flex flex-col justify-end p-5">
                            <h4 className="text-base font-black text-white group-hover:text-teal-300 transition-colors tracking-tight line-clamp-2">
                              {title}
                            </h4>
                            <p className="text-xs text-zinc-350 font-medium mt-1 line-clamp-1">
                              Klik untuk langsung membuka pratinjau foto album slideshow kegiatan ini.
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                /* Selected Album Photos Grid View */
                <div className="space-y-4">
                  <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono font-extrabold text-teal-750 tracking-wider uppercase">SEKALI KLIK UNTUK PRATINJAU</p>
                      <h4 className="text-base font-black text-[#005c56] leading-tight mt-0.5">{selectedAlbum}</h4>
                    </div>
                    <span className="px-3 py-1 bg-teal-100 border border-teal-200 text-teal-905 font-mono text-xs font-bold rounded-lg shrink-0">
                      📂 {galleryItems.filter((item) => item.title === selectedAlbum).length} Foto
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryItems
                      .filter((item) => item.title === selectedAlbum)
                      .map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedGalleryImage(item)}
                          className="group relative rounded-2xl overflow-hidden border border-zinc-200 aspect-[4/3] bg-zinc-100 shadow-xs cursor-pointer"
                          title="Klik untuk memperbesar"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-[9px] font-mono text-teal-300 tracking-wider font-bold truncate block">{item.badge}</span>
                            <h5 className="text-[11px] font-bold text-white mt-0.5 line-clamp-1">
                              Foto Dokumentasi #{idx + 1}
                            </h5>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* DAFTAR KEGIATAN: UPCOMING & COMPLETED (HISTORY) SECTION - ANCHORED */}
            <div id="events-section-anchor" className="space-y-6 pt-6">
              
              <div className="sm:flex items-center justify-between border-b border-zinc-200 pb-4">
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-2xl text-zinc-900">Kegiatan Komunitas (Official Kegiatan)</h3>
                  <p className="text-sm text-zinc-650 leading-relaxed max-w-xl">
                    Partisipasi aktif anggota menjaga solidaritas. Daftarkan diri Anda pada kegiatan mendatang atau lihat dokumentasi kegiatan yang sukses terlaksana.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={() => setActiveTab("events")}
                    className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 focus:outline-none shadow-xs"
                  >
                    Daftar / Ikuti Kegiatan <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Upcoming Events (Akan Datang) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-teal-700">
                    <Clock className="w-5 h-5" />
                    <h4 className="font-sans font-bold text-lg">Daftar Kegiatan yang Akan Datang</h4>
                  </div>

                  {upcomingEvents.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-400">
                      Tidak ada kegiatan mendatang yang direncanakan sementara ini.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingEvents.map((evt) => (
                        <div key={evt.id} className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 shadow-xs flex flex-col justify-between group">
                          <div 
                            onClick={() => setSelectedEvent(evt)}
                            className="flex flex-col sm:flex-row gap-4 cursor-pointer"
                          >
                            <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden border border-zinc-150 flex-shrink-0 relative">
                              <img src={evt.image} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 animate-fadeIn" />
                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition"></div>
                            </div>
                            <div className="space-y-1.5 flex-1">
                              <span className="px-2 py-0.5 text-[9px] font-mono bg-cyan-50 text-cyan-800 border border-cyan-200 rounded font-bold">
                                📅 {formatDate(evt.date)}
                              </span>
                              <h5 className="font-extrabold text-sm sm:text-base text-zinc-900 group-hover:text-teal-700 transition leading-snug">{evt.title}</h5>
                              <p className="text-xs text-zinc-650 leading-relaxed font-sans line-clamp-2">{evt.description}</p>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 pt-1 font-medium">
                                <a
                                  href={getGoogleMapsUrl(evt.location)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 text-[#005c56] hover:underline font-bold"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-[#005c56]" />
                                  {evt.location.replace(/https?:\/\/[^\s]+/, "Google Maps")}
                                </a>
                                {evt.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-500" /> {evt.time}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <span className="text-xs text-zinc-650 font-medium">
                              Sisa Kuota: <strong className="text-teal-700 font-mono font-extrabold">{evt.slots - (registrations.filter(r => r.eventId === evt.id).length)}</strong> dari {evt.slots} slot
                            </span>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => setSelectedEvent(evt)}
                                className="w-1/2 sm:w-auto justify-center px-3.5 py-1.5 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-xs font-bold rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                              >
                                Detail Kegiatan <Info className="w-3.5 h-3.5 text-zinc-500" />
                              </button>
                              <button
                                onClick={() => setSelectedEvent(evt)}
                                className="w-1/2 sm:w-auto justify-center px-4 py-1.5 bg-[#005c56] hover:bg-[#004843] text-white text-xs font-extrabold rounded-lg transition shadow-xs uppercase tracking-wider cursor-pointer"
                              >
                                Gabung Kegiatan
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Completed / Past Events (History / Sudah Terlaksana) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-750">
                    <CheckCircle2 className="w-5 h-5" />
                    <h4 className="font-sans font-bold text-lg">Riwayat Kegiatan Selesai (Completed)</h4>
                  </div>

                  {pastEvents.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-400">
                      Belum ada pencatatan kegiatan lampau.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastEvents.map((evt) => {
                        const countAttendees = registrations.filter(r => r.eventId === evt.id && r.status === "Attended").length;
                        return (
                          <div 
                            key={evt.id} 
                            onClick={() => setSelectedEvent(evt)}
                            className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 shadow-xs relative overflow-hidden cursor-pointer group"
                          >
                            <div className="absolute right-0 top-0 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-bl-xl text-[10px] font-mono border-l border-b border-emerald-150 font-bold uppercase flex items-center gap-1">
                              🟢 SELESAI
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden border border-zinc-150 flex-shrink-0 relative">
                                <img src={evt.image} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition"></div>
                              </div>
                              <div className="space-y-1.5 flex-1">
                                <span className="text-[11px] font-mono text-zinc-400 block pt-0.5">
                                  {formatDate(evt.date)}
                                </span>
                                <h5 className="font-extrabold text-sm sm:text-base text-zinc-800 group-hover:text-teal-700 transition leading-snug">{evt.title}</h5>
                                <p className="text-xs text-zinc-650 leading-relaxed font-sans line-clamp-2">{evt.description}</p>
                                
                                <div className="flex items-center gap-1.5 text-xs text-[#005c56] pt-1 font-bold">
                                  <MapPin className="w-3.5 h-3.5 text-[#005c56]" />
                                  <a
                                    href={getGoogleMapsUrl(evt.location)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="hover:underline text-[#005c56]"
                                  >
                                    {evt.location.replace(/https?:\/\/[^\s]+/, "Google Maps")}
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold">
                              <span className="text-zinc-650">
                                Anggota Hadir Terpapar: <strong className="text-emerald-700 font-mono font-extrabold">{countAttendees || 2} member</strong>
                              </span>
                              <span className="text-[10px] font-mono text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-150 shadow-2xs">
                                LIHAT DOKUMENTASI
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* SEKSI FAQ (PERTANYAAN UMUM & SOLUSI KENDALA J5 EVO) */}
            <div id="faq-section" className="space-y-6 pt-10 border-t border-zinc-200 mt-12 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-250 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-600 animate-pulse" />
                    <h3 className="font-sans font-bold text-2xl text-[#005c56]">Pusat Informasi & FAQ J5 EVO</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-650 leading-relaxed font-sans max-w-2xl">
                    Kumpulan artikel edukasi dan pemecahan masalah teknis terverifikasi oleh para koordinator lapangan & teknisi BeRes untuk menjamin kenyamanan berkendara Anda.
                  </p>
                </div>
              </div>

              {/* Filter and Search Box */}
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-zinc-50 border border-zinc-200 p-4 rounded-3xl">
                {/* Search query box */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Ketik kata kunci (misal: TPMS, setir, bunyi, embun)..."
                    value={faqSearchQuery}
                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                    className="w-full bg-white text-zinc-800 border border-zinc-300 focus:border-teal-500 rounded-xl py-2 pl-10 pr-4 focus:outline-none text-xs font-semibold shadow-2xs placeholder:text-zinc-400"
                  />
                </div>

                {/* Categories Badge scrolling list */}
                <div className="flex flex-wrap items-center gap-1 overflow-x-auto max-w-full pb-0.5">
                  {["Semua", "Setir & Pengendalian", "Pengereman & Traksi", "Eksterior & Bodi"].map((cat) => {
                    const isActive = activeFaqCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveFaqCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold transition whitespace-nowrap cursor-pointer border ${
                          isActive
                            ? "bg-[#005c56] text-white border-[#005c56]"
                            : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid lists of questions */}
              {(() => {
                const filtered = faqs.filter((f) => {
                  const matchCat = activeFaqCategory === "Semua" || f.category === activeFaqCategory;
                  const searchL = faqSearchQuery.toLowerCase();
                  const matchSearch =
                    !faqSearchQuery.trim() ||
                    f.problem.toLowerCase().includes(searchL) ||
                    f.solution.toLowerCase().includes(searchL) ||
                    f.category.toLowerCase().includes(searchL);
                  return matchCat && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-3xl bg-zinc-50 border border-zinc-200 text-zinc-450 font-medium col-span-full">
                      <HelpCircle className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                      Tidak ditemukan dokumentasi kendala yang cocok dengan pencarian Anda.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((f, i) => {
                      const isExpanded = expandedFaqId === f.id;
                      const freqStyle = f.frequency === "High"
                        ? "bg-red-50 text-red-700 border-red-250 font-bold"
                        : f.frequency === "Med"
                        ? "bg-amber-50 text-amber-800 border-amber-250 font-bold"
                        : "bg-blue-50 text-blue-700 border-blue-250 font-bold";

                      return (
                        <div
                          key={f.id || i}
                          className={`p-5 rounded-2xl border transition duration-300 flex flex-col justify-between ${
                            isExpanded 
                              ? "bg-teal-50/20 border-teal-500/40 shadow-xs" 
                              : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-2xs"
                          }`}
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-805 text-[9px] font-mono font-bold rounded-md">
                                📁 {f.category}
                              </span>
                              <span className={`px-2 py-0.5 border text-[9px] font-mono rounded-md ${freqStyle}`}>
                                {f.frequency === "High" ? "⚠️ TINGGI" : f.frequency === "Med" ? "🎚️ SEDANG" : "💡 LAINNYA"}
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              <h4 className="font-extrabold text-sm text-zinc-900 leading-snug">
                                {f.problem}
                              </h4>
                              
                              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5 text-xs text-left">
                                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-800 font-extrabold block">
                                  💡 Solusi / Pemecahan Masalah:
                                </span>
                                <p className="text-zinc-700 font-semibold leading-relaxed">
                                  {f.solution}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* TAB 2: MEMBER REGISTRATION FORM (Identical with the Google Form attachment schema) */}
        {activeTab === "register-member" && (
          <div id="tab-register-member" className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            
            {/* Form submission success preview screen */}
            {formSubmitted ? (
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
                <div className="w-16 h-16 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center text-teal-600 mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-extrabold text-zinc-900">Pendaftaran Berhasil Dikirim!</h3>
                  <p className="text-sm text-zinc-600 mt-2 max-w-md mx-auto">
                    Terima kasih telah berpartisipasi mengisi Lembar Pendataan Member J5 EVO (Electric Vehicle Owner) Indonesia.
                  </p>
                </div>

                {lastRegisteredMember && (
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 text-left space-y-3">
                    <p className="text-xs font-mono text-teal-700 uppercase tracking-widest text-center border-b border-zinc-200 pb-2 font-bold uppercase">
                      IKHTISAR KARTU ANGGOTA J5 EVO
                    </p>
                    <div className="flex gap-4 items-center">
                      <img
                        src={lastRegisteredMember.ownerPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                        alt="Foto Profil Pemilik"
                        className="w-16 h-20 object-cover rounded-xl border border-zinc-200 shadow-xs"
                      />
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base">{lastRegisteredMember.name}</h4>
                        <p className="text-xs text-zinc-650 font-mono">Plat: <span className="text-teal-700 font-bold">{lastRegisteredMember.plateNumber}</span></p>
                        <p className="text-[11px] text-zinc-650 mt-0.5">
                          Kota: <span className="font-medium text-zinc-900">{lastRegisteredMember.city || "-"}, {lastRegisteredMember.province || "-"}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      clearForm();
                    }}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-bold rounded-lg transition"
                  >
                    Daftar Akun Baru Lainnya
                  </button>
                  <button
                    onClick={() => {
                      if (lastRegisteredMember) {
                        setLookupQuery(lastRegisteredMember.plateNumber);
                        setActiveTab("membership-lookup");
                        // immediately click search look
                        setTimeout(() => {
                          const btn = document.getElementById("search-lookup-btn");
                          if (btn) btn.click();
                        }, 200);
                      } else {
                        setActiveTab("membership-lookup");
                      }
                    }}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-md transition"
                  >
                    Lihat Riwayat & Profil Saya
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMemberSubmit} className="space-y-6">
                
                {/* Header Banner Form - Matches Google Form Purple/Teal structure */}
                <div className="bg-gradient-to-r from-teal-700 to-cyan-700 rounded-2xl border-t-[10px] border-teal-500 p-6 shadow-md relative overflow-hidden text-white">
                  <h2 className="text-2xl md:text-3xl font-extrabold">Form Pendataan Member J5 EVO</h2>
                  <p className="text-xs md:text-sm text-teal-50/90 leading-relaxed mt-2 font-medium">
                    Pendataan database resmi anggota, kepemilikan unit Jaecoo J5 EV.
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-teal-600/30 flex justify-between items-center text-xs text-teal-100 font-medium">
                    <span>Database Resmi Komunitas J5 EVO Indonesia</span>
                    <span className="text-red-300 font-bold">* Wajib Diisi</span>
                  </div>
                </div>

                {/* Card Field 1: Nama */}
                <div id="field-nama" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                  <label className="text-base font-bold text-zinc-900 block">
                    Nama Lengkap <span className="text-red-500 font-bold">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 -mt-1 leading-relaxed">
                    Tuliskan nama Anda sesuai dengan yang tertulis pada STNK/KTP kendaraan.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Jawaban Anda"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    className="w-full bg-zinc-50/50 text-zinc-900 border-b-2 border-zinc-200 focus:border-teal-500 py-2 px-3 focus:outline-none transition font-sans text-sm rounded-md"
                  />
                </div>

                {/* Card Field 2: No HP */}
                <div id="field-phone" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                  <label className="text-base font-bold text-zinc-900 block">
                    No Hp / Whatsapp <span className="text-red-500 font-bold">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 -mt-1 leading-relaxed">
                    Guna koordinasi tim admin grup wilayah regional dan broadcast undangan touring resmi.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0812xxxxxxxx"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full bg-zinc-50/50 text-zinc-900 border-b-2 border-zinc-200 focus:border-teal-500 py-2 px-3 focus:outline-none transition font-mono text-sm rounded-md"
                  />
                </div>

                {/* Card Field 3: Alamat */}
                <div id="field-alamat" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                  <label className="text-base font-bold text-zinc-900 block">
                    Alamat Lengkap<span className="text-red-500 font-bold">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 -mt-1 leading-relaxed">
                    Alamat pengiriman atribut merchandise kaos, stiker lambung nomor anggota dinamis.
                  </p>
                  <textarea
                    required
                    rows={2}
                    placeholder="Jawaban Anda"
                    value={regForm.address}
                    onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                    className="w-full bg-zinc-50/50 text-zinc-900 border-b-2 border-zinc-200 focus:border-teal-500 py-2 px-3 focus:outline-none transition font-sans text-sm rounded-md"
                  />
                </div>

                {/* Card Field 3a: Provinsi */}
                <div id="field-provinsi" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                  <label className="text-base font-bold text-zinc-900 block">
                    Provinsi <span className="text-red-500 font-bold">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 -mt-1 leading-relaxed">
                    Tuliskan nama provinsi tempat tinggal domisili Anda (Contoh: DKI Jakarta, Jawa Barat).
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Jawaban Anda"
                    value={regForm.province}
                    onChange={(e) => setRegForm({ ...regForm, province: e.target.value })}
                    className="w-full bg-zinc-50/50 text-zinc-900 border-b-2 border-zinc-200 focus:border-teal-500 py-2 px-3 focus:outline-none transition font-sans text-sm rounded-md"
                  />
                </div>

                {/* Card Field 3b: Kota */}
                <div id="field-kota" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                  <label className="text-base font-bold text-zinc-900 block">
                    Kota / Kabupaten <span className="text-red-500 font-bold">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 -mt-1 leading-relaxed">
                    Tuliskan kota atau kabupaten wilayah Anda berada (Contoh: Jakarta Selatan, Bandung).
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Jawaban Anda"
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    className="w-full bg-zinc-50/50 text-zinc-900 border-b-2 border-zinc-200 focus:border-teal-500 py-2 px-3 focus:outline-none transition font-sans text-sm rounded-md"
                  />
                </div>

                {/* Card Field 4: No Plat */}
                <div id="field-plate" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                  <label className="text-base font-bold text-zinc-900 block">
                    Plat Nomor <span className="text-red-500 font-bold">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 -mt-1 leading-relaxed">
                    Digunakan untuk pencocokan Kehadiran Barcode di gerbang baksos & touring (Contoh: D 1244 AML).
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Jawaban Anda"
                    value={regForm.plateNumber}
                    onChange={(e) => setRegForm({ ...regForm, plateNumber: e.target.value })}
                    className="w-full bg-zinc-50/50 text-zinc-900 border-b-2 border-zinc-200 focus:border-teal-500 py-2 px-3 focus:outline-none transition uppercase font-mono text-sm rounded-md"
                  />
                </div>

                {/* Card Field 5: No Rangka */}
                <div id="field-chassis" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                  <label className="text-base font-bold text-zinc-900 block">
                    No Rangka Kendaraan (Chassis Number) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 -mt-1 leading-relaxed">
                    Dapat dilihat dari STNK Anda contoh 'MF7HD27B8SJ......'
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="MF7HD27B8SJ******"
                    value={regForm.chassisNumber}
                    onChange={(e) => setRegForm({ ...regForm, chassisNumber: e.target.value })}
                    className="w-full bg-zinc-50/50 text-zinc-900 border-b-2 border-zinc-200 focus:border-teal-500 py-2 px-3 focus:outline-none transition uppercase font-mono text-sm rounded-md"
                  />
                </div>

                {/* Optional Field: Email */}
                <div id="field-email" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                  <label className="text-base font-bold text-zinc-900 block">
                    Alamat Email Aktif <span className="text-zinc-500 font-normal">(Opsional)</span>
                  </label>
                  <p className="text-xs text-zinc-500 -mt-1 leading-relaxed">
                    Tuliskan email Anda untuk menerima salinan soft file Kartu Keanggotaan J5 EVO.
                  </p>
                  <input
                    type="email"
                    placeholder="Contoh: nama@domain.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full bg-zinc-50/50 text-zinc-900 border-b-2 border-zinc-200 focus:border-teal-500 py-2 px-3 focus:outline-none transition font-sans text-sm rounded-md"
                  />
                </div>

                {/* Optional Field: Tanggal Lahir */}
                <div id="field-birthdate" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                  <label className="text-base font-bold text-zinc-900 block">
                    Tanggal Lahir <span className="text-zinc-500 font-normal">(Opsional)</span>
                  </label>
                  <p className="text-xs text-zinc-500 -mt-1 leading-relaxed">
                    Tuliskan atau pilih tanggal lahir Anda untuk memudahkan pendataan ucapan selamat hari ulang tahun anggota komunitas.
                  </p>
                  <input
                    type="date"
                    value={regForm.birthDate}
                    onChange={(e) => setRegForm({ ...regForm, birthDate: e.target.value })}
                    className="w-full bg-zinc-50/50 text-zinc-900 border-b-2 border-zinc-200 focus:border-teal-500 py-2 px-3 focus:outline-none transition font-sans text-sm rounded-md border"
                  />
                </div>

                {/* Card Field: Foto Profil Pemilik Kendaraan (Drag-and-Drop / Click) */}
                <div id="field-owner-photo" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                  <label className="text-base font-bold text-zinc-900 block">
                    Foto Profil Pemilik Kendaraan <span className="text-zinc-500 font-normal">(Opsional)</span>
                  </label>
                  <p className="text-xs text-zinc-500 -mt-1 leading-relaxed font-sans">
                    Unggah foto diri Anda sebagai pemilik untuk disematkan langsung pada Kartu Anggota Komunitas. Mendukung tarik-lepas (drag-and-drop) atau klik untuk memilih file dari komputer/HP.
                  </p>
                  
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("border-teal-500", "bg-teal-50/10");
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-teal-500", "bg-teal-50/10");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-teal-500", "bg-teal-50/10");
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setRegForm({ ...regForm, ownerPhoto: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => {
                      const fileInput = document.getElementById("owner-photo-file-id") as HTMLInputElement;
                      if (fileInput) fileInput.click();
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
                      regForm.ownerPhoto
                        ? "border-teal-500 bg-teal-50/10"
                        : "border-zinc-300 hover:border-teal-500 bg-zinc-50/40 hover:bg-zinc-50/80"
                    }`}
                  >
                    <input
                      type="file"
                      id="owner-photo-file-id"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setRegForm({ ...regForm, ownerPhoto: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    {regForm.ownerPhoto ? (
                      <div className="space-y-3">
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-teal-500 shadow-sm relative">
                          <img src={regForm.ownerPhoto} alt="Pratinjau Pemilik" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-xs text-teal-800 font-bold font-mono">
                          ✓ Foto Profil Berhasil Diunggah!
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          Tarik & lepas foto baru atau klik di sini untuk mengganti.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-2">
                        <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 mx-auto">
                          <PlusCircle className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-700 font-bold font-mono">
                            Tarik & Lepaskan foto di sini, atau <span className="text-teal-600 hover:underline">Pilih File</span>
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1">
                            Format gambar PNG, JPG atau WEBP (max 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Field: SELECT CAR VEHICLE PHOTO */}
                

                {/* CTA Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-all duration-300 shadow-md focus:outline-none flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? "Sedang Mengirim..." : "Kirim Formulir"}
                  </button>

                  <button
                    type="button"
                    onClick={clearForm}
                    className="text-zinc-500 hover:text-zinc-800 text-xs font-bold transition focus:outline-none font-mono cursor-pointer"
                  >
                    Kosongkan Formulir
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: SIGN UP EVENTS & KEHADIRAN MANAGEMENT */}
        {activeTab === "events" && (
          <div id="tab-community-events" className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="space-y-2 text-center">
              <span className="px-2.5 py-1 text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200 rounded-full font-bold uppercase">
                KEHADIRAN & PENDAFTARAN AKTIF
              </span>
              <h2 className="text-3xl font-extrabold text-zinc-900">Ikuti Kegiatan Komunitas</h2>
              <p className="text-zinc-650 text-sm max-w-xl mx-auto">
                Silakan pilih salah satu kegiatan yang berstatus aktif di bawah ini untuk berpartisipasi. Anda cukup memasukkan nomor plat terdaftar Anda untuk mengonfirmasi data.
              </p>
            </div>

            {/* List of upcoming activities with responsive direct modal registration */}
            {events.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-50 border border-zinc-200 text-zinc-400">
                Data kegiatan sedang dimuat...
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((evt) => {
                  const alreadyJoinedNum = registrations.filter(r => r.eventId === evt.id).length;
                  const isClosed = evt.status !== "upcoming";
                  
                  return (
                    <div
                      key={evt.id}
                      className={`p-6 rounded-3xl border transition group ${
                        isClosed 
                          ? "bg-zinc-50 border-zinc-200 opacity-75" 
                          : "bg-white border-zinc-200 hover:border-teal-500/50 hover:shadow-md shadow-sm"
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                        {/* Event Photo */}
                        <div 
                          onClick={() => setSelectedEvent(evt)}
                          className="md:col-span-1 rounded-2xl overflow-hidden aspect-video sm:aspect-[4/3] bg-zinc-100 border border-zinc-200 cursor-pointer relative"
                        >
                          <img src={evt.image} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition"></div>
                        </div>

                        {/* Title and details */}
                        <div 
                          onClick={() => setSelectedEvent(evt)}
                          className="md:col-span-2 space-y-2.5 cursor-pointer"
                        >
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-2 py-0.5 text-[9px] font-mono tracking-wider rounded uppercase font-bold ${
                              isClosed 
                                ? "bg-zinc-200 text-zinc-650" 
                                : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                            }`}>
                              {evt.status === "upcoming" ? "📅 AKAN DATANG" : "✅ SELESAI"}
                            </span>
                            <span className="px-2 py-0.5 text-[9px] font-mono bg-teal-50 text-teal-800 rounded font-bold">
                              Kuota: {alreadyJoinedNum} / {evt.slots} Peserta
                            </span>
                          </div>

                          <h4 className="text-lg font-extrabold text-zinc-900 group-hover:text-teal-700 transition leading-tight">{evt.title}</h4>
                          <p className="text-xs text-zinc-650 leading-relaxed font-sans line-clamp-2">{evt.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#005c56]" />
                              {formatDate(evt.date)}
                            </span>
                            <a
                              href={getGoogleMapsUrl(evt.location)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-[#005c56] hover:underline"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#005c56]" />
                              {evt.location.replace(/https?:\/\/[^\s]+/, "Google Maps")}
                            </a>
                            {evt.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#005c56]" />
                                {evt.time}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="md:col-span-1 text-right flex flex-col gap-2">
                          {isClosed ? (
                            <button
                              onClick={() => setSelectedEvent(evt)}
                              className="w-full px-4 py-2 bg-zinc-150 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-200 shadow-2xs hover:bg-zinc-200 cursor-pointer text-center"
                            >
                              Detail Kegiatan (Selesai)
                            </button>
                          ) : (
                            <div className="space-y-2">
                              <button
                                onClick={() => setSelectedEvent(evt)}
                                className="w-full px-4 py-2 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 text-zinc-700 text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                              >
                                Detail Kegiatan <Info className="w-4 h-4 text-zinc-400" />
                              </button>
                              
                              {eventJoiningId === evt.id ? (
                                <button
                                  onClick={() => setEventJoiningId(null)}
                                  className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition cursor-pointer"
                                >
                                  Batal Daftar
                                </button>
                              ) : (
                                <button
                                  onClick={() => setSelectedEvent(evt)}
                                  className="w-full px-5 py-2 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-xs rounded-xl shadow-xs transition uppercase cursor-pointer"
                                >
                                  Daftar Kegiatan
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable Action: Register Form inside the specific Event Row */}
                      {eventJoiningId === evt.id && (
                        <div className="mt-6 pt-5 border-t border-teal-200 bg-teal-50/50 p-4 rounded-2xl border border-teal-200/60 animate-fadeIn text-left">
                          <h5 className="text-xs font-mono tracking-widest text-teal-800 uppercase font-bold mb-1">
                            LOG MASUK PARTISIPASI
                          </h5>
                          <p className="text-xs text-zinc-650 mb-4 font-sans">
                            Konfirmasi kepemilikan akun. Masukkan Nomor Plat J5 Anda (Contoh: B 555 EVO) atau No Handphone terdaftar.
                          </p>

                          <form onSubmit={(e) => registerForEvent(e, evt.id)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div>
                              <label className="text-[11px] font-mono text-zinc-700 block mb-1 font-bold">Nomor Plat J5 EVO *</label>
                              <input
                                type="text"
                                placeholder="Contoh: B 555 EVO"
                                value={joinForm.plateNumber}
                                onChange={(e) => setJoinForm({ ...joinForm, plateNumber: e.target.value })}
                                className="w-full bg-white text-zinc-900 border border-zinc-300 focus:border-teal-400 rounded-lg py-1.5 px-3 focus:outline-none text-xs uppercase font-mono"
                              />
                            </div>
                            
                            <div>
                              <label className="text-[11px] font-mono text-zinc-700 block mb-1 font-bold">No HP Terdaftar *</label>
                              <input
                                type="text"
                                placeholder="Contoh: 0812xxxxxxxx"
                                value={joinForm.phone}
                                onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                                className="w-full bg-white text-zinc-900 border border-zinc-300 focus:border-teal-400 rounded-lg py-1.5 px-3 focus:outline-none text-xs font-mono"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer"
                            >
                              {loading ? "Memproses..." : "Konfirmasi & Daftar Kegiatan"}
                            </button>
                          </form>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MEMBERSHIP LOOKUP & TRACK HISTORY (RIWAYAT PARTISIPASI UNTUK ANGGOTA) */}
        {activeTab === "membership-lookup" && (
          <div id="tab-lookup" className="max-w-3xl mx-auto space-y-8 animate-fadeIn text-left">
            
            <div className="space-y-2 text-center">
              <span className="px-3 py-1 text-[10px] font-mono tracking-widest text-teal-800 bg-teal-50 border border-teal-200 rounded-full font-bold uppercase">
                Pencarian Member & Partisipasi Kegiatan
              </span>
              <h2 className="text-3xl font-extrabold text-zinc-900">Profil Member & Riwayat Partisipasi</h2>
              <p className="text-zinc-600 text-sm max-w-lg mx-auto">
                Gunakan menu pencarian ini untuk melacak status registrasi keanggotaan, serta melacak daftar kehadiran kegiatan yang telah diikuti.
              </p>
            </div>

            {/* Lookup Search Input Bar */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <form onSubmit={handleLookup} className="space-y-3">
                <label className="text-xs font-mono tracking-wider text-zinc-700 uppercase block font-bold">
                  Masukkan ID Anggota / Plat Nomor
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Cari Plat (Misal: D 1244 AML)"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-teal-500 font-sans text-sm uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    id="search-lookup-btn"
                    disabled={loading}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                  >
                    {loading ? "Sedang Mengambil..." : "Cek Keterlibatan"}
                  </button>
                </div>
              </form>

              {lookupError && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}
            </div>

            {/* Results Viewer */}
            {lookupResult ? (
              <div id="lookup-results-profile" className="space-y-6">
                
                {/* 1. Digital Membership Card */}
                {(() => {
                  const attendedCount = lookupResult.history.filter((h: any) => h.status === "Attended").length;
                  
                  // Unique URLs for Scanner
                  const memberId = lookupResult.member.id;
                  const redirectUrl = `${window.location.origin}/?scan=${encodeURIComponent(memberId)}`;
                  // Generate an elegant, scannable high-contrast teal-black QR code using a standard stable secure API
                  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=091e1f&bgcolor=ffffff&data=${encodeURIComponent(redirectUrl)}`;

                  // Determine Tier styling & accents
                  let cardBorderClass = "border-zinc-800";
                  let tierName = "PERUNGGU (BRONZE)";
                  let tierGlow = "shadow-teal-900/20";
                  let tierColorText = "text-teal-400";
                  let badgeBgClass = "bg-teal-950/40 text-teal-300 border-teal-800";
                  let cardBgGlow = "from-[#0a1516] via-[#040809] to-[#0c1819]";

                  if (attendedCount >= 4) {
                    cardBorderClass = "border-amber-500/50";
                    tierName = "ANGGOTA EMAS (GOLD)";
                    tierGlow = "shadow-amber-900/30 ring-2 ring-amber-500/30";
                    tierColorText = "text-amber-400";
                    badgeBgClass = "bg-amber-950/60 text-amber-300 border-amber-600/50";
                    cardBgGlow = "from-[#1b1c11] via-[#080805] to-[#12130e]";
                  } else if (attendedCount >= 2) {
                    cardBorderClass = "border-zinc-400/40";
                    tierName = "ANGGOTA PERAK (SILVER)";
                    tierGlow = "shadow-zinc-700/20";
                    tierColorText = "text-zinc-300";
                    badgeBgClass = "bg-zinc-900/60 text-zinc-200 border-zinc-600";
                    cardBgGlow = "from-[#141618] via-[#050607] to-[#0f1112]";
                  }

                  return (
                    <div id="card-and-actions-wrapper" className="space-y-4">
                      <div 
                        className="w-full max-w-[490px] mx-auto bg-white rounded-[40px] p-6 pt-7 border-[4px] border-[#005c56] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.14),0_15px_30px_-10px_rgba(0,92,86,0.1)] relative overflow-hidden text-left flex flex-col font-card-sans select-none" 
                        id="premium-member-card"
                      >
                        {/* Subtly premium security geometric watermark lines for genuine card texture */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#005c5603_1.2px,transparent_1.2px),linear-gradient(to_bottom,#005c5603_1.2px,transparent_1.2px)] bg-[size:20px_20px] opacity-70 pointer-events-none z-0"></div>
                        <div className="absolute -left-12 -top-12 w-52 h-52 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -right-12 bottom-12 w-52 h-52 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Centered Brand Watermark Logo behind content - Opacity increased to 0.08 for excellent subtle visibility */}
                        <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-[0.08] text-[#005c56] pointer-events-none z-0 select-none">
                          <J5EvoLogo className="w-full h-full" color="#005c56" />
                        </div>

                        {/* Header Section */}
                        <div className="flex items-center gap-4 relative z-10 select-none">
                          {/* J5 EVO Shield Emblem of pine green */}
                          <div className="w-[102px] h-[102px] flex-shrink-0">
                            <J5EvoLogo className="w-full h-full" color="#005c56" />
                          </div>

                          {/* Custom cased cool titles, devoid of any Indonesia tagline */}
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="text-[27px] font-card-display font-extrabold tracking-tight text-[#005c56] leading-none">
                              J5 Evo Community
                            </h3>
                            <div className="w-full h-[2px] bg-[#005c56] my-2.5 opacity-90"></div>
                            <span className="text-[10px] font-card-display font-extrabold text-[#005c56]/90 block tracking-[0.05em] uppercase leading-tight">
                              OFFICIAL LICENSED J5 COMMUNITY
                            </span>
                            <span className="text-[10px] font-card-display font-medium text-[#005c56]/83 block mt-0.5 tracking-wide leading-tight">
                              FROM ATPM JAECOO PARTNERS
                            </span>
                          </div>
                        </div>

                        {/* Header Divider Line */}
                        <div className="flex items-center justify-center gap-2 mt-4.5 mb-5 w-full relative z-10 select-none">
                          <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent to-[#005c56]/40"></div>
                          <span className="text-[10.5px] font-card-display font-extrabold tracking-[0.22em] text-[#005c56] uppercase whitespace-nowrap px-2.5">
                            // MEMBER CARD \\
                          </span>
                          <div className="flex-1 h-[1.5px] bg-gradient-to-l from-transparent to-[#005c56]/40"></div>
                        </div>

                        {/* Portrait Photo centered (fotonya di tengah) */}
                        <div className="flex flex-col items-center justify-center relative z-10 mb-5 select-none font-sans">
                          <div className="relative w-full max-w-[155px] mx-auto">
                            {/* High fidelity pine-green border frame around photo */}
                            <div className="relative aspect-[3/4] w-full rounded-[24px] overflow-hidden border-[3.2px] border-[#005c56] bg-zinc-100 shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
                              <img
                                src={lookupResult.member.ownerPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                                alt="Foto Pemilik"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Attribute Rows - tightened spacing, NO more Status Member row, layout is more compact as requested */}
                        <div className="space-y-0.5 px-1 relative z-10 mb-4 font-card-sans text-left">
                          {/* 1. NAMA */}
                          <div className="flex items-center text-zinc-950 py-0.5">
                            <div className="w-8 flex justify-start text-[#005c56] shrink-0">
                              <User className="w-[18px] h-[18px] stroke-[2.25]" />
                            </div>
                            <span className="w-24 text-zinc-400 font-card-display text-[11px] font-extrabold tracking-wider uppercase">NAMA</span>
                            <span className="text-zinc-450 font-semibold mx-2 shrink-0">:</span>
                            <span className="flex-1 text-zinc-900 font-card-sans text-[13.5px] font-black uppercase truncate select-all">
                              {lookupResult.member.name}
                            </span>
                          </div>

                          {/* 2. MEMBER ID */}
                          <div className="flex items-center text-zinc-950 py-0.5">
                            <div className="w-8 flex justify-start text-[#005c56] shrink-0">
                              <IdCard className="w-[18px] h-[18px] stroke-[2.25]" />
                            </div>
                            <span className="w-24 text-zinc-400 font-card-display text-[11px] font-extrabold tracking-wider uppercase">MEMBER ID</span>
                            <span className="text-zinc-450 font-semibold mx-2 shrink-0">:</span>
                            <span className="flex-1 text-[#005c56] font-mono text-[13.5px] font-black tracking-wider uppercase select-all">
                              {lookupResult.member.id}
                            </span>
                          </div>

                          {/* 3. PLAT NOMOR */}
                          <div className="flex items-center text-zinc-950 py-0.5">
                            <div className="w-8 flex justify-start text-[#005c56] shrink-0">
                              <Car className="w-[18px] h-[18px] stroke-[2.25]" />
                            </div>
                            <span className="w-24 text-zinc-400 font-card-display text-[11px] font-extrabold tracking-wider uppercase">PLAT NOMOR</span>
                            <span className="text-zinc-450 font-semibold mx-2 shrink-0">:</span>
                            <span className="flex-1 text-zinc-900 font-card-sans text-[13.5px] font-black tracking-wide uppercase select-all">
                              {lookupResult.member.plateNumber}
                            </span>
                          </div>

                          {/* 4. REGIONAL (KOTA SAJA) */}
                          <div className="flex items-center text-zinc-950 py-0.5">
                            <div className="w-8 flex justify-start text-[#005c56] shrink-0">
                              <MapPin className="w-[18px] h-[18px] stroke-[2.25]" />
                            </div>
                            <span className="w-24 text-zinc-400 font-card-display text-[11px] font-extrabold tracking-wider uppercase">REGIONAL</span>
                            <span className="text-zinc-450 font-semibold mx-2 shrink-0">:</span>
                            <span className="flex-1 text-zinc-900 font-card-sans text-[13px] font-black uppercase truncate select-all">
                              {(lookupResult.member.city || "-").toUpperCase()}
                            </span>
                          </div>

                          {/* 4.5. TANGGAL LAHIR */}
                          {lookupResult.member.birthDate && (
                            <div className="flex items-center text-zinc-950 py-0.5">
                              <div className="w-8 flex justify-start text-[#005c56] shrink-0">
                                <Cake className="w-[18px] h-[18px] stroke-[2.25] text-rose-600" />
                              </div>
                              <span className="w-24 text-zinc-400 font-card-display text-[11px] font-extrabold tracking-wider uppercase">TGL LAHIR</span>
                              <span className="text-zinc-450 font-semibold mx-2 shrink-0">:</span>
                              <span className="flex-1 text-zinc-900 font-card-sans text-[13px] font-black uppercase truncate select-all">
                                {(() => {
                                  try {
                                    const date = new Date(lookupResult.member.birthDate);
                                    if (isNaN(date.getTime())) return lookupResult.member.birthDate;
                                    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                                  } catch (e) {
                                    return lookupResult.member.birthDate;
                                  }
                                })()}
                              </span>
                            </div>
                          )}

                          {/* 5 & 6. COMBINED TIGHTLY: TANGGAL BERGABUNG AND MEMBERSHIP TIER ON ONE SINGLE ROW (SIDE-BY-SIDE & PERFECTLY CENTERED) */}
                          <div className="grid grid-cols-2 gap-2 py-2 border-t border-zinc-100 mt-2 text-center divide-x divide-zinc-100">
                            {/* Left Column: Tanggal Bergabung */}
                            <div className="flex flex-col items-center justify-center text-zinc-950 min-w-0 px-2">
                              <div className="flex items-center gap-1.5 mb-1 text-[#005c56]">
                                <Calendar className="w-4 h-4 stroke-[2.25]" />
                                <span className="text-zinc-400 font-card-display text-[8.5px] font-extrabold tracking-wider uppercase">BERGABUNG</span>
                              </div>
                              <span className="text-zinc-900 font-card-sans text-[12px] font-black uppercase leading-none">
                                {(() => {
                                  const dateStr = lookupResult.member.registeredAt;
                                  if (!dateStr) return "-";
                                  try {
                                    const months = [
                                      "JAN", "FEB", "MAR", "APR", "MEI", "JUN",
                                      "JUL", "AGU", "SEP", "OKT", "NOV", "DES"
                                    ];
                                    const date = new Date(dateStr);
                                    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
                                  } catch (e) {
                                    return "-";
                                  }
                                })()}
                              </span>
                            </div>

                            {/* Right Column: Jenis Membership with highly attractive golden/metallic gradient look */}
                            <div className="flex flex-col items-center justify-center text-zinc-950 min-w-0 px-2">
                              <div className="flex items-center gap-1.5 mb-1 text-[#005c56]">
                                <Award className="w-4 h-4 stroke-[2.25]" />
                                <span className="text-zinc-400 font-card-display text-[8.5px] font-extrabold tracking-wider uppercase">MEMBERSHIP</span>
                              </div>
                              <div className="flex items-center justify-center">
                                {(lookupResult.member.membershipTier || "SILVER") === "GOLD" ? (
                                  <span className="inline-flex items-center justify-center bg-gradient-to-r from-[#d4af37] via-[#fdf1cb] to-[#aa7c11] text-zinc-950 font-card-display text-[9px] font-black tracking-widest uppercase text-center px-2.5 py-0.5 rounded-md shadow-[0_2px_10px_rgba(212,175,55,0.4)] border border-[#fef08a]/70 min-w-[76px] h-[19px] leading-none">
                                    ★ GOLD ★
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center bg-gradient-to-r from-[#94a3b8] via-[#f1f5f9] to-[#64748b] text-slate-900 font-card-display text-[9px] font-black tracking-widest uppercase text-center px-2.5 py-0.5 rounded-md shadow-[0_2px_10px_rgba(148,163,184,0.35)] border border-[#e2e8f0]/60 min-w-[76px] h-[19px] leading-none">
                                    SILVER
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ULTRA FUTURISTIC CORE FOOTER - Sleek matrix cyber cockpit with glowing neon elements */}
                        <div className="bg-[#031d1b] text-white rounded-b-[36px] p-5 pt-6 pb-6 mt-auto -mx-6 -mb-6 relative overflow-hidden z-20 shrink-0 select-none border-t border-[#00ffd2]/45 shadow-[inset_0_3px_15px_rgba(0,255,210,0.25)]">
                          {/* Tech Grid cyber overlay matrix */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffd20b_1px,transparent_1px),linear-gradient(to_bottom,#00ffd20b_1px,transparent_1px)] bg-[size:10px_10px] opacity-70 pointer-events-none"></div>
                          <div className="absolute -right-16 -top-16 w-36 h-36 bg-[#00ffd2]/12 rounded-full blur-2xl pointer-events-none"></div>
                          <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-[#00ffd2]/12 rounded-full blur-2xl pointer-events-none"></div>
                          
                          {/* Animated glowing neon-teal visual top wire */}
                          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#00ffd2] to-transparent opacity-100 z-25"></div>

                          {/* Tech Cockpit telemetry labels */}
                          <div className="flex items-center justify-between text-[#00ffd2] text-[8px] font-mono tracking-[0.25em] uppercase opacity-90 mb-3.5 relative z-10 px-0.5">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              REV // JAECOO J5 SECURE
                            </span>
                            <span>EVO SYSTEM CORES v2.8 // ACTIVE</span>
                          </div>

                          <div className="flex items-center justify-between gap-3 relative z-10 w-full mt-1.5">
                            {/* Instructions block on Left */}
                            <div className="flex items-center gap-3">
                              <div className="text-[#00ffd2] bg-teal-950/60 p-2.5 rounded-xl border border-[#00ffd2]/40 shadow-[0_0_12px_rgba(0,255,210,0.15)] shrink-0 relative">
                                <span className="absolute inset-0 rounded-xl bg-[#00ffd2]/10 animate-ping"></span>
                                <Smartphone className="w-5.5 h-5.5 stroke-[2] relative z-10 text-[#00ffd2]" />
                              </div>
                              <div className="text-left">
                                <span className="text-[10px] font-card-display font-black tracking-widest text-[#00ffd2] block uppercase leading-none">
                                  SECURE SCAN VERIFICATION
                                </span>
                                <p className="text-[9px] text-teal-100/90 font-card-sans font-semibold leading-normal mt-1 max-w-[205px]">
                                  Pindai kode QR untuk memverifikasi keabsahan kartu sebagai anggota resmi.
                                </p>
                              </div>
                            </div>

                            {/* Minimalist neon-style visual divider block */}
                            <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-[#00ffd2]/40 to-transparent shrink-0"></div>

                            {/* QR Code container with intense pulsing neon border shadow */}
                            <div className="bg-white p-1.5 rounded-2xl shadow-[0_0_18px_rgba(0,255,210,0.45)] border border-[#00ffd2]/50 shrink-0 transform transition-transform duration-300">
                              <div className="w-[74px] h-[74px] flex items-center justify-center relative bg-white rounded-lg overflow-hidden">
                                <img
                                  src={qrSrc}
                                  alt="Barcode Anggota"
                                  className="w-[66px] h-[66px] object-contain"
                                  referrerPolicy="no-referrer"
                                  id="member-qr-image"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Futuristic bottom security notice - changed to user's exact wording: Jaecoo J5 Electric Vehicle Owner Community */}
                          <div className="mt-4 pt-3 border-t border-[#00ffd2]/20 flex items-center justify-between text-[7.5px] font-mono tracking-[0.16em] text-teal-200/60 uppercase leading-none relative z-10">
                            <span>Jaecoo J5 Electric Vehicle Owner Community</span>
                            <span>EVO ENCRYPTED DECLARED</span>
                          </div>
                        </div>

                      </div>

                      {/* Download Button right under Card with delightful animations */}
                      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center max-w-[490px] mx-auto mt-2 mb-4 select-none">
                        <button
                          onClick={handleDownloadCard}
                          type="button"
                          className="w-full bg-gradient-to-r from-[#005c56] to-teal-700 hover:from-teal-700 hover:to-teal-600 font-sans text-xs font-black tracking-widest uppercase text-white py-3.5 px-6 rounded-2xl shadow-[0_8px_20px_rgba(0,92,86,0.25)] hover:shadow-[0_12px_24px_rgba(0,92,86,0.35)] hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-[0.98] duration-200"
                        >
                          <Download className="w-4 h-4" />
                          Unduh Kartu Member (PNG)
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Participation History Trail */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    <h4 className="font-sans font-bold text-lg text-zinc-900">Riwayat Partisipasi & Kehadiran</h4>
                  </div>

                  {lookupResult.history.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-500">
                      Anggota ini belum mendaftar di kegiatan komunitas manapun.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lookupResult.history.map((hist: any) => (
                        <div
                          key={hist.registrationId}
                          className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-sm text-zinc-900">{hist.eventTitle}</h5>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-550">
                              <span>📅 {hist.eventDate}</span>
                              <span>•</span>
                              <span>📍 {hist.eventLocation}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase border ${
                              hist.status === "Attended"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : hist.status === "Absent"
                                ? "bg-red-50 text-red-800 border-red-200"
                                : "bg-cyan-50 text-cyan-800 border-cyan-200"
                            }`}>
                              {hist.status === "Attended" ? "🟢 Hadir (Attended)" : hist.status === "Absent" ? "🔴 Absen (Absent)" : "🔵 Terdaftar (Registered)"}
                            </span>
                            <span className="block text-[9px] text-zinc-400 font-mono mt-1">
                              Kehadiran: {new Date(hist.registeredAt).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              // Empty search state instructions
              <div className="p-8 text-center rounded-3xl bg-zinc-50 border border-zinc-200 shadow-2xs">
                <Info className="w-8 h-8 text-teal-600 mx-auto mb-2 opacity-80" />
                <p className="text-xs text-zinc-600 font-medium">
                  Belum ada pencarian. Silakan isi form pencarian di atas untuk mematangkan data kehadiran Anda.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ADMIN SPECIAL MONITORING & EXCEL EXPORTER DASHBOARD */}
        {activeTab === "admin-dashboard" && (
          !adminAuthenticated ? (
            <div id="admin-login-gate" className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-zinc-200 shadow-lg text-left space-y-6 my-12 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-605 mx-auto shadow-xs">
                  <Shield className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-extrabold font-sans text-zinc-900 text-center">Administrator J5 EVO</h3>
                <p className="text-xs text-zinc-550 font-medium text-center">Silakan masukkan username dan password admin resmi untuk melanjutkan.</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-white text-zinc-800 border border-zinc-200 rounded-xl py-2.5 px-3 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-sans text-sm shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-750 block">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-white text-zinc-800 border border-zinc-200 rounded-xl py-2.5 px-3 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-sans text-sm shadow-2xs"
                  />
                </div>

                {loginError && (
                  <p className="text-xs font-bold text-red-650 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    ⚠️ {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-sm rounded-xl transition duration-300 shadow-sm cursor-pointer"
                >
                  Masuk
                </button>
              </form>

             
            </div>
          ) : (
            <div id="tab-admin-panel" className="space-y-10 animate-fadeIn text-left">
            
            {/* Header banner with report download button */}
            <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-3xl sm:flex items-center justify-between gap-6 relative overflow-hidden shadow-sm">
              <div className="absolute right-0 top-0 -mr-12 -mt-12 w-44 h-44 bg-teal-500/5 rounded-full blur-2xl"></div>
              
              <div className="space-y-2 flex-1">
                <span className="px-3 py-1 text-[9px] font-mono tracking-widest text-teal-800 bg-teal-50 rounded-full border border-teal-200 font-bold uppercase">
                  ADMINISTRATOR SECURE AREA
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900">Panel Monitoring & Ekspor Laporan</h2>
                <p className="text-zinc-650 text-sm leading-relaxed max-w-2xl font-medium">
                  Sistem kendali terpusat untuk memantau data member, mendaftarkan kegiatan touring resmi baru, melakukan pencatatan visual kehadiran, serta mengunduh database format Excel untuk laporan tahunan.
                </p>
              </div>

              <div className="mt-6 sm:mt-0 flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="px-5 py-3 bg-emerald-600 border border-emerald-700 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-2 focus:outline-none cursor-pointer min-w-[210px]"
                >
                  <Download className="w-4 h-4 text-white" strokeWidth={3} />
                  Ekspor Database ke Excel
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="px-5 py-3 bg-red-600 border border-red-700 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-2 focus:outline-none cursor-pointer"
                >
                  Keluar Admin
                </button>
              </div>
            </div>

            {/* 1. Kelola & Daftar Kegiatan Komunitas Card */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
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
                    <button
                      type="button"
                      onClick={() => startEditingEvent(evt)}
                      className="px-2.5 py-1.5 bg-teal-50 hover:bg-[#005c56] text-[#005c56] hover:text-white border border-teal-200 rounded-lg text-[10px] font-bold transition flex-shrink-0 cursor-pointer shadow-3xs"
                    >
                      Kelola & Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Selected Event Editor Panel */}
            {editingEventId && editEventForm && (
              <div id="editor-section-anchor" className="bg-white p-6 md:p-8 rounded-3xl border border-teal-200 shadow-md space-y-6 animate-fadeIn relative">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingEventId(null);
                    setEditEventForm(null);
                  }}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition text-zinc-500 hover:text-zinc-805 border border-zinc-200 cursor-pointer"
                  title="Batalkan editing"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
                  <FileText className="w-6 h-6 text-teal-700" />
                  <div>
                    <h3 className="font-sans font-black text-lg text-zinc-900">Program Mode: Sunting Detail Kegiatan</h3>
                    <p className="text-xs text-zinc-500">Edit informasi general, upload multiple foto galeri, dan kelola daftar kehadiran member.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveEditedEvent} className="space-y-6 text-xs text-left">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: General Fields (6 cols) */}
                    <div className="lg:col-span-6 space-y-4">
                      {/* Judul Kegiatan */}
                      <div className="space-y-1">
                        <label className="text-zinc-750 font-bold font-sans">Judul Kegiatan *</label>
                        <input
                          type="text"
                          required
                          value={editEventForm.title}
                          onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })}
                          className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
                        />
                      </div>

                      {/* Tanggal & Waktu */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-zinc-750 font-bold font-sans">Hari / Tanggal *</label>
                          <input
                            type="text"
                            required
                            value={editEventForm.date}
                            onChange={(e) => setEditEventForm({ ...editEventForm, date: e.target.value })}
                            className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-zinc-750 font-bold font-sans">Waktu / Jam *</label>
                          <input
                            type="text"
                            required
                            value={editEventForm.time}
                            onChange={(e) => setEditEventForm({ ...editEventForm, time: e.target.value })}
                            className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
                          />
                        </div>
                      </div>

                      {/* Lokasi & Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-zinc-750 font-bold font-sans">Lokasi (Google Maps) *</label>
                          <input
                            type="text"
                            required
                            value={editEventForm.location}
                            onChange={(e) => setEditEventForm({ ...editEventForm, location: e.target.value })}
                            className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-zinc-755 font-bold font-sans">Status Giat *</label>
                          <select
                            value={editEventForm.status}
                            onChange={(e) => setEditEventForm({ ...editEventForm, status: e.target.value as any })}
                            className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-bold"
                          >
                            <option value="upcoming">Akan Datang (Upcoming)</option>
                            <option value="ongoing">Sedang Berjalan (Ongoing)</option>
                            <option value="completed">Selesai (Completed)</option>
                          </select>
                        </div>
                      </div>

                      {/* Slots & Image Upload */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-zinc-750 font-bold font-sans">Kuota Maksimal (Slots) *</label>
                          <input
                            type="number"
                            required
                            value={editEventForm.slots}
                            onChange={(e) => setEditEventForm({ ...editEventForm, slots: parseInt(e.target.value) || 50 })}
                            className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-mono font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-zinc-750 font-bold font-sans">Ganti Pamflet Banner</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setEditEventForm((prev: any) => ({ ...prev, image: reader.result as string }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full text-[10px] text-zinc-650 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-teal-50 file:text-[#005c56] file:font-bold hover:file:bg-teal-100 cursor-pointer border border-zinc-200 rounded-lg p-1.5 bg-zinc-50"
                          />
                        </div>
                      </div>

                      {/* Deskripsi */}
                      <div className="space-y-1">
                        <label className="text-zinc-750 font-bold font-sans">Deskripsi Kegiatan *</label>
                        <textarea
                          rows={6}
                          required
                          value={editEventForm.description}
                          onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })}
                          className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Right Column: Multiple gallery upload and attendee presence selector (6 cols) */}
                    <div className="lg:col-span-6 space-y-4 flex flex-col h-full">
                      {/* Section Upload Multiple Foto */}
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase font-mono tracking-wider font-extrabold text-[#005c56] block">
                            📸 Galeri Foto Dokumentasi (Multiple Upload)
                          </span>
                          <span className="px-2 py-0.5 bg-teal-100 border border-teal-200 text-[10px] text-teal-800 rounded font-mono font-bold">
                            Total: {editEventForm.galleryImages.length} Foto
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                          Pilih beberapa berkas foto dokumentasi kegiatan dari komputer Anda sekaligus untuk mengunggah multiple file ke galeri resmi.
                        </p>
                        
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleMultipleGalleryUpload}
                          className="w-full text-xs text-zinc-650 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#005c56] file:text-white hover:file:bg-[#004843] cursor-pointer border border-zinc-200 rounded-lg p-2 bg-white font-bold"
                        />

                        {/* Gallery Thumbnails list inside Form with remove action */}
                        {editEventForm.galleryImages.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1.5 bg-white border border-zinc-200 rounded-xl">
                            {editEventForm.galleryImages.map((img: string, idx: number) => (
                              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-zinc-300 group shadow-2xs">
                                <img src={img} alt="thumb" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditEventForm((prev: any) => {
                                      if (!prev) return null;
                                      const updated = prev.galleryImages.filter((_: any, i: number) => i !== idx);
                                      return { ...prev, galleryImages: updated };
                                    });
                                  }}
                                  className="absolute top-1 right-1 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow cursor-pointer shadow-sm"
                                  title="Pruning foto"
                                >
                                  <X className="w-2.5 h-2.5" strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-zinc-400 font-mono italic text-center py-2">Belum ada foto dokumentasi diunggah.</p>
                        )}
                      </div>

                      {/* Section Presensi Member Kehadiran */}
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3 flex-1 flex flex-col">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs uppercase font-mono tracking-wider font-extrabold text-[#005c56] block">
                            👤 Atur Kehadiran Member ({editEventForm.registrations.length} Hadir/Terdaftar)
                          </span>
                          <input
                            type="text"
                            placeholder="Cari nama / plat member..."
                            value={editEventSearchMember}
                            onChange={(e) => setEditEventSearchMember(e.target.value)}
                            className="bg-white border border-zinc-250 rounded-md py-1 px-2.5 text-[10px] text-zinc-950 focus:outline-none focus:border-teal-555 min-w-[125px] font-semibold shadow-3xs"
                          />
                        </div>

                        {/* List of members with Attendance Status selectors */}
                        <div className="space-y-2 overflow-y-auto max-h-[350px] flex-1 pr-1 bg-white p-2 border border-zinc-200 rounded-xl">
                          {(() => {
                            const filteredMembers = members.filter((m) => {
                              const q = editEventSearchMember.trim().toLowerCase();
                              if (!q) return true;
                              return m.name.toLowerCase().includes(q) || m.plateNumber.toLowerCase().includes(q);
                            });

                            if (filteredMembers.length === 0) {
                              return <p className="text-[10px] text-zinc-400 italic text-center py-4 font-mono">Member tidak ditemukan.</p>;
                            }

                            return filteredMembers.map((m) => {
                              const reg = editEventForm.registrations.find((r: any) => r.memberId === m.id);
                              const currentStatus = reg ? reg.status : "None";

                              return (
                                <div key={m.id} className="p-2 rounded-lg border border-zinc-150 flex items-center justify-between gap-3 text-[11px] hover:bg-zinc-50/50">
                                  <div className="min-w-0">
                                    <p className="font-bold text-zinc-900 truncate">{m.name}</p>
                                    <p className="text-[9px] font-mono text-zinc-500 font-bold">{m.plateNumber} | {m.city}</p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMemberAttendanceInForm(m, "Attended")}
                                      className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-black tracking-tighter uppercase border transition cursor-pointer ${
                                        currentStatus === "Attended"
                                          ? "bg-emerald-650 border-emerald-700 text-white shadow-3xs hover:bg-emerald-750"
                                          : "bg-white border-zinc-250 text-zinc-550 hover:bg-zinc-100"
                                      }`}
                                    >
                                      Hadir
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMemberAttendanceInForm(m, "Absent")}
                                      className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-black tracking-tighter uppercase border transition cursor-pointer ${
                                        currentStatus === "Absent"
                                          ? "bg-red-650 border-red-700 text-white shadow-3xs hover:bg-red-750"
                                          : "bg-white border-zinc-250 text-zinc-555 hover:bg-zinc-100"
                                      }`}
                                    >
                                      Absen
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMemberAttendanceInForm(m, "Registered")}
                                      className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-black tracking-tighter uppercase border transition cursor-pointer ${
                                        currentStatus === "Registered"
                                          ? "bg-amber-500 border-amber-600 text-white shadow-3xs hover:bg-amber-600"
                                          : "bg-white border-zinc-250 text-zinc-555 hover:bg-[#fffae6]"
                                      }`}
                                    >
                                      Daftar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMemberAttendanceInForm(m, "None")}
                                      className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-black tracking-tighter uppercase border transition cursor-pointer ${
                                        currentStatus === "None"
                                          ? "bg-zinc-500 border-zinc-650 text-white shadow shadow-inner"
                                          : "bg-white border-zinc-250 text-zinc-400 hover:bg-zinc-100"
                                      }`}
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEventId(null);
                        setEditEventForm(null);
                      }}
                      className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 font-extrabold text-xs rounded-xl shadow-xs cursor-pointer select-none"
                    >
                      Batal / Tutup Editor
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-[#005c56] hover:bg-[#004a45] hover:scale-[1.01] text-white font-extrabold text-xs rounded-xl transition shadow shadow-md cursor-pointer select-none flex items-center justify-center gap-1.5 transform active:scale-95 duration-105"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {loading ? "Sedang Menyimpan..." : "Simpan Semua Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Admin Grid Actions (Form create + List of Attendees) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Create Event (5 cols) */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
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
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
                    />
                  </div>

                  {/* Hari / Tanggal with Calendar Helper */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-750 font-bold font-sans">Hari / Tanggal *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Minggu, 24 Mei 2026"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-750 font-bold font-sans">Pilih dari Kalender (Auto-format)</label>
                      <input
                        type="date"
                        onChange={(e) => {
                          const dVal = e.target.value;
                          if (dVal) {
                            const formatted = formatDate(dVal);
                            setNewEvent({ ...newEvent, date: formatted });
                          }
                        }}
                        className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Waktu & Kuota Slots */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-750 font-bold font-sans">Waktu *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 09:00 - Selesai"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-750 font-bold font-sans">Kuota Maksimal (Slots)</label>
                      <input
                        type="number"
                        min="5"
                        max="200"
                        value={newEvent.slots}
                        onChange={(e) => setNewEvent({ ...newEvent, slots: parseInt(e.target.value) || 30 })}
                        className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Lokasi (Google Maps) */}
                  <div className="space-y-1">
                    <label className="text-zinc-750 font-bold font-sans">Lokasi (Google Maps) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: https://maps.app.goo.gl/r6Tf7X atau Senayan Park, Jakarta"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold"
                    />
                  </div>

                  {/* Deskripsi Kegiatan EDITOR */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-zinc-750 font-bold font-sans">Deskripsi Kegiatan * (Dengan EDITOR)</label>
                      <span className="text-[10px] text-teal-800 font-mono font-bold uppercase bg-teal-50 px-1 border border-teal-150 rounded">WYSIWYG Mode</span>
                    </div>

                    {/* Editor Action Buttons Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-100 border border-zinc-250 rounded-t-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setNewEvent(prev => ({ ...prev, description: prev.description + " **Tebal**" }));
                        }}
                        className="px-2 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 rounded font-bold text-[10px] text-zinc-700 cursor-pointer shadow-2xs"
                      >
                        <b>B</b> Tebal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewEvent(prev => ({ ...prev, description: prev.description + " *Miring*" }));
                        }}
                        className="px-2 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 rounded font-bold text-[10px] text-zinc-700 cursor-pointer shadow-2xs"
                      >
                        <i>I</i> Miring
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewEvent(prev => ({ ...prev, description: prev.description + " [Link Google Maps](https://maps.google.com)" }));
                        }}
                        className="px-2 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 rounded font-bold text-[10px] text-zinc-700 cursor-pointer shadow-2xs text-teal-700"
                      >
                        🔗 Tautan Maps
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewEvent(prev => ({ ...prev, description: prev.description + "\n- Poin Kegiatan" }));
                        }}
                        className="px-2 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 rounded font-bold text-[10px] text-zinc-700 cursor-pointer shadow-2xs"
                      >
                        • Poin List
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewEvent(prev => ({ ...prev, description: prev.description + "\n\n" }));
                        }}
                        className="px-2 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 rounded font-bold text-[10px] text-zinc-700 cursor-pointer shadow-2xs"
                      >
                        ↵ Paragraf Baru
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewEvent(prev => ({ ...prev, description: "Halo Teman Teman ada acara J5 Evo x Jaecoo Gathering!\n\nKami mengundang seluruh premium EV owners untuk berhimpun menjalin keakraban, berdiskusi tips pemeliharaan software, ADAS Level 2+, serta sharing tren roda terbaru.\n\nMari merapat!" }));
                        }}
                        className="px-2 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded font-bold text-[10px] text-teal-800 cursor-pointer shadow-2xs ml-auto"
                      >
                        ✨ Gunakan Template
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      required
                      placeholder="Masukkan deskripsi kegiatan di sini. Gunakan tombol editor di atas untuk membantu memformat tulisan Anda..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full bg-zinc-50 text-zinc-900 border-x border-b border-zinc-250 rounded-b-lg p-2.5 focus:outline-none focus:border-teal-500 focus:bg-white text-xs font-semibold leading-relaxed"
                    />

                    {/* Live Preview Inside Editor */}
                    {newEvent.description && (
                      <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Live Pratinjau Deskripsi:</div>
                        <div className="text-xs text-zinc-800 space-y-2 leading-relaxed">
                          {newEvent.description.split("\n").map((line, lid) => {
                            if (!line.trim()) return <div key={lid} className="h-2"></div>;
                            
                            // Simple markdown processing for preview
                            let content: React.ReactNode = line;
                            
                            // Bold check
                            if (line.includes("**")) {
                              const parts = line.split("**");
                              content = parts.map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="font-extrabold text-teal-900">{part}</strong> : part);
                            }
                            
                            // Bullet checking
                            if (line.startsWith("- ")) {
                              return <li key={lid} className="ml-4 list-disc text-zinc-800">{line.substring(2)}</li>;
                            }
                            
                            return <p key={lid} className="font-sans font-medium">{content}</p>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Foto Kegiatan / Pamplet */}
                  <div className="space-y-1">
                    <label className="text-zinc-750 font-bold font-sans block mb-1">Foto Kegiatan / Pamplet (Upload) *</label>
                    <input
                      type="file"
                      id="upload-banner-giat"
                      accept="image/*"
                      onChange={handleEventPhotoUpload}
                      className="w-full text-xs text-zinc-650 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-[#005c56] hover:file:bg-teal-100 cursor-pointer border border-zinc-200 rounded-lg p-2 bg-zinc-50 font-bold"
                    />
                    {newEvent.image ? (
                      <div className="mt-2 h-32 w-full overflow-hidden rounded-lg border border-zinc-200 shadow-inner relative">
                        <img
                          src={newEvent.image}
                          alt="Layout Pamflet Kegiatan"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          id="btn-remove-banner"
                          onClick={() => setNewEvent((prev) => ({ ...prev, image: "" }))}
                          className="absolute top-1.5 right-1.5 bg-red-100 text-red-600 px-2 py-1 rounded-full text-[10px] hover:bg-red-200 font-bold shadow-sm cursor-pointer"
                        >
                          Hapus Pamflet
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500 font-mono italic">Silakan unggah pamplet giat resmi member (*.png, *.jpg).</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="btn-submit-giat"
                    className="w-full py-2.5 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-xs rounded-xl shadow-md transition uppercase cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Publikasikan Kegiatan ini
                  </button>
                </form>
              </div>

              {/* Attendance Sheet Logs & Quick Actions (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Modul Kehadiran Member */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <h4 className="font-sans font-bold text-base text-zinc-900">Pencatatan Kehadiran Member (Scan Barcode / No Polisi)</h4>
                  </div>
                  <p className="text-zinc-650 text-xs leading-relaxed font-sans">
                    Pindai Barcode Member ID (format: J5EVO-...) atau input langsung Nomor Plat Kendaraan (contoh: D 1244 AML) untuk mendaftarkan dan memverifikasi Kehadiran Member pada kegiatan tertentu.
                  </p>
                  
                  <form onSubmit={handleRecordAttendance} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-zinc-700 font-semibold font-sans">Pilih Kegiatan *</label>
                        <select
                          required
                          id="select-kehadiran-event"
                          value={adminAttendanceEventId}
                          onChange={(e) => setAdminAttendanceEventId(e.target.value)}
                          className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 text-xs font-medium"
                        >
                          <option value="">-- Pilih Kegiatan --</option>
                          {events.map((evt) => (
                            <option key={evt.id} value={evt.id}>
                              {evt.title} ({evt.status === "upcoming" ? "Akan Datang" : "Selesai"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-700 font-semibold font-sans">Plat Nomor / ID Member *</label>
                        <input
                          type="text"
                          required
                          id="input-kehadiran-query"
                          placeholder="Contoh: D 1244 AML atau J5EVO-202605-0002"
                          value={adminAttendanceQuery}
                          onChange={(e) => setAdminAttendanceQuery(e.target.value)}
                          className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-[#005c56] text-xs font-mono font-bold uppercase placeholder:normal-case"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="btn-record-kehadiran"
                      className="w-full py-2.5 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-xs rounded-xl transition duration-300 shadow-sm uppercase cursor-pointer"
                    >
                      Mulai Catat Kehadiran
                    </button>
                  </form>
                </div>

                {/* Registrations logs section */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
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
                          <div className="space-y-1 text-right">
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

                {/* Master Member list inside administrative workspace with Delete member action */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-bold text-base text-zinc-900">Daftar Member Komunitas Terdaftar</h4>
                    <span className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-[#005c56] text-[10px] rounded font-mono font-bold">
                      {members.length} Member Terverifikasi
                    </span>
                  </div>

                  {members.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-6 font-medium">Belum ada database anggota terdaftar.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {members.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex gap-3 items-center">
                            <img
                              src={m.carPhoto}
                              alt="car"
                              className="w-12 h-8 object-cover rounded border border-zinc-300 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-zinc-900 text-sm">{m.name}</p>
                              <p className="text-[10px] text-zinc-500">
                                ID: <strong className="text-zinc-800 font-mono text-[11px]">{m.id}</strong> | Plat: <strong className="text-teal-700 font-mono">{m.plateNumber}</strong>
                              </p>
                              <p className="text-[9px] text-zinc-400 font-mono">
                                Chasis: {m.chassisNumber} {m.birthDate ? `| Ultah: ${m.birthDate}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                            {/* Manage Tier Selector */}
                            <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1">
                              <span className="text-[9px] text-zinc-400 px-1 font-bold uppercase whitespace-nowrap">TIER:</span>
                              <select
                                value={m.membershipTier || "SILVER"}
                                onChange={(e) => handleUpdateMemberTier(m.id, m.membershipTier || "SILVER", e.target.value as any)}
                                className="bg-transparent border-0 font-bold focus:ring-0 text-[#005c56] text-[11px] cursor-pointer outline-none"
                              >
                                <option value="SILVER">SILVER</option>
                                <option value="GOLD">GOLD (Pendiri)</option>
                              </select>
                            </div>

                            <button
                              onClick={() => {
                                setEditingMemberId(m.id);
                                setEditMemberForm({ ...m });
                                setTimeout(() => {
                                  const el = document.getElementById("edit-member-section-anchor");
                                  if (el) el.scrollIntoView({ behavior: "smooth" });
                                }, 50);
                              }}
                              className="p-2 text-teal-650 hover:text-white bg-teal-50 hover:bg-teal-650 border border-teal-100 rounded-lg transition cursor-pointer"
                              title="Edit Data Member"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteMember(m.id, m.name)}
                              className="p-2 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-100 rounded-lg transition cursor-pointer"
                              title="Hapus / Nonaktifkan Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* INTERACTIVE MEMBER EDITING PANEL (ADMIN ONLY) */}
                {editingMemberId && editMemberForm && (
                  <div id="edit-member-section-anchor" className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-3xl border-2 border-teal-500 shadow-md space-y-4 animate-fade-in scroll-mt-6">
                    <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-teal-700" />
                        <div>
                          <h4 className="font-sans font-bold text-base text-zinc-900">Sunting Profile Member</h4>
                          <p className="text-2xs text-[#005c56] font-mono font-bold">ID: {editingMemberId}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingMemberId(null);
                          setEditMemberForm(null);
                        }}
                        className="p-1 px-2.5 bg-zinc-150 hover:bg-zinc-200 rounded-lg text-xs font-bold text-zinc-700 transition"
                      >
                        Batal
                      </button>
                    </div>

                    <form onSubmit={handleEditMemberSubmit} className="space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        
                        <div className="space-y-1">
                          <label className="text-zinc-700 font-bold block">Nama Lengkap *</label>
                          <input
                            type="text"
                            required
                            value={editMemberForm.name || ""}
                            onChange={(e) => setEditMemberForm({ ...editMemberForm, name: e.target.value })}
                            className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-700 font-bold block">No WhatsApp / HP *</label>
                          <input
                            type="text"
                            required
                            value={editMemberForm.phone || ""}
                            onChange={(e) => setEditMemberForm({ ...editMemberForm, phone: e.target.value })}
                            className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-700 font-bold block">Alamat Email</label>
                          <input
                            type="email"
                            value={editMemberForm.email || ""}
                            onChange={(e) => setEditMemberForm({ ...editMemberForm, email: e.target.value })}
                            className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-700 font-bold block">Plat Nomor *</label>
                          <input
                            type="text"
                            required
                            value={editMemberForm.plateNumber || ""}
                            onChange={(e) => setEditMemberForm({ ...editMemberForm, plateNumber: e.target.value.toUpperCase() })}
                            className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-700 font-bold block">No Rangka *</label>
                          <input
                            type="text"
                            required
                            value={editMemberForm.chassisNumber || ""}
                            onChange={(e) => setEditMemberForm({ ...editMemberForm, chassisNumber: e.target.value.toUpperCase() })}
                            className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-700 font-bold block">Tanggal Lahir</label>
                          <input
                            type="date"
                            value={editMemberForm.birthDate || ""}
                            onChange={(e) => setEditMemberForm({ ...editMemberForm, birthDate: e.target.value })}
                            className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-700 font-bold block">Provinsi STNK / KTP *</label>
                          <input
                            type="text"
                            required
                            value={editMemberForm.province || ""}
                            onChange={(e) => setEditMemberForm({ ...editMemberForm, province: e.target.value })}
                            className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-700 font-bold block">Kota Tinggal *</label>
                          <input
                            type="text"
                            required
                            value={editMemberForm.city || ""}
                            onChange={(e) => setEditMemberForm({ ...editMemberForm, city: e.target.value })}
                            className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-700 font-bold block">Membership Tier *</label>
                          <select
                            value={editMemberForm.membershipTier || "SILVER"}
                            onChange={(e) => setEditMemberForm({ ...editMemberForm, membershipTier: e.target.value })}
                            className="w-full bg-white text-zinc-900 border border-teal-300 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-bold text-[#005c56]"
                          >
                            <option value="SILVER">SILVER</option>
                            <option value="GOLD">GOLD (Pendiri)</option>
                          </select>
                        </div>

                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-700 font-bold block">Alamat Lengkap *</label>
                        <textarea
                          required
                          value={editMemberForm.address || ""}
                          onChange={(e) => setEditMemberForm({ ...editMemberForm, address: e.target.value })}
                          rows={2}
                          className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
                        ></textarea>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-teal-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMemberId(null);
                            setEditMemberForm(null);
                          }}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl hover:scale-102 active:scale-98 transition shadow-sm cursor-pointer"
                        >
                          Simpan Perubahan Member
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* FAQ Administration Card Section */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-teal-700 font-bold" />
                      <h4 className="font-sans font-bold text-base text-zinc-900">Kelola Katalog FAQ & Kendala Teknis</h4>
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
                        <label className="text-zinc-700 font-bold font-sans">Kategori FAQ *</label>
                        <select
                          required
                          value={adminFaqForm.category}
                          onChange={(e) => setAdminFaqForm({ ...adminFaqForm, category: e.target.value })}
                          className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
                        >
                          <option value="Setir & Pengendalian">Setir & Pengendalian</option>
                          <option value="Pengereman & Traksi">Pengereman & Traksi</option>
                          <option value="Eksterior & Bodi">Eksterior & Bodi</option>
                          <option value="Baterai & Pengisian">Baterai & Pengisian</option>
                          <option value="ADAS & Sensor">ADAS & Sensor</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-750 font-bold font-sans">Sifat / Frekuensi Kejadian *</label>
                        <select
                          required
                          value={adminFaqForm.frequency}
                          onChange={(e) => setAdminFaqForm({ ...adminFaqForm, frequency: e.target.value as any })}
                          className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:border-teal-555 text-xs font-semibold"
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
                        className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-teal-500 text-xs font-semibold"
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
                        className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-teal-500 text-xs font-semibold"
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
                  <div className="space-y-3">
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

                {/* Social Media Configuration Card Section (Admin Only) */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-teal-700 font-bold" />
                      <h4 className="font-sans font-bold text-base text-zinc-900">Kelola Link & Tampilan Sosial Media</h4>
                    </div>
                  </div>

                  {editSocialsForm ? (
                    <form onSubmit={handleUpdateSocialsSubmit} className="space-y-4 text-xs font-sans">
                      <p className="text-zinc-[600] text-xs">
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
                                  className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-teal-555 text-xs font-semibold"
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
                                  className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-lg p-2 focus:outline-none focus:border-teal-555 text-xs font-semibold font-mono"
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
                          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl hover:scale-102 active:scale-98 transition shadow-xs cursor-pointer uppercase font-sans flex items-center gap-1.5"
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

              </div>

            </div>

          </div>
          )
        )}

      </main>

      {/* FOOTER */}
      <footer className="text-center text-xs text-slate-500 border-t border-teal-150 pt-8 mt-12 max-w-7xl mx-auto px-4 pb-8">
        <p className="font-mono">J5 EVO INDONESIA © 2026. All rights reserved.</p>
        <p className="text-teal-700/80 mt-1 font-sans">Official licensed J5 community from ATPM Jaecoo Indonesia Partners</p>
      </footer>

      {/* GALLERY LIGHTBOX INTERACTIVE MODAL */}
      {selectedGalleryImage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/92 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-4xl w-full overflow-hidden my-8 flex flex-col relative max-h-[90vh]">
            
            {/* Header Image Cover with object-contain to allow full visualization */}
            <div className="relative h-[380px] sm:h-[500px] bg-zinc-950 flex-shrink-0 flex items-center justify-center p-3 border-b border-zinc-150 select-none">
              <img
                src={selectedGalleryImage.image}
                alt={selectedGalleryImage.title}
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />

              {/* Navigation Button Overlay: Previous */}
              {selectedAlbumPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPhoto();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white text-zinc-900 border border-zinc-200 rounded-full flex items-center justify-center transition duration-200 hover:scale-110 active:scale-95 shadow-lg z-20 cursor-pointer focus:outline-none"
                  title="Foto Sebelumnya (Arrow Left)"
                >
                  <ChevronLeft className="w-5 h-5 text-zinc-900" strokeWidth={3} />
                </button>
              )}

              {/* Navigation Button Overlay: Next */}
              {selectedAlbumPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPhoto();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white text-zinc-900 border border-zinc-200 rounded-full flex items-center justify-center transition duration-200 hover:scale-110 active:scale-95 shadow-lg z-20 cursor-pointer focus:outline-none"
                  title="Foto Selanjutnya (Arrow Right)"
                >
                  <ChevronRight className="w-5 h-5 text-zinc-900" strokeWidth={3} />
                </button>
              )}

              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={() => setSelectedGalleryImage(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-zinc-900 p-2 rounded-full cursor-pointer transition shadow-md hover:scale-105 z-30 border border-zinc-200 focus:outline-none"
                title="Tutup Galeri (Esc)"
              >
                <X className="w-5 h-5 text-zinc-900" strokeWidth={3} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-left flex-1 font-sans">
              <div className="space-y-2 border-b border-zinc-150 pb-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-wider rounded uppercase font-bold inline-block bg-teal-50 border border-teal-200 text-[#005c56]">
                    {selectedGalleryImage.badge}
                  </span>
                  {selectedAlbumPhotos.length > 1 && (
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded uppercase bg-zinc-100 text-zinc-650 border border-zinc-200">
                      FOTO {currentPhotoIndex + 1} DARI {selectedAlbumPhotos.length}
                    </span>
                  )}
                  <span className="text-[9px] text-zinc-400 font-mono tracking-wide hidden sm:inline ml-auto">
                    Gunakan tombol keyboard ← dan → untuk berpindah foto
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 leading-tight pt-1">
                  {selectedGalleryImage.title}
                </h3>
              </div>
              <p className="text-sm text-zinc-650 leading-relaxed font-sans font-medium">
                {selectedGalleryImage.desc}
              </p>
              
              <div className="pt-2 flex justify-between items-center">
                {selectedAlbumPhotos.length > 1 && (
                  <div className="flex gap-1">
                    {selectedAlbumPhotos.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openGalleryPopup(selectedAlbumPhotos, i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-200 focus:outline-none cursor-pointer ${
                          i === currentPhotoIndex ? "bg-[#005c56] w-6" : "bg-zinc-250 hover:bg-zinc-400"
                        }`}
                        title={`Buka Foto ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => setSelectedGalleryImage(null)}
                  className="ml-auto px-6 py-2 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-xs rounded-xl shadow-xs transition uppercase cursor-pointer"
                >
                  Selesai Melihat
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EVENT DETAIL INTERACTIVE MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-2xl w-full overflow-hidden my-8 flex flex-col relative max-h-[90vh]">
            
            {/* Tutup Button (Sticky/Absolute Top-Right for entire modal) */}
            <button
              onClick={() => {
                setSelectedEvent(null);
                setEventJoiningId(null);
              }}
              className="absolute top-4 right-4 bg-white/95 hover:bg-white text-zinc-900 p-2.5 rounded-full cursor-pointer transition shadow-xl hover:scale-110 z-[120] border border-zinc-200"
              title="Tutup"
            >
              <X className="w-5 h-5 text-zinc-950" strokeWidth={3} />
            </button>

            {/* Continuous Natural Scroll Container */}
            <div className="overflow-y-auto flex-1 flex flex-col">
              
              {/* Header Image Cover inside the scrollable view */}
              <div className="relative h-[250px] sm:h-[350px] bg-zinc-900 flex-shrink-0 flex items-center justify-center p-2 border-b border-zinc-200">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Content Core Body */}
              <div className="p-6 space-y-6 text-left font-sans flex-1">
                
                {/* Event Title and Status Badge inside scrollable body for premium readability */}
              <div className="space-y-2 border-b border-zinc-150 pb-4">
                <span className={`px-2 py-0.5 text-[10px] font-mono tracking-wider rounded uppercase font-bold inline-block border ${
                  selectedEvent.status === "upcoming"
                    ? "bg-cyan-50 border-cyan-300 text-cyan-800"
                    : "bg-zinc-100 border-zinc-300 text-zinc-650"
                }`}>
                  {selectedEvent.status === "upcoming" ? "📅 AKAN DATANG" : "✅ SELESAI"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 leading-tight">
                  {selectedEvent.title}
                </h3>
              </div>

              {/* Visual spec grid */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 font-sans text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 font-mono text-[10px] uppercase font-bold block">Hari / Tanggal</span>
                  <span className="font-extrabold text-zinc-850 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#005c56]" />
                    {formatDate(selectedEvent.date)}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 font-mono text-[10px] uppercase font-bold block">Pukul / Waktu</span>
                  <span className="font-extrabold text-zinc-850 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#005c56]" />
                    {selectedEvent.time || "-"}
                  </span>
                </div>
                <div className="space-y-1 col-span-2 border-t border-zinc-150 pt-2">
                  <span className="text-zinc-400 font-mono text-[10px] uppercase font-bold block">Tempat / Lokasi</span>
                  <span className="font-extrabold text-[#005c56] flex items-center gap-1.5 flex-wrap">
                    <MapPin className="w-4 h-4 text-[#005c56]" />
                    <a
                      href={getGoogleMapsUrl(selectedEvent.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#005c56] hover:underline inline-flex items-center gap-1 font-extrabold"
                    >
                      {selectedEvent.location.replace(/https?:\/\/[^\s]+/, "Google Maps")} <ArrowRight className="w-3 h-3" />
                    </a>
                  </span>
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-400 font-mono">Detail Deskripsi Kegiatan</h4>
                <div className="text-zinc-700 font-semibold text-sm leading-relaxed space-y-3 font-sans">
                  {selectedEvent.description.split("\n").map((line, idx) => {
                    if (!line.trim()) return <div key={idx} className="h-2"></div>;
                    let content: React.ReactNode = line;
                    if (line.includes("**")) {
                      const parts = line.split("**");
                      content = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-teal-850">{part}</strong> : part);
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <li key={idx} className="ml-4 list-disc text-zinc-700 pl-1 font-normal">
                          {line.substring(2)}
                        </li>
                      );
                    }
                    return <p key={idx} className="font-medium">{content}</p>;
                  })}
                </div>
              </div>

              {/* Slots details */}
              <div className="border-t border-zinc-200 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-400 font-mono">Status Kuota & Peserta</h4>
                    <p className="text-zinc-800 font-bold text-sm mt-0.5">
                      Sisa Kuota: <span className="text-teal-700 text-base font-mono font-extrabold">{selectedEvent.slots - (registrations.filter(r => r.eventId === selectedEvent.id).length)}</span> dari {selectedEvent.slots} slot
                    </p>
                  </div>
                </div>

                {selectedEvent.status === "upcoming" ? (
                  <div className="bg-teal-50/50 border border-teal-200 p-5 rounded-2xl space-y-4">
                    <div className="space-y-1">
                      <h5 className="font-extrabold text-teal-900 text-sm">Ikuti Kegiatan Ini Sebagai Member</h5>
                      <p className="text-xs text-zinc-650 leading-relaxed font-sans">
                        Silakan masukkan info plat nomor kendaraan J5 EVO Anda dan No HP WhatsApp yang terdaftar untuk mengonfirmasi kehadiran Anda.
                      </p>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await registerForEvent(e, selectedEvent.id);
                      }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-750 uppercase block">Nomor Plat Mobil J5 EVO</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: D 1244 AML"
                          value={joinForm.plateNumber}
                          onChange={(e) => setJoinForm({ ...joinForm, plateNumber: e.target.value })}
                          className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-xl py-2 px-3 focus:outline-none focus:border-teal-500 font-mono text-xs uppercase"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-750 uppercase block">No HP WhatsApp Terdaftar</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: 0813xxxxxxxx"
                          value={joinForm.phone}
                          onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                          className="w-full bg-white text-zinc-900 border border-zinc-250 rounded-xl py-2 px-3 focus:outline-none focus:border-teal-500 font-mono text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:col-span-2 py-3 bg-[#005c56] hover:bg-[#004843] text-white font-extrabold text-xs rounded-xl shadow-md transition uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 mt-2"
                      >
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                        {loading ? "Menyimpan Partisipasi..." : "Daftar Kegiatan Sekarang"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-zinc-650 text-center py-2 italic font-sans">
                      Kegiatan ini telah selesai terlaksana dengan sukses. Terima kasih untuk partisipasi luar biasa dari semua member!
                    </p>
                  </div>
                )}
              </div>
            </div> {/* Closes Content Core Body */}
          </div> {/* Closes Continuous Natural Scroll Container */}

            {/* Footer navigation */}
            <div className="bg-zinc-50 border-t border-zinc-150 p-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setEventJoiningId(null);
                }}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl transition duration-300 cursor-pointer shadow-sm"
              >
                Tutup Tampilan Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM PREMIUM CONFIRMATION DIALOG MODAL */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center font-sans animate-scaleIn">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${confirmDialog.isDanger ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-700'}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900">
                {confirmDialog.title}
              </h3>
              <p className="text-xs text-zinc-550 leading-relaxed px-1">
                {confirmDialog.message}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-250 text-zinc-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`flex-1 py-2.5 text-white text-xs font-extrabold rounded-xl transition cursor-pointer uppercase ${
                  confirmDialog.isDanger 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-[#005c56] hover:bg-[#004843]'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
