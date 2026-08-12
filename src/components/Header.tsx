import React from 'react';
import { Play, Search, Grid, Home, Lock, Tv } from 'lucide-react';
import { AppView } from '../types';
import { useSmartTVFocus, useFocusContext } from '../context/FocusContext';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { isTVMode, toggleTVMode } = useFocusContext();

  const homeFocus = useSmartTVFocus('nav-home', () => onNavigate('home'));
  const categoriesFocus = useSmartTVFocus('nav-categories', () => onNavigate('categories'));
  const searchFocus = useSmartTVFocus('nav-search', () => onNavigate('search'));
  const adminFocus = useSmartTVFocus('nav-admin', () => onNavigate('admin'));
  const tvToggleFocus = useSmartTVFocus('nav-tvmode', () => toggleTVMode());

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between transition-colors">
      {/* Brand Logo */}
      <div 
        onClick={() => onNavigate('home')} 
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            CINE<span className="text-red-500 font-extrabold">STREAM</span>
          </span>
          <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-semibold block -mt-1">
            VOD Smart TV
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex items-center gap-2 md:gap-4">
        <button
          {...homeFocus.focusProps}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            currentView === 'home'
              ? 'bg-red-600 text-white font-semibold shadow-lg shadow-red-900/30'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
          } ${
            homeFocus.isFocused
              ? 'ring-4 ring-red-500 scale-105 bg-red-600 text-white shadow-xl z-10'
              : ''
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Início</span>
        </button>

        <button
          {...categoriesFocus.focusProps}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            currentView === 'categories'
              ? 'bg-red-600 text-white font-semibold shadow-lg shadow-red-900/30'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
          } ${
            categoriesFocus.isFocused
              ? 'ring-4 ring-red-500 scale-105 bg-red-600 text-white shadow-xl z-10'
              : ''
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Categorias</span>
        </button>

        <button
          {...searchFocus.focusProps}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            currentView === 'search'
              ? 'bg-red-600 text-white font-semibold shadow-lg shadow-red-900/30'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
          } ${
            searchFocus.isFocused
              ? 'ring-4 ring-red-500 scale-105 bg-red-600 text-white shadow-xl z-10'
              : ''
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Pesquisar</span>
        </button>
      </nav>

      {/* Right Controls: TV Mode Badge & Admin Area Entry */}
      <div className="flex items-center gap-3">
        {/* Smart TV Remote Navigation Helper Toggle */}
        <button
          {...tvToggleFocus.focusProps}
          title="Modo Controle Remoto Smart TV"
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isTVMode
              ? 'bg-zinc-900 border-zinc-700 text-zinc-300'
              : 'bg-zinc-950 border-zinc-800 text-zinc-500'
          } ${
            tvToggleFocus.isFocused ? 'ring-2 ring-red-500 scale-105 border-red-500 text-white' : ''
          }`}
        >
          <Tv className={`w-3.5 h-3.5 ${isTVMode ? 'text-red-500' : 'text-zinc-500'}`} />
          <span>Controle TV: {isTVMode ? 'ATIVO' : 'OFF'}</span>
        </button>

        {/* Admin Secret Portal Link */}
        <button
          {...adminFocus.focusProps}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all ${
            currentView === 'admin' ? 'border-red-500 text-red-400 bg-red-950/30' : ''
          } ${
            adminFocus.isFocused ? 'ring-4 ring-red-500 scale-105 bg-zinc-800 text-white z-10' : ''
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden md:inline">Painel Admin</span>
        </button>
      </div>
    </header>
  );
};
