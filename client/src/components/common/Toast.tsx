import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  text: string;
}

interface ToastContextValue {
  showToast: (text: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string, type: 'success' | 'error' = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, text }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
              t.type === 'error'
                ? 'bg-[#FFF5F6]/95 border-[#DFB4B6] text-[#782B36]'
                : 'bg-[#2B142C]/95 border-[#C6A16B]/40 text-[#FAF6F1]'
            }`}
          >
            {t.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0 text-[#B5727B] mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#E8D7BC] mt-0.5" />
            )}
            <p className="text-sm leading-snug flex-1">{t.text}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="opacity-70 hover:opacity-100 transition"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

