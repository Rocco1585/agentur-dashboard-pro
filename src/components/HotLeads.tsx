
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Plus, Calendar, MessageSquare, ArrowRight, User } from "lucide-react";

export function HotLeads() {
  const [selectedPipeline, setSelectedPipeline] = useState('all');
  
  const pipelineStages = [
    { id: 'opening', name: 'Opening', color: 'bg-blue-100 text-blue-800' },
    { id: 'setting', name: 'Setting', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'closing', name: 'Closing', color: 'bg-green-100 text-green-800' },
    { id: 'lost', name: 'Verloren', color: 'bg-red-100 text-red-800' },
  ];

  const leads = [
    {
      id: 1,
      name: 'Maria Müller',
      email: 'maria@beispiel.de',
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
  ];

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
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Neuer Lead
        </Button>
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

      {/* Leads Grid */}
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
                    <Button size="sm" variant="outline">
                      Zu Kunden
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{lead.email}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Next Meeting */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center text-sm text-blue-800">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">Nächstes Meeting: {lead.nextMeeting}</span>
                  </div>
                </div>

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

                {/* Last Contact */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  Letzter Kontakt: {lead.lastContact}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
