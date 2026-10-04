'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AdminAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { isExpanded } = useSidebar();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0c111d] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-gray-200 border-t-brand-500 rounded-full animate-spin dark:border-gray-800" />
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Memverifikasi sesi administrator...
        </p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // Will redirect via AuthContext
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c111d] text-gray-900 dark:text-white flex transition-colors">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isExpanded ? 'xl:ml-64 xl:w-[calc(100%-16rem)]' : 'xl:ml-20 xl:w-[calc(100%-5rem)]'
        } ml-0 w-full`}
      >
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
