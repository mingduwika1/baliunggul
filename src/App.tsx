/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import {
  ProgramItem,
  PelaksanaanItem,
  DokumentasiItem,
  MonitoringItem,
  EvaluasiPemantauanItem,
  GuruItem,
  SiswaItem,
  KelasItem,
  MitraItem,
  PengaturanSekolah,
  UserSession,
  UserRole
} from './types';

// Layout Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// View Components
import { DashboardView } from './components/dashboard/DashboardView';
import { ProfilPilarView } from './components/profil/ProfilPilarView';
import { PerencanaanView } from './components/perencanaan/PerencanaanView';
import { JadwalView } from './components/jadwal/JadwalView';
import { PelaksanaanView } from './components/pelaksanaan/PelaksanaanView';
import { MonitoringView } from './components/monitoring/MonitoringView';
import { LaporanView } from './components/laporan/LaporanView';
import { GaleriView } from './components/galeri/GaleriView';
import { MasterDataView } from './components/master/MasterDataView';
import { PengaturanView } from './components/pengaturan/PengaturanView';

// Modal Components
import { ProgramFormModal } from './components/perencanaan/ProgramFormModal';
import { PelaksanaanFormModal } from './components/pelaksanaan/PelaksanaanFormModal';
import { EvaluasiFormModal } from './components/evaluasi/EvaluasiFormModal';
import { AsistenAiTindakLanjutModal } from './components/ai/AsistenAiTindakLanjutModal';
import { GasHubModal } from './components/gas/GasHubModal';
import { PrintableKegiatanModal } from './components/laporan/PrintableKegiatanModal';

export default function App() {
  // State untuk status sinkronisasi & notifikasi toast
  const [isSyncingGas, setIsSyncingGas] = useState(false);
  const [gasToast, setGasToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize initial data in LocalStorage & otomatis tarik dari Google Apps Script jika URL sudah disetel
  useEffect(() => {
    StorageService.initData();
    const cfg = StorageService.getPengaturan();
    if (cfg.gasWebAppUrl) {
      StorageService.pullFromGas(cfg.gasWebAppUrl).then(res => {
        if (res.success && res.count && (res.count.programs > 0 || res.count.pelaksanaans > 0 || res.count.evaluasis > 0)) {
          setGasToast({ message: res.message, type: 'success' });
          setTimeout(() => setGasToast(null), 5000);
        }
      });
    }
  }, []);

  const handleSyncGasNow = async () => {
    setIsSyncingGas(true);
    setGasToast({ message: 'Menghubungkan ke Google Apps Script & menarik data Spreadsheet...', type: 'info' });
    const res = await StorageService.pullFromGas();
    setIsSyncingGas(false);
    if (res.success) {
      setGasToast({ message: res.message, type: 'success' });
      setTimeout(() => setGasToast(null), 5000);
    } else {
      setGasToast({ message: res.message, type: 'error' });
      setTimeout(() => setGasToast(null), 6000);
    }
  };

  // Reactive State loaded from storage service
  const [pengaturan, setPengaturan] = useState<PengaturanSekolah>(StorageService.getPengaturan());
  const [programs, setPrograms] = useState<ProgramItem[]>(StorageService.getPrograms());
  const [pelaksanaans, setPelaksanaans] = useState<PelaksanaanItem[]>(StorageService.getPelaksanaan());
  const [dokumentasis, setDokumentasis] = useState<DokumentasiItem[]>(StorageService.getDokumentasi());
  const [monitorings, setMonitorings] = useState<MonitoringItem[]>(StorageService.getMonitoring());
  const [evaluasiList, setEvaluasiList] = useState<EvaluasiPemantauanItem[]>(StorageService.getEvaluasiPemantauan());
  const [gurus, setGurus] = useState<GuruItem[]>(StorageService.getGuru());
  const [siswas, setSiswas] = useState<SiswaItem[]>(StorageService.getSiswa());
  const [kelases, setKelases] = useState<KelasItem[]>(StorageService.getKelas());
  const [mitras, setMitras] = useState<MitraItem[]>(StorageService.getMitra());
  const [currentUser, setCurrentUser] = useState<UserSession>(StorageService.getCurrentUser());

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = StorageService.subscribe(() => {
      setPengaturan(StorageService.getPengaturan());
      setPrograms(StorageService.getPrograms());
      setPelaksanaans(StorageService.getPelaksanaan());
      setDokumentasis(StorageService.getDokumentasi());
      setMonitorings(StorageService.getMonitoring());
      setEvaluasiList(StorageService.getEvaluasiPemantauan());
      setGurus(StorageService.getGuru());
      setSiswas(StorageService.getSiswa());
      setKelases(StorageService.getKelas());
      setMitras(StorageService.getMitra());
      setCurrentUser(StorageService.getCurrentUser());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [perencanaanPilarFilter, setPerencanaanPilarFilter] = useState<string>('ALL');
  const [laporanInitialType, setLaporanInitialType] = useState<string | undefined>(undefined);

  // Modal Controls
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<ProgramItem | null>(null);
  const [defaultPilarAkronim, setDefaultPilarAkronim] = useState<string | undefined>(undefined);

  const [isPelaksanaanModalOpen, setIsPelaksanaanModalOpen] = useState(false);
  const [pelaksanaanToEdit, setPelaksanaanToEdit] = useState<PelaksanaanItem | null>(null);
  const [defaultProgramForPelaksanaan, setDefaultProgramForPelaksanaan] = useState<ProgramItem | null>(null);

  // Evaluasi & AI Assistant Modals
  const [isEvaluasiModalOpen, setIsEvaluasiModalOpen] = useState(false);
  const [isAiAssistantModalOpen, setIsAiAssistantModalOpen] = useState(false);

  const [isGasHubOpen, setIsGasHubOpen] = useState(false);

  const [isPrintKegiatanModalOpen, setIsPrintKegiatanModalOpen] = useState(false);
  const [pelaksanaanToPrint, setPelaksanaanToPrint] = useState<PelaksanaanItem | null>(null);

  const [galeriInitialPelId, setGaleriInitialPelId] = useState<string | undefined>(undefined);

  // Overdue count calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = programs.filter(
    p => p.tanggalSelesai < todayStr && p.status !== 'Selesai'
  ).length;

  // Role switching
  const handleSelectRole = (newRole: UserRole) => {
    let name = 'Dr. Drs. I Nyoman Suardika, M.Pd.';
    let email = 'kepsek@smkn1balischool.sch.id';

    if (newRole === 'KOORDINATOR') {
      name = 'Ni Luh Made Ayu Pradnyani, S.Pd., M.Ed.';
      email = 'ayu.pradnyani@smkn1balischool.sch.id';
    } else if (newRole === 'GURU') {
      name = 'I Kadek Sudarma, M.Kom.';
      email = 'kadek.sudarma@smkn1balischool.sch.id';
    } else if (newRole === 'ADMIN') {
      name = 'Administrator SIM LENTERA';
      email = 'admin@smkn1balischool.sch.id';
    }

    const updatedUser: UserSession = {
      id: `USR-${newRole}`,
      nama: name,
      email: email,
      role: newRole
    };
    StorageService.setCurrentUser(updatedUser);
  };

  // Cross-Navigation Helpers
  const handleNavigate = (tab: string, filter?: any) => {
    if (tab === 'perencanaan' && filter?.pilarCode) {
      setPerencanaanPilarFilter(filter.pilarCode);
    }
    if (tab === 'laporan' && filter?.reportType) {
      setLaporanInitialType(filter.reportType);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProgramModal = (prg?: ProgramItem, defaultPilar?: string) => {
    setProgramToEdit(prg || null);
    setDefaultPilarAkronim(defaultPilar);
    setIsProgramModalOpen(true);
  };

  const handleOpenPelaksanaanModal = (pel?: PelaksanaanItem) => {
    setPelaksanaanToEdit(pel || null);
    setDefaultProgramForPelaksanaan(null);
    setIsPelaksanaanModalOpen(true);
  };

  const handleOpenPelaksanaanWithProgram = (prg: ProgramItem) => {
    setPelaksanaanToEdit(null);
    setDefaultProgramForPelaksanaan(prg);
    setIsPelaksanaanModalOpen(true);
  };

  const handleViewGaleriForPelaksanaan = (pelId: string) => {
    setGaleriInitialPelId(pelId);
    setActiveTab('galeri');
  };

  const handlePrintKegiatan = (pel: PelaksanaanItem) => {
    setPelaksanaanToPrint(pel);
    setIsPrintKegiatanModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Poppins',sans-serif]">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        pengaturan={pengaturan}
        onSelectRole={handleSelectRole}
        onOpenGasHub={() => setIsGasHubOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        onNavigate={handleNavigate}
        onSyncGas={handleSyncGasNow}
        isSyncing={isSyncingGas}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab === 'gas-hub' ? 'dashboard' : activeTab}
          setActiveTab={tab => {
            if (tab === 'gas-hub') {
              setIsGasHubOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          userRole={currentUser.role}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
          programCount={programs.length}
          pelaksanaanCount={pelaksanaans.length}
          overdueCount={overdueCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
          {activeTab === 'dashboard' && (
            <DashboardView
              programs={programs}
              pelaksanaans={pelaksanaans}
              dokumentasis={dokumentasis}
              monitorings={monitorings}
              evaluasiList={evaluasiList}
              onNavigate={handleNavigate}
              onOpenProgramModal={handleOpenProgramModal}
              onOpenPelaksanaanModal={() => handleOpenPelaksanaanModal()}
              onOpenEvaluasiModal={() => setIsEvaluasiModalOpen(true)}
              onOpenAiAssistantModal={() => setIsAiAssistantModalOpen(true)}
            />
          )}

          {activeTab === 'profil' && (
            <ProfilPilarView
              programs={programs}
              onOpenProgramModal={handleOpenProgramModal}
              onNavigateToPerencanaan={code => handleNavigate('perencanaan', { pilarCode: code })}
            />
          )}

          {activeTab === 'perencanaan' && (
            <PerencanaanView
              programs={programs}
              initialPilarFilter={perencanaanPilarFilter}
              onOpenProgramModal={handleOpenProgramModal}
              onOpenPelaksanaanWithProgram={handleOpenPelaksanaanWithProgram}
            />
          )}

          {activeTab === 'jadwal' && (
            <JadwalView
              programs={programs}
              pelaksanaans={pelaksanaans}
              onOpenProgramModal={handleOpenProgramModal}
              onOpenPelaksanaanModal={handleOpenPelaksanaanModal}
            />
          )}

          {activeTab === 'pelaksanaan' && (
            <PelaksanaanView
              pelaksanaans={pelaksanaans}
              dokumentasis={dokumentasis}
              onOpenModal={handleOpenPelaksanaanModal}
              onViewGaleriForPelaksanaan={handleViewGaleriForPelaksanaan}
              onPrintKegiatan={handlePrintKegiatan}
            />
          )}

          {activeTab === 'monitoring' && (
            <MonitoringView
              programs={programs}
              monitorings={monitorings}
            />
          )}

          {activeTab === 'laporan' && (
            <LaporanView
              programs={programs}
              pelaksanaans={pelaksanaans}
              dokumentasis={dokumentasis}
              monitorings={monitorings}
              evaluasiList={evaluasiList}
              pengaturan={pengaturan}
              initialReportType={laporanInitialType}
            />
          )}

          {activeTab === 'galeri' && (
            <GaleriView
              dokumentasis={dokumentasis}
              programs={programs}
              pelaksanaans={pelaksanaans}
              initialPelaksanaanId={galeriInitialPelId}
            />
          )}

          {activeTab === 'master' && (
            <MasterDataView
              gurus={gurus}
              siswas={siswas}
              kelases={kelases}
              mitras={mitras}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanView
              pengaturan={pengaturan}
              onOpenGasHub={() => setIsGasHubOpen(true)}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <ProgramFormModal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        programToEdit={programToEdit}
        defaultPilarAkronim={defaultPilarAkronim}
        onSaved={saved => {
          setPrograms(StorageService.getPrograms());
        }}
      />

      <PelaksanaanFormModal
        isOpen={isPelaksanaanModalOpen}
        onClose={() => setIsPelaksanaanModalOpen(false)}
        pelaksanaanToEdit={pelaksanaanToEdit}
        defaultProgram={defaultProgramForPelaksanaan}
        onSaved={saved => {
          setPelaksanaans(StorageService.getPelaksanaan());
          setDokumentasis(StorageService.getDokumentasi());
        }}
      />

      {/* MODAL INPUT PEMANTAUAN & EVALUASI */}
      <EvaluasiFormModal
        isOpen={isEvaluasiModalOpen}
        onClose={() => setIsEvaluasiModalOpen(false)}
        onSaved={saved => {
          setEvaluasiList(StorageService.getEvaluasiPemantauan());
          // Langsung arahkan ke laporan evaluasi agar pengguna melihat hasilnya
          handleNavigate('laporan', { reportType: 'evaluasi_pemantauan' });
        }}
        onOpenAiAssistant={() => {
          setIsEvaluasiModalOpen(false);
          setIsAiAssistantModalOpen(true);
        }}
      />

      {/* MODAL ASISTEN AI TINDAK LANJUT PROGRAM */}
      <AsistenAiTindakLanjutModal
        isOpen={isAiAssistantModalOpen}
        onClose={() => setIsAiAssistantModalOpen(false)}
        programs={programs}
        evaluasiList={evaluasiList}
        monitorings={monitorings}
        onApplyNewProgram={(name, pilarAkronim, deskripsi) => {
          setIsAiAssistantModalOpen(false);
          handleOpenProgramModal(undefined, pilarAkronim);
        }}
      />

      <GasHubModal
        isOpen={isGasHubOpen}
        onClose={() => setIsGasHubOpen(false)}
      />

      <PrintableKegiatanModal
        isOpen={isPrintKegiatanModalOpen}
        onClose={() => setIsPrintKegiatanModalOpen(false)}
        pelaksanaan={pelaksanaanToPrint}
        program={programs.find(p => p.id === pelaksanaanToPrint?.idProgram) || null}
        dokumentasis={dokumentasis}
        pengaturan={pengaturan}
      />

      {/* Toast Notifikasi Sinkronisasi Google Apps Script */}
      {gasToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 ${
            gasToast.type === 'success' ? 'bg-emerald-950 text-emerald-100 border-emerald-600 shadow-emerald-950/40' :
            gasToast.type === 'error' ? 'bg-rose-950 text-rose-100 border-rose-600 shadow-rose-950/40' :
            'bg-slate-900 text-slate-100 border-slate-700 shadow-slate-950/40'
          }`}>
            <span className="text-xl shrink-0 mt-0.5">
              {gasToast.type === 'success' ? '🟢' : gasToast.type === 'error' ? '⚠️' : '🔄'}
            </span>
            <div className="flex-1 text-xs">
              <p className="font-bold">
                {gasToast.type === 'success' ? 'Google Spreadsheet Terhubung' : gasToast.type === 'error' ? 'Kendala Sinkronisasi' : 'Menyinkronkan...'}
              </p>
              <p className="mt-1 leading-relaxed text-slate-200">{gasToast.message}</p>
            </div>
            <button
              onClick={() => setGasToast(null)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded-md hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
