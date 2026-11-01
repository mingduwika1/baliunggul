import React, { useState, useMemo } from 'react';
import { DokumentasiItem, ProgramItem, PelaksanaanItem } from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import { StorageService } from '../../services/storageService';
import {
  Images,
  Search,
  Filter,
  Camera,
  Film,
  FileText,
  Calendar,
  User,
  ExternalLink,
  X,
  Trash2,
  Download
} from 'lucide-react';

interface GaleriViewProps {
  dokumentasis: DokumentasiItem[];
  programs: ProgramItem[];
  pelaksanaans: PelaksanaanItem[];
  initialPelaksanaanId?: string;
}

export const GaleriView: React.FC<GaleriViewProps> = ({
  dokumentasis,
  programs,
  pelaksanaans,
  initialPelaksanaanId
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [selectedPilar, setSelectedPilar] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DokumentasiItem | null>(null);

  // Link doc to program & pelaksanaan
  const enrichedDocs = useMemo(() => {
    return dokumentasis.map(doc => {
      const pel = pelaksanaans.find(p => p.id === doc.idPelaksanaan);
      const prg = programs.find(p => p.id === doc.idProgram || (pel && p.id === pel.idProgram));
      return {
        ...doc,
        namaKegiatan: pel ? pel.namaKegiatan : prg ? prg.namaProgram : 'Kegiatan LENTERA',
        pilar: prg ? prg.pilar : '7 Pilar',
        pilarCode: prg ? prg.pilarCode : 'L',
        penanggungJawab: pel ? pel.penanggungJawab : prg ? prg.penanggungJawab : doc.pengunggah
      };
    });
  }, [dokumentasis, programs, pelaksanaans]);

  const filteredDocs = useMemo(() => {
    return enrichedDocs.filter(doc => {
      const matchType = activeTab === 'all' || doc.jenisFile === activeTab;
      const matchPilar = selectedPilar === 'ALL' || doc.pilarCode === selectedPilar || doc.pilar.includes(selectedPilar);
      const matchSearch =
        doc.namaFile.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.pengunggah.toLowerCase().includes(searchTerm.toLowerCase());
      const matchInitialPel = !initialPelaksanaanId || doc.idPelaksanaan === initialPelaksanaanId;
      return matchType && matchPilar && matchSearch && matchInitialPel;
    });
  }, [enrichedDocs, activeTab, selectedPilar, searchTerm, initialPelaksanaanId]);

  const handleDelete = (doc: DokumentasiItem) => {
    if (confirm(`Hapus file dokumentasi "${doc.namaFile}"?`)) {
      StorageService.deleteDokumentasi(doc.id);
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Type Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Images className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Galeri Bukti Dokumentasi Kegiatan</h2>
              <p className="text-xs text-slate-500">
                Arsip visual foto lapangan, video kegiatan, dan berkas autentik LENTERA tersimpan di Google Drive
              </p>
            </div>
          </div>
        </div>

        {/* Tab filters: All, Foto, Video, Dokumen */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            <span>Semua ({enrichedDocs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'image'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-blue-500" />
            <span>Foto</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'video'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-amber-500" />
            <span>Video</span>
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'document'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dokumen</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND PILAR FILTER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari foto, nama kegiatan, keterangan, atau pengunggah..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedPilar}
          onChange={e => setSelectedPilar(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
        >
          <option value="ALL">Semua 7 Pilar</option>
          {PILAR_LENTERA.map(p => (
            <option key={p.code} value={p.code}>
              {p.akronim}
            </option>
          ))}
        </select>
      </div>

      {/* GALLERY GRID */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
          <Images className="w-10 h-10 mx-auto mb-2 opacity-40 text-indigo-500" />
          <p className="text-xs">Tidak ada dokumentasi yang sesuai filter pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              <div className="aspect-video w-full bg-slate-900 relative overflow-hidden">
                <img
                  src={doc.urlDrive}
                  alt={doc.namaFile}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                    {doc.pilarCode}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="text-[10px] font-mono text-white/90 bg-slate-950/70 px-1.5 py-0.5 rounded">
                    {doc.fileSize || '3 MB'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-1.5">
                <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                  {doc.keterangan}
                </p>
                <p className="text-[11px] text-blue-700 font-medium truncate">
                  {doc.namaKegiatan}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {doc.tanggalUpload}
                  </span>
                  <span>Oleh: {doc.pengunggah.split(',')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX DETAIL MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {selectedDoc.id} &bull; Google Drive Storage
                </span>
                <h3 className="text-sm font-bold text-white line-clamp-1">{selectedDoc.namaFile}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-black flex items-center justify-center p-2 overflow-hidden max-h-[55vh]">
              <img
                src={selectedDoc.urlDrive}
                alt={selectedDoc.namaFile}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="p-5 bg-slate-900 space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Keterangan Dokumentasi:
                </h4>
                <p className="text-sm text-slate-200 mt-0.5">{selectedDoc.keterangan}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span className="block text-[10px] text-slate-500">ID Program / Pelaksanaan:</span>
                  <span className="font-mono text-slate-200">{selectedDoc.idProgram} / {selectedDoc.idPelaksanaan}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Tanggal Upload:</span>
                  <span className="text-slate-200">{selectedDoc.tanggalUpload}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Pengunggah:</span>
                  <span className="text-slate-200">{selectedDoc.pengunggah}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleDelete(selectedDoc)}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus File</span>
                </button>

                <a
                  href={selectedDoc.urlDrive}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <span>Buka di Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
