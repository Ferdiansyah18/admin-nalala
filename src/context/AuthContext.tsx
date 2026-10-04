'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminUser, ApiResponse } from '@/types/admin';
import { api, ApiError } from '@/lib/api';
import { getAdminSocket, disconnectAdminSocket } from '@/lib/socket';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('nalala_admin_token');
    if (!storedToken) {
      setIsLoading(false);
      if (pathname !== '/login') router.push('/login');
      return;
    }

    setToken(storedToken);
    api
      .get<AdminUser>('/users/me')
      .then((res) => {
        if (res.data?.role !== 'admin') {
          throw new Error('Akses ditolak: Akun ini tidak memiliki hak akses Administrator.');
        }
        setUser(res.data);
        getAdminSocket(storedToken, res.data.id);
      })
      .catch((err) => {
        console.error('Session validation failed:', err);
        localStorage.removeItem('nalala_admin_token');
        setToken(null);
        setUser(null);
        if (pathname !== '/login') router.push('/login');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{
      user: AdminUser;
      accessToken?: string;
      refreshToken?: string;
      tokens?: { accessToken: string; refreshToken: string };
    }>('/auth/signin', { email, password });

    const userData = res.data?.user;
    const accessToken = res.data?.accessToken || res.data?.tokens?.accessToken;

    if (!userData || !accessToken) {
      throw new ApiError('Autentikasi gagal: Token tidak ditemukan.');
    }

    if (userData.role !== 'admin') {
      throw new ApiError(`Akses ditolak: Akun ini memiliki role '${userData.role}', bukan 'admin'.`);
    }

    localStorage.setItem('nalala_admin_token', accessToken);
    setToken(accessToken);
    setUser(userData);
    getAdminSocket(accessToken, userData.id);

    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('nalala_admin_token');
    disconnectAdminSocket();
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
