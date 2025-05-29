
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Euro, TrendingUp, TrendingDown, Plus, Trash2, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTaxSettings } from '@/hooks/useTaxSettings';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function FinancialOverview() {
  const { canManageRevenues, logAuditEvent } = useAuth();
  const { taxRate } = useTaxSettings();
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newRevenue, setNewRevenue] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    customer_id: ''
  });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    weeklyRevenue: 0,
    weeklyExpenses: 0,
    averageRevenue: 0,
    averageExpense: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchRevenues(), fetchExpenses(), fetchCustomers()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenues = async () => {
    try {
      const { data, error } = await supabase
        .from('revenues')
        .select(`
          *,
          customers (
            id,
            name
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setRevenues(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching revenues:', error);
      toast({
        title: "Fehler",
        description: "Einnahmen konnten nicht geladen werden.",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Fehler",
        description: "Ausgaben konnten nicht geladen werden.",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    calculateStats();
  }, [revenues, expenses]);

  const calculateStats = () => {
    const totalRevenue = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const monthlyRevenue = revenues
      .filter(revenue => new Date(revenue.date) >= oneMonthAgo)
      .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    
    const monthlyExpenses = expenses
      .filter(expense => new Date(expense.date) >= oneMonthAgo)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const weeklyRevenue = revenues
      .filter(revenue => new Date(revenue.date) >= oneWeekAgo)
      .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    
    const weeklyExpenses = expenses
      .filter(expense => new Date(expense.date) >= oneWeekAgo)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const averageRevenue = revenues.length > 0 ? totalRevenue / revenues.length : 0;
    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    
    setStats({
      totalRevenue,
      totalExpenses,
      monthlyRevenue,
      monthlyExpenses,
      weeklyRevenue,
      weeklyExpenses,
      averageRevenue,
      averageExpense
    });
  };

  const addRevenue = async () => {
    if (!newRevenue.description.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Beschreibung ein.",
        variant: "destructive",
      });
      return;
    }

    if (!newRevenue.amount || isNaN(parseFloat(newRevenue.amount)) || parseFloat(newRevenue.amount) <= 0) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen gültigen Betrag ein.",
        variant: "destructive",
      });
      return;
    }

    if (!newRevenue.date) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Datum aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      const revenueData = {
        description: newRevenue.description.trim(),
        amount: parseFloat(newRevenue.amount),
        date: newRevenue.date,
        customer_id: newRevenue.customer_id || null
      };

      const { data, error } = await supabase
        .from('revenues')
        .insert([revenueData])
        .select()
        .single();

      if (error) throw error;

      await logAuditEvent('INSERT', 'revenues', data.id, null, revenueData);

      toast({
        title: "Einnahme hinzugefügt",
        description: "Die Einnahme wurde erfolgreich hinzugefügt.",
      });

      setNewRevenue({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        customer_id: ''
      });
      setShowRevenueForm(false);
      fetchRevenues();
    } catch (error) {
      console.error('Error adding revenue:', error);
      toast({
        title: "Fehler",
        description: "Einnahme konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  const addExpense = async () => {
    if (!newExpense.description.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Beschreibung ein.",
        variant: "destructive",
      });
      return;
    }

    if (!newExpense.amount || isNaN(parseFloat(newExpense.amount)) || parseFloat(newExpense.amount) <= 0) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen gültigen Betrag ein.",
        variant: "destructive",
      });
      return;
    }

    if (!newExpense.date) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Datum aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      const expenseData = {
        description: newExpense.description.trim(),
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        reference: newExpense.reference.trim() || null
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;

      await logAuditEvent('INSERT', 'expenses', data.id, null, expenseData);

      toast({
        title: "Ausgabe hinzugefügt",
        description: "Die Ausgabe wurde erfolgreich hinzugefügt.",
      });

      setNewExpense({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        reference: ''
      });
      setShowExpenseForm(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Fehler",
        description: "Ausgabe konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  const deleteRevenue = async (id) => {
    try {
      const { data: revenueToDelete } = await supabase
        .from('revenues')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('revenues')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logAuditEvent('DELETE', 'revenues', id, revenueToDelete, null);

      toast({
        title: "Einnahme gelöscht",
        description: "Die Einnahme wurde erfolgreich gelöscht.",
      });

      fetchRevenues();
    } catch (error) {
      console.error('Error deleting revenue:', error);
      toast({
        title: "Fehler",
        description: "Einnahme konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const deleteExpense = async (id) => {
    try {
      const { data: expenseToDelete } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logAuditEvent('DELETE', 'expenses', id, expenseToDelete, null);

      toast({
        title: "Ausgabe gelöscht",
        description: "Die Ausgabe wurde erfolgreich gelöscht.",
      });

      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Fehler",
        description: "Ausgabe konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const calculateTaxReserve = () => {
    const netProfit = stats.totalRevenue - stats.totalExpenses;
    return netProfit > 0 ? (netProfit * taxRate) / 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-lg text-left">Lade Finanzdaten...</div>
        </div>
      </div>
    );
  }

  if (!canManageRevenues()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">Keine Berechtigung</h3>
              <p className="text-gray-600 text-left">Sie haben keine Berechtigung, Finanzen zu verwalten.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2">
          <div className="text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Finanzübersicht</h1>
            <p className="text-gray-600">Verwalten Sie Ihre Einnahmen und Ausgaben</p>
          </div>
        </div>

        <Tabs defaultValue="revenues" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenues">Einnahmen</TabsTrigger>
            <TabsTrigger value="expenses">Ausgaben</TabsTrigger>
            <TabsTrigger value="tax-reserves">Steuerrücklagen</TabsTrigger>
          </TabsList>

          <TabsContent value="revenues" className="space-y-6">
            {/* Revenue Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                  <CardTitle className="text-sm font-medium text-left">Gesamt-Einnahmen</CardTitle>
                  <Euro className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-bold text-left">€{Math.round(stats.totalRevenue)}</div>
                  <p className="text-xs text-gray-500 text-left">Alle Einnahmen</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                  <CardTitle className="text-sm font-medium text-left">Monatliche Einnahmen</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-bold text-left">€{Math.round(stats.monthlyRevenue)}</div>
                  <p className="text-xs text-gray-500 text-left">Letzte 30 Tage</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                  <CardTitle className="text-sm font-medium text-left">Wöchentliche Einnahmen</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-bold text-left">€{Math.round(stats.weeklyRevenue)}</div>
                  <p className="text-xs text-gray-500 text-left">Letzte 7 Tage</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                  <CardTitle className="text-sm font-medium text-left">Durchschnitt</CardTitle>
                  <Euro className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-bold text-left">€{Math.round(stats.averageRevenue)}</div>
                  <p className="text-xs text-gray-500 text-left">Pro Einnahme</p>
                </CardContent>
              </Card>
            </div>

            {/* Add Revenue Button */}
            <div className="px-2">
              <Button 
                onClick={() => setShowRevenueForm(!showRevenueForm)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Neue Einnahme
              </Button>
            </div>

            {/* Add Revenue Form */}
            {showRevenueForm && (
              <div className="px-2">
                <Card className="bg-white shadow-lg">
                  <CardHeader className="p-6 sm:p-8">
                    <CardTitle className="text-left">Neue Einnahme hinzufügen</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Beschreibung"
                        value={newRevenue.description}
                        onChange={(e) => setNewRevenue({...newRevenue, description: e.target.value})}
                        className="text-left"
                      />
                      <Input
                        placeholder="Betrag (€)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newRevenue.amount}
                        onChange={(e) => setNewRevenue({...newRevenue, amount: e.target.value})}
                        className="text-left"
                      />
                      <Input
                        type="date"
                        value={newRevenue.date}
                        onChange={(e) => setNewRevenue({...newRevenue, date: e.target.value})}
                        className="text-left"
                      />
                      <Select
                        value={newRevenue.customer_id}
                        onValueChange={(value) => setNewRevenue({...newRevenue, customer_id: value === "none" ? "" : value})}
                      >
                        <SelectTrigger className="text-left">
                          <SelectValue placeholder="Kunde (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Kein Kunde</SelectItem>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={addRevenue}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Einnahme hinzufügen
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRevenueForm(false)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Revenues List */}
            <div className="px-2">
              <Card className="bg-white shadow-lg">
                <CardHeader className="p-6 sm:p-8">
                  <CardTitle className="text-left">Einnahmen ({revenues.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 pt-0">
                  <div className="space-y-4">
                    {revenues.map((revenue) => (
                      <div key={revenue.id} className="flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-lg">
                        <div className="text-left flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{revenue.description}</h3>
                          <p className="text-sm text-gray-600">{format(new Date(revenue.date), 'dd.MM.yyyy', { locale: de })}</p>
                          {revenue.customers && (
                            <p className="text-sm text-blue-600 truncate">Kunde: {revenue.customers.name}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <span className="text-lg font-bold text-green-600">€{Math.round(revenue.amount)}</span>
                          {canManageRevenues() && (
                            <div className="mt-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Einnahme löschen</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Sind Sie sicher, dass Sie diese Einnahme löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteRevenue(revenue.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Löschen
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {revenues.length === 0 && (
                      <div className="text-center py-8">
                        <Euro className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Einnahmen</h3>
                        <p className="text-gray-600 mb-4">Sie haben noch keine Einnahmen hinzugefügt.</p>
                        <Button 
                          onClick={() => setShowRevenueForm(true)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Erste Einnahme hinzufügen
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            {/* Expense Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                  <CardTitle className="text-sm font-medium text-left">Gesamt-Ausgaben</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-bold text-left">€{Math.round(stats.totalExpenses)}</div>
                  <p className="text-xs text-gray-500 text-left">Alle Ausgaben</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                  <CardTitle className="text-sm font-medium text-left">Monatliche Ausgaben</CardTitle>
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-bold text-left">€{Math.round(stats.monthlyExpenses)}</div>
                  <p className="text-xs text-gray-500 text-left">Letzte 30 Tage</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                  <CardTitle className="text-sm font-medium text-left">Wöchentliche Ausgaben</CardTitle>
                  <TrendingDown className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-bold text-left">€{Math.round(stats.weeklyExpenses)}</div>
                  <p className="text-xs text-gray-500 text-left">Letzte 7 Tage</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                  <CardTitle className="text-sm font-medium text-left">Durchschnitt</CardTitle>
                  <TrendingDown className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-bold text-left">€{Math.round(stats.averageExpense)}</div>
                  <p className="text-xs text-gray-500 text-left">Pro Ausgabe</p>
                </CardContent>
              </Card>
            </div>

            {/* Add Expense Button */}
            <div className="px-2">
              <Button 
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Neue Ausgabe
              </Button>
            </div>

            {/* Add Expense Form */}
            {showExpenseForm && (
              <div className="px-2">
                <Card className="bg-white shadow-lg">
                  <CardHeader className="p-6 sm:p-8">
                    <CardTitle className="text-left">Neue Ausgabe hinzufügen</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Beschreibung"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                        className="text-left"
                      />
                      <Input
                        placeholder="Betrag (€)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        className="text-left"
                      />
                      <Input
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                        className="text-left"
                      />
                      <Input
                        placeholder="Referenz (optional)"
                        value={newExpense.reference}
                        onChange={(e) => setNewExpense({...newExpense, reference: e.target.value})}
                        className="text-left"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={addExpense}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ausgabe hinzufügen
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowExpenseForm(false)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Expenses List */}
            <div className="px-2">
              <Card className="bg-white shadow-lg">
                <CardHeader className="p-6 sm:p-8">
                  <CardTitle className="text-left">Ausgaben ({expenses.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 pt-0">
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-lg">
                        <div className="text-left flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{expense.description}</h3>
                          <p className="text-sm text-gray-600">{format(new Date(expense.date), 'dd.MM.yyyy', { locale: de })}</p>
                          {expense.reference && (
                            <p className="text-sm text-gray-500 truncate">Ref: {expense.reference}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <span className="text-lg font-bold text-red-600">€{Math.round(expense.amount)}</span>
                          {canManageRevenues() && (
                            <div className="mt-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Ausgabe löschen</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Sind Sie sicher, dass Sie diese Ausgabe löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteExpense(expense.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Löschen
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {expenses.length === 0 && (
                      <div className="text-center py-8">
                        <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Ausgaben</h3>
                        <p className="text-gray-600 mb-4">Sie haben noch keine Ausgaben hinzugefügt.</p>
                        <Button 
                          onClick={() => setShowExpenseForm(true)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Erste Ausgabe hinzufügen
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tax-reserves" className="space-y-6">
            {/* Tax Reserve Calculation */}
            <div className="px-2">
              <Card className="bg-white shadow-lg">
                <CardHeader className="p-6 sm:p-8">
                  <CardTitle className="text-left flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-red-600" />
                    Steuerrücklagen-Berechnung
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-green-800 mb-2">Gesamte Einnahmen</h3>
                      <p className="text-2xl font-bold text-green-600">€{Math.round(stats.totalRevenue)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-red-800 mb-2">Gesamte Ausgaben</h3>
                      <p className="text-2xl font-bold text-red-600">€{Math.round(stats.totalExpenses)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">Nettogewinn</h3>
                      <p className="text-2xl font-bold text-blue-600">€{Math.round(stats.totalRevenue - stats.totalExpenses)}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-yellow-800 mb-2">Steuersatz</h3>
                      <p className="text-2xl font-bold text-yellow-600">{taxRate}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4 text-center">Empfohlene Steuerrücklage</h3>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-purple-600 mb-2">€{Math.round(calculateTaxReserve())}</p>
                      <p className="text-sm text-purple-700">
                        Berechnung: (€{Math.round(stats.totalRevenue)} - €{Math.round(stats.totalExpenses)}) × {taxRate}%
                      </p>
                    </div>
                    
                    {stats.totalRevenue - stats.totalExpenses <= 0 && (
                      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <strong>Hinweis:</strong> Da Ihre Ausgaben höher als oder gleich Ihren Einnahmen sind, 
                          ist keine Steuerrücklage erforderlich.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 text-sm text-gray-600">
                    <h4 className="font-medium mb-2">Berechnungsgrundlage:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Nettogewinn = Gesamte Einnahmen - Gesamte Ausgaben</li>
                      <li>Steuerrücklage = Nettogewinn × Steuersatz</li>
                      <li>Der Steuersatz kann in den Einstellungen angepasst werden</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
