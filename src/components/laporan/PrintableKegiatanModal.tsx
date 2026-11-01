import React from 'react';
import { PelaksanaanItem, ProgramItem, DokumentasiItem, PengaturanSekolah } from '../../types';
import { Printer, X, Download } from 'lucide-react';

interface PrintableKegiatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  pelaksanaan: PelaksanaanItem | null;
  program: ProgramItem | null;
  dokumentasis: DokumentasiItem[];
  pengaturan: PengaturanSekolah;
}

export const PrintableKegiatanModal: React.FC<PrintableKegiatanModalProps> = ({
  isOpen,
  onClose,
  pelaksanaan,
  program,
  dokumentasis,
  pengaturan
}) => {
  if (!isOpen || !pelaksanaan) return null;

  const relatedDocs = dokumentasis.filter(d => d.idPelaksanaan === pelaksanaan.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Controls (Hidden on print) */}
        <div className="print:hidden px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-amber-400 font-bold">{pelaksanaan.id}</span>
            <h3 className="text-sm sm:text-base font-bold">Berita Acara & Laporan Pelaksanaan Kegiatan</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Cetak PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Paper */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 font-sans text-xs text-slate-900 print:p-0">
          {/* KOP SURAT */}
          <div className="border-b-4 border-double border-slate-900 pb-3 text-center flex items-center justify-between">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
              <img src={pengaturan.logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center px-2">
              <h4 className="text-[10px] font-semibold tracking-wider uppercase text-slate-600">
                PEMERINTAH PROVINSI BALI &bull; DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA
              </h4>
              <h2 className="text-base sm:text-xl font-black text-slate-900">{pengaturan.namaSekolah}</h2>
              <p className="text-[11px] text-slate-600">{pengaturan.alamat}</p>
            </div>
            <div className="w-16 h-16 hidden sm:block" />
          </div>

          <div className="text-center my-5">
            <h3 className="text-sm sm:text-base font-black underline uppercase text-slate-900">
              BERITA ACARA & LAPORAN REALISASI KEGIATAN LENTERA
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Nomor: BA-{pelaksanaan.id}/SMK-LENTERA/{new Date().getFullYear()}
            </p>
          </div>

          {/* Rincian Parameter */}
          <div className="space-y-3 mt-4 border border-slate-300 rounded-xl p-4 bg-slate-50/50">
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-600">1. Nama Kegiatan:</span>
              <span className="col-span-2 font-bold text-slate-900">{pelaksanaan.namaKegiatan}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-600">2. Pilar LENTERA:</span>
              <span className="col-span-2 font-bold text-blue-900">{pelaksanaan.pilar}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-600">3. Program Induk:</span>
              <span className="col-span-2 text-slate-800">
                [{pelaksanaan.idProgram}] {program?.namaProgram || '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-600">4. Waktu & Tanggal:</span>
              <span className="col-span-2 text-slate-800">
                {pelaksanaan.tanggal} (Pukul {pelaksanaan.waktu})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-600">5. Lokasi Kegiatan:</span>
              <span className="col-span-2 text-slate-800">{pelaksanaan.lokasi}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-600">6. Penanggung Jawab:</span>
              <span className="col-span-2 font-bold text-slate-900">{pelaksanaan.penanggungJawab}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-600">7. Peserta Terlibat:</span>
              <span className="col-span-2 text-slate-800">
                {pelaksanaan.peserta} ({pelaksanaan.jumlahPeserta} orang)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-600">8. Uraian Kegiatan:</span>
              <span className="col-span-2 text-slate-800 leading-relaxed">{pelaksanaan.uraian}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-600">9. Hasil & Capaian:</span>
              <span className="col-span-2 font-medium text-slate-900 leading-relaxed">{pelaksanaan.hasil}</span>
            </div>
            {pelaksanaan.kendala && (
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-600">10. Kendala:</span>
                <span className="col-span-2 text-slate-800">{pelaksanaan.kendala}</span>
              </div>
            )}
            {pelaksanaan.solusi && (
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-600">11. Solusi/Tindak Lanjut:</span>
                <span className="col-span-2 text-slate-800">{pelaksanaan.solusi}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 py-1">
              <span className="font-semibold text-slate-600">12. Status Akhir:</span>
              <span className="col-span-2 font-bold text-emerald-800">{pelaksanaan.status}</span>
            </div>
          </div>

          {/* Lampiran Foto */}
          {relatedDocs.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-2">
                Lampiran Bukti Dokumentasi Kegiatan:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {relatedDocs.map(doc => (
                  <div key={doc.id} className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 p-1">
                    <div className="aspect-video w-full rounded overflow-hidden">
                      <img src={doc.urlDrive} alt={doc.namaFile} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-slate-700 mt-1 truncate">{doc.keterangan}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kolom Tanda Tangan */}
          <div className="mt-10 pt-4 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-bold text-slate-900 mt-0.5">Kepala {pengaturan.namaSekolah}</p>
              <div className="h-16" />
              <p className="font-bold underline uppercase text-slate-900">{pengaturan.kepalaSekolah}</p>
              <p className="text-[11px] font-mono text-slate-600">NIP. {pengaturan.nipKepalaSekolah}</p>
            </div>

            <div>
              <p className="text-slate-600">Denpasar, {pelaksanaan.tanggal}</p>
              <p className="font-bold text-slate-900 mt-0.5">Penanggung Jawab Kegiatan</p>
              <div className="h-16" />
              <p className="font-bold underline uppercase text-slate-900">{pelaksanaan.penanggungJawab}</p>
              <p className="text-[11px] font-mono text-slate-600">Tim Pelaksana LENTERA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
