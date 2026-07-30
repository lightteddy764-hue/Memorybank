'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface UIContextType {
  showToast: (options: ToastOptions | string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

export function UIProvider({ children }: { children: ReactNode }) {
  // Toast State
  const [toast, setToast] = useState<{ id: number; message: string; type: ToastType } | null>(null);
  
  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showToast = (options: ToastOptions | string) => {
    const id = Date.now();
    let message = '';
    let type: ToastType = 'info';
    let duration = 3000;

    if (typeof options === 'string') {
      message = options;
    } else {
      message = options.message;
      type = options.type || 'info';
      duration = options.duration || 3000;
    }

    setToast({ id, message, type });

    setTimeout(() => {
      setToast(current => current?.id === id ? null : current);
    }, duration);
  };

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve
      });
    });
  };

  const handleConfirmClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <UIContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* Toast Render */}
      <div className={`toast-container ${toast ? 'visible' : ''}`}>
        {toast && (
          <div className={`toast-content ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Confirm Modal Render */}
      {confirmState?.isOpen && (
        <div className="modal-backdrop">
          <div className="modal-content animate-pop">
            <div className="modal-header">
              {confirmState.options.danger ? (
                <div className="modal-icon danger">
                  <AlertTriangle size={24} />
                </div>
              ) : (
                <div className="modal-icon info">
                  <Info size={24} />
                </div>
              )}
              <h2 className="modal-title">{confirmState.options.title}</h2>
            </div>
            
            <p className="modal-description">{confirmState.options.description}</p>
            
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => handleConfirmClose(false)}
              >
                {confirmState.options.cancelText || 'Cancel'}
              </button>
              <button 
                className={confirmState.options.danger ? 'btn-confirm-danger' : 'btn-confirm'} 
                onClick={() => handleConfirmClose(true)}
              >
                {confirmState.options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}
