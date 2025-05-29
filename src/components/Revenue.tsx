import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Euro, TrendingUp, Plus, Trash2 } from "lucide-react";
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

export function Revenue() {
  const { canManageRevenues, logAuditEvent } = useAuth();
  const [revenues, setRevenues] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRevenue, setNewRevenue] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    customer_id: ''
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    averageRevenue: 0
  });

  useEffect(() => {
    fetchRevenues();
    fetchCustomers();
  }, []);

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
      calculateStats(data || []);
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

  const calculateStats = (revenueData) => {
    const total = revenueData.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const monthlyRevenue = revenueData
      .filter(revenue => new Date(revenue.date) >= oneMonthAgo)
      .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    
    const weeklyRevenue = revenueData
      .filter(revenue => new Date(revenue.date) >= oneWeekAgo)
      .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    
    const average = revenueData.length > 0 ? total / revenueData.length : 0;
    
    setStats({
      totalRevenue: total,
      monthlyRevenue,
      weeklyRevenue,
      averageRevenue: average
    });
  };

  const addRevenue = async () => {
    if (newRevenue.description && newRevenue.amount && newRevenue.date) {
      try {
        const revenueData = {
          description: newRevenue.description,
          amount: Math.round(parseFloat(newRevenue.amount)), // Auf ganze Euro runden
          date: newRevenue.date,
          customer_id: newRevenue.customer_id || null
        };

        const { data, error } = await supabase
          .from('revenues')
          .insert(revenueData)
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
        setShowForm(false);
        fetchRevenues();
      } catch (error) {
        console.error('Error adding revenue:', error);
        toast({
          title: "Fehler",
          description: "Einnahme konnte nicht hinzugefügt werden.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
      });
    }
  };

  const deleteRevenue = async (id) => {
    try {
      // Get the revenue data before deleting for audit log
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-lg text-left">Lade Einnahmen...</div>
        </div>
      </div>
    );
  }

  if (!canManageRevenues()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">Keine Berechtigung</h3>
              <p className="text-gray-600 text-left">Sie haben keine Berechtigung, Einnahmen zu verwalten.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Einnahmen</h1>
            <p className="text-gray-600">Verwalten Sie Ihre Einnahmen</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Einnahme
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-left">Gesamt-Einnahmen</CardTitle>
              <Euro className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-left">€{Math.round(stats.totalRevenue)}</div>
              <p className="text-xs text-gray-500 text-left">
                Alle Einnahmen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-left">Monatliche Einnahmen</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-left">€{Math.round(stats.monthlyRevenue)}</div>
              <p className="text-xs text-gray-500 text-left">
                Letzte 30 Tage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-left">Wöchentliche Einnahmen</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-left">€{Math.round(stats.weeklyRevenue)}</div>
              <p className="text-xs text-gray-500 text-left">
                Letzte 7 Tage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-left">Durchschnitt</CardTitle>
              <Euro className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-left">€{Math.round(stats.averageRevenue)}</div>
              <p className="text-xs text-gray-500 text-left">
                Pro Einnahme
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Revenue Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-left">Neue Einnahme hinzufügen</CardTitle>
            </CardHeader>
            <CardContent>
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
                  onValueChange={(value) => setNewRevenue({...newRevenue, customer_id: value})}
                >
                  <SelectTrigger className="text-left">
                    <SelectValue placeholder="Kunde (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein Kunde</SelectItem>
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
                  onClick={() => setShowForm(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenues List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-left">Einnahmen ({revenues.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenues.map((revenue) => (
                <div key={revenue.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{revenue.description}</h3>
                    <p className="text-sm text-gray-600">{format(new Date(revenue.date), 'dd.MM.yyyy', { locale: de })}</p>
                    {revenue.customers && (
                      <p className="text-sm text-blue-600">Kunde: {revenue.customers.name}</p>
                    )}
                  </div>
                  <div className="text-right">
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
                    onClick={() => setShowForm(true)}
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
    </div>
  );
}
