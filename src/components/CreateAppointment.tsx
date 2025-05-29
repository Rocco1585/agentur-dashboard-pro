
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, User, Mail, Phone, Building } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCustomers, useTeamMembers } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';

interface CreateAppointmentProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CreateAppointment({ onBack, onSuccess }: CreateAppointmentProps) {
  const { customers } = useCustomers();
  const { teamMembers } = useTeamMembers();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    customer_id: '',
    team_member_id: '',
    email: '',
    phone: '',
    company_name: '',
    contact_person: '',
    pipeline_stage: 'termin_ausstehend'
  });

  const pipelineStages = [
    { value: 'termin_ausstehend', label: 'Termin Ausstehend' },
    { value: 'termin_erschienen', label: 'Termin Erschienen' },
    { value: 'termin_abgeschlossen', label: 'Termin Abgeschlossen' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'termin_abgesagt', label: 'Termin Abgesagt' },
    { value: 'termin_verschoben', label: 'Termin Verschoben' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung der Pflichtfelder
    if (!formData.date || !formData.customer_id || !formData.team_member_id || !formData.email || !formData.phone || !formData.company_name) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus (Datum, Kunde, Teammitglied, E-Mail, Telefon, Firmenname).",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
      return;
    }

    try {
      // Termin erstellen
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          date: formData.date,
          time: formData.time || null,
          type: 'Termin',
          customer_id: formData.customer_id,
          team_member_id: formData.team_member_id,
          result: formData.pipeline_stage
        });

      if (appointmentError) throw appointmentError;

      // Kontaktdaten des Kunden aktualisieren
      if (formData.customer_id) {
        await supabase
          .from('customers')
          .update({
            email: formData.email,
            phone: formData.phone,
            contact: formData.contact_person,
            pipeline_stage: formData.pipeline_stage
          })
          .eq('id', formData.customer_id);
      }

      // Appointment_count des Teammitglieds erhöhen
      if (formData.team_member_id) {
        const { data: currentMember } = await supabase
          .from('team_members')
          .select('appointment_count')
          .eq('id', formData.team_member_id)
          .single();

        if (currentMember) {
          await supabase
            .from('team_members')
            .update({
              appointment_count: (currentMember.appointment_count || 0) + 1
            })
            .eq('id', formData.team_member_id);
        }
      }

      toast({
        title: "Erfolg",
        description: "Termin wurde erfolgreich erstellt und dem Teammitglied zugeordnet.",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht erstellt werden.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2 text-red-600" />
          Zurück
        </Button>
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900 text-left">Neuen Termin erstellen</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-left">
            <Calendar className="h-5 w-5 mr-2 text-red-600" />
            Termin Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                  Datum *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                  Uhrzeit
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                  Kunde *
                </label>
                <Select value={formData.customer_id} onValueChange={(value) => setFormData({...formData, customer_id: value})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                  Teammitglied *
                </label>
                <Select value={formData.team_member_id} onValueChange={(value) => setFormData({...formData, team_member_id: value})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Teammitglied auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-left md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                  Termin Status
                </label>
                <Select value={formData.pipeline_stage} onValueChange={(value) => setFormData({...formData, pipeline_stage: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Termin Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelineStages.map(stage => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                  <Mail className="h-4 w-4 inline mr-1 text-red-600" />
                  E-Mail Interessent *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="kunde@beispiel.de"
                  required
                />
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                  <Phone className="h-4 w-4 inline mr-1 text-red-600" />
                  Telefon Interessent *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+49 123 456789"
                  required
                />
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                  <Building className="h-4 w-4 inline mr-1 text-red-600" />
                  Firma Interessent *
                </label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="Firma GmbH"
                  required
                />
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                  <User className="h-4 w-4 inline mr-1 text-red-600" />
                  AP Interessent
                </label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  placeholder="Max Mustermann"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Termin erstellen
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
