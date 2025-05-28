import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function Revenue() {
  const [newRevenue, setNewRevenue] = useState({ client: '', amount: '', date: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: '' });
  const [revenues, setRevenues] = useState([
    { id: 1, client: 'ABC GmbH', amount: 2500, date: '15.01.2025' },
    { id: 2, client: 'XYZ Corp', amount: 1800, date: '12.01.2025' },
  ]);
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Marketing', amount: 500, date: '14.01.2025' },
    { id: 2, description: 'Büroausstattung', amount: 300, date: '10.01.2025' },
  ]);

  // Beispiel-Kunden für Dropdown
  const customers = [
    { id: 1, name: 'ABC GmbH' },
    { id: 2, name: 'XYZ Corp' },
    { id: 3, name: 'DEF AG' },
    { id: 4, name: 'GHI GmbH' },
    { id: 5, name: 'JKL Corp' },
  ];

  const handleAddRevenue = () => {
    if (newRevenue.client && newRevenue.amount) {
      const revenue = {
        id: Date.now(),
        client: newRevenue.client,
        amount: parseFloat(newRevenue.amount),
        date: newRevenue.date || new Date().toLocaleDateString('de-DE')
      };
      setRevenues(prev => [...prev, revenue]);
      toast({
        title: "Einnahme hinzugefügt",
        description: `${newRevenue.client}: €${newRevenue.amount}`,
      });
      setNewRevenue({ client: '', amount: '', date: '' });
    }
  };

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expense = {
        id: Date.now(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date || new Date().toLocaleDateString('de-DE')
      };
      setExpenses(prev => [...prev, expense]);
      toast({
        title: "Ausgabe hinzugefügt",
        description: `${newExpense.description}: €${newExpense.amount}`,
      });
      setNewExpense({ description: '', amount: '', date: '' });
    }
  };

  // Hilfsfunktionen für Datumberechnungen
  const isToday = (dateString: string) => {
    return dateString === new Date().toLocaleDateString('de-DE');
  };

  const isThisWeek = (dateString: string) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const [day, month, year] = dateString.split('.');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date >= startOfWeek && date <= endOfWeek;
  };

  const isThisMonth = (dateString: string) => {
    const today = new Date();
    const [day, month, year] = dateString.split('.');
    return parseInt(month) === today.getMonth() + 1 && parseInt(year) === today.getFullYear();
  };

  const isThisYear = (dateString: string) => {
    const today = new Date();
    const [day, month, year] = dateString.split('.');
    return parseInt(year) === today.getFullYear();
  };

  // Dynamische Berechnungen
  const calculateStats = () => {
    const todayRevenue = revenues.filter(r => isToday(r.date)).reduce((sum, r) => sum + r.amount, 0);
    const todayExpenses = expenses.filter(e => isToday(e.date)).reduce((sum, e) => sum + e.amount, 0);
    const todayProfit = todayRevenue - todayExpenses;
    const todayTax = todayProfit * 0.3;

    const weekRevenue = revenues.filter(r => isThisWeek(r.date)).reduce((sum, r) => sum + r.amount, 0);
    const weekExpenses = expenses.filter(e => isThisWeek(e.date)).reduce((sum, e) => sum + e.amount, 0);
    const weekProfit = weekRevenue - weekExpenses;
    const weekTax = weekProfit * 0.3;

    const monthRevenue = revenues.filter(r => isThisMonth(r.date)).reduce((sum, r) => sum + r.amount, 0);
    const monthExpenses = expenses.filter(e => isThisMonth(e.date)).reduce((sum, e) => sum + e.amount, 0);
    const monthProfit = monthRevenue - monthExpenses;
    const monthTax = monthProfit * 0.3;

    const yearRevenue = revenues.filter(r => isThisYear(r.date)).reduce((sum, r) => sum + r.amount, 0);
    const yearExpenses = expenses.filter(e => isThisYear(e.date)).reduce((sum, e) => sum + e.amount, 0);
    const yearProfit = yearRevenue - yearExpenses;
    const yearTax = yearProfit * 0.3;

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const totalTax = totalProfit * 0.3;

    return [
      { 
        period: "Heute", 
        revenue: `€${todayRevenue.toFixed(0)}`,
        expenses: `€${todayExpenses.toFixed(0)}`,
        profit: `€${todayProfit.toFixed(0)}`, 
        tax: `€${todayTax.toFixed(0)}` 
      },
      { 
        period: "Diese Woche", 
        revenue: `€${weekRevenue.toFixed(0)}`, 
        expenses: `€${weekExpenses.toFixed(0)}`, 
        profit: `€${weekProfit.toFixed(0)}`, 
        tax: `€${weekTax.toFixed(0)}` 
      },
      { 
        period: "Dieser Monat", 
        revenue: `€${monthRevenue.toFixed(0)}`, 
        expenses: `€${monthExpenses.toFixed(0)}`, 
        profit: `€${monthProfit.toFixed(0)}`, 
        tax: `€${monthTax.toFixed(0)}` 
      },
      { 
        period: "Dieses Jahr", 
        revenue: `€${yearRevenue.toFixed(0)}`, 
        expenses: `€${yearExpenses.toFixed(0)}`, 
        profit: `€${yearProfit.toFixed(0)}`, 
        tax: `€${yearTax.toFixed(0)}` 
      },
      { 
        period: "Allzeit", 
        revenue: `€${totalRevenue.toFixed(0)}`, 
        expenses: `€${totalExpenses.toFixed(0)}`, 
        profit: `€${totalProfit.toFixed(0)}`, 
        tax: `€${totalTax.toFixed(0)}` 
      },
    ];
  };

  const revenueStats = calculateStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Einnahmen & Ausgaben</h1>
        <p className="text-gray-600">Verwalten Sie Ihre Finanzen und Gewinnmargen.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="add-revenue">Einnahme hinzufügen</TabsTrigger>
          <TabsTrigger value="add-expense">Ausgabe hinzufügen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {revenueStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {stat.period}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-gray-600">Einnahmen</span>
                    </div>
                    <span className="font-semibold text-green-600">{stat.revenue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm text-gray-600">Ausgaben</span>
                    </div>
                    <span className="font-semibold text-red-600">{stat.expenses}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Gewinn</span>
                    </div>
                    <span className="font-bold text-blue-600">{stat.profit}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Steuerrücklage (30%)</span>
                    <span className="text-gray-700 font-medium">{stat.tax}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Letzte Einnahmen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {revenues.slice(-5).map(revenue => (
                    <div key={revenue.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{revenue.client}</div>
                        <div className="text-xs text-gray-600">{revenue.date}</div>
                      </div>
                      <span className="font-bold text-green-600">€{revenue.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Letzte Ausgaben</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expenses.slice(-5).map(expense => (
                    <div key={expense.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{expense.description}</div>
                        <div className="text-xs text-gray-600">{expense.date}</div>
                      </div>
                      <span className="font-bold text-red-600">€{expense.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add-revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Neue Einnahme hinzufügen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="client">Kunde</Label>
                  <Select value={newRevenue.client} onValueChange={(value) => setNewRevenue({...newRevenue, client: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kunde auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.name}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Betrag (€)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="2500"
                    value={newRevenue.amount}
                    onChange={(e) => setNewRevenue({...newRevenue, amount: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRevenue.date}
                    onChange={(e) => setNewRevenue({...newRevenue, date: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddRevenue} className="w-full md:w-auto">
                Einnahme hinzufügen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-expense" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-red-600" />
                Neue Ausgabe hinzufügen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Input
                    id="description"
                    placeholder="z.B. Marketing, Büroausstattung"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="expense-amount">Betrag (€)</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="500"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="expense-date">Datum</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddExpense} className="w-full md:w-auto">
                Ausgabe hinzufügen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
