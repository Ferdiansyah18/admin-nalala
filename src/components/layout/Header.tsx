'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/context/SidebarContext';
import { useToast } from '@/context/ToastContext';
import {
  Menu,
  X,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar, toggleMobileSidebar, isMobileOpen } = useSidebar();
  const { pendingVerificationsCount } = useToast();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth >= 1280) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-18 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 transition-colors dark:border-gray-800 dark:bg-gray-900 select-none">
      {/* Left: Sidebar Toggle */}
      <div className="flex items-center">
        <button
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Right: Theme Toggle & Notifications */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Notifications Icon & Popover */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            aria-label="Notifikasi"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {pendingVerificationsCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-error-500">
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 animate-ping rounded-full bg-error-400 opacity-75"></span>
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifikasi
                </h4>
                {pendingVerificationsCount > 0 && (
                  <span className="rounded-full bg-error-50 px-2 py-0.5 text-[10px] font-semibold text-error-600 dark:bg-error-500/15 dark:text-error-400">
                    {pendingVerificationsCount} Baru
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-2 text-xs">
                {pendingVerificationsCount > 0 ? (
                  <a
                    href="/payments"
                    onClick={() => setIsNotificationOpen(false)}
                    className="block rounded-lg p-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Verifikasi Pembayaran
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                      Ada {pendingVerificationsCount} bukti transfer menunggu verifikasi admin.
                    </p>
                  </a>
                ) : (
                  <div className="py-4 text-center text-gray-400 text-xs">
                    Tidak ada notifikasi mendesak saat ini.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
