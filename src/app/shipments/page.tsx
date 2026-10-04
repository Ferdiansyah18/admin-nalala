'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order, ShipmentCheckpoint } from '@/types/admin';
import { useToast } from '@/context/ToastContext';
import {
  Truck,
  MapPin,
  Clock,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  PackageCheck,
  Search,
  ChevronRight,
  Send,
} from 'lucide-react';

export default function ShipmentsLogisticsPage() {
  const { showToast } = useToast();
  const [ordersWithShipment, setOrdersWithShipment] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order for Tracking & Checkpoint update
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Checkpoint Modal
  const [checkpointStatus, setCheckpointStatus] = useState<string>('on_transit');
  const [city, setCity] = useState<string>('Jakarta Barat');
  const [description, setDescription] = useState<string>('Paket tiba di Pusat Sortir Gateway.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDeliveredWarning, setShowDeliveredWarning] = useState<boolean>(false);

  const fetchShipments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<Order[]>('/orders?limit=50');
      if (res.data) {
        const shipped = res.data.filter((o) => o.shipping?.shipment?.waybillNumber);
        setOrdersWithShipment(shipped);
        if (shipped.length > 0 && !activeOrder) {
          setActiveOrder(shipped[0]);
        } else if (activeOrder) {
          const updated = shipped.find((s) => s.id === activeOrder.id);
          if (updated) setActiveOrder(updated);
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memuat data ekspedisi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleUpdateCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder?.shipping?.shipment?.waybillNumber) return;

    if (checkpointStatus === 'delivered' && !showDeliveredWarning) {
      setShowDeliveredWarning(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const waybill = activeOrder.shipping.shipment.waybillNumber;
      await api.put(`/payments/shipments/${waybill}/checkpoint`, {
        status: checkpointStatus,
        city: city.trim(),
        description: description.trim(),
      });

      showToast(
        `Checkpoint untuk resi ${waybill} berhasil diperbarui (${checkpointStatus.toUpperCase()}).`,
        'success',
        'Pelacakan Diperbarui'
      );

      setShowDeliveredWarning(false);
      setDescription('');
      fetchShipments();
    } catch (err: any) {
      showToast(err?.message || 'Gagal memperbarui checkpoint ekspedisi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = ordersWithShipment.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const waybill = o.shipping?.shipment?.waybillNumber?.toLowerCase() || '';
    const name = o.shipping?.address?.recipientName?.toLowerCase() || '';
    const orderNo = o.orderNumber.toLowerCase();
    return waybill.includes(q) || name.includes(q) || orderNo.includes(q);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'picked_up':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20';
      case 'on_transit':
        return 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/20';
      case 'delivered':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
      case 'failed':
        return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200 dark:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700/60';
    }
  };

  return (
    <div className="space-y-5 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Manajemen Ekspedisi & Pelacakan
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Pantau status riwayat jalan paket dan perbarui posisi kurir J&T Express secara berkala.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Resi J&T atau Nama..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all shadow-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-2.5 text-gray-500 dark:text-gray-400 shadow-xs">
          <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-700 border-t-brand-500 dark:border-t-brand-400 rounded-full animate-spin" />
          <p className="text-xs">Memuat resi ekspedisi aktif...</p>
        </div>
      ) : ordersWithShipment.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-xs">
          <Truck className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Belum Ada Pengiriman Aktif</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Nomor resi J&T Express otomatis terbit saat Anda menyetujui pembayaran di menu Verifikasi Pembayaran.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Shipment List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
            {filteredOrders.map((order) => {
              const shipment = order.shipping?.shipment;
              const isSelected = activeOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => setActiveOrder(order)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50/70 border-brand-500/60 dark:bg-zinc-800/80 dark:border-amber-500/50 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:hover:border-zinc-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-brand-600 dark:text-amber-400 text-xs">
                      {shipment?.waybillNumber}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusColor(
                        shipment?.status || 'pending'
                      )}`}
                    >
                      {shipment?.status || 'Pending'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-0.5">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-900 dark:text-zinc-200">
                      <span>{order.shipping?.address?.recipientName}</span>
                      <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-mono">
                        Layanan {shipment?.serviceType || 'EZ'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                      {order.shipping?.address?.city}, {order.shipping?.address?.province}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">Order #{order.orderNumber}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Tracking Timeline & Checkpoint Update Form */}
          {activeOrder && activeOrder.shipping?.shipment && (
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-xs space-y-5">
              {/* Header Box */}
              <div className="pb-3.5 border-b border-gray-100 dark:border-zinc-800/70 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">No. Resi J&T:</span>
                    <span className="font-mono font-bold text-brand-600 dark:text-amber-400 text-sm">
                      {activeOrder.shipping.shipment.waybillNumber}
                    </span>
                  </div>
                  <p className="text-xs text-gray-900 dark:text-zinc-200 mt-1 font-medium">
                    Tujuan: {activeOrder.shipping.address.recipientName} ({activeOrder.shipping.address.city})
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500">
                    Order Ref: #{activeOrder.orderNumber} • Berat: {(activeOrder.shipping.totalWeightGrams / 1000).toFixed(2)} kg
                  </p>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full border ${getStatusColor(
                    activeOrder.shipping.shipment.status
                  )}`}
                >
                  {activeOrder.shipping.shipment.status}
                </span>
              </div>

              {/* Vertical Timeline */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-500 dark:text-amber-400" />
                  Riwayat Perjalanan Kurir (Tracking Logs)
                </h4>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 relative before:absolute before:inset-0 before:left-2.5 before:w-0.5 before:bg-gray-200 dark:before:bg-zinc-800">
                  {activeOrder.shipping.shipment.trackingLogs &&
                  activeOrder.shipping.shipment.trackingLogs.length > 0 ? (
                    activeOrder.shipping.shipment.trackingLogs.map((log: any, idx: number) => (
                      <div key={idx} className="relative flex items-start gap-3 text-xs">
                        <div className="w-5 h-5 rounded-full bg-white dark:bg-zinc-950 border-2 border-brand-500 dark:border-amber-500 flex items-center justify-center shrink-0 z-10 mt-0.5 shadow-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-amber-400" />
                        </div>
                        <div className="flex-1 p-2.5 rounded-lg bg-gray-50/80 border border-gray-200/80 dark:bg-zinc-950/60 dark:border-zinc-800/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900 dark:text-zinc-200 uppercase tracking-wide text-[10px]">
                              {log.status} • {log.city}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                              {new Date(log.dateTime).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-zinc-400 text-xs leading-relaxed">{log.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 italic pl-6">Belum ada riwayat pergerakan logistik.</p>
                  )}
                </div>
              </div>

              {/* Checkpoint Update Form */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/70">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-800 dark:text-zinc-300 mb-2.5 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-brand-500 dark:text-amber-400" />
                  Tambah Posisi / Checkpoint Baru
                </h4>

                <form onSubmit={handleUpdateCheckpoint} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1">
                        Status Terkini:
                      </label>
                      <select
                        value={checkpointStatus}
                        onChange={(e) => setCheckpointStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors shadow-xs"
                      >
                        <option value="picked_up">PICKED_UP (Diambil Kurir)</option>
                        <option value="on_transit">ON_TRANSIT (Dalam Perjalanan)</option>
                        <option value="delivered">DELIVERED (Sampai ke Pembeli)</option>
                        <option value="failed">FAILED (Gagal Kirim / Retur)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1">
                        Kota / Titik Sortir:
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Contoh: Jakarta Barat"
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1">
                      Keterangan Checkpoint:
                    </label>
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Contoh: Paket telah tiba di DC Hub Serpong..."
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors shadow-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>{isSubmitting ? 'Memperbarui...' : 'Kirim Pembaruan Checkpoint ke Pembeli'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delivered Warning Modal */}
      {showDeliveredWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500 dark:text-amber-400">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100">Konfirmasi Status Selesai</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Status Pengiriman: DELIVERED</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
              Memilih status <b className="text-emerald-600 dark:text-emerald-400">DELIVERED</b> akan otomatis mengubah status pesanan induk menjadi <b className="text-emerald-600 dark:text-emerald-400">COMPLETED (Selesai)</b> dan mencatat waktu penerimaan paket secara resmi.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeliveredWarning(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateCheckpoint}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Ya, Paket Sudah Diterima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
