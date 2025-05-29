
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Building, Phone, Mail, FileText, Save, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCustomers, useTeamMembers } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';

export function CreateAppointment() {
  const { customers, loading: customersLoading } = useCustomers();
  const { teamMembers, loading: teamMembersLoading } = useTeamMembers();
  
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
    
    if (!appointmentData.customer_id || !appointmentData.date) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get customer data to create proper type field
      const selectedCustomer = customers.find(c => c.id === appointmentData.customer_id);
      const selectedTeamMember = teamMembers.find(tm => tm.id === appointmentData.team_member_id);
      
      // Create type field similar to how it's done in CustomerDetail
      let typeField = '';
      if (appointmentData.company_name && appointmentData.email && appointmentData.phone) {
        typeField = `${appointmentData.company_name} - ${appointmentData.email} - ${appointmentData.phone}`;
      } else if (selectedCustomer) {
        typeField = `${selectedCustomer.name} - ${selectedCustomer.contact || selectedCustomer.email || 'Kontakt'} - ${selectedCustomer.phone || appointmentData.phone || 'Telefon'}`;
      } else {
        typeField = 'Neuer Termin';
      }

      const { error } = await supabase
        .from('appointments')
        .insert({
          customer_id: appointmentData.customer_id,
          date: appointmentData.date,
          type: typeField,
          description: appointmentData.description,
          notes: appointmentData.notes,
          team_member_id: appointmentData.team_member_id || null,
          result: appointmentData.result
        });

      if (error) throw error;
      
      // Update team member appointment count if team member was selected
      if (appointmentData.team_member_id && selectedTeamMember) {
        await supabase
          .from('team_members')
          .update({ 
            appointment_count: (selectedTeamMember.appointment_count || 0) + 1
          })
          .eq('id', appointmentData.team_member_id);
      }
      
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
      toast({
        title: "Fehler",
        description: "Termin konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  };

  const loading = customersLoading || teamMembersLoading;

  if (loading) {
    return (
      <div className="w-full p-4 text-left">
        <div className="text-lg text-gray-900">Lade Daten...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none p-4 text-left">
      <div className="w-full text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 text-left">Termin erstellen</h1>
        <p className="text-gray-900 text-left">Neuen Termin für einen Kunden anlegen</p>
      </div>

      <div className="w-full mt-6">
        <Card className="w-full">
          <CardHeader className="w-full text-left">
            <CardTitle className="flex items-center text-left w-full">
              <Calendar className="h-5 w-5 mr-2 text-red-600" />
              <span className="text-gray-900">Termin Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full text-left">
            <form onSubmit={handleSubmit} className="space-y-6 w-full text-left">
              {/* Kunde und Teammitglied */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="text-left w-full">
                  <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center text-left">
                    <Building className="h-4 w-4 mr-2 text-red-600" />
                    Kunde *
                  </label>
                  <Select 
                    value={appointmentData.customer_id} 
                    onValueChange={(value) => setAppointmentData({...appointmentData, customer_id: value})}
                  >
                    <SelectTrigger className="w-full text-left">
                      <SelectValue placeholder="Kunde auswählen">
                        <span className="text-gray-900 text-left">
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
                            <span className="font-medium text-gray-900 text-left">{customer.name}</span>
                            <span className="text-xs text-gray-700 text-left">{customer.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-left w-full">
                  <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center text-left">
                    <User className="h-4 w-4 mr-2 text-red-600" />
                    Teammitglied
                  </label>
                  <Select 
                    value={appointmentData.team_member_id} 
                    onValueChange={(value) => setAppointmentData({...appointmentData, team_member_id: value})}
                  >
                    <SelectTrigger className="w-full text-left">
                      <SelectValue placeholder="Teammitglied auswählen">
                        <span className="text-gray-900 text-left">
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
                            <span className="font-medium text-gray-900 text-left">{member.name}</span>
                            <span className="text-xs text-gray-700 text-left">{member.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Datum */}
              <div className="text-left w-full">
                <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center text-left">
                  <Calendar className="h-4 w-4 mr-2 text-red-600" />
                  Datum *
                </label>
                <Input
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                  required
                  className="text-gray-900 w-full max-w-sm text-left"
                />
              </div>

              {/* Pipeline Status */}
              <div className="text-left w-full">
                <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center text-left">
                  <Target className="h-4 w-4 mr-2 text-red-600" />
                  Pipeline Status
                </label>
                <Select 
                  value={appointmentData.result} 
                  onValueChange={(value) => setAppointmentData({...appointmentData, result: value})}
                >
                  <SelectTrigger className="w-full max-w-sm text-left">
                    <SelectValue className="text-gray-900 text-left" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="termin_ausstehend" className="text-gray-900 text-left">Termin Ausstehend</SelectItem>
                    <SelectItem value="termin_erschienen" className="text-gray-900 text-left">Termin Erschienen</SelectItem>
                    <SelectItem value="termin_abgeschlossen" className="text-gray-900 text-left">Termin Abgeschlossen</SelectItem>
                    <SelectItem value="follow_up" className="text-gray-900 text-left">Follow-up</SelectItem>
                    <SelectItem value="verloren" className="text-gray-900 text-left">Verloren</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Kontaktdaten */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="text-left w-full">
                  <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center text-left">
                    <Mail className="h-4 w-4 mr-2 text-red-600" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={appointmentData.email}
                    onChange={(e) => setAppointmentData({...appointmentData, email: e.target.value})}
                    placeholder="kunde@email.de"
                    className="text-gray-900 w-full text-left"
                  />
                </div>

                <div className="text-left w-full">
                  <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center text-left">
                    <Phone className="h-4 w-4 mr-2 text-red-600" />
                    Telefon
                  </label>
                  <Input
                    type="tel"
                    value={appointmentData.phone}
                    onChange={(e) => setAppointmentData({...appointmentData, phone: e.target.value})}
                    placeholder="+49 123 456789"
                    className="text-gray-900 w-full text-left"
                  />
                </div>

                <div className="text-left w-full">
                  <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center text-left">
                    <Building className="h-4 w-4 mr-2 text-red-600" />
                    Firmenname extern
                  </label>
                  <Input
                    type="text"
                    value={appointmentData.company_name}
                    onChange={(e) => setAppointmentData({...appointmentData, company_name: e.target.value})}
                    placeholder="Externe Firma"
                    className="text-gray-900 w-full text-left"
                  />
                </div>
              </div>

              {/* Gesprächsinhalt */}
              <div className="text-left w-full">
                <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center text-left">
                  <FileText className="h-4 w-4 mr-2 text-red-600" />
                  Gesprächsinhalt
                </label>
                <Textarea
                  value={appointmentData.description}
                  onChange={(e) => setAppointmentData({...appointmentData, description: e.target.value})}
                  placeholder="Beschreibung des geplanten Gesprächs..."
                  className="min-h-[100px] text-gray-900 w-full text-left"
                />
              </div>

              {/* Notizen */}
              <div className="text-left w-full">
                <label className="text-sm font-medium mb-2 block text-gray-900 flex items-center text-left">
                  <FileText className="h-4 w-4 mr-2 text-red-600" />
                  Zusätzliche Notizen
                </label>
                <Textarea
                  value={appointmentData.notes}
                  onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                  placeholder="Weitere Notizen zum Termin..."
                  className="min-h-[80px] text-gray-900 w-full text-left"
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
