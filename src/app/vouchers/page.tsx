'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  Ticket,
  Plus,
  Trash2,
  Calendar,
  Tag,
  CheckCircle2,
  XCircle,
  X,
  Percent,
} from 'lucide-react';

export default function VouchersAdminPage() {
  const { showToast } = useToast();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form Fields
  const [code, setCode] = useState<string>('DISKONBARU');
  const [title, setTitle] = useState<string>('Potongan Diskon 25%');
  const [description, setDescription] = useState<string>('Promo diskon terbatas');
  const [type, setType] = useState<'product_discount' | 'shipping_discount'>('product_discount');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(25);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(50000);
  const [minSpend, setMinSpend] = useState<number>(100000);
  const [quotaTotal, setQuotaTotal] = useState<number>(100);
  const [quotaPerUser, setQuotaPerUser] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>('/vouchers?limit=50');
      if (res.data?.vouchers) {
        setVouchers(res.data.vouchers);
      } else if (Array.isArray(res.data)) {
        setVouchers(res.data);
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memuat daftar voucher.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleDelete = async (id: string, voucherCode: string) => {
    if (!confirm(`Hapus voucher "${voucherCode}"?`)) return;
    try {
      await api.delete(`/vouchers/${id}`);
      showToast(`Voucher ${voucherCode} berhasil dihapus.`, 'success');
      fetchVouchers();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus voucher.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim(),
      type,
      discountType,
      discountValue: Number(discountValue),
      maxDiscountAmount: discountType === 'percentage' && maxDiscountAmount ? Number(maxDiscountAmount) : null,
      minSpend: Number(minSpend) || 0,
      applicableTo: 'all_products',
      quotaTotal: Number(quotaTotal) || 100,
      quotaPerUser: Number(quotaPerUser) || 1,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(`${endDate}T23:59:59.000Z`).toISOString(),
    };

    try {
      await api.post('/vouchers', payload);
      showToast(`Voucher ${payload.code} berhasil diterbitkan!`, 'success');
      setIsModalOpen(false);
      fetchVouchers();
    } catch (err: any) {
      showToast(err?.message || 'Gagal membuat voucher.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-zinc-800/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            Voucher Promo & Diskon
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Terbitkan kupon diskon produk dan subsidi ongkir dengan kuota dan masa berlaku tertentu.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-[#465FFF] hover:bg-[#3641F5] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Terbitkan Voucher</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-200 dark:border-zinc-800/80 flex flex-col items-center justify-center gap-2.5 text-gray-400 dark:text-zinc-500">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#465FFF] dark:border-zinc-700 dark:border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs">Memuat data voucher...</p>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-zinc-900/30 rounded-xl border border-gray-200 dark:border-zinc-800/70 p-8">
          <Ticket className="w-10 h-10 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 dark:text-zinc-200 text-sm">Belum Ada Voucher</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 hover:border-gray-300 dark:hover:border-zinc-700/80 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800/70">
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    {v.code}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                      v.type === 'shipping_discount'
                        ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                    }`}
                  >
                    {v.type === 'shipping_discount' ? 'Subsidi Ongkir' : 'Diskon Produk'}
                  </span>
                </div>

                <div className="py-3 space-y-1">
                  <h4 className="font-semibold text-gray-900 dark:text-zinc-100 text-xs">{v.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed line-clamp-2">{v.description}</p>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-950/60 border border-gray-100 dark:border-zinc-800/80 space-y-1 text-[11px] text-gray-500 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Besaran Diskon:</span>
                    <span className="font-semibold text-gray-900 dark:text-zinc-200">
                      {v.discountType === 'percentage'
                        ? `${v.discountValue}% ${v.maxDiscountAmount ? `(Max Rp${Number(v.maxDiscountAmount).toLocaleString('id-ID')})` : ''}`
                        : `Rp${Number(v.discountValue).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimal Belanja:</span>
                    <span className="text-gray-900 dark:text-zinc-200">
                      Rp{Number(v.minSpend || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kuota Terpakai:</span>
                    <span className="text-gray-900 dark:text-zinc-200 font-mono">
                      {v.quotaUsed || 0} / {v.quotaTotal} kupon
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 border-t border-gray-100 dark:border-zinc-800/70 flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-500 mt-3">
                <span>
                  Berlaku s.d{' '}
                  {new Date(v.endDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => handleDelete(v.id, v.code)}
                  className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Terbitkan Voucher Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Kode Voucher (Kapital):</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="CONTOH: NALALAGAJIAN"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 font-mono font-bold focus:outline-none focus:border-brand-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Judul Promo:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Diskon Gajian 20%"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Deskripsi Syarat & Ketentuan:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Tipe Voucher:</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="product_discount">Diskon Produk</option>
                    <option value="shipping_discount">Subsidi Ongkir</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Jenis Potongan:</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal Flat (Rp)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Nilai Diskon:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Maks. Diskon (Rp):</label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                    placeholder="Kosongkan jika flat"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Min. Belanja (Rp):</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Total Kuota:</label>
                  <input
                    type="number"
                    value={quotaTotal}
                    onChange={(e) => setQuotaTotal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Tanggal Mulai:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-zinc-300 mb-1">Tanggal Berakhir:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#465FFF] hover:bg-[#3641F5] text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Menerbitkan...' : 'Terbitkan Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
