import React from 'react';
import { Film, Grid, LayoutDashboard, Settings, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { removeAuthToken } from '../../services/api';

export type AdminTab = 'dashboard' | 'videos' | 'categories' | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  onViewPublic: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onLogout,
  onViewPublic,
  children,
}) => {
  const handleLogoutClick = () => {
    removeAuthToken();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'videos' as AdminTab, label: 'Vídeos', icon: Film },
    { id: 'categories' as AdminTab, label: 'Categorias', icon: Grid },
    { id: 'settings' as AdminTab, label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-950/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white block leading-tight">Painel Admin</span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">
                CineStream VOD
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-zinc-800 space-y-2">
          <button
            onClick={onViewPublic}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            <span>Ver Área Pública</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <span>Sair do Painel</span>
            <LogOut className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
};
