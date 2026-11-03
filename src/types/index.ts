export type PilarCode = 'L' | 'E1' | 'N' | 'T' | 'E2' | 'R' | 'A';

export interface PilarInfo {
  code: PilarCode;
  letter: string;
  name: string;
  akronim: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  deskripsi: string;
  tujuan: string;
  sasaran: string;
  strategi: string;
  indikator: string;
}

export type StatusPerencanaan = 'Direncanakan' | 'Disetujui' | 'Sedang Berjalan' | 'Selesai' | 'Ditunda' | 'Dibatalkan';
export type StatusPelaksanaan = 'Terlaksana Sempurna' | 'Terlaksana Sebagian' | 'Dalam Proses' | 'Terlambat' | 'Belum Terlaksana';
export type KategoriEvaluasi = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan';
export type HasilPemantauan = 'Sangat baik' | 'Baik' | 'Cukup' | 'Kurang';
export type UserRole = 'ADMIN' | 'KEPALA_SEKOLAH' | 'KOORDINATOR' | 'GURU';

export interface EvaluasiPemantauanItem {
  id: string; // e.g., EVL-2026-001
  jenisKegiatan: string;
  idProgram?: string;
  pilar: string;
  pilarCode: PilarCode;
  tanggalPemantauan: string; // YYYY-MM-DD
  pemantau: string;
  hasilPemantauan: HasilPemantauan;
  keterangan: string;
  tindakLanjutSaran?: string;
  createdAt?: string;
}

export type IntegrasiKurikulum = 
  | 'Intrakurikuler' 
  | 'Kokurikuler' 
  | 'Ekstrakurikuler' 
  | 'Pembiasaan budaya sekolah';

export interface ProgramItem {
  id: string; // e.g., PRG-2026-001
  namaProgram: string;
  pilar: string; // e.g., "L — Literasi dan Numerasi"
  pilarCode: PilarCode;
  deskripsi: string;
  tujuan: string;
  sasaran: string;
  kelas: string;
  bentukPelaksanaan: string;
  integrasiKurikulum: IntegrasiKurikulum;
  mapelTerkait: string;
  penanggungJawab: string;
  timPelaksana: string;
  mitra: string;
  target: string;
  indikator: string;
  waktuPelaksanaan: string;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  anggaran: number;
  status: StatusPerencanaan;
  createdAt?: string;
  updatedAt?: string;
}

export interface PelaksanaanItem {
  id: string; // e.g., PEL-2026-001
  idProgram: string;
  namaKegiatan: string;
  pilar: string;
  pilarCode: PilarCode;
  tanggal: string; // YYYY-MM-DD
  waktu: string;
  lokasi: string;
  penanggungJawab: string;
  peserta: string;
  jumlahPeserta: number;
  uraian: string;
  hasil: string;
  capaian: string;
  kendala: string;
  solusi: string;
  evaluasi: string;
  status: StatusPelaksanaan;
  createdAt?: string;
}

export interface DokumentasiItem {
  id: string; // e.g., DOK-2026-001
  idProgram: string;
  idPelaksanaan: string;
  namaFile: string;
  jenisFile: 'image' | 'video' | 'document';
  urlDrive: string;
  thumbnailUrl?: string;
  tanggalUpload: string;
  keterangan: string;
  pengunggah: string;
  fileSize?: string;
}

export interface MonitoringItem {
  id: string; // e.g., MON-2026-001
  idProgram: string;
  namaProgram: string;
  pilar: string;
  pilarCode?: PilarCode;
  tanggalEvaluasi: string;
  target: string;
  realisasi: string;
  persentase: number; // 0 - 100
  kategori: KategoriEvaluasi;
  kendala: string;
  rekomendasi: string;
  evaluator: string;
  status: string;
}

export interface GuruItem {
  id: string;
  namaGuru: string;
  nip: string;
  jabatan: string;
  mataPelajaran: string;
  email: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface SiswaItem {
  id: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  konsentrasiKeahlian: string;
  status: 'Aktif' | 'Alumni' | 'Pindah';
}

export interface KelasItem {
  id: string;
  namaKelas: string;
  tingkat: 'X' | 'XI' | 'XII';
  konsentrasiKeahlian: string;
  waliKelas: string;
}

export interface MitraItem {
  id: string;
  namaMitra: string;
  jenisMitra: 'DUDI' | 'Perguruan Tinggi' | 'Instansi Pemerintah' | 'Komunitas Seni/Budaya' | 'UMKM Bali';
  alamat: string;
  kontak: string;
  keterangan: string;
}

export interface PengaturanSekolah {
  namaSekolah: string;
  logo: string;
  alamat: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  koordinatorLentera: string;
  nipKoordinator: string;
  tahunPelajaran: string;
  semester: 'Ganjil' | 'Genap';
  emailSekolah: string;
  teleponSekolah: string;
  websiteSekolah: string;
  gasWebAppUrl: string; // Google Apps Script Web App Deployment URL
  googleSpreadsheetId: string;
  googleDriveFolderId: string;
  storageMode: 'local' | 'gas';
}

export interface UserSession {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
