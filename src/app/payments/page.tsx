'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/types/admin';
import { useToast } from '@/context/ToastContext';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  ZoomIn,
  Clock,
  User,
  Building,
  Calendar,
  AlertCircle,
  Truck,
  ArrowRight,
  X,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

const getProofImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = (process.env.NEXT_PUBLIC_SOCKET_URL || 'https://nalala-be.belanjamu.company').replace(/\/+$/, '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function PaymentsApprovalPage() {
  const { showToast, setPendingVerificationsCount } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal States
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [approveOrder, setApproveOrder] = useState<Order | null>(null);
  const [shippingServiceType, setShippingServiceType] = useState<'EZ' | 'CARGO'>('EZ');
  const [rejectOrder, setRejectOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchPaymentsQueue = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<Order[]>('/orders?limit=50');
      if (res.data) {
        const queue = res.data.filter(
          (o) =>
            o.payment?.status === 'waiting_verification' ||
            (o.status === 'pending_payment' && o.payment?.proofImageUrl) ||
            o.status === 'awaiting_payment_reupload'
        );
        setOrders(queue);
        setPendingVerificationsCount(
          queue.filter(
            (o) =>
              o.payment?.status === 'waiting_verification' ||
              (o.status === 'pending_payment' && o.payment?.proofImageUrl)
          ).length
        );
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memuat antrean verifikasi pembayaran.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsQueue();
  }, []);

  const handleApprove = async () => {
    if (!approveOrder) return;
    setIsProcessing(true);
    try {
      const res = await api.post(`/payments/${approveOrder.id}/verify`, {
        action: 'approve',
        shippingServiceType,
      });

      const waybill = (res.data as any)?.waybillNumber || 'Nomor resi diterbitkan';
      showToast(
        `Pembayaran #${approveOrder.orderNumber} disetujui! Resi J&T: ${waybill}`,
        'success',
        'Pembayaran Terverifikasi'
      );
      setApproveOrder(null);
      fetchPaymentsQueue();
    } catch (err: any) {
      showToast(err?.message || 'Gagal memverifikasi pembayaran.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectOrder) return;
    if (!rejectionReason.trim()) {
      showToast('Wajib memberikan alasan penolakan bukti transfer.', 'warning');
      return;
    }
    setIsProcessing(true);
    try {
      await api.post(`/payments/${rejectOrder.id}/verify`, {
        action: 'reject',
        rejectionReason: rejectionReason.trim(),
      });

      showToast(
        `Bukti pembayaran #${rejectOrder.orderNumber} telah ditolak. Pembeli telah dinotifikasi.`,
        'success',
        'Bukti Ditolak'
      );
      setRejectOrder(null);
      setRejectionReason('');
      fetchPaymentsQueue();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menolak bukti pembayaran.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5 select-none max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Antrean Verifikasi Pembayaran
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Validasi mutasi transfer manual dari pembeli dan terbitkan nomor resi otomatis J&T Express.
          </p>
        </div>

        <button
          onClick={fetchPaymentsQueue}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700/60 dark:text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
          <span>Segarkan ({orders.length})</span>
        </button>
      </div>

      {/* Cards List of Payments */}
      {isLoading ? (
        <div className="py-24 bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-200 dark:border-zinc-800/80 flex flex-col items-center justify-center gap-2.5 text-gray-500 dark:text-zinc-400 shadow-xs">
          <div className="w-6 h-6 border-2 border-gray-300 dark:border-zinc-700 border-t-brand-500 dark:border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs">Memeriksa antrean mutasi pembayaran...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-zinc-900/30 rounded-xl border border-gray-200 dark:border-zinc-800/70 p-8 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400/80 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-zinc-200 text-sm">Semua Pembayaran Telah Diverifikasi</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Tidak ada bukti transfer yang tertahan saat ini. Notifikasi akan muncul saat ada pembeli yang mengunggah struk baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.map((order) => {
            const payment = order.payment;
            const isWaiting =
              payment?.status === 'waiting_verification' ||
              (order.status === 'pending_payment' && payment?.proofImageUrl);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 dark:hover:border-zinc-700/80 transition-all"
              >
                <div>
                  {/* Top order summary */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-zinc-800/70">
                    <div>
                      <span className="font-mono font-semibold text-gray-900 dark:text-zinc-100 text-sm block">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-zinc-500">
                        {order.shipping?.address?.recipientName} • {order.shipping?.address?.city}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${
                        isWaiting
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isWaiting ? 'bg-amber-500 dark:bg-amber-400 animate-pulse' : 'bg-rose-500 dark:bg-rose-400'
                        }`}
                      />
                      {isWaiting ? 'Menunggu Approval' : 'Perlu Upload Ulang'}
                    </span>
                  </div>

                  {/* Body with Proof & Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    {/* Image Preview */}
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950 group aspect-[4/5] flex items-center justify-center">
                      {payment?.proofImageUrl ? (
                        <>
                          <img
                            src={getProofImageUrl(payment.proofImageUrl)}
                            alt="Bukti Transfer"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={() => setZoomImageUrl(getProofImageUrl(payment.proofImageUrl))}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white font-medium text-xs backdrop-blur-xs cursor-pointer"
                          >
                            <ZoomIn className="w-5 h-5 text-amber-400" />
                            <span>Perbesar Struk</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-gray-400 dark:text-zinc-600 text-xs flex flex-col items-center gap-2">
                          <AlertCircle className="w-6 h-6" />
                          <span>Belum ada file struk</span>
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-zinc-500 text-[11px] block">Total Tagihan:</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                          Rp{Number(order.pricing?.netTotal || 0).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-200/80 dark:bg-zinc-950/60 dark:border-zinc-800/80 space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                          <Building className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                          <span>Bank: <b className="text-gray-900 dark:text-zinc-100">{payment?.senderBankName || 'Tidak Disebut'}</b></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                          <User className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                          <span>Pengirim: <b className="text-gray-900 dark:text-zinc-100">{payment?.senderAccountName || '-'}</b></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                          <span>
                            Tanggal:{' '}
                            <b className="text-gray-900 dark:text-zinc-100">
                              {payment?.transferDate
                                ? new Date(payment.transferDate).toLocaleDateString('id-ID')
                                : 'Hari ini'}
                            </b>
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-500 dark:text-zinc-500">
                        <span>Tujuan: </span>
                        <span className="text-gray-800 dark:text-zinc-300 font-medium">
                          {payment?.account?.provider} ({payment?.account?.accountNumber})
                        </span>
                      </div>

                      {payment?.rejectionReason && (
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300 text-[11px]">
                          <b>Alasan Penolakan:</b> {payment.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-3.5 border-t border-gray-100 dark:border-zinc-800/70">
                  <button
                    onClick={() => {
                      setRejectOrder(order);
                      setRejectionReason('Gambar struk buram / nominal tidak sesuai.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-gray-700 border border-gray-200 dark:bg-zinc-800 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:border-rose-500/30 dark:text-zinc-300 dark:border-zinc-700/60 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak Bukti</span>
                  </button>
                  <button
                    onClick={() => {
                      setApproveOrder(order);
                      setShippingServiceType('EZ');
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui Pembayaran</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomImageUrl && (
        <div
          onClick={() => setZoomImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={zoomImageUrl}
              alt="Zoom Struk Transfer"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute -top-10 right-0 text-white text-xs bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-700"
            >
              Tutup (Klik di mana saja)
            </button>
          </div>
        </div>
      )}

      {/* Approve Modal with J&T Option */}
      {approveOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100">Konfirmasi Setujui Pembayaran</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">#{approveOrder.orderNumber}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
              Setelah disetujui, status pesanan otomatis menjadi <code className="text-sky-700 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-500/10 px-1 py-0.5 rounded">Diproses</code>, resi J&T Express diterbitkan, dan email konfirmasi dikirim ke pembeli.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                Pilih Layanan Kurir J&T Express:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShippingServiceType('EZ')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    shippingServiceType === 'EZ'
                      ? 'bg-brand-50/70 border-brand-500 text-brand-900 dark:bg-zinc-800 dark:border-amber-500/60 dark:text-zinc-100 font-semibold shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-zinc-950/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="block text-xs font-bold">J&T EZ</span>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-500">Layanan Reguler Standar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShippingServiceType('CARGO')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    shippingServiceType === 'CARGO'
                      ? 'bg-brand-50/70 border-brand-500 text-brand-900 dark:bg-zinc-800 dark:border-amber-500/60 dark:text-zinc-100 font-semibold shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-zinc-950/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="block text-xs font-bold">J&T CARGO</span>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-500">Layanan Muatan Berat/Grosir</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                disabled={isProcessing}
                onClick={() => setApproveOrder(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                disabled={isProcessing}
                onClick={handleApprove}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isProcessing ? 'Menerbitkan Resi...' : 'Setujui & Terbitkan Resi J&T'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20">
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100">Tolak Bukti Transfer</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">#{rejectOrder.orderNumber}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
              Pesanan akan diubah menjadi <code className="text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-500/10 px-1 py-0.5 rounded">Perlu Unggah Ulang Bukti</code>. Alasan ini akan tampil di akun pembeli.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                Alasan Penolakan (Wajib Diisi):
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Bukti transfer terpotong, nominal kurang, atau salah tujuan rekening."
                className="w-full p-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors shadow-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setRejectOrder(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                disabled={isProcessing}
                onClick={handleReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isProcessing ? 'Menolak...' : 'Kirim Penolakan ke Pembeli'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
