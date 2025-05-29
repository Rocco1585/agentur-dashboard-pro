
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  user_role: 'admin' | 'member';
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
      // Simuliere einen eingeloggten Admin-Benutzer für Demo-Zwecke
      // In einer echten Anwendung würde hier eine echte Authentifizierung stattfinden
      const mockUser: User = {
        id: 'admin-user-id',
        name: 'Admin User',
        email: 'admin@example.com',
        user_role: 'admin',
        is_active: true
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
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
    isAdmin,
    canCreateCustomers,
    canManageRevenues,
    canCreateTodos,
    canViewAuditLogs
  };
}
