
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, CheckCircle, X, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function ToDos() {
  const [todos, setTodos] = useState([
    { 
      id: 1, 
      task: 'Follow-up mit ABC GmbH', 
      assignee: 'Max Mustermann', 
      dueDate: '2025-01-28', 
      priority: 'hoch', 
      status: 'offen',
      description: 'Nachfassen bezüglich des neuen Projekts'
    },
    { 
      id: 2, 
      task: 'Angebot für XYZ Corp erstellen', 
      assignee: 'Lisa Schmidt', 
      dueDate: '2025-01-29', 
      priority: 'mittel', 
      status: 'in arbeit',
      description: 'Detailliertes Angebot für Webdesign-Projekt'
    },
    { 
      id: 3, 
      task: 'Vertrag mit DEF AG prüfen', 
      assignee: 'Tom Weber', 
      dueDate: '2025-01-30', 
      priority: 'niedrig', 
      status: 'erledigt',
      description: 'Rechtliche Prüfung des Vertrags'
    },
  ]);

  const [newTodo, setNewTodo] = useState({
    task: '',
    assignee: '',
    dueDate: '',
    priority: 'mittel',
    description: ''
  });

  const [editingTodo, setEditingTodo] = useState<number | null>(null);

  const teamMembers = [
    'Max Mustermann',
    'Lisa Schmidt', 
    'Tom Weber',
    'Anna Müller',
    'Peter Schmidt'
  ];

  const priorities = ['niedrig', 'mittel', 'hoch'];
  const statuses = ['offen', 'in arbeit', 'erledigt'];

  const addTodo = () => {
    if (newTodo.task && newTodo.assignee) {
      const todo = {
        id: Date.now(),
        ...newTodo,
        status: 'offen',
        dueDate: newTodo.dueDate || new Date().toISOString().slice(0, 10)
      };
      setTodos(prev => [...prev, todo]);
      toast({
        title: "ToDo hinzugefügt",
        description: `${newTodo.task} für ${newTodo.assignee}`,
      });
      setNewTodo({ task: '', assignee: '', dueDate: '', priority: 'mittel', description: '' });
    }
  };

  const updateTodoStatus = (id: number, status: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, status } : todo
    ));
    toast({
      title: "Status aktualisiert",
      description: `ToDo Status auf "${status}" geändert`,
    });
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    toast({
      title: "ToDo gelöscht",
      description: "ToDo wurde erfolgreich entfernt",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hoch': return 'bg-red-100 text-red-800';
      case 'mittel': return 'bg-yellow-100 text-yellow-800';
      case 'niedrig': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'erledigt': return 'bg-green-100 text-green-800';
      case 'in arbeit': return 'bg-blue-100 text-blue-800';
      case 'offen': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filterTodosByStatus = (status: string) => {
    return todos.filter(todo => todo.status === status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ToDos</h1>
        <p className="text-gray-600">Verwalten Sie Aufgaben für Ihr Team.</p>
      </div>

      {/* Neues ToDo hinzufügen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-blue-600" />
            Neues ToDo hinzufügen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="task">Aufgabe</Label>
              <Input
                id="task"
                placeholder="z.B. Follow-up mit Kunde"
                value={newTodo.task}
                onChange={(e) => setNewTodo({...newTodo, task: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="assignee">Zugewiesen an</Label>
              <Select value={newTodo.assignee} onValueChange={(value) => setNewTodo({...newTodo, assignee: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Teammitglied auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member} value={member}>{member}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
              <Input
                id="dueDate"
                type="date"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priorität</Label>
              <Select value={newTodo.priority} onValueChange={(value) => setNewTodo({...newTodo, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Zusätzliche Details..."
                value={newTodo.description}
                onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                className="min-h-[60px]"
              />
            </div>
          </div>
          <Button onClick={addTodo} className="w-full md:w-auto">
            ToDo hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* ToDo Listen nach Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Offene ToDos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">
              Offen ({filterTodosByStatus('offen').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filterTodosByStatus('offen').map(todo => (
                <div key={todo.id} className="p-3 bg-orange-50 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{todo.task}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {todo.assignee}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(todo.dueDate).toLocaleDateString('de-DE')}
                    </div>
                    {todo.description && (
                      <p className="text-gray-600 mt-1">{todo.description}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Badge className={getPriorityColor(todo.priority)}>
                      {todo.priority}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTodoStatus(todo.id, 'in arbeit')}
                      className="text-xs"
                    >
                      Starten
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* In Arbeit ToDos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">
              In Arbeit ({filterTodosByStatus('in arbeit').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filterTodosByStatus('in arbeit').map(todo => (
                <div key={todo.id} className="p-3 bg-blue-50 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{todo.task}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {todo.assignee}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(todo.dueDate).toLocaleDateString('de-DE')}
                    </div>
                    {todo.description && (
                      <p className="text-gray-600 mt-1">{todo.description}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Badge className={getPriorityColor(todo.priority)}>
                      {todo.priority}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTodoStatus(todo.id, 'erledigt')}
                      className="text-xs"
                    >
                      Erledigen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Erledigte ToDos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              Erledigt ({filterTodosByStatus('erledigt').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filterTodosByStatus('erledigt').map(todo => (
                <div key={todo.id} className="p-3 bg-green-50 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm line-through text-gray-500">{todo.task}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {todo.assignee}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(todo.dueDate).toLocaleDateString('de-DE')}
                    </div>
                    {todo.description && (
                      <p className="text-gray-500 mt-1">{todo.description}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      erledigt
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTodoStatus(todo.id, 'offen')}
                      className="text-xs"
                    >
                      Wiedereröffnen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>ToDo Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{todos.length}</div>
              <div className="text-sm text-gray-600">Gesamt</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{filterTodosByStatus('offen').length}</div>
              <div className="text-sm text-gray-600">Offen</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{filterTodosByStatus('in arbeit').length}</div>
              <div className="text-sm text-gray-600">In Arbeit</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{filterTodosByStatus('erledigt').length}</div>
              <div className="text-sm text-gray-600">Erledigt</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
