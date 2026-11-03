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

// Mappers dari Baris Spreadsheet ke Model Aplikasi
export function mapRowToProgram(row: any, index: number): ProgramItem | null {
  if (!row) return null;
  const id = row['ID_Program'] || row['id_program'] || row['ID'] || row['id'] || `PRG-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`;
  const namaProgram = row['Nama_Program'] || row['nama_program'] || row['Nama Program'] || row['namaProgram'] || row['Nama'] || row['nama'] || '';
  if (!namaProgram && !id) return null;

  const pilar = String(row['Pilar'] || row['pilar'] || 'L — Literasi dan Numerasi');
  const pilarCode = (row['Pilar_Code'] || row['pilar_code'] || row['pilarCode'] || detectPilarCode(pilar)) as PilarCode;

  return {
    id: String(id),
    namaProgram: String(namaProgram || 'Program LENTERA'),
    pilar: pilar,
    pilarCode: pilarCode,
    deskripsi: String(row['Deskripsi'] || row['deskripsi'] || ''),
    tujuan: String(row['Tujuan'] || row['tujuan'] || ''),
    sasaran: String(row['Sasaran'] || row['sasaran'] || 'Seluruh Siswa'),
    kelas: String(row['Kelas'] || row['kelas'] || 'Semua Tingkat'),
    bentukPelaksanaan: String(row['Bentuk_Pelaksanaan'] || row['Bentuk Pelaksanaan'] || row['bentukPelaksanaan'] || 'Kokurikuler'),
    integrasiKurikulum: (row['Integrasi_Kurikulum'] || row['integrasi_kurikulum'] || row['integrasiKurikulum'] || 'Kokurikuler') as any,
    mapelTerkait: String(row['Mapel_Terkait'] || row['mapel_terkait'] || row['Mapel Terkait'] || row['mapelTerkait'] || ''),
    penanggungJawab: String(row['Penanggung_Jawab'] || row['penanggung_jawab'] || row['Penanggung Jawab'] || row['penanggungJawab'] || 'Koordinator LENTERA'),
    timPelaksana: String(row['Tim_Pelaksana'] || row['tim_pelaksana'] || row['Tim Pelaksana'] || row['timPelaksana'] || ''),
    mitra: String(row['Mitra'] || row['mitra'] || ''),
    target: String(row['Target'] || row['target'] || '100% siswa tuntas'),
    indikator: String(row['Indikator'] || row['indikator'] || ''),
    waktuPelaksanaan: String(row['Waktu_Pelaksanaan'] || row['Waktu Pelaksanaan'] || row['waktuPelaksanaan'] || 'Semester Ganjil & Genap'),
    tanggalMulai: cleanDate(row['Tanggal_Mulai'] || row['tanggal_mulai'] || row['Tanggal Mulai'] || row['tanggalMulai'], '2026-07-15'),
    tanggalSelesai: cleanDate(row['Tanggal_Selesai'] || row['tanggal_selesai'] || row['Tanggal Selesai'] || row['tanggalSelesai'], '2026-12-15'),
    anggaran: Number(row['Anggaran'] || row['anggaran'] || 0),
    status: (row['Status'] || row['status'] || 'Direncanakan') as any,
    createdAt: row['CreatedAt'] || row['createdAt'] || new Date().toISOString(),
    updatedAt: row['UpdatedAt'] || row['updatedAt'] || new Date().toISOString()
  };
}

export function mapRowToPelaksanaan(row: any, index: number): PelaksanaanItem | null {
  if (!row) return null;
  const id = row['ID_Pelaksanaan'] || row['id_pelaksanaan'] || row['ID'] || row['id'] || `PEL-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`;
  const namaKegiatan = row['Nama_Kegiatan'] || row['nama_kegiatan'] || row['Nama Kegiatan'] || row['namaKegiatan'] || '';
  if (!namaKegiatan && !id) return null;

  const pilar = String(row['Pilar'] || row['pilar'] || '');
  const pilarCode = (row['Pilar_Code'] || row['pilar_code'] || row['pilarCode'] || detectPilarCode(pilar)) as PilarCode;

  return {
    id: String(id),
    idProgram: String(row['ID_Program'] || row['id_program'] || row['idProgram'] || ''),
    namaKegiatan: String(namaKegiatan || 'Realisasi Kegiatan LENTERA'),
    pilar: pilar,
    pilarCode: pilarCode,
    tanggal: cleanDate(row['Tanggal'] || row['tanggal'], '2026-08-01'),
    waktu: String(row['Waktu'] || row['waktu'] || '08:00 - 12:00 WITA'),
    lokasi: String(row['Lokasi'] || row['lokasi'] || 'Lingkungan Sekolah'),
    penanggungJawab: String(row['Penanggung_Jawab'] || row['penanggung_jawab'] || row['Penanggung Jawab'] || row['penanggungJawab'] || 'Guru Pembina'),
    peserta: String(row['Peserta'] || row['peserta'] || 'Siswa & Guru'),
    jumlahPeserta: Number(row['Jumlah_Peserta'] || row['jumlah_peserta'] || row['Jumlah Peserta'] || row['jumlahPeserta'] || 0),
    uraian: String(row['Uraian'] || row['uraian'] || ''),
    hasil: String(row['Hasil'] || row['hasil'] || ''),
    capaian: String(row['Capaian'] || row['capaian'] || ''),
    kendala: String(row['Kendala'] || row['kendala'] || ''),
    solusi: String(row['Solusi'] || row['solusi'] || ''),
    evaluasi: String(row['Evaluasi'] || row['evaluasi'] || ''),
    status: (row['Status'] || row['status'] || 'Selesai') as any,
    createdAt: row['CreatedAt'] || row['createdAt'] || new Date().toISOString()
  };
}

export function mapRowToDokumentasi(row: any, index: number): DokumentasiItem | null {
  if (!row) return null;
  const id = row['ID_Dokumentasi'] || row['id_dokumentasi'] || row['ID'] || row['id'] || `DOK-${String(index + 1).padStart(3, '0')}`;
  const urlDrive = row['URL_Drive'] || row['url_drive'] || row['URL Drive'] || row['urlDrive'] || '';
  if (!urlDrive && !row['Nama_File'] && !row['nama_file']) return null;

  return {
    id: String(id),
    idProgram: String(row['ID_Program'] || row['id_program'] || row['idProgram'] || ''),
    idPelaksanaan: String(row['ID_Pelaksanaan'] || row['id_pelaksanaan'] || row['idPelaksanaan'] || ''),
    namaFile: String(row['Nama_File'] || row['nama_file'] || row['Nama File'] || row['namaFile'] || 'Dokumentasi Kegiatan'),
    jenisFile: (row['Jenis_File'] || row['jenis_file'] || row['Jenis File'] || row['jenisFile'] || 'image') as any,
    urlDrive: String(urlDrive),
    tanggalUpload: cleanDate(row['Tanggal_Upload'] || row['tanggal_upload'] || row['Tanggal Upload'] || row['tanggalUpload'], new Date().toISOString().split('T')[0]),
    keterangan: String(row['Keterangan'] || row['keterangan'] || ''),
    pengunggah: String(row['Pengunggah'] || row['pengunggah'] || 'Tim Dokumentasi')
  };
}

export function mapRowToEvaluasi(row: any, index: number): EvaluasiPemantauanItem | null {
  if (!row) return null;
  const id = row['ID_Evaluasi'] || row['id_evaluasi'] || row['ID'] || row['id'] || `EVL-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`;
  const jenisKegiatan = row['Jenis_Kegiatan'] || row['jenis_kegiatan'] || row['Jenis Kegiatan'] || row['jenisKegiatan'] || '';
  if (!jenisKegiatan && !id) return null;

  const pilar = String(row['Pilar'] || row['pilar'] || 'L — Literasi dan Numerasi');
  const pilarCode = (row['Pilar_Code'] || row['pilar_code'] || row['pilarCode'] || detectPilarCode(pilar)) as PilarCode;

  return {
    id: String(id),
    jenisKegiatan: String(jenisKegiatan),
    idProgram: String(row['ID_Program'] || row['id_program'] || row['idProgram'] || ''),
    pilar: pilar,
    pilarCode: pilarCode,
    tanggalPemantauan: cleanDate(row['Tanggal_Pemantauan'] || row['tanggal_pemantauan'] || row['Tanggal Pemantauan'] || row['tanggalPemantauan'], new Date().toISOString().split('T')[0]),
    pemantau: String(row['Pemantau'] || row['pemantau'] || 'Kepala Sekolah'),
    hasilPemantauan: (row['Hasil_Pemantauan'] || row['hasil_pemantauan'] || row['Hasil Pemantauan'] || row['hasilPemantauan'] || 'Baik') as any,
    keterangan: String(row['Keterangan'] || row['keterangan'] || ''),
    tindakLanjutSaran: String(row['Tindak_Lanjut'] || row['tindak_lanjut'] || row['Tindak Lanjut'] || row['tindakLanjutSaran'] || ''),
    createdAt: row['CreatedAt'] || row['createdAt'] || new Date().toISOString()
  };
}

export function mapRowToMonitoring(row: any, index: number): MonitoringItem | null {
  if (!row) return null;
  const id = row['ID_Monitoring'] || row['id_monitoring'] || row['ID'] || row['id'] || `MON-${String(index + 1).padStart(3, '0')}`;
  const pilar = String(row['Pilar'] || row['pilar'] || '');
  return {
    id: String(id),
    idProgram: String(row['ID_Program'] || row['id_program'] || row['idProgram'] || ''),
    namaProgram: String(row['Nama_Program'] || row['Nama Program'] || row['namaProgram'] || 'Program LENTERA'),
    pilar: pilar,
    pilarCode: detectPilarCode(pilar),
    tanggalEvaluasi: cleanDate(row['Tanggal_Evaluasi'] || row['tanggal_evaluasi'] || row['Tanggal Evaluasi'] || row['tanggalEvaluasi']),
    target: String(row['Target'] || row['target'] || ''),
    realisasi: String(row['Realisasi'] || row['realisasi'] || ''),
    persentase: Number(row['Persentase'] || row['persentase'] || 0),
    kategori: (row['Kategori'] || row['kategori'] || 'Baik') as any,
    kendala: String(row['Kendala'] || row['kendala'] || ''),
    rekomendasi: String(row['Rekomendasi'] || row['rekomendasi'] || ''),
    evaluator: String(row['Evaluator'] || row['evaluator'] || 'Tim Penjamin Mutu'),
    status: String(row['Status'] || row['status'] || 'Selesai')
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
    if (idx >= 0) list[idx] = item;
    else list.push({ ...item, id: item.id || `GRU-${String(list.length + 1).padStart(3, '0')}` });
    localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(list));
    notifyListeners();
  },

  deleteGuru(id: string) {
    const list = this.getGuru().filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(list));
    notifyListeners();
  },

  getSiswa(): SiswaItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.SISWA);
    return val ? JSON.parse(val) : INITIAL_SISWA;
  },

  saveSiswa(item: SiswaItem) {
    const list = this.getSiswa();
    const idx = list.findIndex(s => s.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push({ ...item, id: item.id || `SIS-${String(list.length + 1).padStart(3, '0')}` });
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(list));
    notifyListeners();
  },

  deleteSiswa(id: string) {
    const list = this.getSiswa().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(list));
    notifyListeners();
  },

  getKelas(): KelasItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.KELAS);
    return val ? JSON.parse(val) : INITIAL_KELAS;
  },

  saveKelas(item: KelasItem) {
    const list = this.getKelas();
    const idx = list.findIndex(k => k.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push({ ...item, id: item.id || `KLS-${String(list.length + 1).padStart(3, '0')}` });
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(list));
    notifyListeners();
  },

  deleteKelas(id: string) {
    const list = this.getKelas().filter(k => k.id !== id);
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(list));
    notifyListeners();
  },

  getMitra(): MitraItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.MITRA);
    return val ? JSON.parse(val) : INITIAL_MITRA;
  },

  saveMitra(item: MitraItem) {
    const list = this.getMitra();
    const idx = list.findIndex(m => m.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push({ ...item, id: item.id || `MTR-${String(list.length + 1).padStart(3, '0')}` });
    localStorage.setItem(STORAGE_KEYS.MITRA, JSON.stringify(list));
    notifyListeners();
  },

  deleteMitra(id: string) {
    const list = this.getMitra().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MITRA, JSON.stringify(list));
    notifyListeners();
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

      // 1. Sinkronisasi PROGRAM
      const programRows = rawData.PROGRAM || rawData.Program || rawData.program;
      if (Array.isArray(programRows)) {
        const mappedPrograms = programRows
          .map((r: any, i: number) => mapRowToProgram(r, i))
          .filter((p: any): p is ProgramItem => p !== null && Boolean(p.namaProgram || p.id));
        
        if (mappedPrograms.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PROGRAM, JSON.stringify(mappedPrograms));
          prgCount = mappedPrograms.length;
        }
      }

      // 2. Sinkronisasi PELAKSANAAN
      const pelRows = rawData.PELAKSANAAN || rawData.Pelaksanaan || rawData.pelaksanaan;
      if (Array.isArray(pelRows)) {
        const mappedPelaksanaans = pelRows
          .map((r: any, i: number) => mapRowToPelaksanaan(r, i))
          .filter((p: any): p is PelaksanaanItem => p !== null && Boolean(p.namaKegiatan || p.id));
        
        if (mappedPelaksanaans.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PELAKSANAAN, JSON.stringify(mappedPelaksanaans));
          pelCount = mappedPelaksanaans.length;
        }
      }

      // 3. Sinkronisasi DOKUMENTASI
      const docRows = rawData.DOKUMENTASI || rawData.Dokumentasi || rawData.dokumentasi;
      if (Array.isArray(docRows)) {
        const mappedDocs = docRows
          .map((r: any, i: number) => mapRowToDokumentasi(r, i))
          .filter((d: any): d is DokumentasiItem => d !== null && Boolean(d.urlDrive || d.namaFile));
        
        if (mappedDocs.length > 0) {
          localStorage.setItem(STORAGE_KEYS.DOKUMENTASI, JSON.stringify(mappedDocs));
          docCount = mappedDocs.length;
        }
      }

      // 4. Sinkronisasi EVALUASI_PEMANTAUAN
      const evlRows = rawData.EVALUASI_PEMANTAUAN || rawData.Evaluasi_Pemantauan || rawData.evaluasi_pemantauan || rawData.EVALUASI;
      if (Array.isArray(evlRows)) {
        const mappedEvals = evlRows
          .map((r: any, i: number) => mapRowToEvaluasi(r, i))
          .filter((e: any): e is EvaluasiPemantauanItem => e !== null && Boolean(e.jenisKegiatan || e.id));
        
        if (mappedEvals.length > 0) {
          localStorage.setItem(STORAGE_KEYS.EVALUASI_PEMANTAUAN, JSON.stringify(mappedEvals));
          evlCount = mappedEvals.length;
        }
      }

      // 5. Sinkronisasi MONITORING
      const monRows = rawData.MONITORING || rawData.Monitoring || rawData.monitoring;
      if (Array.isArray(monRows)) {
        const mappedMon = monRows
          .map((r: any, i: number) => mapRowToMonitoring(r, i))
          .filter((m: any): m is MonitoringItem => m !== null && Boolean(m.target || m.id));
        
        if (mappedMon.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MONITORING, JSON.stringify(mappedMon));
        }
      }

      // 6. Simpan waktu sinkronisasi terakhir
      const nowIso = new Date().toISOString();
      localStorage.setItem('sim_lentera_last_gas_sync', nowIso);

      notifyListeners();

      return {
        success: true,
        message: `Sinkronisasi berhasil! Data dari Google Spreadsheet telah dimuat (${prgCount} program, ${pelCount} pelaksanaan, ${docCount} dokumentasi, ${evlCount} evaluasi).`,
        count: { programs: prgCount, pelaksanaans: pelCount, dokumentasis: docCount, evaluasis: evlCount }
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
