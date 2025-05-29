
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCustomers, useTeamMembers, useAppointments } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';

export function CreateAppointment() {
  const { customers } = useCustomers();
  const { teamMembers } = useTeamMembers();
  const { addAppointment } = useAppointments();
  const { user } = useAuth();
  const [newAppointment, setNewAppointment] = useState({
    customer_id: '',
    date: '',
    type: '',
    description: '',
    notes: '',
    team_member_id: ''
  });

  if (!user) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Anmeldung erforderlich</h3>
            <p className="text-gray-600">Sie müssen angemeldet sein, um Termine zu erstellen.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddAppointment = async () => {
    if (newAppointment.customer_id && newAppointment.date && newAppointment.type) {
      await addAppointment({
        ...newAppointment,
        result: 'termin_ausstehend'
      });
      setNewAppointment({
        customer_id: '',
        date: '',
        type: '',
        description: '',
        notes: '',
        team_member_id: ''
      });
    } else {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
          <Calendar className="h-8 w-8 mr-3 text-red-600" />
          Termin erstellen
        </h1>
        <p className="text-gray-600 mt-2">Erstellen Sie neue Termine für Ihre Kunden</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-left">Neuen Termin hinzufügen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select 
              value={newAppointment.customer_id} 
              onValueChange={(value) => setNewAppointment({...newAppointment, customer_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kunde auswählen *" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.contact}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
              placeholder="Datum *"
            />
            <Input
              placeholder="Termin-Typ *"
              value={newAppointment.type}
              onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})}
            />
            <Select 
              value={newAppointment.team_member_id} 
              onValueChange={(value) => setNewAppointment({...newAppointment, team_member_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Teammitglied zuweisen" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="sm:col-span-2">
              <Textarea
                placeholder="Beschreibung"
                value={newAppointment.description}
                onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                className="min-h-[80px]"
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                placeholder="Notizen"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={handleAddAppointment} className="flex-1 bg-red-600 hover:bg-red-700">
              <Save className="h-4 w-4 mr-2" />
              Termin erstellen
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setNewAppointment({
                customer_id: '',
                date: '',
                type: '',
                description: '',
                notes: '',
                team_member_id: ''
              })} 
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2 text-red-600" />
              Zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
