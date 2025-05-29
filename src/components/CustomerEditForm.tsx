
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X } from "lucide-react";

interface CustomerEditFormProps {
  customer: any;
  onSave: (customer: any) => void;
  onCancel: () => void;
}

export function CustomerEditForm({ customer, onSave, onCancel }: CustomerEditFormProps) {
  const [editedCustomer, setEditedCustomer] = useState(customer);

  const actionStepOptions = [
    { value: 'in_vorbereitung', label: 'In Vorbereitung' },
    { value: 'testphase_aktiv', label: 'Testphase aktiv' },
    { value: 'upsell_bevorstehend', label: 'Upsell bevorstehend' },
    { value: 'bestandskunde', label: 'Bestandskunde' },
    { value: 'pausiert', label: 'Pausiert' },
    { value: 'abgeschlossen', label: 'Abgeschlossen' }
  ];

  const handleSave = () => {
    onSave(editedCustomer);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kunde bearbeiten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Firmenname"
            value={editedCustomer.name}
            onChange={(e) => setEditedCustomer({...editedCustomer, name: e.target.value})}
          />
          <Input
            placeholder="Ansprechpartner"
            value={editedCustomer.contact || ''}
            onChange={(e) => setEditedCustomer({...editedCustomer, contact: e.target.value})}
          />
          <Input
            placeholder="E-Mail"
            type="email"
            value={editedCustomer.email || ''}
            onChange={(e) => setEditedCustomer({...editedCustomer, email: e.target.value})}
          />
          <Input
            placeholder="Telefon"
            value={editedCustomer.phone || ''}
            onChange={(e) => setEditedCustomer({...editedCustomer, phone: e.target.value})}
          />
          <Select 
            value={editedCustomer.priority} 
            onValueChange={(value) => setEditedCustomer({...editedCustomer, priority: value})}
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
            value={editedCustomer.payment_status} 
            onValueChange={(value) => setEditedCustomer({...editedCustomer, payment_status: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Zahlungsstatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bezahlt">Bezahlt</SelectItem>
              <SelectItem value="Ausstehend">Ausstehend</SelectItem>
              <SelectItem value="Überfällig">Überfällig</SelectItem>
              <SelectItem value="Raten">Raten</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Action Step</label>
            <Select 
              value={editedCustomer.action_step || 'in_vorbereitung'} 
              onValueChange={(value) => setEditedCustomer({...editedCustomer, action_step: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Action Step" />
              </SelectTrigger>
              <SelectContent>
                {actionStepOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Aktiv</label>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={editedCustomer.is_active || false}
                onCheckedChange={(checked) => setEditedCustomer({...editedCustomer, is_active: checked})}
              />
              <span className="text-sm">{editedCustomer.is_active ? 'Aktiv' : 'Inaktiv'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
