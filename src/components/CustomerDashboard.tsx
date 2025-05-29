
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, TrendingUp, Euro, CheckCircle, Clock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function CustomerDashboard() {
  const { customerId } = useParams();
  const { user, isAdmin, isCustomer } = useAuth();
  const [customerData, setCustomerData] = useState<any>(null);
  const [appointments, setAppointments] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [customerId, user]);

  const fetchCustomerData = async () => {
    try {
      console.log('Fetching customer data for ID:', customerId);
      console.log('Current user:', user);
      console.log('Is admin:', isAdmin());
      console.log('Is customer:', isCustomer());

      // Wenn kein Benutzer eingeloggt ist
      if (!user) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      // Berechtigungsprüfung: Admin kann alle sehen, Kunde nur sein eigenes
      if (!isAdmin() && user?.id !== customerId) {
        console.log('No permission: user is not admin and user ID does not match customer ID');
        setLoading(false);
        return;
      }

      // Hole Kundendaten - für Admins zuerst aus customers Tabelle
      let finalCustomerData = null;
      
      if (isAdmin()) {
        // Admin kann alle Kunden sehen - zuerst aus customers versuchen
        const { data: customerFromCustomers, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();

        console.log('Customer data from customers table:', customerFromCustomers);

        if (customerError) {
          console.error('Error fetching customer data:', customerError);
        }

        if (customerFromCustomers) {
          finalCustomerData = customerFromCustomers;
        } else {
          // Falls nicht in customers gefunden, aus team_members versuchen
          const { data: teamMemberData, error: teamMemberError } = await supabase
            .from('team_members')
            .select('*')
            .eq('id', customerId)
            .eq('user_role', 'kunde')
            .maybeSingle();

          console.log('Team member data:', teamMemberData);

          if (teamMemberError) {
            console.error('Error fetching team member data:', teamMemberError);
          } else {
            finalCustomerData = teamMemberData;
          }
        }
      } else {
        // Nicht-Admin: Nur eigenes Dashboard aus team_members
        const { data: teamMemberData, error: teamMemberError } = await supabase
          .from('team_members')
          .select('*')
          .eq('id', customerId)
          .eq('user_role', 'kunde')
          .maybeSingle();

        console.log('Team member data for customer:', teamMemberData);

        if (teamMemberError) {
          console.error('Error fetching team member data:', teamMemberError);
        } else {
          finalCustomerData = teamMemberData;
        }
      }
      
      if (!finalCustomerData) {
        console.log('No customer data found');
        setLoading(false);
        return;
      }

      setCustomerData(finalCustomerData);

      // Fetch appointments für diesen Kunden
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      } else {
        console.log('Appointments data:', appointmentsData);
        setAppointments(appointmentsData || []);
      }

      // Fetch revenues nur für Admins
      if (isAdmin()) {
        const { data: revenuesData, error: revenuesError } = await supabase
          .from('revenues')
          .select('*')
          .eq('customer_id', customerId)
          .order('date', { ascending: false });

        if (revenuesError) {
          console.error('Error fetching revenues:', revenuesError);
        } else {
          setRevenues(revenuesData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-lg text-left">Lade Dashboard...</div>
      </div>
    );
  }

  // Wenn kein Benutzer eingeloggt ist
  if (!user) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 text-left">Anmeldung erforderlich</h1>
          <p className="text-gray-600 mt-2 text-left">
            Bitte melden Sie sich an, um auf das Dashboard zuzugreifen.
          </p>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 text-left">Kunde nicht gefunden</h1>
          <p className="text-gray-600 mt-2 text-left">
            Der angeforderte Kunde wurde nicht gefunden oder Sie haben keine Berechtigung, diese Seite zu betrachten.
          </p>
        </div>
      </div>
    );
  }

  // Doppelte Berechtigungsprüfung
  if (!isAdmin() && user?.id !== customerId) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 text-left">Keine Berechtigung</h1>
          <p className="text-gray-600 mt-2 text-left">Sie haben keine Berechtigung, diese Seite zu betrachten.</p>
        </div>
      </div>
    );
  }

  const completedAppointments = appointments.filter(apt => 
    apt.result === 'termin_abgeschlossen' || apt.result === 'Abgeschlossen'
  ).length;
  const pendingAppointments = appointments.filter(apt => 
    apt.result === 'termin_ausstehend' || apt.result === 'Geplant'
  ).length;
  const totalRevenue = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);

  return (
    <div className="space-y-6 p-6">
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900">
          {customerData.customer_dashboard_name || customerData.name || 'Kunden Dashboard'}
        </h1>
        <p className="text-gray-600">Willkommen, {customerData.name}</p>
        {isAdmin() && (
          <Badge className="mt-2 bg-red-100 text-red-800">
            Admin-Ansicht für {customerData.name}
          </Badge>
        )}
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Termine</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{appointments.length}</div>
            <p className="text-xs text-gray-600 text-left">
              {completedAppointments} abgeschlossen, {pendingAppointments} geplant
            </p>
          </CardContent>
        </Card>

        {isAdmin() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-left">Umsatz</CardTitle>
              <Euro className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-left">€{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-600 text-left">{revenues.length} Transaktionen</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              <Badge className={customerData.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {customerData.is_active ? "Aktiv" : "Inaktiv"}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 text-left">Ihr Kontostatus</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin-specific content */}
      {isAdmin() && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-left">Aktuelle Termine</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((appointment: any) => (
                      <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-left text-sm">{appointment.type}</div>
                        <div className="text-xs text-gray-600 text-left mt-1">
                          {new Date(appointment.date).toLocaleDateString('de-DE')} um {appointment.time}
                        </div>
                        <div className="text-xs text-gray-600 text-left">
                          Status: <Badge className="text-xs">{appointment.result}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-left">Keine Termine vorhanden</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-left">Einnahmen Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                {revenues.length > 0 ? (
                  <div className="space-y-3">
                    {revenues.slice(0, 5).map((revenue: any) => (
                      <div key={revenue.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-left text-sm">€{Number(revenue.amount).toFixed(2)}</div>
                        <div className="text-xs text-gray-600 text-left mt-1">
                          {new Date(revenue.date).toLocaleDateString('de-DE')}
                        </div>
                        {revenue.description && (
                          <div className="text-xs text-gray-600 text-left">{revenue.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-left">Keine Einnahmen verzeichnet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-left">Willkommen in Ihrem persönlichen Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-left">
            Hier können Sie Ihre Termine einsehen, Dokumente herunterladen und den Status Ihrer Projekte verfolgen.
            {isAdmin() && " Als Admin sehen Sie zusätzliche Informationen wie Umsätze und detaillierte Statistiken."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
