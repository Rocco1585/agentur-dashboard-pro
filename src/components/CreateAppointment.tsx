
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
      <div className="w-full p-4">
        <div className="text-lg text-gray-900">Lade Daten...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none p-4">
      <div className="w-full text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Termin erstellen</h1>
        <p className="text-gray-900">Neuen Termin für einen Kunden anlegen</p>
      </div>

      <div className="w-full mt-6">
        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="flex items-center text-left w-full">
              <Calendar className="h-5 w-5 mr-2 text-red-600" />
              <span className="text-gray-900">Termin Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              {/* Kunde und Teammitglied */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="text-left w-full">
                  <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center">
                    <Building className="h-4 w-4 mr-2 text-red-600" />
                    Kunde *
                  </label>
                  <Select 
                    value={appointmentData.customer_id} 
                    onValueChange={(value) => setAppointmentData({...appointmentData, customer_id: value})}
                  >
                    <SelectTrigger className="w-full">
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
                          <div className="flex flex-col text-left w-full">
                            <span className="font-medium text-gray-900">{customer.name}</span>
                            <span className="text-xs text-gray-700">{customer.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-left w-full">
                  <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center">
                    <User className="h-4 w-4 mr-2 text-red-600" />
                    Teammitglied *
                  </label>
                  <Select 
                    value={appointmentData.team_member_id} 
                    onValueChange={(value) => setAppointmentData({...appointmentData, team_member_id: value})}
                  >
                    <SelectTrigger className="w-full">
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
                          <div className="flex flex-col text-left w-full">
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
              <div className="text-left w-full">
                <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-red-600" />
                  Datum *
                </label>
                <Input
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                  required
                  className="text-gray-900 w-full max-w-sm"
                />
              </div>

              {/* Pipeline Status */}
              <div className="text-left w-full">
                <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-red-600" />
                  Pipeline Status
                </label>
                <Select 
                  value={appointmentData.result} 
                  onValueChange={(value) => setAppointmentData({...appointmentData, result: value})}
                >
                  <SelectTrigger className="w-full max-w-sm">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="text-left w-full">
                  <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-red-600" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={appointmentData.email}
                    onChange={(e) => setAppointmentData({...appointmentData, email: e.target.value})}
                    placeholder="kunde@email.de"
                    className="text-gray-900 w-full"
                  />
                </div>

                <div className="text-left w-full">
                  <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-red-600" />
                    Telefon
                  </label>
                  <Input
                    type="tel"
                    value={appointmentData.phone}
                    onChange={(e) => setAppointmentData({...appointmentData, phone: e.target.value})}
                    placeholder="+49 123 456789"
                    className="text-gray-900 w-full"
                  />
                </div>

                <div className="text-left w-full">
                  <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center">
                    <Building className="h-4 w-4 mr-2 text-red-600" />
                    Firmenname extern
                  </label>
                  <Input
                    type="text"
                    value={appointmentData.company_name}
                    onChange={(e) => setAppointmentData({...appointmentData, company_name: e.target.value})}
                    placeholder="Externe Firma"
                    className="text-gray-900 w-full"
                  />
                </div>
              </div>

              {/* Gesprächsinhalt */}
              <div className="text-left w-full">
                <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-red-600" />
                  Gesprächsinhalt
                </label>
                <Textarea
                  value={appointmentData.description}
                  onChange={(e) => setAppointmentData({...appointmentData, description: e.target.value})}
                  placeholder="Beschreibung des geplanten Gesprächs..."
                  className="min-h-[100px] text-gray-900 w-full"
                />
              </div>

              {/* Notizen */}
              <div className="text-left w-full">
                <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-red-600" />
                  Zusätzliche Notizen
                </label>
                <Textarea
                  value={appointmentData.notes}
                  onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                  placeholder="Weitere Notizen zum Termin..."
                  className="min-h-[80px] text-gray-900 w-full"
                />
              </div>

              {/* Submit Button */}
              <div className="text-left w-full">
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Termin erstellen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
