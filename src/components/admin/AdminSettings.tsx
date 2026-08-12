import React, { useState } from 'react';
import { KeyRound, Shield, Tv, Check, AlertCircle } from 'lucide-react';
import { changeAdminPassword } from '../../services/api';

export const AdminSettings: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setSaving(true);
    try {
      await changeAdminPassword(newPassword);
      setMessage('Senha do administrador alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Configurações do Sistema</h1>
        <p className="text-xs text-zinc-400">Segurança da conta administrativa e atalhos do controle remoto</p>
      </div>

      {/* Change Password Form */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <KeyRound className="w-5 h-5 text-red-500" />
          <h2 className="text-base font-bold text-white">Alterar Senha do Administrador</h2>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 uppercase block">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 uppercase block">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/50"
          >
            {saving ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>

      {/* Smart TV Remote Guide */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <Tv className="w-5 h-5 text-zinc-400" />
          <h2 className="text-base font-bold text-white">Mapeamento do Controle Remoto Smart TV</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
            <span className="font-semibold text-zinc-400">Setas Direcionais (↑ ↓ ← →)</span>
            <span className="font-bold text-white bg-zinc-900 px-2 py-1 rounded">Navegação Espacial</span>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
            <span className="font-semibold text-zinc-400">Botão OK / Enter</span>
            <span className="font-bold text-white bg-zinc-900 px-2 py-1 rounded">Selecionar / Reproduzir</span>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
            <span className="font-semibold text-zinc-400">Botão Voltar / Esc / Backspace</span>
            <span className="font-bold text-white bg-zinc-900 px-2 py-1 rounded">Fechar Player / Menu</span>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
            <span className="font-semibold text-zinc-400">Barra de Espaço (Player)</span>
            <span className="font-bold text-white bg-zinc-900 px-2 py-1 rounded">Pausar / Continuar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
