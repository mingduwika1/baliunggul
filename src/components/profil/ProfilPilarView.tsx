import React, { useState } from 'react';
import { PILAR_LENTERA } from '../../data/initialData';
import { PilarInfo, ProgramItem } from '../../types';
import { 
  BookOpen, 
  Cpu, 
  HeartHandshake, 
  Landmark, 
  Briefcase, 
  TrendingUp, 
  Sparkles,
  Target,
  Users,
  Compass,
  CheckCircle,
  ArrowRight,
  Plus
} from 'lucide-react';

interface ProfilPilarViewProps {
  programs: ProgramItem[];
  onOpenProgramModal: (prg?: ProgramItem, defaultPilar?: string) => void;
  onNavigateToPerencanaan: (pilarCode: string) => void;
}

export const ProfilPilarView: React.FC<ProfilPilarViewProps> = ({
  programs,
  onOpenProgramModal,
  onNavigateToPerencanaan
}) => {
  const [selectedPilar, setSelectedPilar] = useState<PilarInfo>(PILAR_LENTERA[0]);

  const getPilarIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-6 h-6" />;
      case 'Cpu': return <Cpu className="w-6 h-6" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6" />;
      case 'Landmark': return <Landmark className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      default: return <Compass className="w-6 h-6" />;
    }
  };

  const relatedPrograms = programs.filter(p => p.pilarCode === selectedPilar.code);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Kerangka Dasar Transformasi Sekolah
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Tujuh Pilar Unggulan LENTERA
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Filosofi holistik pengembangan generasi muda Bali: Literasi & Numerasi, Eksplorasi Teknologi, Nilai Karakter, Tradisi & Budaya Lokal, Etos Kerja & Kompetensi, Rintis Kewirausahaan, serta Adaptif & Inovatif.
            </p>
          </div>
          <button
            onClick={() => onOpenProgramModal(undefined, selectedPilar.akronim)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Program di Pilar Ini</span>
          </button>
        </div>
      </div>

      {/* 7 Pilar Interactive Card Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {PILAR_LENTERA.map(pilar => {
          const isSelected = selectedPilar.code === pilar.code;
          const count = programs.filter(p => p.pilarCode === pilar.code).length;

          return (
            <div
              key={pilar.code}
              onClick={() => setSelectedPilar(pilar)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-blue-500 shadow-md ring-2 ring-blue-500/30 -translate-y-0.5'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs"
                  style={{
                    backgroundColor: isSelected ? pilar.color : `${pilar.color}15`,
                    color: isSelected ? '#ffffff' : pilar.color
                  }}
                >
                  {pilar.letter}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count} Prog
                </span>
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold leading-tight line-clamp-2">
                  {pilar.name}
                </h4>
                <p className={`text-[10px] mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {pilar.akronim}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Pilar Deep-Dive Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Pilar Header Banner */}
        <div
          className="p-6 text-white"
          style={{
            background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, ${selectedPilar.color} 100%)`
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
                style={{ backgroundColor: selectedPilar.color }}
              >
                {getPilarIcon(selectedPilar.iconName)}
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                  PILAR {selectedPilar.letter}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {selectedPilar.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Akronim Resmi: <strong className="text-amber-300">{selectedPilar.akronim}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToPerencanaan(selectedPilar.code)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 backdrop-blur-xs flex items-center gap-1.5 self-start sm:self-auto transition-all"
            >
              <span>Buka di Tabel Spreadsheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pillar Details Grid (Deskripsi, Tujuan, Sasaran, Strategi, Indikator) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
          {/* Deskripsi & Tujuan */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Deskripsi Pilar</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedPilar.deskripsi}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Tujuan Utama</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedPilar.tujuan}
              </p>
            </div>
          </div>

          {/* Sasaran, Strategi, Indikator */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Sasaran Peserta</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedPilar.sasaran}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Strategi Pelaksanaan</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedPilar.strategi}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold uppercase tracking-wider mb-1.5">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                <span>Indikator Keberhasilan</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {selectedPilar.indikator}
              </p>
            </div>
          </div>
        </div>

        {/* Linked Programs Section */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Program Terkait Pilar {selectedPilar.letter} ({relatedPrograms.length})
              </h4>
              <p className="text-xs text-slate-500">
                Daftar program yang terdaftar dan sedang dijalankan dalam pilar {selectedPilar.name}
              </p>
            </div>
            <button
              onClick={() => onOpenProgramModal(undefined, selectedPilar.akronim)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>+ Buat Baru</span>
            </button>
          </div>

          {relatedPrograms.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-xs text-slate-500">Belum ada program untuk pilar ini.</p>
              <button
                onClick={() => onOpenProgramModal(undefined, selectedPilar.akronim)}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                + Tambah Program Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedPrograms.map(prg => (
                <div
                  key={prg.id}
                  onClick={() => onOpenProgramModal(prg)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {prg.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prg.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700'
                            : prg.status === 'Sedang Berjalan'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {prg.status}
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-800 mt-2 line-clamp-2">
                      {prg.namaProgram}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {prg.deskripsi}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>PJ: <strong className="text-slate-700">{prg.penanggungJawab.split(',')[0]}</strong></span>
                    <span>{prg.tanggalMulai}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
