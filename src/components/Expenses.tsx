
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

export function Expenses() {
  const { canManageRevenues, logAuditEvent } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  });
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    weeklyExpenses: 0,
    averageExpense: 0
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      setExpenses(data || []);
      calculateStats(data || []);
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

  const calculateStats = (expenseData) => {
    const total = expenseData.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const monthlyExpenses = expenseData
      .filter(expense => new Date(expense.date) >= oneMonthAgo)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const weeklyExpenses = expenseData
      .filter(expense => new Date(expense.date) >= oneWeekAgo)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const average = expenseData.length > 0 ? total / expenseData.length : 0;
    
    setStats({
      totalExpenses: total,
      monthlyExpenses,
      weeklyExpenses,
      averageExpense: average
    });
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
      setShowForm(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-lg text-left">Lade Ausgaben...</div>
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
              <p className="text-gray-600 text-left">Sie haben keine Berechtigung, Ausgaben zu verwalten.</p>
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Ausgaben</h1>
            <p className="text-gray-600">Verwalten Sie Ihre Ausgaben</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Ausgabe
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-sm font-medium text-left">Gesamt-Ausgaben</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-xl font-bold text-left">€{Math.round(stats.totalExpenses)}</div>
              <p className="text-xs text-gray-500 text-left">
                Alle Ausgaben
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-sm font-medium text-left">Monatliche Ausgaben</CardTitle>
              <TrendingDown className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-xl font-bold text-left">€{Math.round(stats.monthlyExpenses)}</div>
              <p className="text-xs text-gray-500 text-left">
                Letzte 30 Tage
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-sm font-medium text-left">Wöchentliche Ausgaben</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-xl font-bold text-left">€{Math.round(stats.weeklyExpenses)}</div>
              <p className="text-xs text-gray-500 text-left">
                Letzte 7 Tage
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-sm font-medium text-left">Durchschnitt</CardTitle>
              <TrendingDown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-xl font-bold text-left">€{Math.round(stats.averageExpense)}</div>
              <p className="text-xs text-gray-500 text-left">
                Pro Ausgabe
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Expense Form */}
        {showForm && (
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
                    onClick={() => setShowForm(false)}
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
                      onClick={() => setShowForm(true)}
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
      </div>
    </div>
  );
}
