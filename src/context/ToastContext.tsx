'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAdminSocket, playNotificationChime } from '@/lib/socket';
import { useAuth } from './AuthContext';
import { OrderNewEvent, PaymentUploadedEvent } from '@/types/admin';
import { CheckCircle2, AlertCircle, Info, Bell, X } from 'lucide-react';

interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], title?: string) => void;
  pendingVerificationsCount: number;
  setPendingVerificationsCount: React.Dispatch<React.SetStateAction<number>>;
  latestNewOrder: OrderNewEvent | null;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  pendingVerificationsCount: 0,
  setPendingVerificationsCount: () => {},
  latestNewOrder: null,
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState<number>(0);
  const [latestNewOrder, setLatestNewOrder] = useState<OrderNewEvent | null>(null);
  const { user, token } = useAuth();

  const showToast = (message: string, type: Toast['type'] = 'info', title?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!user || !token) return;

    const socket = getAdminSocket(token, user.id);

    // Event 1: Pesanan Baru Masuk
    const handleNewOrder = (payload: OrderNewEvent) => {
      playNotificationChime();
      setLatestNewOrder(payload);
      showToast(
        `Pesanan #${payload.orderNumber} oleh ${payload.customerName} (Rp${Number(payload.amount).toLocaleString('id-ID')})`,
        'success',
        '🎉 Pesanan Baru Masuk!'
      );
    };

    // Event 2: Struk Transfer Diunggah
    const handlePaymentUploaded = (payload: PaymentUploadedEvent) => {
      playNotificationChime();
      setPendingVerificationsCount((prev) => prev + 1);
      showToast(
        `Bukti transfer pesanan #${payload.orderNumber} telah diunggah (Rp${Number(payload.amount).toLocaleString('id-ID')}).`,
        'warning',
        '💳 Bukti Bayar Masuk'
      );
    };

    socket.on('order:new', handleNewOrder);
    socket.on('payment:uploaded', handlePaymentUploaded);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('payment:uploaded', handlePaymentUploaded);
    };
  }, [user, token]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        pendingVerificationsCount,
        setPendingVerificationsCount,
        latestNewOrder,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 flex items-start gap-3 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/60 shadow-emerald-900/30'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-700/60 shadow-rose-900/30'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-700/60 shadow-amber-900/30'
                : 'bg-zinc-900/90 text-zinc-100 border-zinc-700/60 shadow-black/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <Bell className="w-5 h-5 text-amber-400 animate-bounce" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <h5 className="font-semibold text-sm tracking-wide">{toast.title}</h5>}
              <p className="text-xs text-zinc-300 leading-relaxed mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-white transition-colors p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
