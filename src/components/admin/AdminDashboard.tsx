import React from 'react';
import { Film, CheckCircle2, XCircle, Grid, Sparkles, HardDrive, ShieldCheck } from 'lucide-react';
import { Video, Category } from '../../types';

interface AdminDashboardProps {
  videos: Video[];
  categories: Category[];
  onNavigateToVideos: () => void;
  onNavigateToCategories: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  videos,
  categories,
  onNavigateToVideos,
  onNavigateToCategories,
}) => {
  const totalVideos = videos.length;
  const activeVideos = videos.filter((v) => v.active).length;
  const inactiveVideos = videos.filter((v) => !v.active).length;
  const featuredVideo = videos.find((v) => v.featured);
  const totalCategories = categories.length;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Visão Geral da Plataforma</h1>
        <p className="text-zinc-400 text-sm">Resumo do acervo e métricas de conteúdo do CineStream</p>
      </div>

      {/* Stats Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Vídeos</span>
            <Film className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-3xl font-black text-white block">{totalVideos}</span>
          <span className="text-[11px] text-zinc-500 block">Vídeos cadastrados na base</span>
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Vídeos Ativos</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-emerald-400 block">{activeVideos}</span>
          <span className="text-[11px] text-zinc-500 block">Visíveis na área pública</span>
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Vídeos Inativos</span>
            <XCircle className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-amber-400 block">{inactiveVideos}</span>
          <span className="text-[11px] text-zinc-500 block">Rascunhos ou desativados</span>
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Categorias</span>
            <Grid className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-3xl font-black text-white block">{totalCategories}</span>
          <span className="text-[11px] text-zinc-500 block">Categorias cadastradas</span>
        </div>
      </div>

      {/* Featured Video Status Banner */}
      <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-red-950/30 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Conteúdo em Destaque Atual
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            {featuredVideo ? featuredVideo.title : 'Nenhum vídeo marcado explicitamente como destaque'}
          </h2>
          <p className="text-xs text-zinc-400">
            {featuredVideo
              ? `Provedor: ${featuredVideo.provider.toUpperCase()} | Categoria ID: ${featuredVideo.category_id}`
              : 'O sistema utilizará o primeiro vídeo ativo do acervo para o banner principal.'}
          </p>
        </div>

        <button
          onClick={onNavigateToVideos}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors whitespace-nowrap shadow-lg shadow-red-950/50"
        >
          Gerenciar Vídeos
        </button>
      </div>

      {/* System & Architecture Info */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <HardDrive className="w-5 h-5 text-zinc-400" />
          <h3 className="text-base font-bold text-white">Arquitetura Desacoplada de Provedores</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-300">
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1">
            <span className="font-bold text-white block">Google Drive Provider</span>
            <p className="text-zinc-400">
              Transforma links compartilháveis em endpoints diretos e streams por proxy do servidor.
            </p>
          </div>
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1">
            <span className="font-bold text-white block">Direct MP4 / HLS / S3</span>
            <p className="text-zinc-400">
              Provedores padrão com compatibilidade HTML5 pura para Cloudflare R2, Supabase Storage e Amazon S3.
            </p>
          </div>
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1">
            <span className="font-bold text-white block">Sistema Híbrido de Capas</span>
            <p className="text-zinc-400">
              Geração automática de thumbnails com opção de seleção de frames ou envio de imagens customizadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
