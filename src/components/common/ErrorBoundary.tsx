import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, Home, AlertTriangle, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Master Rummy Crash Caught by ErrorBoundary]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  handleReturnToLobby = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 bg-[#070b14] text-white flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
          <div className="max-w-md w-full bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center flex flex-col items-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mb-4 shadow-lg animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-amber-300 mb-1">
              Table Auto-Recovery
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm font-semibold mb-2">
              Game session encountered a minor rendering issue. Your chips and account wallet are 100% secure.
            </p>
            <p className="text-amber-400/80 text-[11px] font-medium mb-6">
              (खिलाड़ी डेटा और वॉलेट सुरक्षित है — टेबल पुनः प्रारंभ करें)
            </p>

            {/* Error Message Snippet */}
            {this.state.error && (
              <div className="w-full bg-black/60 border border-stone-800 rounded-xl p-3 mb-6 text-left overflow-x-auto text-[11px] font-mono text-stone-400 max-h-24">
                <span className="text-red-400 font-bold block mb-0.5">Error:</span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            {/* Actions */}
            <div className="w-full flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Table</span>
              </button>

              <button
                onClick={this.handleReturnToLobby}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-200 font-bold text-xs sm:text-sm border border-stone-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Return to Lobby</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
