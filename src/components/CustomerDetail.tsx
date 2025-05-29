
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CustomerDetailProps {
  customer: any;
  onCustomerUpdated: () => void;
}

export function CustomerDetail({ customer, onCustomerUpdated }: CustomerDetailProps) {
  const { canEditCustomers } = useAuth();
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    contact: customer.contact || '',
    priority: customer.priority || 'Mittel',
    payment_status: customer.payment_status || 'Ausstehend',
    satisfaction: customer.satisfaction || 5,
    booked_appointments: customer.booked_appointments || 0,
    is_active: customer.is_active
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEditCustomers()) {
      toast({
        title: "Keine Berechtigung",
        description: "Sie haben keine Berechtigung, Kunden zu bearbeiten.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', customer.id);

      if (error) throw error;

      toast({
        title: "Kunde aktualisiert",
        description: `${formData.name} wurde erfolgreich aktualisiert.`,
      });

      onCustomerUpdated();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Fehler",
        description: "Kunde konnte nicht aktualisiert werden.",
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
          <h1 className="text-2xl font-bold">
            {canEditCustomers() ? 'Kunde bearbeiten' : 'Kundendetails'}
          </h1>
          <p className="text-gray-600">
            {canEditCustomers() ? 'Kundendetails verwalten' : 'Kundeninformationen anzeigen'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{customer.name}</span>
            <Badge className={customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {customer.is_active ? 'Aktiv' : 'Inaktiv'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!canEditCustomers()}
              />
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!canEditCustomers()}
              />
              <Input
                placeholder="Telefon"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!canEditCustomers()}
              />
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({...formData, priority: value})}
                disabled={!canEditCustomers()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priorität" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoch">Hoch</SelectItem>
                  <SelectItem value="Mittel">Mittel</SelectItem>
                  <SelectItem value="Niedrig">Niedrig</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={formData.payment_status} 
                onValueChange={(value) => setFormData({...formData, payment_status: value})}
                disabled={!canEditCustomers()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zahlungsstatus" />
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
                disabled={!canEditCustomers()}
              />
            </div>
            <Textarea
              placeholder="Kontaktinformationen / Notizen"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              rows={4}
              disabled={!canEditCustomers()}
            />
            {canEditCustomers() && (
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
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
