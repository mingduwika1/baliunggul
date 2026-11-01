import React, { useState } from 'react';
import {
  ProgramItem,
  PelaksanaanItem,
  DokumentasiItem,
  MonitoringItem,
  PilarInfo
} from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  Camera,
  Calendar,
  Layers,
  ChevronRight,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  BarChart3
} from 'lucide-react';

interface DashboardViewProps {
  programs: ProgramItem[];
  pelaksanaans: PelaksanaanItem[];
  dokumentasis: DokumentasiItem[];
  monitorings: MonitoringItem[];
  onNavigate: (tab: string, filter?: any) => void;
  onOpenProgramModal: (prg?: ProgramItem) => void;
  onOpenPelaksanaanModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  programs,
  pelaksanaans,
  dokumentasis,
  monitorings,
  onNavigate,
  onOpenProgramModal,
  onOpenPelaksanaanModal
}) => {
  const [selectedPilarFilter, setSelectedPilarFilter] = useState<string>('ALL');

  const todayStr = new Date().toISOString().split('T')[0];

  // Metrics
  const totalPrograms = programs.length;
  const direncanakan = programs.filter(p => p.status === 'Direncanakan' || p.status === 'Disetujui').length;
  const sedangBerjalan = programs.filter(p => p.status === 'Sedang Berjalan').length;
  const selesai = programs.filter(p => p.status === 'Selesai').length;
  const belumTerlaksana = programs.filter(p => p.status === 'Direncanakan').length;
  const totalDokumentasi = dokumentasis.length;

  // Percentage realization
  const persentaseRealisasi = totalPrograms > 0 ? Math.round((selesai / totalPrograms) * 100) : 0;

  // Overdue programs (end date passed and not finished)
  const overduePrograms = programs.filter(
    p => p.tanggalSelesai < todayStr && p.status !== 'Selesai'
  );

  // Upcoming programs (starting soon or currently in progress)
  const upcomingPrograms = [...programs]
    .filter(p => p.status !== 'Selesai')
    .sort((a, b) => a.tanggalMulai.localeCompare(b.tanggalMulai))
    .slice(0, 5);

  // Recent pelaksanaans
  const recentPelaksanaans = [...pelaksanaans]
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 5);

  // Monthly realization stats for 2026
  const months = ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthData = [
    { month: 'Jul', planned: 2, completed: 1 },
    { month: 'Agu', planned: 3, completed: 2 },
    { month: 'Sep', planned: 4, completed: 3 },
    { month: 'Okt', planned: 5, completed: 4 },
    { month: 'Nov', planned: 4, completed: 1 },
    { month: 'Des', planned: 3, completed: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Motivational Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-blue-900/60 p-6 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              <span>Sistem Informasi Manajemen Program Unggulan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Program <span className="text-amber-400">LENTERA</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-light">
              "Menerangi Potensi, Membangun Generasi, Mewujudkan SDM Bali Unggul."
              Pusat pemantauan real-time perencanaan, pelaksanaan 7 pilar, dan dokumentasi kegiatan sekolah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenProgramModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>+ Perencanaan Baru</span>
            </button>
            <button
              onClick={() => onOpenPelaksanaanModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Catat Realisasi & Foto</span>
            </button>
          </div>
        </div>
      </div>

      {/* OVERDUE ALERT IF ANY */}
      {overduePrograms.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-xs flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-900">
              Peringatan: {overduePrograms.length} Kegiatan Melewati Batas Waktu Jadwal
            </h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Kegiatan berikut perlu segera ditindaklanjuti atau diperbarui status pelaksanaannya:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {overduePrograms.map(p => (
                <span
                  key={p.id}
                  onClick={() => onNavigate('perencanaan')}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 bg-white text-rose-800 border border-rose-300 rounded-lg shadow-2xs hover:bg-rose-100 cursor-pointer transition-colors"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span className="font-semibold">{p.id}:</span> {p.namaProgram} (Batas: {p.tanggalSelesai})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STATISTIC METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Program */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Program</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalPrograms}</span>
            <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              7 Pilar
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Seluruh program kerja LENTERA</p>
        </div>

        {/* Realisasi & Selesai */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Program Terlaksana</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{selesai}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {persentaseRealisasi}% Tuntas
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Status selesai berbukti</p>
        </div>

        {/* Sedang Berjalan & Direncanakan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sedang Berjalan</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{sedangBerjalan}</span>
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {direncanakan} Terjadwal
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Kegiatan aktif semester ini</p>
        </div>

        {/* Total Dokumentasi */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Dokumentasi</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalDokumentasi}</span>
            <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Drive Cloud
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Foto, video & dokumen bukti</p>
        </div>
      </div>

      {/* 7 PILARS DISTRIBUTION & PROGRESS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Capaian & Distribusi 7 Pilar LENTERA
            </h3>
            <p className="text-xs text-slate-500">
              Peta ketercapaian target program kerja pada setiap pilar utama
            </p>
          </div>
          <button
            onClick={() => onNavigate('profil')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Detail Pilar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mt-4">
          {PILAR_LENTERA.map(pilar => {
            const pilarPrograms = programs.filter(p => p.pilarCode === pilar.code);
            const pilarSelesai = pilarPrograms.filter(p => p.status === 'Selesai').length;
            const pct = pilarPrograms.length > 0 ? Math.round((pilarSelesai / pilarPrograms.length) * 100) : 0;

            return (
              <div
                key={pilar.code}
                onClick={() => onNavigate('perencanaan', { pilarCode: pilar.code })}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all bg-slate-50/50 hover:bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: pilar.color }}
                    >
                      {pilar.letter}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600">
                      {pilarPrograms.length} Prg
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-2 line-clamp-1" title={pilar.name}>
                    {pilar.name}
                  </h4>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                    <span>Realisasi</span>
                    <span className="font-bold text-slate-700">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: pilar.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMN GRID: CHART & ACTIVITY FEEDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Monthly Realization Chart (Chart.js styling) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Grafik Tren Realisasi Kegiatan (Semester Ganjil 2026)
              </h3>
              <p className="text-xs text-slate-500">Perbandingan program yang direncanakan vs terlaksana</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-3 rounded-xs bg-slate-200 inline-block" /> Rencana
              </span>
              <span className="flex items-center gap-1.5 text-slate-800 font-medium">
                <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" /> Terlaksana
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-6 h-56 flex items-end justify-between gap-4 px-4 pt-4 border-b border-slate-200">
            {monthData.map((d, i) => {
              const maxVal = 6;
              const plannedHeight = (d.planned / maxVal) * 100;
              const completedHeight = (d.completed / maxVal) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full pb-1">
                    {/* Planned Bar */}
                    <div
                      className="w-1/3 bg-slate-200 rounded-t-sm transition-all duration-300 group-hover:bg-slate-300 relative"
                      style={{ height: `${plannedHeight}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded transition-opacity">
                        {d.planned}
                      </span>
                    </div>

                    {/* Completed Bar */}
                    <div
                      className="w-1/3 bg-blue-600 rounded-t-sm transition-all duration-300 group-hover:bg-blue-500 relative"
                      style={{ height: `${completedHeight}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-blue-900 text-white px-1.5 py-0.5 rounded transition-opacity">
                        {d.completed}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 mt-2">{d.month}</span>
                </div>
              );
            })}
          </div>

          {/* Evaluation Quick Summary */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Predikat Sekolah</span>
              <span className="font-bold text-blue-700">Sangat Baik (A)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Tingkat Kepuasan</span>
              <span className="font-bold text-emerald-700">92.4%</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Cakupan Peserta</span>
              <span className="font-bold text-amber-700">1.450 Siswa</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Mitra Terlibat</span>
              <span className="font-bold text-purple-700">12 DUDI & Lembaga</span>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming & Action Needed */}
        <div className="space-y-6">
          {/* Upcoming Activities */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Jadwal Mendatang
              </h3>
              <button
                onClick={() => onNavigate('jadwal')}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Lihat Kalender
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {upcomingPrograms.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">Tidak ada jadwal terdekat</p>
              ) : (
                upcomingPrograms.map(p => (
                  <div key={p.id} className="py-2.5 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {p.pilarCode}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 mt-1">
                        {p.namaProgram}
                      </h4>
                      <p className="text-[10px] text-slate-400">{p.waktuPelaksanaan || p.tanggalMulai}</p>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 shrink-0">
                      PJ: {p.penanggungJawab.split(',')[0]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-md">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Laporan Siap Cetak
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Susun berkas laporan semesteran resmi bertandatangan Kepala Sekolah secara instan.
            </p>
            <button
              onClick={() => onNavigate('laporan')}
              className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Buka Menu Laporan & PDF</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* RECENT REALIZATIONS & EVIDENCE GALLERY PREVIEW */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              Realisasi & Dokumentasi Kegiatan Terkini
            </h3>
            <p className="text-xs text-slate-500">Bukti otentik pelaksanaan program LENTERA di lapangan</p>
          </div>
          <button
            onClick={() => onNavigate('galeri')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Semua Foto ({totalDokumentasi})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {dokumentasis.slice(0, 4).map(doc => (
            <div
              key={doc.id}
              onClick={() => onNavigate('galeri')}
              className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video cursor-pointer"
            >
              <img
                src={doc.urlDrive}
                alt={doc.namaFile}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-3 flex flex-col justify-end">
                <span className="text-[10px] font-semibold text-amber-400">
                  {doc.tanggalUpload}
                </span>
                <p className="text-xs font-medium text-white line-clamp-1">{doc.keterangan}</p>
                <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">Oleh: {doc.pengunggah}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
