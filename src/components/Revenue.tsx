
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Calculator, ChevronDown, ChevronUp, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function Revenue() {
  const [newRevenue, setNewRevenue] = useState({ client: '', amount: '', date: '', reference: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: '', reference: '' });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAllRevenues, setShowAllRevenues] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [currentRevenuePage, setCurrentRevenuePage] = useState(1);
  const [currentExpensePage, setCurrentExpensePage] = useState(1);
  
  const [revenues, setRevenues] = useState([
    { id: 1, client: 'ABC GmbH', amount: 2500, date: '2025-01-15', reference: 'Webdesign Projekt Q1' },
    { id: 2, client: 'XYZ Corp', amount: 1800, date: '2025-01-12', reference: 'SEO Beratung' },
  ]);
  
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Marketing', amount: 500, date: '2025-01-14', reference: 'Google Ads Kampagne' },
    { id: 2, description: 'Büroausstattung', amount: 300, date: '2025-01-10', reference: 'Neue Laptops' },
  ]);

  // Mock Mitarbeiterkosten (würde normalerweise aus TeamMembers kommen)
  const [teamMemberCosts] = useState([
    { id: 1, name: 'Max Mustermann', earnings: 4500, date: '2025-01-15' },
    { id: 2, name: 'Lisa Schmidt', earnings: 3200, date: '2025-01-15' },
  ]);

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
        date: newRevenue.date || new Date().toISOString().slice(0, 10),
        reference: newRevenue.reference || 'Keine Referenz'
      };
      setRevenues(prev => [...prev, revenue]);
      toast({
        title: "Einnahme hinzugefügt",
        description: `${newRevenue.client}: €${newRevenue.amount}`,
      });
      setNewRevenue({ client: '', amount: '', date: '', reference: '' });
    }
  };

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expense = {
        id: Date.now(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date || new Date().toISOString().slice(0, 10),
        reference: newExpense.reference || 'Keine Referenz'
      };
      setExpenses(prev => [...prev, expense]);
      toast({
        title: "Ausgabe hinzugefügt",
        description: `${newExpense.description}: €${newExpense.amount}`,
      });
      setNewExpense({ description: '', amount: '', date: '', reference: '' });
    }
  };

  // Filter für ausgewählten Monat
  const filterByMonth = (items: any[]) => {
    return items.filter(item => item.date.startsWith(selectedMonth));
  };

  const filteredRevenues = filterByMonth(revenues);
  const filteredExpenses = filterByMonth(expenses);
  const filteredTeamCosts = filterByMonth(teamMemberCosts);

  // Berechnungen für den ausgewählten Monat
  const monthRevenue = filteredRevenues.reduce((sum, r) => sum + r.amount, 0);
  const monthExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthTeamCosts = filteredTeamCosts.reduce((sum, t) => sum + t.earnings, 0);
  const monthProfit = monthRevenue - monthExpenses - monthTeamCosts;
  const monthTax = monthProfit * 0.3;

  // Pagination für Order Book
  const ITEMS_PER_PAGE = 20;
  const paginateItems = (items: any[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getMonthName = (monthString: string) => {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Einnahmen & Ausgaben</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Finanzen und Gewinnmargen.</p>
        </div>
        
        {/* Monatsfilter */}
        <Card className="w-64">
          <CardContent className="pt-4">
            <Label htmlFor="month-filter">Monat auswählen</Label>
            <Input
              id="month-filter"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Übersicht für ausgewählten Monat */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Übersicht für {getMonthName(selectedMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">Einnahmen</span>
            </div>
            <span className="text-2xl font-bold text-green-600">€{monthRevenue.toFixed(0)}</span>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm text-gray-600">Ausgaben</span>
            </div>
            <span className="text-2xl font-bold text-red-600">€{monthExpenses.toFixed(0)}</span>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm text-gray-600">Mitarbeiterkosten</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">€{monthTeamCosts.toFixed(0)}</span>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Calculator className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Gewinn</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">€{monthProfit.toFixed(0)}</span>
            <div className="text-xs text-gray-500 mt-1">
              Steuerrücklage: €{monthTax.toFixed(0)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="order-book">Order Book</TabsTrigger>
          <TabsTrigger value="add-revenue">Einnahme hinzufügen</TabsTrigger>
          <TabsTrigger value="add-expense">Ausgabe hinzufügen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Letzte Einnahmen ({getMonthName(selectedMonth)})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredRevenues.slice(-5).map(revenue => (
                    <div key={revenue.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{revenue.client}</div>
                        <div className="text-xs text-gray-600">{new Date(revenue.date).toLocaleDateString('de-DE')}</div>
                        <div className="text-xs text-blue-600">{revenue.reference}</div>
                      </div>
                      <span className="font-bold text-green-600">€{revenue.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Letzte Ausgaben ({getMonthName(selectedMonth)})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredExpenses.slice(-5).map(expense => (
                    <div key={expense.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{expense.description}</div>
                        <div className="text-xs text-gray-600">{new Date(expense.date).toLocaleDateString('de-DE')}</div>
                        <div className="text-xs text-blue-600">{expense.reference}</div>
                      </div>
                      <span className="font-bold text-red-600">€{expense.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="order-book" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Einnahmen Order Book */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Einnahmen Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredRevenues.slice(-5).map(revenue => (
                    <div key={revenue.id} className="p-3 bg-green-50 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{revenue.client}</div>
                          <div className="text-xs text-gray-600">{new Date(revenue.date).toLocaleDateString('de-DE')}</div>
                          <div className="text-xs text-blue-600">{revenue.reference}</div>
                        </div>
                        <span className="font-bold text-green-600">€{revenue.amount}</span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredRevenues.length > 5 && (
                    <Collapsible open={showAllRevenues} onOpenChange={setShowAllRevenues}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full">
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
                              <div>
                                <div className="font-medium text-sm">{revenue.client}</div>
                                <div className="text-xs text-gray-600">{new Date(revenue.date).toLocaleDateString('de-DE')}</div>
                                <div className="text-xs text-blue-600">{revenue.reference}</div>
                              </div>
                              <span className="font-bold text-green-600">€{revenue.amount}</span>
                            </div>
                          </div>
                        ))}
                        
                        {Math.ceil((filteredRevenues.length - 5) / ITEMS_PER_PAGE) > 1 && (
                          <div className="flex justify-center space-x-2 mt-4">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Ausgaben Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredExpenses.slice(-5).map(expense => (
                    <div key={expense.id} className="p-3 bg-red-50 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{expense.description}</div>
                          <div className="text-xs text-gray-600">{new Date(expense.date).toLocaleDateString('de-DE')}</div>
                          <div className="text-xs text-blue-600">{expense.reference}</div>
                        </div>
                        <span className="font-bold text-red-600">€{expense.amount}</span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredExpenses.length > 5 && (
                    <Collapsible open={showAllExpenses} onOpenChange={setShowAllExpenses}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full">
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
                              <div>
                                <div className="font-medium text-sm">{expense.description}</div>
                                <div className="text-xs text-gray-600">{new Date(expense.date).toLocaleDateString('de-DE')}</div>
                                <div className="text-xs text-blue-600">{expense.reference}</div>
                              </div>
                              <span className="font-bold text-red-600">€{expense.amount}</span>
                            </div>
                          </div>
                        ))}
                        
                        {Math.ceil((filteredExpenses.length - 5) / ITEMS_PER_PAGE) > 1 && (
                          <div className="flex justify-center space-x-2 mt-4">
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

        <TabsContent value="add-revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Neue Einnahme hinzufügen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div>
                  <Label htmlFor="reference">Referenz (max. 100 Zeichen)</Label>
                  <Input
                    id="reference"
                    placeholder="z.B. Webdesign Projekt Q1"
                    maxLength={100}
                    value={newRevenue.reference}
                    onChange={(e) => setNewRevenue({...newRevenue, reference: e.target.value})}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div>
                  <Label htmlFor="expense-reference">Referenz (max. 100 Zeichen)</Label>
                  <Input
                    id="expense-reference"
                    placeholder="z.B. Google Ads Kampagne"
                    maxLength={100}
                    value={newExpense.reference}
                    onChange={(e) => setNewExpense({...newExpense, reference: e.target.value})}
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
