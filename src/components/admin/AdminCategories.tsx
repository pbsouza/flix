import React, { useState } from 'react';
import { Plus, Edit3, Trash2, CheckCircle2, XCircle, Grid } from 'lucide-react';
import { Category } from '../../types';

interface AdminCategoriesProps {
  categories: Category[];
  onCreateCategory: (name: string, active: boolean) => Promise<void>;
  onUpdateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [isDeletingCat, setIsDeletingCat] = useState(false);

  const handleConfirmDeleteCat = async () => {
    if (!deletingCat) return;
    setIsDeletingCat(true);
    try {
      await onDeleteCategory(deletingCat.id);
      setDeletingCat(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir categoria');
    } finally {
      setIsDeletingCat(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setLoading(true);
    try {
      await onCreateCategory(newCatName.trim(), true);
      setNewCatName('');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCat(cat);
    setEditName(cat.name);
  };

  const handleSaveEdit = async () => {
    if (!editingCat || !editName.trim()) return;
    setLoading(true);
    try {
      await onUpdateCategory(editingCat.id, { name: editName.trim() });
      setEditingCat(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">Gerenciamento de Categorias</h1>
        <p className="text-xs text-zinc-400">
          Crie e organize categorias para estruturar os carrosséis da área pública
        </p>
      </div>

      {/* Create New Category Box */}
      <form onSubmit={handleCreate} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex gap-3">
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="Nome da nova categoria (Ex: Manutenção Preventiva)"
          className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
          required
        />
        <button
          type="submit"
          disabled={loading || !newCatName.trim()}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </form>

      {/* Categories List Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-4">ID / Slug</th>
              <th className="p-4">Nome da Categoria</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {categories.map((cat) => {
              const isEditingThis = editingCat?.id === cat.id;

              return (
                <tr key={cat.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="p-4 font-mono text-zinc-500 text-[11px]">{cat.slug}</td>
                  <td className="p-4 font-bold text-white">
                    {isEditingThis ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-white text-xs"
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onUpdateCategory(cat.id, { active: !cat.active })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        cat.active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {cat.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Ativa
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Inativa
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {isEditingThis ? (
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                      >
                        Salvar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        title="Editar Nome"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={() => setDeletingCat(cat)}
                      className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 transition-colors"
                      title="Excluir Categoria"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Category Modal */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Excluir Categoria</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Tem certeza que deseja excluir a categoria <strong className="text-white">"{deletingCat.name}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCat(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCat}
                disabled={isDeletingCat}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/50 transition-colors"
              >
                {isDeletingCat ? 'Excluindo...' : 'Sim, Excluir Categoria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
