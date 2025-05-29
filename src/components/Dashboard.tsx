
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Euro, Users, Calendar, TrendingUp, Clock, CheckCircle, UserPlus, Phone, Mail } from "lucide-react";

export function Dashboard() {
  const { user, canAccessMainNavigation, canViewCustomers, canViewTeamMembers, canManageRevenues, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    totalAppointments: 0,
    totalTeamMembers: 0,
    activeTeamMembers: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    yearRevenue: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedYearPeriod, setSelectedYearPeriod] = useState('month');
  const [recentCustomers, setRecentCustomers] = useState([]);

  useEffect(() => {
    if (canAccessMainNavigation()) {
      fetchStats();
      if (canViewCustomers()) {
        fetchRecentCustomers();
      }
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const promises = [];

      if (canViewCustomers()) {
        promises.push(
          supabase.from('customers').select('*', { count: 'exact' }),
          supabase.from('customers').select('*', { count: 'exact' }).eq('is_active', true)
        );
      }

      if (canManageRevenues()) {
        promises.push(
          supabase.from('revenues').select('amount'),
          supabase.from('revenues').select('amount').gte('date', new Date().toISOString().split('T')[0]),
          supabase.from('revenues').select('amount').gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
          supabase.from('revenues').select('amount').gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
          supabase.from('revenues').select('amount').gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
        );
      }

      promises.push(
        supabase.from('appointments').select('*', { count: 'exact' }),
        supabase.from('appointments').select('*', { count: 'exact' }).eq('result', 'termin_ausstehend'),
        supabase.from('appointments').select('*', { count: 'exact' }).in('result', ['termin_abgeschlossen', 'termin_erschienen'])
      );

      if (canViewTeamMembers()) {
        promises.push(
          supabase.from('team_members').select('*', { count: 'exact' }),
          supabase.from('team_members').select('*', { count: 'exact' }).eq('is_active', true)
        );
      }

      const results = await Promise.all(promises);
      let resultIndex = 0;

      const newStats = { ...stats };

      if (canViewCustomers()) {
        newStats.totalCustomers = results[resultIndex++].count || 0;
        newStats.activeCustomers = results[resultIndex++].count || 0;
      }

      if (canManageRevenues()) {
        const allRevenues = results[resultIndex++].data || [];
        const todayRevenues = results[resultIndex++].data || [];
        const weekRevenues = results[resultIndex++].data || [];
        const monthRevenues = results[resultIndex++].data || [];
        const yearRevenues = results[resultIndex++].data || [];

        newStats.totalRevenue = allRevenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
        newStats.todayRevenue = todayRevenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
        newStats.weekRevenue = weekRevenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
        newStats.monthRevenue = monthRevenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
        newStats.yearRevenue = yearRevenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
      }

      newStats.totalAppointments = results[resultIndex++].count || 0;
      newStats.pendingAppointments = results[resultIndex++].count || 0;
      newStats.completedAppointments = results[resultIndex++].count || 0;

      if (canViewTeamMembers()) {
        newStats.totalTeamMembers = results[resultIndex++].count || 0;
        newStats.activeTeamMembers = results[resultIndex++].count || 0;
      }

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentCustomers(data || []);
    } catch (error) {
      console.error('Error fetching recent customers:', error);
    }
  };

  if (!canAccessMainNavigation()) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900 text-left">Dashboard</h1>
        <p className="text-gray-600 text-left">Willkommen zurück, {user?.name}</p>
      </div>

      {/* Overview Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-left">Übersicht</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {canViewCustomers() && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-left">Kunden</CardTitle>
                <Users className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent className="text-left">
                <div className="text-2xl font-bold">{stats.activeCustomers}</div>
                <p className="text-xs text-gray-600 text-left">
                  {stats.totalCustomers} gesamt
                </p>
              </CardContent>
            </Card>
          )}

          {canManageRevenues() && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-left">Gesamtumsatz</CardTitle>
                <Euro className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent className="text-left">
                <div className="text-2xl font-bold">€{Math.round(stats.totalRevenue)}</div>
                <p className="text-xs text-gray-600 text-left">
                  Alle Einnahmen
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-left">Termine</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent className="text-left">
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-gray-600 text-left">
                {stats.pendingAppointments} ausstehend
              </p>
            </CardContent>
          </Card>

          {canViewTeamMembers() && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-left">Team</CardTitle>
                <UserPlus className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent className="text-left">
                <div className="text-2xl font-bold">{stats.activeTeamMembers}</div>
                <p className="text-xs text-gray-600 text-left">
                  {stats.totalTeamMembers} gesamt
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Revenue Section - Day/Week */}
      {canManageRevenues() && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 text-left">Umsatz Tag/Woche</h2>
            <div className="flex gap-2">
              <Button 
                variant={selectedPeriod === 'today' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('today')}
                className={selectedPeriod === 'today' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Tagesumsatz
              </Button>
              <Button 
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('week')}
                className={selectedPeriod === 'week' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Wochenumsatz
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPeriod === 'today' ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-left">Heute</CardTitle>
                  <Euro className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="text-left">
                  <div className="text-2xl font-bold">€{Math.round(stats.todayRevenue)}</div>
                  <p className="text-xs text-gray-600 text-left">Tagesumsatz</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-left">Diese Woche</CardTitle>
                  <Euro className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="text-left">
                  <div className="text-2xl font-bold">€{Math.round(stats.weekRevenue)}</div>
                  <p className="text-xs text-gray-600 text-left">Wochenumsatz</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Revenue Section - Month/Year */}
      {canManageRevenues() && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 text-left">Umsatz Monat/Jahr</h2>
            <div className="flex gap-2">
              <Button 
                variant={selectedYearPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => setSelectedYearPeriod('month')}
                className={selectedYearPeriod === 'month' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Monat
              </Button>
              <Button 
                variant={selectedYearPeriod === 'year' ? 'default' : 'outline'}
                onClick={() => setSelectedYearPeriod('year')}
                className={selectedYearPeriod === 'year' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Jahr
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedYearPeriod === 'month' ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-left">Monat</CardTitle>
                  <Euro className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent className="text-left">
                  <div className="text-2xl font-bold">€{Math.round(stats.monthRevenue)}</div>
                  <p className="text-xs text-gray-600 text-left">Monatsumsatz</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-left">Jahr</CardTitle>
                  <Euro className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent className="text-left">
                  <div className="text-2xl font-bold">€{Math.round(stats.yearRevenue)}</div>
                  <p className="text-xs text-gray-600 text-left">Jahresumsatz</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Customers Section */}
      {canViewCustomers() && recentCustomers.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-left">Aktuelle Kunden</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentCustomers.map((customer: any) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="text-left">
                      <h4 className="font-medium text-left">{customer.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {customer.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={customer.priority === 'Hoch' ? 'destructive' : customer.priority === 'Mittel' ? 'default' : 'secondary'}>
                        {customer.priority}
                      </Badge>
                      <Badge variant={customer.payment_status === 'Bezahlt' ? 'default' : customer.payment_status === 'Ausstehend' ? 'secondary' : 'destructive'}>
                        {customer.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
