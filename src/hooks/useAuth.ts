
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  user_role: 'admin' | 'member' | 'kunde';
  role: string;
  is_active: boolean;
  customer_dashboard_name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const logAuditEvent = async (action: string, tableName: string, recordId?: string, oldValues?: any, newValues?: any) => {
    try {
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        timestamp: new Date().toISOString(),
        ip_address: null,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  };

  const checkUser = async () => {
    try {
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

  const login = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('dashboard_user', JSON.stringify(userData));
    
    await logAuditEvent('LOGIN', 'user_sessions', userData.id, null, {
      user_id: userData.id,
      user_name: userData.name,
      user_email: userData.email,
      login_time: new Date().toISOString()
    });
  };

  const logout = async () => {
    if (user) {
      await logAuditEvent('LOGOUT', 'user_sessions', user.id, null, {
        user_id: user.id,
        user_name: user.name,
        logout_time: new Date().toISOString()
      });
    }
    
    setUser(null);
    localStorage.removeItem('dashboard_user');
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
    window.location.reload();
  };

  const isAdmin = () => {
    return user?.user_role === 'admin';
  };

  const isCustomer = () => {
    return user?.user_role === 'kunde';
  };

  const isMember = () => {
    return user?.user_role === 'member';
  };

  // Berechtigungsfunktionen
  const canCreateCustomers = () => {
    return isAdmin();
  };

  const canEditCustomers = () => {
    return isAdmin();
  };

  const canViewCustomers = () => {
    return isAdmin() || isMember();
  };

  const canManageRevenues = () => {
    return isAdmin();
  };

  const canCreateTodos = () => {
    return isAdmin();
  };

  const canViewTodos = () => {
    return isAdmin() || isMember();
  };

  const canCompleteTodos = () => {
    return isAdmin() || isMember();
  };

  const canViewAuditLogs = () => {
    return isAdmin();
  };

  const canAccessSettings = () => {
    return isAdmin();
  };

  const canViewTeamMembers = () => {
    return isAdmin();
  };

  const canViewUserManagement = () => {
    return isAdmin();
  };

  const canAccessMainNavigation = () => {
    return !isCustomer();
  };

  const canViewCustomerDashboards = () => {
    return isAdmin();
  };

  return {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isCustomer,
    isMember,
    canCreateCustomers,
    canEditCustomers,
    canViewCustomers,
    canManageRevenues,
    canCreateTodos,
    canViewTodos,
    canCompleteTodos,
    canViewAuditLogs,
    canAccessSettings,
    canViewTeamMembers,
    canViewUserManagement,
    canAccessMainNavigation,
    canViewCustomerDashboards,
    logAuditEvent
  };
}
