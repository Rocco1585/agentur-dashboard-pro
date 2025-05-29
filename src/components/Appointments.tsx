
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, User, Phone, Mail, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";

export function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (name, email, phone, contact),
          team_members (name)
        `)
        .order('date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'termin_ausstehend':
        return 'bg-blue-100 text-blue-800';
      case 'termin_erschienen':
        return 'bg-yellow-100 text-yellow-800';
      case 'termin_abgeschlossen':
        return 'bg-green-100 text-green-800';
      case 'termin_abgesagt':
        return 'bg-red-100 text-red-800';
      case 'termin_verschoben':
        return 'bg-orange-100 text-orange-800';
      case 'follow_up':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'termin_ausstehend':
        return 'Ausstehend';
      case 'termin_erschienen':
        return 'Erschienen';
      case 'termin_abgeschlossen':
        return 'Abgeschlossen';
      case 'termin_abgesagt':
        return 'Abgesagt';
      case 'termin_verschoben':
        return 'Verschoben';
      case 'follow_up':
        return 'Follow Up';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-lg text-left">Lade Termine...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900">Termine</h1>
          <p className="text-gray-600">Übersicht aller Termine</p>
        </div>
        <Button
          onClick={() => navigate('/create-appointment')}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Neuen Termin erstellen
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {appointments.length > 0 ? (
          appointments.map((appointment: any) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-lg text-left">
                        {appointment.customers?.name || 'Unbekannter Kunde'}
                      </h3>
                      <p className="text-sm text-gray-600 text-left">{appointment.type}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.result)}>
                    {getStatusLabel(appointment.result)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-left">
                      {new Date(appointment.date).toLocaleDateString('de-DE')}
                      {appointment.time && ` um ${appointment.time}`}
                    </span>
                  </div>

                  {appointment.team_members && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-left">{appointment.team_members.name}</span>
                    </div>
                  )}

                  {appointment.customers?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-left">{appointment.customers.email}</span>
                    </div>
                  )}

                  {appointment.customers?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-left">{appointment.customers.phone}</span>
                    </div>
                  )}
                </div>

                {appointment.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 text-left">{appointment.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/customer-dashboard-view/${appointment.customer_id}`)}
                  >
                    Kunden-Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Termine vorhanden</h3>
              <p className="text-gray-600 mb-4">Erstellen Sie Ihren ersten Termin</p>
              <Button
                onClick={() => navigate('/create-appointment')}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Termin erstellen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
