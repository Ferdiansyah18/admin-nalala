'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Order } from '@/types/admin';
import { useToast } from '@/context/ToastContext';
import {
  ShoppingBag,
  CreditCard,
  Truck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Filter,
  Eye,
  AlertCircle,
  Package,
  Landmark,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { pendingVerificationsCount, setPendingVerificationsCount, latestNewOrder } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get<Order[]>('/orders?limit=10');
      if (res.data) {
        setOrders(res.data);
        const pendingProofs = res.data.filter(
          (o) =>
            o.status === 'awaiting_payment_reupload' ||
            o.payment?.status === 'waiting_verification' ||
            (o.status === 'pending_payment' && o.payment?.proofImageUrl)
        ).length;
        setPendingVerificationsCount(pendingProofs);
      }
    } catch (err) {
      console.error('Failed to load orders for dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (latestNewOrder) {
      fetchDashboardData();
    }
  }, [latestNewOrder]);

  // Derived metrics
  const totalRevenue = orders
    .filter((o) => ['processing', 'shipped', 'delivered', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + (o.pricing?.netTotal || 0), 0);

  const activeShipments = orders.filter((o) =>
    ['shipped', 'processing'].includes(o.status)
  ).length;

  // Monthly sales distribution data (Jan - Dec)
  const monthlyData = [
    { month: 'Jan', value: 35 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 55 },
    { month: 'Apr', value: 40 },
    { month: 'Mei', value: 70 },
    { month: 'Jun', value: 60 },
    { month: 'Jul', value: 85 },
    { month: 'Agu', value: 75 },
    { month: 'Sep', value: 90 },
    { month: 'Okt', value: orders.length > 0 ? 82 : 40 },
    { month: 'Nov', value: 65 },
    { month: 'Des', value: 95 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
            <span className="h-1.5 w-1.5 rounded-full bg-warning-500" />
            Menunggu Bayar
          </span>
        );
      case 'awaiting_payment_reupload':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-400">
            <span className="h-1.5 w-1.5 rounded-full bg-error-500" />
            Bukti Ditolak
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
            Diproses
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Dikirim
          </span>
        );
      case 'delivered':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
            Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            E-Commerce Dashboard
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ringkasan data transaksi, omzet pesanan terverifikasi, dan logistik ekspedisi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingVerificationsCount > 0 && (
            <Link
              href="/payments"
              className="inline-flex items-center gap-2 rounded-lg bg-warning-50 px-3.5 py-2 text-xs font-semibold text-warning-600 hover:bg-warning-100 dark:bg-warning-500/15 dark:text-warning-400 dark:hover:bg-warning-500/25 transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{pendingVerificationsCount} Perlu Verifikasi</span>
            </Link>
          )}

          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-lg bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white shadow-theme-xs hover:bg-[#3641F5] transition-all"
          >
            <span>Antrean Pesanan</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Pending Verifications Notice */}
      {pendingVerificationsCount > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-warning-200 bg-warning-50/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-warning-500/20 dark:bg-warning-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-500 text-white shadow-xs">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                Terdapat {pendingVerificationsCount} bukti transfer pembayaran baru yang memerlukan approval!
              </p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                Verifikasi mutasi rekening agar pesanan dapat segera diproses ke logistik ekspedisi.
              </p>
            </div>
          </div>
          <Link
            href="/payments"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-warning-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-warning-600 transition-colors shrink-0"
          >
            <span>Verifikasi Sekarang</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* 4 TailAdmin Signature Ecommerce Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {/* Metric 1: Total Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white/90">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total Transaksi
              </span>
              <h4 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {orders.length}
              </h4>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              11.01%
            </span>
          </div>
        </div>

        {/* Metric 2: Total Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white/90">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Omzet Terverifikasi
              </span>
              <h4 className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                Rp{totalRevenue.toLocaleString('id-ID')}
              </h4>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              9.45%
            </span>
          </div>
        </div>

        {/* Metric 3: Pending Approvals */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white/90">
            <CreditCard className="h-6 w-6 text-amber-500" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Perlu Verifikasi
              </span>
              <h4 className="mt-1 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {pendingVerificationsCount}
              </h4>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
              <Clock className="h-3.5 w-3.5" />
              Pending
            </span>
          </div>
        </div>

        {/* Metric 4: Active Shipments */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white/90">
            <Truck className="h-6 w-6 text-[#465FFF]" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Dalam Pengiriman
              </span>
              <h4 className="mt-1 text-2xl font-bold tracking-tight text-[#465FFF] dark:text-[#7592ff]">
                {activeShipments}
              </h4>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              J&T Express
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: TailAdmin 12-Column Grid (Monthly Sales + Monthly Target) */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Monthly Sales Bar Chart (Col-Span 7) */}
        <div className="col-span-12 xl:col-span-7 rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Monthly Sales
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Performa pesanan masuk sepanjang tahun berjalan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <span className="h-2.5 w-2.5 rounded-full bg-[#465FFF]" />
                Volume Pesanan
              </span>
            </div>
          </div>

          {/* Lightweight SVG Bar Chart */}
          <div className="mt-6 pt-4">
            <div className="flex items-end justify-between gap-2 h-44 px-2">
              {monthlyData.map((item) => (
                <div key={item.month} className="group relative flex flex-col items-center flex-1 h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 hidden group-hover:flex items-center justify-center rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-white shadow-xs dark:bg-gray-100 dark:text-gray-900 whitespace-nowrap z-10">
                    {item.value} order
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${item.value}%` }}
                    className="w-full max-w-[28px] rounded-t-md bg-[#465FFF] transition-all duration-300 hover:bg-[#3641F5] dark:hover:bg-[#7592ff]"
                  />
                  <span className="mt-2 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Target Radial Gauge Card (Col-Span 5) */}
        <div className="col-span-12 xl:col-span-5 rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Monthly Target
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Target omzet bulanan operasional toko
              </p>
            </div>
            <span className="rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-semibold text-success-600 dark:bg-success-500/15 dark:text-success-400">
              +10%
            </span>
          </div>

          {/* Lightweight SVG Semi-Radial Gauge */}
          <div className="my-4 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center w-48 h-28 overflow-hidden">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-gray-100 dark:stroke-gray-800"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset="125.6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[#465FFF] transition-all duration-1000"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset="155"
                />
              </svg>
              <div className="absolute top-10 flex flex-col items-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  75.5%
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  Target Tercapai
                </span>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400 max-w-xs">
              Kinerja penjualan meningkat dibandingkan periode lalu. Pertahankan performa layanan!
            </p>
          </div>

          {/* Target Breakdown Row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-4 text-center dark:divide-gray-800 dark:border-gray-800">
            <div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Target</p>
              <p className="mt-0.5 text-xs font-bold text-gray-900 dark:text-white">
                Rp15Jt
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Omzet</p>
              <p className="mt-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Rp{(totalRevenue / 1000000).toFixed(1)}Jt
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Hari Ini</p>
              <p className="mt-0.5 text-xs font-bold text-[#465FFF] dark:text-[#7592ff]">
                Rp{(totalRevenue > 0 ? (totalRevenue * 0.15) / 1000000 : 0).toFixed(1)}Jt
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TailAdmin Recent Orders Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Orders
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Daftar pesanan retail dan reseller terbaru di sistem
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filter Status</span>
            </Link>

            <Link
              href="/orders"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
            >
              <span>Semua Pesanan</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
            <div className="h-6 w-6 border-2 border-gray-200 border-t-[#465FFF] rounded-full animate-spin dark:border-gray-800" />
            <p className="text-xs">Memuat data transaksi dari server...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            Belum ada transaksi pesanan yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-y border-gray-100 text-gray-400 dark:border-gray-800 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">No. Order & Pelanggan</th>
                  <th className="py-3.5 px-4">Kota Tujuan</th>
                  <th className="py-3.5 px-4">Total Tagihan</th>
                  <th className="py-3.5 px-4">Metode Bayar</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.slice(0, 6).map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 font-bold text-xs dark:bg-gray-800 dark:text-gray-300">
                          {order.orderNumber.slice(-3)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {order.orderNumber}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {order.shipping?.address?.recipientName || 'Pembeli Anonim'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                      {order.shipping?.address?.city || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                      Rp{Number(order.pricing?.netTotal || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                      {order.payment?.account?.provider || 'Transfer Bank'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/orders"
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Detail</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Access TailAdmin Style Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/payments"
          className="group rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-500 hover:shadow-theme-xs transition-all dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 mb-3">
            <CreditCard className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-gray-900 group-hover:text-[#465FFF] transition-colors dark:text-white">
            Verifikasi Mutasi
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Approve bukti transfer
          </p>
        </Link>

        <Link
          href="/shipments"
          className="group rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-500 hover:shadow-theme-xs transition-all dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-[#465FFF] dark:bg-brand-500/15 dark:text-brand-400 mb-3">
            <Truck className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-gray-900 group-hover:text-[#465FFF] transition-colors dark:text-white">
            Monitoring Resi J&T
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Lacak kiriman paket
          </p>
        </Link>

        <Link
          href="/products"
          className="group rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-500 hover:shadow-theme-xs transition-all dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 mb-3">
            <Package className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-gray-900 group-hover:text-[#465FFF] transition-colors dark:text-white">
            Katalog Produk
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Stok & varian harga
          </p>
        </Link>

        <Link
          href="/payment-accounts"
          className="group rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-500 hover:shadow-theme-xs transition-all dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 mb-3">
            <Landmark className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-gray-900 group-hover:text-[#465FFF] transition-colors dark:text-white">
            Master Rekening
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Tujuan transfer & QRIS
          </p>
        </Link>
      </div>
    </div>
  );
}
