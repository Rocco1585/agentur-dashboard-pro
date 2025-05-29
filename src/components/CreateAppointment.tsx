
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Building, Phone, Mail, FileText, Save, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCustomers, useTeamMembers, useAppointments } from '@/hooks/useSupabaseData';

export function CreateAppointment() {
  const { customers, loading: customersLoading } = useCustomers();
  const { teamMembers, loading: teamMembersLoading } = useTeamMembers();
  const { addAppointment } = useAppointments();
  
  // Set today as default date
  const today = new Date().toISOString().split('T')[0];
  
  const [appointmentData, setAppointmentData] = useState({
    customer_id: '',
    team_member_id: '',
    date: today,
    description: '',
    notes: '',
    result: 'termin_ausstehend',
    email: '',
    phone: '',
    company_name: ''
  });

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
      
      // Reset form with today's date
      setAppointmentData({
        customer_id: '',
        team_member_id: '',
        date: today,
        description: '',
        notes: '',
        result: 'termin_ausstehend',
        email: '',
        phone: '',
        company_name: ''
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
        <div className="text-lg text-gray-900">Lade Daten...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Termin erstellen</h1>
        <p className="text-gray-900">Neuen Termin für einen Kunden anlegen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-left">
            <Calendar className="h-5 w-5 mr-2 text-red-600" />
            <span className="text-gray-900">Termin Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kunde und Teammitglied */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="text-sm font-medium mb-2 block text-gray-900">
                  <Building className="h-4 w-4 mr-2 text-red-600 inline" />
                  Kunde *
                </label>
                <Select 
                  value={appointmentData.customer_id} 
                  onValueChange={(value) => setAppointmentData({...appointmentData, customer_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen">
                      <span className="text-gray-900">
                        {appointmentData.customer_id ? 
                          customers.find(c => c.id === appointmentData.customer_id)?.name : 
                          "Kunde auswählen"
                        }
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-gray-900">{customer.name}</span>
                          <span className="text-xs text-gray-700">{customer.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-left">
                <label className="text-sm font-medium mb-2 block text-gray-900">
                  <User className="h-4 w-4 mr-2 text-red-600 inline" />
                  Teammitglied *
                </label>
                <Select 
                  value={appointmentData.team_member_id} 
                  onValueChange={(value) => setAppointmentData({...appointmentData, team_member_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Teammitglied auswählen">
                      <span className="text-gray-900">
                        {appointmentData.team_member_id ? 
                          teamMembers.find(tm => tm.id === appointmentData.team_member_id)?.name : 
                          "Teammitglied auswählen"
                        }
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-gray-900">{member.name}</span>
                          <span className="text-xs text-gray-700">{member.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Datum */}
            <div className="text-left">
              <label className="text-sm font-medium mb-2 block text-gray-900">
                <Calendar className="h-4 w-4 mr-2 text-red-600 inline" />
                Datum *
              </label>
              <Input
                type="date"
                value={appointmentData.date}
                onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                required
                className="text-gray-900 max-w-sm"
              />
            </div>

            {/* Pipeline Status */}
            <div className="text-left">
              <label className="text-sm font-medium mb-2 block text-gray-900">
                <Target className="h-4 w-4 mr-2 text-red-600 inline" />
                Pipeline Status
              </label>
              <Select 
                value={appointmentData.result} 
                onValueChange={(value) => setAppointmentData({...appointmentData, result: value})}
              >
                <SelectTrigger className="max-w-sm">
                  <SelectValue className="text-gray-900" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="termin_ausstehend" className="text-gray-900">Termin Ausstehend</SelectItem>
                  <SelectItem value="termin_erschienen" className="text-gray-900">Termin Erschienen</SelectItem>
                  <SelectItem value="termin_abgeschlossen" className="text-gray-900">Termin Abgeschlossen</SelectItem>
                  <SelectItem value="follow_up" className="text-gray-900">Follow-up</SelectItem>
                  <SelectItem value="verloren" className="text-gray-900">Verloren</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Kontaktdaten */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-left">
                <label className="text-sm font-medium mb-2 block text-gray-900">
                  <Mail className="h-4 w-4 mr-2 text-red-600 inline" />
                  Email
                </label>
                <Input
                  type="email"
                  value={appointmentData.email}
                  onChange={(e) => setAppointmentData({...appointmentData, email: e.target.value})}
                  placeholder="kunde@email.de"
                  className="text-gray-900"
                />
              </div>

              <div className="text-left">
                <label className="text-sm font-medium mb-2 block text-gray-900">
                  <Phone className="h-4 w-4 mr-2 text-red-600 inline" />
                  Telefon
                </label>
                <Input
                  type="tel"
                  value={appointmentData.phone}
                  onChange={(e) => setAppointmentData({...appointmentData, phone: e.target.value})}
                  placeholder="+49 123 456789"
                  className="text-gray-900"
                />
              </div>

              <div className="text-left">
                <label className="text-sm font-medium mb-2 block text-gray-900">
                  <Building className="h-4 w-4 mr-2 text-red-600 inline" />
                  Firmenname extern
                </label>
                <Input
                  type="text"
                  value={appointmentData.company_name}
                  onChange={(e) => setAppointmentData({...appointmentData, company_name: e.target.value})}
                  placeholder="Externe Firma"
                  className="text-gray-900"
                />
              </div>
            </div>

            {/* Gesprächsinhalt */}
            <div className="text-left">
              <label className="text-sm font-medium mb-2 block text-gray-900">
                <FileText className="h-4 w-4 mr-2 text-red-600 inline" />
                Gesprächsinhalt
              </label>
              <Textarea
                value={appointmentData.description}
                onChange={(e) => setAppointmentData({...appointmentData, description: e.target.value})}
                placeholder="Beschreibung des geplanten Gesprächs..."
                className="min-h-[100px] text-gray-900"
              />
            </div>

            {/* Notizen */}
            <div className="text-left">
              <label className="text-sm font-medium mb-2 block text-gray-900">
                <FileText className="h-4 w-4 mr-2 text-red-600 inline" />
                Zusätzliche Notizen
              </label>
              <Textarea
                value={appointmentData.notes}
                onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                placeholder="Weitere Notizen zum Termin..."
                className="min-h-[80px] text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <div className="text-left">
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
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
