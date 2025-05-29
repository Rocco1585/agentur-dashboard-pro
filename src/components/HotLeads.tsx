
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flame, Plus, Calendar, MessageSquare, ArrowRight, User, GripVertical, Trash2 } from "lucide-react";
import { useHotLeads, useCustomers } from '@/hooks/useSupabaseData';

interface HotLeadsProps {
  onConvertToCustomer?: (lead: any) => void;
}

export function HotLeads({ onConvertToCustomer }: HotLeadsProps) {
  const { hotLeads, loading, addHotLead, updateHotLead, deleteHotLead } = useHotLeads();
  const { addCustomer } = useCustomers();
  const [selectedPipeline, setSelectedPipeline] = useState('all');
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'WhatsApp',
    priority: 'Hoch',
    notes: ''
  });
  
  const pipelineStages = [
    { id: 'opening', name: 'Opening', color: 'bg-blue-100 text-blue-800' },
    { id: 'setting', name: 'Setting', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'closing', name: 'Closing', color: 'bg-green-100 text-green-800' },
    { id: 'lost', name: 'Verloren', color: 'bg-red-100 text-red-800' },
  ];

  const handleAddLead = async () => {
    if (newLead.name && newLead.email) {
      await addHotLead(newLead);
      setNewLead({
        name: '',
        email: '',
        phone: '',
        source: 'WhatsApp',
        priority: 'Hoch',
        notes: ''
      });
      setShowNewLeadDialog(false);
    }
  };

  const convertToCustomer = async (lead: any) => {
    const customer = {
      name: lead.name,
      contact: lead.contact || lead.name,
      email: lead.email,
      phone: lead.phone || '',
      priority: lead.priority === 'Hoch' ? 'Hoch' : 'Mittel',
      payment_status: 'Ausstehend',
      pipeline_stage: 'termin_ausstehend'
    };

    await addCustomer(customer);
    await deleteHotLead(lead.id);
  };

  const handleDeleteLead = async (leadId: string) => {
    await deleteHotLead(leadId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-100 text-red-800';
      case 'Mittel': return 'bg-yellow-100 text-yellow-800';
      case 'Niedrig': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = selectedPipeline === 'all' 
    ? hotLeads 
    : hotLeads.filter(lead => lead.stage === selectedPipeline);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade Hot Leads...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Flame className="h-8 w-8 mr-3 text-orange-500" />
            Hot Leads
          </h1>
          <p className="text-gray-600">Verwalten Sie Ihre heißesten Verkaufschancen.</p>
        </div>
        <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Lead hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                value={newLead.name}
                onChange={(e) => setNewLead({...newLead, name: e.target.value})}
              />
              <Input
                placeholder="E-Mail"
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({...newLead, email: e.target.value})}
              />
              <Input
                placeholder="Telefon"
                value={newLead.phone}
                onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
              />
              <Select value={newLead.source} onValueChange={(value) => setNewLead({...newLead, source: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Quelle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="E-Mail">E-Mail</SelectItem>
                  <SelectItem value="Telefon">Telefon</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newLead.priority} onValueChange={(value) => setNewLead({...newLead, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorität" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoch">Hoch</SelectItem>
                  <SelectItem value="Mittel">Mittel</SelectItem>
                  <SelectItem value="Niedrig">Niedrig</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Notizen"
                value={newLead.notes}
                onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
              />
              <Button onClick={handleAddLead} className="w-full">
                Lead hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {hotLeads.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Keine Hot Leads vorhanden</p>
          </div>
        ) : (
          hotLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    {lead.name}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => convertToCustomer(lead)}
                    >
                      Zu Kunden
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLead(lead.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{lead.email}</p>
                {lead.phone && <p className="text-sm text-gray-600">{lead.phone}</p>}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getPriorityColor(lead.priority)}>
                    {lead.priority}
                  </Badge>
                  {lead.source && (
                    <Badge variant="outline">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {lead.source}
                    </Badge>
                  )}
                </div>

                {/* Notes */}
                {lead.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notizen:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{lead.notes}</p>
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  Erstellt: {new Date(lead.created_at).toLocaleDateString('de-DE')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
