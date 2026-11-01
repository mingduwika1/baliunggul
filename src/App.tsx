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
import { GasHubModal } from './components/gas/GasHubModal';
import { PrintableKegiatanModal } from './components/laporan/PrintableKegiatanModal';

export default function App() {
  // Initialize initial data in LocalStorage if not present
  useEffect(() => {
    StorageService.initData();
  }, []);

  // Reactive State loaded from storage service
  const [pengaturan, setPengaturan] = useState<PengaturanSekolah>(StorageService.getPengaturan());
  const [programs, setPrograms] = useState<ProgramItem[]>(StorageService.getPrograms());
  const [pelaksanaans, setPelaksanaans] = useState<PelaksanaanItem[]>(StorageService.getPelaksanaan());
  const [dokumentasis, setDokumentasis] = useState<DokumentasiItem[]>(StorageService.getDokumentasi());
  const [monitorings, setMonitorings] = useState<MonitoringItem[]>(StorageService.getMonitoring());
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

  // Modal Controls
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<ProgramItem | null>(null);
  const [defaultPilarAkronim, setDefaultPilarAkronim] = useState<string | undefined>(undefined);

  const [isPelaksanaanModalOpen, setIsPelaksanaanModalOpen] = useState(false);
  const [pelaksanaanToEdit, setPelaksanaanToEdit] = useState<PelaksanaanItem | null>(null);
  const [defaultProgramForPelaksanaan, setDefaultProgramForPelaksanaan] = useState<ProgramItem | null>(null);

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
              onNavigate={handleNavigate}
              onOpenProgramModal={handleOpenProgramModal}
              onOpenPelaksanaanModal={() => handleOpenPelaksanaanModal()}
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
              pengaturan={pengaturan}
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
    </div>
  );
}
