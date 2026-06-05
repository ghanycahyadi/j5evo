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
    pin: "111111",
    garageCarName: "Jaecoo J5 All Black Cyberpunk",
    garageDescription: "Modifikasi velg sport 19 inch matte black, body wrapping full satin black, ambient interior light dashboard yang sinkron dengan musik, serta upgrade audio 12-speaker Alpine.",
    garageImages: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true
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
    pin: "222222",
    garageCarName: "J5 EV Glacier White Explorer",
    garageDescription: "Dilengkapi Thule Roof Box Motion XT XL untuk traveling keluarga, ban & velg alloy AT semi-offroad untuk petualangan rute lintas Jawa, serta coating graphene 3-layer anti gores.",
    garageImages: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true
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
    pin: "333333",
    garageCarName: "J5 Luxe Midnight Grey",
    garageDescription: "Upgrade kabin full Nappa Leather kelir saddle brown super premium, dipasangkan V2L outdoor kit adapter 3.6kW, serta instalasi kamera dasbord 4K terintegrasi apps.",
    garageImages: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true
  },
  {
    id: "J5EVO-202604-0004",
    name: "Aditya Pratama",
    phone: "081122334455",
    address: "Kancil Mas, Bandung",
    plateNumber: "D 2002 ADI",
    chassisNumber: "JAE5EV0077889911A",
    carPhoto: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    ownerPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-04-12T09:12:00Z",
    email: "aditya.pratama@gmail.com",
    pin: "444444",
    garageCarName: "Jaecoo J5 Cyber Beast",
    garageDescription: "Satin metallic green wrap, custom 20-inch forge monoblock wheels, brembo 6-pot big brake kit, premium sound insulation treatment, and enhanced neon underglow system.",
    garageImages: [
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true,
    ratings: [5, 5, 5, 4, 5],
    ratingAverage: 4.8,
    ratingCount: 5
  },
  {
    id: "J5EVO-202604-0005",
    name: "Clara Setyawati",
    phone: "085299887766",
    address: "Sentul City, Bogor",
    plateNumber: "F 8000 CLA",
    chassisNumber: "JAE5EV0011223344B",
    carPhoto: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    ownerPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-04-15T15:24:00Z",
    email: "clara.setyawati@gmail.com",
    pin: "555555",
    garageCarName: "Jaecoo Pink Blossom",
    garageDescription: "Satin metallic pearl pink wrapping, 19-inch white custom alloy wheels, tailored vegan leather custom pink interior trims with dynamic starlight headliner.",
    garageImages: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true,
    ratings: [5, 4, 5, 5],
    ratingAverage: 4.8,
    ratingCount: 4
  },
  {
    id: "J5EVO-202604-0006",
    name: "Bambang Wijaya",
    phone: "081399881122",
    address: "Rungkut Megah, Surabaya",
    plateNumber: "L 1551 BAM",
    chassisNumber: "JAE5EV0033445566C",
    carPhoto: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
    ownerPhoto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-04-18T10:05:00Z",
    email: "bambang.wijaya@gmail.com",
    pin: "666666",
    garageCarName: "J5 Stealth Cruiser",
    garageDescription: "Matte charcoal grey body wrap, carbon fiber front spoiler lip, lowered comfort sport springs, and premium titanium window privacy tints.",
    garageImages: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true,
    ratings: [4, 5, 4, 5, 4],
    ratingAverage: 4.4,
    ratingCount: 5
  },
  {
    id: "J5EVO-202604-0007",
    name: "Dani Iskandar",
    phone: "082266778899",
    address: "Sarijadi, Bandung",
    plateNumber: "D 4410 DAN",
    chassisNumber: "JAE5EV0055667788D",
    carPhoto: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    ownerPhoto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-04-20T11:40:00Z",
    email: "dani.iskandar@gmail.com",
    pin: "777777",
    garageCarName: "J5 Offroad Pioneer Edition",
    garageDescription: "Equipped with aluminum rugged roof rack, high-output front LED dual-light bars, robust all-terrain adventure gripper tire sets, fully custom matte camouflaj green skin wrap.",
    garageImages: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true,
    ratings: [5, 5, 5, 5, 5],
    ratingAverage: 5.0,
    ratingCount: 5
  },
  {
    id: "J5EVO-202604-0008",
    name: "Eko Prasetyo",
    phone: "085388772211",
    address: "Condongcatur, Sleman",
    plateNumber: "AB 9090 EKO",
    chassisNumber: "JAE5EV0022334455E",
    carPhoto: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    ownerPhoto: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-04-22T14:15:00Z",
    email: "eko.prasetyo@gmail.com",
    pin: "888888",
    garageCarName: "J5 White Sonic Aero",
    garageDescription: "High-gloss crystal white protective paint film wrap, custom aerodynamic carbon pattern bodykit, upgraded comfortable suspension dampers, custom sports exhaust-sound generator.",
    garageImages: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true,
    ratings: [5, 4, 4, 5],
    ratingAverage: 4.5,
    ratingCount: 4
  },
  {
    id: "J5EVO-202604-0009",
    name: "Farah Nabila",
    phone: "083811223344",
    address: "Kuningan, Jakarta Selatan",
    plateNumber: "B 3322 FAR",
    chassisNumber: "JAE5EV0099001122F",
    carPhoto: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
    ownerPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-04-26T16:30:00Z",
    email: "farah.nabila@gmail.com",
    pin: "999999",
    garageCarName: "J5 Sapphire Dream",
    garageDescription: "Deep ocean metallic blue wraps, bespoke custom wooden floor trunk organizer panels, premium plush Alcantara dark dash cover, and smart ozone-air purifier built-in module.",
    garageImages: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1621007947382-bb3c3994d3fb?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true,
    ratings: [5, 5, 4],
    ratingAverage: 4.7,
    ratingCount: 3
  },
  {
    id: "J5EVO-202604-0010",
    name: "Gilang Ramadhan",
    phone: "081244556677",
    address: "Kelapa Gading, Jakarta Utara",
    plateNumber: "B 2478 GIL",
    chassisNumber: "JAE5EV0055221144G",
    carPhoto: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    ownerPhoto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-04-29T10:50:00Z",
    email: "gilang.ramadhan@gmail.com",
    pin: "123123",
    garageCarName: "J5 Carbon Forge Edition",
    garageDescription: "Full carbon fiber look wrapping on front hood and side side-mirrors, original 19-inch blacked-out rims, calibrated dynamic sport steering dampers.",
    garageImages: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true,
    ratings: [4, 4, 5, 5, 5],
    ratingAverage: 4.6,
    ratingCount: 5
  },
  {
    id: "J5EVO-202604-0011",
    name: "Hendra Kusuma",
    phone: "0817345678",
    address: "Seminyak, Badung, Bali",
    plateNumber: "DK 777 HEN",
    chassisNumber: "JAE5EV0088771122H",
    carPhoto: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    ownerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-05-02T11:10:00Z",
    email: "hendra.kusuma@gmail.com",
    pin: "321321",
    garageCarName: "J5 Bali Sunset Explorer",
    garageDescription: "Satin metallic burnt orange wrap, aesthetic black-chrome delete trims, fully customized waterproof seat protectors perfect for surfers, and beach trunk organizer kit.",
    garageImages: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true,
    ratings: [5, 5, 5],
    ratingAverage: 5.0,
    ratingCount: 3
  },
  {
    id: "J5EVO-202604-0012",
    name: "Irene Wijaya",
    phone: "081900112233",
    address: "Kembangan, Jakarta Barat",
    plateNumber: "B 101 IRE",
    chassisNumber: "JAE5EV0033116677I",
    carPhoto: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    ownerPhoto: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-05-04T13:42:00Z",
    email: "irene.wijaya@gmail.com",
    pin: "456456",
    garageCarName: "J5 Minimalist Pearl",
    garageDescription: "Protected by custom premium Satin Matte TPU Self-Healing Paint Protection Film (PPF), elegantly polished multi-spoke high-class silver wheels, and ultra plush wool floors.",
    garageImages: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true,
    ratings: [4, 5, 5, 5],
    ratingAverage: 4.8,
    ratingCount: 4
  },
  {
    id: "J5EVO-202604-0013",
    name: "Joko Susilo",
    phone: "087755443322",
    address: "Ska, Surakarta",
    plateNumber: "AD 5050 JOK",
    chassisNumber: "JAE5EV0022446688J",
    carPhoto: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    ownerPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=80",
    registeredAt: "2026-05-06T15:15:00Z",
    email: "joko.susilo@gmail.com",
    pin: "789789",
    garageCarName: "J5 Javanese Batik Heritage",
    garageDescription: "Fine custom batik printed decal highlights across side doors, orthopedically sculpted comfortable memory-foam custom headrests, and upgraded integrated food-warmer box.",
    garageImages: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
    ],
    showInGarage: true,
    ratings: [5, 4, 5, 5],
    ratingAverage: 4.8,
    ratingCount: 4
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
  // event 1: First Meet Up J5 Evo Indonesia (10 participants)
  { id: "reg_1_1", memberId: "J5EVO-202604-0001", eventId: "evt_1", registeredAt: "2026-05-10T08:00:00Z", status: "Registered" },
  { id: "reg_1_2", memberId: "J5EVO-202605-0002", eventId: "evt_1", registeredAt: "2026-05-10T08:30:00Z", status: "Registered" },
  { id: "reg_1_3", memberId: "J5EVO-202605-0003", eventId: "evt_1", registeredAt: "2026-05-11T09:00:00Z", status: "Registered" },
  { id: "reg_1_4", memberId: "J5EVO-202604-0004", eventId: "evt_1", registeredAt: "2026-05-11T10:15:00Z", status: "Registered" },
  { id: "reg_1_5", memberId: "J5EVO-202604-0005", eventId: "evt_1", registeredAt: "2026-05-12T14:24:00Z", status: "Registered" },
  { id: "reg_1_6", memberId: "J5EVO-202604-0006", eventId: "evt_1", registeredAt: "2026-05-12T15:00:00Z", status: "Registered" },
  { id: "reg_1_7", memberId: "J5EVO-202604-0007", eventId: "evt_1", registeredAt: "2026-05-13T11:00:00Z", status: "Registered" },
  { id: "reg_1_8", memberId: "J5EVO-202604-0008", eventId: "evt_1", registeredAt: "2026-05-13T16:45:00Z", status: "Registered" },
  { id: "reg_1_9", memberId: "J5EVO-202604-0009", eventId: "evt_1", registeredAt: "2026-05-14T09:12:00Z", status: "Registered" },
  { id: "reg_1_10", memberId: "J5EVO-202604-0010", eventId: "evt_1", registeredAt: "2026-05-14T11:30:00Z", status: "Registered" },

  // event 2: Handover Ceremony 3000 Unit Jaecoo J5 (10 participants)
  { id: "reg_2_1", memberId: "J5EVO-202604-0001", eventId: "evt_2", registeredAt: "2026-05-15T10:00:00Z", status: "Attended" },
  { id: "reg_2_2", memberId: "J5EVO-202605-0002", eventId: "evt_2", registeredAt: "2026-05-15T11:00:00Z", status: "Attended" },
  { id: "reg_2_3", memberId: "J5EVO-202605-0003", eventId: "evt_2", registeredAt: "2026-05-16T12:00:00Z", status: "Attended" },
  { id: "reg_2_4", memberId: "J5EVO-202604-0004", eventId: "evt_2", registeredAt: "2026-05-16T14:30:00Z", status: "Attended" },
  { id: "reg_2_5", memberId: "J5EVO-202604-0005", eventId: "evt_2", registeredAt: "2026-05-17T09:00:00Z", status: "Attended" },
  { id: "reg_2_6", memberId: "J5EVO-202604-0006", eventId: "evt_2", registeredAt: "2026-05-17T15:45:00Z", status: "Attended" },
  { id: "reg_2_7", memberId: "J5EVO-202604-0007", eventId: "evt_2", registeredAt: "2026-05-18T10:15:00Z", status: "Attended" },
  { id: "reg_2_8", memberId: "J5EVO-202604-0008", eventId: "evt_2", registeredAt: "2026-05-18T16:20:00Z", status: "Attended" },
  { id: "reg_2_9", memberId: "J5EVO-202604-0009", eventId: "evt_2", registeredAt: "2026-05-19T08:45:00Z", status: "Attended" },
  { id: "reg_2_10", memberId: "J5EVO-202604-0010", eventId: "evt_2", registeredAt: "2026-05-19T11:40:00Z", status: "Attended" },

  // event 3: J5 Evo Ramadan Iftar... (10 participants)
  { id: "reg_3_1", memberId: "J5EVO-202604-0001", eventId: "evt_3", registeredAt: "2026-03-10T17:00:00Z", status: "Attended" },
  { id: "reg_3_2", memberId: "J5EVO-202605-0002", eventId: "evt_3", registeredAt: "2026-03-10T17:30:00Z", status: "Attended" },
  { id: "reg_3_3", memberId: "J5EVO-202605-0003", eventId: "evt_3", registeredAt: "2026-03-11T18:00:00Z", status: "Attended" },
  { id: "reg_3_4", memberId: "J5EVO-202604-0004", eventId: "evt_3", registeredAt: "2026-03-11T18:15:00Z", status: "Attended" },
  { id: "reg_3_5", memberId: "J5EVO-202604-0005", eventId: "evt_3", registeredAt: "2026-03-12T17:45:00Z", status: "Attended" },
  { id: "reg_3_6", memberId: "J5EVO-202604-0006", eventId: "evt_3", registeredAt: "2026-03-12T18:10:00Z", status: "Attended" },
  { id: "reg_3_7", memberId: "J5EVO-202604-0007", eventId: "evt_3", registeredAt: "2026-03-13T18:30:00Z", status: "Attended" },
  { id: "reg_3_8", memberId: "J5EVO-202604-0008", eventId: "evt_3", registeredAt: "2026-03-13T19:00:00Z", status: "Attended" },
  { id: "reg_3_9", memberId: "J5EVO-202604-0009", eventId: "evt_3", registeredAt: "2026-03-14T17:55:00Z", status: "Attended" },
  { id: "reg_3_10", memberId: "J5EVO-202604-0010", eventId: "evt_3", registeredAt: "2026-03-14T18:20:00Z", status: "Attended" },

  // event 4: Goes to Jaecoo Land (10 participants)
  { id: "reg_4_1", memberId: "J5EVO-202604-0001", eventId: "evt_4", registeredAt: "2026-05-20T08:00:00Z", status: "Registered" },
  { id: "reg_4_2", memberId: "J5EVO-202605-0002", eventId: "evt_4", registeredAt: "2026-05-20T09:00:00Z", status: "Registered" },
  { id: "reg_4_3", memberId: "J5EVO-202605-0003", eventId: "evt_4", registeredAt: "2026-05-21T10:00:00Z", status: "Registered" },
  { id: "reg_4_4", memberId: "J5EVO-202604-0004", eventId: "evt_4", registeredAt: "2026-05-21T11:00:00Z", status: "Registered" },
  { id: "reg_4_5", memberId: "J5EVO-202604-0005", eventId: "evt_4", registeredAt: "2026-05-22T08:30:00Z", status: "Registered" },
  { id: "reg_4_6", memberId: "J5EVO-202604-0006", eventId: "evt_4", registeredAt: "2026-05-22T14:40:00Z", status: "Registered" },
  { id: "reg_4_7", memberId: "J5EVO-202604-0007", eventId: "evt_4", registeredAt: "2026-05-23T11:15:00Z", status: "Registered" },
  { id: "reg_4_8", memberId: "J5EVO-202604-0008", eventId: "evt_4", registeredAt: "2026-05-23T15:20:00Z", status: "Registered" },
  { id: "reg_4_9", memberId: "J5EVO-202604-0009", eventId: "evt_4", registeredAt: "2026-05-24T09:00:00Z", status: "Registered" },
  { id: "reg_4_10", memberId: "J5EVO-202604-0010", eventId: "evt_4", registeredAt: "2026-05-24T13:10:00Z", status: "Registered" },

  // event 5: j5 Signatur SPKLU (10 participants)
  { id: "reg_5_1", memberId: "J5EVO-202604-0001", eventId: "evt_5", registeredAt: "2026-05-25T08:00:00Z", status: "Registered" },
  { id: "reg_5_2", memberId: "J5EVO-202605-0002", eventId: "evt_5", registeredAt: "2026-05-25T09:12:00Z", status: "Registered" },
  { id: "reg_5_3", memberId: "J5EVO-202605-0003", eventId: "evt_5", registeredAt: "2026-05-26T10:45:00Z", status: "Registered" },
  { id: "reg_5_4", memberId: "J5EVO-202604-0004", eventId: "evt_5", registeredAt: "2026-05-26T11:20:00Z", status: "Registered" },
  { id: "reg_5_5", memberId: "J5EVO-202604-0005", eventId: "evt_5", registeredAt: "2026-05-27T08:30:00Z", status: "Registered" },
  { id: "reg_5_6", memberId: "J5EVO-202604-0006", eventId: "evt_5", registeredAt: "2026-05-27T14:10:00Z", status: "Registered" },
  { id: "reg_5_7", memberId: "J5EVO-202604-0007", eventId: "evt_5", registeredAt: "2026-05-28T09:30:00Z", status: "Registered" },
  { id: "reg_5_8", memberId: "J5EVO-202604-0008", eventId: "evt_5", registeredAt: "2026-05-28T15:20:00Z", status: "Registered" },
  { id: "reg_5_9", memberId: "J5EVO-202604-0009", eventId: "evt_5", registeredAt: "2026-05-29T10:00:00Z", status: "Registered" },
  { id: "reg_5_10", memberId: "J5EVO-202604-0010", eventId: "evt_5", registeredAt: "2026-05-29T16:40:00Z", status: "Registered" },

  // event 6: CARS & Coffee Meet Up (10 participants)
  { id: "reg_6_1", memberId: "J5EVO-202604-0001", eventId: "evt_6", registeredAt: "2026-05-20T08:30:00Z", status: "Registered" },
  { id: "reg_6_2", memberId: "J5EVO-202605-0002", eventId: "evt_6", registeredAt: "2026-05-20T09:45:00Z", status: "Registered" },
  { id: "reg_6_3", memberId: "J5EVO-202605-0003", eventId: "evt_6", registeredAt: "2026-05-21T10:15:00Z", status: "Registered" },
  { id: "reg_6_4", memberId: "J5EVO-202604-0004", eventId: "evt_6", registeredAt: "2026-05-21T11:00:00Z", status: "Registered" },
  { id: "reg_6_5", memberId: "J5EVO-202604-0005", eventId: "evt_6", registeredAt: "2026-05-22T08:15:00Z", status: "Registered" },
  { id: "reg_6_6", memberId: "J5EVO-202604-0006", eventId: "evt_6", registeredAt: "2026-05-22T14:30:00Z", status: "Registered" },
  { id: "reg_6_7", memberId: "J5EVO-202604-0007", eventId: "evt_6", registeredAt: "2026-05-23T09:00:00Z", status: "Registered" },
  { id: "reg_6_8", memberId: "J5EVO-202604-0008", eventId: "evt_6", registeredAt: "2026-05-23T15:45:00Z", status: "Registered" },
  { id: "reg_6_9", memberId: "J5EVO-202604-0009", eventId: "evt_6", registeredAt: "2026-05-24T10:20:00Z", status: "Registered" },
  { id: "reg_6_10", memberId: "J5EVO-202604-0010", eventId: "evt_6", registeredAt: "2026-05-24T16:10:00Z", status: "Registered" },

  // event 7: Meet Up Jogjakarta J5 Evo (10 participants)
  { id: "reg_7_1", memberId: "J5EVO-202604-0001", eventId: "evt_7", registeredAt: "2026-05-25T08:00:00Z", status: "Registered" },
  { id: "reg_7_2", memberId: "J5EVO-202605-0002", eventId: "evt_7", registeredAt: "2026-05-25T09:30:00Z", status: "Registered" },
  { id: "reg_7_3", memberId: "J5EVO-202605-0003", eventId: "evt_7", registeredAt: "2026-05-26T10:00:00Z", status: "Registered" },
  { id: "reg_7_4", memberId: "J5EVO-202604-0004", eventId: "evt_7", registeredAt: "2026-05-26T11:45:00Z", status: "Registered" },
  { id: "reg_7_5", memberId: "J5EVO-202604-0005", eventId: "evt_7", registeredAt: "2026-05-27T08:15:00Z", status: "Registered" },
  { id: "reg_7_6", memberId: "J5EVO-202604-0006", eventId: "evt_7", registeredAt: "2026-05-27T14:20:00Z", status: "Registered" },
  { id: "reg_7_7", memberId: "J5EVO-202604-0007", eventId: "evt_7", registeredAt: "2026-05-28T09:45:00Z", status: "Registered" },
  { id: "reg_7_8", memberId: "J5EVO-202604-0008", eventId: "evt_7", registeredAt: "2026-05-28T15:30:00Z", status: "Registered" },
  { id: "reg_7_9", memberId: "J5EVO-202604-0009", eventId: "evt_7", registeredAt: "2026-05-29T10:10:00Z", status: "Registered" },
  { id: "reg_7_10", memberId: "J5EVO-202604-0010", eventId: "evt_7", registeredAt: "2026-05-29T16:50:00Z", status: "Registered" }
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


