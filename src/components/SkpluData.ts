export interface SpkluDbItem {
  id: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  type: string;
  capacity: string;
  note: string;
  isRestArea?: boolean;
}

// Compact tuple format to minimize bundle and token sizes:
// [id_suffix, name, location, lat, lon, capacity_kw, note, is_rest_area_toll]
const RAW_SPKLU_TUPLES: [string, string, string, number, number, number, string, boolean][] = [
  // ==========================================
  // SUMATERA CORRIDOR (Pekanbaru -> Lampung -> Bakauheni)
  // ==========================================
  ["pekanbaru_up3", "SPKLU PLN UP3 Pekanbaru", "Jl. Setia Maharaja, Pekanbaru", 0.4965, 101.4552, 50, "Andalan utama kota Pekanbaru", false],
  ["pekanbaru_uid", "SPKLU PLN UID Riau", "Jl. Jend Sudirman, Pekanbaru", 0.5124, 101.4612, 50, "Kantor Wilayah PLN", false],
  ["pekanbaru_gov", "SPKLU Kantor Gubernur Riau", "Jl. Jend Sudirman, Pekanbaru", 0.5154, 101.4425, 200, "Ultra Fast Charger Pemprov", false],
  ["ra_pekanbaru_36a", "SPKLU Rest Area KM 36A Pekanbaru", "Tol Pekanbaru-Dumai KM 36A", 0.7254, 101.4852, 50, "Penting arah Dumai", true],
  ["ra_pekanbaru_36b", "SPKLU Rest Area KM 36B Pekanbaru", "Tol Pekanbaru-Dumai KM 36B", 0.7250, 101.4812, 50, "Arah balik Pekanbaru", true],
  ["ra_pekanbaru_45a", "SPKLU Rest Area KM 45A Pekanbaru", "Tol Pekanbaru-Dumai KM 45A", 0.7654, 101.5215, 50, "Rest Area Penyeimbang", true],
  ["ra_pekanbaru_65b", "SPKLU Rest Area KM 65B Pekanbaru", "Tol Pekanbaru-Dumai KM 65B", 0.9125, 101.6212, 50, "Top-up sebelum Dumai", true],
  ["duri_pln", "SPKLU PLN ULP Duri", "Jl. Jend Sudirman Duri, Riau", 1.2512, 101.2152, 30, "Layanan lintas utara", false],
  ["dumai_up3", "SPKLU PLN UP3 Dumai", "Jl. Jend Sudirman, Dumai, Riau", 1.6675, 101.4423, 50, "Layanan isi daya andalan Dumai", false],
  ["bagan_batu", "SPKLU PLN ULP Bagan Batu", "Bagan Batu, Riau", 1.7015, 100.4125, 30, "Perbatasan Riau-Sumut", false],
  
  ["rengat_up3", "SPKLU PLN UP3 Rengat", "Jl. Lintas Timur, Rengat", -0.3654, 102.5124, 200, "Daya ultra cepat lintas tengah", false],
  ["air_molek", "SPKLU PLN ULP Air Molek", "Raya Air Molek, Indragiri", -0.4512, 102.2812, 30, "Konektor Jambi-Riau", false],
  ["indragiri_belilas", "SPKLU Yantek Belilas", "Belilas, Indragiri Hulu", -0.8524, 102.4312, 30, "Posko Lintas Timur", false],
  ["taluk_kuantan", "SPKLU PLN ULP Taluk Kuantan", "Taluk Kuantan, Riau", -0.5212, 101.5312, 50, "Arteri tengah Riau", false],
  ["bangkinang_up3", "SPKLU PLN UP3 Bangkinang", "Bangkinang, Kampar", 0.3345, 101.0215, 50, "Arah Sumatera Barat", false],
  ["bangkinang_ulp", "SPKLU PLN ULP Bangkinang", "Jl. Ahmad Yani, Bangkinang", 0.3412, 101.0315, 30, "Daya sedang andalan", false],
  ["siak_ulp", "SPKLU PLN ULP Siak", "Siak Sri Indrapura", 0.7915, 102.0512, 30, "Kawasan Wisata Istana Siak", false],

  ["jambi_up3", "SPKLU PLN UP3 Jambi", "Jl. Sri Soedewi, Kota Jambi", -1.6115, 103.5854, 60, "Pertengahan utama Sumatra", false],
  ["muara_bungo", "SPKLU PLN UP3 Muara Bungo", "Muara Bungo, Jambi", -1.4812, 102.1215, 30, "Persimpangan Sumbar-Jambi", false],
  ["lubuk_linggau", "SPKLU PLN ULP Lubuk Linggau", "Lubuk Linggau, Sumsel", -3.2915, 102.8612, 60, "Arteri barat luar Sumsel", false],
  ["bengkulu_ulp", "SPKLU PLN ULP Bengkulu", "Kota Bengkulu", -3.8004, 102.2655, 60, "Andalan pesisir barat", false],

  ["palembang_rivai", "SPKLU PLN UIW Rivai", "Jl. Kapten Rivai, Palembang", -2.9854, 104.7512, 25, "Pusat kota Palembang", false],
  ["palembang_demang", "SPKLU PLN S2JB Demang", "Demang Lebar Daun, Palembang", -2.9712, 104.7215, 60, "Utara Palembang strategis", false],
  ["palembang_smb2", "SPKLU Bandara SMB II", "Bandara SMB II Palembang", -2.8981, 104.7012, 50, "Gerbang udara Palembang", false],
  ["palembang_opi", "SPKLU Opi Mall Palembang", "Jakabaring, Palembang", -3.0215, 104.7915, 30, "Kawasan Jakabaring", false],
  ["muara_enim", "SPKLU PLN ULP Muara Enim", "Muara Enim", -3.6512, 103.7812, 100, "Kawasan tambang Sumsel", false],
  
  ["ra_palembang_360b", "SPKLU Rest Area KM 360B Tol Palembang", "Tol Kayu Agung-Palembang KM 360B", -3.2512, 104.8512, 60, "Pengisian arus balik", true],
  ["ra_prabumulih_56ab", "SPKLU Rest Area KM 56A/B Prabumulih", "Tol Indralaya-Prabumulih KM 56", -3.4024, 104.2815, 50, "Pintu gerbang Prabumulih", true],

  ["ra_lampung_311a", "SPKLU Rest Area KM 311A Tol Terpeka", "Tol Kayu Agung - Terbanggi KM 311A", -4.0125, 105.1524, 200, "Daya ultra cepat tol utama Terpeka", true],
  ["ra_lampung_306b", "SPKLU Rest Area KM 306B Tol Terpeka", "Tol Kayu Agung - Terbanggi KM 306B", -4.0315, 105.1512, 200, "Arut balik Lampung", true],
  ["ra_lampung_277a", "SPKLU Rest Area KM 277A Tol Terpeka", "Tol Kayu Agung - Terbanggi KM 277A", -4.1512, 105.1554, 60, "Penyaring tengah koridor utama", true],
  ["ra_lampung_269b", "SPKLU Rest Area KM 269B Tol Terpeka", "Tol Kayu Agung - Terbanggi KM 269B", -4.1812, 105.1612, 60, "Rest area tol Terpeka", true],
  ["ra_lampung_234a", "SPKLU Rest Area KM 234A Tol Terpeka", "Tol Kayu Agung - Terbanggi KM 234A", -4.3124, 105.1852, 50, "Daya andalan Terpeka", true],
  ["ra_lampung_172b", "SPKLU Rest Area KM 172B Tol Terpeka", "Tol Terbanggi - Kayu Agung KM 172B", -4.6854, 105.2412, 50, "Arus balik Terpeka", true],
  ["ra_lampung_163a", "SPKLU Rest Area KM 163A Tol Bakter", "Tol Terbanggi Besar - Bakauheni KM 163A", -4.7521, 105.2215, 60, "Pintu masuk Bakter", true],
  ["lampung_uid", "SPKLU PLN UID Lampung", "Jl. ZA Pagar Alam, Bandar Lampung", -5.3854, 105.2512, 100, "Pusat UID Lampung", false],
  ["lampung_els", "SPKLU Els Coffee Bandar Lampung", "By Pass Soekarno Hatta, Lampung", -5.3957, 105.2638, 200, "Isi daya cepat sambil santai", false],
  ["lampung_mbk", "SPKLU Mall Bumi Kedaton", "Kedaton, Bandar Lampung", -5.3815, 105.2590, 25, "Kawasan Mall MBK", false],
  ["ra_lampung_116ab", "SPKLU Rest Area KM 116A/B Tol Bakter", "Tol Terbanggi - Bakauheni KM 116", -5.0125, 105.2854, 50, "Dua arah KM 116", true],
  ["ra_lampung_87a", "SPKLU Rest Area KM 87A Tol Bakter", "Tol Terbanggi - Bakauheni KM 87A", -5.2012, 105.3512, 50, "Andalan Tol Bakter", true],
  ["ra_lampung_49ab", "SPKLU Rest Area KM 49A/B Tol Bakter", "Tol Terbanggi - Bakauheni KM 49", -5.4512, 105.5125, 200, "Daya ultra cepat tol Bakter", true],
  ["ra_lampung_20ab", "SPKLU Rest Area KM 20A/B Tol Bakter", "Tol Terbanggi - Bakauheni KM 20", -5.6812, 105.6512, 50, "Rest area pertama dari Merak", true],
  ["bakauheni_port", "SPKLU Pelabuhan Bakauheni", "Menara Siger Kawasan ASDP", -5.8712, 105.7512, 120, "Dermaga transit Bakauheni", false],

  // Ujung Utara Sumatera (Medan, Aceh)
  ["aceh_up3", "SPKLU PLN UP3 Banda Aceh", "Jl. T. Umar, Banda Aceh", 5.54829, 95.32375, 50, "Ujung barat penutup jalur", false],
  ["lhokseumawe_up3", "SPKLU PLN UP3 Lhokseumawe", "Lhokseumawe, Aceh", 5.1812, 97.1425, 100, "Utara lintas timur", false],
  ["langsa_up3", "SPKLU PLN UP3 Langsa", "Langsa, Aceh", 4.4712, 97.9612, 100, "Perbatasan Aceh-Sumut", false],
  ["medan_uid", "SPKLU PLN UID Sumatera Utara", "Jl. Yos Sudarso, Medan", 3.5952, 98.6722, 200, "Pusat utama kota Medan", false],
  ["medan_cityview", "SPKLU Medan City View", "Medan, Sumut", 3.5412, 98.6821, 50, "Pemukiman elite", false],
  ["kuala_namu", "SPKLU Bandara Kuala Namu Wing Hub", "Kuala Namu, Deli Serdang", 3.6321, 98.8812, 60, "Gerbang bandara Kuala Namu", false],
  ["tebing_tinggi", "SPKLU PLN ULP Tebing Tinggi", "Sudirman Tebing Tinggi", 3.3283, 99.1625, 25, "Konektor Tobas Simalungun", false],
  ["parapat_toba", "SPKLU PLN ULP Parapat Toba", "Parapat, Simalungun", 2.6845, 98.9296, 50, "Wisata Danau Toba", false],
  ["rantau_prapat", "SPKLU PLN ULP Rantau Prapat", "Rantau Prapat", 2.0975, 99.8272, 60, "Konektor batas Sumut-Riau", false],

  // ==========================================
  // JAWA CORRIDOR (Merak -> Jakarta -> Bandung -> Solo -> Surabaya)
  // ==========================================
  ["merak_exec", "SPKLU Pelabuhan Merak Executive", "Dermaga Eksekutif Sosoro", -5.9324, 105.9924, 100, "Gerbang masuk pulau Jawa", false],
  ["banten_kp3b", "SPKLU PLN Banten KP3B", "Curug, Serang, Banten", -6.1622, 106.1554, 60, "Provinsi Banten", false],
  ["banten_uid", "SPKLU PLN Banten UID", "Serang, Banten", -6.1201, 106.1502, 50, "Pusat UID Banten", false],
  ["ra_merak_13a", "SPKLU Rest Area KM 13A Jakarta-Merak", "Tol Tangerang-Merak KM 13A", -6.2084, 106.6612, 60, "Layanan fast charge", true],
  ["ra_merak_14b", "SPKLU Rest Area KM 14B Jakarta-Merak", "Tol Tangerang-Merak KM 14B", -6.2075, 106.6512, 60, "Arah Jakarta balik", true],
  ["ra_merak_43a", "SPKLU Rest Area KM 43A Jakarta-Merak", "Tol Tangerang-Merak KM 43A", -6.1954, 106.4124, 200, "Daya ultra cepat tol Merak", true],
  ["ra_merak_45b", "SPKLU Rest Area KM 45B Jakarta-Merak", "Tol Tangerang-Merak KM 45B", -6.1924, 106.3924, 60, "Top-up cepat", true],
  ["ra_merak_68a", "SPKLU Rest Area KM 68A Jakarta-Merak", "Tol Tangerang-Merak KM 68A", -6.1524, 106.1824, 200, "Arah pelabuhan Merak", true],
  ["ra_merak_68b", "SPKLU Rest Area KM 68B Jakarta-Merak", "Tol Tangerang-Merak KM 68B", -6.1534, 106.1812, 30, "Arah balik Jakarta", true],
  ["tangerang_samanea", "SPKLU Mall Samanea Tangerang", "Cikupa, Tangerang", -6.1754, 106.4954, 50, "Loker Mall Samanea", false],
  ["tangerang_ciputra", "SPKLU Mall Ciputra Tangerang", "Citra Raya Tangerang", -6.1612, 106.5124, 60, "Mall Ciputra", false],
  ["pik2_centre", "SPKLU PIK2 Centre Point", "Pantai Indah Kapuk 2", -6.0854, 106.6912, 200, "Lokasi hits PIK", false],
  ["bintaro_transpark", "SPKLU Bintaro Transpark", "Bintaro Sektor 7", -6.2812, 106.7112, 50, "Pusat belanja Bintaro", false],
  ["ra_serpong_7a", "SPKLU Rest Area KM 7A Serpong", "Tol Ulujami-Serpong KM 7A", -6.2954, 106.6982, 47, "Arah BSD Serpong", true],
  ["kebon_jeruk_up3", "SPKLU PLN UP3 Kebon Jeruk", "Jakarta Barat", -6.1894, 106.7725, 60, "Andalan Jakarta Barat", false],
  
  // DKI Jakarta
  ["dki_istana", "SPKLU Istana Negara Jakarta", "Gambir, Jakarta Pusat", -6.1702, 106.8242, 180, "Samping Istana Merdeka", false],
  ["dki_trunojoyo", "SPKLU PLN Trunojoyo", "Kebayoran Baru, Jakarta Selatan", -6.2395, 106.8024, 200, "Mabes PLN Pusat", false],
  ["dki_bulungan", "SPKLU PLN UP3 Bulungan", "Bulungan, Jaksel", -6.2425, 106.7975, 200, "Layanan ultra cepat Jaksel", false],
  ["dki_cempaka", "SPKLU PLN UP3 Cempaka Putih", "Jakarta Pusat", -6.1742, 106.8724, 60, "Konektifitas bypass", false],
  ["dki_lenteng", "SPKLU PLN UP3 Lenteng Agung", "Jakarta Selatan", -6.3212, 106.8375, 47, "Dekat perbatasan Depok", false],
  ["dki_bandengan", "SPKLU PLN UP3 Bandengan", "Jakarta Utara", -6.1345, 106.7942, 60, "Layanan pesisir Jakarta", false],
  ["dki_nindya", "SPKLU Nindya Karya Gatsu", "MT Haryono, Cawang", -6.2475, 106.8654, 120, "Titik strategis Cawang", false],
  ["dki_senayan_park", "SPKLU Senayan Park (Voltron)", "Senayan, Jakarta Pusat", -6.2132, 106.8012, 100, "Voltron Premium Station", false],
  ["dki_senayan_artotel", "SPKLU Senayan Artotel (Voltron)", "Senayan, Jakarta Pusat", -6.2212, 106.8054, 100, "Hotel Artotel Senayan", false],
  ["dki_dipo_gatsu", "SPKLU Dipo Tower Gatsu (Voltron)", "Gatot Subroto, Jakarta", -6.2085, 106.7995, 100, "Lobby Dipo Tower", false],
  ["dki_mcd_kemang", "SPKLU McD Kemang (Voltron)", "Kemang, Jakarta Selatan", -6.2754, 106.8154, 60, "Drive-Thru McD Kemang", false],
  ["dki_lippo_kuningan", "SPKLU Lippo Office Kuningan (Voltron)", "Rasuna Said, Kuningan", -6.2224, 106.8285, 100, "Kawasan Segitiga Emas", false],
  ["dki_kuningan_city", "SPKLU Kuningan City Mall (Voltron)", "Kuningan, Jaksel", -6.2245, 106.8305, 100, "Basement Kuningan City", false],
  ["dki_noble_house", "SPKLU Kuningan Noble House (Voltron)", "Kuningan, Megakuningan", -6.2265, 106.8272, 100, "Voltron Station", false],
  ["dki_plaza_mandiri", "SPKLU Plaza Mandiri Gatsu (Voltron)", "Gatot Subroto, Jakarta", -6.2282, 106.8124, 100, "Pusat perkantoran Mandiri", false],
  ["dki_bumn", "SPKLU Kementrian BUMN", "Medan Merdeka, Jakarta", -6.1795, 106.8265, 50, "Kementrian BUMN", false],
  ["dki_bi", "SPKLU Bank Indonesia", "Thamrin, Jakarta Pusat", -6.1812, 106.8212, 50, "Kantor Pusat BI", false],
  ["dki_uid_gambir", "SPKLU PLN UID Gambir", "Gambir, Jakarta Pusat", -6.1754, 106.8272, 200, "Induk UID Gambir", false],
  ["dki_danareksa", "SPKLU Menara Danareksa", "Medan Merdeka Barat", -6.1772, 106.8252, 200, "BUMN Hub", false],
  
  // Outer Ring/Borders
  ["halim_airport", "SPKLU Bandara Halim Perdanakusuma", "Bandara Halim Jakarta", -6.2624, 106.8912, 200, "Gerbang VIP Halim", false],
  ["cibubur_tsm", "SPKLU Mall Trans Studio Cibubur", "Transyogi Cibubur", -6.3724, 106.9012, 50, "Belanja TSM", false],
  ["cibubur_byd", "SPKLU BYD Transyogi (Voltron)", "Transyogi, Depok", -6.3812, 106.9112, 60, "Dealer BYD", false],
  ["cibubur_living_world", "SPKLU Living World (Astra)", "Kota Wisata Cibubur", -6.3912, 106.9212, 30, "Astra Charge Station", false],
  ["ciracas_lrt", "SPKLU LRT City Ciracas", "Ciracas, Jaktim", -6.3224, 106.8812, 100, "Pemberhentian LRT", false],
  ["depok_pesona", "SPKLU Pesona Square Mall (Voltron)", "Jl. Juanda, Depok", -6.3754, 106.8312, 100, "Lobby Pesona Square", false],
  ["depok_bspace", "SPKLU BSpace Depok", "Margonda, Depok", -6.3954, 106.8112, 200, "Pusat gaya hidup Depok", false],
  ["bekasi_up3", "SPKLU PLN UP3 Bekasi", "Bulan Bulan Bekasi", -6.2412, 106.9912, 50, "Kantor UP3 Bekasi", false],
  ["bekasi_smb", "SPKLU Summarecon Mall Bekasi (Voltron)", "Bekasi Utara", -6.2212, 107.0012, 100, "Pasar modern Bekasi", false],
  ["bekasi_grand_wisata", "SPKLU McD Grand Wisata (Voltron)", "Tambun, Bekasi", -6.2712, 107.0425, 60, "Drive-Thru Grand Wisata", false],

  // Toll Jagorawi & Bogor Area
  ["ra_jagorawi_10a", "SPKLU Rest Area KM 10A Jagorawi", "Tol Jagorawi KM 10A", -6.3512, 106.8812, 60, "Gas ke Bogor", true],
  ["ra_jagorawi_21b", "SPKLU Rest Area KM 21B (Shell)", "Tol Jagorawi KM 21B", -6.4254, 106.8712, 60, "Shell Recharge", true],
  ["ra_jagorawi_38b", "SPKLU Rest Area KM 38B Jagorawi", "Tol Jagorawi KM 38B", -6.5812, 106.8512, 120, "Batas kota Bogor", true],
  ["ra_jagorawi_45a", "SPKLU Rest Area KM 45A (HVT)", "Tol Jagorawi KM 45A", -6.6454, 106.8412, 60, "HVT Charge Tol", true],
  ["bogor_botani", "SPKLU Botani Square (Voltron)", "Botani Square, Bogor", -6.6012, 106.8085, 100, "Samping kebun raya", false],
  ["bogor_pln_up3", "SPKLU PLN UP3 Bogor", "Pajajaran, Bogor", -6.5982, 106.7995, 200, "Layanan fast charge Sukasari", false],
  ["ciawi_pln", "SPKLU PLN ULP Cipayung", "Ciawi-Puncak, Bogor", -6.6612, 106.8712, 120, "Tanjakan dasar Puncak", false],
  ["cianjur_up3", "SPKLU PLN UP3 Cianjur", "Jl. Dr. Muwardi, Cianjur", -6.8224, 107.1395, 50, "Dasar tanjakan Puncak utara", false],

  // Japek & Cipularang
  ["ra_japek_6b", "SPKLU Rest Area KM 6B Japek", "Tol Jakarta-Cikampek KM 6B", -6.2485, 106.9212, 200, "Gerbang tol dalam kota", true],
  ["ra_japek_19a", "SPKLU Rest Area KM 19A Japek", "Tol Jakarta-Cikampek KM 19A", -6.2615, 107.0212, 40, "Tol Japek awal", true],
  ["ra_japek_19b", "SPKLU Rest Area KM 19B Japek", "Tol Jakarta-Cikampek KM 19B", -6.2625, 107.0125, 50, "Arus balik Japek", true],
  ["ra_japek_39a", "SPKLU Rest Area KM 39A Japek", "Tol Jakarta-Cikampek KM 39A", -6.3125, 107.1812, 50, "Cikarang Timur", true],
  ["ra_japek_42b", "SPKLU Rest Area KM 42B Japek", "Tol Jakarta-Cikampek KM 42B", -6.3212, 107.1612, 60, "Cikarang Barat balik", true],
  ["ra_japek_57a", "SPKLU Rest Area KM 57A Cikampek", "Tol Japek KM 57A", -6.3685, 107.2915, 200, "Rest area favorit utama Jawa", true],
  ["ra_japek_62b", "SPKLU Rest Area KM 62B Cikampek", "Tol Cikampek KM 62B", -6.3512, 107.2754, 200, "Key cadangan arus balik utama", true],
  ["ra_cipularang_72a", "SPKLU Rest Area KM 72A Cipularang", "Tol Purwakarta KM 72A", -6.6025, 107.4475, 50, "Pertama arah Bandung", true],
  ["ra_cipularang_72b", "SPKLU Rest Area KM 72B Cipularang", "Tol Purwakarta KM 72B", -6.6012, 107.4412, 47, "Arah Jakarta balik", true],
  ["ra_cipularang_88a", "SPKLU Rest Area KM 88A Cipularang", "Tol Cipularang KM 88A", -6.6575, 107.4525, 200, "Terkenal masjid megah & foodcourt", true],
  ["ra_cipularang_88b", "SPKLU Rest Area KM 88b Cipularang", "Tol Cipularang KM 88B", -6.6558, 107.4510, 50, "Krusial balik Jakarta", true],
  
  // Bandung Area
  ["bandung_up3", "SPKLU PLN UP3 Bandung", "Jl. Soekarno Hatta, Bandung", -6.9385, 107.6254, 200, "Induk utama Bandung Selatan", false],
  ["bandung_surapati", "SPKLU PLN Surapati", "Jl. Surapati, Bandung", -6.9012, 107.6212, 100, "Bandung Tengah", false],
  ["bandung_braga", "SPKLU Icon Hub Braga", "Cikapundung, Braga, Bandung", -6.9185, 107.6085, 200, "Pariwisata Braga heritage", false],
  ["bandung_tsm", "SPKLU Trans Studio Mall Bandung", "Gatot Subroto, Bandung", -6.9254, 107.6362, 60, "Kawasan Mall Wisata TSM", false],
  ["ra_padaleunyi_125b", "SPKLU Rest Area KM 125B", "Tol Cimahi-Padalarang KM 125B", -6.8894, 107.5124, 120, "Pintu balik Jabodetabek", true],
  ["ra_padaleunyi_147a", "SPKLU Rest Area KM 147A", "Tol Cileunyi KM 147A", -6.9535, 107.7282, 50, "Ujung tol Bandung Timur", true],
  ["ra_padaleunyi_149b", "SPKLU Rest Area KM 149B", "Tol Cileunyi KM 149B", -6.9515, 107.7121, 50, "Penyaring arus balik timur", true],
  ["garut_ulp", "SPKLU PLN ULP Garut", "Jl. Cimanuk, Garut", -7.2155, 107.9015, 50, "Wisata pemandian Cipanas Garut", false],
  ["tasik_ulp", "SPKLU PLN ULP Tasikmalaya", "Mayor SL Tobing, Tasik", -7.3235, 108.2198, 25, "Priangan Timur", false],
  ["banjar_ulp", "SPKLU PLN ULP Banjar", "Siliwangi Banjar Jabar", -7.3695, 108.5368, 50, "Gerbang penting perlintasan Jateng", false],
  ["pangandaran_ulp", "SPKLU PLN Pangandaran Parigi", "Parigi, Pangandaran", -7.7011, 108.4905, 25, "Destinasi wisata pantai", false],

  // Cipali Toll Line (Pantura)
  ["ra_cipali_86a", "SPKLU Rest Area KM 86A Cipali", "Tol Cipali KM 86A", -6.3954, 107.6212, 50, "Awal Tol Cipali", true],
  ["ra_cipali_101b", "SPKLU Rest Area KM 101B Cipali", "Tol Cipali KM 101B", -6.4432, 107.7425, 200, "Arus balik primadona", true],
  ["ra_cipali_102a", "SPKLU Rest Area KM 102A Cipali", "Tol Cipali KM 102A", -6.4421, 107.7511, 50, "Top-up andalan Cipali", true],
  ["ra_cipali_130a", "SPKLU Rest Area KM 130A Cipali", "Tol Cipali KM 130A", -6.5212, 108.0125, 200, "Daya ultra tinggi", true],
  ["ra_cipali_130b", "SPKLU Rest Area KM 130B Cipali", "Tol Cipali KM 130B", -6.5224, 107.9912, 60, "Balik barat pantura", true],
  ["ra_cipali_166a", "SPKLU Rest Area KM 166A Cipali", "Tol Cipali KM 166A", -6.6712, 108.2341, 100, "Rindang masjid hijau besar", true],
  ["ra_cipali_164b", "SPKLU Rest Area KM 164B Cipali", "Tol Cipali KM 164B", -6.6725, 108.2235, 60, "Arus balik Majalengka", true],
  ["ra_cipali_207a", "SPKLU Rest Area KM 207A Kanci", "Tol Palikanci KM 207A", -6.7454, 108.6212, 50, "Cirebon andalan", true],
  ["ra_cipali_208b", "SPKLU Rest Area KM 208B Kanci", "Tol Palikanci KM 208B", -6.7465, 108.6112, 50, "Cirebon balik", true],
  ["ra_cipali_228a", "SPKLU Rest Area KM 228A Pejagan", "Tol Pejagan KM 228A", -6.8321, 108.7754, 200, "Daya giga batas Jabar Jateng", true],
  ["ra_cipali_229b", "SPKLU Rest Area KM 229B Pejagan", "Tol Pejagan KM 229B", -6.8345, 108.7612, 200, "Brebes balik", true],
  ["ra_cipali_260b", "SPKLU Rest Area KM 260B Brebes Heritage", "Tol Pejagan-Pemalang KM 260B", -6.9012, 108.9712, 120, "Eks pabrik gula Banjaratma", true],
  ["ra_cipali_379a", "SPKLU Rest Area KM 379A Batang", "Tol Batang-Semarang KM 379A", -6.9691, 109.9542, 200, "Pekalongan Batang corridor", true],
  ["ra_cipali_389b", "SPKLU Rest Area KM 389B Batang", "Tol Batang-Semarang KM 389B", -6.9654, 109.9321, 120, "Batang balik", true],
  
  // Central Java, DIY, Solo
  ["semarang_uid", "SPKLU PLN UID JATENG DIY", "Jl. Pemuda Semarang", -6.9812, 110.4132, 100, "Kantor Induk Jateng", false],
  ["semarang_balaikota", "SPKLU Balaikota Semarang", "Jl. Pemuda, Semarang", -6.9802, 110.4154, 200, "Pemerintahan kota Semarang", false],
  ["ra_semarang_429a", "SPKLU Rest Area KM 429A Solo", "Tol Semarang-Solo KM 429A", -7.1415, 110.4325, 50, "Pegunungan Ungaran sejuk", true],
  ["ra_semarang_456a", "SPKLU Pendopo KM 456A", "Tol Semarang-Solo KM 456A", -7.2612, 110.5425, 120, "Pendopo megah ikonik", true],
  ["ra_semarang_456b", "SPKLU Pendopo KM 456B (Astra)", "Tol Semarang-Solo KM 456B", -7.2625, 110.5412, 120, "Astra charge balik barat", true],
  ["jogja_up3", "SPKLU PLN UP3 Yogyakarta", "Jl. Mangkubumi, Jogja", -7.7834, 110.3662, 50, "Pusat Malioboro Tugu", false],
  ["jogja_royal", "SPKLU Royal Ambarukmo", "Jl. Solo, Yogyakarta", -7.7812, 110.4012, 200, "Hotel Royal Ambarukmo", false],
  ["solo_ulp", "SPKLU PLN ULP Surakarta", "Slamet Riyadi Solo", -7.5684, 110.8215, 100, "Pusat budaya Solo", false],
  ["solo_zayed", "SPKLU Masjid Syeikh Zayed Solo", "Gilingan, Surakarta", -7.5512, 110.8312, 100, "Parkir Masjid Zayed", false],
  ["ra_solo_519ab", "SPKLU Rest Area KM 519A/B Ngawi", "Tol Solo-Ngawi KM 519", -7.4112, 111.1215, 120, "Dua arah Ngawi Sragen", true],
  ["ra_solo_575ab", "SPKLU Rest Area KM 575A/B Ngawi", "Tol Solo-Ngawi KM 575", -7.4252, 111.3524, 100, "Warna gerbang khas Jatim", true],

  // East Java Area
  ["ra_mojokerto_725a", "SPKLU Rest Area KM 725A", "Tol Mojokerto-Surabaya", -7.3421, 112.5115, 120, "Top-up sebelum Surabaya", true],
  ["surabaya_uid", "SPKLU PLN UID Jatim Gubeng", "Embong Trengguli, Surabaya", -7.2694, 112.7482, 120, "Ibu kota Surabaya pusat", false],
  ["surabaya_ngagel", "SPKLU PLN ULP Ngagel", "Ngagel Surabaya", -7.2815, 112.7454, 100, "Sentra industri Ngagel", false],
  ["ra_malang_84a", "SPKLU Rest Area KM 84A Pandaan", "Tol Gempol-Malang KM 84A", -7.6685, 112.6912, 50, "Dasar dingin tanjakan Malang", true],
  ["malang_up3", "SPKLU PLN UP3 Malang", "Klojen, Kota Malang", -7.9782, 112.6285, 50, "Alun-Alun Malang sejuk", false],
  ["batu_klubbunga", "SPKLU Hotel Klub Bunga Batu", "Batu, Malang", -7.8812, 112.5254, 50, "Kota Wisata Batu", false],
  ["banyuwangi_ketapang", "SPKLU ASDP Ketapang Banyuwangi", "Pelabuhan Ketapang", -8.1342, 114.3942, 120, " transit penyeberangan Bali", false],

  // ==========================================
  // BALI CORRIDOR
  // ==========================================
  ["gilimanuk_port", "SPKLU Pelabuhan Gilimanuk", "Area Parkir ASDP Bali", -8.1632, 114.4372, 50, "Dermaga pintu masuk Bali", false],
  ["negara_ulp", "SPKLU PLN ULP Negara", "Negara, Jembrana, Bali", -8.3562, 114.6224, 30, "Kabupaten Jembrana", false],
  ["ra_soka_beach", "SPKLU Rest Area Soka Beach", "Tabanan, Bali", -8.4912, 115.0215, 100, "Pantai Soka eksotis", false],
  ["tabanan_ulp", "SPKLU PLN ULP Tabanan", "Tabanan, Bali", -8.5372, 115.1245, 60, "Lumbung padi Bali", false],
  ["denpasar_uid", "SPKLU PLN UID Bali Sudirman", "Jl. Sudirman Denpasar", -8.6654, 115.2185, 120, "Induk kelistrikan Bali", false],
  ["denpasar_hayamwuruk", "SPKLU PLN Hayam Wuruk", "Hayam Wuruk Denpasar", -8.6542, 115.2415, 30, "Denpasar Timur", false],
  ["badung_itdc", "SPKLU ITDC Nusa Dua VIP", "Kawasan Nusa Dua, Bali", -8.8021, 115.2284, 150, "Monumen infrastruktur G20", false],
  ["badung_kempinski", "SPKLU Apurva Kempinski Bali", "Nusa Dua, Bali", -8.8054, 115.2154, 200, "Premium Ultra Fast Charger", false],
  ["singaraja_up3", "SPKLU PLN UP3 Bali Utara", "Singaraja, Buleleng", -8.1124, 115.0885, 60, "Pantai Lovina Bali Utara", false],
  ["ubud_gianyar", "SPKLU PLN ULP Ubud Gianyar", "Ubud, Gianyar, Bali", -8.5085, 115.2624, 50, "Wisata terasering Ubud", false],

  // ==========================================
  // NUSA TENGGARA
  // ==========================================
  ["mataram_ntb", "SPKLU PLN UIW NTB Mataram", "Jl. Langko, Mataram, Lombok", -8.5832, 116.1165, 50, "Hub utama pulau Lombok", false],
  ["mandalika", "SPKLU Sirkuit Mandalika", "KEK Mandalika, Lombok", -8.8954, 116.2954, 50, "Dekat sirkuit MotoGP Mandalika", false],
  ["labuan_bajo_vip", "SPKLU Pelabuhan Marina Labuan Bajo", "Port VIP Labuan Bajo, Flores", -8.4905, 119.8812, 120, "Daya ultra cepat Labuan Bajo", false],
  ["kupang_ntt", "SPKLU PLN UIW NTT Kupang", "Jl. Jend. Ahmad Yani, Kupang", -10.1712, 123.6012, 50, "Stasiun mandiri andalan pulau Timor", false],

  // ==========================================
  // KALIMANTAN (Borneo Corridor including IKN)
  // ==========================================
  ["ikn_kipp", "SPKLU Pusat KIPP IKN", "Kawasan Inti KIPP IKN", -0.9615, 116.8375, 150, "Armada listrik futuristik IKN", false],
  ["balikpapan_uid", "SPKLU PLN UID Kaltimra", "Jl. MT. Haryono, Balikpapan", -1.2425, 116.8624, 50, "Hub kota Balikpapan & tol IKN", false],
  ["samarinda_up3", "SPKLU PLN UP3 Samarinda", "Jl. Gajah Mada, Samarinda", -0.5015, 117.1425, 50, "Pusat ibukota Kaltim", false],
  ["banjarmasin", "SPKLU PLN UIW Kalselteng", "Jl. Lambung Mangkurat, Banjarmasin", -3.3194, 114.5912, 50, "Hub utama kalsel", false],
  ["palangkaraya", "SPKLU PLN UP3 Palangka Raya", "Jl. Jend. Ahmad Yani, Palangkaraya", -2.2085, 113.9162, 50, "Layanan cepat Kalteng", false],
  ["pontianak_uid", "SPKLU PLN UIW Kalbar", "Jl. Jend. Ahmad Yani, Pontianak", -0.0215, 109.3425, 50, "Isi daya di garis khatulistiwa", false],

  // ==========================================
  // SULAWESI CORRIDOR
  // ==========================================
  ["makassar_hertasning", "SPKLU PLN UIW Sulselrabar", "Jl. Letjen Hertasning, Makassar", -5.1612, 119.4435, 120, "Hub utama kelistrikan Sulawesi Selatan", false],
  ["parepare_up3", "SPKLU PLN UP3 Parepare", "Jl. Jend. Ahmad Yani, Parepare", -4.0125, 119.6254, 50, "Persinggahan rute Makassar-Toraja-Palu", false],
  ["palu_up3", "SPKLU PLN UP3 Palu", "Jl. Jend. Sudirman, Palu", -0.8912, 119.8712, 50, "Pesisir teluk Palu", false],
  ["gorontalo_up3", "SPKLU PLN UP3 Gorontalo", "Jl. Jend. Ahmad Yani, Gorontalo", 0.5425, 123.0612, 50, "Layanan utama Gorontalo", false],
  ["manado_uid", "SPKLU PLN UIW Suluttenggo", "Jl. Bethesda, Manado", 1.4824, 124.8415, 50, "Ujung utara pulau Sulawesi", false],
  ["kendari_up3", "SPKLU PLN UP3 Kendari", "Jl. Jend. Ahmad Yani, Kendari", -3.9785, 122.5284, 50, "Andalan kota Kendari nikel", false],

  // ==========================================
  // MALUKU & PAPUA
  // ==========================================
  ["ambon_mmu", "SPKLU PLN UIW MMU", "Jl. Jend. Sudirman, Ambon", -3.6954, 128.1812, 50, "Stasiun pengisian cepat Ambon", false],
  ["jayapura_papua", "SPKLU PLN UIW Papua", "Jl. Jend. Ahmad Yani, Jayapura", -2.5354, 140.7012, 50, "Kedaulatan timur Nusantara", false],
  ["sorong_up3", "SPKLU PLN UP3 Sorong", "Jl. Jend. Ahmad Yani, Sorong", -0.8715, 131.2512, 50, "Gerbang utama wisata Raja Ampat", false]
];

// Dynamically unpack tuples into rich objects to keep code modular and small!
export const SPKLU_DATABASE: SpkluDbItem[] = RAW_SPKLU_TUPLES.map(([suffix, name, location, lat, lon, capacity, note, isRestArea]) => {
  const isDc = capacity >= 30; // 30kw and above is typically DC fast charge
  return {
    id: `spklu_${suffix}`,
    name,
    location,
    lat,
    lon,
    type: isDc ? (capacity >= 100 ? "Ultra-Fast DC" : "Fast DC") : "Medium AC",
    capacity: `${capacity} kW`,
    note,
    isRestArea
  };
});
