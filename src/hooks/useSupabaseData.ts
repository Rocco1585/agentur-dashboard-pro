import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    console.log('🔄 Fetching customers...');
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('✅ Customers fetch result:', { data, error });
      
      if (error) {
        console.error('❌ Customers fetch error:', error);
        throw error;
      }
      
      console.log('📊 Customers loaded:', data?.length || 0);
      setCustomers(data || []);
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      toast({
        title: "Fehler",
        description: `Kunden konnten nicht geladen werden: ${error.message}`,
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
    console.log('🔄 Updating customer:', id, updates);
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      console.log('✅ Customer update result:', { data, error });

      if (error) {
        console.error('❌ Customer update error:', error);
        throw error;
      }
      
      setCustomers(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Erfolg",
        description: "Kunde wurde aktualisiert.",
      });
      return data;
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      toast({
        title: "Fehler",
        description: `Kunde konnte nicht aktualisiert werden: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const addCustomer = async (customerData: any) => {
    console.log('🔄 Adding customer:', customerData);
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      console.log('✅ Customer add result:', { data, error });

      if (error) {
        console.error('❌ Customer add error:', error);
        throw error;
      }
      
      setCustomers(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Kunde wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('❌ Error adding customer:', error);
      toast({
        title: "Fehler",
        description: `Kunde konnte nicht hinzugefügt werden: ${error.message}`,
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
    console.log('🔄 Fetching revenues...');
    try {
      const { data, error } = await supabase
        .from('revenues')
        .select(`
          *,
          customers (name)
        `)
        .order('date', { ascending: false });

      console.log('✅ Revenues fetch result:', { data, error });

      if (error) {
        console.error('❌ Revenues fetch error:', error);
        throw error;
      }
      
      console.log('📊 Revenues loaded:', data?.length || 0);
      setRevenues(data || []);
    } catch (error) {
      console.error('❌ Error fetching revenues:', error);
      toast({
        title: "Fehler",
        description: `Einnahmen konnten nicht geladen werden: ${error.message}`,
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
    console.log('🔄 Adding revenue:', revenueData);
    try {
      const { data, error } = await supabase
        .from('revenues')
        .insert([revenueData])
        .select(`
          *,
          customers (name)
        `)
        .single();

      console.log('✅ Revenue add result:', { data, error });

      if (error) {
        console.error('❌ Revenue add error:', error);
        throw error;
      }
      
      setRevenues(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Einnahme wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('❌ Error adding revenue:', error);
      toast({
        title: "Fehler",
        description: `Einnahme konnte nicht hinzugefügt werden: ${error.message}`,
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
    console.log('🔄 Fetching expenses...');
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      console.log('✅ Expenses fetch result:', { data, error });

      if (error) {
        console.error('❌ Expenses fetch error:', error);
        throw error;
      }
      
      console.log('📊 Expenses loaded:', data?.length || 0);
      setExpenses(data || []);
    } catch (error) {
      console.error('❌ Error fetching expenses:', error);
      toast({
        title: "Fehler",
        description: `Ausgaben konnten nicht geladen werden: ${error.message}`,
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
    console.log('🔄 Adding expense:', expenseData);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();

      console.log('✅ Expense add result:', { data, error });

      if (error) {
        console.error('❌ Expense add error:', error);
        throw error;
      }
      
      setExpenses(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Ausgabe wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('❌ Error adding expense:', error);
      toast({
        title: "Fehler",
        description: `Ausgabe konnte nicht hinzugefügt werden: ${error.message}`,
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
    console.log('🔄 Fetching team members...');
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('✅ Team members fetch result:', { data, error });

      if (error) {
        console.error('❌ Team members fetch error:', error);
        throw error;
      }
      
      console.log('📊 Team members loaded:', data?.length || 0);
      setTeamMembers(data || []);
    } catch (error) {
      console.error('❌ Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const addTeamMember = async (memberData: any) => {
    console.log('🔄 Adding team member:', memberData);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([memberData])
        .select()
        .single();

      console.log('✅ Team member add result:', { data, error });

      if (error) {
        console.error('❌ Team member add error:', error);
        throw error;
      }
      
      setTeamMembers(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Teammitglied wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('❌ Error adding team member:', error);
      toast({
        title: "Fehler",
        description: `Teammitglied konnte nicht hinzugefügt werden: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateTeamMember = async (id: string, updates: any) => {
    console.log('🔄 Updating team member:', id, updates);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      console.log('✅ Team member update result:', { data, error });

      if (error) {
        console.error('❌ Team member update error:', error);
        throw error;
      }
      
      setTeamMembers(prev => prev.map(tm => tm.id === id ? data : tm));
      toast({
        title: "Erfolg",
        description: "Teammitglied wurde aktualisiert.",
      });
      return data;
    } catch (error) {
      console.error('❌ Error updating team member:', error);
      toast({
        title: "Fehler",
        description: `Teammitglied konnte nicht aktualisiert werden: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return { teamMembers, loading, addTeamMember, updateTeamMember, refetch: fetchTeamMembers };
}

export function useTodos() {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    console.log('🔄 Fetching todos...');
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('due_date', { ascending: true });

      console.log('✅ Todos fetch result:', { data, error });

      if (error) {
        console.error('❌ Todos fetch error:', error);
        throw error;
      }
      
      console.log('📊 Todos loaded:', data?.length || 0);
      setTodos(data || []);
    } catch (error) {
      console.error('❌ Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (todoData: any) => {
    console.log('🔄 Adding todo:', todoData);
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([todoData])
        .select()
        .single();

      console.log('✅ Todo add result:', { data, error });

      if (error) {
        console.error('❌ Todo add error:', error);
        throw error;
      }
      
      setTodos(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Todo wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('❌ Error adding todo:', error);
      toast({
        title: "Fehler",
        description: `Todo konnte nicht hinzugefügt werden: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateTodo = async (id: string, updates: any) => {
    console.log('🔄 Updating todo:', id, updates);
    try {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      console.log('✅ Todo update result:', { data, error });

      if (error) {
        console.error('❌ Todo update error:', error);
        throw error;
      }
      
      setTodos(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (error) {
      console.error('❌ Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    console.log('🔄 Deleting todo:', id);
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      console.log('✅ Todo delete result:', { error });

      if (error) {
        console.error('❌ Todo delete error:', error);
        throw error;
      }
      
      setTodos(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Erfolg",
        description: "Todo wurde gelöscht.",
      });
    } catch (error) {
      console.error('❌ Error deleting todo:', error);
      toast({
        title: "Fehler",
        description: `Todo konnte nicht gelöscht werden: ${error.message}`,
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
    console.log('🔄 Fetching hot leads...');
    try {
      const { data, error } = await supabase
        .from('hot_leads')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('✅ Hot leads fetch result:', { data, error });

      if (error) {
        console.error('❌ Hot leads fetch error:', error);
        throw error;
      }
      
      console.log('📊 Hot leads loaded:', data?.length || 0);
      setHotLeads(data || []);
    } catch (error) {
      console.error('❌ Error fetching hot leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotLeads();
  }, []);

  const addHotLead = async (leadData: any) => {
    console.log('🔄 Adding hot lead:', leadData);
    try {
      const { data, error } = await supabase
        .from('hot_leads')
        .insert([leadData])
        .select()
        .single();

      console.log('✅ Hot lead add result:', { data, error });

      if (error) {
        console.error('❌ Hot lead add error:', error);
        throw error;
      }
      
      setHotLeads(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Hot Lead wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('❌ Error adding hot lead:', error);
      toast({
        title: "Fehler",
        description: `Hot Lead konnte nicht hinzugefügt werden: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateHotLead = async (id: string, updates: any) => {
    console.log('🔄 Updating hot lead:', id, updates);
    try {
      const { data, error } = await supabase
        .from('hot_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      console.log('✅ Hot lead update result:', { data, error });

      if (error) {
        console.error('❌ Hot lead update error:', error);
        throw error;
      }
      
      setHotLeads(prev => prev.map(l => l.id === id ? data : l));
      return data;
    } catch (error) {
      console.error('❌ Error updating hot lead:', error);
    }
  };

  const deleteHotLead = async (id: string) => {
    console.log('🔄 Deleting hot lead:', id);
    try {
      const { error } = await supabase
        .from('hot_leads')
        .delete()
        .eq('id', id);

      console.log('✅ Hot lead delete result:', { error });

      if (error) {
        console.error('❌ Hot lead delete error:', error);
        throw error;
      }
      
      setHotLeads(prev => prev.filter(l => l.id !== id));
      toast({
        title: "Erfolg",
        description: "Hot Lead wurde gelöscht.",
      });
    } catch (error) {
      console.error('❌ Error deleting hot lead:', error);
      toast({
        title: "Fehler",
        description: `Hot Lead konnte nicht gelöscht werden: ${error.message}`,
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
    console.log('🔄 Fetching appointments...');
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (name, contact, phone, email),
          team_members (name)
        `)
        .order('date', { ascending: true });

      console.log('✅ Appointments fetch result:', { data, error });

      if (error) {
        console.error('❌ Appointments fetch error:', error);
        throw error;
      }
      
      console.log('📊 Appointments loaded:', data?.length || 0);
      setAppointments(data || []);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const addAppointment = async (appointmentData: any) => {
    console.log('🔄 Adding appointment:', appointmentData);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          customers (name, contact, phone, email),
          team_members (name)
        `)
        .single();

      console.log('✅ Appointment add result:', { data, error });

      if (error) {
        console.error('❌ Appointment add error:', error);
        throw error;
      }
      
      setAppointments(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Termin wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('❌ Error adding appointment:', error);
      toast({
        title: "Fehler",
        description: `Termin konnte nicht hinzugefügt werden: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateAppointment = async (id: string, updates: any) => {
    console.log('🔄 Updating appointment:', id, updates);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          customers (name, contact, phone, email),
          team_members (name)
        `)
        .single();

      console.log('✅ Appointment update result:', { data, error });

      if (error) {
        console.error('❌ Appointment update error:', error);
        throw error;
      }
      
      setAppointments(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id: string) => {
    console.log('🔄 Deleting appointment:', id);
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      console.log('✅ Appointment delete result:', { error });

      if (error) {
        console.error('❌ Appointment delete error:', error);
        throw error;
      }
      
      setAppointments(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Erfolg",
        description: "Termin wurde gelöscht.",
      });
    } catch (error) {
      console.error('❌ Error deleting appointment:', error);
      toast({
        title: "Fehler",
        description: `Termin konnte nicht gelöscht werden: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Get upcoming appointments from today onwards
  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(appointment => appointment.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return { 
    appointments, 
    loading, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment, 
    refetch: fetchAppointments,
    getUpcomingAppointments
  };
}
