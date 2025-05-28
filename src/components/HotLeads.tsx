
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flame, Plus, Calendar, MessageSquare, ArrowRight, User, GripVertical, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HotLeadsProps {
  onConvertToCustomer?: (lead: any) => void;
}

export function HotLeads({ onConvertToCustomer }: HotLeadsProps) {
  const [selectedPipeline, setSelectedPipeline] = useState('all');
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    communication: 'WhatsApp',
    stage: 'opening',
    potential: 'B Potenzial',
    notes: ''
  });
  
  const pipelineStages = [
    { id: 'opening', name: 'Opening', color: 'bg-blue-100 text-blue-800' },
    { id: 'setting', name: 'Setting', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'closing', name: 'Closing', color: 'bg-green-100 text-green-800' },
    { id: 'lost', name: 'Verloren', color: 'bg-red-100 text-red-800' },
  ];

  const [leads, setLeads] = useState([
    {
      id: 1,
      name: 'Maria Müller',
      email: 'maria@beispiel.de',
      phone: '+49 123 456789',
      nextMeeting: '16.01.2025, 14:00',
      stage: 'opening',
      potential: 'A Potenzial',
      communication: 'WhatsApp',
      lastContact: '14.01.2025',
      notes: 'Sehr interessiert an unserem Premium-Paket. Hat bereits Budget bestätigt.',
      meetingHistory: [
        { date: '10.01.2025', type: 'Erstgespräch', result: 'Positiv' },
        { date: '12.01.2025', type: 'Follow-up', result: 'Termin vereinbart' }
      ]
    },
    {
      id: 2,
      name: 'Peter Schmidt',
      email: 'peter@firma.com',
      phone: '+49 987 654321',
      nextMeeting: '17.01.2025, 10:30',
      stage: 'setting',
      potential: 'B Potenzial',
      communication: 'E-Mail',
      lastContact: '13.01.2025',
      notes: 'Benötigt noch Freigabe vom Geschäftsführer. Timeline bis Ende des Monats.',
      meetingHistory: [
        { date: '08.01.2025', type: 'Erstgespräch', result: 'Interesse gezeigt' },
        { date: '11.01.2025', type: 'Präsentation', result: 'Weitere Infos angefordert' }
      ]
    },
    {
      id: 3,
      name: 'Sandra Weber',
      email: 'sandra@startup.de',
      phone: '+49 555 123456',
      nextMeeting: '19.01.2025, 16:00',
      stage: 'closing',
      potential: 'A Potenzial',
      communication: 'WhatsApp',
      lastContact: '15.01.2025',
      notes: 'Bereit zum Abschluss. Wartet nur noch auf finale Vertragsdetails.',
      meetingHistory: [
        { date: '05.01.2025', type: 'Erstgespräch', result: 'Sehr interessiert' },
        { date: '09.01.2025', type: 'Angebot präsentiert', result: 'Positives Feedback' },
        { date: '13.01.2025', type: 'Verhandlung', result: 'Fast abgeschlossen' }
      ]
    }
  ]);

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData('text/plain', leadId.toString());
  };

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData('text/plain'));
    
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, stage: newStage } : lead
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const addLead = () => {
    if (newLead.name && newLead.email) {
      const lead = {
        id: Date.now(),
        ...newLead,
        phone: '',
        nextMeeting: '',
        lastContact: new Date().toLocaleDateString('de-DE'),
        meetingHistory: []
      };
      setLeads(prev => [...prev, lead]);
      setNewLead({
        name: '',
        email: '',
        communication: 'WhatsApp',
        stage: 'opening',
        potential: 'B Potenzial',
        notes: ''
      });
      setShowNewLeadDialog(false);
      toast({
        title: "Lead hinzugefügt",
        description: `${lead.name} wurde erfolgreich hinzugefügt.`,
      });
    }
  };

  const convertToCustomer = (lead: any) => {
    // Erstelle Kunde aus Lead-Daten
    const customer = {
      id: Date.now(),
      name: lead.name,
      contact: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      stage: 'preparation',
      priority: lead.potential.includes('A') ? 'A Kunde' : 'B Kunde',
      satisfaction: 5,
      nextAppointment: lead.nextMeeting || '',
      bookedAppointments: 0,
      completedAppointments: 0,
      paymentStatus: 'ausstehend'
    };

    // Callback aufrufen wenn verfügbar
    if (onConvertToCustomer) {
      onConvertToCustomer(customer);
    }

    // Lead aus Liste entfernen
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    
    toast({
      title: "Lead zu Kunde konvertiert",
      description: `${lead.name} wurde erfolgreich in die Kunden-Pipeline verschoben.`,
    });
  };

  const deleteLead = (leadId: number) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    toast({
      title: "Lead gelöscht",
      description: `${lead?.name} wurde erfolgreich gelöscht.`,
    });
  };

  const getStageInfo = (stageId: string) => {
    return pipelineStages.find(stage => stage.id === stageId) || pipelineStages[0];
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'A Potenzial': return 'bg-red-100 text-red-800';
      case 'B Potenzial': return 'bg-yellow-100 text-yellow-800';
      case 'C Potenzial': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageLeads = (stageId: string) => {
    return leads.filter(lead => lead.stage === stageId);
  };

  const filteredLeads = selectedPipeline === 'all' 
    ? leads 
    : leads.filter(lead => lead.stage === selectedPipeline);

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
              <Select value={newLead.communication} onValueChange={(value) => setNewLead({...newLead, communication: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Kommunikation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="E-Mail">E-Mail</SelectItem>
                  <SelectItem value="Telefon">Telefon</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newLead.potential} onValueChange={(value) => setNewLead({...newLead, potential: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Potenzial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A Potenzial">A Potenzial</SelectItem>
                  <SelectItem value="B Potenzial">B Potenzial</SelectItem>
                  <SelectItem value="C Potenzial">C Potenzial</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Notizen"
                value={newLead.notes}
                onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
              />
              <Button onClick={addLead} className="w-full">
                Lead hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter nach Pipeline:</label>
            <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Alle Phasen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Phasen</SelectItem>
                {pipelineStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drag & Drop Pipeline */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Lead Pipeline</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {pipelineStages.map((stage) => (
            <div 
              key={stage.id}
              className="bg-gray-50 rounded-lg p-4 min-h-[400px]"
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={handleDragOver}
            >
              <div className={`text-center p-2 rounded mb-4 ${stage.color}`}>
                <h3 className="font-medium text-sm">{stage.name}</h3>
                <span className="text-xs">({getStageLeads(stage.id).length})</span>
              </div>
              
              <div className="space-y-3">
                {getStageLeads(stage.id).map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="bg-white p-3 rounded border cursor-move hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{lead.name}</span>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLead(lead.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>{lead.email}</div>
                      {lead.nextMeeting && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {lead.nextMeeting}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge className={getPotentialColor(lead.potential)} variant="outline">
                          {lead.potential}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <MessageSquare className="h-2 w-2 mr-1" />
                          {lead.communication}
                        </Badge>
                      </div>
                      {stage.id === 'closing' && (
                        <Button 
                          size="sm" 
                          className="w-full mt-2 text-xs"
                          onClick={() => convertToCustomer(lead)}
                        >
                          Zu Kunden
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leads Grid - Fallback view */}
      {selectedPipeline !== 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLeads.map((lead) => {
            const stageInfo = getStageInfo(lead.stage);
            return (
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
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{lead.email}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Next Meeting */}
                  {lead.nextMeeting && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center text-sm text-blue-800">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">Nächstes Meeting: {lead.nextMeeting}</span>
                      </div>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={stageInfo.color}>
                      {stageInfo.name}
                    </Badge>
                    <Badge className={getPotentialColor(lead.potential)}>
                      {lead.potential}
                    </Badge>
                    <Badge variant="outline">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {lead.communication}
                    </Badge>
                  </div>

                  {/* Notes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notizen:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{lead.notes}</p>
                  </div>

                  {/* Meeting History */}
                  {lead.meetingHistory && lead.meetingHistory.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Meeting-Verlauf:</h4>
                      <div className="space-y-2">
                        {lead.meetingHistory.map((meeting, index) => (
                          <div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                            <span>{meeting.date} - {meeting.type}</span>
                            <span className="font-medium text-green-600">{meeting.result}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Contact */}
                  <div className="text-xs text-gray-500 border-t pt-2">
                    Letzter Kontakt: {lead.lastContact}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
