import React, { useState } from 'react';
import { Plus, Edit3, Trash2, CheckCircle2, XCircle, Sparkles, Eye, Search } from 'lucide-react';
import { Video, Category } from '../../types';
import { VideoFormModal } from './VideoFormModal';

interface AdminVideosProps {
  videos: Video[];
  categories: Category[];
  onSaveVideo: (data: Partial<Video>, isEdit: boolean, id?: string) => Promise<void>;
  onDeleteVideo: (id: string) => Promise<void>;
  onToggleActive: (video: Video) => Promise<void>;
  onToggleFeatured: (video: Video) => Promise<void>;
  onViewVideoPublic: (video: Video) => void;
}

export const AdminVideos: React.FC<AdminVideosProps> = ({
  videos,
  categories,
  onSaveVideo,
  onDeleteVideo,
  onToggleActive,
  onToggleFeatured,
  onViewVideoPublic,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmDelete = async () => {
    if (!deletingVideo) return;
    setIsDeleting(true);
    try {
      await onDeleteVideo(deletingVideo.id);
      setDeletingVideo(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir vídeo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingVideo(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Video) => {
    setEditingVideo(v);
    setIsModalOpen(true);
  };

  const handleModalSave = async (data: Partial<Video>) => {
    if (editingVideo) {
      await onSaveVideo(data, true, editingVideo.id);
    } else {
      await onSaveVideo(data, false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Gerenciamento de Vídeos</h1>
          <p className="text-xs text-zinc-400">Cadastre, edite, organize e controle a visibilidade do acervo</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Vídeo</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar vídeo por título ou provedor..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Videos Data Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-4">Capa</th>
                <th className="p-4">Título</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Provedor</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Destaque</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500 font-semibold">
                    Nenhum vídeo cadastrado.
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video) => {
                  const catName =
                    categories.find((c) => c.id === video.category_id)?.name || 'Sem categoria';
                  const thumbSrc = video.thumbnail_url && video.thumbnail_url.trim()
                    ? video.thumbnail_url
                    : 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=600&auto=format&fit=crop';

                  return (
                    <tr key={video.id} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="p-4">
                        <img
                          src={thumbSrc}
                          alt={video.title}
                          className="w-20 aspect-video object-cover rounded-lg border border-zinc-800"
                        />
                      </td>
                      <td className="p-4 font-bold text-white max-w-xs truncate">
                        {video.title}
                      </td>
                      <td className="p-4 font-semibold text-zinc-400">{catName}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-zinc-950 text-red-400 border border-zinc-800">
                          {video.provider}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onToggleActive(video)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            video.active
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {video.active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Inativo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onToggleFeatured(video)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            video.featured
                              ? 'bg-red-600 text-white border-red-500'
                              : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-white'
                          }`}
                          title="Alternar Destaque Principal"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => onViewVideoPublic(video)}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          title="Visualizar Player"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(video)}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          title="Editar Vídeo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingVideo(video)}
                          className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 transition-colors"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Excluir Vídeo</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Tem certeza que deseja excluir permanentemente o vídeo <strong className="text-white">"{deletingVideo.title}"</strong>? Esta ação removerá o registro do sistema.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVideo(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/50 transition-colors"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir Vídeo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <VideoFormModal
          video={editingVideo}
          categories={categories}
          onSave={handleModalSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
