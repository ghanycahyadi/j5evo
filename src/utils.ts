/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, CommunityEvent, EventRegistration } from "./types";

export const CAR_PHOTOS = {
  defaultTeal: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80", // Sleek modern EV SUV
  metallicGrey: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", // Premium grey SUV
  snowWhite: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80", // White luxury SUV
  emeraldForest: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" // Adventure SUV background
};

export const EVENT_PHOTOS = {
  touring: "/event_banner.jpeg", // Jaecoo Kopdar Yogyakarta banner
  coffeeMeet: "/event_banner.jpeg", // Jaecoo Kopdar Yogyakarta banner
  evCharging: "/event_banner.jpeg", // Jaecoo Kopdar Yogyakarta banner
  charity: "/event_banner.jpeg" // Jaecoo Kopdar Yogyakarta banner
};

// Initial data seeds for backend database if empty
export const INITIAL_MEMBERS: Member[] = [
  {
    id: "J5EVO-202604-0001",
    name: "Rian Hidayat",
    phone: "081234567890",
    address: "Jl. Sudirman No. 45, Jakarta Selatan",
    plateNumber: "B 1234 JAE",
    chassisNumber: "JAE5EV00987654321",
    carPhoto: CAR_PHOTOS.defaultTeal,
    ownerPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-04-10T08:00:00Z",
    email: "rian.hidayat@gmail.com",
    pin: "111111"
  },
  {
    id: "J5EVO-202605-0002",
    name: "Ghany Cahyadi",
    phone: "089876543210",
    address: "Kebayoran Baru, Jakarta Selatan",
    plateNumber: "B 1111 XXX",
    chassisNumber: "JAE5EV00555888222",
    carPhoto: CAR_PHOTOS.snowWhite,
    ownerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-05-01T14:30:22Z",
    email: "ghany.cahyadi@gmail.com",
    pin: "222222"
  },
  {
    id: "J5EVO-202605-0003",
    name: "Dewi Lestari",
    phone: "082188899977",
    address: "Gading Serpong, Tangerang",
    plateNumber: "B 1989 DEW",
    chassisNumber: "JAE5EV00441113334",
    carPhoto: CAR_PHOTOS.metallicGrey,
    ownerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-05-15T11:15:00Z",
    email: "dewi.lestari@yahoo.com",
    pin: "333333"
  }
];

export const INITIAL_EVENTS: CommunityEvent[] = [
  {
    id: "evt_1",
    title: "First Meet Up J5 Evo Indonesia",
    description: "Kumpul perdana regional seluruh pemilik dan pecinta mobil listrik J5 EV di Indonesia untuk perkenalan, membentuk perwakilan, serta diskusi tips pemeliharaan software.",
    date: "2026-06-12",
    location: "Senayan Park Mall, Jakarta",
    image: EVENT_PHOTOS.coffeeMeet,
    status: "upcoming",
    slots: 50
  },
  {
    id: "evt_2",
    title: "Handover Ceremony 3000 Unit Jaecoo J5",
    description: "Perayaan serah terima resmi simbolis 3000 unit perdana Jaecoo J5 EV kepada para pelanggan bersama mitra ATPM Jaecoo partners di Indonesia.",
    date: "2026-05-24",
    location: "ICE BSD Grand Ballroom, Tangerang",
    image: EVENT_PHOTOS.touring,
    status: "completed",
    slots: 100,
    galleryImages: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "evt_3",
    title: "J5 Evo Ramadan Iftar and celebrating one year of jaecoo indonesia",
    description: "Giat buka puasa bersama para member J5 Evo sekaligus memperingati satu tahun kelahiran brand premium Jaecoo di pangsa otomotif tanah air.",
    date: "2026-03-24",
    location: "Hotel Mulia Senayan, Jakarta",
    image: EVENT_PHOTOS.charity,
    status: "completed",
    slots: 80,
    galleryImages: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "evt_4",
    title: "Goes to Jaecoo Land",
    description: "Perjalanan konvoi petualangan ramah lingkungan mengeksplorasi keindahan alam tersembunyi sekaligus menguji ketangguhan motor penggerak J5 EV.",
    date: "2026-07-05",
    location: "Jaecoo Land Park, Sentul",
    image: EVENT_PHOTOS.touring,
    status: "upcoming",
    slots: 35
  },
  {
    id: "evt_5",
    title: "j5 Signatur SPKLU",
    description: "Sinergi eksklusif komunitas bersama pengelola SPKLU untuk ketersediaan nozzle pengisian daya cepat (DC) yang diprioritaskan bagi member J5 Evo.",
    date: "2026-06-25",
    location: "SPKLU Hub Plaza Indonesia, Jakarta",
    image: EVENT_PHOTOS.evCharging,
    status: "upcoming",
    slots: 30
  },
  {
    id: "evt_6",
    title: "CARS & Coffee Meet Up",
    description: "Kopdar santai minggu pagi, menguji asisten kemudi ADAS Level 2+, update firmware, serta dibarengi sharing tren modifikasi roda & wrapping sticker.",
    date: "2026-06-18",
    location: "SCBD Lot 17, Jakarta Selatan",
    image: EVENT_PHOTOS.coffeeMeet,
    status: "upcoming",
    slots: 40
  },
  {
    id: "evt_7",
    title: "Meet Up Jogjakarta J5 Evo",
    description: "Turing antar kota jarak jauh pertama menguji ketahanan baterai jarak jauh dari Jakarta langsung menuju Yogyakarta bersama member regional Tengah.",
    date: "2026-07-20",
    location: "Candi Prambanan, Jogogyakarta",
    image: EVENT_PHOTOS.touring,
    status: "upcoming",
    slots: 25
  }
];

export const INITIAL_REGISTRATIONS: EventRegistration[] = [
  {
    id: "reg_1",
    memberId: "J5EVO-202605-0002", // Ghany Cahyadi
    eventId: "evt_3",  // Charity
    registeredAt: "2026-05-05T09:00:00Z",
    status: "Attended"
  },
  {
    id: "reg_2",
    memberId: "J5EVO-202604-0001", // Rian Hidayat
    eventId: "evt_3",  // Charity
    registeredAt: "2026-05-06T10:15:20Z",
    status: "Attended"
  },
  {
    id: "reg_3",
    memberId: "J5EVO-202605-0002", // Ghany Cahyadi
    eventId: "evt_1",  // Eco Touring
    registeredAt: "2026-05-20T16:45:00Z",
    status: "Registered"
  },
  {
    id: "reg_4",
    memberId: "J5EVO-202605-0003", // Dewi Lestari
    eventId: "evt_1",  // Eco Touring
    registeredAt: "2026-05-22T08:30:10Z",
    status: "Registered"
  }
];

export const INITIAL_FAQS: any[] = [
  {
    id: "faq_1",
    category: "Setir & Pengendalian",
    problem: "Bunyi Steering Rack: Bunyi klik atau \"tek-tek\" saat setir diputar mentok (terutama saat mundur atau nanjak di jalan tidak rata). Awalnya dikira karena ESC dan dengan matikan ESC bisa tidak bunyi, ternyata tidak.",
    frequency: "High",
    solution: "Dilaporkan ke Bengkel Resmi (BeRes). Sebagian diberi gemuk (grease), sebagian perbaikan permanen dengan mengganti Shockbraker setelah investigasi ATPM."
  },
  {
    id: "faq_2",
    category: "Setir & Pengendalian",
    problem: "Masalah Alignment: Posisi setir tidak lurus di tengah atau mobil menarik ke satu sisi.",
    frequency: "Med",
    solution: "Memerlukan spooring (wheel alignment) di BeRes."
  },
  {
    id: "faq_3",
    category: "Setir & Pengendalian",
    problem: "Saat fitur ADAS aktif, mobil tidak bisa berada tepat di tengah lajur (lane centering). Mobil cenderung mepet ke marka kiri, lalu mengoreksi ke kanan, dan berulang terus-menerus sehingga terasa seperti memantul di dalam lajur.",
    frequency: "Low",
    solution: "Membawa mobil ke BeRes agar sistem ADAS dapat dikalibrasi ulang."
  },
  {
    id: "faq_4",
    category: "Pengereman & Traksi",
    problem: "Kehilangan Traksi (Wheel Spin): Ban sering selip saat akselerasi mendadak dari posisi diam atau di tanjakan karena torsi tinggi.",
    frequency: "High",
    solution: "Saran untuk menginjak pedal gas lebih halus atau mempertimbangkan ban dengan cengkeraman (grip) yang lebih baik."
  },
  {
    id: "faq_5",
    category: "Pengereman & Traksi",
    problem: "Rem Regeneratif \"Nyelonong\": Sensasi mobil kehilangan efek engine brake dan meluncur mendadak saat kontrol traksi/ESC aktif di jalan licin/bergelombang.",
    frequency: "Low",
    solution: "Memerlukan kalibrasi lebih lanjut pada sensor kecepatan atau sistem ESC oleh ATPM."
  },
  {
    id: "faq_6",
    category: "Eksterior & Bodi",
    problem: "Embun Kaca Depan (Luar): Embun terbentuk di sisi luar kaca depan saat hujan atau dingin.",
    frequency: "High",
    solution: "Naikkan Suhu AC ke angka 23°C - 24°C. Jika terlalu dingin, kaca depan berembun di sisi luar. Pastikan arah semburan AC fokus ke badan/kaki, bukan kaca. Nyalakan wiper sesekali jika perlu."
  },
  {
    id: "faq_7",
    category: "Eksterior & Bodi",
    problem: "Sistem TPMS sering memberikan peringatan (indikator menyala) karena adanya perbedaan antara tekanan ban aktual dengan standar yang terbaca oleh sistem.",
    frequency: "Med",
    solution: "J5 menggunakan Indirect TPMS system, memanfaatkan sensor kecepatan ABS untuk memantau perbedaan putaran roda (ban kempes berputar lebih cepat). Cek TPMS saat ban dingin untuk keakuratan. Reset TPMS di display Settings > TPMS > Reset setelah ban diisi 38-42 psi."
  },
  {
    id: "faq_8",
    category: "Eksterior & Bodi",
    problem: "Saluran pembuangan air AC pada Jaecoo J5 tidak dilengkapi dengan selang panjang yang mengarah ke bawah mobil. Hal ini menyebabkan air tetesan AC jatuh langsung ke bagian komponen atau area kolong mobil.",
    frequency: "Med",
    solution: "Memasang selang tambahan (5/8 inch) dan klem secara mandiri (DIY) atau meminta bantuan BeRes saat servis rutin (estimasi biaya jasa 150rb)."
  },
  {
    id: "faq_9",
    category: "Interior, Elektronik & Perangkat Lunak",
    problem: "Sensitivitas ADAS: Forward Collision Warning (FCW) terlalu sensitif atau bunyi peringatan muncul meski jarak masih aman.",
    frequency: "High",
    solution: "Menyesuaikan pengaturan ADAS atau mematikan fitur intervensi aktif jika terasa tidak aman di lalu lintas lokal."
  },
  {
    id: "faq_10",
    category: "Interior, Elektronik & Perangkat Lunak",
    problem: "Fitur Walkaway Lock/Unlock pada remote key terkadang mau bekerja dan terkadang tidak (intermittent). Mobil tidak otomatis mengunci saat pengemudi menjauh.",
    frequency: "Med",
    solution: "Ganti baterai remote atau gunakan kunci cadangan. Hindari penggunaan cover remote berbahan logam karena dapat mengganggu pengiriman sinyal."
  }
];

// Formatting helper
export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getGoogleMapsUrl(location: string): string {
  if (!location) return "#";
  if (location.startsWith("http://") || location.startsWith("https://")) {
    return location;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function compressImage(
  fileOrBase64: File | string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    if (!fileOrBase64) {
      resolve("");
      return;
    }
    
    // If it's a File object, convert to base64 first
    if (fileOrBase64 instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        compressBase64(b64, maxWidth, maxHeight, quality, resolve);
      };
      reader.onerror = () => {
        resolve("");
      };
      reader.readAsDataURL(fileOrBase64);
    } else {
      compressBase64(fileOrBase64, maxWidth, maxHeight, quality, resolve);
    }
  });
}

function compressBase64(
  base64Str: string,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  resolve: (value: string) => void
) {
  if (!base64Str || !base64Str.startsWith("data:image")) {
    resolve(base64Str);
    return;
  }

  const img = new Image();
  img.src = base64Str;
  img.onload = () => {
    let width = img.width;
    let height = img.height;

    // Respect the passed dimensions directly to optimize database payload sizes (e.g. 1000px)
    const targetMaxWidth = maxWidth;
    const targetMaxHeight = maxHeight;

    if (width > height) {
      if (width > targetMaxWidth) {
        height = Math.round((height * targetMaxWidth) / width);
        width = targetMaxWidth;
      }
    } else {
      if (height > targetMaxHeight) {
        width = Math.round((width * targetMaxHeight) / height);
        height = targetMaxHeight;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(base64Str);
      return;
    }

    ctx.drawImage(img, 0, 0, width, height);
    // Explicitly enforce quality compression (up to 0.85) so photos look highly detailed and premium or output PNG to keep transparency
    const mimeType = base64Str.split(";")[0]?.split(":")[1] || "image/jpeg";
    const compressed = mimeType === "image/png"
      ? canvas.toDataURL("image/png")
      : canvas.toDataURL("image/jpeg", Math.min(quality, 0.85));
    resolve(compressed);
  };
  img.onerror = () => {
    resolve(base64Str);
  };
}


