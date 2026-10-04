'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order, OrderItem } from '@/types/admin';
import { useToast } from '@/context/ToastContext';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Ban,
  Trash2,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  MapPin,
  Phone,
  CreditCard,
  FileText,
} from 'lucide-react';

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Dibatalkan oleh Admin');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const statusTabs = [
    { id: 'all', label: 'Semua Status' },
    { id: 'pending_payment', label: 'Menunggu Bayar' },
    { id: 'awaiting_payment_reupload', label: 'Unggah Ulang Bukti' },
    { id: 'processing', label: 'Diproses' },
    { id: 'shipped', label: 'Dikirim' },
    { id: 'completed', label: 'Selesai' },
    { id: 'cancelled_permanent', label: 'Batal' },
  ];

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const statusParam = activeTab === 'all' ? '' : `&status=${activeTab}`;
      const res = await api.get<Order[]>(`/orders?page=${currentPage}&limit=10${statusParam}`);
      if (res.data) {
        setOrders(res.data);
        if (res.meta?.totalPages) {
          setTotalPages(res.meta.totalPages);
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memuat daftar pesanan.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, currentPage]);

  const handleOpenDetail = async (orderId: string) => {
    try {
      const res = await api.get<Order>(`/orders/${orderId}`);
      if (res.data) {
        setSelectedOrder(res.data);
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memuat detail pesanan.', 'error');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setIsProcessing(true);
    try {
      await api.put(`/orders/${cancelModalOrder.id}/cancel`, {
        reason: cancelReason || 'Dibatalkan oleh Admin Nalala',
      });
      showToast(
        `Pesanan #${cancelModalOrder.orderNumber} berhasil dibatalkan. Stok varian produk telah dikembalikan.`,
        'success',
        'Pesanan Dibatalkan'
      );
      setCancelModalOrder(null);
      fetchOrders();
      if (selectedOrder?.id === cancelModalOrder.id) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal membatalkan pesanan.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (
      !confirm(
        `PERINGATAN: Hapus fisik order #${orderNumber} secara permanen dari database? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      showToast(`Data pesanan #${orderNumber} telah dihapus permanen.`, 'success');
      fetchOrders();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus pesanan.', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.shipping?.address?.recipientName?.toLowerCase().includes(q) ||
      o.shipping?.address?.city?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            Menunggu Bayar
          </span>
        );
      case 'awaiting_payment_reupload':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
            Bukti Ditolak
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
            Diproses
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
            Dikirim
          </span>
        );
      case 'delivered':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            Selesai
          </span>
        );
      case 'cancelled_permanent':
      case 'cancelled_expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Batal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 select-none max-w-7xl mx-auto">
      {/* Header controls & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Antrean & Riwayat Pesanan
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Kelola transaksi masuk, rincian barang, serta pembatalan darurat dengan pemulihan stok otomatis.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Order atau Nama..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table Container */}
      <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-gray-500 dark:text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-300 dark:border-zinc-700 border-t-brand-500 dark:border-t-amber-400 rounded-full animate-spin" />
            <p className="text-xs">Memuat antrean transaksi...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-gray-500 dark:text-zinc-400 text-xs">
            Tidak ada transaksi yang cocok dengan filter ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800/80 text-[11px] uppercase tracking-wider font-semibold bg-gray-50/80 dark:bg-zinc-950/40">
                  <th className="py-3 px-4">No. Order & Waktu</th>
                  <th className="py-3 px-4">Penerima & Alamat</th>
                  <th className="py-3 px-4">Barang</th>
                  <th className="py-3 px-4">Total Tagihan</th>
                  <th className="py-3 px-4">Status Pesanan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-zinc-800/50 font-normal">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium text-gray-900 dark:text-zinc-200 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900 dark:text-zinc-200 block font-medium">
                        {order.shipping?.address?.recipientName}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-zinc-400 block truncate max-w-xs">
                        {order.shipping?.address?.city} ({order.shipping?.address?.phoneNumber})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">
                      <span>{order.items?.length || 0} Macam Item</span>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 block">
                        Berat: {((order.shipping?.totalWeightGrams || 0) / 1000).toFixed(2)} kg
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900 dark:text-zinc-100 block">
                        Rp{Number(order.pricing?.netTotal || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-zinc-500">
                        {order.payment?.account?.provider || 'Transfer Bank'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(order.id)}
                          className="px-2.5 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer font-medium"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                          <span>Detail</span>
                        </button>
                        {!['completed', 'shipped', 'cancelled_permanent'].includes(order.status) && (
                          <button
                            onClick={() => setCancelModalOrder(order)}
                            title="Batalkan Pesanan (Rollback Stok)"
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-amber-400 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                          title="Hapus Data Fisik"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 px-4 border-t border-gray-200 dark:border-zinc-800/70 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 bg-gray-50/60 dark:bg-zinc-950/30">
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 dark:border-transparent dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-gray-700 dark:text-zinc-200 transition-colors cursor-pointer shadow-xs"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 dark:border-transparent dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-gray-700 dark:text-zinc-200 transition-colors cursor-pointer shadow-xs"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-500 dark:text-amber-400" />
                  Detail Pesanan #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Dibuat pada {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address Snapshot */}
            <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 dark:bg-zinc-950/60 dark:border-zinc-800/80 mb-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-amber-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>Alamat Tujuan Pengiriman</span>
              </div>
              <p className="text-xs text-gray-900 dark:text-zinc-200 font-medium">
                {selectedOrder.shipping?.address?.recipientName} ({selectedOrder.shipping?.address?.phoneNumber})
              </p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                {selectedOrder.shipping?.address?.fullAddress}, {selectedOrder.shipping?.address?.district},{' '}
                {selectedOrder.shipping?.address?.city}, {selectedOrder.shipping?.address?.province}{' '}
                {selectedOrder.shipping?.address?.postalCode}
              </p>
            </div>

            {/* Purchased Items */}
            <div className="mb-5 space-y-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Rincian Barang Belanjaan
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-gray-50/50 border border-gray-200/60 dark:bg-zinc-950/40 dark:border-zinc-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-zinc-200 block">{item.productName}</span>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 text-[11px] mt-0.5">
                        <span>Varian: {item.colorName}</span>
                        <span>•</span>
                        <span>SKU: {item.sku}</span>
                        {item.packageName && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-medium text-[10px] border border-amber-200 dark:border-amber-500/20">
                              {item.packageName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-gray-500 dark:text-zinc-400 block text-[11px]">
                        {item.quantity} x Rp{Number(item.unitPrice).toLocaleString('id-ID')}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-zinc-100">
                        Rp{Number(item.totalPrice).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200 dark:bg-zinc-950 dark:border-zinc-800 space-y-2 text-xs">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
                Breakdown Finansial
              </h4>
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>Subtotal Reguler:</span>
                <span>Rp{Number(selectedOrder.pricing?.regularSubtotal || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>Subtotal Paket Reseller:</span>
                <span>Rp{Number(selectedOrder.pricing?.packageSubtotal || 0).toLocaleString('id-ID')}</span>
              </div>
              {Number(selectedOrder.pricing?.discountProductTotal) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Potongan Voucher Produk:</span>
                  <span>-Rp{Number(selectedOrder.pricing?.discountProductTotal).toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>Biaya Pengiriman (Ongkir):</span>
                <span>Rp{Number(selectedOrder.pricing?.shippingFee || 0).toLocaleString('id-ID')}</span>
              </div>
              {Number(selectedOrder.pricing?.discountShippingTotal) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Subsidi Voucher Ongkir:</span>
                  <span>-Rp{Number(selectedOrder.pricing?.discountShippingTotal).toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex justify-between text-sm font-bold text-gray-900 dark:text-zinc-100">
                <span>Total Akhir (Net Total):</span>
                <span className="text-brand-600 dark:text-amber-400">
                  Rp{Number(selectedOrder.pricing?.netTotal || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
              {!['completed', 'shipped', 'cancelled_permanent'].includes(selectedOrder.status) && (
                <button
                  onClick={() => setCancelModalOrder(selectedOrder)}
                  className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:border-amber-500/25 dark:text-amber-300 dark:hover:bg-amber-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                  <span>Batalkan Pesanan</span>
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500 dark:text-amber-400">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                <Ban className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100">Batalkan Pesanan</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">#{cancelModalOrder.orderNumber}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
              Tindakan ini akan membatalkan status pesanan menjadi <code className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1 py-0.5 rounded">cancelled_permanent</code> dan otomatis mengembalikan stok seluruh varian tas ke inventori.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                Alasan Pembatalan
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Contoh: Stok tas cacat produksi / Permintaan pembeli"
                className="w-full p-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors shadow-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                disabled={isProcessing}
                onClick={handleCancelOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isProcessing ? 'Memproses...' : 'Ya, Batalkan & Kembalikan Stok'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
