
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, ArrowLeft, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function CreateAppointmentPage() {
  const { user, logAuditEvent } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    team_member_id: '',
    date: '',
    time: '',
    type: '',
    description: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
    fetchTeamMembers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name, role')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.date || !formData.type) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        customer_id: formData.customer_id,
        team_member_id: formData.team_member_id || null,
        date: formData.date,
        time: formData.time || null,
        type: formData.type,
        description: formData.description || null,
        notes: formData.notes || null,
        result: 'termin_ausstehend'
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) throw error;

      await logAuditEvent('INSERT', 'appointments', data.id, null, appointmentData);

      toast({
        title: "Termin erstellt",
        description: "Der Termin wurde erfolgreich erstellt.",
      });

      navigate('/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/appointments')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <div className="text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Neuen Termin erstellen</h1>
            <p className="text-gray-600">Legen Sie einen neuen Termin für einen Kunden an</p>
          </div>
        </div>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-left">
              <CalendarIcon className="h-5 w-5 text-red-600" />
              Termindetails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 text-left block">
                    Kunde *
                  </label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({...formData, customer_id: value})}
                  >
                    <SelectTrigger className="text-left">
                      <SelectValue placeholder="Kunde auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.filter(customer => customer.id && customer.name).map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 text-left block">
                    Teammitglied
                  </label>
                  <Select
                    value={formData.team_member_id}
                    onValueChange={(value) => setFormData({...formData, team_member_id: value})}
                  >
                    <SelectTrigger className="text-left">
                      <SelectValue placeholder="Teammitglied auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.filter(member => member.id && member.name).map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 text-left block">
                    Datum *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="text-left"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 text-left block">
                    Uhrzeit
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="text-left"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 text-left block">
                    Termintyp *
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger className="text-left">
                      <SelectValue placeholder="Termintyp auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beratung">Beratung</SelectItem>
                      <SelectItem value="Behandlung">Behandlung</SelectItem>
                      <SelectItem value="Nachkontrolle">Nachkontrolle</SelectItem>
                      <SelectItem value="Ersttermin">Ersttermin</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 text-left block">
                    Beschreibung
                  </label>
                  <Textarea
                    placeholder="Beschreibung des Termins..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="text-left"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 text-left block">
                    Notizen
                  </label>
                  <Textarea
                    placeholder="Zusätzliche Notizen..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="text-left"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Erstelle...' : 'Termin erstellen'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/appointments')}
                  className="flex-1 sm:flex-none"
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
