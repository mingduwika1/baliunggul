import React, { useState, useMemo } from 'react';
import { ProgramItem, PelaksanaanItem } from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  Layers,
  Calendar as CalendarIcon
} from 'lucide-react';

interface JadwalViewProps {
  programs: ProgramItem[];
  pelaksanaans: PelaksanaanItem[];
  onOpenProgramModal: (prg?: ProgramItem) => void;
  onOpenPelaksanaanModal: (pel?: PelaksanaanItem) => void;
}

export const JadwalView: React.FC<JadwalViewProps> = ({
  programs,
  pelaksanaans,
  onOpenProgramModal,
  onOpenPelaksanaanModal
}) => {
  const [viewType, setViewType] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan'>('bulanan');
  const [selectedPilar, setSelectedPilar] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Combined events: programs with their dates and recorded pelaksanaans
  const events = useMemo(() => {
    return programs.map(p => {
      // Find if there is a recorded realization
      const relatedPel = pelaksanaans.find(pel => pel.idProgram === p.id);
      return {
        id: p.id,
        nama: p.namaProgram,
        pilar: p.pilar,
        pilarCode: p.pilarCode,
        tanggalMulai: p.tanggalMulai,
        tanggalSelesai: p.tanggalSelesai,
        lokasi: relatedPel?.lokasi || 'Lingkungan Sekolah / DUDI',
        penanggungJawab: p.penanggungJawab,
        waktu: p.waktuPelaksanaan || '08.00 - 14.00 WITA',
        status: p.status,
        hasPelaksanaan: !!relatedPel,
        pelaksanaanItem: relatedPel,
        programItem: p
      };
    });
  }, [programs, pelaksanaans]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchPilar = selectedPilar === 'ALL' || e.pilarCode === selectedPilar || e.pilar.includes(selectedPilar);
      const matchStatus = selectedStatus === 'ALL' || e.status === selectedStatus;
      
      // Date filtering based on viewType
      if (viewType === 'bulanan' || viewType === 'mingguan' || viewType === 'harian') {
        const eventStartMonth = new Date(e.tanggalMulai).getMonth();
        const eventEndMonth = new Date(e.tanggalSelesai).getMonth();
        const inMonth = (eventStartMonth <= selectedMonth && selectedMonth <= eventEndMonth);
        return matchPilar && matchStatus && inMonth;
      }
      return matchPilar && matchStatus;
    });
  }, [events, selectedPilar, selectedStatus, selectedMonth, selectedYear, viewType]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Jadwal Agenda Program LENTERA</h2>
            <p className="text-xs text-slate-500">
              Kalender terintegrasi perencanaan dan realisasi kegiatan di sekolah
            </p>
          </div>
        </div>

        {/* View Switchers: Harian, Mingguan, Bulanan, Tahunan */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['harian', 'mingguan', 'bulanan', 'tahunan'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewType(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  viewType === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FILTER & MONTH NAVIGATION BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Month Navigator */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm sm:text-base text-slate-900 w-44 text-center">
            {monthNames[selectedMonth]} {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedPilar}
            onChange={e => setSelectedPilar(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
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
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="Direncanakan">Direncanakan</option>
            <option value="Sedang Berjalan">Sedang Berjalan</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* CALENDAR DISPLAY LIST */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-sm font-bold text-slate-900">
            Agenda Kegiatan Terjadwal ({filteredEvents.length} Acara)
          </h3>
          <span className="text-xs text-slate-400">
            Tampilan: <strong className="capitalize text-slate-700">{viewType}</strong>
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Tidak ada kegiatan pada periode atau filter yang dipilih.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(evt => (
              <div
                key={evt.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all bg-slate-50/50 hover:bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {evt.id}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded">
                      {evt.pilar}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        evt.status === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : evt.status === 'Sedang Berjalan'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{evt.nama}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{evt.waktu}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{evt.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">PJ: {evt.penanggungJawab.split(',')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Right action */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onOpenProgramModal(evt.programItem)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Detail Program
                  </button>
                  {evt.hasPelaksanaan ? (
                    <button
                      onClick={() => onOpenPelaksanaanModal(evt.pelaksanaanItem)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      Lihat Bukti
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenPelaksanaanModal()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition-colors"
                    >
                      Catat Realisasi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
