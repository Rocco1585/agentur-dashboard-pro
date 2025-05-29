
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Calendar, Target, Euro, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

export function Dashboard() {
  const [showAllTodos, setShowAllTodos] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  // Mock Daten - sollten später aus echten Datenquellen kommen
  const mockRevenues = [
    { id: 1, client: 'ABC GmbH', amount: 2500, date: '2025-01-15' },
    { id: 2, client: 'XYZ Corp', amount: 1800, date: '2025-01-12' },
    { id: 3, client: 'DEF AG', amount: 3200, date: '2025-01-10' },
    { id: 4, client: 'GHI GmbH', amount: 1500, date: '2025-01-08' },
  ];

  const mockExpenses = [
    { id: 1, description: 'Marketing', amount: 500, date: '2025-01-14' },
    { id: 2, description: 'Büroausstattung', amount: 300, date: '2025-01-10' },
  ];

  const mockCustomers = [
    { id: 1, name: 'ABC GmbH', stage: 'bestandskunde' },
    { id: 2, name: 'XYZ Corp', stage: 'testphase aktiv' },
    { id: 3, name: 'DEF AG', stage: 'upsell bevorstehend' },
    { id: 4, name: 'GHI GmbH', stage: 'bestandskunde' },
    { id: 5, name: 'JKL Corp', stage: 'testphase aktiv' },
  ];

  // Berechnungen für 30 Tage
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const revenue30Days = mockRevenues
    .filter(r => new Date(r.date) >= thirtyDaysAgo)
    .reduce((sum, r) => sum + r.amount, 0);

  // Heutiger Umsatz
  const todayString = today.toISOString().slice(0, 10);
  const revenueToday = mockRevenues
    .filter(r => r.date === todayString)
    .reduce((sum, r) => sum + r.amount, 0);

  // Jahresgewinn (vereinfacht)
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearRevenue = mockRevenues
    .filter(r => new Date(r.date) >= yearStart)
    .reduce((sum, r) => sum + r.amount, 0);
  const yearExpenses = mockExpenses
    .filter(e => new Date(e.date) >= yearStart)
    .reduce((sum, e) => sum + e.amount, 0);
  const yearProfit = yearRevenue - yearExpenses;

  // Aktive Kunden (mit Status testphase aktiv, upsell bevorstehend, bestandskunde)
  const activeCustomers = mockCustomers.filter(c => 
    ['testphase aktiv', 'upsell bevorstehend', 'bestandskunde'].includes(c.stage)
  ).length;

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
      title: "Jahresgewinn",
      value: `€${yearProfit.toLocaleString()}`,
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

  const upcomingTodos = [
    { task: "Follow-up mit ABC GmbH", date: "Heute, 14:00", priority: "hoch" },
    { task: "Angebot für XYZ Corp erstellen", date: "Morgen, 10:00", priority: "mittel" },
    { task: "Vertrag mit DEF AG prüfen", date: "03.01.2025", priority: "niedrig" },
    { task: "Quarterly Review vorbereiten", date: "Übermorgen, 09:00", priority: "hoch" },
    { task: "Neue Mitarbeiter einarbeiten", date: "05.01.2025", priority: "mittel" },
    { task: "Marketing-Kampagne planen", date: "06.01.2025", priority: "mittel" },
    { task: "Kundenfeedback auswerten", date: "07.01.2025", priority: "niedrig" },
    { task: "Team Meeting vorbereiten", date: "08.01.2025", priority: "hoch" },
  ];

  const teamAppointments = [
    { member: "Max Mustermann", client: "ABC GmbH", date: "Heute, 15:30", type: "Closing" },
    { member: "Lisa Schmidt", client: "XYZ Corp", date: "Morgen, 09:00", type: "Setting" },
    { member: "Tom Weber", client: "DEF AG", date: "03.01.2025", type: "Follow-up" },
    { member: "Anna Müller", client: "GHI GmbH", date: "04.01.2025", type: "Closing" },
    { member: "Peter Klein", client: "JKL Corp", date: "05.01.2025", type: "Setting" },
    { member: "Sarah Braun", client: "MNO AG", date: "06.01.2025", type: "Follow-up" },
    { member: "Mike Johnson", client: "PQR GmbH", date: "07.01.2025", type: "Closing" },
  ];

  const displayedTodos = showAllTodos ? upcomingTodos : upcomingTodos.slice(0, 5);
  const displayedAppointments = showAllAppointments ? teamAppointments : teamAppointments.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Willkommen zurück! Hier ist Ihre Übersicht.</p>
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
              {upcomingTodos.length > 5 && (
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
              {displayedTodos.map((todo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{todo.task}</p>
                    <p className="text-sm text-gray-600">{todo.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    todo.priority === 'hoch' ? 'bg-red-100 text-red-800' :
                    todo.priority === 'mittel' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {todo.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Gelegte Termine vom Team
              </div>
              {teamAppointments.length > 5 && (
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
              {displayedAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.member}</p>
                    <p className="text-sm text-gray-600">{appointment.client}</p>
                    <p className="text-xs text-gray-500">{appointment.date}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {appointment.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
