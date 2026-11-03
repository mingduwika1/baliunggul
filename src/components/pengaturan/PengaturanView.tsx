import React, { useState } from 'react';
import { PengaturanSekolah, UserSession } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  Settings,
  School,
  Cloud,
  Database,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  Key,
  FolderOpen,
  RefreshCw
} from 'lucide-react';

interface PengaturanViewProps {
  pengaturan: PengaturanSekolah;
  onOpenGasHub: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  pengaturan,
  onOpenGasHub
}) => {
  const [formData, setFormData] = useState<PengaturanSekolah>({ ...pengaturan });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullResult, setPullResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.savePengaturan(formData);
    setSaveSuccess(true);
    if (formData.gasWebAppUrl) {
      setIsPulling(true);
      const res = await StorageService.pullFromGas(formData.gasWebAppUrl);
      setPullResult(res);
      setIsPulling(false);
    }
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handlePullData = async () => {
    if (!formData.gasWebAppUrl) {
      setPullResult({
        success: false,
        message: 'Masukkan URL Google Apps Script Web App terlebih dahulu.'
      });
      return;
    }
    setIsPulling(true);
    setPullResult(null);
    StorageService.savePengaturan(formData);
    const res = await StorageService.pullFromGas(formData.gasWebAppUrl);
    setPullResult(res);
    setIsPulling(false);
  };

  const handleTestGasConnection = async () => {
    if (!formData.gasWebAppUrl) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Google Apps Script Web App terlebih dahulu.'
      });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await StorageService.testGasConnection(formData.gasWebAppUrl);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportAllDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SIM_LENTERA_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const res = StorageService.importDataFromJson(content);
      if (res.success) {
        alert(res.message);
        window.location.reload();
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data ke data bawaan (default sekolah Bali)? Perubahan lokal yang belum di-backup akan ditimpa.')) {
      StorageService.resetToDefault();
      alert('Data SIM LENTERA berhasil di-reset ke sample standar Bali Unggul.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pengaturan Sistem & Database</h2>
              <p className="text-xs text-slate-500">
                Konfigurasi identitas sekolah, integrasi Google Spreadsheet & Drive, serta backup basis data
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenGasHub}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Key className="w-4 h-4 text-slate-950" />
          <span>Buka Script Code.gs & Panduan</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan SIM LENTERA berhasil disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* IDENTITAS SEKOLAH */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <School className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Identitas Sekolah & Pimpinan</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Sekolah Resmi</label>
              <input
                type="text"
                value={formData.namaSekolah}
                onChange={e => setFormData({ ...formData, namaSekolah: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL Logo Sekolah</label>
              <input
                type="text"
                value={formData.logo}
                onChange={e => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
            <input
              type="text"
              value={formData.alamat}
              onChange={e => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kepala Sekolah</label>
              <input
                type="text"
                value={formData.kepalaSekolah}
                onChange={e => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={formData.nipKepalaSekolah}
                onChange={e => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Koordinator LENTERA</label>
              <input
                type="text"
                value={formData.koordinatorLentera}
                onChange={e => setFormData({ ...formData, koordinatorLentera: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NIP Koordinator</label>
              <input
                type="text"
                value={formData.nipKoordinator}
                onChange={e => setFormData({ ...formData, nipKoordinator: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Pelajaran</label>
              <input
                type="text"
                value={formData.tahunPelajaran}
                onChange={e => setFormData({ ...formData, tahunPelajaran: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Sekolah</label>
              <input
                type="email"
                value={formData.emailSekolah}
                onChange={e => setFormData({ ...formData, emailSekolah: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website Sekolah</label>
              <input
                type="text"
                value={formData.websiteSekolah}
                onChange={e => setFormData({ ...formData, websiteSekolah: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* PENGATURAN GOOGLE SPREADSHEET & DRIVE CLOUD INTEGRATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Cloud className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Integrasi Google Spreadsheet & Google Drive
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan aplikasi dengan backend Google Apps Script agar data tersimpan di Spreadsheet dan file tersimpan di Drive Anda
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Apps Script Web App URL (Endpoint API)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={formData.gasWebAppUrl || ''}
                onChange={e => setFormData({ ...formData, gasWebAppUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePullData}
                  disabled={isPulling || isTesting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Tarik data terkini dari Google Spreadsheet agar langsung muncul di aplikasi"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
                  <span>{isPulling ? 'Menarik Data...' : 'Tarik Data Sekarang'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestGasConnection}
                  disabled={isTesting || isPulling}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isTesting ? 'Menguji...' : 'Uji Koneksi'}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500">
              <span>
                Data di Google Spreadsheet akan langsung ditarik dan tampil di seluruh menu aplikasi saat Anda klik "Tarik Data Sekarang" atau "Simpan Pengaturan".
              </span>
              {StorageService.getLastSyncTime() && (
                <span className="text-emerald-700 font-medium shrink-0 ml-2">
                  Terakhir ditarik: {new Date(StorageService.getLastSyncTime()!).toLocaleTimeString('id-ID')} WITA
                </span>
              )}
            </div>
          </div>

          {pullResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                pullResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {pullResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{pullResult.success ? 'Sinkronisasi Spreadsheet Berhasil!' : 'Sinkronisasi Gagal'}</p>
                <p className="text-[11px] mt-0.5 text-slate-700">{pullResult.message}</p>
              </div>
            </div>
          )}

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ID Google Spreadsheet (Opsional referensi)
              </label>
              <input
                type="text"
                value={formData.googleSpreadsheetId}
                onChange={e => setFormData({ ...formData, googleSpreadsheetId: e.target.value })}
                placeholder="ID Spreadsheet..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Folder Google Drive
              </label>
              <input
                type="text"
                readOnly
                value="DOKUMENTASI_LENTERA_SEKOLAH (Dibuat otomatis oleh script)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Seluruh Pengaturan</span>
          </button>
        </div>
      </form>

      {/* BACKUP & RESTORE DATABASE JSON */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Backup, Restore & Reset Data</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Amankan seluruh data sekolah (program, pelaksanaan, dokumentasi, evaluasi, guru, siswa, kelas, mitra) ke dalam berkas JSON mandiri untuk arsip cadangan kapan saja.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Cadangan Lengkap (.json)</span>
          </button>

          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Pulihkan Dari File JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Contoh Bawaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
