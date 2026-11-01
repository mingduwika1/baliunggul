import React, { useState, useMemo } from 'react';
import { ProgramItem, PilarCode, StatusPerencanaan } from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import { StorageService } from '../../services/storageService';
import { exportToExcel, exportToCSV } from '../../utils/exportUtils';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Download,
  Filter,
  Layers,
  Calendar,
  Grid,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Printer
} from 'lucide-react';

interface PerencanaanViewProps {
  programs: ProgramItem[];
  initialPilarFilter?: string;
  onOpenProgramModal: (prg?: ProgramItem) => void;
  onOpenPelaksanaanWithProgram: (prg: ProgramItem) => void;
}

export const PerencanaanView: React.FC<PerencanaanViewProps> = ({
  programs,
  initialPilarFilter,
  onOpenProgramModal,
  onOpenPelaksanaanWithProgram
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'calendar'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPilar, setSelectedPilar] = useState<string>(initialPilarFilter || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof ProgramItem>('tanggalMulai');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter & Search
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchPilar = selectedPilar === 'ALL' || p.pilarCode === selectedPilar || p.pilar.includes(selectedPilar);
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      const matchSearch =
        p.namaProgram.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pilar.toLowerCase().includes(searchTerm.toLowerCase());
      return matchPilar && matchStatus && matchSearch;
    }).sort((a, b) => {
      const valA = String(a[sortField] || '');
      const valB = String(b[sortField] || '');
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [programs, selectedPilar, selectedStatus, searchTerm, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage) || 1;
  const paginatedItems = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (prg: ProgramItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus program "${prg.namaProgram}"?`)) {
      const res = StorageService.deleteProgram(prg.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleExportExcel = () => {
    const cleanData = filteredPrograms.map(p => ({
      'ID Program': p.id,
      'Nama Program': p.namaProgram,
      'Pilar': p.pilar,
      'Penanggung Jawab': p.penanggungJawab,
      'Integrasi Kurikulum': p.integrasiKurikulum,
      'Tanggal Mulai': p.tanggalMulai,
      'Tanggal Selesai': p.tanggalSelesai,
      'Anggaran (Rp)': p.anggaran,
      'Status': p.status,
      'Target Capaian': p.target,
      'Indikator': p.indikator
    }));
    exportToExcel(cleanData, `Perencanaan_Program_LENTERA_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportCSV = () => {
    const cleanData = filteredPrograms.map(p => ({
      ID_Program: p.id,
      Nama_Program: p.namaProgram,
      Pilar: p.pilar,
      Penanggung_Jawab: p.penanggungJawab,
      Tanggal_Mulai: p.tanggalMulai,
      Tanggal_Selesai: p.tanggalSelesai,
      Anggaran: p.anggaran,
      Status: p.status
    }));
    exportToCSV(cleanData, `Perencanaan_Program_LENTERA_${new Date().toISOString().split('T')[0]}`);
  };

  const handlePrintTable = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner and Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Perencanaan Program LENTERA</h2>
              <p className="text-xs text-slate-500">
                Kelola seluruh rancangan program 7 pilar, alokasi anggaran, dan penanggung jawab kegiatan
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher and Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tabel Spreadsheet</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Per Pilar</span>
            </button>
          </div>

          <button
            onClick={() => onOpenProgramModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Program</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama program, ID, PJ, deskripsi..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Pilar */}
          <select
            value={selectedPilar}
            onChange={e => {
              setSelectedPilar(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua 7 Pilar LENTERA</option>
            {PILAR_LENTERA.map(p => (
              <option key={p.code} value={p.code}>
                {p.akronim}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={e => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="Direncanakan">Direncanakan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Sedang Berjalan">Sedang Berjalan</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditunda">Ditunda</option>
          </select>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Download file Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrintTable}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Cetak Tabel"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* SPREADSHEET TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-semibold tracking-wider uppercase border-b border-slate-800">
                  <th className="py-3 px-3 w-24">ID Program</th>
                  <th className="py-3 px-4">Nama Program & Deskripsi</th>
                  <th className="py-3 px-3 w-40">Pilar LENTERA</th>
                  <th className="py-3 px-3 w-36">Integrasi</th>
                  <th className="py-3 px-3 w-40">Penanggung Jawab</th>
                  <th className="py-3 px-3 w-28">Jadwal</th>
                  <th className="py-3 px-3 w-28">Anggaran</th>
                  <th className="py-3 px-3 w-28 text-center">Status</th>
                  <th className="py-3 px-3 w-32 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      Tidak ada data program yang sesuai filter pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((prg, idx) => (
                    <tr
                      key={prg.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {prg.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 line-clamp-1">{prg.namaProgram}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{prg.deskripsi}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Target: {prg.target}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {prg.pilar}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {prg.integrasiKurikulum}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {prg.penanggungJawab}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                        <div>{prg.tanggalMulai}</div>
                        <div className="text-[10px] text-slate-400">s/d {prg.tanggalSelesai}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-800 text-[11px]">
                        Rp {Number(prg.anggaran || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            prg.status === 'Selesai'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prg.status === 'Sedang Berjalan'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {prg.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Catat Realisasi Button */}
                          <button
                            onClick={() => onOpenPelaksanaanWithProgram(prg)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="Catat Realisasi Kegiatan ini"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                          </button>
                          {/* Edit Button */}
                          <button
                            onClick={() => onOpenProgramModal(prg)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                            title="Edit Perencanaan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(prg)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                            title="Hapus Program"
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

          {/* Table Pagination Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Menampilkan {filteredPrograms.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} sampai{' '}
              {Math.min(currentPage * itemsPerPage, filteredPrograms.length)} dari {filteredPrograms.length} total program
            </div>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR GROUPED CARD VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {PILAR_LENTERA.map(pilar => {
            const pilarPrograms = filteredPrograms.filter(p => p.pilarCode === pilar.code);
            if (pilarPrograms.length === 0 && selectedPilar !== 'ALL') return null;

            return (
              <div key={pilar.code} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                      style={{ backgroundColor: pilar.color }}
                    >
                      {pilar.letter}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{pilar.name}</h3>
                      <p className="text-xs text-slate-500">{pilar.akronim}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    {pilarPrograms.length} Program
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {pilarPrograms.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 col-span-3 text-center">
                      Belum ada program untuk pilar ini.
                    </p>
                  ) : (
                    pilarPrograms.map(prg => (
                      <div
                        key={prg.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {prg.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                prg.status === 'Selesai'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : prg.status === 'Sedang Berjalan'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {prg.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                            {prg.namaProgram}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{prg.deskripsi}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">PJ: {prg.penanggungJawab.split(',')[0]}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => onOpenPelaksanaanWithProgram(prg)}
                              className="p-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              title="Realisasi"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenProgramModal(prg)}
                              className="p-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
