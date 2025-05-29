import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Mail, Phone, Flame, Edit, Save, X, Trash2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useHotLeads } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';

export function HotLeads() {
  const { hotLeads, loading, addHotLead, updateHotLead, deleteHotLead } = useHotLeads();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [newLead, setNewLead] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    priority: 'Hoch',
    source: '',
    notes: ''
  });

  const handleAddLead = async () => {
    if (newLead.name) {
      await addHotLead(newLead);
      setNewLead({ name: '', contact: '', email: '', phone: '', priority: 'Hoch', source: '', notes: '' });
      setShowAddForm(false);
    }
  };

  const handleUpdateLead = async (id: string, updates: any) => {
    await updateHotLead(id, updates);
    setEditingLead(null);
  };

  const moveToCustomers = async (lead: any) => {
    try {
      // Kunde in die customers Tabelle hinzufügen
      const { error: insertError } = await supabase
        .from('customers')
        .insert({
          name: lead.name,
          contact: lead.contact,
          email: lead.email,
          phone: lead.phone,
          priority: lead.priority,
          notes: lead.notes,
          payment_status: 'Ausstehend',
          pipeline_stage: 'termin_ausstehend',
          action_step: 'in_vorbereitung',
          is_active: true,
          satisfaction: 5,
          booked_appointments: 0,
          completed_appointments: 0
        });

      if (insertError) {
        throw insertError;
      }

      // Hot Lead löschen
      await deleteHotLead(lead.id);

      toast({
        title: "Erfolgreich verschoben",
        description: `${lead.name} wurde zu den Kunden hinzugefügt.`,
      });
    } catch (error) {
      console.error('Fehler beim Verschieben:', error);
      toast({
        title: "Fehler",
        description: "Beim Verschieben ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-4 min-h-screen">
        <div className="text-lg text-left">Lade Hot Leads...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 min-h-screen space-y-4">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-left min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-left truncate">Hot Leads</h1>
          <p className="text-gray-600 text-left mt-1">Verwalten Sie Ihre heißen Leads</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Hot Lead hinzufügen
        </Button>
      </div>

      {/* Add Hot Lead Form */}
      {showAddForm && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg text-left">Neuen Hot Lead hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Input
                  placeholder="Firmenname"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                />
                <Input
                  placeholder="Ansprechpartner"
                  value={newLead.contact}
                  onChange={(e) => setNewLead({...newLead, contact: e.target.value})}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                />
                <Input
                  placeholder="Telefon"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                />
                <Select value={newLead.priority} onValueChange={(value) => setNewLead({...newLead, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hoch">Hoch</SelectItem>
                    <SelectItem value="Mittel">Mittel</SelectItem>
                    <SelectItem value="Niedrig">Niedrig</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Quelle"
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                />
              </div>
              <Textarea
                placeholder="Notizen"
                value={newLead.notes}
                onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                className="min-h-[80px]"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleAddLead} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Abbrechen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hot Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {hotLeads.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-left py-12">
                <div className="flex flex-col items-center text-center">
                  <Flame className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Hot Leads</h3>
                  <p className="text-gray-600 mb-4">Fügen Sie Ihren ersten Hot Lead hinzu, um zu beginnen.</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Hot Lead hinzufügen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          hotLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-start justify-between gap-2">
                  <div className="flex items-center text-left min-w-0 flex-1">
                    <Flame className="h-5 w-5 mr-2 text-orange-600 flex-shrink-0" />
                    <span className="truncate text-left">{lead.name}</span>
                  </div>
                  <Badge 
                    className={`text-xs flex-shrink-0 ${
                      lead.priority === 'Hoch' ? 'bg-red-100 text-red-800' :
                      lead.priority === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {lead.priority}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {editingLead?.id === lead.id ? (
                  <div className="space-y-3 flex-1">
                    <Input
                      value={editingLead.name}
                      onChange={(e) => setEditingLead({...editingLead, name: e.target.value})}
                      placeholder="Firmenname"
                    />
                    <Input
                      value={editingLead.contact || ''}
                      onChange={(e) => setEditingLead({...editingLead, contact: e.target.value})}
                      placeholder="Ansprechpartner"
                    />
                    <Input
                      value={editingLead.email || ''}
                      onChange={(e) => setEditingLead({...editingLead, email: e.target.value})}
                      placeholder="Email"
                    />
                    <Input
                      value={editingLead.phone || ''}
                      onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})}
                      placeholder="Telefon"
                    />
                    <Select 
                      value={editingLead.priority} 
                      onValueChange={(value) => setEditingLead({...editingLead, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hoch">Hoch</SelectItem>
                        <SelectItem value="Mittel">Mittel</SelectItem>
                        <SelectItem value="Niedrig">Niedrig</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={editingLead.source || ''}
                      onChange={(e) => setEditingLead({...editingLead, source: e.target.value})}
                      placeholder="Quelle"
                    />
                    <Textarea
                      value={editingLead.notes || ''}
                      onChange={(e) => setEditingLead({...editingLead, notes: e.target.value})}
                      placeholder="Notizen"
                      className="min-h-[60px]"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateLead(lead.id, editingLead)}
                        className="flex-1"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Speichern
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingLead(null)}
                        className="flex-1"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 flex-1">
                      {lead.contact && (
                        <div className="flex items-center text-sm text-left">
                          <User className="h-4 w-4 mr-2 text-gray-600 flex-shrink-0" />
                          <span className="truncate text-left">{lead.contact}</span>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center text-sm text-left">
                          <Mail className="h-4 w-4 mr-2 text-gray-600 flex-shrink-0" />
                          <span className="truncate text-left">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center text-sm text-left">
                          <Phone className="h-4 w-4 mr-2 text-gray-600 flex-shrink-0" />
                          <span className="truncate text-left">{lead.phone}</span>
                        </div>
                      )}
                      {lead.source && (
                        <div className="text-sm text-gray-600 text-left">
                          <strong>Quelle:</strong> {lead.source}
                        </div>
                      )}
                      
                      {lead.notes && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-600 text-left line-clamp-3">{lead.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 pt-3 mt-auto">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLead(lead)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Bearbeiten</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteHotLead(lead.id)}
                          className="hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveToCustomers(lead)}
                        className="w-full hover:bg-green-50 hover:border-green-200"
                      >
                        <ArrowRight className="h-3 w-3 mr-2 text-green-600" />
                        Zu Kunde verschieben
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
