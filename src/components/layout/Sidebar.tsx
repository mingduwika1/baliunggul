import React from 'react';
import {
  LayoutDashboard,
  Compass,
  FileSpreadsheet,
  CalendarDays,
  ClipboardCheck,
  LineChart,
  FileText,
  Images,
  Database,
  Settings,
  Code,
  Flame,
  Award
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  programCount: number;
  pelaksanaanCount: number;
  overdueCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  isMobileOpen,
  setIsMobileOpen,
  programCount,
  pelaksanaanCount,
  overdueCount
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'KEPALA_SEKOLAH', 'KOORDINATOR', 'GURU']
    },
    {
      id: 'profil',
      label: '7 Pilar LENTERA',
      icon: Compass,
      roles: ['ADMIN', 'KEPALA_SEKOLAH', 'KOORDINATOR', 'GURU'],
      badge: '7 Pilar'
    },
    {
      id: 'perencanaan',
      label: 'Perencanaan Program',
      icon: FileSpreadsheet,
      roles: ['ADMIN', 'KEPALA_SEKOLAH', 'KOORDINATOR', 'GURU'],
      badge: programCount > 0 ? `${programCount}` : undefined
    },
    {
      id: 'jadwal',
      label: 'Jadwal Kegiatan',
      icon: CalendarDays,
      roles: ['ADMIN', 'KEPALA_SEKOLAH', 'KOORDINATOR', 'GURU']
    },
    {
      id: 'pelaksanaan',
      label: 'Pelaksanaan & Unggah',
      icon: ClipboardCheck,
      roles: ['ADMIN', 'KEPALA_SEKOLAH', 'KOORDINATOR', 'GURU'],
      badge: pelaksanaanCount > 0 ? `${pelaksanaanCount}` : undefined
    },
    {
      id: 'monitoring',
      label: 'Monitoring & Evaluasi',
      icon: LineChart,
      roles: ['ADMIN', 'KEPALA_SEKOLAH', 'KOORDINATOR']
    },
    {
      id: 'laporan',
      label: 'Laporan & Ekspor',
      icon: FileText,
      roles: ['ADMIN', 'KEPALA_SEKOLAH', 'KOORDINATOR', 'GURU']
    },
    {
      id: 'galeri',
      label: 'Galeri Dokumentasi',
      icon: Images,
      roles: ['ADMIN', 'KEPALA_SEKOLAH', 'KOORDINATOR', 'GURU']
    },
    {
      id: 'master',
      label: 'Manajemen Data Master',
      icon: Database,
      roles: ['ADMIN', 'KOORDINATOR']
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan Sekolah',
      icon: Settings,
      roles: ['ADMIN', 'KEPALA_SEKOLAH']
    },
    {
      id: 'gas-hub',
      label: 'Google Apps Script Hub',
      icon: Code,
      roles: ['ADMIN', 'KEPALA_SEKOLAH', 'KOORDINATOR', 'GURU'],
      highlight: true
    }
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-18 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* LENTERA Torch Banner */}
        <div className="p-3.5 mx-3 mt-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-indigo-950/80 border border-blue-800/50 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/40">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">PROGRAM LENTERA</h4>
            <p className="text-[10px] text-amber-300/90 font-medium">SDM Bali Unggul</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-semibold'
                    : item.highlight
                    ? 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Overdue Warning Callout if any */}
        {overdueCount > 0 && (
          <div className="mx-3 mb-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-300 flex items-center justify-between">
            <span className="font-medium">⚠️ {overdueCount} Terlambat</span>
            <button 
              onClick={() => handleSelect('perencanaan')}
              className="underline text-[10px] text-rose-200 hover:text-white"
            >
              Lihat
            </button>
          </div>
        )}

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[10px] text-slate-400 flex items-center justify-between">
          <span>SIM LENTERA v2.6</span>
          <span className="flex items-center gap-1 text-amber-400">
            <Award className="w-3 h-3" />
            Bali Unggul
          </span>
        </div>
      </aside>
    </>
  );
};
