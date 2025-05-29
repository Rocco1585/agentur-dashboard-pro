
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Euro, TrendingUp, TrendingDown, Users, Calendar, Target, DollarSign, BarChart3 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useTaxSettings } from '@/hooks/useTaxSettings';

export function Dashboard() {
  const { taxRate } = useTaxSettings();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalCustomers: 0,
    totalTeamMembers: 0,
    totalAppointments: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    lastMonthRevenue: 0,
    todayAppointments: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 7);
      
      // Eine Woche zurück
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weekAgoString = oneWeekAgo.toISOString().split('T')[0];

      // Gesamteinnahmen
      const { data: revenues } = await supabase
        .from('revenues')
        .select('amount, date');

      // Gesamtausgaben
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, date');

      // Kunden
      const { data: customers } = await supabase
        .from('customers')
        .select('id');

      // Teammitglieder
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('id');

      // Termine
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, date, result');

      const totalRevenue = revenues?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      
      // Tageseinnahmen
      const todayRevenue = revenues?.filter(r => r.date === today)
        .reduce((sum, r) => sum + Number(r.amount), 0) || 0;

      // Wocheneinnahmen
      const weekRevenue = revenues?.filter(r => r.date >= weekAgoString)
        .reduce((sum, r) => sum + Number(r.amount), 0) || 0;

      // Monatseinnahmen
      const monthRevenue = revenues?.filter(r => r.date.startsWith(thisMonth))
        .reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      
      // Letzter Monat
      const lastMonthRevenue = revenues?.filter(r => r.date.startsWith(lastMonth))
        .reduce((sum, r) => sum + Number(r.amount), 0) || 0;

      // Termine heute
      const todayAppointments = appointments?.filter(a => a.date === today).length || 0;

      // Ausstehende Termine
      const pendingAppointments = appointments?.filter(a => a.result === 'termin_ausstehend').length || 0;

      setStats({
        totalRevenue,
        totalExpenses,
        totalCustomers: customers?.length || 0,
        totalTeamMembers: teamMembers?.length || 0,
        totalAppointments: appointments?.length || 0,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        lastMonthRevenue,
        todayAppointments,
        pendingAppointments
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = calculatePercentageChange(stats.monthRevenue, stats.lastMonthRevenue);
  const currentDisplayRevenue = viewMode === 'day' ? stats.todayRevenue : stats.weekRevenue;
  const taxReserve = stats.monthRevenue * (taxRate / 100);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-lg text-left">Dashboard wird geladen...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 text-left">Dashboard</h1>
        <p className="text-gray-600 text-left">Übersicht über Ihr Unternehmen</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 text-left">Umsatz (30 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-left">
              <div className="text-left">
                <div className="text-2xl font-bold text-green-600">€{stats.monthRevenue.toFixed(2)}</div>
                <div className={`text-xs flex items-center ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(revenueChange).toFixed(1)}% vs. letzter Monat
                </div>
              </div>
              <Euro className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 text-left flex items-center justify-between">
              {viewMode === 'day' ? 'Tagesumsatz' : 'Wochenumsatz'}
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                  className="text-xs h-6 px-2"
                >
                  Tag
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="text-xs h-6 px-2"
                >
                  Woche
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-left">
              <div className="text-left">
                <div className="text-2xl font-bold text-blue-600">€{currentDisplayRevenue.toFixed(2)}</div>
                <div className="text-xs text-gray-600">
                  {viewMode === 'day' ? 'Heute' : 'Letzte 7 Tage'}
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 text-left">Steuerrücklage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-left">
              <div className="text-left">
                <div className="text-2xl font-bold text-orange-600">€{taxReserve.toFixed(2)}</div>
                <div className="text-xs text-gray-600">{taxRate}% vom Monatsumsatz</div>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 text-left">Ausstehende Termine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-left">
              <div className="text-left">
                <div className="text-2xl font-bold text-red-600">{stats.pendingAppointments}</div>
                <div className="text-xs text-gray-600">Benötigen Aufmerksamkeit</div>
              </div>
              <Target className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left flex items-center">
              <Users className="h-5 w-5 mr-2 text-red-600" />
              Team & Kunden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <div className="flex justify-between items-center text-left">
              <span className="text-gray-600 text-left">Teammitglieder:</span>
              <Badge variant="outline">{stats.totalTeamMembers}</Badge>
            </div>
            <div className="flex justify-between items-center text-left">
              <span className="text-gray-600 text-left">Kunden:</span>
              <Badge variant="outline">{stats.totalCustomers}</Badge>
            </div>
            <div className="flex justify-between items-center text-left">
              <span className="text-gray-600 text-left">Termine heute:</span>
              <Badge className="bg-blue-100 text-blue-800">{stats.todayAppointments}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left flex items-center">
              <Euro className="h-5 w-5 mr-2 text-red-600" />
              Finanzen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <div className="flex justify-between items-center text-left">
              <span className="text-gray-600 text-left">Gesamteinnahmen:</span>
              <span className="font-bold text-green-600">€{stats.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-left">
              <span className="text-gray-600 text-left">Gesamtausgaben:</span>
              <span className="font-bold text-red-600">€{stats.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-left">
              <span className="text-gray-600 text-left">Netto:</span>
              <span className={`font-bold ${(stats.totalRevenue - stats.totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{(stats.totalRevenue - stats.totalExpenses).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-red-600" />
              Termine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <div className="flex justify-between items-center text-left">
              <span className="text-gray-600 text-left">Gesamt:</span>
              <Badge variant="outline">{stats.totalAppointments}</Badge>
            </div>
            <div className="flex justify-between items-center text-left">
              <span className="text-gray-600 text-left">Heute:</span>
              <Badge className="bg-blue-100 text-blue-800">{stats.todayAppointments}</Badge>
            </div>
            <div className="flex justify-between items-center text-left">
              <span className="text-gray-600 text-left">Ausstehend:</span>
              <Badge className="bg-yellow-100 text-yellow-800">{stats.pendingAppointments}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
