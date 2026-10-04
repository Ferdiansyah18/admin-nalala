'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSidebar } from '@/context/SidebarContext';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Truck,
  Landmark,
  Megaphone,
  Package,
  Ticket,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { pendingVerificationsCount } = useToast();
  const { isExpanded, isMobileOpen, setIsMobileOpen } = useSidebar();

  const sections: NavSection[] = [
    {
      title: 'MENU',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'TRANSAKSI & OPERASIONAL',
      items: [
        { name: 'Antrean Pesanan', href: '/orders', icon: ShoppingBag },
        {
          name: 'Verifikasi Pembayaran',
          href: '/payments',
          icon: CreditCard,
          badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : null,
        },
        { name: 'Ekspedisi J&T', href: '/shipments', icon: Truck },
      ],
    },
    {
      title: 'KATALOG & PENGATURAN',
      items: [
        { name: 'Katalog Produk', href: '/products', icon: Package },
        { name: 'Master Rekening', href: '/payment-accounts', icon: Landmark },
        { name: 'Voucher Promo', href: '/vouchers', icon: Ticket },
        { name: 'Siaran Notifikasi', href: '/notifications', icon: Megaphone },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs xl:hidden"
        />
      )}

      {/* Main TailAdmin Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full flex-col justify-between border-r border-gray-200 bg-white text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${
          isExpanded ? 'w-64' : 'w-20'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}
      >
        <div>
          {/* Top Brand Logo */}
          <div className="flex h-18 items-center border-b border-gray-200 px-5 dark:border-gray-800">
            <Link href="/" className="flex items-center gap-3">
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

              {isExpanded && (
                <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                  <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
                    TailAdmin
                  </span>
                  <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                    Nalala
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Nav Items List */}
          <div className="custom-scrollbar overflow-y-auto px-4 py-5 max-h-[calc(100vh-140px)]">
            <nav className="space-y-6">
              {sections.map((section) => (
                <div key={section.title}>
                  {isExpanded ? (
                    <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                      {section.title}
                    </p>
                  ) : (
                    <div className="h-2" />
                  )}

                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          title={!isExpanded ? item.name : undefined}
                          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                            isActive
                              ? 'bg-brand-50 text-brand-500 font-semibold dark:bg-brand-500/[0.12] dark:text-brand-400'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                          } ${!isExpanded ? 'justify-center px-0' : ''}`}
                        >
                          <Icon
                            className={`h-5 w-5 shrink-0 transition-colors ${
                              isActive
                                ? 'text-brand-500 dark:text-brand-400'
                                : 'text-gray-500 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-gray-200'
                            }`}
                          />

                          {isExpanded && (
                            <span className="flex-1 truncate">{item.name}</span>
                          )}

                          {isExpanded && item.badge ? (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500 px-1.5 text-[11px] font-bold text-white">
                              {item.badge}
                            </span>
                          ) : null}

                          {!isExpanded && item.badge ? (
                            <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-error-500" />
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* User Card & Logout Bottom Area */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 font-bold text-xs dark:bg-brand-500/20 dark:text-brand-400">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>

              {isExpanded && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                    {user?.name || 'Admin Nalala'}
                  </p>
                  <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                    {user?.email || 'admin@nalala.com'}
                  </p>
                </div>
              )}
            </div>

            {isExpanded && (
              <button
                onClick={logout}
                title="Keluar / Logout"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-error-600 transition-colors dark:hover:bg-white/5 dark:hover:text-error-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
