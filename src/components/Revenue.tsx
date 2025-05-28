
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function Revenue() {
  const [newRevenue, setNewRevenue] = useState({ client: '', amount: '', date: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: '' });

  const handleAddRevenue = () => {
    if (newRevenue.client && newRevenue.amount) {
      toast({
        title: "Einnahme hinzugefügt",
        description: `${newRevenue.client}: €${newRevenue.amount}`,
      });
      setNewRevenue({ client: '', amount: '', date: '' });
    }
  };

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      toast({
        title: "Ausgabe hinzugefügt",
        description: `${newExpense.description}: €${newExpense.amount}`,
      });
      setNewExpense({ description: '', amount: '', date: '' });
    }
  };

  const revenueStats = [
    { period: "Heute", revenue: "€2.340", expenses: "€420", profit: "€1.920", tax: "€576" },
    { period: "Diese Woche", revenue: "€12.450", expenses: "€2.100", profit: "€10.350", tax: "€3.105" },
    { period: "Dieser Monat", revenue: "€47.500", expenses: "€8.200", profit: "€39.300", tax: "€11.790" },
    { period: "Dieses Jahr", revenue: "€485.000", expenses: "€92.000", profit: "€393.000", tax: "€117.900" },
    { period: "Allzeit", revenue: "€1.250.000", expenses: "€245.000", profit: "€1.005.000", tax: "€301.500" },
  ];

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
                  <Input
                    id="client"
                    placeholder="Kundenname"
                    value={newRevenue.client}
                    onChange={(e) => setNewRevenue({...newRevenue, client: e.target.value})}
                  />
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
