import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  UserCheck, 
  Code2, 
  Menu, 
  X, 
  School,
  Clock,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
  Cloud
} from 'lucide-react';
import { UserRole, UserSession, PengaturanSekolah } from '../../types';
import { StorageService } from '../../services/storageService';

interface HeaderProps {
  currentUser: UserSession;
  pengaturan: PengaturanSekolah;
  onSelectRole: (role: UserRole) => void;
  onOpenGasHub: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onNavigate: (tab: string) => void;
  onSyncGas?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  pengaturan,
  onSelectRole,
  onOpenGasHub,
  isMobileOpen,
  setIsMobileOpen,
  onNavigate,
  onSyncGas,
  isSyncing = false
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Time in Bali (WITA)
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Makassar',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' WITA'
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Notifications calculation (overdue programs, pending monitorings)
  const programs = StorageService.getPrograms();
  const pelaksanaans = StorageService.getPelaksanaan();
  const today = new Date().toISOString().split('T')[0];

  const overduePrograms = programs.filter(
    p => p.tanggalSelesai < today && p.status !== 'Selesai'
  );

  const roles: { role: UserRole; label: string; desc: string; icon: string }[] = [
    { role: 'KEPALA_SEKOLAH', label: 'Kepala Sekolah', desc: 'Akses monitoring eksekutif & evaluasi sekolah', icon: '👔' },
    { role: 'KOORDINATOR', label: 'Koordinator LENTERA', desc: 'Kelola program 7 pilar, verifikasi & monitoring', icon: '🎯' },
    { role: 'GURU', label: 'Guru / Penanggung Jawab', desc: 'Input pelaksanaan & upload dokumentasi kegiatan', icon: '📝' },
    { role: 'ADMIN', label: 'Admin Sistem', desc: 'Akses penuh data master & konfigurasi sistem', icon: '⚙️' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                <School className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  SIM <span className="text-amber-400 font-extrabold">LENTERA</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-950 text-blue-300 rounded border border-blue-800">
                  BALI UNGGUL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light truncate max-w-[200px] sm:max-w-md hidden md:block">
                "Menerangi Potensi, Membangun Generasi, Mewujudkan SDM Bali Unggul"
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions, Clock, Notifications, Role Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Bali Time Display */}
          <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">{timeStr}</span>
          </div>

          {/* Google Spreadsheet Live Sync Button */}
          {pengaturan.gasWebAppUrl ? (
            <button
              onClick={onSyncGas}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all disabled:opacity-50"
              title="Tarik & perbarui seluruh data langsung dari Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Menyinkronkan...' : 'Sinkron Spreadsheet'}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('pengaturan')}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-600/30 shadow-xs transition-all"
              title="Hubungkan dengan Web App URL Google Spreadsheet"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Hubungkan Spreadsheet</span>
            </button>
          )}

          {/* Google Apps Script Quick Hub Button */}
          <button
            onClick={onOpenGasHub}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold shadow-sm transition-all"
            title="Buka Kode Google Apps Script & Panduan Deployment"
          >
            <Code2 className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">Code.gs</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowRoleMenu(false);
              }}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {overduePrograms.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow">
                  {overduePrograms.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">Notifikasi Kegiatan</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    {overduePrograms.length} Perlu Tindak Lanjut
                  </span>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto mt-1">
                  {overduePrograms.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Semua jadwal program berjalan tepat waktu.
                    </div>
                  ) : (
                    overduePrograms.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => {
                          setShowNotifMenu(false);
                          onNavigate('perencanaan');
                        }}
                        className="py-2.5 px-1 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-rose-300 line-clamp-1">{p.namaProgram}</span>
                          <span className="text-[10px] text-rose-400 font-mono shrink-0">Lewat Jadwal</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Batas akhir: {p.tanggalSelesai}</p>
                        <p className="text-[10px] text-amber-400/90 font-medium">PJ: {p.penanggungJawab}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors"
            >
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {currentUser.role === 'KEPALA_SEKOLAH' && 'KS'}
                {currentUser.role === 'KOORDINATOR' && 'KD'}
                {currentUser.role === 'GURU' && 'GR'}
                {currentUser.role === 'ADMIN' && 'AD'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[140px]">
                  {currentUser.nama}
                </p>
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-medium">
                    {roles.find(r => r.role === currentUser.role)?.label}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-semibold text-slate-300">Simulasi Hak Akses Pengguna</p>
                  <p className="text-[10px] text-slate-400">Ganti peran untuk menguji kewenangan sistem</p>
                </div>
                <div className="space-y-1">
                  {roles.map(r => (
                    <button
                      key={r.role}
                      onClick={() => {
                        onSelectRole(r.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg flex items-start space-x-2.5 transition-colors ${
                        currentUser.role === r.role
                          ? 'bg-blue-900/60 border border-blue-700 text-white'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-base">{r.icon}</span>
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-1.5">
                          {r.label}
                          {currentUser.role === r.role && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 rounded">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
