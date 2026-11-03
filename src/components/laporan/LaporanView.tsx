import React, { useState } from 'react';
import {
  ProgramItem,
  PelaksanaanItem,
  DokumentasiItem,
  MonitoringItem,
  EvaluasiPemantauanItem,
  PengaturanSekolah,
  HasilPemantauan
} from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import { exportToExcel, exportToCSV } from '../../utils/exportUtils';
import {
  FileText,
  Printer,
  Download,
  Filter,
  CheckCircle,
  School,
  Calendar,
  Layers,
  Award,
  Clock,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LaporanViewProps {
  programs: ProgramItem[];
  pelaksanaans: PelaksanaanItem[];
  dokumentasis: DokumentasiItem[];
  monitorings: MonitoringItem[];
  evaluasiList: EvaluasiPemantauanItem[];
  pengaturan: PengaturanSekolah;
  initialReportType?: string;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  programs,
  pelaksanaans,
  dokumentasis,
  monitorings,
  evaluasiList,
  pengaturan,
  initialReportType
}) => {
  const [jenisLaporan, setJenisLaporan] = useState<string>(initialReportType || 'keseluruhan');
  const [filterPilar, setFilterPilar] = useState<string>('ALL');
  const [filterHasilPemantauan, setFilterHasilPemantauan] = useState<string>('ALL');
  const [filterSemester, setFilterSemester] = useState<string>('Ganjil');
  const [filterTahun, setFilterTahun] = useState<string>('2026/2027');

  // Filter program datasets
  let filteredPrograms = programs;
  if (jenisLaporan === 'pilar' && filterPilar !== 'ALL') {
    filteredPrograms = programs.filter(p => p.pilarCode === filterPilar || p.pilar.includes(filterPilar));
  } else if (jenisLaporan === 'belum_terlaksana') {
    filteredPrograms = programs.filter(p => p.status === 'Direncanakan');
  }

  // Filter evaluasi pemantauan datasets
  const filteredEvaluasi = evaluasiList.filter(item => {
    const matchPilar = filterPilar === 'ALL' || item.pilarCode === filterPilar || item.pilar.includes(filterPilar);
    const matchHasil = filterHasilPemantauan === 'ALL' || item.hasilPemantauan === filterHasilPemantauan;
    return matchPilar && matchHasil;
  });

  // Evaluasi statistics
  const countSangatBaik = evaluasiList.filter(e => e.hasilPemantauan === 'Sangat baik').length;
  const countBaik = evaluasiList.filter(e => e.hasilPemantauan === 'Baik').length;
  const countCukup = evaluasiList.filter(e => e.hasilPemantauan === 'Cukup').length;
  const countKurang = evaluasiList.filter(e => e.hasilPemantauan === 'Kurang').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (jenisLaporan === 'evaluasi_pemantauan') {
      const data = filteredEvaluasi.map((e, idx) => ({
        'No': idx + 1,
        'ID Pemantauan': e.id,
        'Tanggal Pemantauan': e.tanggalPemantauan,
        'Jenis Kegiatan': e.jenisKegiatan,
        'Pilar LENTERA': e.pilar,
        'Hasil Pemantauan': e.hasilPemantauan,
        'Keterangan Pemantauan': e.keterangan,
        'Tindak Lanjut Saran': e.tindakLanjutSaran || '-',
        'Petugas Pemantau': e.pemantau
      }));
      exportToExcel(data, `Laporan_Evaluasi_Pemantauan_LENTERA_${new Date().toISOString().split('T')[0]}`);
      return;
    }

    const data = filteredPrograms.map(p => {
      const pel = pelaksanaans.find(e => e.idProgram === p.id);
      return {
        'ID Program': p.id,
        'Pilar': p.pilar,
        'Nama Program': p.namaProgram,
        'Tujuan': p.tujuan,
        'Sasaran': p.sasaran,
        'Waktu Pelaksanaan': p.waktuPelaksanaan || `${p.tanggalMulai} s/d ${p.tanggalSelesai}`,
        'Penanggung Jawab': p.penanggungJawab,
        'Anggaran (Rp)': p.anggaran,
        'Status': p.status,
        'Hasil Realisasi': pel?.hasil || 'Belum ada realisasi',
        'Evaluasi': pel?.evaluasi || '-'
      };
    });
    exportToExcel(data, `Laporan_${jenisLaporan}_LENTERA_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportCSV = () => {
    if (jenisLaporan === 'evaluasi_pemantauan') {
      const data = filteredEvaluasi.map(e => ({
        ID_Pemantauan: e.id,
        Tanggal: e.tanggalPemantauan,
        Jenis_Kegiatan: e.jenisKegiatan,
        Pilar: e.pilar,
        Hasil_Pemantauan: e.hasilPemantauan,
        Keterangan: e.keterangan,
        Pemantau: e.pemantau
      }));
      exportToCSV(data, `Laporan_Evaluasi_Pemantauan_LENTERA_${new Date().toISOString().split('T')[0]}`);
      return;
    }

    const data = filteredPrograms.map(p => ({
      ID_Program: p.id,
      Pilar: p.pilar,
      Nama_Program: p.namaProgram,
      PJ: p.penanggungJawab,
      Status: p.status
    }));
    exportToCSV(data, `Laporan_${jenisLaporan}_LENTERA_${new Date().toISOString().split('T')[0]}`);
  };

  const reportTitles: Record<string, string> = {
    keseluruhan: 'LAPORAN AKUNTABILITAS KESELURUHAN PROGRAM LENTERA',
    pilar: 'LAPORAN CAPAIAN PROGRAM PER PILAR LENTERA',
    semester: 'LAPORAN PELAKSANAAN PROGRAM SEMESTER ' + filterSemester.toUpperCase() + ' ' + filterTahun,
    tahunan: 'LAPORAN TAHUNAN AKHIR PERIODE LENTERA ' + filterTahun,
    belum_terlaksana: 'LAPORAN PROGRAM KERJA DALAM ANTREAN (BELUM TERLAKSANA)',
    monitoring: 'LAPORAN PENJAMINAN MUTU & MONITORING PROGRAM',
    evaluasi_pemantauan: 'LAPORAN HASIL EVALUASI & PEMANTAUAN KEGIATAN LENTERA'
  };

  const getBadgeHasil = (hasil: HasilPemantauan) => {
    switch (hasil) {
      case 'Sangat baik':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Baik':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Cukup':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Kurang':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel (Screen only, hidden on print) */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pusat Laporan Otomatis LENTERA</h2>
              <p className="text-xs text-slate-500">
                Pilih jenis laporan untuk menyusun dokumen evaluasi resmi siap cetak / PDF dan ekspor
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Dokumen Laporan
            </label>
            <select
              value={jenisLaporan}
              onChange={e => setJenisLaporan(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="keseluruhan">1. Laporan Keseluruhan 7 Pilar</option>
              <option value="evaluasi_pemantauan">⭐ 2. Laporan Hasil Evaluasi & Pemantauan Kegiatan</option>
              <option value="pilar">3. Laporan Khusus per Pilar</option>
              <option value="semester">4. Laporan per Semester</option>
              <option value="tahunan">5. Laporan Tahunan Sekolah</option>
              <option value="belum_terlaksana">6. Laporan Kegiatan Belum Terlaksana</option>
              <option value="monitoring">7. Laporan Monitoring & Evaluasi Mutu</option>
            </select>
          </div>

          {jenisLaporan === 'evaluasi_pemantauan' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filter Hasil Pemantauan
              </label>
              <select
                value={filterHasilPemantauan}
                onChange={e => setFilterHasilPemantauan(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="ALL">Semua Hasil Pemantauan</option>
                <option value="Sangat baik">Sangat Baik ({countSangatBaik})</option>
                <option value="Baik">Baik ({countBaik})</option>
                <option value="Cukup">Cukup ({countCukup})</option>
                <option value="Kurang">Kurang ({countKurang})</option>
              </select>
            </div>
          )}

          {(jenisLaporan === 'pilar' || jenisLaporan === 'evaluasi_pemantauan') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Pilar</label>
              <select
                value={filterPilar}
                onChange={e => setFilterPilar(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="ALL">Semua Pilar</option>
                {PILAR_LENTERA.map(p => (
                  <option key={p.code} value={p.code}>
                    {p.akronim}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
            <select
              value={filterSemester}
              onChange={e => setFilterSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Pelajaran</label>
            <input
              type="text"
              value={filterTahun}
              onChange={e => setFilterTahun(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL REPORT CANVAS */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-lg text-slate-900 font-sans print:border-none print:shadow-none print:p-0">
        {/* KOP SURAT SEKOLAH RESMI */}
        <div className="border-b-4 border-double border-slate-900 pb-4 text-center relative flex items-center justify-between">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 hidden sm:block">
            <img
              src={pengaturan.logo}
              alt="Logo Sekolah"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center px-4">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-600">
              PEMERINTAH PROVINSI BALI &bull; DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA
            </h4>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 mt-0.5">
              {pengaturan.namaSekolah}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {pengaturan.alamat} &bull; Telp: {pengaturan.teleponSekolah || '(0361) 8945231'}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Email: {pengaturan.emailSekolah} &bull; Website: {pengaturan.websiteSekolah}
            </p>
          </div>

          <div className="w-20 h-20 rounded-xl bg-blue-900/10 border border-blue-900/20 p-2 shrink-0 hidden sm:flex flex-col items-center justify-center text-center">
            <Award className="w-8 h-8 text-amber-600" />
            <span className="text-[9px] font-bold text-blue-900 mt-0.5">SDM BALI</span>
          </div>
        </div>

        {/* JUDUL LAPORAN */}
        <div className="text-center my-6">
          <h3 className="text-base sm:text-lg font-extrabold uppercase underline tracking-wide text-slate-900">
            {reportTitles[jenisLaporan] || 'LAPORAN AKUNTABILITAS KINERJA PROGRAM LENTERA'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Tahun Pelajaran: <strong>{filterTahun}</strong> &bull; Semester: <strong>{filterSemester}</strong>
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Dicetak otomatis dari Sistem Informasi Manajemen LENTERA pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
          </p>
        </div>

        {/* KONTEN JIKA MEMILIH LAPORAN EVALUASI & PEMANTAUAN KEGIATAN */}
        {jenisLaporan === 'evaluasi_pemantauan' ? (
          <div className="space-y-6">
            {/* Rekapitulasi Hasil Pemantauan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-300">
              <div className="p-3 bg-white rounded-lg border border-emerald-200 text-center">
                <span className="text-[11px] font-semibold text-emerald-800 block">Sangat Baik</span>
                <span className="text-xl font-black text-emerald-700">{countSangatBaik}</span>
                <span className="text-[10px] text-slate-400 block">Kegiatan Optimal</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                <span className="text-[11px] font-semibold text-blue-800 block">Baik</span>
                <span className="text-xl font-black text-blue-700">{countBaik}</span>
                <span className="text-[10px] text-slate-400 block">Sesuai Indikator</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-center">
                <span className="text-[11px] font-semibold text-amber-800 block">Cukup</span>
                <span className="text-xl font-black text-amber-700">{countCukup}</span>
                <span className="text-[10px] text-slate-400 block">Perlu Pendampingan</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-rose-200 text-center">
                <span className="text-[11px] font-semibold text-rose-800 block">Kurang</span>
                <span className="text-xl font-black text-rose-700">{countKurang}</span>
                <span className="text-[10px] text-slate-400 block">Perlu Intervensi Segera</span>
              </div>
            </div>

            {/* Tabel Detail Pemantauan & Evaluasi */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                    <th className="border border-slate-300 p-2.5 w-10 text-center">No</th>
                    <th className="border border-slate-300 p-2.5 w-28">ID & Tanggal</th>
                    <th className="border border-slate-300 p-2.5">Jenis / Nama Kegiatan & Pilar</th>
                    <th className="border border-slate-300 p-2.5 w-32 text-center">Hasil Pemantauan</th>
                    <th className="border border-slate-300 p-2.5">Keterangan Pemantauan / Observasi</th>
                    <th className="border border-slate-300 p-2.5 w-44">Tindak Lanjut / Saran</th>
                    <th className="border border-slate-300 p-2.5 w-32">Petugas Pemantau</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {filteredEvaluasi.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="border border-slate-300 p-6 text-center text-slate-400">
                        Belum ada data evaluasi pemantauan yang sesuai kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredEvaluasi.map((item, index) => (
                      <tr key={item.id} className="align-top hover:bg-slate-50/50">
                        <td className="border border-slate-300 p-2.5 text-center font-bold">
                          {index + 1}
                        </td>
                        <td className="border border-slate-300 p-2.5">
                          <div className="font-mono font-bold text-purple-900">{item.id}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.tanggalPemantauan}</div>
                        </td>
                        <td className="border border-slate-300 p-2.5">
                          <div className="font-bold text-slate-900">{item.jenisKegiatan}</div>
                          <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            {item.pilar}
                          </span>
                        </td>
                        <td className="border border-slate-300 p-2.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getBadgeHasil(item.hasilPemantauan)}`}>
                            {item.hasilPemantauan}
                          </span>
                        </td>
                        <td className="border border-slate-300 p-2.5 text-slate-800 leading-relaxed text-[11px]">
                          {item.keterangan}
                        </td>
                        <td className="border border-slate-300 p-2.5 text-slate-700 leading-relaxed text-[11px]">
                          {item.tindakLanjutSaran || '-'}
                        </td>
                        <td className="border border-slate-300 p-2.5 text-slate-800 font-semibold text-[11px]">
                          {item.pemantau}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TABEL LAPORAN KEGIATAN STANDARD PROGRAM */
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse border border-slate-400 text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                  <th className="border border-slate-300 p-2 w-10 text-center">No</th>
                  <th className="border border-slate-300 p-2 w-24">ID & Pilar</th>
                  <th className="border border-slate-300 p-2">Nama Program & Tujuan</th>
                  <th className="border border-slate-300 p-2 w-32">Waktu & Sasaran</th>
                  <th className="border border-slate-300 p-2 w-32">Penanggung Jawab</th>
                  <th className="border border-slate-300 p-2">Uraian Realisasi & Hasil</th>
                  <th className="border border-slate-300 p-2 w-24 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {filteredPrograms.map((prg, index) => {
                  const pel = pelaksanaans.find(e => e.idProgram === prg.id);
                  return (
                    <tr key={prg.id} className="align-top">
                      <td className="border border-slate-300 p-2 text-center font-bold">
                        {index + 1}
                      </td>
                      <td className="border border-slate-300 p-2">
                        <div className="font-mono font-bold text-blue-900">{prg.id}</div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{prg.pilar}</div>
                      </td>
                      <td className="border border-slate-300 p-2">
                        <div className="font-bold text-slate-900">{prg.namaProgram}</div>
                        <div className="text-[11px] text-slate-600 mt-1 italic">
                          <strong>Tujuan:</strong> {prg.tujuan}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          <strong>Indikator:</strong> {prg.indikator}
                        </div>
                      </td>
                      <td className="border border-slate-300 p-2 text-[11px]">
                        <div>{prg.waktuPelaksanaan || `${prg.tanggalMulai} s/d ${prg.tanggalSelesai}`}</div>
                        <div className="text-[10px] text-slate-500 mt-1 font-medium">{prg.sasaran}</div>
                      </td>
                      <td className="border border-slate-300 p-2 text-[11px] font-semibold">
                        {prg.penanggungJawab}
                      </td>
                      <td className="border border-slate-300 p-2 text-[11px]">
                        {pel ? (
                          <div className="space-y-1">
                            <p><strong>Uraian:</strong> {pel.uraian}</p>
                            <p className="text-slate-800"><strong>Hasil:</strong> {pel.hasil}</p>
                            {pel.kendala && (
                              <p className="text-rose-700"><strong>Kendala:</strong> {pel.kendala}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            Belum ada pencatatan realisasi
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-[10px]">
                        {prg.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* DOKUMENTASI FOTO TERPILIH */}
        <div className="mt-8 pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            Lampiran Dokumentasi Visual Kegiatan LENTERA
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {dokumentasis.slice(0, 4).map(doc => (
              <div key={doc.id} className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 p-1">
                <div className="aspect-video w-full rounded overflow-hidden">
                  <img src={doc.urlDrive} alt={doc.namaFile} className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] font-medium text-slate-700 mt-1 line-clamp-1">
                  {doc.keterangan}
                </p>
                <span className="text-[9px] text-slate-400">{doc.tanggalUpload}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TANDA TANGAN KEPALA SEKOLAH & KOORDINATOR */}
        <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-900 mt-0.5">Kepala {pengaturan.namaSekolah}</p>
            <div className="h-20" /> {/* Space for signature & stamp */}
            <p className="font-bold underline text-slate-900 uppercase">
              {pengaturan.kepalaSekolah}
            </p>
            <p className="text-slate-600 font-mono text-[11px]">
              NIP. {pengaturan.nipKepalaSekolah}
            </p>
          </div>

          <div>
            <p className="text-slate-600">Denpasar, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            <p className="font-bold text-slate-900 mt-0.5">Koordinator Program LENTERA</p>
            <div className="h-20" /> {/* Space for signature */}
            <p className="font-bold underline text-slate-900 uppercase">
              {pengaturan.koordinatorLentera}
            </p>
            <p className="text-slate-600 font-mono text-[11px]">
              NIP. {pengaturan.nipKoordinator}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
