import React, { useState } from 'react';
import { GAS_CODE_GS, GAS_INSTALLATION_GUIDE } from '../../services/gasCodeGenerator';
import {
  Code,
  Copy,
  Check,
  X,
  FileSpreadsheet,
  Download,
  ExternalLink,
  BookOpen,
  Layers,
  Database,
  Cloud
} from 'lucide-react';

interface GasHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasHubModal: React.FC<GasHubModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'codegs' | 'guide' | 'schema'>('codegs');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([GAS_CODE_GS], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Code.gs';
    link.click();
  };

  const sheetsInfo = [
    { name: '1. PENGATURAN', cols: 'ID | Nama_Sekolah | Alamat | Kepala_Sekolah | NIP_Kepala_Sekolah | Koordinator_Lentera | Tahun_Pelajaran | Logo', desc: 'Identitas sekolah & pimpinan' },
    { name: '2. PROGRAM', cols: 'ID_Program | Nama_Program | Pilar | Pilar_Code | Deskripsi | Tujuan | Sasaran | Kelas | Bentuk_Pelaksanaan | Integrasi_Kurikulum | Mapel_Terkait | Penanggung_Jawab | Tim_Pelaksana | Mitra | Target | Indikator | Tanggal_Mulai | Tanggal_Selesai | Anggaran | Status', desc: '20 Field Perencanaan Utama' },
    { name: '3. PELAKSANAAN', cols: 'ID_Pelaksanaan | ID_Program | Nama_Kegiatan | Pilar | Tanggal | Waktu | Lokasi | Penanggung_Jawab | Peserta | Jumlah_Peserta | Uraian | Hasil | Capaian | Kendala | Solusi | Evaluasi | Status', desc: '17 Field Realisasi Kegiatan' },
    { name: '4. DOKUMENTASI', cols: 'ID_Dokumentasi | ID_Program | ID_Pelaksanaan | Nama_File | Jenis_File | URL_Drive | Tanggal_Upload | Keterangan | Pengunggah', desc: 'Metadata & URL Google Drive' },
    { name: '5. MONITORING', cols: 'ID_Monitoring | ID_Program | Pilar | Tanggal_Evaluasi | Target | Realisasi | Persentase | Kategori | Kendala | Rekomendasi | Evaluator', desc: 'Evaluasi Mutu & Capaian IKU' },
    { name: '6. GURU', cols: 'ID_Guru | Nama_Guru | NIP | Jabatan | Mata_Pelajaran | Email | Status', desc: 'Data Tenaga Pendidik' },
    { name: '7. SISWA', cols: 'ID_Siswa | Nama_Siswa | NISN | Kelas | Konsentrasi_Keahlian | Status', desc: 'Data Peserta Didik' },
    { name: '8. KELAS', cols: 'ID_Kelas | Nama_Kelas | Tingkat | Konsentrasi_Keahlian | Wali_Kelas', desc: 'Rombongan Belajar' },
    { name: '9. MITRA', cols: 'ID_Mitra | Nama_Mitra | Jenis_Mitra | Alamat | Kontak | Keterangan', desc: 'DUDI & Lembaga Kerjasama' },
    { name: '10. PENGGUNA', cols: 'ID_Pengguna | Nama | Email | Password_Hash | Role | Status', desc: 'Hak Akses Pengguna Sistem' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Code className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Google Apps Script Backend & Spreadsheet Database
              </h3>
              <p className="text-xs text-slate-400">
                Arsitektur backend serverless terintegrasi langsung dengan Google Spreadsheet dan Google Drive
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between bg-slate-100 px-6 py-2 border-b border-slate-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('codegs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'codegs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Code.gs (Script Lengkap)
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'guide'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Panduan Instalasi (5 Langkah)
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'schema'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Struktur 10 Sheet Database
            </button>
          </div>

          {activeTab === 'codegs' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadCode}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh .gs</span>
              </button>
              <button
                onClick={() => handleCopyCode(GAS_CODE_GS)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 text-xs font-sans">
          {activeTab === 'codegs' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center justify-between">
                <span>
                  Kompilasi kode <strong>Code.gs</strong> lengkap mencakup: doGet, doPost, initDatabase (10 sheet otomatis), LockService antrean aman, Base64 upload ke Google Drive, dan CRUD seluruh modul.
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-[50vh]">
                {GAS_CODE_GS}
              </pre>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 leading-relaxed text-slate-700">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Panduan Langkah Demi Langkah Deployment Google Apps Script
              </h4>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs">
                    Langkah 1: Buat Google Spreadsheet
                  </h5>
                  <p className="mt-1">
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> dan beri nama "DATABASE MASTER SIM LENTERA".
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs">
                    Langkah 2: Buka Apps Script & Tempelkan Kode
                  </h5>
                  <p className="mt-1">
                    Klik menu <strong>Ekstensi &gt; Apps Script</strong>. Tempelkan seluruh kode dari tab <em>Code.gs</em> di atas, lalu simpan.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs">
                    Langkah 3: Jalankan Fungsi inisialisasi Database (initDatabase)
                  </h5>
                  <p className="mt-1">
                    Pilih fungsi <code>initDatabase</code> di toolbar atas dan klik <strong>Jalankan (Run)</strong>. Setujui izin akun Google. 10 Sheet dan folder Google Drive <code>DOKUMENTASI_LENTERA_SEKOLAH</code> akan otomatis dibuat!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs">
                    Langkah 4: Deploy sebagai Web App
                  </h5>
                  <p className="mt-1">
                    Klik <strong>Deploy &gt; New Deployment &gt; Web app</strong>. Pilih:
                    <br />- <strong>Execute as:</strong> Me (Akun saya)
                    <br />- <strong>Who has access:</strong> Anyone (Siapa saja)
                    <br />Salin URL Web App yang dihasilkan.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs">
                    Langkah 5: Masukkan URL ke Pengaturan SIM LENTERA
                  </h5>
                  <p className="mt-1">
                    Tempelkan URL tersebut ke kolom <strong>Google Apps Script Web App URL</strong> pada menu Pengaturan di aplikasi ini, dan klik <em>Uji Koneksi</em>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                Struktur 10 Sheet database master yang otomatis diinisialisasi oleh skrip <code>initDatabase()</code> di Google Spreadsheet:
              </div>

              <div className="space-y-3">
                {sheetsInfo.map((s, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="font-bold text-blue-900">{s.name}</span>
                      <span className="text-[10px] text-slate-500">{s.desc}</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto">
                      {s.cols}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
