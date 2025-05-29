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
      toast({
        title: "Fehler",
        description: "Einnahmen konnten nicht geladen werden.",
        variant: "destructive",
      });
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

export function useExpenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Fehler",
        description: "Ausgaben konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (expenseData: any) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;
      
      setExpenses(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Ausgabe wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Fehler",
        description: "Ausgabe konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  return { expenses, loading, addExpense, refetch: fetchExpenses };
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

  const addTeamMember = async (memberData: any) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([memberData])
        .select()
        .single();

      if (error) throw error;
      
      setTeamMembers(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Teammitglied wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Fehler",
        description: "Teammitglied konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  return { teamMembers, loading, addTeamMember, refetch: fetchTeamMembers };
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

  const addTodo = async (todoData: any) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([todoData])
        .select()
        .single();

      if (error) throw error;
      
      setTodos(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Todo wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: "Fehler",
        description: "Todo konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

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

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTodos(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Erfolg",
        description: "Todo wurde gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: "Fehler",
        description: "Todo konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  return { todos, loading, addTodo, updateTodo, deleteTodo, refetch: fetchTodos };
}

export function useHotLeads() {
  const [hotLeads, setHotLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHotLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('hot_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotLeads(data || []);
    } catch (error) {
      console.error('Error fetching hot leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotLeads();
  }, []);

  const addHotLead = async (leadData: any) => {
    try {
      const { data, error } = await supabase
        .from('hot_leads')
        .insert([leadData])
        .select()
        .single();

      if (error) throw error;
      
      setHotLeads(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Hot Lead wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding hot lead:', error);
      toast({
        title: "Fehler",
        description: "Hot Lead konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  const updateHotLead = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('hot_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setHotLeads(prev => prev.map(l => l.id === id ? data : l));
      return data;
    } catch (error) {
      console.error('Error updating hot lead:', error);
    }
  };

  const deleteHotLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hot_leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHotLeads(prev => prev.filter(l => l.id !== id));
      toast({
        title: "Erfolg",
        description: "Hot Lead wurde gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting hot lead:', error);
      toast({
        title: "Fehler",
        description: "Hot Lead konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  return { hotLeads, loading, addHotLead, updateHotLead, deleteHotLead, refetch: fetchHotLeads };
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (name, contact, phone, email)
        `)
        .order('date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const addAppointment = async (appointmentData: any) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          customers (name, contact, phone, email)
        `)
        .single();

      if (error) throw error;
      
      setAppointments(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Termin wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  const updateAppointment = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          customers (name, contact, phone, email)
        `)
        .single();

      if (error) throw error;
      
      setAppointments(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAppointments(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Erfolg",
        description: "Termin wurde gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  return { appointments, loading, addAppointment, updateAppointment, deleteAppointment, refetch: fetchAppointments };
}
