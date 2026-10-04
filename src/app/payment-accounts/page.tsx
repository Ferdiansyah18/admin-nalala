'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PaymentAccount } from '@/types/admin';
import { useToast } from '@/context/ToastContext';
import {
  Landmark,
  Plus,
  Trash2,
  Edit2,
  QrCode,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
} from 'lucide-react';

export default function PaymentAccountsPage() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [type, setType] = useState<'bank_transfer' | 'qris'>('bank_transfer');
  const [providerName, setProviderName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Preview QR Modal
  const [previewQr, setPreviewQr] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<PaymentAccount[]>('/payment-accounts');
      if (res.data) {
        setAccounts(res.data);
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memuat master rekening.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openCreateModal = () => {
    setEditingAccount(null);
    setType('bank_transfer');
    setProviderName('');
    setAccountNumber('');
    setAccountHolderName('');
    setQrImageUrl('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (acc: PaymentAccount) => {
    setEditingAccount(acc);
    setType(acc.type);
    setProviderName(acc.providerName);
    setAccountNumber(acc.accountNumber);
    setAccountHolderName(acc.accountHolderName);
    setQrImageUrl(acc.qrImageUrl || '');
    setIsActive(acc.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName || !accountNumber || !accountHolderName) {
      showToast('Harap lengkapi semua data wajib rekening.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type,
        providerName: providerName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
        qrImageUrl: type === 'qris' ? qrImageUrl.trim() || null : null,
        isActive,
      };

      if (editingAccount) {
        await api.put(`/payment-accounts/${editingAccount.id}`, payload);
        showToast('Rekening pembayaran berhasil diperbarui.', 'success');
      } else {
        await api.post('/payment-accounts', payload);
        showToast('Rekening baru berhasil ditambahkan.', 'success');
      }

      setIsModalOpen(false);
      fetchAccounts();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyimpan rekening.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (acc: PaymentAccount) => {
    try {
      await api.put(`/payment-accounts/${acc.id}`, { isActive: !acc.isActive });
      showToast(
        `Rekening ${acc.providerName} telah di-${!acc.isActive ? 'aktifkan' : 'nonaktifkan'}.`,
        'info'
      );
      fetchAccounts();
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengubah status rekening.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus rekening "${name}" dari sistem?`)) return;
    try {
      await api.delete(`/payment-accounts/${id}`);
      showToast(`Rekening "${name}" berhasil dihapus.`, 'success');
      fetchAccounts();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus rekening.', 'error');
    }
  };

  return (
    <div className="space-y-5 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Master Rekening & QRIS
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Atur daftar rekening bank penerima transfer checkout dan kode QRIS dinamis/statis.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Rekening</span>
        </button>
      </div>

      {/* Grid of Accounts */}
      {isLoading ? (
        <div className="py-24 bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-200 dark:border-zinc-800/80 flex flex-col items-center justify-center gap-2.5 text-gray-500 dark:text-zinc-500 shadow-xs">
          <div className="w-6 h-6 border-2 border-gray-300 dark:border-zinc-700 border-t-brand-500 dark:border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs">Memuat master rekening...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-zinc-900/30 rounded-xl border border-gray-200 dark:border-zinc-800/70 p-8 shadow-xs">
          <Landmark className="w-10 h-10 text-gray-400 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-zinc-200 text-sm">Belum Ada Rekening Pembayaran</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
            Klik tombol di atas untuk menambahkan nomor rekening bank transfer atau kode QRIS resmi toko Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                acc.isActive
                  ? 'bg-white border-gray-200 hover:border-gray-300 shadow-xs dark:bg-zinc-900/50 dark:border-zinc-800/80 dark:hover:border-zinc-700/80'
                  : 'bg-gray-50/80 border-gray-200/80 opacity-60 dark:bg-zinc-950/40 dark:border-zinc-800/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-zinc-800/70">
                  <div className="flex items-center gap-2">
                    {acc.type === 'qris' ? (
                      <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                        <QrCode className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                        <Landmark className="w-4 h-4" />
                      </span>
                    )}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-zinc-100">{acc.providerName}</h4>
                      <span className="text-[10px] uppercase font-semibold text-gray-500 dark:text-zinc-500 tracking-wider">
                        {acc.type === 'qris' ? 'QRIS Otomatis' : 'Transfer Bank'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActive(acc)}
                    title={acc.isActive ? 'Nonaktifkan Rekening' : 'Aktifkan Rekening'}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full border transition-colors cursor-pointer ${
                      acc.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        acc.isActive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-gray-400 dark:bg-zinc-500'
                      }`}
                    />
                    {acc.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <div className="py-4 space-y-1.5">
                  <span className="text-[11px] text-gray-500 dark:text-zinc-500">Nomor Rekening / NMID:</span>
                  <p className="font-mono text-lg font-bold tracking-wider text-gray-900 dark:text-zinc-100">
                    {acc.accountNumber}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium">a.n {acc.accountHolderName}</p>

                  {acc.type === 'qris' && acc.qrImageUrl && (
                    <button
                      onClick={() => setPreviewQr(acc.qrImageUrl!)}
                      className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Lihat Gambar QR Code</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-3.5 border-t border-gray-100 dark:border-zinc-800/70 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(acc)}
                  className="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-gray-500 dark:text-zinc-400" />
                  <span>Ubah</span>
                </button>
                <button
                  onClick={() => handleDelete(acc.id, `${acc.providerName} - ${acc.accountNumber}`)}
                  className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Preview Modal */}
      {previewQr && (
        <div
          onClick={() => setPreviewQr(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100">Pratinjau QRIS Toko</h4>
            <div className="p-3 bg-white rounded-xl aspect-square flex items-center justify-center border border-gray-200">
              <img src={previewQr} alt="QRIS" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-brand-500 dark:text-amber-400" />
                {editingAccount ? 'Edit Rekening Pembayaran' : 'Tambah Rekening Pembayaran'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                  Tipe Pembayaran:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setType('bank_transfer')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      type === 'bank_transfer'
                        ? 'bg-brand-50/70 border-brand-500 text-brand-900 dark:bg-zinc-800 dark:border-amber-500/60 dark:text-zinc-100 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-zinc-950/60 dark:border-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('qris')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      type === 'qris'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 dark:bg-zinc-800 dark:border-purple-500/60 dark:text-zinc-100 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-zinc-950/60 dark:border-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    QRIS Standar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Nama Bank / Provider QRIS:
                </label>
                <input
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Contoh: BCA, Mandiri, BRI, QRIS Nalala Official"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Nomor Rekening / NMID:
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Contoh: 8801234567 atau ID1020304050"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Atas Nama Pemilik Rekening:
                </label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Contoh: PT Nalala Niaga Sejahtera"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors shadow-xs"
                />
              </div>

              {type === 'qris' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    URL Gambar QR Code (Opsional):
                  </label>
                  <input
                    type="url"
                    value={qrImageUrl}
                    onChange={(e) => setQrImageUrl(e.target.value)}
                    placeholder="https://.../qris.jpg"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors shadow-xs"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 bg-white border-gray-300 focus:ring-brand-500 dark:bg-zinc-950 dark:border-zinc-800"
                />
                <label htmlFor="isActiveToggle" className="text-xs text-gray-700 dark:text-zinc-300 font-medium cursor-pointer">
                  Aktifkan rekening ini sekarang
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
