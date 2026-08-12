import React, { useState } from 'react';
import { Lock, User, Play, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { loginAdmin } from '../../services/api';
import { useSmartTVFocus } from '../../context/FocusContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToPublic }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const userInputFocus = useSmartTVFocus('login-username-input');
  const passInputFocus = useSmartTVFocus('login-password-input');
  const submitFocus = useSmartTVFocus('login-submit-btn');
  const backFocus = useSmartTVFocus('login-back-btn', onBackToPublic);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAdmin(username, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 relative">
        {/* Back button */}
        <button
          {...backFocus.focusProps}
          className={`flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-all px-3 py-1.5 rounded-lg border border-transparent ${
            backFocus.isFocused ? 'ring-2 ring-red-500 bg-zinc-800 text-white' : ''
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Site Público</span>
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-950/60">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Área Administrativa</h1>
          <p className="text-xs text-zinc-400">
            Acesso restrito para gerenciamento de vídeos e provedores
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Usuário
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                {...userInputFocus.focusProps}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nome do administrador"
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border text-white text-sm focus:outline-none transition-all ${
                  userInputFocus.isFocused
                    ? 'ring-2 ring-red-500 border-red-500 bg-zinc-900'
                    : 'border-zinc-800'
                }`}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Senha
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                {...passInputFocus.focusProps}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border text-white text-sm focus:outline-none transition-all ${
                  passInputFocus.isFocused
                    ? 'ring-2 ring-red-500 border-red-500 bg-zinc-900'
                    : 'border-zinc-800'
                }`}
                required
              />
            </div>
          </div>

          <button
            {...submitFocus.focusProps}
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm bg-red-600 text-white transition-all shadow-lg ${
              submitFocus.isFocused ? 'ring-4 ring-red-400 scale-105 shadow-red-950/80' : 'hover:bg-red-500'
            }`}
          >
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </button>
        </form>

        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-500 text-center">
          Credenciais de demonstração: <span className="text-zinc-300 font-mono">admin</span> / <span className="text-zinc-300 font-mono">admin123</span>
        </div>
      </div>
    </div>
  );
};
