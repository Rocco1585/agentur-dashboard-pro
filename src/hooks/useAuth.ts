
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  user_role: 'admin' | 'member';
  role: string;
  is_active: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Prüfe ob ein Benutzer im localStorage gespeichert ist
      const savedUser = localStorage.getItem('dashboard_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('dashboard_user');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('dashboard_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dashboard_user');
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
    // Automatische Weiterleitung zum Login - reload der Seite triggert den Login
    window.location.reload();
  };

  const isAdmin = () => {
    return user?.user_role === 'admin';
  };

  const canCreateCustomers = () => {
    return isAdmin();
  };

  const canManageRevenues = () => {
    return isAdmin();
  };

  const canCreateTodos = () => {
    return isAdmin();
  };

  const canViewAuditLogs = () => {
    return isAdmin();
  };

  return {
    user,
    loading,
    login,
    logout,
    isAdmin,
    canCreateCustomers,
    canManageRevenues,
    canCreateTodos,
    canViewAuditLogs
  };
}
