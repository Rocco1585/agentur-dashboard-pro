
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  team_member?: {
    name: string;
    email: string;
  };
}

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    console.log('🔄 Fetching audit logs...');
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          team_members (name, email)
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      console.log('✅ Audit logs fetch result:', { data, error });

      if (error) {
        console.error('❌ Audit logs fetch error:', error);
        throw error;
      }
      
      console.log('📊 Audit logs loaded:', data?.length || 0);
      setAuditLogs(data || []);
    } catch (error) {
      console.error('❌ Error fetching audit logs:', error);
      toast({
        title: "Fehler",
        description: `Audit-Logs konnten nicht geladen werden: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return { auditLogs, loading, refetch: fetchAuditLogs };
}
