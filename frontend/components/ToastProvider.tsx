"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: Toast['type'], duration?: number, action?: { label: string; onClick: () => void }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'], duration = 5000, action?: { label: string; onClick: () => void }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, duration, action };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after duration (unless it has an action, in which case we might want to keep it)
    if (!action) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) => {
  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, removeToast }: { toast: Toast; removeToast: (id: string) => void }) => {
  const bgColor = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    error: 'bg-gradient-to-r from-red-500 to-rose-600',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600',
    info: 'bg-gradient-to-r from-indigo-500 to-purple-600',
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`${bgColor} text-white rounded-xl shadow-lg p-4 max-w-sm min-w-[300px] flex items-start`}
    >
      <div className="flex-1">
        <p className="text-white font-medium">{toast.message}</p>
        {toast.action && (
          <div className="mt-3 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.action?.onClick();
                removeToast(toast.id);
              }}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              {toast.action.label}
            </button>
            <button
              onClick={() => removeToast(toast.id)}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      {!toast.action && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeToast(toast.id);
          }}
          className="ml-2 text-white/70 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};