import {
  ProgramItem,
  PelaksanaanItem,
  DokumentasiItem,
  MonitoringItem,
  GuruItem,
  SiswaItem,
  KelasItem,
  MitraItem,
  PengaturanSekolah,
  UserSession,
  KategoriEvaluasi,
  HasilPemantauan,
  EvaluasiPemantauanItem,
  PilarCode
} from '../types';
import {
  INITIAL_PENGATURAN,
  INITIAL_PROGRAMS,
  INITIAL_PELAKSANAAN,
  INITIAL_DOKUMENTASI,
  INITIAL_MONITORING,
  INITIAL_GURU,
  INITIAL_SISWA,
  INITIAL_KELAS,
  INITIAL_MITRA,
  INITIAL_EVALUASI_PEMANTAUAN
} from '../data/initialData';

// Helper untuk membersihkan format tanggal dari Spreadsheet
export function cleanDate(val: any, fallback = ''): string {
  if (!val) return fallback;
  if (val instanceof Date) {
    try {
      return val.toISOString().split('T')[0];
    } catch {
      return fallback;
    }
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    try {
      return parsed.toISOString().split('T')[0];
    } catch {
      return fallback;
    }
  }
  return str || fallback;
}

export function detectPilarCode(pilarStr: any): PilarCode {
  const str = String(pilarStr || '').toLowerCase();
  if (str.includes('literasi') || str.startsWith('l')) return 'L';
  if (str.includes('eksplorasi') || str.includes('teknologi') || str.startsWith('e1')) return 'E1';
  if (str.includes('karakter') || str.startsWith('n')) return 'N';
  if (str.includes('tradisi') || str.includes('budaya') || str.startsWith('t')) return 'T';
  if (str.includes('etos') || str.includes('kompetensi') || str.startsWith('e2')) return 'E2';
  if (str.includes('wirausaha') || str.startsWith('r')) return 'R';
  if (str.includes('adaptif') || str.includes('inovatif') || str.startsWith('a')) return 'A';
  return 'L';
}

export function normalizeGasUrl(url: string): string {
  if (!url) return '';
  return String(url).trim().replace(/\/edit(\?.*)?$/, '/exec');
}

// Helper pencarian nilai kolom yang tahan terhadap spasi, huruf besar/kecil, dan garis bawah
export function getRowVal(row: any, ...keys: string[]): string {
  if (!row || typeof row !== 'object') return '';
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]).trim();
    }
  }
  // Pencarian case-insensitive & abaikan spasi/garis bawah
  const rowKeys = Object.keys(row);
  for (const k of keys) {
    const target = k.toLowerCase().replace(/[\s_\-]/g, '');
    const foundKey = rowKeys.find(rk => rk.toLowerCase().replace(/[\s_\-]/g, '') === target);
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
      return String(row[foundKey]).trim();
    }
  }
  return '';
}

// Helper untuk menemukan array sheet dalam rawData meski nama tab bervariasi
export function findSheetData(rawData: any, ...sheetNames: string[]): any[] {
  if (!rawData || typeof rawData !== 'object') return [];
  for (const name of sheetNames) {
    if (Array.isArray(rawData[name]) && rawData[name].length > 0) return rawData[name];
  }
  const rawKeys = Object.keys(rawData);
  for (const name of sheetNames) {
    const norm = name.toLowerCase().replace(/[\s_\-]/g, '');
    const matchedKey = rawKeys.find(k => k.toLowerCase().replace(/[\s_\-]/g, '') === norm);
    if (matchedKey && Array.isArray(rawData[matchedKey]) && rawData[matchedKey].length > 0) {
      return rawData[matchedKey];
    }
  }
  return [];
}

// Mappers dari Baris Spreadsheet ke Model Aplikasi

export function mapRowToProgram(row: any, index: number): ProgramItem | null {
  if (!row) return null;
  const id = getRowVal(row, 'ID_Program', 'id_program', 'ID Program', 'idProgram', 'ID', 'id') || `PRG-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`;
  const namaProgram = getRowVal(row, 'Nama_Program', 'nama_program', 'Nama Program', 'namaProgram', 'Nama', 'nama');
  if (!namaProgram && !id) return null;

  const pilar = getRowVal(row, 'Pilar', 'pilar') || 'L — Literasi dan Numerasi';
  const rawPilarCode = getRowVal(row, 'Pilar_Code', 'pilar_code', 'Pilar Code', 'pilarCode');
  const pilarCode = (rawPilarCode || detectPilarCode(pilar)) as PilarCode;

  return {
    id: String(id),
    namaProgram: String(namaProgram || 'Program LENTERA'),
    pilar: pilar,
    pilarCode: pilarCode,
    deskripsi: getRowVal(row, 'Deskripsi', 'deskripsi'),
    tujuan: getRowVal(row, 'Tujuan', 'tujuan'),
    sasaran: getRowVal(row, 'Sasaran', 'sasaran') || 'Seluruh Siswa',
    kelas: getRowVal(row, 'Kelas', 'kelas') || 'Semua Tingkat',
    bentukPelaksanaan: getRowVal(row, 'Bentuk_Pelaksanaan', 'Bentuk Pelaksanaan', 'bentukPelaksanaan') || 'Kokurikuler',
    integrasiKurikulum: (getRowVal(row, 'Integrasi_Kurikulum', 'integrasi_kurikulum', 'Integrasi Kurikulum', 'integrasiKurikulum') || 'Kokurikuler') as any,
    mapelTerkait: getRowVal(row, 'Mapel_Terkait', 'mapel_terkait', 'Mapel Terkait', 'mapelTerkait'),
    penanggungJawab: getRowVal(row, 'Penanggung_Jawab', 'penanggung_jawab', 'Penanggung Jawab', 'penanggungJawab') || 'Koordinator LENTERA',
    timPelaksana: getRowVal(row, 'Tim_Pelaksana', 'tim_pelaksana', 'Tim Pelaksana', 'timPelaksana'),
    mitra: getRowVal(row, 'Mitra', 'mitra'),
    target: getRowVal(row, 'Target', 'target') || '100% siswa tuntas',
    indikator: getRowVal(row, 'Indikator', 'indikator'),
    waktuPelaksanaan: getRowVal(row, 'Waktu_Pelaksanaan', 'Waktu Pelaksanaan', 'waktuPelaksanaan') || 'Semester Ganjil & Genap',
    tanggalMulai: cleanDate(getRowVal(row, 'Tanggal_Mulai', 'tanggal_mulai', 'Tanggal Mulai', 'tanggalMulai'), '2026-07-15'),
    tanggalSelesai: cleanDate(getRowVal(row, 'Tanggal_Selesai', 'tanggal_selesai', 'Tanggal Selesai', 'tanggalSelesai'), '2026-12-15'),
    anggaran: Number(getRowVal(row, 'Anggaran', 'anggaran') || 0),
    status: (getRowVal(row, 'Status', 'status') || 'Direncanakan') as any,
    createdAt: getRowVal(row, 'CreatedAt', 'createdAt') || new Date().toISOString(),
    updatedAt: getRowVal(row, 'UpdatedAt', 'updatedAt') || new Date().toISOString()
  };
}

export function mapRowToPelaksanaan(row: any, index: number): PelaksanaanItem | null {
  if (!row) return null;
  const id = getRowVal(row, 'ID_Pelaksanaan', 'id_pelaksanaan', 'ID Pelaksanaan', 'idPelaksanaan', 'ID', 'id') || `PEL-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`;
  const namaKegiatan = getRowVal(row, 'Nama_Kegiatan', 'nama_kegiatan', 'Nama Kegiatan', 'namaKegiatan', 'Nama', 'nama');
  if (!namaKegiatan && !id) return null;

  const pilar = getRowVal(row, 'Pilar', 'pilar');
  const rawPilarCode = getRowVal(row, 'Pilar_Code', 'pilar_code', 'Pilar Code', 'pilarCode');
  const pilarCode = (rawPilarCode || detectPilarCode(pilar)) as PilarCode;

  return {
    id: String(id),
    idProgram: getRowVal(row, 'ID_Program', 'id_program', 'ID Program', 'idProgram'),
    namaKegiatan: String(namaKegiatan || 'Realisasi Kegiatan LENTERA'),
    pilar: pilar,
    pilarCode: pilarCode,
    tanggal: cleanDate(getRowVal(row, 'Tanggal', 'tanggal'), '2026-08-01'),
    waktu: getRowVal(row, 'Waktu', 'waktu') || '08:00 - 12:00 WITA',
    lokasi: getRowVal(row, 'Lokasi', 'lokasi') || 'Lingkungan Sekolah',
    penanggungJawab: getRowVal(row, 'Penanggung_Jawab', 'penanggung_jawab', 'Penanggung Jawab', 'penanggungJawab') || 'Guru Pembina',
    peserta: getRowVal(row, 'Peserta', 'peserta') || 'Siswa & Guru',
    jumlahPeserta: Number(getRowVal(row, 'Jumlah_Peserta', 'jumlah_peserta', 'Jumlah Peserta', 'jumlahPeserta') || 0),
    uraian: getRowVal(row, 'Uraian', 'uraian'),
    hasil: getRowVal(row, 'Hasil', 'hasil'),
    capaian: getRowVal(row, 'Capaian', 'capaian'),
    kendala: getRowVal(row, 'Kendala', 'kendala'),
    solusi: getRowVal(row, 'Solusi', 'solusi'),
    evaluasi: getRowVal(row, 'Evaluasi', 'evaluasi'),
    status: (getRowVal(row, 'Status', 'status') || 'Selesai') as any,
    createdAt: getRowVal(row, 'CreatedAt', 'createdAt') || new Date().toISOString()
  };
}

export function mapRowToDokumentasi(row: any, index: number): DokumentasiItem | null {
  if (!row) return null;
  const id = getRowVal(row, 'ID_Dokumentasi', 'id_dokumentasi', 'ID Dokumentasi', 'idDokumentasi', 'ID', 'id') || `DOK-${String(index + 1).padStart(3, '0')}`;
  const urlDrive = getRowVal(row, 'URL_Drive', 'url_drive', 'URL Drive', 'urlDrive', 'URL', 'url', 'Link');
  const namaFile = getRowVal(row, 'Nama_File', 'nama_file', 'Nama File', 'namaFile', 'Nama', 'nama');
  if (!urlDrive && !namaFile) return null;

  return {
    id: String(id),
    idProgram: getRowVal(row, 'ID_Program', 'id_program', 'ID Program', 'idProgram'),
    idPelaksanaan: getRowVal(row, 'ID_Pelaksanaan', 'id_pelaksanaan', 'ID Pelaksanaan', 'idPelaksanaan'),
    namaFile: namaFile || 'Dokumentasi Kegiatan',
    jenisFile: (getRowVal(row, 'Jenis_File', 'jenis_file', 'Jenis File', 'jenisFile') || 'image') as any,
    urlDrive: urlDrive,
    tanggalUpload: cleanDate(getRowVal(row, 'Tanggal_Upload', 'tanggal_upload', 'Tanggal Upload', 'tanggalUpload'), new Date().toISOString().split('T')[0]),
    keterangan: getRowVal(row, 'Keterangan', 'keterangan'),
    pengunggah: getRowVal(row, 'Pengunggah', 'pengunggah') || 'Tim Dokumentasi'
  };
}

export function mapRowToEvaluasi(row: any, index: number): EvaluasiPemantauanItem | null {
  if (!row) return null;
  const id = getRowVal(row, 'ID_Evaluasi', 'id_evaluasi', 'ID Evaluasi', 'idEvaluasi', 'ID', 'id') || `EVL-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`;
  const jenisKegiatan = getRowVal(row, 'Jenis_Kegiatan', 'jenis_kegiatan', 'Jenis Kegiatan', 'jenisKegiatan', 'Nama_Kegiatan', 'Nama Kegiatan', 'Kegiatan');
  if (!jenisKegiatan && !id) return null;

  const pilar = getRowVal(row, 'Pilar', 'pilar') || 'L — Literasi dan Numerasi';
  const rawPilarCode = getRowVal(row, 'Pilar_Code', 'pilar_code', 'Pilar Code', 'pilarCode');
  const pilarCode = (rawPilarCode || detectPilarCode(pilar)) as PilarCode;

  return {
    id: String(id),
    jenisKegiatan: String(jenisKegiatan),
    idProgram: getRowVal(row, 'ID_Program', 'id_program', 'ID Program', 'idProgram'),
    pilar: pilar,
    pilarCode: pilarCode,
    tanggalPemantauan: cleanDate(getRowVal(row, 'Tanggal_Pemantauan', 'tanggal_pemantauan', 'Tanggal Pemantauan', 'tanggalPemantauan', 'Tanggal', 'tanggal'), new Date().toISOString().split('T')[0]),
    pemantau: getRowVal(row, 'Pemantau', 'pemantau', 'Penilai', 'penilai') || 'Kepala Sekolah',
    hasilPemantauan: (getRowVal(row, 'Hasil_Pemantauan', 'hasil_pemantauan', 'Hasil Pemantauan', 'hasilPemantauan', 'Hasil', 'hasil') || 'Baik') as any,
    keterangan: getRowVal(row, 'Keterangan', 'keterangan', 'Catatan', 'catatan'),
    tindakLanjutSaran: getRowVal(row, 'Tindak_Lanjut', 'tindak_lanjut', 'Tindak Lanjut', 'tindakLanjutSaran', 'Saran', 'saran'),
    createdAt: getRowVal(row, 'CreatedAt', 'createdAt') || new Date().toISOString()
  };
}

export function mapRowToMonitoring(row: any, index: number): MonitoringItem | null {
  if (!row) return null;
  const id = getRowVal(row, 'ID_Monitoring', 'id_monitoring', 'ID Monitoring', 'idMonitoring', 'ID', 'id') || `MON-${String(index + 1).padStart(3, '0')}`;
  const pilar = getRowVal(row, 'Pilar', 'pilar');
  return {
    id: String(id),
    idProgram: getRowVal(row, 'ID_Program', 'id_program', 'ID Program', 'idProgram'),
    namaProgram: getRowVal(row, 'Nama_Program', 'Nama Program', 'namaProgram', 'nama_program') || 'Program LENTERA',
    pilar: pilar,
    pilarCode: detectPilarCode(pilar),
    tanggalEvaluasi: cleanDate(getRowVal(row, 'Tanggal_Evaluasi', 'tanggal_evaluasi', 'Tanggal Evaluasi', 'tanggalEvaluasi', 'Tanggal', 'tanggal')),
    target: getRowVal(row, 'Target', 'target'),
    realisasi: getRowVal(row, 'Realisasi', 'realisasi'),
    persentase: Number(getRowVal(row, 'Persentase', 'persentase') || 0),
    kategori: (getRowVal(row, 'Kategori', 'kategori') || 'Baik') as any,
    kendala: getRowVal(row, 'Kendala', 'kendala'),
    rekomendasi: getRowVal(row, 'Rekomendasi', 'rekomendasi'),
    evaluator: getRowVal(row, 'Evaluator', 'evaluator') || 'Tim Penjamin Mutu',
    status: getRowVal(row, 'Status', 'status') || 'Selesai'
  };
}

export function mapRowToGuru(row: any, index: number): GuruItem | null {
  if (!row) return null;
  const namaGuru = getRowVal(row, 'Nama_Guru', 'Nama Guru', 'namaGuru', 'Nama', 'nama', 'Nama_Lengkap', 'Nama Lengkap');
  const nip = getRowVal(row, 'NIP', 'nip', 'Nip', 'Nomor_Induk', 'Nomor Induk');
  const id = getRowVal(row, 'ID_Guru', 'id_guru', 'ID Guru', 'idGuru', 'ID', 'id') || (nip ? `GRU-${nip.replace(/\s+/g, '')}` : `GRU-${String(index + 1).padStart(3, '0')}`);
  
  if (!namaGuru && !id && !nip) return null;

  const rawStatus = getRowVal(row, 'Status', 'status', 'Keaktifan');
  const status: 'Aktif' | 'Non-Aktif' = rawStatus.toLowerCase().includes('non') ? 'Non-Aktif' : 'Aktif';

  return {
    id: id || `GRU-${String(index + 1).padStart(3, '0')}`,
    namaGuru: namaGuru || 'Guru Sekolah',
    nip: nip || '-',
    jabatan: getRowVal(row, 'Jabatan', 'jabatan', 'Posisi', 'posisi', 'Peran') || 'Guru Pembina',
    mataPelajaran: getRowVal(row, 'Mata_Pelajaran', 'Mata Pelajaran', 'mata_pelajaran', 'mataPelajaran', 'Mapel', 'mapel') || '-',
    email: getRowVal(row, 'Email', 'email', 'Surel', 'surel') || '',
    status: status
  };
}

export function mapRowToSiswa(row: any, index: number): SiswaItem | null {
  if (!row) return null;
  const namaSiswa = getRowVal(row, 'Nama_Siswa', 'Nama Siswa', 'namaSiswa', 'Nama', 'nama', 'Nama_Lengkap', 'Nama Lengkap');
  const nisn = getRowVal(row, 'NISN', 'nisn', 'NIS', 'nis', 'Nomor_Induk', 'Nomor Induk');
  const id = getRowVal(row, 'ID_Siswa', 'id_siswa', 'ID Siswa', 'idSiswa', 'ID', 'id') || (nisn ? `SIS-${nisn}` : `SIS-${String(index + 1).padStart(3, '0')}`);

  if (!namaSiswa && !id && !nisn) return null;

  const rawStatus = getRowVal(row, 'Status', 'status').toLowerCase();
  let status: 'Aktif' | 'Alumni' | 'Pindah' = 'Aktif';
  if (rawStatus.includes('lulus') || rawStatus.includes('alumni')) status = 'Alumni';
  else if (rawStatus.includes('mutasi') || rawStatus.includes('pindah')) status = 'Pindah';

  return {
    id: id || `SIS-${String(index + 1).padStart(3, '0')}`,
    namaSiswa: namaSiswa || 'Siswa LENTERA',
    nisn: nisn || '-',
    kelas: getRowVal(row, 'Kelas', 'kelas', 'Rombel', 'rombel', 'Tingkat') || 'X',
    konsentrasiKeahlian: getRowVal(row, 'Konsentrasi_Keahlian', 'Konsentrasi Keahlian', 'konsentrasi_keahlian', 'konsentrasiKeahlian', 'Jurusan', 'jurusan') || 'Umum',
    status: status
  };
}

export function mapRowToKelas(row: any, index: number): KelasItem | null {
  if (!row) return null;
  const namaKelas = getRowVal(row, 'Nama_Kelas', 'Nama Kelas', 'namaKelas', 'Kelas', 'kelas', 'Nama', 'nama');
  const id = getRowVal(row, 'ID_Kelas', 'id_kelas', 'ID Kelas', 'idKelas', 'ID', 'id') || `KLS-${String(index + 1).padStart(3, '0')}`;
  if (!namaKelas && !id) return null;

  const rawTingkat = getRowVal(row, 'Tingkat', 'tingkat', 'Jenjang');
  let tingkat: 'X' | 'XI' | 'XII' = 'X';
  if (rawTingkat.includes('XII') || namaKelas.includes('XII')) {
    tingkat = 'XII';
  } else if (rawTingkat.includes('XI') || namaKelas.includes('XI')) {
    tingkat = 'XI';
  } else {
    tingkat = 'X';
  }

  return {
    id: id || `KLS-${String(index + 1).padStart(3, '0')}`,
    namaKelas: namaKelas || `Kelas ${index + 1}`,
    tingkat: tingkat,
    konsentrasiKeahlian: getRowVal(row, 'Konsentrasi_Keahlian', 'Konsentrasi Keahlian', 'konsentrasi_keahlian', 'konsentrasiKeahlian', 'Jurusan', 'jurusan') || '',
    waliKelas: getRowVal(row, 'Wali_Kelas', 'Wali Kelas', 'wali_kelas', 'waliKelas', 'Wali', 'wali') || '-'
  };
}

export function mapRowToMitra(row: any, index: number): MitraItem | null {
  if (!row) return null;
  const namaMitra = getRowVal(row, 'Nama_Mitra', 'Nama Mitra', 'namaMitra', 'Nama', 'nama', 'Instansi', 'DUDI');
  const id = getRowVal(row, 'ID_Mitra', 'id_mitra', 'ID Mitra', 'idMitra', 'ID', 'id') || `MTR-${String(index + 1).padStart(3, '0')}`;
  if (!namaMitra && !id) return null;

  return {
    id: id || `MTR-${String(index + 1).padStart(3, '0')}`,
    namaMitra: namaMitra || 'Mitra LENTERA',
    jenisMitra: (getRowVal(row, 'Jenis_Mitra', 'Jenis Mitra', 'jenis_mitra', 'jenisMitra', 'Jenis', 'jenis') || 'DUDI') as any,
    alamat: getRowVal(row, 'Alamat', 'alamat', 'Lokasi') || 'Bali',
    kontak: getRowVal(row, 'Kontak', 'kontak', 'Telepon', 'No_HP', 'Email') || '-',
    keterangan: getRowVal(row, 'Keterangan', 'keterangan', 'Deskripsi') || 'Mitra Kerja Sama'
  };
}

export function mapRowToPengaturan(row: any): Partial<PengaturanSekolah> | null {
  if (!row) return null;
  const namaSekolah = getRowVal(row, 'Nama_Sekolah', 'Nama Sekolah', 'namaSekolah', 'Sekolah');
  const kepalaSekolah = getRowVal(row, 'Kepala_Sekolah', 'Kepala Sekolah', 'kepalaSekolah', 'Kepsek');
  if (!namaSekolah && !kepalaSekolah) return null;

  return {
    namaSekolah: namaSekolah || undefined,
    alamat: getRowVal(row, 'Alamat', 'alamat') || undefined,
    kepalaSekolah: kepalaSekolah || undefined,
    nipKepalaSekolah: getRowVal(row, 'NIP_Kepala_Sekolah', 'NIP Kepala Sekolah', 'nipKepalaSekolah', 'NIP_Kepsek') || undefined,
    koordinatorLentera: getRowVal(row, 'Koordinator_Lentera', 'Koordinator Lentera', 'koordinatorLentera', 'Koordinator') || undefined,
    nipKoordinator: getRowVal(row, 'NIP_Koordinator', 'NIP Koordinator', 'nipKoordinator') || undefined,
    tahunPelajaran: getRowVal(row, 'Tahun_Pelajaran', 'Tahun Pelajaran', 'tahunPelajaran') || undefined,
    logo: getRowVal(row, 'Logo', 'logo', 'URL_Logo') || undefined,
    emailSekolah: getRowVal(row, 'Email_Sekolah', 'Email Sekolah', 'emailSekolah', 'Email') || undefined,
    websiteSekolah: getRowVal(row, 'Website_Sekolah', 'Website Sekolah', 'websiteSekolah', 'Website') || undefined
  };
}


const STORAGE_KEYS = {
  PENGATURAN: 'sim_lentera_pengaturan_v2',
  PROGRAM: 'sim_lentera_program_v2',
  PELAKSANAAN: 'sim_lentera_pelaksanaan_v2',
  DOKUMENTASI: 'sim_lentera_dokumentasi_v2',
  MONITORING: 'sim_lentera_monitoring_v2',
  EVALUASI_PEMANTAUAN: 'sim_lentera_evaluasi_pemantauan_v2',
  GURU: 'sim_lentera_guru_v2',
  SISWA: 'sim_lentera_siswa_v2',
  KELAS: 'sim_lentera_kelas_v2',
  MITRA: 'sim_lentera_mitra_v2',
  USER_SESSION: 'sim_lentera_session_v2'
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Listener notification error:', e);
    }
  });
}

export const StorageService = {
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // Inisialisasi Database
  initData() {
    // Bersihkan data program lama jika ada agar dimulai dari kosong
    ['sim_lentera_program_v1', 'sim_lentera_pelaksanaan_v1', 'sim_lentera_dokumentasi_v1', 'sim_lentera_monitoring_v1', 'sim_lentera_evaluasi_pemantauan_v1'].forEach(k => {
      try { localStorage.removeItem(k); } catch (_) {}
    });

    if (!localStorage.getItem(STORAGE_KEYS.PENGATURAN)) {
      localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(INITIAL_PENGATURAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROGRAM)) {
      localStorage.setItem(STORAGE_KEYS.PROGRAM, JSON.stringify(INITIAL_PROGRAMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PELAKSANAAN)) {
      localStorage.setItem(STORAGE_KEYS.PELAKSANAAN, JSON.stringify(INITIAL_PELAKSANAAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOKUMENTASI)) {
      localStorage.setItem(STORAGE_KEYS.DOKUMENTASI, JSON.stringify(INITIAL_DOKUMENTASI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MONITORING)) {
      localStorage.setItem(STORAGE_KEYS.MONITORING, JSON.stringify(INITIAL_MONITORING));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVALUASI_PEMANTAUAN)) {
      localStorage.setItem(STORAGE_KEYS.EVALUASI_PEMANTAUAN, JSON.stringify(INITIAL_EVALUASI_PEMANTAUAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GURU)) {
      localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(INITIAL_GURU));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SISWA)) {
      localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.KELAS)) {
      localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(INITIAL_KELAS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MITRA)) {
      localStorage.setItem(STORAGE_KEYS.MITRA, JSON.stringify(INITIAL_MITRA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_SESSION)) {
      const defaultUser: UserSession = {
        id: 'USR-001',
        nama: 'Dr. Drs. I Nyoman Suardika, M.Pd.',
        email: 'kepsek@smkn1balischool.sch.id',
        role: 'KEPALA_SEKOLAH',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      };
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(defaultUser));
    }
  },

  // Reset to default sample data
  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(INITIAL_PENGATURAN));
    localStorage.setItem(STORAGE_KEYS.PROGRAM, JSON.stringify(INITIAL_PROGRAMS));
    localStorage.setItem(STORAGE_KEYS.PELAKSANAAN, JSON.stringify(INITIAL_PELAKSANAAN));
    localStorage.setItem(STORAGE_KEYS.DOKUMENTASI, JSON.stringify(INITIAL_DOKUMENTASI));
    localStorage.setItem(STORAGE_KEYS.MONITORING, JSON.stringify(INITIAL_MONITORING));
    localStorage.setItem(STORAGE_KEYS.EVALUASI_PEMANTAUAN, JSON.stringify(INITIAL_EVALUASI_PEMANTAUAN));
    localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(INITIAL_GURU));
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(INITIAL_KELAS));
    localStorage.setItem(STORAGE_KEYS.MITRA, JSON.stringify(INITIAL_MITRA));
    notifyListeners();
  },

  // PENGATURAN
  getPengaturan(): PengaturanSekolah {
    const val = localStorage.getItem(STORAGE_KEYS.PENGATURAN);
    return val ? JSON.parse(val) : INITIAL_PENGATURAN;
  },

  savePengaturan(data: PengaturanSekolah) {
    const cleaned: PengaturanSekolah = {
      ...data,
      gasWebAppUrl: normalizeGasUrl(data.gasWebAppUrl)
    };
    localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(cleaned));
    notifyListeners();
    // Jika GAS Web App URL disetel, langsung tarik data dari Spreadsheet agar seketika tampil di aplikasi!
    if (cleaned.gasWebAppUrl) {
      this.syncToGas('savePengaturan', { data: cleaned });
      this.pullFromGas(cleaned.gasWebAppUrl);
    }
  },

  // USER SESSION
  getCurrentUser(): UserSession {
    const val = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    if (val) return JSON.parse(val);
    return {
      id: 'USR-001',
      nama: 'Dr. Drs. I Nyoman Suardika, M.Pd.',
      email: 'kepsek@smkn1balischool.sch.id',
      role: 'KEPALA_SEKOLAH'
    };
  },

  setCurrentUser(user: UserSession) {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(user));
    notifyListeners();
  },

  // PROGRAM CRUD
  getPrograms(): ProgramItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.PROGRAM);
    return val ? JSON.parse(val) : INITIAL_PROGRAMS;
  },

  generateProgramId(): string {
    const list = this.getPrograms();
    const currentYear = new Date().getFullYear();
    const count = list.length + 1;
    const pad = String(count).padStart(3, '0');
    return `PRG-${currentYear}-${pad}`;
  },

  saveProgram(program: ProgramItem): ProgramItem {
    const list = this.getPrograms();
    let savedItem: ProgramItem;
    const existingIndex = list.findIndex(p => p.id === program.id);

    if (existingIndex >= 0) {
      savedItem = { ...program, updatedAt: new Date().toISOString() };
      list[existingIndex] = savedItem;
    } else {
      savedItem = {
        ...program,
        id: program.id || this.generateProgramId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.unshift(savedItem);
    }

    localStorage.setItem(STORAGE_KEYS.PROGRAM, JSON.stringify(list));
    notifyListeners();

    // Sync to GAS jika ada
    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('saveProgram', {
        data: {
          'ID_Program': savedItem.id,
          'Nama_Program': savedItem.namaProgram,
          'Pilar': savedItem.pilar,
          'Pilar_Code': savedItem.pilarCode,
          'Deskripsi': savedItem.deskripsi,
          'Tujuan': savedItem.tujuan,
          'Sasaran': savedItem.sasaran,
          'Kelas': savedItem.kelas,
          'Bentuk_Pelaksanaan': savedItem.bentukPelaksanaan,
          'Integrasi_Kurikulum': savedItem.integrasiKurikulum,
          'Mapel_Terkait': savedItem.mapelTerkait,
          'Penanggung_Jawab': savedItem.penanggungJawab,
          'Tim_Pelaksana': savedItem.timPelaksana,
          'Mitra': savedItem.mitra,
          'Target': savedItem.target,
          'Indikator': savedItem.indikator,
          'Tanggal_Mulai': savedItem.tanggalMulai,
          'Tanggal_Selesai': savedItem.tanggalSelesai,
          'Anggaran': savedItem.anggaran,
          'Status': savedItem.status
        }
      });
    }

    return savedItem;
  },

  deleteProgram(id: string): { success: boolean; message?: string } {
    // Standard rule 8 & 10: Sistem mencegah penghapusan data utama apabila masih memiliki relasi dokumentasi atau pelaksanaan
    const pelaksanaans = this.getPelaksanaan().filter(p => p.idProgram === id);
    const dokumentasis = this.getDokumentasi().filter(d => d.idProgram === id);

    if (pelaksanaans.length > 0 || dokumentasis.length > 0) {
      return {
        success: false,
        message: `Program ini memiliki ${pelaksanaans.length} data pelaksanaan dan ${dokumentasis.length} dokumentasi. Hapus terlebih dahulu data terkait sebelum menghapus program.`
      };
    }

    const list = this.getPrograms().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROGRAM, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('deleteProgram', { id });
    }

    return { success: true };
  },

  // PELAKSANAAN CRUD
  getPelaksanaan(): PelaksanaanItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.PELAKSANAAN);
    return val ? JSON.parse(val) : INITIAL_PELAKSANAAN;
  },

  generatePelaksanaanId(): string {
    const list = this.getPelaksanaan();
    const currentYear = new Date().getFullYear();
    const count = list.length + 1;
    const pad = String(count).padStart(3, '0');
    return `PEL-${currentYear}-${pad}`;
  },

  savePelaksanaan(pelaksanaan: PelaksanaanItem): PelaksanaanItem {
    const list = this.getPelaksanaan();
    let savedItem: PelaksanaanItem;
    const existingIndex = list.findIndex(p => p.id === pelaksanaan.id);

    if (existingIndex >= 0) {
      savedItem = { ...pelaksanaan };
      list[existingIndex] = savedItem;
    } else {
      savedItem = {
        ...pelaksanaan,
        id: pelaksanaan.id || this.generatePelaksanaanId(),
        createdAt: new Date().toISOString()
      };
      list.unshift(savedItem);
    }

    localStorage.setItem(STORAGE_KEYS.PELAKSANAAN, JSON.stringify(list));

    // Update program status automatically if completed
    const programs = this.getPrograms();
    const prgIndex = programs.findIndex(p => p.id === savedItem.idProgram);
    if (prgIndex >= 0) {
      if (savedItem.status === 'Terlaksana Sempurna') {
        programs[prgIndex].status = 'Selesai';
        localStorage.setItem(STORAGE_KEYS.PROGRAM, JSON.stringify(programs));
      } else if (savedItem.status === 'Dalam Proses' || savedItem.status === 'Terlaksana Sebagian') {
        programs[prgIndex].status = 'Sedang Berjalan';
        localStorage.setItem(STORAGE_KEYS.PROGRAM, JSON.stringify(programs));
      }
    }

    notifyListeners();

    // Sync to GAS
    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('savePelaksanaan', {
        data: {
          'ID_Pelaksanaan': savedItem.id,
          'ID_Program': savedItem.idProgram,
          'Nama_Kegiatan': savedItem.namaKegiatan,
          'Pilar': savedItem.pilar,
          'Tanggal': savedItem.tanggal,
          'Waktu': savedItem.waktu,
          'Lokasi': savedItem.lokasi,
          'Penanggung_Jawab': savedItem.penanggungJawab,
          'Peserta': savedItem.peserta,
          'Jumlah_Peserta': savedItem.jumlahPeserta,
          'Uraian': savedItem.uraian,
          'Hasil': savedItem.hasil,
          'Capaian': savedItem.capaian,
          'Kendala': savedItem.kendala,
          'Solusi': savedItem.solusi,
          'Evaluasi': savedItem.evaluasi,
          'Status': savedItem.status
        }
      });
    }

    return savedItem;
  },

  deletePelaksanaan(id: string): { success: boolean; message?: string } {
    const docs = this.getDokumentasi().filter(d => d.idPelaksanaan === id);
    if (docs.length > 0) {
      return {
        success: false,
        message: `Pelaksanaan ini memiliki ${docs.length} file dokumentasi. Hapus terlebih dahulu file dokumentasi sebelum menghapus pelaksanaan kegiatan.`
      };
    }

    const list = this.getPelaksanaan().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PELAKSANAAN, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('deletePelaksanaan', { id });
    }

    return { success: true };
  },

  // DOKUMENTASI CRUD
  getDokumentasi(): DokumentasiItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.DOKUMENTASI);
    return val ? JSON.parse(val) : INITIAL_DOKUMENTASI;
  },

  generateDokumentasiId(): string {
    const list = this.getDokumentasi();
    const currentYear = new Date().getFullYear();
    const count = list.length + 1;
    const pad = String(count).padStart(3, '0');
    return `DOK-${currentYear}-${pad}`;
  },

  saveDokumentasi(doc: DokumentasiItem): DokumentasiItem {
    const list = this.getDokumentasi();
    const savedItem: DokumentasiItem = {
      ...doc,
      id: doc.id || this.generateDokumentasiId(),
      tanggalUpload: doc.tanggalUpload || new Date().toISOString().split('T')[0]
    };
    list.unshift(savedItem);
    localStorage.setItem(STORAGE_KEYS.DOKUMENTASI, JSON.stringify(list));
    notifyListeners();
    return savedItem;
  },

  deleteDokumentasi(id: string) {
    const list = this.getDokumentasi().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOKUMENTASI, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('deleteDokumentasi', { id });
    }
  },

  // MONITORING CRUD
  getMonitoring(): MonitoringItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.MONITORING);
    return val ? JSON.parse(val) : INITIAL_MONITORING;
  },

  calculateKategori(persentase: number): KategoriEvaluasi {
    if (persentase >= 85) return 'Sangat Baik';
    if (persentase >= 70) return 'Baik';
    if (persentase >= 55) return 'Cukup';
    return 'Perlu Perbaikan';
  },

  saveMonitoring(item: MonitoringItem): MonitoringItem {
    const list = this.getMonitoring();
    const existingIndex = list.findIndex(m => m.id === item.id);
    const calculatedKategori = this.calculateKategori(item.persentase);
    const updated = {
      ...item,
      kategori: calculatedKategori,
      id: item.id || `MON-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updated;
    } else {
      list.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.MONITORING, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('saveMonitoring', {
        data: {
          'ID_Monitoring': updated.id,
          'ID_Program': updated.idProgram,
          'Pilar': updated.pilar,
          'Tanggal_Evaluasi': updated.tanggalEvaluasi,
          'Target': updated.target,
          'Realisasi': updated.realisasi,
          'Persentase': updated.persentase,
          'Kategori': updated.kategori,
          'Kendala': updated.kendala,
          'Rekomendasi': updated.rekomendasi,
          'Evaluator': updated.evaluator
        }
      });
    }

    return updated;
  },

  deleteMonitoring(id: string) {
    const list = this.getMonitoring().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MONITORING, JSON.stringify(list));
    notifyListeners();
  },

  // EVALUASI & PEMANTAUAN KEGIATAN CRUD
  getEvaluasiPemantauan(): EvaluasiPemantauanItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.EVALUASI_PEMANTAUAN);
    return val ? JSON.parse(val) : INITIAL_EVALUASI_PEMANTAUAN;
  },

  generateEvaluasiId(): string {
    const list = this.getEvaluasiPemantauan();
    const currentYear = new Date().getFullYear();
    const count = list.length + 1;
    const pad = String(count).padStart(3, '0');
    return `EVL-${currentYear}-${pad}`;
  },

  saveEvaluasiPemantauan(item: EvaluasiPemantauanItem): EvaluasiPemantauanItem {
    const list = this.getEvaluasiPemantauan();
    const existingIndex = list.findIndex(e => e.id === item.id);
    const updated: EvaluasiPemantauanItem = {
      ...item,
      id: item.id || this.generateEvaluasiId(),
      createdAt: item.createdAt || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updated;
    } else {
      list.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.EVALUASI_PEMANTAUAN, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('saveEvaluasiPemantauan', {
        data: updated
      });
    }

    return updated;
  },

  deleteEvaluasiPemantauan(id: string) {
    const list = this.getEvaluasiPemantauan().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVALUASI_PEMANTAUAN, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('deleteEvaluasiPemantauan', { id });
    }
  },

  // MASTER DATA: GURU, SISWA, KELAS, MITRA
  getGuru(): GuruItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.GURU);
    return val ? JSON.parse(val) : INITIAL_GURU;
  },

  saveGuru(item: GuruItem) {
    const list = this.getGuru();
    const idx = list.findIndex(g => g.id === item.id);
    const updated = { ...item, id: item.id || `GRU-${String(list.length + 1).padStart(3, '0')}` };
    if (idx >= 0) list[idx] = updated;
    else list.push(updated);
    localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('saveMaster', {
        sheetName: 'GURU',
        idColumn: 'ID_Guru',
        data: {
          'ID_Guru': updated.id,
          'Nama_Guru': updated.namaGuru,
          'NIP': updated.nip,
          'Jabatan': updated.jabatan,
          'Mata_Pelajaran': updated.mataPelajaran,
          'Email': updated.email,
          'Status': updated.status
        }
      });
    }
  },

  deleteGuru(id: string) {
    const list = this.getGuru().filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('deleteMaster', { sheetName: 'GURU', idColumn: 'ID_Guru', id });
    }
  },

  getSiswa(): SiswaItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.SISWA);
    return val ? JSON.parse(val) : INITIAL_SISWA;
  },

  saveSiswa(item: SiswaItem) {
    const list = this.getSiswa();
    const idx = list.findIndex(s => s.id === item.id);
    const updated = { ...item, id: item.id || `SIS-${String(list.length + 1).padStart(3, '0')}` };
    if (idx >= 0) list[idx] = updated;
    else list.push(updated);
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('saveMaster', {
        sheetName: 'SISWA',
        idColumn: 'ID_Siswa',
        data: {
          'ID_Siswa': updated.id,
          'Nama_Siswa': updated.namaSiswa,
          'NISN': updated.nisn,
          'Kelas': updated.kelas,
          'Konsentrasi_Keahlian': updated.konsentrasiKeahlian,
          'Status': updated.status
        }
      });
    }
  },

  deleteSiswa(id: string) {
    const list = this.getSiswa().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('deleteMaster', { sheetName: 'SISWA', idColumn: 'ID_Siswa', id });
    }
  },

  getKelas(): KelasItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.KELAS);
    return val ? JSON.parse(val) : INITIAL_KELAS;
  },

  saveKelas(item: KelasItem) {
    const list = this.getKelas();
    const idx = list.findIndex(k => k.id === item.id);
    const updated = { ...item, id: item.id || `KLS-${String(list.length + 1).padStart(3, '0')}` };
    if (idx >= 0) list[idx] = updated;
    else list.push(updated);
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('saveMaster', {
        sheetName: 'KELAS',
        idColumn: 'ID_Kelas',
        data: {
          'ID_Kelas': updated.id,
          'Nama_Kelas': updated.namaKelas,
          'Tingkat': updated.tingkat,
          'Konsentrasi_Keahlian': updated.konsentrasiKeahlian,
          'Wali_Kelas': updated.waliKelas
        }
      });
    }
  },

  deleteKelas(id: string) {
    const list = this.getKelas().filter(k => k.id !== id);
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('deleteMaster', { sheetName: 'KELAS', idColumn: 'ID_Kelas', id });
    }
  },

  getMitra(): MitraItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.MITRA);
    return val ? JSON.parse(val) : INITIAL_MITRA;
  },

  saveMitra(item: MitraItem) {
    const list = this.getMitra();
    const idx = list.findIndex(m => m.id === item.id);
    const updated = { ...item, id: item.id || `MTR-${String(list.length + 1).padStart(3, '0')}` };
    if (idx >= 0) list[idx] = updated;
    else list.push(updated);
    localStorage.setItem(STORAGE_KEYS.MITRA, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('saveMaster', {
        sheetName: 'MITRA',
        idColumn: 'ID_Mitra',
        data: {
          'ID_Mitra': updated.id,
          'Nama_Mitra': updated.namaMitra,
          'Jenis_Mitra': updated.jenisMitra,
          'Alamat': updated.alamat,
          'Kontak': updated.kontak,
          'Keterangan': updated.keterangan
        }
      });
    }
  },

  deleteMitra(id: string) {
    const list = this.getMitra().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MITRA, JSON.stringify(list));
    notifyListeners();

    const cfg = this.getPengaturan();
    if (cfg.gasWebAppUrl) {
      this.syncToGas('deleteMaster', { sheetName: 'MITRA', idColumn: 'ID_Mitra', id });
    }
  },

  // BACKUP & RESTORE JSON
  exportAllDataAsJson(): string {
    const payload = {
      pengaturan: this.getPengaturan(),
      program: this.getPrograms(),
      pelaksanaan: this.getPelaksanaan(),
      dokumentasi: this.getDokumentasi(),
      monitoring: this.getMonitoring(),
      evaluasiPemantauan: this.getEvaluasiPemantauan(),
      guru: this.getGuru(),
      siswa: this.getSiswa(),
      kelas: this.getKelas(),
      mitra: this.getMitra(),
      exportedAt: new Date().toISOString(),
      appName: 'SIM LENTERA Bali'
    };
    return JSON.stringify(payload, null, 2);
  },

  importDataFromJson(jsonStr: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (data.pengaturan) localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(data.pengaturan));
      if (data.program) localStorage.setItem(STORAGE_KEYS.PROGRAM, JSON.stringify(data.program));
      if (data.pelaksanaan) localStorage.setItem(STORAGE_KEYS.PELAKSANAAN, JSON.stringify(data.pelaksanaan));
      if (data.dokumentasi) localStorage.setItem(STORAGE_KEYS.DOKUMENTASI, JSON.stringify(data.dokumentasi));
      if (data.monitoring) localStorage.setItem(STORAGE_KEYS.MONITORING, JSON.stringify(data.monitoring));
      if (data.evaluasiPemantauan) localStorage.setItem(STORAGE_KEYS.EVALUASI_PEMANTAUAN, JSON.stringify(data.evaluasiPemantauan));
      if (data.guru) localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(data.guru));
      if (data.siswa) localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(data.siswa));
      if (data.kelas) localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(data.kelas));
      if (data.mitra) localStorage.setItem(STORAGE_KEYS.MITRA, JSON.stringify(data.mitra));
      notifyListeners();
      return { success: true, message: 'Data SIM LENTERA berhasil dipulihkan dari file backup.' };
    } catch (e: any) {
      return { success: false, message: 'Format file JSON tidak valid: ' + e.message };
    }
  },

  // STATUS SINKRONISASI GAS
  _isSyncing: false,
  isSyncing(): boolean {
    return this._isSyncing;
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem('sim_lentera_last_gas_sync');
  },

  // TARIK SELURUH DATA DARI GOOGLE APPS SCRIPT SPREADSHEET
  async pullFromGas(customUrl?: string): Promise<{ success: boolean; message: string; count?: any }> {
    const cfg = this.getPengaturan();
    const rawUrl = customUrl || cfg.gasWebAppUrl;
    if (!rawUrl) {
      return { success: false, message: 'Google Apps Script Web App URL belum diatur.' };
    }

    const url = normalizeGasUrl(rawUrl);
    this._isSyncing = true;
    notifyListeners();

    try {
      let rawData: any = null;

      // Jalur 1: Menggunakan server proxy lokal /api/gas/fetch (Anti-CORS & follow 302 redirect)
      try {
        const proxyRes = await fetch('/api/gas/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (proxyRes.ok) {
          const json = await proxyRes.json();
          if (json.success && json.data) {
            rawData = json.data;
          }
        }
      } catch (proxyErr) {
        console.warn('Proxy fetch failed, mencoba direct client fetch:', proxyErr);
      }

      // Jalur 2: Direct fetch browser jika proxy tidak merespon
      if (!rawData) {
        const targetUrl = url.includes('?') ? `${url}&action=getAllData` : `${url}?action=getAllData`;
        const directRes = await fetch(targetUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (directRes.ok) {
          const json = await directRes.json();
          rawData = json.data || json;
        }
      }

      if (!rawData) {
        throw new Error('Tidak ada respon data yang valid dari Google Apps Script Web App');
      }

      let prgCount = 0;
      let pelCount = 0;
      let docCount = 0;
      let evlCount = 0;
      let monCount = 0;
      let gruCount = 0;
      let sisCount = 0;
      let klsCount = 0;
      let mtrCount = 0;

      // 1. Sinkronisasi PROGRAM
      const programRows = findSheetData(rawData, 'PROGRAM', 'Program', 'program', 'Data_Program', 'Data Program', 'Perencanaan');
      if (Array.isArray(programRows) && programRows.length > 0) {
        const mappedPrograms = programRows
          .map((r: any, i: number) => mapRowToProgram(r, i))
          .filter((p: any): p is ProgramItem => p !== null && Boolean(p.namaProgram || p.id));
        
        if (mappedPrograms.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PROGRAM, JSON.stringify(mappedPrograms));
          prgCount = mappedPrograms.length;
        }
      }

      // 2. Sinkronisasi PELAKSANAAN
      const pelRows = findSheetData(rawData, 'PELAKSANAAN', 'Pelaksanaan', 'pelaksanaan', 'Data_Pelaksanaan', 'Realisasi');
      if (Array.isArray(pelRows) && pelRows.length > 0) {
        const mappedPelaksanaans = pelRows
          .map((r: any, i: number) => mapRowToPelaksanaan(r, i))
          .filter((p: any): p is PelaksanaanItem => p !== null && Boolean(p.namaKegiatan || p.id));
        
        if (mappedPelaksanaans.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PELAKSANAAN, JSON.stringify(mappedPelaksanaans));
          pelCount = mappedPelaksanaans.length;
        }
      }

      // 3. Sinkronisasi DOKUMENTASI
      const docRows = findSheetData(rawData, 'DOKUMENTASI', 'Dokumentasi', 'dokumentasi', 'Galeri', 'Foto');
      if (Array.isArray(docRows) && docRows.length > 0) {
        const mappedDocs = docRows
          .map((r: any, i: number) => mapRowToDokumentasi(r, i))
          .filter((d: any): d is DokumentasiItem => d !== null && Boolean(d.urlDrive || d.namaFile));
        
        if (mappedDocs.length > 0) {
          localStorage.setItem(STORAGE_KEYS.DOKUMENTASI, JSON.stringify(mappedDocs));
          docCount = mappedDocs.length;
        }
      }

      // 4. Sinkronisasi EVALUASI_PEMANTAUAN
      const evlRows = findSheetData(rawData, 'EVALUASI_PEMANTAUAN', 'Evaluasi_Pemantauan', 'evaluasi_pemantauan', 'EVALUASI', 'Evaluasi', 'evaluasi', 'Pemantauan');
      if (Array.isArray(evlRows) && evlRows.length > 0) {
        const mappedEvals = evlRows
          .map((r: any, i: number) => mapRowToEvaluasi(r, i))
          .filter((e: any): e is EvaluasiPemantauanItem => e !== null && Boolean(e.jenisKegiatan || e.id));
        
        if (mappedEvals.length > 0) {
          localStorage.setItem(STORAGE_KEYS.EVALUASI_PEMANTAUAN, JSON.stringify(mappedEvals));
          evlCount = mappedEvals.length;
        }
      }

      // 5. Sinkronisasi MONITORING
      const monRows = findSheetData(rawData, 'MONITORING', 'Monitoring', 'monitoring');
      if (Array.isArray(monRows) && monRows.length > 0) {
        const mappedMon = monRows
          .map((r: any, i: number) => mapRowToMonitoring(r, i))
          .filter((m: any): m is MonitoringItem => m !== null && Boolean(m.target || m.id));
        
        if (mappedMon.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MONITORING, JSON.stringify(mappedMon));
          monCount = mappedMon.length;
        }
      }

      // 6. Sinkronisasi GURU (Data Guru/Pegawai)
      const guruRows = findSheetData(rawData, 'GURU', 'Guru', 'guru', 'Data_Guru', 'Data Guru', 'Pegawai', 'Daftar Guru');
      if (Array.isArray(guruRows) && guruRows.length > 0) {
        const mappedGurus = guruRows
          .map((r: any, i: number) => mapRowToGuru(r, i))
          .filter((g: any): g is GuruItem => g !== null && Boolean(g.namaGuru || g.nip));
        
        if (mappedGurus.length > 0) {
          localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(mappedGurus));
          gruCount = mappedGurus.length;
        }
      }

      // 7. Sinkronisasi SISWA (Data Peserta Didik)
      const siswaRows = findSheetData(rawData, 'SISWA', 'Siswa', 'siswa', 'Data_Siswa', 'Data Siswa', 'Murid', 'Peserta Didik');
      if (Array.isArray(siswaRows) && siswaRows.length > 0) {
        const mappedSiswas = siswaRows
          .map((r: any, i: number) => mapRowToSiswa(r, i))
          .filter((s: any): s is SiswaItem => s !== null && Boolean(s.namaSiswa || s.nisn));
        
        if (mappedSiswas.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(mappedSiswas));
          sisCount = mappedSiswas.length;
        }
      }

      // 8. Sinkronisasi KELAS (Data Rombel)
      const kelasRows = findSheetData(rawData, 'KELAS', 'Kelas', 'kelas', 'Data_Kelas', 'Data Kelas', 'Rombel');
      if (Array.isArray(kelasRows) && kelasRows.length > 0) {
        const mappedKelases = kelasRows
          .map((r: any, i: number) => mapRowToKelas(r, i))
          .filter((k: any): k is KelasItem => k !== null && Boolean(k.namaKelas));
        
        if (mappedKelases.length > 0) {
          localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(mappedKelases));
          klsCount = mappedKelases.length;
        }
      }

      // 9. Sinkronisasi MITRA (Data Mitra Industri/DUDI)
      const mitraRows = findSheetData(rawData, 'MITRA', 'Mitra', 'mitra', 'Data_Mitra', 'Data Mitra', 'DUDI');
      if (Array.isArray(mitraRows) && mitraRows.length > 0) {
        const mappedMitras = mitraRows
          .map((r: any, i: number) => mapRowToMitra(r, i))
          .filter((m: any): m is MitraItem => m !== null && Boolean(m.namaMitra));
        
        if (mappedMitras.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MITRA, JSON.stringify(mappedMitras));
          mtrCount = mappedMitras.length;
        }
      }

      // 10. Sinkronisasi PENGATURAN (Profil Sekolah)
      const pengaturanRows = findSheetData(rawData, 'PENGATURAN', 'Pengaturan', 'pengaturan', 'Sekolah', 'Profil Sekolah');
      if (Array.isArray(pengaturanRows) && pengaturanRows.length > 0) {
        const parsedSetting = mapRowToPengaturan(pengaturanRows[0]);
        if (parsedSetting) {
          const current = this.getPengaturan();
          const merged: PengaturanSekolah = {
            ...current,
            ...Object.fromEntries(Object.entries(parsedSetting).filter(([_, v]) => v !== undefined && v !== ''))
          };
          if (!merged.gasWebAppUrl) merged.gasWebAppUrl = url;
          localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(merged));
        }
      }

      // 11. Simpan waktu sinkronisasi terakhir
      const nowIso = new Date().toISOString();
      localStorage.setItem('sim_lentera_last_gas_sync', nowIso);

      notifyListeners();

      const totalPulled = prgCount + pelCount + docCount + evlCount + monCount + gruCount + sisCount + klsCount + mtrCount;
      const parts: string[] = [];
      if (prgCount > 0) parts.push(`${prgCount} program`);
      if (pelCount > 0) parts.push(`${pelCount} pelaksanaan`);
      if (docCount > 0) parts.push(`${docCount} dokumentasi`);
      if (evlCount > 0) parts.push(`${evlCount} evaluasi`);
      if (gruCount > 0) parts.push(`${gruCount} guru`);
      if (sisCount > 0) parts.push(`${sisCount} siswa`);
      if (klsCount > 0) parts.push(`${klsCount} kelas`);
      if (mtrCount > 0) parts.push(`${mtrCount} mitra`);

      const message = totalPulled > 0
        ? `Sinkronisasi berhasil! Data dari Google Spreadsheet telah dimuat (${parts.join(', ')}).`
        : `Sinkronisasi terhubung ke Google Apps Script, data telah diperbarui.`;

      return {
        success: true,
        message,
        count: {
          programs: prgCount,
          pelaksanaans: pelCount,
          dokumentasis: docCount,
          evaluasis: evlCount,
          monitorings: monCount,
          gurus: gruCount,
          siswas: sisCount,
          kelases: klsCount,
          mitras: mtrCount,
          total: totalPulled
        }
      };
    } catch (error: any) {
      console.error('Error saat menarik data dari GAS:', error);
      return {
        success: false,
        message: 'Gagal menarik data dari Google Apps Script: ' + (error.message || error)
      };
    } finally {
      this._isSyncing = false;
      notifyListeners();
    }
  },

  // GAS CLOUD SYNC (POST ACTION)
  async syncToGas(action: string, payload: any) {
    const cfg = this.getPengaturan();
    if (!cfg.gasWebAppUrl) return null;
    const url = normalizeGasUrl(cfg.gasWebAppUrl);
    
    // Coba via server proxy terlebih dahulu
    try {
      const response = await fetch('/api/gas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, action, payload })
      });
      if (response.ok) {
        const res = await response.json();
        return res.data || res;
      }
    } catch (e) {
      console.warn('Proxy sync failed, mencoba direct:', e);
    }

    // Fallback direct POST
    try {
      const directResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...payload })
      });
      return await directResponse.json();
    } catch (err) {
      console.warn('Sync to GAS deferred or failed network:', err);
      return null;
    }
  },

  // UJI KONEKSI KE GOOGLE SPREADSHEET
  async testGasConnection(url: string): Promise<{ success: boolean; message: string }> {
    const cleanUrl = normalizeGasUrl(url);
    if (!cleanUrl) {
      return { success: false, message: 'URL Google Apps Script tidak boleh kosong.' };
    }

    // Coba melalui server proxy
    try {
      const proxyRes = await fetch('/api/gas/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.success) {
          return {
            success: true,
            message: 'Koneksi berhasil! Backend Google Apps Script terhubung dengan Google Spreadsheet.'
          };
        }
      }
    } catch (e) {
      console.warn('Proxy test failed, mencoba direct:', e);
    }

    // Direct fetch fallback
    try {
      const res = await fetch(`${cleanUrl}?action=initDatabase`, {
        method: 'GET',
        mode: 'cors'
      });
      const data = await res.json();
      if (data.status === 'success') {
        return { success: true, message: 'Terhubung ke Google Spreadsheet! ' + (data.message || '') };
      }
      return { success: false, message: data.message || 'Gagal merespon status success' };
    } catch (err: any) {
      return {
        success: false,
        message: 'Koneksi gagal atau izin akses belum "Anyone". Pastikan saat Deploy disetel "Who has access: Anyone". Detail: ' + err.message
      };
    }
  }
};
