
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface CreateCustomerFormProps {
  onClose: () => void;
  onCustomerCreated: () => void;
}

export function CreateCustomerForm({ onClose, onCustomerCreated }: CreateCustomerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contact: '',
    priority: 'Mittel',
    payment_status: 'Ausstehend',
    satisfaction: 5
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie mindestens einen Namen an.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('customers')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          contact: formData.contact,
          priority: formData.priority,
          payment_status: formData.payment_status,
          satisfaction: formData.satisfaction,
          purchased_appointments: 0,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Kunde erstellt",
        description: `${formData.name} wurde erfolgreich erstellt.`,
      });

      onCustomerCreated();
      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Fehler",
        description: "Kunde konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Neuen Kunden erstellen</CardTitle>
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
            <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Priorität auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hoch">Hoch</SelectItem>
                <SelectItem value="Mittel">Mittel</SelectItem>
                <SelectItem value="Niedrig">Niedrig</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Zahlungsstatus auswählen" />
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
            />
          </div>
          <Textarea
            placeholder="Kontaktinformationen / Notizen"
            value={formData.contact}
            onChange={(e) => setFormData({...formData, contact: e.target.value})}
            rows={3}
          />
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Erstelle...' : 'Kunde erstellen'}
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
