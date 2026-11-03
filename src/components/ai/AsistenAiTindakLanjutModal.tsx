import React, { useState } from 'react';
import { ProgramItem, EvaluasiPemantauanItem, MonitoringItem, PilarInfo } from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import {
  Sparkles,
  X,
  Search,
  Globe,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Printer,
  RefreshCw,
  Lightbulb,
  ExternalLink,
  ShieldAlert,
  Award,
  Layers,
  Flame,
  Plus
} from 'lucide-react';

interface AsistenAiTindakLanjutModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: ProgramItem[];
  evaluasiList: EvaluasiPemantauanItem[];
  monitorings: MonitoringItem[];
  onApplyNewProgram?: (suggestedName: string, pilarAkronim: string, deskripsi: string) => void;
}

export const AsistenAiTindakLanjutModal: React.FC<AsistenAiTindakLanjutModalProps> = ({
  isOpen,
  onClose,
  programs,
  evaluasiList,
  monitorings,
  onApplyNewProgram
}) => {
  const [selectedPilarFilter, setSelectedPilarFilter] = useState<string>('ALL');
  const [userNotes, setUserNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Compute 7 pillars diagnostic summary
  const pilarMetrics = PILAR_LENTERA.map(pilar => {
    const list = programs.filter(p => p.pilarCode === pilar.code);
    const completed = list.filter(p => p.status === 'Selesai').length;
    const inProgress = list.filter(p => p.status === 'Sedang Berjalan').length;
    const planned = list.filter(p => p.status === 'Direncanakan').length;
    const pct = list.length > 0 ? Math.round((completed / list.length) * 100) : 0;
    
    // Check evaluations in this pillar
    const evals = evaluasiList.filter(e => e.pilarCode === pilar.code);
    const kurangCount = evals.filter(e => e.hasilPemantauan === 'Kurang').length;
    const cukupCount = evals.filter(e => e.hasilPemantauan === 'Cukup').length;

    return {
      code: pilar.code,
      name: pilar.name,
      akronim: pilar.akronim,
      totalPrograms: list.length,
      completed,
      inProgress,
      planned,
      realizationRate: `${pct}%`,
      evaluationsCount: evals.length,
      kurangCount,
      cukupCount
    };
  });

  // Recent problematic evaluations (Kurang & Cukup)
  const problematicEvaluasi = evaluasiList.filter(
    e => e.hasilPemantauan === 'Kurang' || e.hasilPemantauan === 'Cukup'
  );

  const handleGenerateAi = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setAiResult(null);
    setGroundingChunks([]);
    setSearchQueries([]);

    try {
      const payload = {
        pilarSummary: pilarMetrics,
        evaluasiSummary: evaluasiList.map(e => ({
          jenisKegiatan: e.jenisKegiatan,
          pilar: e.pilar,
          hasilPemantauan: e.hasilPemantauan,
          keterangan: e.keterangan,
          tindakLanjutSaran: e.tindakLanjutSaran,
          tanggal: e.tanggalPemantauan
        })),
        targetPilar: selectedPilarFilter,
        userNotes: userNotes.trim()
      };

      const response = await fetch('/api/ai/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setAiResult(data.recommendation);
        setGroundingChunks(data.groundingChunks || []);
        setSearchQueries(data.webSearchQueries || []);
      } else {
        setErrorMessage(data.message || 'Gagal memproses rekomendasi AI');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi gangguan jaringan atau server: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Asisten AI Tindak Lanjut Program LENTERA
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Google Search Grounded
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-light">
                Rekomendasi otomatis berbasis Capaian 7 Pilar, Data Evaluasi Lapangan, serta Pencarian Studi Kasus Sekolah Berhasil & Teori Pendidikan
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs bg-slate-50/50">
          {/* DIAGNOSTIC SUMMARY CARDS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wide">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Basis Data Diagnostik Sistem (Otomatis Dikirim ke AI)</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {evaluasiList.length} Catatan Pemantauan Terdata
              </span>
            </div>

            {/* Quick Warning on problematics */}
            {problematicEvaluasi.length > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Perlu Tindak Lanjut Segera:</span> Ditemukan{' '}
                  <strong>{problematicEvaluasi.length} kegiatan</strong> dengan hasil pemantauan{' '}
                  <span className="underline">Kurang</span> atau <span className="underline">Cukup</span>:
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {problematicEvaluasi.map(e => (
                      <span
                        key={e.id}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-rose-300 text-rose-900"
                      >
                        [{e.hasilPemantauan}] {e.jenisKegiatan}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pilar Progress Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
              {pilarMetrics.map(p => (
                <div
                  key={p.code}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-[11px]">{p.code}</span>
                    <span className="text-[10px] font-semibold text-slate-600">{p.realizationRate}</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-700 truncate mt-1" title={p.name}>
                    {p.name}
                  </p>
                  {(p.kurangCount > 0 || p.cukupCount > 0) && (
                    <span className="text-[9px] font-bold text-rose-600 mt-1">
                      ⚠️ {p.kurangCount + p.cukupCount} Perhatian
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PARAMETER SELECTION & TRIGGER BAR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fokus Pilar LENTERA
                </label>
                <select
                  value={selectedPilarFilter}
                  onChange={e => setSelectedPilarFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="ALL">Semua 7 Pilar (Analisis Komprehensif)</option>
                  {PILAR_LENTERA.map(p => (
                    <option key={p.code} value={p.akronim}>
                      {p.akronim}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Tambahan untuk AI (Opsional)
                </label>
                <input
                  type="text"
                  value={userNotes}
                  onChange={e => setUserNotes(e.target.value)}
                  placeholder="Contoh: Fokus pada peningkatan kompetensi siswa pra-UKK dan kemitraan DUDI hotel/IT Bali..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>AI akan mencari teori pendidikan & studi kasus sekolah berhasil di Google Search</span>
              </div>

              <button
                onClick={handleGenerateAi}
                disabled={isLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis 7 Pilar & Mencari Referensi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Buat Rekomendasi Tindak Lanjut dengan AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">Gagal Membuat Rekomendasi AI</h5>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* AI RESULT DISPLAY */}
          {aiResult && (
            <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-md space-y-5 animate-in fade-in">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Rencana Tindak Lanjut & Rekomendasi Ahli SIM LENTERA
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Dihasilkan secara cerdas dengan validasi Google Search Grounding
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak PDF</span>
                  </button>
                </div>
              </div>

              {/* Formatted Markdown Content */}
              <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-3 font-sans">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {aiResult}
                </div>
              </div>

              {/* GOOGLE SEARCH GROUNDING SOURCES / CITATIONS */}
              {groundingChunks && groundingChunks.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Rujukan Artikel, Studi Kasus & Sumber Eksternal Terverifikasi:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {groundingChunks.map((chunk, idx) => {
                      const web = chunk.web;
                      if (!web) return null;
                      return (
                        <a
                          key={idx}
                          href={web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:shadow-xs transition-all flex items-start justify-between gap-2 group"
                        >
                          <div>
                            <p className="font-semibold text-blue-900 group-hover:text-blue-700 line-clamp-1">
                              {web.title || web.uri}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono truncate block mt-0.5">
                              {web.uri}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Kecerdasan Buatan Terintegrasi &bull; Berstandar Kurikulum Merdeka & Tri Hita Karana
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
