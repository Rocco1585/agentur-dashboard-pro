
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Calendar, Euro, TrendingUp, Phone, Mail, User, Clock, CheckCircle, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PipelineColumn } from './PipelineColumn';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { CustomerDetailHeader } from './CustomerDetailHeader';

export interface CustomerDetailProps {
  customer: any;
  onCustomerUpdated: () => void;
}

export function CustomerDetail({ customer, onCustomerUpdated }: CustomerDetailProps) {
  const { canEditCustomers, isAdmin, isMember, user, logAuditEvent } = useAuth();
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    contact: customer.contact || '',
    priority: customer.priority || 'Mittel',
    payment_status: customer.payment_status || 'Ausstehend',
    satisfaction: customer.satisfaction || 5,
    booked_appointments: customer.booked_appointments || 0,
    purchased_appointments: customer.purchased_appointments || 0,
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
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [newRevenue, setNewRevenue] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCustomerData();
  }, [customer.id]);

  const fetchCustomerData = async () => {
    try {
      // Fetch appointments for this customer with all related data and time field
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (
            id,
            name,
            email,
            phone,
            contact,
            priority,
            payment_status,
            satisfaction,
            booked_appointments,
            completed_appointments,
            purchased_appointments,
            pipeline_stage
          ),
          team_members (
            id,
            name,
            role
          )
        `)
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
      const completedAppointments = (appointmentsData || []).filter(apt => 
        apt.result === 'termin_abgeschlossen' || apt.result === 'termin_erschienen'
      ).length;
      const pendingAppointments = (appointmentsData || []).filter(apt => apt.result === 'termin_ausstehend').length;

      setCustomerStats({
        totalRevenue,
        totalAppointments,
        completedAppointments,
        pendingAppointments
      });

    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast({
        title: "Fehler",
        description: "Kundendaten konnten nicht geladen werden.",
        variant: "destructive",
      });
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

      await logAuditEvent('UPDATE', 'customers', customer.id, customer, formData);

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

  const handleDragEnd = async (result: DropResult) => {
    // Only allow admins to move appointments
    if (!isAdmin()) {
      toast({
        title: "Keine Berechtigung",
        description: "Nur Administratoren können Termine verschieben.",
        variant: "destructive",
      });
      return;
    }

    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ result: newStatus })
        .eq('id', draggableId);

      if (error) throw error;

      // Update local state
      setAppointments(prev => prev.map(appointment => 
        appointment.id === draggableId 
          ? { ...appointment, result: newStatus }
          : appointment
      ));

      toast({
        title: "Status aktualisiert",
        description: "Der Terminstatus wurde erfolgreich geändert.",
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleAddRevenue = async () => {
    if (!isAdmin()) {
      toast({
        title: "Keine Berechtigung",
        description: "Nur Administratoren können Einnahmen hinzufügen.",
        variant: "destructive",
      });
      return;
    }

    if (newRevenue.description && newRevenue.amount && newRevenue.date) {
      try {
        const revenueData = {
          customer_id: customer.id,
          description: newRevenue.description,
          amount: Math.round(parseFloat(newRevenue.amount)), // Auf ganze Euro runden
          date: newRevenue.date
        };

        const { error } = await supabase
          .from('revenues')
          .insert(revenueData);

        if (error) throw error;

        await logAuditEvent('INSERT', 'revenues', null, null, revenueData);

        toast({
          title: "Einnahme hinzugefügt",
          description: "Die Einnahme wurde erfolgreich hinzugefügt.",
        });

        setNewRevenue({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0]
        });
        setShowAddRevenue(false);
        fetchCustomerData(); // Refresh data
      } catch (error) {
        console.error('Error adding revenue:', error);
        toast({
          title: "Fehler",
          description: "Einnahme konnte nicht hinzugefügt werden.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'termin_abgeschlossen':
        return 'bg-green-100 text-green-800';
      case 'termin_ausstehend':
        return 'bg-blue-100 text-blue-800';
      case 'termin_erschienen':
        return 'bg-yellow-100 text-yellow-800';
      case 'follow_up':
        return 'bg-purple-100 text-purple-800';
      case 'termin_abgesagt':
        return 'bg-red-100 text-red-800';
      case 'termin_verschoben':
        return 'bg-orange-100 text-orange-800';
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

  // Group appointments by status for pipeline view
  const appointmentsByStatus = {
    'termin_ausstehend': appointments.filter(apt => apt.result === 'termin_ausstehend'),
    'termin_erschienen': appointments.filter(apt => apt.result === 'termin_erschienen'),
    'termin_abgeschlossen': appointments.filter(apt => apt.result === 'termin_abgeschlossen'),
    'follow_up': appointments.filter(apt => apt.result === 'follow_up'),
    'termin_abgesagt': appointments.filter(apt => apt.result === 'termin_abgesagt'),
    'termin_verschoben': appointments.filter(apt => apt.result === 'termin_verschoben')
  };

  const pipelineColumns = [
    { 
      id: 'termin_ausstehend', 
      title: 'Ausstehend', 
      color: 'bg-blue-600',
      appointments: appointmentsByStatus.termin_ausstehend
    },
    { 
      id: 'termin_erschienen', 
      title: 'Erschienen', 
      color: 'bg-yellow-600',
      appointments: appointmentsByStatus.termin_erschienen
    },
    { 
      id: 'termin_abgeschlossen', 
      title: 'Abgeschlossen', 
      color: 'bg-green-600',
      appointments: appointmentsByStatus.termin_abgeschlossen
    },
    { 
      id: 'follow_up', 
      title: 'Follow Up', 
      color: 'bg-purple-600',
      appointments: appointmentsByStatus.follow_up
    },
    { 
      id: 'termin_abgesagt', 
      title: 'Abgesagt', 
      color: 'bg-red-600',
      appointments: appointmentsByStatus.termin_abgesagt
    },
    { 
      id: 'termin_verschoben', 
      title: 'Verschoben', 
      color: 'bg-orange-600',
      appointments: appointmentsByStatus.termin_verschoben
    }
  ];

  return (
    <div className="space-y-6">
      <CustomerDetailHeader 
        customerName={customer.name}
        onBack={onCustomerUpdated}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Gesamt-Umsatz</CardTitle>
            <Euro className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="text-left">
            <div className="text-2xl font-bold">€{Math.round(customerStats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Termine gesamt</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="text-left">
            <div className="text-2xl font-bold">{customerStats.totalAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Abgeschlossen</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="text-left">
            <div className="text-2xl font-bold">{customerStats.completedAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Geplant</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="text-left">
            <div className="text-2xl font-bold">{customerStats.pendingAppointments}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Kundendetails</TabsTrigger>
          <TabsTrigger value="appointments">Termine ({appointments.length})</TabsTrigger>
          <TabsTrigger value="revenues">Einnahmen ({revenues.length})</TabsTrigger>
          <TabsTrigger value="pipeline">Termin Pipeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-left text-xl">{customer.name}</CardTitle>
                <Badge className={customer.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                  {customer.is_active ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!canEditCustomers()}
                    className="text-left"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!canEditCustomers()}
                    className="text-left"
                  />
                  <Input
                    placeholder="Telefon"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!canEditCustomers()}
                    className="text-left"
                  />
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({...formData, priority: value})}
                    disabled={!canEditCustomers()}
                  >
                    <SelectTrigger className="text-left">
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
                    <SelectTrigger className="text-left">
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
                    className="text-left"
                  />
                  <Input
                    placeholder="Gekaufte Termine"
                    type="number"
                    min="0"
                    value={formData.purchased_appointments}
                    onChange={(e) => setFormData({...formData, purchased_appointments: parseInt(e.target.value) || 0})}
                    disabled={!canEditCustomers()}
                    className="text-left"
                  />
                </div>
                <Textarea
                  placeholder="Kontaktinformationen / Notizen"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  rows={4}
                  disabled={!canEditCustomers()}
                  className="text-left"
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
              <CardTitle className="text-left">Termine</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div key={appointment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="text-left">
                          <h4 className="font-medium text-left">{appointment.type}</h4>
                          <p className="text-sm text-gray-600 text-left">
                            {new Date(appointment.date).toLocaleDateString('de-DE')} 
                            {appointment.time && ` um ${appointment.time}`}
                          </p>
                          <p className="text-sm text-gray-600 text-left">
                            Betreuer: {appointment.team_members?.name || 'Nicht zugewiesen'}
                          </p>
                          {appointment.description && (
                            <p className="text-sm mt-2 text-left">{appointment.description}</p>
                          )}
                          {appointment.notes && (
                            <p className="text-sm mt-1 text-gray-500 text-left">Notizen: {appointment.notes}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(appointment.result)}>
                          {appointment.result.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-left">Keine Termine vorhanden</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenues">
          <Card>
            <CardHeader>
              <CardTitle className="text-left flex items-center justify-between">
                Einnahmen
                {isAdmin() && (
                  <Button 
                    onClick={() => setShowAddRevenue(!showAddRevenue)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Einnahme hinzufügen
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showAddRevenue && isAdmin() && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium mb-3 text-left">Neue Einnahme hinzufügen</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Beschreibung"
                      value={newRevenue.description}
                      onChange={(e) => setNewRevenue({...newRevenue, description: e.target.value})}
                      className="text-left"
                    />
                    <Input
                      type="number"
                      placeholder="Betrag (€)"
                      value={newRevenue.amount}
                      onChange={(e) => setNewRevenue({...newRevenue, amount: e.target.value})}
                      className="text-left"
                    />
                    <Input
                      type="date"
                      value={newRevenue.date}
                      onChange={(e) => setNewRevenue({...newRevenue, date: e.target.value})}
                      className="text-left"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddRevenue} className="bg-green-600 hover:bg-green-700">
                      Hinzufügen
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddRevenue(false)}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
              
              {revenues.length > 0 ? (
                <div className="space-y-4">
                  {revenues.map((revenue: any) => (
                    <div key={revenue.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <h4 className="font-medium text-left">€{Number(revenue.amount).toFixed(2)}</h4>
                          <p className="text-sm text-gray-600 text-left">
                            {new Date(revenue.date).toLocaleDateString('de-DE')}
                          </p>
                          {revenue.description && (
                            <p className="text-sm mt-1 text-left">{revenue.description}</p>
                          )}
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Einnahme
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-left">Keine Einnahmen verzeichnet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-left text-sm">Termin Pipeline - {customer.name}</CardTitle>
              {isMember() && !isAdmin() && (
                <p className="text-sm text-gray-600 text-left">Nur ansehen - Verschieben nur für Administratoren</p>
              )}
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {pipelineColumns.map((column) => (
                    <PipelineColumn
                      key={column.id}
                      title={column.title}
                      stageId={column.id}
                      customers={column.appointments}
                      color={column.color}
                      onCustomerClick={(appointment) => {
                        console.log('Appointment clicked:', appointment);
                      }}
                    />
                  ))}
                </div>
              </DragDropContext>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
