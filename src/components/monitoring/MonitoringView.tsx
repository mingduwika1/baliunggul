import React, { useState } from 'react';
import { ProgramItem, MonitoringItem, KategoriEvaluasi } from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import { StorageService } from '../../services/storageService';
import { exportToExcel } from '../../utils/exportUtils';
import {
  LineChart,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Save,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  TrendingUp,
  Percent
} from 'lucide-react';

interface MonitoringViewProps {
  programs: ProgramItem[];
  monitorings: MonitoringItem[];
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  programs,
  monitorings
}) => {
  const [selectedPilar, setSelectedPilar] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MonitoringItem | null>(null);

  const currentUser = StorageService.getCurrentUser();

  const [formData, setFormData] = useState<Partial<MonitoringItem>>({
    id: '',
    idProgram: programs[0]?.id || '',
    namaProgram: programs[0]?.namaProgram || '',
    pilar: programs[0]?.pilar || '',
    tanggalEvaluasi: new Date().toISOString().split('T')[0],
    target: '',
    realisasi: '',
    persentase: 85,
    kategori: 'Sangat Baik',
    kendala: 'Keterbatasan koordinasi jadwal',
    rekomendasi: 'Sinkronisasi agenda secara terpusat',
    evaluator: currentUser.nama,
    status: 'Sesuai Rencana'
  });

  // Calculate overall metrics
  const total = programs.length;
  const selesai = programs.filter(p => p.status === 'Selesai').length;
  const berjalan = programs.filter(p => p.status === 'Sedang Berjalan').length;
  const belum = programs.filter(p => p.status === 'Direncanakan').length;
  const today = new Date().toISOString().split('T')[0];
  const terlambat = programs.filter(p => p.tanggalSelesai < today && p.status !== 'Selesai').length;

  // Average achievement percentage from monitorings
  const avgPercentage = monitorings.length > 0
    ? Math.round(monitorings.reduce((acc, m) => acc + (m.persentase || 0), 0) / monitorings.length)
    : 0;

  const getKategoriBadge = (kategori: KategoriEvaluasi) => {
    switch (kategori) {
      case 'Sangat Baik':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Baik':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'Cukup':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Perlu Perbaikan':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  const filteredMonitorings = monitorings.filter(m => {
    if (selectedPilar === 'ALL') return true;
    return m.pilar.includes(selectedPilar);
  });

  const handleOpenModal = (item?: MonitoringItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      const prg = programs[0];
      setFormData({
        id: `MON-${new Date().getFullYear()}-${String(monitorings.length + 1).padStart(3, '0')}`,
        idProgram: prg ? prg.id : '',
        namaProgram: prg ? prg.namaProgram : '',
        pilar: prg ? prg.pilar : '',
        tanggalEvaluasi: new Date().toISOString().split('T')[0],
        target: prg ? prg.target : '',
        realisasi: '',
        persentase: 80,
        kategori: 'Baik',
        kendala: '',
        rekomendasi: '',
        evaluator: currentUser.nama,
        status: 'Sesuai Rencana'
      });
    }
    setIsModalOpen(true);
  };

  const handleProgramChange = (prgId: string) => {
    const prg = programs.find(p => p.id === prgId);
    if (prg) {
      setFormData(prev => ({
        ...prev,
        idProgram: prg.id,
        namaProgram: prg.namaProgram,
        pilar: prg.pilar,
        target: prg.target
      }));
    }
  };

  const handlePersentaseChange = (val: number) => {
    const pct = Math.min(100, Math.max(0, val));
    const kategori = StorageService.calculateKategori(pct);
    setFormData(prev => ({
      ...prev,
      persentase: pct,
      kategori: kategori
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idProgram) {
      alert('Pilih program yang akan dievaluasi');
      return;
    }
    StorageService.saveMonitoring(formData as MonitoringItem);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus lembar monitoring evaluasi ini?')) {
      StorageService.deleteMonitoring(id);
    }
  };

  const handleExportExcel = () => {
    const clean = filteredMonitorings.map(m => ({
      'ID Monitoring': m.id,
      'ID Program': m.idProgram,
      'Nama Program': m.namaProgram,
      'Pilar': m.pilar,
      'Tanggal Evaluasi': m.tanggalEvaluasi,
      'Target': m.target,
      'Realisasi': m.realisasi,
      'Persentase Capaian (%)': m.persentase,
      'Kategori': m.kategori,
      'Kendala': m.kendala,
      'Rekomendasi': m.rekomendasi,
      'Evaluator': m.evaluator
    }));
    exportToExcel(clean, `Monitoring_Evaluasi_LENTERA_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <LineChart className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Monitoring & Evaluasi Kinerja Program</h2>
              <p className="text-xs text-slate-500">
                Instrumen penjaminan mutu pelaksanaan 7 pilar untuk Kepala Sekolah dan Tim Evaluasi
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Input Evaluasi Baru</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Direncanakan</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{total}</div>
          <span className="text-[10px] text-slate-400">Total usulan program</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Sudah Terlaksana</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{selesai}</div>
          <span className="text-[10px] text-emerald-600">Tuntas dengan bukti</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Sedang Berjalan</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{berjalan}</div>
          <span className="text-[10px] text-amber-600">Dalam masa KBM/praktik</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Terlambat Jadwal</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{terlambat}</div>
          <span className="text-[10px] text-rose-600">Perlu akselerasi</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-xs font-medium text-slate-500">Rerata Ketercapaian</span>
          <div className="text-2xl font-bold text-purple-700 mt-1">{avgPercentage}%</div>
          <span className="text-[10px] font-bold text-purple-600">
            {StorageService.calculateKategori(avgPercentage)}
          </span>
        </div>
      </div>

      {/* RUBRIK PENILAIAN BANNER */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Standar Rubrik Kategori Mutu SIM LENTERA:
          </span>
          <p className="text-xs text-slate-300 mt-0.5">
            Ditetapkan berdasarkan ketercapaian indikator kinerja utama (IKU)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
            Sangat Baik (&ge; 85%)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800">
            Baik (70% - 84%)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800">
            Cukup (55% - 69%)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800">
            Perlu Perbaikan (&lt; 55%)
          </span>
        </div>
      </div>

      {/* FILTER PILAR */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
        <span className="text-xs font-semibold text-slate-700">Filter Monitoring per Pilar:</span>
        <select
          value={selectedPilar}
          onChange={e => setSelectedPilar(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="ALL">Semua 7 Pilar</option>
          {PILAR_LENTERA.map(p => (
            <option key={p.code} value={p.code}>
              {p.akronim}
            </option>
          ))}
        </select>
      </div>

      {/* MONITORING TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-28">ID & Tanggal</th>
                <th className="py-3 px-4">Program & Pilar</th>
                <th className="py-3 px-3 w-48">Target Kinerja</th>
                <th className="py-3 px-3 w-48">Realisasi Lapangan</th>
                <th className="py-3 px-3 w-32 text-center">Capaian (%)</th>
                <th className="py-3 px-3 w-48">Kendala & Rekomendasi</th>
                <th className="py-3 px-3 w-32">Evaluator</th>
                <th className="py-3 px-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMonitorings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Belum ada data evaluasi untuk pilar ini.
                  </td>
                </tr>
              ) : (
                filteredMonitorings.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-purple-50/40 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-purple-700">{item.id}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.tanggalEvaluasi}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 line-clamp-1">{item.namaProgram}</div>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {item.pilar}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] leading-relaxed">
                      {item.target}
                    </td>
                    <td className="py-3 px-3 text-slate-800 text-[11px] font-medium leading-relaxed">
                      {item.realisasi}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="text-base font-extrabold text-slate-900">{item.persentase}%</div>
                      <span
                        className={`inline-block px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold border ${getKategoriBadge(
                          item.kategori
                        )}`}
                      >
                        {item.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] space-y-1">
                      {item.kendala && (
                        <div className="text-slate-500">
                          <strong className="text-rose-600">Kendala:</strong> {item.kendala}
                        </div>
                      )}
                      {item.rekomendasi && (
                        <div className="text-slate-700">
                          <strong className="text-emerald-600">Rekomendasi:</strong> {item.rekomendasi}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] font-medium">
                      {item.evaluator}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                          title="Edit Evaluasi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT / EDIT EVALUASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-base font-bold">
                {editingItem ? 'Edit Lembar Evaluasi Kinerja' : 'Form Penilaian & Evaluasi Program LENTERA'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Program yang Dievaluasi
                </label>
                <select
                  value={formData.idProgram || ''}
                  onChange={e => handleProgramChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.id}] {p.namaProgram}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Evaluasi
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalEvaluasi || ''}
                    onChange={e => setFormData({ ...formData, tanggalEvaluasi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Evaluator / Penilai
                  </label>
                  <input
                    type="text"
                    value={formData.evaluator || ''}
                    onChange={e => setFormData({ ...formData, evaluator: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Capaian Rencana
                </label>
                <input
                  type="text"
                  value={formData.target || ''}
                  onChange={e => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Realisasi yang Tercapai
                </label>
                <textarea
                  rows={2}
                  value={formData.realisasi || ''}
                  onChange={e => setFormData({ ...formData, realisasi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="Deskripsikan realisasi aktual di lapangan..."
                />
              </div>

              {/* Slider persentase */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">
                    Persentase Capaian Indikator
                  </span>
                  <span className="text-lg font-bold text-purple-700">
                    {formData.persentase}% ({formData.kategori})
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={formData.persentase || 0}
                  onChange={e => handlePersentaseChange(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kendala</label>
                  <textarea
                    rows={2}
                    value={formData.kendala || ''}
                    onChange={e => setFormData({ ...formData, kendala: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rekomendasi</label>
                  <textarea
                    rows={2}
                    value={formData.rekomendasi || ''}
                    onChange={e => setFormData({ ...formData, rekomendasi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
                >
                  Simpan Evaluasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
