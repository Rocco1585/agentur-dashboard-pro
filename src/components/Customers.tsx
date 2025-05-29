
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users } from "lucide-react";
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { CustomerDetail } from "./CustomerDetail";
import { PipelineColumn } from "./PipelineColumn";
import { useCustomers } from "@/hooks/useSupabaseData";
import { toast } from "@/hooks/use-toast";

export function Customers() {
  const { customers, loading, updateCustomer, addCustomer } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    priority: 'Mittel',
    payment_status: 'Ausstehend',
    pipeline_stage: 'termin_ausstehend'
  });

  const pipelineStages = [
    { id: 'termin_ausstehend', name: 'Termin Ausstehend', color: 'bg-gray-500' },
    { id: 'termin_erschienen', name: 'Termin Erschienen', color: 'bg-blue-500' },
    { id: 'termin_abgeschlossen', name: 'Termin Abgeschlossen', color: 'bg-green-500' },
    { id: 'follow_up_kunde', name: 'Follow-up Kunde', color: 'bg-yellow-500' },
    { id: 'follow_up_wir', name: 'Follow-up Wir', color: 'bg-purple-500' },
    { id: 'verloren', name: 'Verloren', color: 'bg-red-500' },
  ];

  const getCustomersByStage = (stageId: string) => {
    return customers.filter(customer => customer.pipeline_stage === stageId);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStage = destination.droppableId;

    await updateCustomer(draggableId, { pipeline_stage: newStage });
  };

  const handleAddCustomer = async () => {
    if (newCustomer.name && newCustomer.contact && newCustomer.email) {
      await addCustomer(newCustomer);
      setNewCustomer({
        name: '',
        contact: '',
        email: '',
        phone: '',
        priority: 'Mittel',
        payment_status: 'Ausstehend',
        pipeline_stage: 'termin_ausstehend'
      });
      setShowNewCustomerDialog(false);
    }
  };

  if (selectedCustomer) {
    return (
      <CustomerDetail
        customer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
        onUpdate={(updatedCustomer) => {
          updateCustomer(updatedCustomer.id, updatedCustomer);
          setSelectedCustomer(updatedCustomer);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade Kunden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3" />
            Termin-Pipeline
          </h1>
          <p className="text-gray-600">Verwalten Sie Ihre Kunden per Drag & Drop in verschiedenen Phasen.</p>
        </div>
        <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Kunde
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Kunden hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Firmenname"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              />
              <Input
                placeholder="Ansprechpartner"
                value={newCustomer.contact}
                onChange={(e) => setNewCustomer({...newCustomer, contact: e.target.value})}
              />
              <Input
                placeholder="E-Mail"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              />
              <Input
                placeholder="Telefon"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              />
              <Select value={newCustomer.priority} onValueChange={(value) => setNewCustomer({...newCustomer, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorität" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoch">Hoch</SelectItem>
                  <SelectItem value="Mittel">Mittel</SelectItem>
                  <SelectItem value="Niedrig">Niedrig</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newCustomer.pipeline_stage} onValueChange={(value) => setNewCustomer({...newCustomer, pipeline_stage: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pipeline-Phase" />
                </SelectTrigger>
                <SelectContent>
                  {pipelineStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddCustomer} className="w-full">
                Kunde hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              title={stage.name}
              stageId={stage.id}
              customers={getCustomersByStage(stage.id)}
              color={stage.color}
              onCustomerClick={setSelectedCustomer}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
