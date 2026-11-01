import React, { useState, useEffect } from 'react';
import { ProgramItem, PilarCode, IntegrasiKurikulum, StatusPerencanaan } from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import { StorageService } from '../../services/storageService';
import { X, Save, Sparkles } from 'lucide-react';

interface ProgramFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  programToEdit?: ProgramItem | null;
  defaultPilarAkronim?: string;
  onSaved: (item: ProgramItem) => void;
}

export const ProgramFormModal: React.FC<ProgramFormModalProps> = ({
  isOpen,
  onClose,
  programToEdit,
  defaultPilarAkronim,
  onSaved
}) => {
  const gurus = StorageService.getGuru();
  const mitras = StorageService.getMitra();

  const [formData, setFormData] = useState<Partial<ProgramItem>>({
    id: '',
    namaProgram: '',
    pilar: PILAR_LENTERA[0].akronim,
    pilarCode: 'L',
    deskripsi: '',
    tujuan: '',
    sasaran: '',
    kelas: 'Kelas X, XI, XII',
    bentukPelaksanaan: 'Workshop dan Praktik Lapangan',
    integrasiKurikulum: 'Kokurikuler',
    mapelTerkait: '',
    penanggungJawab: gurus[0]?.namaGuru || 'Ni Luh Made Ayu Pradnyani, S.Pd., M.Ed.',
    timPelaksana: 'Guru Produktif dan Pembina OSIS',
    mitra: mitras[0]?.namaMitra || '',
    target: '',
    indikator: '',
    waktuPelaksanaan: 'Sesuai Kalender Pendidikan',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    anggaran: 10000000,
    status: 'Direncanakan'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (programToEdit) {
      setFormData(programToEdit);
    } else {
      const generatedId = StorageService.generateProgramId();
      let initPilar = PILAR_LENTERA[0];
      if (defaultPilarAkronim) {
        const found = PILAR_LENTERA.find(p => p.akronim === defaultPilarAkronim);
        if (found) initPilar = found;
      }

      setFormData({
        id: generatedId,
        namaProgram: '',
        pilar: initPilar.akronim,
        pilarCode: initPilar.code,
        deskripsi: '',
        tujuan: '',
        sasaran: 'Seluruh peserta didik',
        kelas: 'Kelas X, XI, XII',
        bentukPelaksanaan: 'Workshop dan Praktik Lapangan',
        integrasiKurikulum: 'Kokurikuler',
        mapelTerkait: 'Muatan Lokal dan Produktif Kejuruan',
        penanggungJawab: gurus[0]?.namaGuru || '',
        timPelaksana: 'Tim LENTERA dan Wali Kelas',
        mitra: mitras[0]?.namaMitra || '',
        target: '',
        indikator: '',
        waktuPelaksanaan: 'Pagi hari sebelum KBM',
        tanggalMulai: new Date().toISOString().split('T')[0],
        tanggalSelesai: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        anggaran: 15000000,
        status: 'Direncanakan'
      });
    }
    setErrors({});
  }, [programToEdit, defaultPilarAkronim, isOpen]);

  if (!isOpen) return null;

  const handlePilarChange = (akronim: string) => {
    const pilar = PILAR_LENTERA.find(p => p.akronim === akronim);
    if (pilar) {
      setFormData(prev => ({
        ...prev,
        pilar: pilar.akronim,
        pilarCode: pilar.code
      }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.namaProgram?.trim()) errs.namaProgram = 'Nama program wajib diisi';
    if (!formData.deskripsi?.trim()) errs.deskripsi = 'Deskripsi program wajib diisi';
    if (!formData.tujuan?.trim()) errs.tujuan = 'Tujuan program wajib diisi';
    if (!formData.penanggungJawab?.trim()) errs.penanggungJawab = 'Penanggung jawab wajib dipilih';
    if (!formData.tanggalMulai) errs.tanggalMulai = 'Tanggal mulai wajib diisi';
    if (!formData.tanggalSelesai) errs.tanggalSelesai = 'Tanggal selesai wajib diisi';
    if (formData.tanggalMulai && formData.tanggalSelesai && formData.tanggalMulai > formData.tanggalSelesai) {
      errs.tanggalSelesai = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const saved = StorageService.saveProgram(formData as ProgramItem);
    onSaved(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-900 text-blue-300">
                {formData.id}
              </span>
              <h3 className="text-base sm:text-lg font-bold">
                {programToEdit ? 'Edit Perencanaan Program' : 'Form Perencanaan Program Baru'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Lengkapi 20 parameter perencanaan sesuai standar evaluasi SIM LENTERA
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* SECTION 1: Identitas & Pilar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. Nama Program <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.namaProgram || ''}
                onChange={e => setFormData({ ...formData, namaProgram: e.target.value })}
                placeholder="Contoh: Digitalisasi Aksara Lontar Bali / Inovasi Subak IoT"
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  errors.namaProgram ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.namaProgram && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.namaProgram}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2. Pilar LENTERA <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.pilar || ''}
                onChange={e => handlePilarChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {PILAR_LENTERA.map(p => (
                  <option key={p.code} value={p.akronim}>
                    {p.akronim}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 2: Deskripsi & Tujuan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                3. Deskripsi Program <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.deskripsi || ''}
                onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Uraikan gambaran umum program kegiatan..."
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  errors.deskripsi ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.deskripsi && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.deskripsi}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                4. Tujuan Kegiatan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.tujuan || ''}
                onChange={e => setFormData({ ...formData, tujuan: e.target.value })}
                placeholder="Target capaian perubahan yang diharapkan..."
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  errors.tujuan ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.tujuan && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.tujuan}</p>
              )}
            </div>
          </div>

          {/* SECTION 3: Sasaran, Kelas, Bentuk & Kurikulum */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                5. Sasaran Peserta
              </label>
              <input
                type="text"
                value={formData.sasaran || ''}
                onChange={e => setFormData({ ...formData, sasaran: e.target.value })}
                placeholder="Contoh: Siswa Kelas XI"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6. Kelas / Tingkat
              </label>
              <input
                type="text"
                value={formData.kelas || ''}
                onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                placeholder="Contoh: X, XI, XII"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                7. Bentuk Pelaksanaan
              </label>
              <input
                type="text"
                value={formData.bentukPelaksanaan || ''}
                onChange={e => setFormData({ ...formData, bentukPelaksanaan: e.target.value })}
                placeholder="Workshop / PjBL / Magang"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                8. Integrasi Kurikulum
              </label>
              <select
                value={formData.integrasiKurikulum || 'Kokurikuler'}
                onChange={e =>
                  setFormData({
                    ...formData,
                    integrasiKurikulum: e.target.value as IntegrasiKurikulum
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Intrakurikuler">Intrakurikuler</option>
                <option value="Kokurikuler">Kokurikuler</option>
                <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                <option value="Pembiasaan budaya sekolah">Pembiasaan budaya sekolah</option>
              </select>
            </div>
          </div>

          {/* SECTION 4: Mapel Terkait, PJ, Tim, Mitra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                9. Mata Pelajaran Terkait
              </label>
              <input
                type="text"
                value={formData.mapelTerkait || ''}
                onChange={e => setFormData({ ...formData, mapelTerkait: e.target.value })}
                placeholder="Bahasa Bali, Informatika, dll."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                10. Penanggung Jawab <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.penanggungJawab || ''}
                onChange={e => setFormData({ ...formData, penanggungJawab: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              >
                {gurus.map(g => (
                  <option key={g.id} value={g.namaGuru}>
                    {g.namaGuru} ({g.jabatan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                11. Tim Pelaksana
              </label>
              <input
                type="text"
                value={formData.timPelaksana || ''}
                onChange={e => setFormData({ ...formData, timPelaksana: e.target.value })}
                placeholder="Tim MGMP / Tim IT"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                12. Mitra Kegiatan
              </label>
              <input
                type="text"
                value={formData.mitra || ''}
                onChange={e => setFormData({ ...formData, mitra: e.target.value })}
                placeholder="Telkom / DUDI / BPD Bali"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* SECTION 5: Target, Indikator, Waktu, Anggaran, Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                13. Target Capaian
              </label>
              <input
                type="text"
                value={formData.target || ''}
                onChange={e => setFormData({ ...formData, target: e.target.value })}
                placeholder="Contoh: 15 rintisan wirausaha / 300 sertifikat BNSP"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                14. Indikator Keberhasilan
              </label>
              <input
                type="text"
                value={formData.indikator || ''}
                onChange={e => setFormData({ ...formData, indikator: e.target.value })}
                placeholder="Contoh: 90% siswa kompeten & terbit dokumen panduan"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dates & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                15. Tanggal Mulai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggalMulai || ''}
                onChange={e => setFormData({ ...formData, tanggalMulai: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
              {errors.tanggalMulai && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.tanggalMulai}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                16. Tanggal Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggalSelesai || ''}
                onChange={e => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
              {errors.tanggalSelesai && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.tanggalSelesai}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                17. Anggaran (Rp)
              </label>
              <input
                type="number"
                value={formData.anggaran || 0}
                onChange={e => setFormData({ ...formData, anggaran: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                18. Status Perencanaan
              </label>
              <select
                value={formData.status || 'Direncanakan'}
                onChange={e =>
                  setFormData({
                    ...formData,
                    status: e.target.value as StatusPerencanaan
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="Direncanakan">Direncanakan</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Sedang Berjalan">Sedang Berjalan</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditunda">Ditunda</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
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
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perencanaan Program</span>
          </button>
        </div>
      </div>
    </div>
  );
};
