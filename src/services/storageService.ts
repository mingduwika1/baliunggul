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
  EvaluasiPemantauanItem
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
    localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(data));
    notifyListeners();
    // Jika GAS Web App URL disetel, sinkronkan juga ke GAS
    if (data.gasWebAppUrl) {
      this.syncToGas('savePengaturan', { data });
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

  // GAS CLOUD SYNC
  async syncToGas(action: string, payload: any) {
    const cfg = this.getPengaturan();
    if (!cfg.gasWebAppUrl) return null;
    try {
      const response = await fetch(cfg.gasWebAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...payload })
      });
      return await response.json();
    } catch (err) {
      console.warn('Sync to GAS deferred or failed network:', err);
      return null;
    }
  },

  async testGasConnection(url: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${url}?action=initDatabase`, {
        method: 'GET',
        mode: 'cors'
      });
      const data = await res.json();
      if (data.status === 'success') {
        return { success: true, message: 'Terhubung ke Google Spreadsheet! ' + (data.message || '') };
      }
      return { success: false, message: data.message || 'Gagal merespon dengan status success' };
    } catch (err: any) {
      return {
        success: false,
        message: 'Koneksi gagal atau terhalang izin CORS/Who has access. Pastikan Web App disetel "Who has access: Anyone". Detail: ' + err.message
      };
    }
  }
};
