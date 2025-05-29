
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Calendar, Target, Euro, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useCustomers, useRevenues, useTodos, useAppointments, useExpenses } from '@/hooks/useSupabaseData';

export function Dashboard() {
  const [showAllTodos, setShowAllTodos] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  
  const { customers, loading: customersLoading } = useCustomers();
  const { revenues, loading: revenuesLoading } = useRevenues();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { todos, loading: todosLoading } = useTodos();
  const { appointments, loading: appointmentsLoading } = useAppointments();

  // Debug logging
  useEffect(() => {
    console.log('🏠 Dashboard data status:', {
      customers: { length: customers.length, loading: customersLoading },
      revenues: { length: revenues.length, loading: revenuesLoading },
      expenses: { length: expenses.length, loading: expensesLoading },
      todos: { length: todos.length, loading: todosLoading },
      appointments: { length: appointments.length, loading: appointmentsLoading }
    });
  }, [customers, revenues, expenses, todos, appointments, customersLoading, revenuesLoading, expensesLoading, todosLoading, appointmentsLoading]);

  // Calculate statistics from real data
  const totalRevenue = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  // Updated to count customers with is_active = true
  const activeCustomers = customers.filter(c => c.is_active === true).length;

  console.log('📊 Dashboard calculations:', {
    totalRevenue,
    totalExpenses,
    activeCustomers,
    revenuesCount: revenues.length,
    expensesCount: expenses.length,
    customersCount: customers.length,
    activeCustomersFilter: customers.filter(c => c.is_active === true)
  });

  // Calculate 30-day revenue
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const revenue30Days = revenues
    .filter(r => new Date(r.date) >= thirtyDaysAgo)
    .reduce((sum, r) => sum + Number(r.amount), 0);

  // Today's revenue
  const today = new Date().toISOString().split('T')[0];
  const revenueToday = revenues
    .filter(r => r.date === today)
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const stats = [
    {
      title: "Umsatz 30 Tage",
      value: `€${revenue30Days.toLocaleString()}`,
      change: "+12%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Umsatz Heute",
      value: `€${revenueToday.toLocaleString()}`,
      change: "+8%",
      icon: Euro,
      color: "text-blue-600",
    },
    {
      title: "Gesamtumsatz",
      value: `€${totalRevenue.toLocaleString()}`,
      change: "+15%",
      icon: Target,
      color: "text-purple-600",
    },
    {
      title: "Aktive Kunden",
      value: activeCustomers.toString(),
      change: "+3",
      icon: Users,
      color: "text-orange-600",
    },
  ];

  // Filter appointments for today and upcoming
  const today_appointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const todayDate = new Date();
    return appointmentDate >= todayDate;
  }).slice(0, showAllAppointments ? undefined : 5);

  const displayedTodos = showAllTodos ? todos : todos.slice(0, 5);

  if (customersLoading || revenuesLoading || expensesLoading || todosLoading || appointmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Willkommen zurück! Hier ist Ihre Übersicht.</p>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-100 p-4 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <div className="grid grid-cols-5 gap-4">
          <div>Kunden: {customers.length}</div>
          <div>Aktive Kunden: {activeCustomers}</div>
          <div>Einnahmen: {revenues.length}</div>
          <div>Ausgaben: {expenses.length}</div>
          <div>Todos: {todos.length}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-green-600 font-medium">
                {stat.change} vs. letzter Monat
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming ToDos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Bevorstehende ToDos
              </div>
              {todos.length > 5 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAllTodos(!showAllTodos)}
                  className="flex items-center"
                >
                  {showAllTodos ? (
                    <>
                      Weniger anzeigen
                      <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Mehr anzeigen
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedTodos.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Keine Todos vorhanden</p>
              ) : (
                displayedTodos.map((todo) => (
                  <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{todo.title}</p>
                      <p className="text-sm text-gray-600">{todo.description}</p>
                      <p className="text-sm text-gray-500">
                        {todo.due_date ? new Date(todo.due_date).toLocaleDateString('de-DE') : 'Kein Datum'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      todo.priority === 'Hoch' ? 'bg-red-100 text-red-800' :
                      todo.priority === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {todo.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Anstehende Termine
              </div>
              {appointments.length > 5 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAllAppointments(!showAllAppointments)}
                  className="flex items-center"
                >
                  {showAllAppointments ? (
                    <>
                      Weniger anzeigen
                      <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Mehr anzeigen
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {today_appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Keine anstehenden Termine</p>
              ) : (
                today_appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.customers?.name || 'Unbekannt'}</p>
                      <p className="text-sm text-gray-600">{appointment.customers?.contact || 'Kein Kontakt'}</p>
                      <p className="text-xs text-gray-500">{new Date(appointment.date).toLocaleDateString('de-DE')}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {appointment.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
