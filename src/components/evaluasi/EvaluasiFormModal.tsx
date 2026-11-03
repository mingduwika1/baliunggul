import React, { useState, useEffect } from 'react';
import { EvaluasiPemantauanItem, HasilPemantauan, ProgramItem, PilarCode } from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import { StorageService } from '../../services/storageService';
import { X, Save, ClipboardList, CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

interface EvaluasiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (item: EvaluasiPemantauanItem) => void;
  onOpenAiAssistant?: () => void;
  defaultProgramId?: string;
}

export const EvaluasiFormModal: React.FC<EvaluasiFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  onOpenAiAssistant,
  defaultProgramId
}) => {
  const programs = StorageService.getPrograms();
  const currentUser = StorageService.getCurrentUser();

  const [formData, setFormData] = useState<Partial<EvaluasiPemantauanItem>>({
    id: '',
    jenisKegiatan: '',
    idProgram: '',
    pilar: PILAR_LENTERA[0].akronim,
    pilarCode: 'L',
    tanggalPemantauan: new Date().toISOString().split('T')[0],
    pemantau: currentUser.nama,
    hasilPemantauan: 'Baik',
    keterangan: '',
    tindakLanjutSaran: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const generatedId = StorageService.generateEvaluasiId();
      const targetProgram = programs.find(p => p.id === defaultProgramId) || programs[0];

      setFormData({
        id: generatedId,
        jenisKegiatan: targetProgram ? targetProgram.namaProgram : '',
        idProgram: targetProgram ? targetProgram.id : '',
        pilar: targetProgram ? targetProgram.pilar : PILAR_LENTERA[0].akronim,
        pilarCode: targetProgram ? targetProgram.pilarCode : 'L',
        tanggalPemantauan: new Date().toISOString().split('T')[0],
        pemantau: currentUser.nama,
        hasilPemantauan: 'Baik',
        keterangan: '',
        tindakLanjutSaran: ''
      });
      setErrors({});
    }
  }, [isOpen, defaultProgramId]);

  if (!isOpen) return null;

  const handleProgramSelect = (prgId: string) => {
    const selected = programs.find(p => p.id === prgId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        idProgram: selected.id,
        jenisKegiatan: selected.namaProgram,
        pilar: selected.pilar,
        pilarCode: selected.pilarCode
      }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.jenisKegiatan?.trim()) errs.jenisKegiatan = 'Jenis / nama kegiatan wajib diisi';
    if (!formData.keterangan?.trim()) errs.keterangan = 'Kolom keterangan pemantauan wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const saved = StorageService.saveEvaluasiPemantauan(formData as EvaluasiPemantauanItem);
    onSaved(saved);
    onClose();
  };

  const hasilOptions: { value: HasilPemantauan; label: string; desc: string; color: string; ring: string }[] = [
    {
      value: 'Sangat baik',
      label: 'Sangat Baik',
      desc: 'Melampaui target, partisipasi aktif, dokumentasi lengkap',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
      ring: 'ring-emerald-500 bg-emerald-600 text-white'
    },
    {
      value: 'Baik',
      label: 'Baik',
      desc: 'Sesuai indikator rencana kerja, kendala teratasi dengan baik',
      color: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100',
      ring: 'ring-blue-500 bg-blue-600 text-white'
    },
    {
      value: 'Cukup',
      label: 'Cukup',
      desc: 'Tercapai sebagian, membutuhkan pendampingan teknis/fasilitas',
      color: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
      ring: 'ring-amber-500 bg-amber-600 text-white'
    },
    {
      value: 'Kurang',
      label: 'Kurang',
      desc: 'Belum mencapai target minimum, terdapat hambatan mendesak',
      color: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100',
      ring: 'ring-rose-500 bg-rose-600 text-white'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  {formData.id}
                </span>
                <h3 className="text-base font-bold">Input Pemantauan & Evaluasi Kegiatan</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Catat hasil pemantauan lapangan untuk dimasukkan ke dalam laporan evaluasi program sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Opsi Pilih Program Terdaftar */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
            <label className="block text-xs font-bold text-blue-950 mb-1">
              Hubungkan dengan Program Perencanaan (Opsional)
            </label>
            <select
              value={formData.idProgram || ''}
              onChange={e => handleProgramSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">-- Pilih Program yang Dipantau atau Masukkan Manual di Bawah --</option>
              {programs.map(prg => (
                <option key={prg.id} value={prg.id}>
                  [{prg.id}] {prg.namaProgram} ({prg.pilar})
                </option>
              ))}
            </select>
          </div>

          {/* Kolom Jenis Kegiatan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jenis Kegiatan / Nama Kegiatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.jenisKegiatan || ''}
              onChange={e => setFormData({ ...formData, jenisKegiatan: e.target.value })}
              placeholder="Contoh: Pojok Baca Harian Saban Rahina / Workshop Robotika IoT"
              className={`w-full px-3 py-2 text-xs rounded-xl border ${
                errors.jenisKegiatan ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.jenisKegiatan && (
              <p className="text-[11px] text-rose-500 mt-0.5">{errors.jenisKegiatan}</p>
            )}
          </div>

          {/* Pilar LENTERA Terkait */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pilar LENTERA Terkait
              </label>
              <select
                value={formData.pilar || ''}
                onChange={e => {
                  const pilar = PILAR_LENTERA.find(p => p.akronim === e.target.value);
                  setFormData({
                    ...formData,
                    pilar: e.target.value,
                    pilarCode: pilar ? pilar.code : 'L'
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {PILAR_LENTERA.map(p => (
                  <option key={p.code} value={p.akronim}>
                    {p.akronim}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Pemantauan
              </label>
              <input
                type="date"
                value={formData.tanggalPemantauan || ''}
                onChange={e => setFormData({ ...formData, tanggalPemantauan: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Petugas Pemantau / Evaluator
            </label>
            <input
              type="text"
              value={formData.pemantau || ''}
              onChange={e => setFormData({ ...formData, pemantau: e.target.value })}
              placeholder="Nama Kepala Sekolah / Koordinator / Pengawas"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Kolom Hasil Pemantauan: Sangat baik, baik, cukup, kurang */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Hasil Pemantauan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {hasilOptions.map(opt => {
                const isSelected = formData.hasilPemantauan === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, hasilPemantauan: opt.value })}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? opt.ring + ' shadow-md font-bold -translate-y-0.5'
                        : opt.color + ' border'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{opt.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                      </div>
                      <p className={`text-[10px] mt-1 leading-tight ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kolom Tambahkan Keterangan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tambahkan Keterangan Pemantauan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.keterangan || ''}
              onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Tuliskan temuan observasi, fakta di lapangan, keaktifan peserta, atau aspek yang perlu diperbaiki..."
              className={`w-full px-3 py-2 text-xs rounded-xl border ${
                errors.keterangan ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.keterangan && (
              <p className="text-[11px] text-rose-500 mt-0.5">{errors.keterangan}</p>
            )}
          </div>

          {/* Kolom Usulan / Rekomendasi Tindak Lanjut Awal */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Usulan / Rekomendasi Tindak Lanjut Awal
              </label>
              {onOpenAiAssistant && (
                <button
                  type="button"
                  onClick={onOpenAiAssistant}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Konsultasikan dengan Asisten AI</span>
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={formData.tindakLanjutSaran || ''}
              onChange={e => setFormData({ ...formData, tindakLanjutSaran: e.target.value })}
              placeholder="Langkah perbaikan yang disarankan untuk guru/penanggung jawab program..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan ke Laporan Evaluasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
