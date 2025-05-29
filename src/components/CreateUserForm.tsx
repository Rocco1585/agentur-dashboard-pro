
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface CreateUserFormProps {
  onClose: () => void;
  onUserCreated: () => void;
}

export function CreateUserForm({ onClose, onUserCreated }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    user_role: 'member' as 'admin' | 'member' | 'kunde',
    role: '',
    phone: '',
    customer_dashboard_name: '',
    customer_id: ''
  });
  const [customers, setCustomers] = useState<any[]>([]);
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

  useEffect(() => {
    if (formData.user_role === 'kunde') {
      fetchCustomers();
    }
  }, [formData.user_role]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
      return;
    }

    if (formData.user_role === 'kunde' && (!formData.customer_dashboard_name || !formData.customer_id)) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Dashboard-Namen und wählen Sie einen Kunden aus.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        user_role: formData.user_role,
        role: formData.role,
        phone: formData.phone,
        is_active: true,
        ...(formData.user_role === 'kunde' && { 
          customer_dashboard_name: formData.customer_dashboard_name,
          // Store customer_id reference for linking
        })
      };

      const { error } = await supabase
        .from('team_members')
        .insert(userData);

      if (error) throw error;

      toast({
        title: "Benutzer erstellt",
        description: `${formData.name} wurde erfolgreich erstellt.`,
        className: "text-left bg-yellow-100 border-yellow-300",
      });

      onUserCreated();
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht erstellt werden.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-left">Neuen Benutzer erstellen</CardTitle>
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
            <Select value={formData.user_role} onValueChange={(value: 'admin' | 'member' | 'kunde') => setFormData({...formData, user_role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Benutzerrolle auswählen *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Mitglied</SelectItem>
                <SelectItem value="kunde">Kunde</SelectItem>
              </SelectContent>
            </Select>
            {formData.user_role !== 'kunde' && (
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
            )}
            {formData.user_role === 'kunde' && (
              <>
                <Input
                  placeholder="Dashboard-Name für Kunde *"
                  value={formData.customer_dashboard_name}
                  onChange={(e) => setFormData({...formData, customer_dashboard_name: e.target.value})}
                  required
                />
                <Select value={formData.customer_id} onValueChange={(value) => setFormData({...formData, customer_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zugehörigen Kunden auswählen *" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Erstelle...' : 'Benutzer erstellen'}
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
