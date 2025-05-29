import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Calculator, ChevronDown, ChevronUp, Users, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useRevenues, useExpenses, useTeamMembers, useCustomers } from '@/hooks/useSupabaseData';

export function Revenue() {
  const [newRevenue, setNewRevenue] = useState({ customer_id: '', amount: '', date: new Date().toISOString().slice(0, 10), description: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), reference: '' });
  
  // Zeitraumfilter
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().slice(0, 10));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [showAllRevenues, setShowAllRevenues] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [currentRevenuePage, setCurrentRevenuePage] = useState(1);
  const [currentExpensePage, setCurrentExpensePage] = useState(1);

  // Datenbankabfragen
  const { revenues, loading: revenuesLoading, addRevenue } = useRevenues();
  const { expenses, loading: expensesLoading, addExpense } = useExpenses();
  const { teamMembers, loading: teamLoading } = useTeamMembers();
  const { customers, loading: customersLoading } = useCustomers();

  const handleAddRevenue = async () => {
    if (newRevenue.customer_id && newRevenue.amount && newRevenue.description) {
      await addRevenue({
        customer_id: newRevenue.customer_id,
        amount: parseFloat(newRevenue.amount),
        date: newRevenue.date || new Date().toISOString().slice(0, 10),
        description: newRevenue.description
      });
      setNewRevenue({ customer_id: '', amount: '', date: new Date().toISOString().slice(0, 10), description: '' });
    } else {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
    }
  };

  const handleAddExpense = async () => {
    if (newExpense.description && newExpense.amount) {
      await addExpense({
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date || new Date().toISOString().slice(0, 10),
        reference: newExpense.reference || null
      });
      setNewExpense({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), reference: '' });
    } else {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
    }
  };

  // Filterfunktionen basierend auf Zeitraum
  const filterByTimeRange = (items: any[]) => {
    switch (timeRange) {
      case 'week':
        const weekStart = new Date(selectedWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return items.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= weekStart && itemDate <= weekEnd;
        });
      
      case 'month':
        return items.filter(item => item.date.startsWith(selectedMonth));
      
      case 'year':
        return items.filter(item => item.date.startsWith(selectedYear));
      
      case 'custom':
        if (!customStartDate || !customEndDate) return items;
        return items.filter(item => {
          const itemDate = item.date;
          return itemDate >= customStartDate && itemDate <= customEndDate;
        });
      
      case 'all':
      default:
        return items;
    }
  };

  const filteredRevenues = filterByTimeRange(revenues);
  const filteredExpenses = filterByTimeRange(expenses);
  const filteredTeamCosts = filterByTimeRange(teamMembers.map(tm => ({
    ...tm,
    date: tm.active_since || new Date().toISOString().slice(0, 10),
    earnings: tm.payouts || 0
  })));

  // Berechnungen für den ausgewählten Zeitraum
  const monthRevenue = filteredRevenues.reduce((sum, r) => sum + Number(r.amount), 0);
  const monthExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const monthTeamCosts = filteredTeamCosts.reduce((sum, t) => sum + Number(t.earnings), 0);
  const monthProfit = monthRevenue - monthExpenses - monthTeamCosts;
  const monthTax = monthProfit * 0.3;

  // Excel Export Funktion
  const exportToExcel = () => {
    const data = [
      ['Typ', 'Beschreibung/Kunde', 'Betrag', 'Datum', 'Referenz'],
      ...filteredRevenues.map(r => ['Einnahme', r.customers?.name || 'Unbekannt', r.amount, r.date, r.description]),
      ...filteredExpenses.map(e => ['Ausgabe', e.description, -e.amount, e.date, e.reference || '']),
      ...filteredTeamCosts.map(t => ['Mitarbeiterkosten', t.name, -t.earnings, t.date, 'Mitarbeiterzahlung'])
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finanzen_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    toast({
      title: "Export erfolgreich",
      description: "Finanzdaten wurden als CSV exportiert",
    });
  };

  // Pagination für Order Book
  const ITEMS_PER_PAGE = 20;
  const paginateItems = (items: any[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTimeRangeName = () => {
    switch (timeRange) {
      case 'week':
        return `Woche vom ${new Date(selectedWeek).toLocaleDateString('de-DE')}`;
      case 'month':
        const date = new Date(selectedMonth + '-01');
        return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
      case 'year':
        return `Jahr ${selectedYear}`;
      case 'custom':
        return `${customStartDate} - ${customEndDate}`;
      case 'all':
        return 'Gesamter Zeitraum';
      default:
        return 'Unbekannt';
    }
  };

  if (revenuesLoading || expensesLoading || teamLoading || customersLoading) {
    return (
      <div className="w-full h-64 flex items-start justify-start">
        <div className="text-lg">Lade Finanzdaten...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="w-full flex flex-col lg:flex-row justify-start items-start space-y-4 lg:space-y-0 lg:space-x-6">
        <div className="w-full lg:flex-1">
          <h1 className="text-3xl font-bold text-gray-900 text-left">Einnahmen & Ausgaben</h1>
          <p className="text-gray-600 text-left">Verwalten Sie Ihre Finanzen und Gewinnmargen.</p>
        </div>
        
        {/* Zeitraumfilter */}
        <div className="w-full lg:w-auto flex flex-col lg:flex-row gap-4">
          <Card className="w-full lg:w-64">
            <CardContent className="pt-4">
              <Label className="text-left block">Zeitraum auswählen</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Woche</SelectItem>
                  <SelectItem value="month">Monat</SelectItem>
                  <SelectItem value="year">Jahr</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  <SelectItem value="all">Gesamter Zeitraum</SelectItem>
                </SelectContent>
              </Select>
              
              {timeRange === 'week' && (
                <Input
                  type="date"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="mt-2"
                />
              )}
              
              {timeRange === 'month' && (
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="mt-2"
                />
              )}
              
              {timeRange === 'year' && (
                <Input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  min="2020"
                  max="2030"
                  className="mt-2"
                />
              )}
              
              {timeRange === 'custom' && (
                <div className="space-y-2 mt-2">
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    placeholder="Von"
                  />
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    placeholder="Bis"
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Button onClick={exportToExcel} variant="outline" className="w-full lg:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Excel Export
          </Button>
        </div>
      </div>

      {/* Übersicht für ausgewählten Zeitraum */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 text-left">
            Übersicht für {getTimeRangeName()}
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full flex flex-col xl:flex-row gap-4">
          <div className="flex-1 bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-start">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">Einnahmen</span>
            </div>
            <span className="text-2xl font-bold text-green-600 block text-left">€{monthRevenue.toFixed(0)}</span>
          </div>
          
          <div className="flex-1 bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-start">
              <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm text-gray-600">Ausgaben</span>
            </div>
            <span className="text-2xl font-bold text-red-600 block text-left">€{monthExpenses.toFixed(0)}</span>
          </div>

          <div className="flex-1 bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-start">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm text-gray-600">Mitarbeiterkosten</span>
            </div>
            <span className="text-2xl font-bold text-purple-600 block text-left">€{monthTeamCosts.toFixed(0)}</span>
          </div>

          <div className="flex-1 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-start">
              <Calculator className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Gewinn</span>
            </div>
            <span className="text-2xl font-bold text-blue-600 block text-left">€{monthProfit.toFixed(0)}</span>
            <div className="text-xs text-gray-500 mt-1 text-left">
              Steuerrücklage: €{monthTax.toFixed(0)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="w-full flex justify-start">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="order-book">Order Book</TabsTrigger>
          <TabsTrigger value="add-revenue">Einnahme hinzufügen</TabsTrigger>
          <TabsTrigger value="add-expense">Ausgabe hinzufügen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="w-full space-y-6">
          <div className="w-full flex flex-col xl:flex-row gap-6">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-green-600 text-left">Letzte Einnahmen ({getTimeRangeName()})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredRevenues.slice(-5).map(revenue => (
                    <div key={revenue.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="text-left">
                        <div className="font-medium text-sm text-left">{revenue.customers?.name || 'Unbekannter Kunde'}</div>
                        <div className="text-xs text-gray-600 text-left">{new Date(revenue.date).toLocaleDateString('de-DE')}</div>
                        <div className="text-xs text-blue-600 text-left">{revenue.description}</div>
                      </div>
                      <span className="font-bold text-green-600">€{Number(revenue.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-red-600 text-left">Letzte Ausgaben ({getTimeRangeName()})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredExpenses.slice(-5).map(expense => (
                    <div key={expense.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="text-left">
                        <div className="font-medium text-sm text-left">{expense.description}</div>
                        <div className="text-xs text-gray-600 text-left">{new Date(expense.date).toLocaleDateString('de-DE')}</div>
                        <div className="text-xs text-blue-600 text-left">{expense.reference || 'Keine Referenz'}</div>
                      </div>
                      <span className="font-bold text-red-600">€{Number(expense.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="order-book" className="w-full space-y-6">
          <div className="w-full flex flex-col xl:flex-row gap-6">
            {/* Einnahmen Order Book */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-green-600 text-left">Einnahmen Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredRevenues.slice(-5).map(revenue => (
                    <div key={revenue.id} className="p-3 bg-green-50 rounded">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-medium text-sm text-left">{revenue.customers?.name || 'Unbekannt'}</div>
                          <div className="text-xs text-gray-600 text-left">{new Date(revenue.date).toLocaleDateString('de-DE')}</div>
                          <div className="text-xs text-blue-600 text-left">{revenue.description}</div>
                        </div>
                        <span className="font-bold text-green-600">€{revenue.amount}</span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredRevenues.length > 5 && (
                    <Collapsible open={showAllRevenues} onOpenChange={setShowAllRevenues}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full text-left justify-start">
                          {showAllRevenues ? (
                            <>Weniger anzeigen <ChevronUp className="h-4 w-4 ml-2" /></>
                          ) : (
                            <>Mehr anzeigen ({filteredRevenues.length - 5} weitere) <ChevronDown className="h-4 w-4 ml-2" /></>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {paginateItems(filteredRevenues.slice(0, -5).reverse(), currentRevenuePage).map(revenue => (
                          <div key={revenue.id} className="p-3 bg-green-50 rounded">
                            <div className="flex justify-between items-center">
                              <div className="text-left">
                                <div className="font-medium text-sm text-left">{revenue.customers?.name || 'Unbekannt'}</div>
                                <div className="text-xs text-gray-600 text-left">{new Date(revenue.date).toLocaleDateString('de-DE')}</div>
                                <div className="text-xs text-blue-600 text-left">{revenue.description}</div>
                              </div>
                              <span className="font-bold text-green-600">€{revenue.amount}</span>
                            </div>
                          </div>
                        ))}
                        
                        {Math.ceil((filteredRevenues.length - 5) / ITEMS_PER_PAGE) > 1 && (
                          <div className="flex justify-start space-x-2 mt-4">
                            {Array.from({ length: Math.ceil((filteredRevenues.length - 5) / ITEMS_PER_PAGE) }, (_, i) => (
                              <Button
                                key={i + 1}
                                variant={currentRevenuePage === i + 1 ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentRevenuePage(i + 1)}
                              >
                                {i + 1}
                              </Button>
                            ))}
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ausgaben Order Book */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-red-600 text-left">Ausgaben Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredExpenses.slice(-5).map(expense => (
                    <div key={expense.id} className="p-3 bg-red-50 rounded">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-medium text-sm text-left">{expense.description}</div>
                          <div className="text-xs text-gray-600 text-left">{new Date(expense.date).toLocaleDateString('de-DE')}</div>
                          <div className="text-xs text-blue-600 text-left">{expense.reference}</div>
                        </div>
                        <span className="font-bold text-red-600">€{expense.amount}</span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredExpenses.length > 5 && (
                    <Collapsible open={showAllExpenses} onOpenChange={setShowAllExpenses}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full text-left justify-start">
                          {showAllExpenses ? (
                            <>Weniger anzeigen <ChevronUp className="h-4 w-4 ml-2" /></>
                          ) : (
                            <>Mehr anzeigen ({filteredExpenses.length - 5} weitere) <ChevronDown className="h-4 w-4 ml-2" /></>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {paginateItems(filteredExpenses.slice(0, -5).reverse(), currentExpensePage).map(expense => (
                          <div key={expense.id} className="p-3 bg-red-50 rounded">
                            <div className="flex justify-between items-center">
                              <div className="text-left">
                                <div className="font-medium text-sm text-left">{expense.description}</div>
                                <div className="text-xs text-gray-600 text-left">{new Date(expense.date).toLocaleDateString('de-DE')}</div>
                                <div className="text-xs text-blue-600 text-left">{expense.reference}</div>
                              </div>
                              <span className="font-bold text-red-600">€{expense.amount}</span>
                            </div>
                          </div>
                        ))}
                        
                        {Math.ceil((filteredExpenses.length - 5) / ITEMS_PER_PAGE) > 1 && (
                          <div className="flex justify-start space-x-2 mt-4">
                            {Array.from({ length: Math.ceil((filteredExpenses.length - 5) / ITEMS_PER_PAGE) }, (_, i) => (
                              <Button
                                key={i + 1}
                                variant={currentExpensePage === i + 1 ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentExpensePage(i + 1)}
                              >
                                {i + 1}
                              </Button>
                            ))}
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add-revenue" className="w-full space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center text-left">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Neue Einnahme hinzufügen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="customer" className="text-left block">Kunde</Label>
                  <Select value={newRevenue.customer_id} onValueChange={(value) => setNewRevenue({...newRevenue, customer_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kunde auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="amount" className="text-left block">Betrag (€)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="2500"
                    value={newRevenue.amount}
                    onChange={(e) => setNewRevenue({...newRevenue, amount: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="date" className="text-left block">Datum</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRevenue.date}
                    onChange={(e) => setNewRevenue({...newRevenue, date: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="description" className="text-left block">Beschreibung</Label>
                  <Input
                    id="description"
                    placeholder="z.B. Webdesign Projekt Q1"
                    value={newRevenue.description}
                    onChange={(e) => setNewRevenue({...newRevenue, description: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddRevenue} className="w-full lg:w-auto">
                Einnahme hinzufügen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-expense" className="w-full space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center text-left">
                <Plus className="h-5 w-5 mr-2 text-red-600" />
                Neue Ausgabe hinzufügen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="description" className="text-left block">Beschreibung</Label>
                  <Input
                    id="description"
                    placeholder="z.B. Marketing, Büroausstattung"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="expense-amount" className="text-left block">Betrag (€)</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="500"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="expense-date" className="text-left block">Datum</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="expense-reference" className="text-left block">Referenz</Label>
                  <Input
                    id="expense-reference"
                    placeholder="z.B. Google Ads Kampagne"
                    value={newExpense.reference}
                    onChange={(e) => setNewExpense({...newExpense, reference: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddExpense} className="w-full lg:w-auto">
                Ausgabe hinzufügen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
