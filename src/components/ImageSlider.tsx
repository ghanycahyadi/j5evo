import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Info, BatteryCharging, Zap, Shield } from "lucide-react";

interface SlideItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string;
  spec: { label: string; value: string }[];
}

const J5_SLIDES: SlideItem[] = [
  {
    id: 1,
    title: "Signature Aqua Teal EV",
    subtitle: "Pilihan Warna Utama yang Futuristik & Ramah Lingkungan",
    description: "Tampilkan jiwa petualang perkotaan Anda dengan balutan warna Teal premium yang memancarkan energi bersih tanpa emisi.",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
    badge: "Eco Teal",
    spec: [
      { label: "Baterai", value: "61.2 kWh" },
      { label: "Jarak Tempuh", value: "450 KM" },
      { label: "0-100 km/h", value: "7.8 Detik" }
    ]
  },
  {
    id: 2,
    title: "Snow White Luxe Edition",
    subtitle: "Kemewahan Klasik dengan Sentuhan Dual-Tone Sporty",
    description: "Kombinasi warna putih mutiara berkilau dengan atap hitam panoramik menghadirkan siluet premium SUV yang tak lekang oleh waktu.",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    badge: "Ivory White",
    spec: [
      { label: "DC Fast Charge", value: "30% ke 80% (28m)" },
      { label: "Regen Braking", value: "3-Level Cerdas" },
      { label: "Fisik Atap", value: "Panoramic Sunroof" }
    ]
  },
  {
    id: 3,
    title: "Metallic Slate Grey Active",
    subtitle: "Kekokohan Karakter All-Terrain yang Gagah",
    description: "Sempurna untuk penjelajah jalanan berbatu maupun perkotaan. Menawarkan ketangguhan eksterior dengan proteksi lapisan cat anti-baret.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    badge: "Slate Grey",
    spec: [
      { label: "Ground Clearance", value: "190 mm" },
      { label: "Torsi Instan", value: "340 Nm" },
      { label: "Mode Berkendara", value: "6 Mode Berbeda" }
    ]
  },
  {
    id: 4,
    title: "Touring Java Giat Bersama",
    subtitle: "Kebersamaan Komunitas J5 EVO Indonesia",
    description: "Bukan sekadar kendaraan cerdas, ini adalah keluarga petualang ramah lingkungan yang mengukir cerita di sepanjang jalanan Nusantara.",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    badge: "Evo Gathering",
    spec: [
      { label: "Touring Terjadwal", value: "Bulanan" },
      { label: "Regional Cabang", value: "Seluruh Indonesia" },
      { label: "Bakti Sosial", value: "Giat Kemanusiaan" }
    ]
  }
];

export default function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % J5_SLIDES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoplay]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % J5_SLIDES.length);
    setAutoplay(false); // Disable autoplay temporarily once user interacts
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + J5_SLIDES.length) % J5_SLIDES.length);
    setAutoplay(false);
  };

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-white border border-zinc-200"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
      id="jaecoo-j5-slider"
    >
      {/* Slides Container */}
      <div className="relative h-[480px] md:h-[520px] w-full overflow-hidden">
        {J5_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Slide Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Soft Dark Vignette for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent"></div>

            {/* Float Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-3 py-1 bg-teal-600/90 text-white font-mono text-xs font-bold rounded-full shadow-lg backdrop-blur border border-teal-400/30 uppercase tracking-wider">
                {slide.badge}
              </span>
              <span className="px-3 py-1 bg-white/90 text-zinc-900 font-bold text-xs rounded-full shadow-lg backdrop-blur flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                JAECOO J5 EV
              </span>
            </div>

            {/* Slide Text Content Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-20 text-white flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                <span className="text-teal-400 font-mono text-xs tracking-wider uppercase font-bold block">
                  {slide.subtitle}
                </span>
                <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {slide.title}
                </h3>
                <p className="text-slate-250 text-sm md:text-base leading-relaxed max-w-xl">
                  {slide.description}
                </p>
                
                {/* Visual Specifications Bar */}
                <div className="flex flex-wrap gap-4 pt-3">
                  {slide.spec.map((sp, sIdx) => (
                    <div key={sIdx} className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg flex flex-col backdrop-blur-xs">
                      <span className="text-[10px] text-teal-300 font-mono font-medium uppercase">{sp.label}</span>
                      <span className="text-xs font-bold tracking-wide">{sp.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interaction Call-to-Action Info */}
              <div className="hidden sm:flex items-center gap-2 bg-teal-950/70 border border-teal-500/40 p-3 rounded-xl max-w-xs backdrop-blur-sm self-start md:self-auto">
                <Info className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                <p className="text-[11px] text-teal-150 leading-tight">
                  Geser slider ini untuk melihat varian andalan J5 EVO teranyar.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white hover:text-teal-200 transition focus:outline-none backdrop-blur-sm border border-white/10"
        aria-label="Slide Sebelumnya"
        id="btn-prev-slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Navigation Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white hover:text-teal-200 transition focus:outline-none backdrop-blur-sm border border-white/10"
        aria-label="Slide Selanjutnya"
        id="btn-next-slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bullets Indicators at the Bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xs">
        {J5_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setAutoplay(false);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
              index === currentSlide ? "bg-teal-400 w-6" : "bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Buka slide ${index + 1}`}
            id={`indicator-slide-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
