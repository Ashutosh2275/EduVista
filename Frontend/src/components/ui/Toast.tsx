import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-error" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-accent" />,
  };

  const backgrounds = {
    success: 'bg-success/10 border-success/20',
    error: 'bg-error/10 border-error/20',
    warning: 'bg-warning/10 border-warning/20',
    info: 'bg-accent/10 border-accent/20',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-large',
        'animate-slide-up bg-surface/90',
        backgrounds[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <p className="font-medium text-primary text-body-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-body-xs text-muted mt-0.5">{toast.description}</p>
        )}
      </div>
      <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
