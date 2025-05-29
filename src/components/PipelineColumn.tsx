
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone, User } from "lucide-react";
import { Droppable, Draggable } from 'react-beautiful-dnd';

interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  priority: string;
  payment_status: string;
  satisfaction: number;
  booked_appointments: number;
  completed_appointments: number;
  pipeline_stage: string;
}

interface PipelineColumnProps {
  title: string;
  stageId: string;
  customers: Customer[];
  color: string;
  onCustomerClick: (customer: Customer) => void;
}

export function PipelineColumn({ title, stageId, customers, color, onCustomerClick }: PipelineColumnProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-100 text-red-800';
      case 'Mittel': return 'bg-yellow-100 text-yellow-800';
      case 'Niedrig': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Bezahlt': return 'bg-green-100 text-green-800';
      case 'Ausstehend': return 'bg-yellow-100 text-yellow-800';
      case 'Überfällig': return 'bg-red-100 text-red-800';
      case 'Raten': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 min-w-80">
      <Card className="h-full">
        <CardHeader className={`${color} text-white`}>
          <CardTitle className="text-center">
            {title} ({customers.length})
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
              {customers.map((customer, index) => (
                <Draggable key={customer.id} draggableId={customer.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                      }`}
                      onClick={() => onCustomerClick(customer)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-gray-900">
                            {customer.name}
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCustomerClick(customer);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{customer.contact}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <Mail className="h-3 w-3 mr-1" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.phone}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <Badge className={getPriorityColor(customer.priority)}>
                            {customer.priority}
                          </Badge>
                          <Badge className={getPaymentStatusColor(customer.payment_status)}>
                            {customer.payment_status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Termine:</span>
                            <div className="font-semibold">{customer.booked_appointments}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Zufriedenheit:</span>
                            <div className="font-semibold text-blue-600">{customer.satisfaction}/10</div>
                          </div>
                        </div>
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
