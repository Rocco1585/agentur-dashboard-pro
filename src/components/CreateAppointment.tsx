
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Building, Phone, Mail, FileText, Save, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCustomers, useTeamMembers, useAppointments } from '@/hooks/useSupabaseData';

export function CreateAppointment() {
  const { customers, loading: customersLoading } = useCustomers();
  const { teamMembers, loading: teamMembersLoading } = useTeamMembers();
  const { addAppointment } = useAppointments();
  
  const [appointmentData, setAppointmentData] = useState({
    customer_id: '',
    team_member_id: '',
    type: 'Beratungsgespräch',
    date: '',
    description: '',
    notes: '',
    result: 'termin_ausstehend'
  });

  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    contact: ''
  });

  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false);

  const appointmentTypes = [
    'Beratungsgespräch',
    'Ersttermin',
    'Follow-up',
    'Abschlussgespräch',
    'Nachbesprechung'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appointmentData.customer_id || !appointmentData.team_member_id || !appointmentData.date) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addAppointment(appointmentData);
      
      // Reset form
      setAppointmentData({
        customer_id: '',
        team_member_id: '',
        type: 'Beratungsgespräch',
        date: '',
        description: '',
        notes: '',
        result: 'termin_ausstehend'
      });
      
      toast({
        title: "Erfolg",
        description: "Termin wurde erfolgreich erstellt.",
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const loading = customersLoading || teamMembersLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade Daten...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Termin erstellen</h1>
          <p className="text-gray-600">Neuen Termin für einen Kunden anlegen</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Termin Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kunde auswählen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kunde *</label>
                <Select 
                  value={appointmentData.customer_id} 
                  onValueChange={(value) => setAppointmentData({...appointmentData, customer_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        {appointmentData.customer_id ? 
                          customers.find(c => c.id === appointmentData.customer_id)?.name : 
                          "Kunde auswählen"
                        }
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.name}</span>
                          <span className="text-xs text-gray-500">{customer.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Teammitglied *</label>
                <Select 
                  value={appointmentData.team_member_id} 
                  onValueChange={(value) => setAppointmentData({...appointmentData, team_member_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Teammitglied auswählen">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {appointmentData.team_member_id ? 
                          teamMembers.find(tm => tm.id === appointmentData.team_member_id)?.name : 
                          "Teammitglied auswählen"
                        }
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-xs text-gray-500">{member.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Termin Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Datum *</label>
                <Input
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Terminart</label>
                <Select 
                  value={appointmentData.type} 
                  onValueChange={(value) => setAppointmentData({...appointmentData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Gesprächsinhalt */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Gesprächsinhalt
              </label>
              <Textarea
                value={appointmentData.description}
                onChange={(e) => setAppointmentData({...appointmentData, description: e.target.value})}
                placeholder="Beschreibung des geplanten Gesprächs..."
                className="min-h-[100px]"
              />
            </div>

            {/* Notizen */}
            <div>
              <label className="text-sm font-medium mb-2 block">Zusätzliche Notizen</label>
              <Textarea
                value={appointmentData.notes}
                onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                placeholder="Weitere Notizen zum Termin..."
                className="min-h-[80px]"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button type="submit" className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Termin erstellen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
