'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('admin@nalala.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('admin');

  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Login gagal. Silakan periksa kembali email & password Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (presetEmail: string, presetPass: string, presetKey: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setSelectedPreset(presetKey);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0c111d] dark:text-white flex flex-col justify-between items-center p-6 relative overflow-hidden select-none transition-colors">
      {/* Top Header / Branding Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#465FFF] text-white shadow-md shadow-brand-500/20">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 13.5L12 4.5L21 13.5M5.5 11V20H18.5V11"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="9.5" y="14" width="5" height="6" fill="currentColor" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
            TailAdmin
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            Nalala Store
          </span>
        </div>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span>Kunjungi Toko Publik</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Center Login Card */}
      <div className="max-w-[420px] w-full relative z-10 my-auto">
        <div className="rounded-2xl border border-gray-200 bg-white p-7 md:p-8 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 transition-colors">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Administrator</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Masuk ke Dashboard
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Kelola pesanan, verifikasi transfer mutasi, dan pelacakan kurir J&T secara real-time.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-error-50 border border-error-200 text-error-600 text-xs leading-relaxed flex items-start gap-2 dark:bg-error-500/15 dark:border-error-500/20 dark:text-error-400">
              <span className="w-1.5 h-1.5 rounded-full bg-error-500 shrink-0 mt-1.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nalala.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#465FFF] hover:bg-[#3641F5] disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-all shadow-theme-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick preset credentials */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">
              Akun Cepat (Development):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@nalala.com', 'admin123', 'admin')}
                className={`px-2.5 py-1.5 rounded-lg border text-left text-[11px] transition-all flex items-center justify-between ${
                  selectedPreset === 'admin'
                    ? 'border-brand-500/50 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 dark:border-gray-800 dark:text-gray-400'
                }`}
              >
                <div className="truncate">
                  <span className="font-semibold block truncate">Admin Store</span>
                  <span className="text-[10px] opacity-75 truncate">admin@nalala.com</span>
                </div>
                {selectedPreset === 'admin' && <Check className="w-3 h-3 shrink-0 ml-1" />}
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('superadmin@nalala.com', 'admin123', 'super')}
                className={`px-2.5 py-1.5 rounded-lg border text-left text-[11px] transition-all flex items-center justify-between ${
                  selectedPreset === 'super'
                    ? 'border-brand-500/50 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 dark:border-gray-800 dark:text-gray-400'
                }`}
              >
                <div className="truncate">
                  <span className="font-semibold block truncate">Super Admin</span>
                  <span className="text-[10px] opacity-75 truncate">superadmin@...</span>
                </div>
                {selectedPreset === 'super' && <Check className="w-3 h-3 shrink-0 ml-1" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-2 relative z-10">
        &copy; {new Date().getFullYear()} Nalala Store &bull; TailAdmin E-Commerce System
      </div>
    </div>
  );
}
