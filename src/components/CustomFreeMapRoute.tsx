/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import J5EvoLogo from "./J5EvoLogo";
import { toPng } from "html-to-image";
import { 
  MapPin, 
  Coffee, 
  Search, 
  Zap, 
  Battery, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  Trees, 
  Navigation,
  Compass,
  Gauge,
  List,
  Download
} from "lucide-react";

// Spec JAECOO J5 EV
const JAECOO_EV_SPECS = {
  batteryCapacityKwh: 67.0,
  wltpRangeKm: 420
};

// Static database of PLN SPKLU stations in Indonesia (with coordinate entries to match OSRM route path)
interface SpkluDbItem {
  id: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  type: string;
  capacity: string;
  note: string;
}

const SPKLU_DATABASE: SpkluDbItem[] = [
  // West Java - Bandung
  { id: "spklu_uid_jabar", name: "SPKLU PLN UID Jabar Asia Afrika", location: "Jl. Asia Afrika No.63, Bandung", lat: -6.9195, lon: 107.6135, type: "Ultra-Fast DC", capacity: "120 kW", note: "Lokasi premium di jantung kota Bandung, sangat dekat dengan Alun-alun." },
  { id: "spklu_gd_sate", name: "SPKLU PLN Gedung Sate", location: "Kawasan Parkir Gedung Sate, Bandung", lat: -6.9025, lon: 107.6186, type: "Fast DC", capacity: "60 kW", note: "Fasilitas pengisian strategis di pusat pemerintahan Provinsi Jawa Barat." },
  { id: "spklu_distribusi_bdg", name: "SPKLU PLN Distribusi Bandung", location: "Jl. Soekarno-Hatta No.436, Bandung", lat: -6.9385, lon: 107.6254, type: "Fast DC", capacity: "50 kW", note: "Andalan wilayah Bandung Selatan." },
  
  // Cipularang & Purbaleunyi Highways
  { id: "spklu_km72a", name: "SPKLU Rest Area KM 72A Cipularang", location: "Tol Cipularang KM 72A (Arah Bandung)", lat: -6.6025, lon: 107.4475, type: "Ultra-Fast DC", capacity: "120 kW", note: "Sangat bersahabat, rest area pertama setelah Tol Cikampek." },
  { id: "spklu_km88a", name: "SPKLU Rest Area KM 88A Cipularang", location: "Tol Cipularang KM 88A (Arah Bandung)", lat: -6.6575, lon: 107.4525, type: "Ultra-Fast DC", capacity: "120 kW", note: "Fasilitas lengkap dengan area makan luas, andalan tanjakan Cipularang." },
  { id: "spklu_km88b", name: "SPKLU Rest Area KM 88B Cipularang", location: "Tol Cipularang KM 88B (Arah Jakarta)", lat: -6.6558, lon: 107.4510, type: "Fast DC", capacity: "50 kW", note: "Krusial untuk arus balik kendaraan menuju Jakarta Barat." },
  { id: "spklu_km97b", name: "SPKLU Rest Area KM 97B Cipularang", location: "Tol Cipularang KM 97B (Arah Jakarta)", lat: -6.6345, lon: 107.4215, type: "Ultra-Fast DC", capacity: "120 kW", note: "Pemberhentian favorit teratas sebelum mengarungi kemancetan Jabodetabek." },
  { id: "spklu_km147a", name: "SPKLU Rest Area KM 147A Purbaleunyi", location: "Tol Purbaleunyi KM 147A (Arah Bandung)", lat: -6.9535, lon: 107.7282, type: "Fast DC", capacity: "50 kW", note: "Lokasi isi daya pamungkas sebelum keluar Cileunyi menuju Priangan Timur." },
  { id: "spklu_km149b", name: "SPKLU Rest Area KM 149B Purbaleunyi", location: "Tol Purbaleunyi KM 149B (Arah Cileunyi/Jakarta)", lat: -6.9515, lon: 107.7121, type: "Fast DC", capacity: "50 kW", note: "Stasiun pendukung bagi warga Bandung Timur." },

  // Garut - Tasik - Banjar - Pangandaran
  { id: "spklu_up3_garut", name: "SPKLU PLN UP3 Garut", location: "Jl. Cimanuk No.303, Garut", lat: -7.2155, lon: 107.9015, type: "Fast DC", capacity: "50 kW", note: "Terbaik untuk menstabilkan daya sebelum menyeberang kawasan berbukit Cikajang." },
  { id: "spklu_up3_tasik", name: "SPKLU PLN UP3 Tasikmalaya", location: "Jl. Mayor S.L. Tobing No.10, Tasikmalaya", lat: -7.3235, lon: 108.2198, type: "Fast DC", capacity: "50 kW", note: "Lokasi persinggahan favorit di koridor jalur selatan Jawa Barat." },
  { id: "spklu_up3_ciamis", name: "SPKLU PLN UP3 Ciamis", location: "Jl. Jend. Sudirman No.142, Ciamis", lat: -7.3284, lon: 108.3512, type: "AC Charge", capacity: "22 kW", note: "Pengisian tipe sedang yang nyaman di dekat Alun-alun Ciamis." },
  { id: "spklu_ulp_banjar", name: "SPKLU PLN ULP Banjar", location: "Jl. Silat No.12, Banjar", lat: -7.3695, lon: 108.5368, type: "Fast DC", capacity: "50 kW", note: "Gerbang penting Priangan sebelum melaju lurus ke jalan raya Pangandaran." },
  { id: "spklu_pangandaran", name: "SPKLU PLN Pangandaran Parigi", location: "Jl. Raya Parigi, Pangandaran (Parigi)", lat: -7.7011, lon: 108.4905, type: "Fast DC", capacity: "30 kW", note: "Titik utama isi daya andalan para wisatawan pantai Pangandaran dan Green Canyon." },

  // Jakarta Hubs
  { id: "spklu_gambir", name: "SPKLU PLN Pusat Gambir", location: "Jl. M.I. Ridwan Rais No.1, Jakarta Pusat", lat: -6.1754, lon: 106.8272, type: "Ultra-Fast DC", capacity: "200 kW", note: "Pusat SPKLU Ibu Kota dengan mesin daya tinggi ganda." },
  { id: "spklu_sency", name: "SPKLU Mall Senayan City", location: "Kawasan Parkir B2 Mall Sency, Jakarta", lat: -6.2274, lon: 106.7974, type: "Fast DC", capacity: "50 kW", note: "Dapatkan layanan eksklusif sembari rekreasi belanja." },
  { id: "spklu_jakarta_raya", name: "SPKLU PLN UID Jakarta Raya", location: "Jl. Gambir Raya, Jakarta Pusat", lat: -6.1824, lon: 106.8322, type: "Ultra-Fast DC", capacity: "120 kW", note: "Fasilitas daya tinggi andalan mobilitas metro." },

  // Tol Cikampek & Tol Cipali
  { id: "spklu_km57a", name: "SPKLU Rest Area KM 57A Cikampek", location: "Tol Jakarta - Cikampek KM 57A", lat: -6.3685, lon: 107.2915, type: "Fast DC", capacity: "60 kW", note: "Stasiun andalan kelistrikan LFP sebelum berpisah jalan Tol Cipali." },
  { id: "spklu_km62b", name: "SPKLU Rest Area KM 62B Cikampek", location: "Tol Cikampek - Jakarta KM 62B", lat: -6.3512, lon: 107.2754, type: "Fast DC", capacity: "50 kW", note: "Kunci cadangan energi arus balik tol utama Trans-Jawa." },
  { id: "spklu_km102a", name: "SPKLU Rest Area KM 102A Cipali", location: "Tol Cipali KM 102A (Arah Timur)", lat: -6.4421, lon: 107.7511, type: "Ultra-Fast DC", capacity: "200 kW", note: "Kapasitas daya raksasa, menghemat waktu isi baterai cuma 15 menit." },
  { id: "spklu_km101b", name: "SPKLU Rest Area KM 101B Cipali", location: "Tol Cipali KM 101B (Arah Barat)", lat: -6.4432, lon: 107.7425, type: "Ultra-Fast DC", capacity: "120 kW", note: "Mesin andalan arus balik pemudik pantai utara." },
  { id: "spklu_km166a", name: "SPKLU Rest Area KM 166A Cipali", location: "Tol Cipali KM 166A (Arah Cirebon)", lat: -6.6712, lon: 108.2341, type: "Fast DC", capacity: "50 kW", note: "Area rindang dengan masjid megah berarsitektur eksotis." },
  { id: "spklu_km164b", name: "SPKLU Rest Area KM 164B Cipali", location: "Tol Cipali KM 164B (Arah Jakarta)", lat: -6.6725, lon: 108.2235, type: "Fast DC", capacity: "50 kW", note: "Dukungan penuh daya baterai sebelum percabangan Tol Purbaleunyi." },
  { id: "spklu_up3_cirebon", name: "SPKLU PLN UP3 Cirebon", location: "Jl. Siliwangi No.36, Cirebon", lat: -6.7025, lon: 108.5512, type: "Fast DC", capacity: "50 kW", note: "Strategis untuk rute melintasi pesisir utara." },

  // Trans-Java (Central & East)
  { id: "spklu_km207a", name: "SPKLU Rest Area KM 207A Kanci", location: "Tol Palikanci KM 207A Cirebon", lat: -6.7454, lon: 108.6212, type: "Fast DC", capacity: "50 kW", note: "Menyejukkan baterai sejenak untuk persiapan masuk Jawa Tengah." },
  { id: "spklu_km228a", name: "SPKLU Rest Area KM 228A Pejagan", location: "Tol Pejagan KM 228A (Arah Solo)", lat: -6.8321, lon: 108.7754, type: "Ultra-Fast DC", capacity: "120 kW", note: "Stasiun berdaya andalan di perbatasan Jawa Barat & Jawa Tengah." },
  { id: "spklu_km379a", name: "SPKLU Rest Area KM 379A Batang", location: "Tol Batang - Semarang KM 379A", lat: -6.9691, lon: 109.9542, type: "Ultra-Fast DC", capacity: "120 kW", note: "Halaman parkir SPKLU ekstra lega & asri terlindungi pepohonan." },
  { id: "spklu_km389b", name: "SPKLU Rest Area KM 389B Batang", location: "Tol Batang - Semarang KM 389B", lat: -6.9654, lon: 109.9321, type: "Ultra-Fast DC", capacity: "120 kW", note: "Cocok untuk top-up sembari santap malam pecel." },
  { id: "spklu_km429a", name: "SPKLU Rest Area KM 429A Solo", location: "Tol Semarang - Solo KM 429A", lat: -7.1415, lon: 110.4325, type: "Fast DC", capacity: "60 kW", note: "Terletak di ketinggian sejuk dengan tempat ibadah arsitektur indah." },
  { id: "spklu_km519a", name: "SPKLU Rest Area KM 519A Ngawi", location: "Tol Solo - Ngawi KM 519A", lat: -7.4112, lon: 111.1215, type: "Ultra-Fast DC", capacity: "120 kW", note: "Stasiun krusial di pusat sabuk penyeberangan Jawa Timur." },
  { id: "spklu_km575a", name: "SPKLU Rest Area KM 575A Ngawi", location: "Tol Solo - Ngawi KM 575A", lat: -7.4252, lon: 111.3524, type: "Ultra-Fast DC", capacity: "120 kW", note: "Fasilitas lengkap dengan food court nyaman di kawasan Ngawi." },
  { id: "spklu_km626a", name: "SPKLU Rest Area KM 626A Madiun", location: "Tol Ngawi - Kertosono KM 626A", lat: -7.5312, lon: 111.6432, type: "Fast DC", capacity: "60 kW", note: "Pemberhentian sejuk di perbatasan Madiun, andalan pengisian daya Jawa Timur Tengah." },
  { id: "spklu_km725a", name: "SPKLU Rest Area KM 725A Mojokerto", location: "Tol Mojokerto - Surabaya KM 725A", lat: -7.3421, lon: 112.5115, type: "Ultra-Fast DC", capacity: "120 kW", note: "Lokasi strategis sebelum memasuki wilayah metropolitan Surabaya dan percabangan Malang." },
  { id: "spklu_km84a", name: "SPKLU Rest Area KM 84A Pandaan", location: "Tol Gempol - Pandaan KM 84A (Arah Malang)", lat: -7.6685, lon: 112.6912, type: "Fast DC", capacity: "50 kW", note: "Rest area terakhir yang sangat sejuk, sangat pas untuk top-up sebelum mendaki ke Malang." },
  { id: "spklu_up3_malang", name: "SPKLU PLN UP3 Malang", location: "Jl. Jend. Basic Rahmat No.100, Klojen, Malang", lat: -7.9782, lon: 112.6285, type: "Fast DC", capacity: "50 kW", note: "Stasiun pusat isi daya di tengah Kota Malang, dekat kawasan Alun-Alun." },
  { id: "spklu_ketapang", name: "SPKLU ASDP Ketapang Banyuwangi", location: "Pelabuhan Ketapang, Banyuwangi", lat: -8.1342, lon: 114.3942, type: "Ultra-Fast DC", capacity: "120 kW", note: "Isi hingga 85% untuk jaminan penyeberangan laut feri aman menuju Pulau Bali." }
];

interface CustomFreeMapRouteProps {
  speedStyle: "eco" | "normal" | "sport";
  setSpeedStyle: React.Dispatch<React.SetStateAction<"eco" | "normal" | "sport">>;
  cargoLoad: "eco" | "moderate" | "heavy";
  setCargoLoad: React.Dispatch<React.SetStateAction<"eco" | "moderate" | "heavy">>;
  acIntensity: "low" | "medium" | "high";
  setAcIntensity: React.Dispatch<React.SetStateAction<"low" | "medium" | "high">>;
  wheelDiameter: number;
  setWheelDiameter: React.Dispatch<React.SetStateAction<number>>;
  temperatureCelsius: number;
  setTemperatureCelsius: React.Dispatch<React.SetStateAction<number>>;
  socAtStart: number;
  setSocAtStart: React.Dispatch<React.SetStateAction<number>>;
  socSafetyLimit: number;
  setSocSafetyLimit: React.Dispatch<React.SetStateAction<number>>;
  tariffType: "home" | "spklu_fast" | "spklu_ultra";
  setTariffType: React.Dispatch<React.SetStateAction<"home" | "spklu_fast" | "spklu_ultra">>;
}

interface OsmPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Distance helper function in Km using Haversine algorithm
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function CustomFreeMapRoute({
  speedStyle,
  setSpeedStyle,
  cargoLoad,
  setCargoLoad,
  acIntensity,
  setAcIntensity,
  wheelDiameter,
  setWheelDiameter,
  temperatureCelsius,
  setTemperatureCelsius,
  socAtStart,
  setSocAtStart,
  socSafetyLimit,
  setSocSafetyLimit,
  tariffType,
  setTariffType
}: CustomFreeMapRouteProps) {
  // Free OpenStreetMap search parameters
  const [originInput, setOriginInput] = useState("Jakarta");
  const [destInput, setDestInput] = useState("Malang");

  // Matched places suggestions lists
  const [originSuggestions, setOriginSuggestions] = useState<OsmPlace[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<OsmPlace[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  // Selected points coordinates
  const [originPlace, setOriginPlace] = useState<OsmPlace | null>(null);
  const [destPlace, setDestPlace] = useState<OsmPlace | null>(null);

  // Computed mileage & duration from OSRM
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [routeDurationStr, setRouteDurationStr] = useState<string>("");
  const [isComputingRoute, setIsComputingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Real coordinate polyline points for dynamic proximity checks
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);

  // TOLL ROAD & INTERACTIVE CHARGING SIMULATOR STATES
  const [filterTollOnly, setFilterTollOnly] = useState<boolean>(false);
  const [routeViaToll, setRouteViaToll] = useState<boolean>(true);
  const [simulatedChargeStops, setSimulatedChargeStops] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"timeline" | "directory">("timeline");

  // Dynamic Leaflet assets loading states
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  // DOM Mount variables
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const markerStartRef = useRef<any>(null);
  const markerEndRef = useRef<any>(null);
  const spkluMarkersRef = useRef<any[]>([]);

  // Dynamically load Leaflet CDN
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    try {
      // 1. Mount CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "";
      document.head.appendChild(link);

      // 2. Mount JS Script
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.crossOrigin = "";
      script.onload = () => {
        setLeafletLoaded(true);
      };
      script.onerror = () => {
        setLoadingError(true);
      };
      document.head.appendChild(script);
    } catch (e) {
      console.error("Leaflet asset load error:", e);
      setLoadingError(true);
    }
  }, []);

  // 3. Resolve initial defaults (Jakarta -> Malang) when leaflet is ready
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        // Resolve Jakarta origin
        const resOrg = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=Jakarta&limit=1&countrycodes=id`
        );
        const dataOrg = await resOrg.json();
        if (dataOrg && dataOrg[0]) {
          setOriginPlace(dataOrg[0]);
          setOriginInput(dataOrg[0].display_name);
        }

        // Resolve Malang destination
        const resDst = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=Malang&limit=1&countrycodes=id`
        );
        const dataDst = await resDst.json();
        if (dataDst && dataDst[0]) {
          setDestPlace(dataDst[0]);
          setDestInput(dataDst[0].display_name);
        }
      } catch (err) {
        console.error("Failed to load initial Nominatim data", err);
      }
    };

    fetchDefaults();
  }, []);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      // Create Map centered in West Java
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [-6.9175, 107.6191],
        zoom: 9,
        scrollWheelZoom: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Refresh layout view size
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keeps map persistent or destroy on unmount
    };
  }, [leafletLoaded]);

  // Handle Free Address Geocoding Search (Nominatim)
  const handleOsmSearch = async (query: string, type: "origin" | "dest") => {
    if (!query.trim()) return;

    if (type === "origin") setIsSearchingOrigin(true);
    else setIsSearchingDest(true);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "id"
        }
      });
      const data = await res.json();

      if (type === "origin") {
        setOriginSuggestions(data || []);
      } else {
        setDestSuggestions(data || []);
      }
    } catch (err) {
      console.error("Nominatim Search error:", err);
    } finally {
      if (type === "origin") setIsSearchingOrigin(false);
      else setIsSearchingDest(false);
    }
  };

  // Compute actual driving route coordinates via free OSRM Routing Machine
  useEffect(() => {
    if (!leafletLoaded || !originPlace || !destPlace) return;
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    const oLat = parseFloat(originPlace.lat);
    const oLon = parseFloat(originPlace.lon);
    const dLat = parseFloat(destPlace.lat);
    const dLon = parseFloat(destPlace.lon);

    const fetchRoute = async () => {
      setIsComputingRoute(true);
      setRouteError(null);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${oLon},${oLat};${dLon},${dLat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.code !== "Ok" || !result.routes || !result.routes[0]) {
          throw new Error("Rute tidak dapat ditemukan oleh server navigasi bebas.");
        }

        const route = result.routes[0];
        const coordinates = route.geometry.coordinates; // array of [lon, lat]
        const latLngs = coordinates.map((coord: any) => [coord[1], coord[0]]);

        // Store route points
        setRoutePoints(latLngs);

        // 1. Draw Polyline
        if (routePolylineRef.current) {
          map.removeLayer(routePolylineRef.current);
        }
        routePolylineRef.current = L.polyline(latLngs, {
          color: "#0d9488", // Teal 600
          weight: 6,
          opacity: 0.85,
          lineJoin: "round"
        }).addTo(map);

        // 2. Manage Markers
        if (markerStartRef.current) map.removeLayer(markerStartRef.current);
        if (markerEndRef.current) map.removeLayer(markerEndRef.current);

        // Standard custom icons
        const startIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `<div class="bg-rose-500 text-white w-6 h-6 rounded-full border border-white flex items-center justify-center font-bold text-[10px] shadow-sm">A</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const endIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `<div class="bg-cyan-500 text-white w-6 h-6 rounded-full border border-white flex items-center justify-center font-bold text-[10px] shadow-sm">B</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        markerStartRef.current = L.marker([oLat, oLon], { icon: startIcon })
          .addTo(map)
          .bindPopup(`<strong class="text-xs">Titik Berangkat:</strong><p class="text-[10px]">${originPlace.display_name}</p>`);

        markerEndRef.current = L.marker([dLat, dLon], { icon: endIcon })
          .addTo(map)
          .bindPopup(`<strong class="text-xs">Titik Tujuan:</strong><p class="text-[10px]">${destPlace.display_name}</p>`);

        // Fit boundaries
        map.fitBounds(routePolylineRef.current.getBounds(), {
          padding: [40, 40]
        });

        const distanceKmVal = Math.round(route.distance / 1000);
        setRouteDistanceKm(distanceKmVal);

        const durationSeconds = route.duration;
        const hrs = Math.floor(durationSeconds / 3600);
        const mins = Math.round((durationSeconds % 3600) / 60);
        const durationStrVal = hrs > 0 ? `${hrs} jam ${mins} menit` : `${mins} menit`;
        setRouteDurationStr(durationStrVal);

      } catch (err: any) {
        setRouteError(err.message || "Gagal menyambung ke server routing.");
        console.error(err);
      } finally {
        setIsComputingRoute(false);
      }
    };

    fetchRoute();
  }, [leafletLoaded, originPlace, destPlace]);

  // Compute nearby active SPKLU's dynamically along the custom route path!
  const filteredSpklus = useMemo(() => {
    if (!routePoints || routePoints.length === 0) return [];

    return SPKLU_DATABASE.map(spklu => {
      let minDistance = Infinity;
      let closestPointIndex = 0;

      // Sample every 4th coordinate on path to prevent loop overhead while maintaining precision
      for (let i = 0; i < routePoints.length; i += 4) {
        const pt = routePoints[i];
        const dist = getHaversineDistanceKm(spklu.lat, spklu.lon, pt[0], pt[1]);
        if (dist < minDistance) {
          minDistance = dist;
          closestPointIndex = i;
        }
      }

      // Explicitly check final target coordinate too
      if (routePoints.length > 0) {
        const pt = routePoints[routePoints.length - 1];
        const dist = getHaversineDistanceKm(spklu.lat, spklu.lon, pt[0], pt[1]);
        if (dist < minDistance) {
          minDistance = dist;
          closestPointIndex = routePoints.length - 1;
        }
      }

      return {
        ...spklu,
        distanceToRoute: minDistance,
        closestPointIndex
      };
    })
    // List only SPKLUs situated within 30 km threshold from any point of the driving route to account for toll roads or bypasses
    .filter(item => item.distanceToRoute <= 30)
    // Sort chronologically based on when the car naturally passes them on the road!
    .sort((a, b) => a.closestPointIndex - b.closestPointIndex);
  }, [routePoints]);

  // Compute precise cumulative road distance from origin along the path for each SPKLU
  const spklusWithDistance = useMemo(() => {
    if (!routePoints || routePoints.length === 0 || filteredSpklus.length === 0) return [];
    
    const segmentDistances: number[] = [];
    let cumulative = 0;
    segmentDistances.push(0);
    for (let i = 0; i < routePoints.length - 1; i++) {
      const d = getHaversineDistanceKm(
        routePoints[i][0], routePoints[i][1],
        routePoints[i+1][0], routePoints[i+1][1]
      );
      cumulative += d;
      segmentDistances.push(cumulative);
    }
    
    return filteredSpklus.map(spklu => {
      const idx = Math.min(spklu.closestPointIndex, segmentDistances.length - 1);
      const distFromStart = segmentDistances[idx];
      
      const isRestArea = spklu.name.toLowerCase().includes("rest area") || 
                         spklu.name.toLowerCase().includes("km ") || 
                         spklu.location.toLowerCase().includes("tol") ||
                         spklu.location.toLowerCase().includes("rest area");
      
      return {
        ...spklu,
        distanceFromStart: parseFloat(distFromStart.toFixed(1)),
        isRestArea
      };
    });
  }, [routePoints, filteredSpklus]);

  const finalSpklusToUse = useMemo(() => {
    if (filterTollOnly) {
      return spklusWithDistance.filter(spklu => spklu.isRestArea);
    }
    return spklusWithDistance;
  }, [spklusWithDistance, filterTollOnly]);

  // Dynamically render SPKLU Markers on Leaflet Canvas as SPKLUs along route are discovered
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = mapInstanceRef.current;

    // Remove previous SPKLU pins
    spkluMarkersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    spkluMarkersRef.current = [];

    // Custom electric charging pin icon for SPKLU markers
    const spkluIcon = L.divIcon({
      className: "custom-leaflet-spklu",
      html: `
        <div class="bg-emerald-600 hover:bg-emerald-700 text-white w-6 h-6 rounded-full border border-white flex items-center justify-center shadow-md cursor-pointer transition active:scale-95 duration-200">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Drawing new pins
    finalSpklusToUse.forEach((spklu) => {
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; width: 230px; min-width: 230px; line-height: 1.45; color: #18181b; padding: 2px;">
          <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 9px; height: 9px; border-radius: 9999px; background-color: #10b981; margin-top: 4px; flex-shrink: 0;"></span>
            <strong style="font-weight: 800; font-size: 12px; color: #0d9488; margin: 0; display: block; line-height: 1.25;">
              ${spklu.name}
            </strong>
          </div>
          <p style="font-size: 10.5px; color: #52525b; margin: 0 0 6px 0; line-height: 1.35;">
            ${spklu.location}
          </p>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 9.5px; font-family: monospace; border-top: 1px solid #f4f4f5; padding-top: 6px; margin-top: 6px;">
            <span style="background-color: #ecfdf5; color: #065f46; padding: 1.5px 5px; border-radius: 3px; font-weight: 700;">
              ⚡ ${spklu.type}
            </span>
            <span style="color: #4b5563; font-weight: 700; background-color: #f3f4f6; padding: 1.5px 5px; border-radius: 3px;">
              ${spklu.capacity}
            </span>
          </div>
          ${spklu.isRestArea ? `
          <div style="margin-top: 6px; font-size: 9px; font-weight: 800; color: #0284c7; background-color: #e0f2fe; padding: 2px 6px; border-radius: 4px; display: inline-block;">
            🛣️ Rest Area Tol
          </div>
          ` : ''}
          <p style="font-size: 9.5px; color: #71717a; font-style: italic; margin: 6px 0 0 0; border-top: 1px dashed #e4e4e7; padding-top: 4px;">
            Distansi ke rute: ±${spklu.distanceToRoute.toFixed(1)} km
          </p>
        </div>
      `;

      const mk = L.marker([spklu.lat, spklu.lon], { icon: spkluIcon })
        .addTo(map)
        .bindPopup(popupHtml, {
          minWidth: 245,
          maxWidth: 310,
          className: "clean-leaflet-popup"
        });
      spkluMarkersRef.current.push(mk);
    });

  }, [leafletLoaded, finalSpklusToUse]);

  // Physical calculations based on real OpenStreetMap distance
  const metrics = useMemo(() => {
    const totalDistanceKm = routeDistanceKm || 0;
    
    // Standard basic energy efficiency at normal speed is 15.2 kWh / 100km
    let baseKwhPer100Km = 15.2;

    // Adjust for Speed Mode
    if (speedStyle === "eco") {
      baseKwhPer100Km *= 0.88;
    } else if (speedStyle === "sport") {
      baseKwhPer100Km *= 1.25;
    }

    // Weight Load Adjustment
    if (cargoLoad === "eco") {
      baseKwhPer100Km *= 0.95;
    } else if (cargoLoad === "heavy") {
      baseKwhPer100Km *= 1.08;
    }

    // Cabin Climate Control
    if (acIntensity === "low") {
      baseKwhPer100Km *= 0.96;
    } else if (acIntensity === "high") {
      baseKwhPer100Km *= 1.10;
    }

    // Wheel Premium Friction Customizer
    if (wheelDiameter === 19) {
      baseKwhPer100Km += 0.45;
    }

    // Outside High Heat (Above 33C starts high battery active cooling liquid pumps)
    if (temperatureCelsius > 34) {
      baseKwhPer100Km += 0.35;
    }

    // Calculate maximum realistic driving highway range for J5 EV (67 kWh)
    const realHighwaysRange = (JAECOO_EV_SPECS.batteryCapacityKwh / baseKwhPer100Km) * 100;

    // Energy needed for the computed travel trip (kWh)
    const requiredTotalKwh = (totalDistanceKm * baseKwhPer100Km) / 100;

    // Useable leg mileage with start SOC minus safety minimum target
    const safetyDeltaFactor = Math.max(0.1, (socAtStart - socSafetyLimit) / 100);
    const firstLegMaxDistanceKm = realHighwaysRange * safetyDeltaFactor;

    // Stops required calculation
    let totalChargingStopsNeeded = 0;
    if (totalDistanceKm > firstLegMaxDistanceKm) {
      const standardStopCycleDist = realHighwaysRange * 0.65;
      const remainingDistance = totalDistanceKm - firstLegMaxDistanceKm;
      totalChargingStopsNeeded = Math.ceil(remainingDistance / standardStopCycleDist);
    }

    // Tariff rates
    let rateIdrValue = 2466;
    if (tariffType === "home") rateIdrValue = 1699;
    if (tariffType === "spklu_ultra") rateIdrValue = 3700;

    const netKwhCostIdr = Math.round(requiredTotalKwh * rateIdrValue);

    // Adaptive Indonesian Toll estimating model matching real Trans-Java & Regional Expressway rates
    let totalTollFareIdr = 0;
    if (routeViaToll && totalDistanceKm > 40) {
      if (totalDistanceKm <= 180) {
        // e.g. Jakarta - Bandung scale
        totalTollFareIdr = Math.round(totalDistanceKm * 880);
      } else if (totalDistanceKm <= 500) {
        // e.g. Jakarta - Semarang scale
        totalTollFareIdr = Math.round(totalDistanceKm * 1020);
      } else {
        // e.g. Jakarta - Surabaya scale
        totalTollFareIdr = Math.round(totalDistanceKm * 1110);
      }
    }

    const overallTripInvoice = netKwhCostIdr + totalTollFareIdr;

    // Petrol Comparison (Gasoline SUV matches ~1 Liter RON 92 per 11 km)
    const equivalentsGasolineLiters = totalDistanceKm / 11;
    const petrolSUVEstimatesIdr = Math.round(equivalentsGasolineLiters * 13500);

    const economyValueSaved = Math.max(0, petrolSUVEstimatesIdr - netKwhCostIdr);

    const fossilCo2Kg = equivalentsGasolineLiters * 2.31;
    const evCo2Kg = requiredTotalKwh * 0.84;
    const avoidedCo2Kg = Math.max(0, fossilCo2Kg - evCo2Kg);

    return {
      efficiencyKwh100: parseFloat(baseKwhPer100Km.toFixed(1)),
      maxRangeKm: Math.round(realHighwaysRange),
      tripKwhUsed: parseFloat(requiredTotalKwh.toFixed(1)),
      chargingStopsNumber: totalChargingStopsNeeded,
      chargingCostIdr: netKwhCostIdr,
      tollCostIdr: totalTollFareIdr,
      totalTripExpensesIdr: overallTripInvoice,
      petrolCostIdr: petrolSUVEstimatesIdr,
      moneySavedIdr: economyValueSaved,
      co2SavedKg: parseFloat(avoidedCo2Kg.toFixed(1))
    };
  }, [
    routeDistanceKm,
    speedStyle,
    cargoLoad,
    acIntensity,
    wheelDiameter,
    temperatureCelsius,
    socAtStart,
    socSafetyLimit,
    tariffType,
    routeViaToll
  ]);

  // Journey Timeline & Charging Optimization Engine
  const journeyTimeline = useMemo(() => {
    const totalDist = routeDistanceKm || 0;
    const efficiency = metrics.efficiencyKwh100;
    const autoStops: string[] = [];
    
    if (finalSpklusToUse.length === 0) {
      return { autoStops };
    }

    // Robust Greedy EV charging algorithm: maximizes driving distance per leg
    let currentSoc = socAtStart;
    let currentPos = 0;
    
    while (true) {
      // Can we reach the destination directly?
      const distToDest = totalDist - currentPos;
      const lossToDest = (distToDest * efficiency) / JAECOO_EV_SPECS.batteryCapacityKwh;
      if (currentSoc - lossToDest >= socSafetyLimit) {
        break; // Yes, we can reach the destination safely!
      }
      
      // If we cannot reach destination, find the candidate SPKLUs that are ahead of our current position
      const candidates = finalSpklusToUse.filter(spklu => spklu.distanceFromStart > currentPos);
      if (candidates.length === 0) {
        break; // No more stations ahead
      }
      
      // Of these candidates, which ones can be reached safely (arrivalSoc >= socSafetyLimit)?
      const safeCandidates = candidates.filter(spklu => {
        const dist = spklu.distanceFromStart - currentPos;
        const loss = (dist * efficiency) / JAECOO_EV_SPECS.batteryCapacityKwh;
        return (currentSoc - loss) >= socSafetyLimit;
      });
      
      let stopSpklu = null;
      if (safeCandidates.length > 0) {
        // Stop at the furthest safe station
        stopSpklu = safeCandidates[safeCandidates.length - 1];
      } else {
        // If no station can be reached safely, we must stop at the VERY FIRST candidate station to charge, 
        // even if we arrive below safety limit, to avoid complete depletion
        stopSpklu = candidates[0];
      }
      
      // Add to autoStops
      autoStops.push(stopSpklu.id);
      
      // Update our state for the next leg after charging
      const distToStop = stopSpklu.distanceFromStart - currentPos;
      const lossToStop = (distToStop * efficiency) / JAECOO_EV_SPECS.batteryCapacityKwh;
      const arrivalSoc = Math.max(0, currentSoc - lossToStop);
      
      currentPos = stopSpklu.distanceFromStart;
      currentSoc = Math.max(80, arrivalSoc); // Charge up to standard fast DC limit (at least 80%)
    }

    return { autoStops };
  }, [finalSpklusToUse, routeDistanceKm, metrics.efficiencyKwh100, socAtStart, socSafetyLimit]);

  // Sync simulated charge stops with auto recommended stops when route/specs change
  const autoStopsJoined = journeyTimeline.autoStops.join(",");
  useEffect(() => {
    setSimulatedChargeStops(journeyTimeline.autoStops);
  }, [autoStopsJoined]);

  // Build sequential physical milestones list (Start -> SPKLU 1 -> SPKLU 2... -> End)
  const activeTimeline = useMemo(() => {
    const totalDist = routeDistanceKm || 0;
    const efficiency = metrics.efficiencyKwh100;
    const timelinePoints: any[] = [];

    // 1. Add Starting Point
    timelinePoints.push({
      type: "start",
      id: "start",
      name: originPlace ? originPlace.display_name.split(",")[0] : "Titik Berangkat",
      location: originPlace ? originPlace.display_name : originInput,
      distanceFromStart: 0,
      socArrival: socAtStart,
      socDeparture: socAtStart,
      chargedAmount: 0,
      isRestArea: false
    });

    let currentSoc = socAtStart;
    let lastPosition = 0;

    // 2. Drive through intermediate SPKLU milestones
    finalSpklusToUse.forEach((spklu) => {
      const distFromLast = spklu.distanceFromStart - lastPosition;
      const lossSoc = (distFromLast * efficiency) / JAECOO_EV_SPECS.batteryCapacityKwh;
      const arrivalSoc = Math.max(0, parseFloat((currentSoc - lossSoc).toFixed(1)));

      const isCharging = simulatedChargeStops.includes(spklu.id);
      let departureSoc = arrivalSoc;
      let chargeAmount = 0;

      if (isCharging) {
        departureSoc = Math.max(80, arrivalSoc);
        chargeAmount = Math.max(0, departureSoc - arrivalSoc);
        currentSoc = departureSoc;
      } else {
        currentSoc = arrivalSoc;
      }

      lastPosition = spklu.distanceFromStart;

      timelinePoints.push({
        type: "spklu",
        id: spklu.id,
        name: spklu.name,
        location: spklu.location,
        note: spklu.note,
        capacity: spklu.capacity,
        typeLabel: spklu.type,
        distanceFromStart: spklu.distanceFromStart,
        socArrival: arrivalSoc,
        socDeparture: parseFloat(departureSoc.toFixed(1)),
        isCharging,
        chargedAmount: parseFloat(chargeAmount.toFixed(1)),
        isRestArea: spklu.isRestArea,
        lat: spklu.lat,
        lon: spklu.lon,
        isCritical: arrivalSoc < socSafetyLimit
      });
    });

    // 3. Drive final leg to destination
    const distFromLast = totalDist - lastPosition;
    const lossSoc = (distFromLast * efficiency) / JAECOO_EV_SPECS.batteryCapacityKwh;
    const arrivalSocDest = Math.max(0, parseFloat((currentSoc - lossSoc).toFixed(1)));

    timelinePoints.push({
      type: "dest",
      id: "dest",
      name: destPlace ? destPlace.display_name.split(",")[0] : "Tujuan",
      location: destPlace ? destPlace.display_name : destInput,
      distanceFromStart: totalDist,
      socArrival: arrivalSocDest,
      socDeparture: arrivalSocDest,
      chargedAmount: 0,
      isRestArea: false,
      isCritical: arrivalSocDest < socSafetyLimit
    });

    return timelinePoints;
  }, [finalSpklusToUse, routeDistanceKm, metrics.efficiencyKwh100, socAtStart, simulatedChargeStops, socSafetyLimit, originPlace, destPlace, originInput, destInput]);

  const handleFlyTo = (lat: string | number, lon: string | number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([parseFloat(String(lat)), parseFloat(String(lon))], 14);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadInfographics = async () => {
    const node = document.getElementById("ev-itinerary-card");
    if (!node) return;
    try {
      setIsExporting(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const dataUrl = await toPng(node, {
        pixelRatio: 2.5,
        style: {
          transform: "scale(1)",
          margin: "0",
        }
      });
      const link = document.createElement("a");
      const fromName = originPlace ? originPlace.display_name.split(",")[0].trim() : originInput.trim() || "Start";
      const toName = destPlace ? destPlace.display_name.split(",")[0].trim() : destInput.trim() || "Dest";
      link.download = `J5_EVO_Itinerary_${fromName.replace(/\s+/g, '_')}_ke_${toName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal esport infografis:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loadingError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-6 text-center space-y-3 font-sans">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h4 className="font-extrabold text-sm">Gagal Membuat Peta Bebas</h4>
        <p className="text-xs text-zinc-650 max-w-sm mx-auto">
          Sambungan internet Anda nampaknya tidak dapat mengunduh pustaka peta OpenStreetMap. Silakan periksa kembali jaringan seluler atau Wifi Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ROW 1: Pencarian Alamat & Peta Perjalanan digabung dalam 1 Row lebar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4 text-left relative z-50">
        <div className="flex items-center gap-1.5 border-b border-zinc-150 pb-3">
          <Navigation className="w-5 h-5 text-emerald-600" />
          <div>
            <h4 className="font-extrabold text-sm text-zinc-800 uppercase tracking-wider font-mono">Pencarian Alamat &amp; Peta Perjalanan J5</h4>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Cari rute dari mana saja ke mana saja di Indonesia secara gratis! Geser peta bebas OpenStreetMap dengan penanda hijau SPKLU di lintasan rute.
            </p>
          </div>
        </div>

        {/* MAP CONTAINER (di atas Alamat / Titik Awal (A)) */}
        <div className="space-y-2">
          <div className="relative flex flex-col">
            <div 
              ref={mapContainerRef} 
              className="w-full h-[320px] md:h-[420px] bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 shadow-inner z-[10]" 
            />

            {!leafletLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-100/40 rounded-xl text-center z-20">
                <div className="space-y-2">
                  <div className="animate-spin text-emerald-600 font-bold">...</div>
                  <p className="text-xs text-zinc-500">Memuat modul peta bebas OpenStreetMap...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 text-[10px] text-zinc-500 font-mono p-1">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block border border-white" />
                <span>Titik Awal</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 block border border-white" />
                <span>Tujuan Akhir</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="bg-emerald-600 text-white w-3 h-3 rounded-full flex items-center justify-center text-[8px]">
                  ⚡
                </div>
                <span>SPKLU PLN Terdeteksi</span>
              </div>
            </div>
            
            <p className="text-[9px] text-zinc-400">Geser atau ketik rute baru untuk mengubah deteksi stasiun pengisian daya.</p>
          </div>
        </div>

        {/* INPUT ALAMAT dibuat 1 row / berdampingan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
          
          {/* ORIGIN FIELD */}
          <div className="space-y-1 relative z-40">
            <label className="text-[10px] font-bold text-zinc-550 block uppercase font-mono">Alamat / Titik Awal (A)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                placeholder="Ketik asal jalan, kelurahan, kota dll"
                className="w-full text-xs bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-2.5 rounded-lg outline-none font-medium transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleOsmSearch(originInput, "origin")}
              />
              <button 
                onClick={() => handleOsmSearch(originInput, "origin")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 transition active:scale-95 text-xs text-center flex items-center font-bold font-mono cursor-pointer animate-none"
                disabled={isSearchingOrigin}
              >
                {isSearchingOrigin ? "Pola..." : "Cari"}
              </button>
            </div>

            {/* Suggestions dropdown lists */}
            {originSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 p-1.5 max-h-48 overflow-y-auto space-y-1 text-xs">
                <span className="text-[9px] text-zinc-400 font-bold block ml-1 uppercase">Pilih lokasi spesifik:</span>
                {originSuggestions.map((place) => (
                  <button
                    key={place.place_id}
                    onClick={() => {
                      setOriginPlace(place);
                      setOriginInput(place.display_name);
                      setOriginSuggestions([]);
                    }}
                    className="w-full text-left p-2 hover:bg-zinc-50 rounded-lg transition text-zinc-700 cursor-pointer"
                  >
                    <span className="text-[10px] text-zinc-650 block leading-tight">{place.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            
            {originPlace && (
              <p className="text-[10px] text-emerald-600 font-bold pl-1 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Terpilih: {originPlace.display_name.split(",")[0]}
              </p>
            )}
          </div>

          {/* DESTINATION FIELD */}
          <div className="space-y-1 relative z-30">
            <label className="text-[10px] font-bold text-zinc-550 block uppercase font-mono">Alamat Tujuan Akhir (B)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={destInput}
                onChange={(e) => setDestInput(e.target.value)}
                placeholder="Cari hotel, stasiun, mall, dsb..."
                className="w-full text-xs bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-2.5 rounded-lg outline-none font-medium transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleOsmSearch(destInput, "dest")}
              />
              <button 
                onClick={() => handleOsmSearch(destInput, "dest")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 transition active:scale-95 text-xs text-center flex items-center font-bold font-mono cursor-pointer animate-none"
                disabled={isSearchingDest}
              >
                {isSearchingDest ? "Pola..." : "Cari"}
              </button>
            </div>

            {/* Suggestions dropdown lists */}
            {destSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 p-1.5 max-h-48 overflow-y-auto space-y-1 text-xs">
                <span className="text-[9px] text-zinc-400 font-bold block ml-1 uppercase">Pilih lokasi spesifik:</span>
                {destSuggestions.map((place) => (
                  <button
                    key={place.place_id}
                    onClick={() => {
                      setDestPlace(place);
                      setDestInput(place.display_name);
                      setDestSuggestions([]);
                    }}
                    className="w-full text-left p-2 hover:bg-zinc-50 rounded-lg transition text-zinc-700 cursor-pointer"
                  >
                    <span className="text-[10px] text-zinc-650 block leading-tight">{place.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            
            {destPlace && (
              <p className="text-[10px] text-teal-600 font-bold pl-1 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Terpilih: {destPlace.display_name.split(",")[0]}
              </p>
            )}
          </div>

        </div>

      </div>

      {/* ROW 2: Sesuaikan Variabel Mengemudi & Cuaca + Kalkulator Estimasi Kemampuan Baterai */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* DRIVING FACTORS CONTROL CARD */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4 text-left relative z-20">
            <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-3">
              <Gauge className="w-4.5 h-4.5 text-emerald-600" />
              <h4 className="font-extrabold text-xs text-zinc-800 uppercase tracking-wider font-mono">Sesuaikan Variabel Mengemudi &amp; Cuaca</h4>
            </div>

            <p className="text-[11px] text-zinc-505 leading-normal">
              Ubah variabel di bawah untuk menghitung ulang efisiensi energi secara dinamis pada perjalanan rute di atas.
            </p>

            <div className="space-y-4 text-xs">
              
              {/* SPEED STYLE SELECTOR */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-zinc-700">
                  <span>Kecepatan Mengemudi</span>
                  <span className="text-emerald-600 uppercase font-mono text-[9px] font-black">
                    {speedStyle === "eco" ? "Eco Cruising (60-80 km/h)" : speedStyle === "sport" ? "Sport / High Speed (>100 km/h)" : "Normal Standard (80-100 km/h)"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                  {["eco", "normal", "sport"].map((ss) => (
                    <button
                      key={ss}
                      onClick={() => setSpeedStyle(ss as any)}
                      className={`py-1.5 rounded text-[11px] font-bold uppercase transition cursor-pointer select-none ${
                        speedStyle === ss
                          ? "bg-white text-emerald-950 shadow-xs border border-zinc-200/50"
                          : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {ss}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARGO WEIGHT SELECTOR */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-zinc-700">
                  <span>Muatan &amp; Penumpang</span>
                  <span className="text-emerald-600 uppercase font-mono text-[9px] font-black">
                    {cargoLoad === "eco" ? "Driver saja (Ringan)" : cargoLoad === "heavy" ? "Muatan Full (5 Orang + Bagasi)" : "Sedang (Keluarga Kecil)"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                  {[
                    { id: "eco", label: "Ringan" },
                    { id: "moderate", label: "Sedang" },
                    { id: "heavy", label: "Penuh" }
                  ].map((cl) => (
                    <button
                      key={cl.id}
                      onClick={() => setCargoLoad(cl.id as any)}
                      className={`py-1.5 rounded text-[11px] font-bold transition cursor-pointer select-none ${
                        cargoLoad === cl.id
                          ? "bg-white text-emerald-955 shadow-xs border border-zinc-200/50"
                          : "text-zinc-650 hover:bg-zinc-50"
                      }`}
                    >
                      {cl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AC COOLING INTENSITY SELECTOR */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-zinc-700">
                  <span>Intensitas AC Pendingin</span>
                  <span className="text-emerald-600 uppercase font-mono text-[9px] font-black">
                    {acIntensity === "low" ? "Minimal (Suhu 24°C)" : acIntensity === "high" ? "Maksimal Dingin (Suhu 18°C)" : "Sedang (Suhu 21°C)"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                  {[
                    { id: "low", label: "Low" },
                    { id: "medium", label: "Medium" },
                    { id: "high", label: "High" }
                  ].map((cl) => (
                    <button
                      key={cl.id}
                      onClick={() => setAcIntensity(cl.id as any)}
                      className={`py-1.5 rounded text-[11px] font-bold transition cursor-pointer select-none ${
                        acIntensity === cl.id
                          ? "bg-white text-emerald-955 shadow-xs border border-zinc-200/50"
                          : "text-zinc-655 hover:bg-zinc-50"
                      }`}
                    >
                      {cl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TARIFF / ELECTRIC PRICE SELECTOR */}
              <div className="space-y-1.5">
                <span className="font-bold text-zinc-700 block">Daya Tarif Pembelian</span>
                <div className="space-y-1.5">
                  {[
                    { id: "home", name: "PLN Home Charging AC", price: "Rp 1.699 / kWh", desc: "Murni pengisian santai semalam di hunian" },
                    { id: "spklu_fast", name: "SPKLU DC Fast Charging (50-60kW)", price: "Rp 2.466 / kWh", desc: "Arus bolak-balik andalan rest area tol" },
                    { id: "spklu_ultra", name: "SPKLU DC Ultra Fast (120-200kW)", price: "Rp 3.700 / kWh", desc: "Arus raksasa ultra cepat menghemat waktu" }
                  ].map((tar) => (
                    <button
                      key={tar.id}
                      onClick={() => setTariffType(tar.id as any)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer select-none ${
                        tariffType === tar.id
                          ? "bg-emerald-50/70 border-emerald-500 text-emerald-950 font-medium"
                          : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="pr-2">
                        <span className="font-extrabold block text-[11px] leading-tight text-zinc-800">{tar.name}</span>
                        <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">{tar.desc}</span>
                      </div>
                      <span className="text-[10px] font-mono font-black border border-emerald-200 text-emerald-900 bg-white px-2 py-0.5 rounded flex-shrink-0">
                        {tar.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* BATTERY SOC DELTA TARGETS */}
              <div className="p-3.5 bg-zinc-50 rounded-xl space-y-3.5 border border-zinc-200">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-extrabold text-zinc-700">
                    <span>Isi Baterai Awal Keberangkatan</span>
                    <span className="font-mono text-emerald-700 text-xs">{socAtStart}% SOC</span>
                  </div>
                  <input 
                    type="range" 
                    min="60" 
                    max="100" 
                    step="5"
                    value={socAtStart} 
                    onChange={(e) => setSocAtStart(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded cursor-pointer outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-extrabold text-zinc-700">
                    <span>Cadangan Minimum Baterai (Safety Limit)</span>
                    <span className="font-mono text-amber-700 text-xs">{socSafetyLimit}% SOC</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="35" 
                    step="5"
                    value={socSafetyLimit} 
                    onChange={(e) => setSocSafetyLimit(parseInt(e.target.value))}
                    className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded cursor-pointer outline-none"
                  />
                </div>
              </div>

              {/* ADVANCED CLIMATE MODIFIERS ACCORDION (WHEELS & AIR TEMP) */}
              <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                <div className="space-y-1">
                  <span className="font-extrabold text-zinc-650 text-[11px] uppercase">Ukuran Velg Ring J5</span>
                  <select 
                    value={wheelDiameter} 
                    onChange={(e) => setWheelDiameter(parseInt(e.target.value))}
                    className="w-full text-xs font-bold bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={18}>18 Inci Standard EV Rim</option>
                    <option value={19}>19 Inci Dynamic Sport Rim</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="font-extrabold text-zinc-650 text-[11px] uppercase">Suhu Udara Luar (Cuaca)</span>
                  <select 
                    value={temperatureCelsius} 
                    onChange={(e) => setTemperatureCelsius(parseInt(e.target.value))}
                    className="w-full text-xs font-bold bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={26}>Pagi / Hujan (26°C)</option>
                    <option value={31}>Tropis Normal (31°C)</option>
                    <option value={36}>Kemarau Panas Terik (36°C)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BATTERY ESTIMATION CALCULATOR */}
        <div className="lg:col-span-6 space-y-4">
          <div 
            id="ev-itinerary-card"
            className="bg-zinc-950 text-white rounded-2xl p-5 border border-slate-800 shadow-2xl space-y-4 text-left"
          >
            {/* Header with Larger Floating J5 Evo logo badge */}
            <div className="border-b border-white/[0.08] pb-4 text-center space-y-3.5 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-md opacity-75" />
                <div className="relative bg-[#09090b] rounded-full p-3.5 border border-emerald-500/30">
                  <J5EvoLogo className="w-14 h-14 transform hover:scale-110 hover:rotate-12 transition duration-500 cursor-pointer" color="#10b981" bgFill="#09090b" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] text-emerald-400 font-mono tracking-widest font-extrabold uppercase block select-none">
                  J5 EVO OFFICIAL TRIP LOG
                </span>
                <h4 className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 font-mono tracking-wider font-extrabold uppercase leading-tight">
                  Kalkulator Estimasi Kemampuan Baterai
                </h4>
              </div>
            </div>

            {/* Travel Info Section (Dari mana ke mana) */}
            <div className="bg-[#0e1017] border border-slate-900 rounded-xl p-3.5 space-y-1.5">
              <div className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase block font-semibold">INFORMASI PERJALANAN AKTIF</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold font-mono">ASAL</span>
                  <span className="text-xs font-black text-white truncate">
                    {originPlace ? originPlace.display_name : originInput || "Titik Belum Ditentukan"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 font-bold font-mono">TUJUAN</span>
                  <span className="text-xs font-black text-white truncate">
                    {destPlace ? destPlace.display_name : destInput || "Tujuan Belum Ditentukan"}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Schematic Route Map ("ada petanya") */}
            <div className="bg-[#0c0d12] border border-slate-900 rounded-xl p-3.5 space-y-3 select-none">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase block font-semibold">SKEMA RUTE & PENGISIAN DAYA</span>
                <span className="text-[9px] font-mono text-emerald-400 font-extrabold">J5 EV SPEC</span>
              </div>
              
              {/* MOBILE HORIZONTAL SCROLL EXTEND BLEED PATTERN */}
              <div className="overflow-x-auto -mx-3.5 px-3.5 scrollbar-thin">
                <div className="flex items-center justify-between relative py-2 min-w-[450px] sm:min-w-full">
                  {/* Connecting pipeline */}
                  <div className="absolute left-6 right-6 top-[28px] h-0.5 bg-zinc-800 z-0" />
                  <div className="absolute left-6 right-6 top-[28px] h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 z-0" />

                  {/* Starting check */}
                  <div className="relative z-10 flex flex-col items-center space-y-1 flex-shrink-0 w-[95px]">
                    <div className="relative z-20 w-10 h-10 rounded-full bg-[#022c22] border-2 border-emerald-500 flex items-center justify-center text-sm shadow-xl shadow-emerald-950/40">
                      📍
                    </div>
                    <div className="text-center relative z-10 px-1 flex flex-col items-center justify-start w-full">
                      <span className="text-[8.5px] font-black text-white block uppercase leading-[1.1] text-center" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {originPlace ? originPlace.display_name.split(",")[0].trim() : originInput.split(",")[0].trim() || "Start"}
                      </span>
                      <span className="text-[8px] font-mono text-emerald-400 font-extrabold block mt-0.5">
                        SOC {socAtStart}%
                      </span>
                    </div>
                  </div>

                  {/* SPKLU Charging Stops */}
                  {activeTimeline.filter(item => item.type === "spklu" && item.isCharging).map((item) => (
                    <div key={item.id} className="relative z-10 flex flex-col items-center space-y-1 flex-shrink-0 w-[95px]">
                      <div className="relative z-20 w-10 h-10 rounded-full bg-[#451a03] border-2 border-amber-500 flex items-center justify-center text-sm shadow-xl shadow-amber-950/40">
                        🔌
                      </div>
                      <div className="text-center relative z-10 px-1 flex flex-col items-center justify-start w-full">
                        <span className="text-[8.5px] font-black text-amber-200 block uppercase leading-[1.1] text-center" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.name.replace("SPKLU", "").trim()}
                        </span>
                        <span className="text-[8px] font-mono text-emerald-400 block font-black leading-none mt-0.5">
                          {item.distanceFromStart.toFixed(0)} KM
                        </span>
                        <span className="text-[8px] font-mono text-amber-300 block font-bold leading-tight mt-0.5">
                          {item.socArrival}% ➜ {item.socDeparture}%
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Destination */}
                  <div className="relative z-10 flex flex-col items-center space-y-1 flex-shrink-0 w-[95px]">
                    <div className="relative z-20 w-10 h-10 rounded-full bg-[#083344] border-2 border-cyan-500 flex items-center justify-center text-sm shadow-xl shadow-cyan-950/40">
                      🏆
                    </div>
                    <div className="text-center relative z-10 px-1 flex flex-col items-center justify-start w-full">
                      <span className="text-[8.5px] font-black text-white block uppercase leading-[1.1] text-center" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {destPlace ? destPlace.display_name.split(",")[0].trim() : destInput.split(",")[0].trim() || "Tujuan"}
                      </span>
                      <span className="text-[8px] font-mono text-cyan-300 font-extrabold block mt-0.5">
                        Tiba: {activeTimeline[activeTimeline.length - 1]?.socArrival}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ESTIMATED NUMERICAL PERFORMANCE DETAILS */}
            <div className="border-b border-white/[0.06] pb-3 text-center">
              <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase block font-bold">ESTIMASI JARAK MAKSIMAL J5</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                  {metrics.maxRangeKm}
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">KM</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">
                Konsumsi: <span className="text-emerald-200 font-extrabold">{metrics.efficiencyKwh100} kWh / 100km</span>
              </p>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Jarak Rute Layanan:</span>
                <span className="font-mono text-white font-extrabold">
                  {isComputingRoute ? "Menghitung..." : routeDistanceKm !== null ? `${routeDistanceKm} KM` : "-- KM"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Waktu Tempuh Perjalanan:</span>
                <span className="font-mono text-zinc-100 font-bold">
                  {isComputingRoute ? "Menghubungkan OSRM..." : routeDurationStr || "--"}
                </span>
              </div>

              {routeError && (
                <div className="bg-red-950/40 p-2.5 rounded border border-red-900 text-red-300 text-[10px] flex items-start gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Navigasi error: {routeError}</span>
                </div>
              )}

              <hr className="border-white/[0.05]" />

              <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg border border-white/5">
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">Daya Baterai Terpakai:</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Kapasitas Maks ({JAECOO_EV_SPECS.batteryCapacityKwh} kWh)</span>
                </div>
                <span className="font-mono text-sm text-emerald-100 font-extrabold">{isComputingRoute ? "..." : `${metrics.tripKwhUsed} kWh`}</span>
              </div>

              <div className="flex justify-between font-bold">
                <span className="text-zinc-400">Rekomendasi Stop Pengisian:</span>
                <span className="font-mono font-black text-amber-300 text-xs">
                  {routeDistanceKm !== null ? (simulatedChargeStops.length === 0 ? "Tanpa Berhenti (Cukup)" : `${simulatedChargeStops.length}x Stop DC`) : "Belum ditentukan"}
                </span>
              </div>

              {/* Price list */}
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-350">Biaya Listrik EV:</span>
                  <span className="font-mono text-emerald-200 font-bold">{metrics.chargingCostIdr.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits:0 })}</span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-zinc-350">Taksiran Tarif Tol:</span>
                    <p className="text-[8px] text-zinc-500 italic">Asumsi tol Trans-Jawa / regional VIP</p>
                  </div>
                  <span className="font-mono text-zinc-300">{metrics.tollCostIdr.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits:0 })}</span>
                </div>
                <hr className="border-white/[0.04]" />
                <div className="flex justify-between text-xs font-black">
                  <span className="text-slate-100">Total Pengeluaran Sekali Jalan:</span>
                  <span className="text-emerald-400 text-sm font-mono">{metrics.totalTripExpensesIdr.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits:0 })}</span>
                </div>
              </div>

              {/* Savings box */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-start gap-2.5 text-[11px] leading-relaxed">
                <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-emerald-300 block text-[11px]">Perbandingan Hemat Rp (Bensin)</span>
                  <span>Dibandingkan mobil bensin konvensional sekelas JAECOO J5 (~{metrics.petrolCostIdr.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits:0 })}), Anda menghemat bersih hingga <strong className="text-teal-300 font-mono">{metrics.moneySavedIdr.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits:0 })}</strong> sekali jalan!</span>
                </div>
              </div>

              <div className="bg-[#032e22] border border-emerald-500/15 p-3 rounded-lg flex items-center gap-2 text-[10px]">
                <Trees className="w-4 h-4 text-emerald-400" />
                <span>Mengurangi emisi polusi udara perkotaan sebanyak <strong className="text-emerald-300 font-mono">{metrics.co2SavedKg} kg CO₂</strong>.</span>
              </div>
            </div>
          </div>

          {/* Unduh Infografis Action Button (placed outer-side so it is not captured in the PNG file!) */}
          <button
            onClick={handleDownloadInfographics}
            disabled={isExporting}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold font-mono text-xs shadow-lg shadow-emerald-950/20 active:scale-95 transition-all outline-none border border-emerald-500/30 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-white" />
            {isExporting ? "Membuat File Gambar..." : "UNDUH INFOGRAFIS PERJALANAN (PNG)"}
          </button>
        </div>

      </div>

      {/* NEW DYNAMIC INTERACTIVE SECTION: PUSAT ASISTEN PERJALANAN & REKOMENDASI SKENARIO BATERAI */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm text-left space-y-6">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                Asisten Rute J5 EVO
              </span>
              <span className="text-[9px] bg-teal-500/10 text-teal-700 border border-teal-500/20 font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                LFP 67 kWh
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-zinc-900 font-sans flex items-center gap-2">
              Rencana Perjalanan &amp; Asisten Pengisian Daya J5
            </h3>
            <p className="text-xs text-zinc-550">
              Analisis kebutuhan pengisian daya, saringan Rest Area Tol, dan simulator baterai interaktif berdasarkan spesifikasi nyata JAECOO J5 LFP (67 kWh).
            </p>
          </div>
          
          {/* TAB SELECTOR */}
          <div className="flex bg-zinc-100 p-1 rounded-xl self-start border border-zinc-200">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "timeline" ? "bg-white text-emerald-700 shadow-sm" : "text-zinc-550 hover:text-zinc-800"
              }`}
            >
              🗓️ Jalur Milestones & Baterai
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "directory" ? "bg-white text-emerald-700 shadow-sm" : "text-zinc-550 hover:text-zinc-800"
              }`}
            >
              🔍 Direktori Lengkap SPKLU ({finalSpklusToUse.length})
            </button>
          </div>
        </div>

        {/* CONTROLS HUB - FILTERS */}
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* TOLL REST AREA FILTER */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={filterTollOnly}
              onChange={(e) => setFilterTollOnly(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-zinc-800 group-hover:text-emerald-700 transition">
                🛣️ Hanya SPKLU Rest Area Tol
              </span>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Saring direktori hanya untuk SPKLU PLN yang berada di Tempat Istirahat (Rest Area) jalan tol regional. Cocok untuk perjalanan bebas hambatan.
              </p>
            </div>
          </label>

          {/* TOLL ESTIMATION LINKED TOGGLE */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={routeViaToll}
              onChange={(e) => setRouteViaToll(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-zinc-800 group-hover:text-emerald-700 transition">
                💳 Hitung Tarif & Lewat Jalan Tol
              </span>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Tambahkan biaya tol otomatis (estimasi Rp 1.100 / km) pada rincian budget pengeluaran dan simulasikan bahwa rute penuh melewati tol.
              </p>
            </div>
          </label>

        </div>

        {/* TAB CONTENTS */}
        {activeTab === "timeline" ? (
          
          <div className="space-y-6">
            
            {/* INSTRUCTION ALERTS */}
            <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100 flex gap-2.5 items-start text-xs leading-relaxed text-zinc-650">
              <Zap className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-800 font-extrabold block">Asisten Rencana Pengisian Daya Aktif</strong>
                Di bawah ini adalah status baterai JAECOO J5 Anda secara kronologis di setiap titik. Gunakan tombol <strong className="text-teal-700">"🔌 Simulasikan Isi Daya"</strong> di stasiun mana pun untuk mengisi daya kembali demi menjaga baterai di atas target batas aman Anda (<strong className="font-mono text-emerald-700 font-bold">{socSafetyLimit}%</strong>). Klik <strong className="text-teal-700">"Fokus Peta"</strong> untuk memposisikan kamera peta.
              </div>
            </div>

            {/* TIMELINE PATH */}
            <div className="relative border-l-2 border-emerald-150 pl-5 ml-4 space-y-7 py-2">
              
              {activeTimeline.map((item, idx) => {
                
                // Render icons based on step type
                const isStart = item.type === "start";
                const isDest = item.type === "dest";
                
                return (
                  <div key={item.id} className="relative group">
                    
                    {/* TIMELINE CIRCLE / PIN INDICATOR */}
                    <span className={`absolute -left-[29px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-xs transition duration-300 ${
                      isStart ? "border-rose-505 bg-rose-500 ring-4 ring-rose-50" :
                      isDest ? "border-cyan-505 bg-cyan-500 ring-4 ring-cyan-50" :
                      item.isCharging ? "border-emerald-600 bg-emerald-600 ring-4 ring-emerald-100 animate-pulse" :
                      item.isCritical ? "border-red-500 bg-red-500 ring-4 ring-red-100 animate-ping-slow" :
                      "border-zinc-400 bg-zinc-200 group-hover:border-emerald-500"
                    }`} />

                    {/* INTERNALS OF THE STEP CARD */}
                    <div className="bg-zinc-50 hover:bg-zinc-100/60 p-4 rounded-xl border border-zinc-200 transition duration-200 text-xs text-zinc-700 space-y-3">
                      
                      {/* HEADER ELEMENT OF MILESTONE */}
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-zinc-200/50 pb-2.5">
                        
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-emerald-800 uppercase tracking-widest text-[9px] font-mono">
                              {isStart ? "TITIK AWAL BERANGKAT" : isDest ? "TUJUAN TEMPUH AKHIR" : "STASIUN SPKLU PLN"}
                            </span>
                            
                            {/* REST AREA BADGE */}
                            {item.isRestArea && (
                              <span className="bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.2 rounded font-mono font-bold text-[8.5px]">
                                🛣️ Rest Area Tol
                              </span>
                            )}
                            
                            {!isStart && !isDest && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                Step #{idx}
                              </span>
                            )}
                          </div>
                          <strong className="text-zinc-800 font-extrabold text-sm block">
                            {item.name}
                          </strong>
                          <p className="text-[11px] text-zinc-550 leading-tight">
                            {item.location}
                          </p>
                        </div>

                        {/* DISTANCE BADGE */}
                        <div className="text-right flex-shrink-0 font-mono">
                          <span className="bg-zinc-200/80 text-zinc-700 px-2 py-1 rounded font-extrabold text-[10px]">
                            {item.distanceFromStart === 0 ? "KM 0.0 (Asal)" : `KM ${item.distanceFromStart}`}
                          </span>
                        </div>

                      </div>

                      {/* BATTERY METRICS METERS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center bg-white border border-zinc-200 p-3 rounded-lg">
                        
                        {/* Arrival Battery estimation */}
                        <div className="space-y-1">
                          <span className="text-zinc-500 text-[10px] block font-medium">
                            Estimasi Baterai Saat Datang (SOC):
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <Battery className={`w-4 h-4 ${
                              item.isCritical ? "text-red-500 animate-pulse" :
                              item.socArrival < 40 ? "text-amber-500" : "text-emerald-650"
                            }`} />
                            
                            <span className={`font-mono font-black text-sm ${
                              item.isCritical ? "text-red-600 animate-bounce" :
                              item.socArrival < 40 ? "text-amber-600" : "text-zinc-800"
                            }`}>
                              {item.socArrival}%
                            </span>

                            {/* Health badge comments */}
                            {item.isCritical ? (
                              <span className="bg-red-50 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100 animate-pulse">
                                KRITIS (Mogok)
                              </span>
                            ) : item.socArrival < 40 ? (
                              <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-100">
                                Tipis (Disarankan Cas)
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-850 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-100">
                                Aman
                              </span>
                            )}
                          </div>
                          
                          {/* Colored dynamic progress line */}
                          <div className="w-full bg-zinc-100 rounded-full h-1 mt-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.isCritical ? "bg-red-500" :
                                item.socArrival < 40 ? "bg-amber-500" : "bg-emerald-500"
                              }`} 
                              style={{ width: `${Math.min(100, Math.max(0, item.socArrival))}%` }}
                            />
                          </div>
                        </div>

                        {/* Departure Battery estimation */}
                        <div className="space-y-1 sm:border-l sm:pl-4 sm:border-zinc-200">
                          <span className="text-zinc-500 text-[10px] block font-medium">
                            Status Saat Melanjutkan Perjalanan:
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-600" />
                            <span className="font-mono font-black text-sm text-emerald-700">
                              {item.socDeparture}%
                            </span>
                            
                            {item.isCharging && (
                              <span className="bg-emerald-150 text-emerald-800 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-250 font-mono">
                                +{item.chargedAmount}% Diisi
                              </span>
                            )}
                          </div>
                          
                          <span className="text-[10px] text-zinc-400 font-medium block italic">
                            {isStart ? "Mulai berkendara dari Garasi" :
                             isDest ? "Selesai: Parkir aman di tujuan!" :
                             item.isCharging ? `Mengisi daya fast DC 28 mnt` :
                             "Melewati pengisian (Sisa daya cukup)"}
                          </span>
                        </div>

                      </div>

                      {/* SPECIAL ALERTS COMPONENT */}
                      {item.isCritical && (
                        <div className="bg-red-50 text-red-900 border border-red-200 p-3 rounded-lg flex items-start gap-2 text-[11px] leading-relaxed">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong className="font-black block text-red-800">Daya Baterai Tidak Cukup untuk Menjangkau Titik Ini!</strong>
                            Perhitungan fisik membuktikan bahwa Anda tidak dapat melanjutkan perjalanan ke sini tanpa mogok. Silakan klik tombol <strong className="text-emerald-700">"🔌 Simulasikan Isi Daya"</strong> di salah satu SPKLU sebelumnya di jalur untuk mengisi ulang baterai.
                          </div>
                        </div>
                      )}

                      {/* ACTION CONTROLS SECTION */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-zinc-200/50">
                        {/* Notes and description lines */}
                        <div className="text-[11px] text-zinc-500 max-w-md italic leading-tight pl-1">
                          {isStart ? "Gunakan kontrol setir kemudi untuk merencanakan rute kustom Anda." :
                           isDest ? "Selamat melanjutkan perjalanan Anda yang menyenangkan bersama JAECOO EV!" :
                           `"${item.note}" — Daya: ${item.capacity}`}
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          
                          {/* Map jump button */}
                          {!isStart && !isDest && (
                            <button
                              onClick={() => handleFlyTo(item.lat, item.lon)}
                              className="flex-1 sm:flex-initial justify-center text-zinc-600 hover:text-emerald-700 bg-white hover:bg-zinc-100 border border-zinc-300 font-bold py-1.5 px-3 rounded-lg transition active:scale-95 text-xs flex items-center gap-1 cursor-pointer"
                            >
                              🧭 Fokus Peta
                            </button>
                          )}

                          {/* Simulation Cas Checkbox Button styled */}
                          {!isStart && !isDest && (
                            <button
                              onClick={() => {
                                if (item.isCharging) {
                                  setSimulatedChargeStops(prev => prev.filter(id => id !== item.id));
                                } else {
                                  setSimulatedChargeStops(prev => [...prev, item.id]);
                                }
                              }}
                              className={`flex-1 sm:flex-initial justify-center font-black py-1.5 px-3.5 rounded-lg border transition duration-200 active:scale-95 text-xs flex items-center gap-1.5 cursor-pointer ${
                                item.isCharging 
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md" 
                                  : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300 hover:border-emerald-500"
                              }`}
                            >
                              {item.isCharging ? "✅ Aktif" : "🔌 Simulasikan Isi Daya"}
                            </button>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* ARRIVAL VERDICT CALLOUT PANEL */}
            <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50 overflow-hidden relative">
              <div className="relative space-y-2.5">
                <span className="text-[9px] font-mono tracking-widest font-extrabold text-zinc-400 block uppercase">KESIMPULAN FINAL ASISTEN BATERAI</span>
                
                {activeTimeline[activeTimeline.length - 1].socArrival >= socSafetyLimit ? (
                  <div className="flex gap-3 items-start">
                    <span className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 text-lg flex-shrink-0 mt-0.5">
                      🏆
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-emerald-800 leading-snug">Rencana Perjalanan Aman & Tuntas!</h4>
                      <p className="text-xs text-zinc-650 leading-relaxed">
                        Dengan konfigurasi simulasi pengisian daya saat ini, JAECOO J5 Anda diperkirakan tiba dengan selamat di tujuan dengan sisa baterai sehat sebesar <strong className="text-emerald-700 font-mono font-black text-sm">{activeTimeline[activeTimeline.length - 1].socArrival}%</strong> (Masih berada di atas ambang batas kritis Anda: {socSafetyLimit}%). Siap gas pergi berpetualang!
                      </p>
                    </div>
                  </div>
                ) : activeTimeline[activeTimeline.length - 1].socArrival > 0 ? (
                  <div className="flex gap-3 items-start">
                    <span className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 text-lg flex-shrink-0 mt-0.5">
                      ⚠️
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-amber-800 leading-snug">Baterai Tiba di Bawah Batas Aman Minimal</h4>
                      <p className="text-xs text-zinc-650 leading-relaxed">
                        Anda dapat mencapai tujuan tetapi sisa baterai Anda saat tiba sangat menipis yaitu <strong className="text-amber-700 font-mono font-black">{activeTimeline[activeTimeline.length - 1].socArrival}%</strong>, yang berada di bawah target limit {socSafetyLimit}%. Sangat dianjurkan untuk menyalakan pengisian daya di salah satu SPKLU tambahan dalam daftar rute di atas.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    <span className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-700 text-lg flex-shrink-0 mt-0.5 animate-pulse">
                      🚨
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-red-800 leading-snug">Rencana Perjalanan Mogok / Kritis!</h4>
                      <p className="text-xs text-zinc-650 leading-relaxed">
                        Baterai Anda dipastikan habis sebelum sampai di tempat tujuan (perkiraan sisa adalah <strong className="text-red-650 font-mono font-black">0%</strong>). Silakan pilih <strong className="text-emerald-700">"🔌 Simulasikan Isi Daya"</strong> pada beberapa pilihan SPKLU di atas untuk mengisi ulang baterai J5 dan melanjutkan kembali perjalanan Anda.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        ) : (
          
          /* DIRECTORY LIST VIEW */
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h4 className="font-bold text-zinc-800 text-sm">Semua Stasiun PLN SPKLU Regional Dekat Rute (Maks. 15 Km)</h4>
                <p className="text-[11px] text-zinc-400">Total {finalSpklusToUse.length} stasiun pengisian daya ditemukan dalam jarak deteksi rute jalan.</p>
              </div>
            </div>

            {finalSpklusToUse.length === 0 ? (
              <div className="p-12 text-center bg-zinc-50 rounded-xl border border-zinc-150 space-y-2">
                <Coffee className="w-8 h-8 text-zinc-400 mx-auto" />
                <h4 className="font-bold text-zinc-700 text-sm">Tidak Ada SPKLU Terdeteksi</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Tidak ada stasiun SPKLU berjarak di bawah 15 km dari rute jalan ini yang sesuai dengan filter filter saat ini. Coba perkecil saringan Rest Area Tol atau gunakan rute jalur lain.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finalSpklusToUse.map((spklu, index) => (
                  <div 
                    key={spklu.id} 
                    className="bg-zinc-50 hover:bg-zinc-100/80 p-4 rounded-xl border border-zinc-150 flex gap-3.5 transition duration-300 group"
                  >
                    {/* Number Index Shield */}
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-800 font-black text-sm">
                      {index + 1}
                    </div>

                    <div className="space-y-1.5 flex-1 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-extrabold text-zinc-800 block text-[13px] leading-tight group-hover:text-emerald-700 transition">
                          {spklu.name}
                        </span>
                        
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] font-mono font-bold bg-white border border-zinc-200 text-zinc-650 px-1.5 py-0.5 rounded">
                            ±{spklu.distanceToRoute.toFixed(1)} km rute
                          </span>
                          
                          {/* Rest area tag */}
                          {spklu.isRestArea && (
                            <span className="bg-sky-50 text-sky-700 text-[8.5px] px-1 py-0.2 rounded font-mono font-bold">
                              Rest Area Tol
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-zinc-500 leading-normal pl-0.5 text-[11px]">
                        {spklu.location}
                      </p>

                      <p className="text-zinc-650 pl-0.5 text-[11px] leading-relaxed italic">
                        "{spklu.note}"
                      </p>

                      <div className="pt-2 border-t border-zinc-200 flex flex-wrap gap-2 items-center text-[10px] font-mono font-bold">
                        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded">
                          ⚡ {spklu.type}
                        </span>
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded">
                          Power: {spklu.capacity}
                        </span>
                        
                        <button
                          onClick={() => handleFlyTo(spklu.lat, spklu.lon)}
                          className="ml-auto font-bold text-emerald-600 hover:text-emerald-700 font-mono transition text-[10px] cursor-pointer"
                        >
                          Lihat Peta →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        )}

      </div>
    </div>
  );
}
