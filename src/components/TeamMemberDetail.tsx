
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export interface TeamMemberDetailProps {
  member: any;
  onMemberUpdated: () => void;
}

export function TeamMemberDetail({ member, onMemberUpdated }: TeamMemberDetailProps) {
  const [formData, setFormData] = useState({
    name: member.name || '',
    email: member.email || '',
    phone: member.phone || '',
    role: member.role || '',
    user_role: member.user_role || 'member',
    performance: member.performance || 'Gut',
    payouts: member.payouts || 0,
    appointment_count: member.appointment_count || 0,
    is_active: member.is_active
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
    setLoading(true);

    try {
      const { error } = await supabase
        .from('team_members')
        .update(formData)
        .eq('id', member.id);

      if (error) throw error;

      toast({
        title: "Teammitglied aktualisiert",
        description: `${formData.name} wurde erfolgreich aktualisiert.`,
      });

      onMemberUpdated();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Fehler",
        description: "Teammitglied konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold">Teammitglied bearbeiten</h1>
          <p className="text-gray-600">Teammitglied-Details verwalten</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{member.name}</span>
            <div className="flex gap-2">
              <Badge className={member.user_role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                {member.user_role === 'admin' ? 'Admin' : 'Mitglied'}
              </Badge>
              <Badge className={member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {member.is_active ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Input
                placeholder="Telefon"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
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
              <Select value={formData.performance} onValueChange={(value) => setFormData({...formData, performance: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exzellent">Exzellent</SelectItem>
                  <SelectItem value="Sehr gut">Sehr gut</SelectItem>
                  <SelectItem value="Gut">Gut</SelectItem>
                  <SelectItem value="Verbesserungswürdig">Verbesserungswürdig</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Auszahlungen (€)"
                type="number"
                value={formData.payouts}
                onChange={(e) => setFormData({...formData, payouts: parseFloat(e.target.value) || 0})}
              />
            </div>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
