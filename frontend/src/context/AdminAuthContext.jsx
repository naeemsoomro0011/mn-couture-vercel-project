import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  const refreshAdmin = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/auth/me');
      setAdmin(data.admin);
    } catch {
      setAdmin(null);
    } finally {
      setLoadingAdmin(false);
    }
  }, []);

  useEffect(() => {
    refreshAdmin();
  }, [refreshAdmin]);

  const logout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, setAdmin, loadingAdmin, refreshAdmin, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
