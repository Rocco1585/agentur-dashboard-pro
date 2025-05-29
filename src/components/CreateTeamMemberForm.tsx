
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface CreateTeamMemberFormProps {
  onClose: () => void;
  onMemberCreated: () => void;
}

export function CreateTeamMemberForm({ onClose, onMemberCreated }: CreateTeamMemberFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    user_role: 'member' as 'admin' | 'member',
    role: '',
    phone: '',
    performance: 'Gut',
    payouts: 0,
    appointment_count: 0
  });
  const [loading, setLoading] = useState(false);

  const positions = [
    'Einlernphase',
    'Opening (KAQ) B2B',
    'Opening (Chat DMS) b2b',
    'Setting b2b',
    'Closing b2b',
    'TikTok Poster b2c',
    'TikTok Manager b2c',
    'Setter b2c',
    'Closer b2c',
    'Manager b2b',
    'Inhaber'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          user_role: formData.user_role,
          role: formData.role,
          phone: formData.phone,
          performance: formData.performance,
          payouts: formData.payouts,
          appointment_count: formData.appointment_count,
          is_active: true,
          active_since: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Teammitglied erstellt",
        description: `${formData.name} wurde erfolgreich erstellt.`,
      });

      onMemberCreated();
      onClose();
    } catch (error) {
      console.error('Error creating team member:', error);
      toast({
        title: "Fehler",
        description: "Teammitglied konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Neues Teammitglied erstellen</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input
              placeholder="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input
              placeholder="Passwort *"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <Input
              placeholder="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <Select value={formData.user_role} onValueChange={(value: 'admin' | 'member') => setFormData({...formData, user_role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Benutzerrolle auswählen *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Mitglied</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Position auswählen" />
              </SelectTrigger>
              <SelectContent>
                {positions.map(position => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Erstelle...' : 'Teammitglied erstellen'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
