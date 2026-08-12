import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearStorageAndReset = () => {
    try {
      localStorage.removeItem('cinestream_videos_db');
      localStorage.removeItem('cinestream_categories_db');
      localStorage.removeItem('cinestream_admin_token');
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-950/80 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-950/50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                Ocorreu um erro no CineStream
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {this.state.error?.message || 'Erro inesperado na renderização da aplicação.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Aplicativo</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearStorageAndReset}
                className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700/50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Restaurar Dados e Reiniciar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
