import React from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Tactical Node Component Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50/10 border border-red-200 rounded-3xl flex flex-col items-center justify-center text-center backdrop-blur-sm h-full min-h-[300px]">
          <ShieldAlert className="w-12 h-12 text-red-600 mb-4 animate-pulse" />
          <h3 className="text-xs font-black text-red-600 uppercase tracking-[0.3em]">Component Integrity Breach</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
            A critical failure occurred in this sector's rendering node. Tactical data has been isolated to prevent system-wide instability.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-xl shadow-red-600/20"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Reload Node
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
