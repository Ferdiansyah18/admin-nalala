'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AdminNotification } from '@/types/admin';
import { useToast } from '@/context/ToastContext';
import {
  Megaphone,
  Send,
  Trash2,
  Users,
  Radio,
  Sparkles,
  Info,
  Tag,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function NotificationsBroadcastPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [targetAudience, setTargetAudience] = useState<'all' | 'customer' | 'reseller'>('all');
  const [title, setTitle] = useState<string>('Restock Kuota Paket Usaha!');
  const [message, setMessage] = useState<string>(
    'Paket Usaha Pemula telah dibuka kembali dengan kuota tambahan. Segera checkout sebelum kehabisan!'
  );
  const [type, setType] = useState<'promo' | 'announcement' | 'system'>('promo');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<AdminNotification[]>('/notifications/my');
      if (res.data) {
        setNotifications(res.data);
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memuat riwayat siaran.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/notifications/broadcast', {
        targetAudience,
        title: title.trim(),
        message: message.trim(),
        type,
      });

      showToast('Siaran notifikasi berhasil dikirimkan ke seluruh pengguna target.', 'success');
      setTitle('');
      setMessage('');
      fetchNotifications();
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengirimkan siaran notifikasi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus riwayat notifikasi ini?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      showToast('Notifikasi berhasil dihapus.', 'success');
      fetchNotifications();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus notifikasi.', 'error');
    }
  };

  return (
    <div className="space-y-5 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-gray-200 dark:border-zinc-800/60">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
          Pusat Siaran Notifikasi
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Siarkan pengumuman promosi, informasi restock kuota reseller, atau info operasional secara serentak.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form & Live Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-zinc-300 flex items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-zinc-800/70">
              <Radio className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 animate-pulse" />
              <span>Formulir Siaran Baru</span>
            </h3>

            <form onSubmit={handleBroadcast} className="space-y-3.5">
              {/* Target Segment */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1.5">
                  Target Segmen Pengguna:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetAudience('all')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      targetAudience === 'all'
                        ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-zinc-800 dark:border-amber-500/60 dark:text-zinc-100'
                        : 'bg-white dark:bg-zinc-950/60 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    Semua Akun
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAudience('reseller')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      targetAudience === 'reseller'
                        ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-zinc-800 dark:border-amber-500/60 dark:text-zinc-100'
                        : 'bg-white dark:bg-zinc-950/60 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    Reseller
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAudience('customer')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      targetAudience === 'customer'
                        ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-zinc-800 dark:border-amber-500/60 dark:text-zinc-100'
                        : 'bg-white dark:bg-zinc-950/60 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    Customer
                  </button>
                </div>
              </div>

              {/* Tipe Notifikasi */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1.5">
                  Kategori Pengumuman:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('promo')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      type === 'promo'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300'
                        : 'bg-white dark:bg-zinc-950/60 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    🎉 Promo
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('announcement')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      type === 'announcement'
                        ? 'bg-sky-50 border-sky-300 text-sky-700 dark:bg-sky-500/10 dark:border-sky-500/30 dark:text-sky-300'
                        : 'bg-white dark:bg-zinc-950/60 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    📢 Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('system')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      type === 'system'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                        : 'bg-white dark:bg-zinc-950/60 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    ⚙️ Sistem
                  </button>
                </div>
              </div>

              {/* Judul */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1">
                  Judul Siaran:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Promo Gajian 20% Dimulai!"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Pesan */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1">
                  Isi Pesan Siaran:
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pesan lengkap yang akan tampil di notifikasi aplikasi pengguna..."
                  className="w-full p-2.5 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-[#465FFF] hover:bg-[#3641F5] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>{isSubmitting ? 'Mengirim Siaran...' : 'Kirim Siaran Sekarang'}</span>
              </button>
            </form>
          </div>

          {/* Live Preview */}
          <div className="bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/80 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider block">
              Pratinjau di Aplikasi Pelanggan:
            </span>

            <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 flex items-start gap-3 shadow-xs">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 shrink-0">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-xs text-gray-900 dark:text-zinc-100">{title || 'Judul Notifikasi'}</h5>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">Baru saja</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {message || 'Isi pesan siaran pengumuman akan tampil di sini...'}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-medium">
                    Target: {targetAudience.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-medium">
                    Tipe: {type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sent History */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-zinc-300 flex items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-zinc-800/70 mb-3.5">
              <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Riwayat Notifikasi Tersiar</span>
            </h3>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-zinc-500">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#465FFF] dark:border-zinc-700 dark:border-t-amber-400 rounded-full animate-spin" />
                <p className="text-xs">Memuat riwayat...</p>
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-zinc-500 py-8 text-center">Belum ada riwayat siaran notifikasi.</p>
            ) : (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-gray-900 dark:text-zinc-200 block truncate">{notif.title}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shrink-0 uppercase font-medium">
                          {notif.targetAudience || 'ALL'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mt-1 block">
                        {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(notif.id)}
                      title="Hapus Riwayat"
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-gray-200 dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-zinc-800 rounded-md transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
