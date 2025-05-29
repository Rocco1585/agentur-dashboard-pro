
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Euro, TrendingUp, TrendingDown, Calculator, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRevenues, useExpenses, useCustomers } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';

export function Revenue() {
  const { revenues, loading: revenuesLoading, addRevenue } = useRevenues();
  const { expenses, loading: expensesLoading, addExpense } = useExpenses();
  const { customers } = useCustomers();
  const { canManageRevenues } = useAuth();
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newRevenue, setNewRevenue] = useState({
    customer_id: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  });

  if (!canManageRevenues()) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung, Einnahmen und Ausgaben zu verwalten.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddRevenue = async () => {
    if (newRevenue.description && newRevenue.amount && newRevenue.date) {
      await addRevenue({
        ...newRevenue,
        amount: parseFloat(newRevenue.amount)
      });
      setNewRevenue({
        customer_id: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddRevenue(false);
    } else {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
    }
  };

  const handleAddExpense = async () => {
    if (newExpense.description && newExpense.amount && newExpense.date) {
      await addExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      });
      setNewExpense({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        reference: ''
      });
      setShowAddExpense(false);
    } else {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
    }
  };

  const totalRevenue = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  if (revenuesLoading || expensesLoading) {
    return (
      <div className="w-full p-6">
        <div className="text-lg">Lade Einnahmen und Ausgaben...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Einnahmen & Ausgaben</h1>
          <p className="text-gray-600">Übersicht über Ihre Finanzen</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => setShowAddRevenue(!showAddRevenue)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Einnahme hinzufügen
          </Button>
          <Button 
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ausgabe hinzufügen
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Gesamteinnahmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Gesamtausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-2xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Nettogewinn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calculator className="h-5 w-5 text-gray-600 mr-2" />
              <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{netProfit.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Transaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-2xl font-bold text-gray-700">{revenues.length + expenses.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Revenue Form */}
      {showAddRevenue && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left">Neue Einnahme hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select 
                value={newRevenue.customer_id} 
                onValueChange={(value) => setNewRevenue({...newRevenue, customer_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kunde auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Beschreibung *"
                value={newRevenue.description}
                onChange={(e) => setNewRevenue({...newRevenue, description: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Betrag (€) *"
                value={newRevenue.amount}
                onChange={(e) => setNewRevenue({...newRevenue, amount: e.target.value})}
              />
              <Input
                type="date"
                value={newRevenue.date}
                onChange={(e) => setNewRevenue({...newRevenue, date: e.target.value})}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button onClick={handleAddRevenue} className="flex-1 bg-green-600 hover:bg-green-700">
                Einnahme hinzufügen
              </Button>
              <Button variant="outline" onClick={() => setShowAddRevenue(false)} className="flex-1">
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Expense Form */}
      {showAddExpense && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left">Neue Ausgabe hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Beschreibung *"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Betrag (€) *"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              />
              <Input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
              />
              <Input
                placeholder="Referenz"
                value={newExpense.reference}
                onChange={(e) => setNewExpense({...newExpense, reference: e.target.value})}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button onClick={handleAddExpense} className="flex-1 bg-red-600 hover:bg-red-700">
                Ausgabe hinzufügen
              </Button>
              <Button variant="outline" onClick={() => setShowAddExpense(false)} className="flex-1">
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue and Expense Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Revenues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Letzte Einnahmen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {revenues.slice(0, 10).map(revenue => (
                <div key={revenue.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{revenue.description}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(revenue.date).toLocaleDateString('de-DE')}
                      {revenue.customers?.name && ` • ${revenue.customers.name}`}
                    </div>
                  </div>
                  <span className="font-bold text-green-600">€{Number(revenue.amount).toFixed(2)}</span>
                </div>
              ))}
              {revenues.length === 0 && (
                <p className="text-center text-gray-500 py-4">Noch keine Einnahmen vorhanden</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
              Letzte Ausgaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expenses.slice(0, 10).map(expense => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{expense.description}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(expense.date).toLocaleDateString('de-DE')}
                      {expense.reference && ` • Ref: ${expense.reference}`}
                    </div>
                  </div>
                  <span className="font-bold text-red-600">€{Number(expense.amount).toFixed(2)}</span>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-center text-gray-500 py-4">Noch keine Ausgaben vorhanden</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
