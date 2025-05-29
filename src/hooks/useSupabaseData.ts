
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Fehler",
        description: "Kunden konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const updateCustomer = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Erfolg",
        description: "Kunde wurde aktualisiert.",
      });
      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Fehler",
        description: "Kunde konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const addCustomer = async (customerData: any) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Kunde wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "Fehler",
        description: "Kunde konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  return { customers, loading, updateCustomer, addCustomer, refetch: fetchCustomers };
}

export function useRevenues() {
  const [revenues, setRevenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenues = async () => {
    try {
      const { data, error } = await supabase
        .from('revenues')
        .select(`
          *,
          customers (name)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setRevenues(data || []);
    } catch (error) {
      console.error('Error fetching revenues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenues();
  }, []);

  const addRevenue = async (revenueData: any) => {
    try {
      const { data, error } = await supabase
        .from('revenues')
        .insert([revenueData])
        .select(`
          *,
          customers (name)
        `)
        .single();

      if (error) throw error;
      
      setRevenues(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Einnahme wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding revenue:', error);
      toast({
        title: "Fehler",
        description: "Einnahme konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  return { revenues, loading, addRevenue, refetch: fetchRevenues };
}

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return { teamMembers, loading, refetch: fetchTeamMembers };
}

export function useTodos() {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const updateTodo = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTodos(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  return { todos, loading, updateTodo, refetch: fetchTodos };
}
