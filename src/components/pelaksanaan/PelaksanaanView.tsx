import React, { useState, useMemo } from 'react';
import { PelaksanaanItem, DokumentasiItem } from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import { StorageService } from '../../services/storageService';
import { exportToExcel } from '../../utils/exportUtils';
import {
  ClipboardCheck,
  Search,
  Plus,
  Download,
  Calendar,
  MapPin,
  Users,
  Camera,
  Edit2,
  Trash2,
  Printer,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye
} from 'lucide-react';

interface PelaksanaanViewProps {
  pelaksanaans: PelaksanaanItem[];
  dokumentasis: DokumentasiItem[];
  onOpenModal: (item?: PelaksanaanItem) => void;
  onViewGaleriForPelaksanaan: (pelId: string) => void;
  onPrintKegiatan: (item: PelaksanaanItem) => void;
}

export const PelaksanaanView: React.FC<PelaksanaanViewProps> = ({
  pelaksanaans,
  dokumentasis,
  onOpenModal,
  onViewGaleriForPelaksanaan,
  onPrintKegiatan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPilar, setSelectedPilar] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter and search
  const filteredItems = useMemo(() => {
    return pelaksanaans.filter(item => {
      const matchPilar = selectedPilar === 'ALL' || item.pilarCode === selectedPilar || item.pilar.includes(selectedPilar);
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchSearch =
        item.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.idProgram.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uraian.toLowerCase().includes(searchTerm.toLowerCase());
      return matchPilar && matchStatus && matchSearch;
    });
  }, [pelaksanaans, selectedPilar, selectedStatus, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (item: PelaksanaanItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan pelaksanaan "${item.namaKegiatan}"?`)) {
      const res = StorageService.deletePelaksanaan(item.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleExportExcel = () => {
    const cleanData = filteredItems.map(p => ({
      'ID Pelaksanaan': p.id,
      'ID Program': p.idProgram,
      'Nama Kegiatan': p.namaKegiatan,
      'Pilar': p.pilar,
      'Tanggal': p.tanggal,
      'Waktu': p.waktu,
      'Lokasi': p.lokasi,
      'Penanggung Jawab': p.penanggungJawab,
      'Jumlah Peserta': p.jumlahPeserta,
      'Hasil': p.hasil,
      'Capaian': p.capaian,
      'Kendala': p.kendala,
      'Solusi': p.solusi,
      'Status': p.status
    }));
    exportToExcel(cleanData, `Realisasi_Pelaksanaan_LENTERA_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ClipboardCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pelaksanaan & Realisasi Kegiatan</h2>
              <p className="text-xs text-slate-500">
                Pencatatan aktual keterlaksanaan program, dokumentasi foto lapangan, dan kendala/solusi
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
            onClick={() => onOpenModal()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Realisasi Baru</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kegiatan, program, penanggung jawab, lokasi..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedPilar}
            onChange={e => {
              setSelectedPilar(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Pilar</option>
            {PILAR_LENTERA.map(p => (
              <option key={p.code} value={p.code}>
                {p.akronim}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="Terlaksana Sempurna">Terlaksana Sempurna</option>
            <option value="Terlaksana Sebagian">Terlaksana Sebagian</option>
            <option value="Dalam Proses">Dalam Proses</option>
            <option value="Terlambat">Terlambat</option>
          </select>
        </div>
      </div>

      {/* LIST OF PELAKSANAAN CARDS */}
      <div className="space-y-4">
        {paginatedItems.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
            <p className="text-xs">Belum ada catatan realisasi pelaksanaan kegiatan.</p>
          </div>
        ) : (
          paginatedItems.map(item => {
            const relatedDocs = dokumentasis.filter(d => d.idPelaksanaan === item.id);

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.id}
                    </span>
                    <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Ref: {item.idProgram}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {item.pilar}
                    </span>
                  </div>

                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      item.status === 'Terlaksana Sempurna'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Title and metadata */}
                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.namaKegiatan}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{item.tanggal} ({item.waktu})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span className="truncate">{item.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.jumlahPeserta} Peserta</span>
                    </div>
                  </div>
                </div>

                {/* Content details: Uraian & Hasil */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <h5 className="font-semibold text-slate-700 mb-1">Uraian Pelaksanaan:</h5>
                    <p className="text-slate-600 leading-relaxed">{item.uraian}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-700 mb-1">Hasil & Capaian:</h5>
                    <p className="text-slate-600 leading-relaxed font-medium">{item.hasil}</p>
                  </div>
                </div>

                {/* Kendala & Solusi if noted */}
                {(item.kendala || item.solusi) && (
                  <div className="flex flex-col sm:flex-row gap-3 text-xs bg-amber-50/40 p-3 rounded-xl border border-amber-100 text-amber-900">
                    {item.kendala && (
                      <div className="flex-1">
                        <strong>Kendala:</strong> {item.kendala}
                      </div>
                    )}
                    {item.solusi && (
                      <div className="flex-1">
                        <strong>Solusi/Tindak Lanjut:</strong> {item.solusi}
                      </div>
                    )}
                  </div>
                )}

                {/* Attached Documentation Thumbnails */}
                {relatedDocs.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-indigo-600" />
                        Bukti Dokumentasi Terlampir ({relatedDocs.length} File)
                      </span>
                      <button
                        onClick={() => onViewGaleriForPelaksanaan(item.id)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Lihat di Galeri</span>
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {relatedDocs.map(doc => (
                        <div
                          key={doc.id}
                          className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative group cursor-pointer"
                          onClick={() => onViewGaleriForPelaksanaan(item.id)}
                        >
                          <img
                            src={doc.urlDrive}
                            alt={doc.namaFile}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    PJ: <strong>{item.penanggungJawab}</strong>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onPrintKegiatan(item)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                      title="Cetak Berita Acara & Laporan Kegiatan"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Berita Acara</span>
                    </button>

                    <button
                      onClick={() => onOpenModal(item)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {filteredItems.length > itemsPerPage && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Halaman {currentPage} dari {totalPages} ({filteredItems.length} total)
          </span>
          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
