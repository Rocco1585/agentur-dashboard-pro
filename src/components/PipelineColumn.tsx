
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, User, Clock } from "lucide-react";
import { Droppable, Draggable } from 'react-beautiful-dnd';

interface Appointment {
  id: string;
  date: string;
  time?: string;
  type: string;
  description?: string;
  result: string;
  notes?: string;
  customers?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    contact: string;
    priority: string;
    payment_status: string;
    satisfaction: number;
    booked_appointments: number;
    completed_appointments: number;
    pipeline_stage: string;
  };
  team_members?: {
    id: string;
    name: string;
    role: string;
  };
}

interface PipelineColumnProps {
  title: string;
  stageId: string;
  customers: Appointment[];
  color: string;
  onCustomerClick: (appointment: Appointment) => void;
}

export function PipelineColumn({ title, stageId, customers: appointments, color, onCustomerClick }: PipelineColumnProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-100 text-red-800';
      case 'Mittel': return 'bg-yellow-100 text-yellow-800';
      case 'Niedrig': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'termin_ausstehend': return 'bg-blue-100 text-blue-800';
      case 'termin_erschienen': return 'bg-yellow-100 text-yellow-800';
      case 'termin_abgeschlossen': return 'bg-green-100 text-green-800';
      case 'follow_up': return 'bg-purple-100 text-purple-800';
      case 'termin_abgesagt': return 'bg-red-100 text-red-800';
      case 'termin_verschoben': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 min-w-80">
      <Card className="h-full">
        <CardHeader className={`${color} text-white py-2`}>
          <CardTitle className="text-center text-xs font-medium">
            {title} ({appointments.length})
          </CardTitle>
        </CardHeader>
        <Droppable droppableId={stageId}>
          {(provided, snapshot) => (
            <CardContent
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-3 p-4 min-h-96 ${
                snapshot.isDraggingOver ? 'bg-blue-50' : ''
              }`}
            >
              {appointments.map((appointment, index) => (
                <Draggable key={appointment.id} draggableId={appointment.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                      }`}
                      onClick={() => onCustomerClick(appointment)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xs font-semibold text-gray-900 text-left">
                            {appointment.customers?.name || 'Unbekannter Kunde'}
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCustomerClick(appointment);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600 text-left">{appointment.type}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600 text-left">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(appointment.date).toLocaleDateString('de-DE')}
                            {appointment.time && ` um ${appointment.time}`}
                          </div>
                          <div className="flex items-center text-xs text-gray-600 text-left">
                            <User className="h-3 w-3 mr-1" />
                            {appointment.team_members?.name || 'Nicht zugewiesen'}
                          </div>
                          {appointment.customers && (
                            <div className="text-xs text-gray-600 text-left">
                              {appointment.customers.contact || appointment.customers.name}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {appointment.customers?.priority && (
                            <Badge className={getPriorityColor(appointment.customers.priority)}>
                              {appointment.customers.priority}
                            </Badge>
                          )}
                          <Badge className={getStatusColor(appointment.result)}>
                            {appointment.result.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>

                        {appointment.description && (
                          <div className="text-xs text-gray-600 mt-2 truncate text-left">
                            {appointment.description}
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div className="text-xs text-gray-500 mt-1 truncate text-left">
                            Notizen: {appointment.notes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </CardContent>
          )}
        </Droppable>
      </Card>
    </div>
  );
}
