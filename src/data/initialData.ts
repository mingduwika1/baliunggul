import { PilarInfo, ProgramItem, PelaksanaanItem, DokumentasiItem, MonitoringItem, GuruItem, SiswaItem, KelasItem, MitraItem, PengaturanSekolah, EvaluasiPemantauanItem } from '../types';

export const PILAR_LENTERA: PilarInfo[] = [
  {
    code: 'L',
    letter: 'L',
    name: 'Literasi dan Numerasi',
    akronim: 'L — Literasi & Numerasi',
    color: '#2563eb', // Blue
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
    borderColor: 'border-blue-500',
    iconName: 'BookOpen',
    deskripsi: 'Penguatan kemampuan literasi membaca, menulis kritis, sains, serta kecakapan numerasi kontekstual untuk memecahkan masalah nyata.',
    tujuan: 'Meningkatkan skor asesmen literasi-numerasi, menumbuhkan budaya gemar membaca 15 menit harian, serta melahirkan karya tulis ilmiah siswa.',
    sasaran: 'Seluruh peserta didik kelas X, XI, XII dan para pendidik.',
    strategi: 'Pojok Baca LENTERA, Tantangan Membaca 1 Bulan 1 Buku, Workshop Penulisan Esai, dan Numerasi Berbasis Proyek Keuangan Sederhana.',
    indikator: '100% siswa memiliki jurnal membaca, terbitnya 1 buku antologi cerpen/esai siswa per semester, skor AKM numerasi meningkat minimal 15%.'
  },
  {
    code: 'E1',
    letter: 'E',
    name: 'Eksplorasi Teknologi',
    akronim: 'E — Eksplorasi Teknologi',
    color: '#0284c7', // Sky Blue
    bgColor: 'bg-sky-50 text-sky-700 border-sky-200',
    borderColor: 'border-sky-500',
    iconName: 'Cpu',
    deskripsi: 'Pemanfaatan teknologi digital mutakhir, coding, kecerdasan buatan (AI), IoT pertanian modern Bali, dan otomatisasi industri.',
    tujuan: 'Mempersiapkan talenta digital Bali yang kompetitif di era revolusi industri 4.0 dan Society 5.0.',
    sasaran: 'Siswa peminatan teknik informatika, rekayasa perangkat lunak, robotika, dan sains terapan.',
    strategi: 'Bootcamp AI & Coding, Lomba Inovasi IoT Subak Bali (Smart Agriculture), serta Lab Virtual Reality Pembelajaran.',
    indikator: 'Terciptanya 3 prototipe IoT fungsional per tahun, 80% siswa mahir dasar pemrograman web, dan juara lomba robotika tingkat provinsi.'
  },
  {
    code: 'N',
    letter: 'N',
    name: 'Nilai Karakter',
    akronim: 'N — Nilai Karakter',
    color: '#d97706', // Amber/Gold
    bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
    borderColor: 'border-amber-500',
    iconName: 'HeartHandshake',
    deskripsi: 'Penanaman budi pekerti luhur, etika luhur, moderasi beragama, kepemimpinan siswa, serta falsafah Tri Hita Karana.',
    tujuan: 'Membangun insan berakhlak mulia, toleran, berintegritas tinggi, berdisiplin positif, dan memiliki empati sosial tinggi.',
    sasaran: 'Seluruh warga sekolah, komite sekolah, dan orang tua siswa.',
    strategi: 'Program Senyum Sapa Salam Santun, Bakti Sosial Peduli Lansia, Penerapan Tri Hita Karana dalam tata tertib sekolah, dan LDKS Terintegrasi.',
    indikator: 'Zero bullying di lingkungan sekolah, 95% kepatuhan disiplin positif, dan keikutsertaan aktif dalam aksi sosial kemanusiaan.'
  },
  {
    code: 'T',
    letter: 'T',
    name: 'Tradisi dan Budaya Lokal',
    akronim: 'T — Tradisi & Budaya Lokal',
    color: '#b45309', // Warm bronze/terracotta
    bgColor: 'bg-orange-50 text-orange-800 border-orange-200',
    borderColor: 'border-orange-500',
    iconName: 'Landmark',
    deskripsi: 'Pelestarian dan revitalisasi warisan adiluhung seni, bahasa, aksara, tenun tradisional, arsitektur, dan adat istiadat Bali.',
    tujuan: 'Memastikan generasi muda Bali bangga, menguasai, dan aktif merawat warisan adiluhung budaya leluhur Bali.',
    sasaran: 'Siswa kelas X dan XI melalui ekstrakurikuler seni dan pembiasaan budaya sekolah.',
    strategi: 'Bulan Bahasa Bali, Pasantian Aksara Bali Digital, Sanggar Tari & Karawitan LENTERA, Pelatihan Membuat Upakara Tradisional Bali, dan Wajib Busana Adat Purnama-Tilem.',
    indikator: '100% siswa fasih menulis aksara Bali dasar, terselenggaranya Pagelaran Seni Budaya Tahunan, dan sertifikasi penari/penabuh muda.'
  },
  {
    code: 'E2',
    letter: 'E',
    name: 'Etos Kerja dan Kompetensi',
    akronim: 'E — Etos Kerja & Kompetensi',
    color: '#0d9488', // Teal
    bgColor: 'bg-teal-50 text-teal-800 border-teal-200',
    borderColor: 'border-teal-500',
    iconName: 'Briefcase',
    deskripsi: 'Pengembangan profesionalisme, ketelitian, standar K3 (Kesehatan & Keselamatan Kerja), sertifikasi BNSP, dan budaya kerja industri modern.',
    tujuan: 'Mencetak lulusan siap kerja dengan standar mutu industri nasional maupun internasional yang berdisiplin baja.',
    sasaran: 'Siswa kelas XI dan XII menjelang Praktik Kerja Lapangan (PKL) dan Uji Kompetensi Keahlian (UKK).',
    strategi: 'Penerapan 5S (Seiri, Seiton, Seiso, Seiketsu, Shitsuke) di seluruh lab/bengkel, Sinkronisasi Kurikulum DUDI, dan Magang Guru & Siswa di Hotel Bintang 5 & Tech Company Bali.',
    indikator: 'Tingkat kelulusan UKK BNSP minimal 92%, kepuasan mitra industri >= 88%, dan terserap kerja/wirausaha dalam waktu 6 bulan setelah lulus.'
  },
  {
    code: 'R',
    letter: 'R',
    name: 'Rintis Kewirausahaan',
    akronim: 'R — Rintis Kewirausahaan',
    color: '#16a34a', // Emerald Green
    bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderColor: 'border-emerald-500',
    iconName: 'TrendingUp',
    deskripsi: 'Penumbuhan jiwa wirausaha muda (Studentpreneur), inkubasi bisnis produk kreatif khas Bali, manajemen keuangan, dan digital marketing.',
    tujuan: 'Menciptakan wirausahawan muda mandiri yang mampu membuka lapangan kerja dan mempromosikan produk lokal Bali ke kancah global.',
    sasaran: 'Kelompok usaha siswa kelas XI dan unit produksi Teaching Factory (TeFa).',
    strategi: 'Business Plan Competition LENTERA, Edu-Mart Sekolah, Pelatihan Foto Produk & E-Commerce Shopee/TikTok Shop, dan Bazar Kewirausahaan Akhir Semester.',
    indikator: 'Terbentuknya minimal 15 unit bisnis rintisan siswa terkurasi per tahun dan omzet inkubator bisnis sekolah mencapai target.'
  },
  {
    code: 'A',
    letter: 'A',
    name: 'Adaptif dan Inovatif',
    akronim: 'A — Adaptif & Inovatif',
    color: '#7c3aed', // Purple
    bgColor: 'bg-purple-50 text-purple-800 border-purple-200',
    borderColor: 'border-purple-500',
    iconName: 'Sparkles',
    deskripsi: 'Kemampuan beradaptasi dengan perubahan zaman, berpikir solutif terhadap isu lingkungan global (Green School Bali), riset terapan, dan inovasi ramah bumi.',
    tujuan: 'Mewujudkan civitas akademika yang tangkas menghadapi tantangan masa depan dan pelopor kelestarian lingkungan Bali Dwipa.',
    sasaran: 'Seluruh civitas akademika dan komunitas sekitar sekolah.',
    strategi: 'Gerakan Sekolah Bebas Sampah Plastik, Pengolahan Kompos Organik Subak Sekolah, Lomba Karya Inovasi Daur Ulang, dan Green Energy Solar Lab.',
    indikator: 'Penurunan sampah anorganik sekolah sebesar 70%, tercapainya predikat Sekolah Adiwiyata Mandiri, dan lahirnya 2 produk paten sederhana.'
  }
];

export const INITIAL_PENGATURAN: PengaturanSekolah = {
  namaSekolah: 'SMK NEGERI 1 LENTERA BALI',
  logo: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=160&q=80',
  alamat: 'Jl. Raya Pendidikan No. 45, Denpasar Selatan, Kota Denpasar, Bali 80225',
  kepalaSekolah: 'Dr. Drs. I Nyoman Suardika, M.Pd.',
  nipKepalaSekolah: '19740512 199802 1 004',
  koordinatorLentera: 'Ni Luh Made Ayu Pradnyani, S.Pd., M.Ed.',
  nipKoordinator: '19850824 200903 2 007',
  tahunPelajaran: '2026/2027',
  semester: 'Ganjil',
  emailSekolah: 'lentera@smkn1balischool.sch.id',
  teleponSekolah: '(0361) 8945231',
  websiteSekolah: 'https://smkn1lenterabali.sch.id',
  gasWebAppUrl: '',
  googleSpreadsheetId: '1xLENTERA_Bali_Spreadsheet_Master_DB_2026',
  googleDriveFolderId: '1F_Drive_Dokumentasi_Lentera_Bali',
  storageMode: 'local'
};

export const INITIAL_PROGRAMS: ProgramItem[] = [];
export const INITIAL_PELAKSANAAN: PelaksanaanItem[] = [];
export const INITIAL_DOKUMENTASI: DokumentasiItem[] = [];
export const INITIAL_MONITORING: MonitoringItem[] = [];

export const INITIAL_GURU: GuruItem[] = [
  { id: 'GRU-001', namaGuru: 'Dr. Drs. I Nyoman Suardika, M.Pd.', nip: '19740512 199802 1 004', jabatan: 'Kepala Sekolah', mataPelajaran: 'Manajemen Pendidikan', email: 'kepsek@smkn1balischool.sch.id', status: 'Aktif' },
  { id: 'GRU-002', namaGuru: 'Ni Luh Made Ayu Pradnyani, S.Pd., M.Ed.', nip: '19850824 200903 2 007', jabatan: 'Koordinator LENTERA / Waka Kurikulum', mataPelajaran: 'Bahasa Inggris', email: 'ayu.pradnyani@smkn1balischool.sch.id', status: 'Aktif' },
  { id: 'GRU-003', namaGuru: 'I Kadek Sudarma, M.Kom.', nip: '19881115 201101 1 009', jabatan: 'Ketua Konsentrasi RPL / Tim IT', mataPelajaran: 'Rekayasa Perangkat Lunak & IoT', email: 'kadek.sudarma@smkn1balischool.sch.id', status: 'Aktif' },
  { id: 'GRU-004', namaGuru: 'Ida Ayu Ketut Candrawati, S.Pd.B.', nip: '19820310 200604 2 015', jabatan: 'Ketua Program Seni Budaya', mataPelajaran: 'Muatan Lokal Bahasa Bali', email: 'dayu.candra@smkn1balischool.sch.id', status: 'Aktif' },
  { id: 'GRU-005', namaGuru: 'Ir. I Made Wiraatmaja, S.T., M.T.', nip: '19790618 200501 1 011', jabatan: 'Ketua LSP-P1 & Waka Hubin', mataPelajaran: 'Teknik Industri & K3', email: 'made.wira@smkn1balischool.sch.id', status: 'Aktif' },
  { id: 'GRU-006', namaGuru: 'Ni Made Dewi Lestari, S.E., M.M.', nip: '19900214 201503 2 006', jabatan: 'Kepala Unit Produksi & TeFa', mataPelajaran: 'Produk Kreatif & Kewirausahaan', email: 'dewi.lestari@smkn1balischool.sch.id', status: 'Aktif' },
  { id: 'GRU-007', namaGuru: 'I Ketut Dananjaya, S.Si., M.Pd.', nip: '19840422 200801 1 014', jabatan: 'Koordinator Adiwiyata', mataPelajaran: 'Projek IPAS & Biologi Terapan', email: 'ketut.dananjaya@smkn1balischool.sch.id', status: 'Aktif' },
  { id: 'GRU-008', namaGuru: 'Drs. I Gusti Ngurah Agung, M.Fil.H.', nip: '19760719 200212 1 003', jabatan: 'Waka Kesiswaan', mataPelajaran: 'Pendidikan Agama Hindu & Budi Pekerti', email: 'ngurah.agung@smkn1balischool.sch.id', status: 'Aktif' },
  { id: 'GRU-009', namaGuru: 'Ni Wayan Astuti, S.Pd.', nip: '19910903 201701 2 008', jabatan: 'Kepala Perpustakaan', mataPelajaran: 'Bahasa Indonesia', email: 'wayan.astuti@smkn1balischool.sch.id', status: 'Aktif' }
];

export const INITIAL_SISWA: SiswaItem[] = [
  { id: 'SIS-001', namaSiswa: 'I Putu Arya Dananjaya', nisn: '0075482910', kelas: 'XII RPL 1', konsentrasiKeahlian: 'Rekayasa Perangkat Lunak', status: 'Aktif' },
  { id: 'SIS-002', namaSiswa: 'Ni Kadek Sintya Dewi', nisn: '0078923412', kelas: 'XII RPL 1', konsentrasiKeahlian: 'Rekayasa Perangkat Lunak', status: 'Aktif' },
  { id: 'SIS-003', namaSiswa: 'I Komang Bagus Aditya', nisn: '0082341129', kelas: 'XI TKJ 2', konsentrasiKeahlian: 'Teknik Komputer & Jaringan', status: 'Aktif' },
  { id: 'SIS-004', namaSiswa: 'Ni Wayan Desi Ratnasari', nisn: '0086745190', kelas: 'XI TBG 1', konsentrasiKeahlian: 'Kuliner / Tata Boga', status: 'Aktif' },
  { id: 'SIS-005', namaSiswa: 'I Made Yoga Pratama', nisn: '0091238475', kelas: 'X DKV 1', konsentrasiKeahlian: 'Desain Komunikasi Visual', status: 'Aktif' },
  { id: 'SIS-006', namaSiswa: 'Ni Ketut Ayu Saraswati', nisn: '0094561238', kelas: 'X ULP 2', konsentrasiKeahlian: 'Usaha Layanan Pariwisata', status: 'Aktif' }
];

export const INITIAL_KELAS: KelasItem[] = [
  { id: 'KLS-001', namaKelas: 'X RPL 1', tingkat: 'X', konsentrasiKeahlian: 'Rekayasa Perangkat Lunak', waliKelas: 'I Kadek Sudarma, M.Kom.' },
  { id: 'KLS-002', namaKelas: 'XI RPL 1', tingkat: 'XI', konsentrasiKeahlian: 'Rekayasa Perangkat Lunak', waliKelas: 'Ni Made Dewi Lestari, S.E., M.M.' },
  { id: 'KLS-003', namaKelas: 'XII RPL 1', tingkat: 'XII', konsentrasiKeahlian: 'Rekayasa Perangkat Lunak', waliKelas: 'Ir. I Made Wiraatmaja, S.T., M.T.' },
  { id: 'KLS-004', namaKelas: 'X DKV 1', tingkat: 'X', konsentrasiKeahlian: 'Desain Komunikasi Visual', waliKelas: 'Ni Wayan Astuti, S.Pd.' },
  { id: 'KLS-005', namaKelas: 'XI TBG 1', tingkat: 'XI', konsentrasiKeahlian: 'Kuliner / Tata Boga', waliKelas: 'Ida Ayu Ketut Candrawati, S.Pd.B.' },
  { id: 'KLS-006', namaKelas: 'XII ULP 1', tingkat: 'XII', konsentrasiKeahlian: 'Usaha Layanan Pariwisata', waliKelas: 'Drs. I Gusti Ngurah Agung, M.Fil.H.' }
];

export const INITIAL_MITRA: MitraItem[] = [
  { id: 'MTR-001', namaMitra: 'PT Telkom Indonesia Witel Denpasar', jenisMitra: 'DUDI', alamat: 'Jl. Teuku Umar No. 6, Denpasar', kontak: '0361-224455 (Bpk. Wayan Sukadana)', keterangan: 'Mitra Teaching Factory dan Praktik Kerja Lapangan bidang IT & Jaringan' },
  { id: 'MTR-002', namaMitra: 'The Trans Resort Bali Seminyak', jenisMitra: 'DUDI', alamat: 'Jl. Sunset Road Seminyak, Badung', kontak: '0361-8981234 (HRD Ibu Made)', keterangan: 'Mitra sertifikasi hospitality, magang kerja perhotelan, dan penyerapan lulusan' },
  { id: 'MTR-003', namaMitra: 'Dinas Kebudayaan Provinsi Bali', jenisMitra: 'Instansi Pemerintah', alamat: 'Jl. Juanda No. 1, Denpasar', kontak: '0361-227552 (Bidang Kesenian)', keterangan: 'Pembinaan Bulan Bahasa Bali, naskah kuno, dan sertifikasi kesenian tradisi' },
  { id: 'MTR-004', namaMitra: 'BPD Bali Kantor Cabang Utama Denpasar', jenisMitra: 'DUDI', alamat: 'Jl. Raya Puputan Renon, Denpasar', kontak: '0361-235889 (Divisi UMKM)', keterangan: 'Sponsor permodalan inkubator bisnis siswa SimPel Preneur' },
  { id: 'MTR-005', namaMitra: 'Sungai Watch Bali Foundation', jenisMitra: 'Komunitas Seni/Budaya', alamat: 'Canggu, Kuta Utara, Badung', kontak: 'info@sungaiwatch.com', keterangan: 'Mitra konservasi lingkungan, audit sampah plastik, dan eco-school' }
];

export const INITIAL_EVALUASI_PEMANTAUAN: EvaluasiPemantauanItem[] = [];


