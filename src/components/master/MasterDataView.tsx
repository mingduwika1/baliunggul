import React, { useState } from 'react';
import { GuruItem, SiswaItem, KelasItem, MitraItem } from '../../types';
import { PILAR_LENTERA } from '../../data/initialData';
import { StorageService } from '../../services/storageService';
import { exportToExcel, exportToCSV } from '../../utils/exportUtils';
import {
  Database,
  Users,
  GraduationCap,
  Building,
  Briefcase,
  Layers,
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  X,
  Save,
  CheckCircle2
} from 'lucide-react';

interface MasterDataViewProps {
  gurus: GuruItem[];
  siswas: SiswaItem[];
  kelases: KelasItem[];
  mitras: MitraItem[];
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  gurus,
  siswas,
  kelases,
  mitras
}) => {
  const [activeTab, setActiveTab] = useState<'guru' | 'siswa' | 'kelas' | 'mitra' | 'pilar'>('guru');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [guruForm, setGuruForm] = useState<Partial<GuruItem>>({});
  const [siswaForm, setSiswaForm] = useState<Partial<SiswaItem>>({});
  const [kelasForm, setKelasForm] = useState<Partial<KelasItem>>({});
  const [mitraForm, setMitraForm] = useState<Partial<MitraItem>>({});

  const handleOpenAdd = () => {
    setEditingItem(null);
    if (activeTab === 'guru') {
      setGuruForm({
        id: `GRU-${String(gurus.length + 1).padStart(3, '0')}`,
        namaGuru: '',
        nip: '',
        jabatan: 'Guru Mata Pelajaran',
        mataPelajaran: '',
        email: '',
        status: 'Aktif'
      });
    } else if (activeTab === 'siswa') {
      setSiswaForm({
        id: `SIS-${String(siswas.length + 1).padStart(3, '0')}`,
        namaSiswa: '',
        nisn: '',
        kelas: 'X RPL 1',
        konsentrasiKeahlian: 'Rekayasa Perangkat Lunak',
        status: 'Aktif'
      });
    } else if (activeTab === 'kelas') {
      setKelasForm({
        id: `KLS-${String(kelases.length + 1).padStart(3, '0')}`,
        namaKelas: '',
        tingkat: 'X',
        konsentrasiKeahlian: '',
        waliKelas: gurus[0]?.namaGuru || ''
      });
    } else if (activeTab === 'mitra') {
      setMitraForm({
        id: `MTR-${String(mitras.length + 1).padStart(3, '0')}`,
        namaMitra: '',
        jenisMitra: 'DUDI',
        alamat: 'Denpasar, Bali',
        kontak: '',
        keterangan: 'Mitra Pembelajaran LENTERA'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'guru') setGuruForm(item);
    else if (activeTab === 'siswa') setSiswaForm(item);
    else if (activeTab === 'kelas') setKelasForm(item);
    else if (activeTab === 'mitra') setMitraForm(item);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'guru') {
      StorageService.saveGuru(guruForm as GuruItem);
    } else if (activeTab === 'siswa') {
      StorageService.saveSiswa(siswaForm as SiswaItem);
    } else if (activeTab === 'kelas') {
      StorageService.saveKelas(kelasForm as KelasItem);
    } else if (activeTab === 'mitra') {
      StorageService.saveMitra(mitraForm as MitraItem);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus item data master ini?')) {
      if (activeTab === 'guru') StorageService.deleteGuru(id);
      else if (activeTab === 'siswa') StorageService.deleteSiswa(id);
      else if (activeTab === 'kelas') StorageService.deleteKelas(id);
      else if (activeTab === 'mitra') StorageService.deleteMitra(id);
    }
  };

  const handleExport = () => {
    if (activeTab === 'guru') exportToExcel(gurus, 'Data_Guru_LENTERA');
    else if (activeTab === 'siswa') exportToExcel(siswas, 'Data_Siswa_LENTERA');
    else if (activeTab === 'kelas') exportToExcel(kelases, 'Data_Kelas_LENTERA');
    else if (activeTab === 'mitra') exportToExcel(mitras, 'Data_Mitra_LENTERA');
    else if (activeTab === 'pilar') exportToExcel(PILAR_LENTERA, 'Data_7_Pilar_LENTERA');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Manajemen Data Master Sekolah</h2>
              <p className="text-xs text-slate-500">
                Pusat data Guru/Pegawai, Siswa, Kelas, Mitra Industri DUDI, dan Master 7 Pilar
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>

          {activeTab !== 'pilar' && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('guru')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'guru' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Guru & Pegawai ({gurus.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('siswa')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'siswa' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
          <span>Peserta Didik ({siswas.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('kelas')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'kelas' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-amber-600" />
          <span>Rombel & Kelas ({kelases.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('mitra')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'mitra' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-purple-600" />
          <span>Mitra DUDI ({mitras.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('pilar')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'pilar' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Master 7 Pilar (7)</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari data master..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ACTIVE TAB CONTENT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'guru' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px]">
                  <th className="p-3 w-24">ID</th>
                  <th className="p-3">Nama Lengkap & Gelar</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Jabatan</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gurus
                  .filter(g => g.namaGuru.toLowerCase().includes(searchTerm.toLowerCase()) || g.nip.includes(searchTerm))
                  .map(g => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">{g.id}</td>
                      <td className="p-3 font-semibold text-slate-900">{g.namaGuru}</td>
                      <td className="p-3 font-mono text-slate-600">{g.nip}</td>
                      <td className="p-3 text-slate-700">{g.jabatan}</td>
                      <td className="p-3 text-slate-600">{g.mataPelajaran}</td>
                      <td className="p-3 text-slate-500">{g.email}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {g.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button onClick={() => handleOpenEdit(g)} className="p-1.5 rounded bg-blue-50 text-blue-700">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded bg-rose-50 text-rose-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTab === 'siswa' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px]">
                  <th className="p-3 w-24">ID</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Konsentrasi Keahlian</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siswas
                  .filter(s => s.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm))
                  .map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">{s.id}</td>
                      <td className="p-3 font-semibold text-slate-900">{s.namaSiswa}</td>
                      <td className="p-3 font-mono text-slate-600">{s.nisn}</td>
                      <td className="p-3 font-semibold text-slate-800">{s.kelas}</td>
                      <td className="p-3 text-slate-600">{s.konsentrasiKeahlian}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button onClick={() => handleOpenEdit(s)} className="p-1.5 rounded bg-blue-50 text-blue-700">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded bg-rose-50 text-rose-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTab === 'kelas' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px]">
                  <th className="p-3 w-24">ID Kelas</th>
                  <th className="p-3">Nama Kelas</th>
                  <th className="p-3">Tingkat</th>
                  <th className="p-3">Konsentrasi Keahlian</th>
                  <th className="p-3">Wali Kelas</th>
                  <th className="p-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kelases.map(k => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-700">{k.id}</td>
                    <td className="p-3 font-semibold text-slate-900">{k.namaKelas}</td>
                    <td className="p-3 text-slate-700">{k.tingkat}</td>
                    <td className="p-3 text-slate-600">{k.konsentrasiKeahlian}</td>
                    <td className="p-3 text-slate-800 font-medium">{k.waliKelas}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button onClick={() => handleOpenEdit(k)} className="p-1.5 rounded bg-blue-50 text-blue-700">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(k.id)} className="p-1.5 rounded bg-rose-50 text-rose-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'mitra' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px]">
                  <th className="p-3 w-24">ID Mitra</th>
                  <th className="p-3">Nama Mitra Industri / Lembaga</th>
                  <th className="p-3">Jenis Mitra</th>
                  <th className="p-3">Alamat</th>
                  <th className="p-3">Kontak</th>
                  <th className="p-3">Keterangan Kerjasama</th>
                  <th className="p-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mitras.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-700">{m.id}</td>
                    <td className="p-3 font-semibold text-slate-900">{m.namaMitra}</td>
                    <td className="p-3 text-slate-700">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-semibold">{m.jenisMitra}</span>
                    </td>
                    <td className="p-3 text-slate-600">{m.alamat}</td>
                    <td className="p-3 text-slate-600">{m.kontak}</td>
                    <td className="p-3 text-slate-500">{m.keterangan}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button onClick={() => handleOpenEdit(m)} className="p-1.5 rounded bg-blue-50 text-blue-700">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded bg-rose-50 text-rose-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'pilar' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {PILAR_LENTERA.map(p => (
                <div key={p.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-3">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shrink-0"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.letter}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                    <p className="text-xs text-blue-700 font-medium">{p.akronim}</p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{p.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CRUD MODAL FOR MASTER DATA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingItem ? 'Edit Data Master' : 'Tambah Data Master Baru'} ({activeTab.toUpperCase()})
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3 text-xs">
              {activeTab === 'guru' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Guru Lengkap</label>
                    <input
                      type="text"
                      required
                      value={guruForm.namaGuru || ''}
                      onChange={e => setGuruForm({ ...guruForm, namaGuru: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NIP</label>
                    <input
                      type="text"
                      value={guruForm.nip || ''}
                      onChange={e => setGuruForm({ ...guruForm, nip: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jabatan</label>
                    <input
                      type="text"
                      value={guruForm.jabatan || ''}
                      onChange={e => setGuruForm({ ...guruForm, jabatan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                    <input
                      type="text"
                      value={guruForm.mataPelajaran || ''}
                      onChange={e => setGuruForm({ ...guruForm, mataPelajaran: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </>
              )}

              {activeTab === 'siswa' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Siswa</label>
                    <input
                      type="text"
                      required
                      value={siswaForm.namaSiswa || ''}
                      onChange={e => setSiswaForm({ ...siswaForm, namaSiswa: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                    <input
                      type="text"
                      value={siswaForm.nisn || ''}
                      onChange={e => setSiswaForm({ ...siswaForm, nisn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                    <input
                      type="text"
                      value={siswaForm.kelas || ''}
                      onChange={e => setSiswaForm({ ...siswaForm, kelas: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </>
              )}

              {activeTab === 'mitra' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Mitra</label>
                    <input
                      type="text"
                      required
                      value={mitraForm.namaMitra || ''}
                      onChange={e => setMitraForm({ ...mitraForm, namaMitra: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Alamat</label>
                    <input
                      type="text"
                      value={mitraForm.alamat || ''}
                      onChange={e => setMitraForm({ ...mitraForm, alamat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kontak Person</label>
                    <input
                      type="text"
                      value={mitraForm.kontak || ''}
                      onChange={e => setMitraForm({ ...mitraForm, kontak: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
