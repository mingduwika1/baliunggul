import React, { useState, useEffect } from 'react';
import {
  PelaksanaanItem,
  ProgramItem,
  DokumentasiItem,
  StatusPelaksanaan,
  PilarCode
} from '../../types';
import { StorageService } from '../../services/storageService';
import { X, Save, Upload, Image, FileText, Trash2, Camera, CheckCircle } from 'lucide-react';

interface PelaksanaanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pelaksanaanToEdit?: PelaksanaanItem | null;
  defaultProgram?: ProgramItem | null;
  onSaved: (item: PelaksanaanItem) => void;
}

interface UploadedFilePreview {
  id?: string;
  name: string;
  type: 'image' | 'video' | 'document';
  previewUrl: string;
  fileSize: string;
  keterangan: string;
}

export const PelaksanaanFormModal: React.FC<PelaksanaanFormModalProps> = ({
  isOpen,
  onClose,
  pelaksanaanToEdit,
  defaultProgram,
  onSaved
}) => {
  const programs = StorageService.getPrograms();
  const currentUser = StorageService.getCurrentUser();

  const [formData, setFormData] = useState<Partial<PelaksanaanItem>>({
    id: '',
    idProgram: '',
    namaKegiatan: '',
    pilar: '',
    pilarCode: 'L',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '08.00 - 12.00 WITA',
    lokasi: '',
    penanggungJawab: '',
    peserta: '',
    jumlahPeserta: 50,
    uraian: '',
    hasil: '',
    capaian: '',
    kendala: 'Tidak ada kendala berarti.',
    solusi: 'Terus pertahankan koordinasi yang solid.',
    evaluasi: 'Kegiatan terlaksana sesuai target dan antusiasme peserta tinggi.',
    status: 'Terlaksana Sempurna'
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilePreview[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pelaksanaanToEdit) {
      setFormData(pelaksanaanToEdit);
      // Load existing documentation
      const existingDocs = StorageService.getDokumentasi().filter(
        d => d.idPelaksanaan === pelaksanaanToEdit.id
      );
      setUploadedFiles(
        existingDocs.map(d => ({
          id: d.id,
          name: d.namaFile,
          type: d.jenisFile,
          previewUrl: d.urlDrive,
          fileSize: d.fileSize || '2 MB',
          keterangan: d.keterangan
        }))
      );
    } else {
      const generatedId = StorageService.generatePelaksanaanId();
      const targetProgram = defaultProgram || programs[0];

      setFormData({
        id: generatedId,
        idProgram: targetProgram ? targetProgram.id : '',
        namaKegiatan: targetProgram ? targetProgram.namaProgram : '',
        pilar: targetProgram ? targetProgram.pilar : '',
        pilarCode: targetProgram ? targetProgram.pilarCode : 'L',
        tanggal: new Date().toISOString().split('T')[0],
        waktu: '08.30 - 13.00 WITA',
        lokasi: 'Lingkungan Sekolah SMKN 1 Lentera Bali',
        penanggungJawab: targetProgram ? targetProgram.penanggungJawab : currentUser.nama,
        peserta: targetProgram ? targetProgram.sasaran : 'Siswa dan Dewan Guru',
        jumlahPeserta: 75,
        uraian: '',
        hasil: '',
        capaian: '',
        kendala: 'Tidak ada kendala berarti.',
        solusi: 'Pertahankan sinergi tim.',
        evaluasi: 'Kegiatan berjalan tertib dan tepat waktu.',
        status: 'Terlaksana Sempurna'
      });
      setUploadedFiles([]);
    }
    setErrors({});
  }, [pelaksanaanToEdit, defaultProgram, isOpen]);

  if (!isOpen) return null;

  // Auto-fill pillar and program details when user selects a program
  const handleProgramSelection = (programId: string) => {
    const selected = programs.find(p => p.id === programId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        idProgram: selected.id,
        namaKegiatan: selected.namaProgram,
        pilar: selected.pilar,
        pilarCode: selected.pilarCode,
        penanggungJawab: selected.penanggungJawab,
        peserta: selected.sasaran
      }));
    }
  };

  // Handle multiple file uploads with instant Base64 preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const fileType: 'image' | 'video' | 'document' = isImage
        ? 'image'
        : isVideo
        ? 'video'
        : 'document';

      reader.onload = () => {
        const previewUrl = reader.result as string;
        const newFile: UploadedFilePreview = {
          name: file.name,
          type: fileType,
          previewUrl: previewUrl,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          keterangan: `Dokumentasi bukti kegiatan ${file.name}`
        };
        setUploadedFiles(prev => [...prev, newFile]);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        // For documents and videos, create object URL
        reader.onload = () => {
          setUploadedFiles(prev => [
            ...prev,
            {
              name: file.name,
              type: fileType,
              previewUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=600&q=80',
              fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              keterangan: `Dokumen pendukung ${file.name}`
            }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.idProgram) errs.idProgram = 'Pilih program terkait';
    if (!formData.namaKegiatan?.trim()) errs.namaKegiatan = 'Nama kegiatan wajib diisi';
    if (!formData.tanggal) errs.tanggal = 'Tanggal pelaksanaan wajib diisi';
    if (!formData.lokasi?.trim()) errs.lokasi = 'Lokasi pelaksanaan wajib diisi';
    if (!formData.uraian?.trim()) errs.uraian = 'Uraian pelaksanaan wajib diisi';
    if (!formData.hasil?.trim()) errs.hasil = 'Hasil kegiatan wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // 1. Save Pelaksanaan
    const saved = StorageService.savePelaksanaan(formData as PelaksanaanItem);

    // 2. Save newly uploaded documentation items
    uploadedFiles.forEach(file => {
      if (!file.id) {
        // new file to save
        StorageService.saveDokumentasi({
          id: '',
          idProgram: saved.idProgram,
          idPelaksanaan: saved.id,
          namaFile: file.name,
          jenisFile: file.type,
          urlDrive: file.previewUrl,
          thumbnailUrl: file.previewUrl,
          tanggalUpload: saved.tanggal,
          keterangan: file.keterangan,
          pengunggah: currentUser.nama,
          fileSize: file.fileSize
        });
      }
    });

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
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-300">
                {formData.id}
              </span>
              <h3 className="text-base sm:text-lg font-bold">
                {pelaksanaanToEdit ? 'Edit Realisasi Pelaksanaan Kegiatan' : 'Pencatatan Realisasi & Unggah Dokumentasi'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hubungkan dengan program perencanaan, catat hasil, kendala, solusi, dan simpan bukti ke Google Drive
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
          {/* SECTION 1: Pilih Program Terkait & Auto-populate */}
          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                1. Hubungkan dengan Program Perencanaan (Otomatisasi)
              </span>
              <span className="text-[11px] text-blue-700 font-medium">
                Pilar & data terkait akan terisi otomatis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Program yang Direalisasikan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.idProgram || ''}
                  onChange={e => handleProgramSelection(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- Pilih Program --</option>
                  {programs.map(prg => (
                    <option key={prg.id} value={prg.id}>
                      [{prg.id}] {prg.namaProgram}
                    </option>
                  ))}
                </select>
                {errors.idProgram && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.idProgram}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilar LENTERA Terpilih
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.pilar || ''}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 font-semibold text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Nama Kegiatan, Tanggal, Waktu, Lokasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2. Nama Kegiatan Nyata <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.namaKegiatan || ''}
                onChange={e => setFormData({ ...formData, namaKegiatan: e.target.value })}
                placeholder="Contoh: Puncak Festival Bulan Bahasa Bali & Lomba Nyurat Aksara"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
              {errors.namaKegiatan && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.namaKegiatan}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                3. Lokasi Pelaksanaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lokasi || ''}
                onChange={e => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Contoh: Wantilan Utama / Area Subak Guama"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
              {errors.lokasi && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.lokasi}</p>
              )}
            </div>
          </div>

          {/* Tanggal, Waktu, PJ, Peserta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                4. Tanggal Realisasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggal || ''}
                onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                5. Waktu Pelaksanaan
              </label>
              <input
                type="text"
                value={formData.waktu || ''}
                onChange={e => setFormData({ ...formData, waktu: e.target.value })}
                placeholder="08.00 - 13.00 WITA"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6. Penanggung Jawab
              </label>
              <input
                type="text"
                value={formData.penanggungJawab || ''}
                onChange={e => setFormData({ ...formData, penanggungJawab: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                7. Jumlah Peserta (Orang)
              </label>
              <input
                type="number"
                value={formData.jumlahPeserta || 0}
                onChange={e => setFormData({ ...formData, jumlahPeserta: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              8. Rincian Peserta Terlibat
            </label>
            <input
              type="text"
              value={formData.peserta || ''}
              onChange={e => setFormData({ ...formData, peserta: e.target.value })}
              placeholder="Contoh: 65 Siswa OSIS, 8 Guru Pembimbing, Komite Sekolah"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* SECTION 3: Uraian & Hasil Kegiatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                9. Uraian Pelaksanaan Kegiatan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.uraian || ''}
                onChange={e => setFormData({ ...formData, uraian: e.target.value })}
                placeholder="Rangkaian jalannya kegiatan dari pembukaan hingga penutupan..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
              {errors.uraian && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.uraian}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                10. Hasil & Capaian Nyata <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.hasil || ''}
                onChange={e => setFormData({ ...formData, hasil: e.target.value })}
                placeholder="Output dan dampak yang berhasil diwujudkan..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
              {errors.hasil && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.hasil}</p>
              )}
            </div>
          </div>

          {/* SECTION 4: Kendala, Solusi, Evaluasi, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                11. Kendala yang Dihadapi
              </label>
              <textarea
                rows={2}
                value={formData.kendala || ''}
                onChange={e => setFormData({ ...formData, kendala: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                12. Solusi / Tindak Lanjut
              </label>
              <textarea
                rows={2}
                value={formData.solusi || ''}
                onChange={e => setFormData({ ...formData, solusi: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                13. Status Pelaksanaan
              </label>
              <select
                value={formData.status || 'Terlaksana Sempurna'}
                onChange={e =>
                  setFormData({
                    ...formData,
                    status: e.target.value as StatusPelaksanaan
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="Terlaksana Sempurna">Terlaksana Sempurna</option>
                <option value="Terlaksana Sebagian">Terlaksana Sebagian</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Belum Terlaksana">Belum Terlaksana</option>
              </select>
            </div>
          </div>

          {/* SECTION 5: UNGGAH DOKUMENTASI & PREVIEW (FOTO, VIDEO, DOKUMEN) */}
          <div className="p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Unggah Bukti Dokumentasi (Foto JPG/PNG/WEBP, Video MP4, Dokumen PDF)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Dapat mengunggah beberapa file sekaligus. File otomatis disimpan ke Google Drive.
                </p>
              </div>

              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto">
                <Camera className="w-3.5 h-3.5" />
                <span>Pilih File Dari Perangkat</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/mp4,.pdf,.docx,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* PREVIEW DAFTAR FILE TERUNGGAH */}
            {uploadedFiles.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Belum ada foto atau dokumen yang diunggah untuk kegiatan ini.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-xs group"
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center relative">
                      {file.type === 'image' ? (
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <FileText className="w-8 h-8 text-blue-500" />
                          <span className="text-[9px] uppercase font-bold mt-1 text-slate-500">
                            {file.name.split('.').pop()}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeUploadedFile(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus file"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="mt-2">
                      <p className="text-[11px] font-semibold text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <span className="text-[10px] text-slate-400">{file.fileSize}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Realisasi & Dokumentasi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
