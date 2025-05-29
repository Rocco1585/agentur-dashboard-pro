
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Calendar, Euro, TrendingUp, Phone, Mail, User, Clock, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CustomerDetailProps {
  customer: any;
  onCustomerUpdated: () => void;
}

export function CustomerDetail({ customer, onCustomerUpdated }: CustomerDetailProps) {
  const { canEditCustomers } = useAuth();
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    contact: customer.contact || '',
    priority: customer.priority || 'Mittel',
    payment_status: customer.payment_status || 'Ausstehend',
    satisfaction: customer.satisfaction || 5,
    booked_appointments: customer.booked_appointments || 0,
    is_active: customer.is_active
  });
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [customerStats, setCustomerStats] = useState({
    totalRevenue: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0
  });

  useEffect(() => {
    fetchCustomerData();
  }, [customer.id]);

  const fetchCustomerData = async () => {
    try {
      // Fetch appointments for this customer
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_id', customer.id)
        .order('date', { ascending: false });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

      // Fetch revenues for this customer
      const { data: revenuesData, error: revenuesError } = await supabase
        .from('revenues')
        .select('*')
        .eq('customer_id', customer.id)
        .order('date', { ascending: false });

      if (revenuesError) throw revenuesError;
      setRevenues(revenuesData || []);

      // Calculate stats
      const totalRevenue = (revenuesData || []).reduce((sum, revenue) => sum + Number(revenue.amount), 0);
      const totalAppointments = (appointmentsData || []).length;
      const completedAppointments = (appointmentsData || []).filter(apt => apt.result === 'Abgeschlossen').length;
      const pendingAppointments = (appointmentsData || []).filter(apt => apt.result === 'Geplant').length;

      setCustomerStats({
        totalRevenue,
        totalAppointments,
        completedAppointments,
        pendingAppointments
      });

    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEditCustomers()) {
      toast({
        title: "Keine Berechtigung",
        description: "Sie haben keine Berechtigung, Kunden zu bearbeiten.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', customer.id);

      if (error) throw error;

      toast({
        title: "Kunde aktualisiert",
        description: `${formData.name} wurde erfolgreich aktualisiert.`,
      });

      onCustomerUpdated();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Fehler",
        description: "Kunde konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Abgeschlossen':
        return 'bg-green-100 text-green-800';
      case 'Geplant':
        return 'bg-blue-100 text-blue-800';
      case 'Storniert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch':
        return 'bg-red-100 text-red-800';
      case 'Mittel':
        return 'bg-yellow-100 text-yellow-800';
      case 'Niedrig':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {canEditCustomers() ? 'Kunde bearbeiten' : 'Kundendetails'}
          </h1>
          <p className="text-gray-600">
            {canEditCustomers() ? 'Kundendetails verwalten' : 'Kundeninformationen anzeigen'}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt-Umsatz</CardTitle>
            <Euro className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{customerStats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Termine gesamt</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.totalAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.completedAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geplant</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.pendingAppointments}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Kundendetails</TabsTrigger>
          <TabsTrigger value="appointments">Termine ({appointments.length})</TabsTrigger>
          <TabsTrigger value="revenues">Einnahmen ({revenues.length})</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{customer.name}</span>
                <Badge className={customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {customer.is_active ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!canEditCustomers()}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!canEditCustomers()}
                  />
                  <Input
                    placeholder="Telefon"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!canEditCustomers()}
                  />
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({...formData, priority: value})}
                    disabled={!canEditCustomers()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priorität" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hoch">Hoch</SelectItem>
                      <SelectItem value="Mittel">Mittel</SelectItem>
                      <SelectItem value="Niedrig">Niedrig</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={formData.payment_status} 
                    onValueChange={(value) => setFormData({...formData, payment_status: value})}
                    disabled={!canEditCustomers()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Zahlungsstatus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bezahlt">Bezahlt</SelectItem>
                      <SelectItem value="Ausstehend">Ausstehend</SelectItem>
                      <SelectItem value="Überfällig">Überfällig</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Zufriedenheit (1-10)"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.satisfaction}
                    onChange={(e) => setFormData({...formData, satisfaction: parseInt(e.target.value) || 5})}
                    disabled={!canEditCustomers()}
                  />
                </div>
                <Textarea
                  placeholder="Kontaktinformationen / Notizen"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  rows={4}
                  disabled={!canEditCustomers()}
                />
                {canEditCustomers() && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Speichere...' : 'Änderungen speichern'}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Termine</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div key={appointment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{appointment.type}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString('de-DE')} um {appointment.time}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm mt-2">{appointment.notes}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(appointment.result)}>
                          {appointment.result}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Keine Termine vorhanden</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenues">
          <Card>
            <CardHeader>
              <CardTitle>Einnahmen</CardTitle>
            </CardHeader>
            <CardContent>
              {revenues.length > 0 ? (
                <div className="space-y-4">
                  {revenues.map((revenue: any) => (
                    <div key={revenue.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">€{Number(revenue.amount).toFixed(2)}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(revenue.date).toLocaleDateString('de-DE')}
                          </p>
                          {revenue.description && (
                            <p className="text-sm mt-1">{revenue.description}</p>
                          )}
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {revenue.category || 'Allgemein'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Keine Einnahmen verzeichnet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Kunden-Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Lead</h4>
                  <p className="text-sm text-blue-600 mt-2">
                    Priorität: <Badge className={getPriorityColor(customer.priority)}>{customer.priority}</Badge>
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800">In Bearbeitung</h4>
                  <p className="text-sm text-yellow-600 mt-2">
                    Offene Termine: {customerStats.pendingAppointments}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Kunde</h4>
                  <p className="text-sm text-green-600 mt-2">
                    Zahlungsstatus: <Badge className={formData.payment_status === 'Bezahlt' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {formData.payment_status}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h5 className="font-medium mb-3">Kundenhistorie</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Kunde erstellt: {new Date(customer.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span>Zufriedenheit: {customer.satisfaction}/10</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Termine gebucht: {customer.booked_appointments || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
