import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckSquare, Calendar, AlertCircle, Check, X, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTodos } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';

export function ToDos() {
  const { todos, loading, addTodo, updateTodo, deleteTodo } = useTodos();
  const { canCreateTodos, canViewTodos, canCompleteTodos } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Mittel'
  });

  if (!canViewTodos()) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">Keine Berechtigung</h3>
            <p className="text-gray-600 text-left">Sie haben keine Berechtigung, ToDos zu verwalten.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddTodo = async () => {
    if (newTodo.title) {
      await addTodo(newTodo);
      setNewTodo({ title: '', description: '', due_date: '', priority: 'Mittel' });
      setShowAddForm(false);
    } else {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (todo: any) => {
    if (canCompleteTodos()) {
      await updateTodo(todo.id, { completed: !todo.completed });
    } else {
      toast({
        title: "Keine Berechtigung",
        description: "Sie können keine ToDos bearbeiten.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (canCreateTodos()) {
      await deleteTodo(todoId);
    } else {
      toast({
        title: "Keine Berechtigung",
        description: "Sie können keine ToDos löschen.",
        variant: "destructive",
      });
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && todo.completed) ||
                         (filterStatus === 'pending' && !todo.completed);
    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const pendingCount = todos.filter(todo => !todo.completed).length;
  const overdueTodos = todos.filter(todo => 
    !todo.completed && todo.due_date && new Date(todo.due_date) < new Date()
  );

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="text-lg text-left">Lade ToDos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 text-left">ToDos</h1>
          <p className="text-gray-600 text-left">Verwalten Sie Ihre Aufgaben</p>
        </div>
        {canCreateTodos() && (
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2 text-white" />
            ToDo hinzufügen
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 text-left">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-left">
              <CheckSquare className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-2xl font-bold text-gray-700">{todos.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 text-left">Abgeschlossen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-left">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">{completedCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 text-left">Ausstehend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-left">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-blue-600">{pendingCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 text-left">Überfällig</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-left">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-2xl font-bold text-red-600">{overdueTodos.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Todo Form */}
      {showAddForm && canCreateTodos() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left">Neues ToDo hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                placeholder="Titel *"
                value={newTodo.title}
                onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
              />
              <Input
                type="date"
                value={newTodo.due_date}
                onChange={(e) => setNewTodo({...newTodo, due_date: e.target.value})}
              />
              <Select value={newTodo.priority} onValueChange={(value) => setNewTodo({...newTodo, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorität" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoch">Hoch</SelectItem>
                  <SelectItem value="Mittel">Mittel</SelectItem>
                  <SelectItem value="Niedrig">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Textarea
                placeholder="Beschreibung"
                value={newTodo.description}
                onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                className="min-h-[80px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button onClick={handleAddTodo} className="flex-1 bg-red-600 hover:bg-red-700">
                ToDo hinzufügen
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="pending">Ausstehend</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Priorität filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Prioritäten</SelectItem>
            <SelectItem value="Hoch">Hoch</SelectItem>
            <SelectItem value="Mittel">Mittel</SelectItem>
            <SelectItem value="Niedrig">Niedrig</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Todos List */}
      <div className="space-y-4">
        {filteredTodos.map((todo) => {
          const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;
          
          return (
            <Card key={todo.id} className={`transition-all ${todo.completed ? 'opacity-60' : ''} ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleComplete(todo)}
                    className="mt-1"
                    disabled={!canCompleteTodos()}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-left ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className={`text-sm mt-1 text-left ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                        {todo.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-left">
                      <Badge className={`text-xs ${
                        todo.priority === 'Hoch' ? 'bg-red-100 text-red-800' :
                        todo.priority === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {todo.priority}
                      </Badge>
                      {todo.due_date && (
                        <Badge variant="outline" className={`text-xs ${isOverdue ? 'border-red-500 text-red-700' : ''}`}>
                          {isOverdue && <AlertCircle className="h-3 w-3 mr-1 text-red-600" />}
                          {new Date(todo.due_date).toLocaleDateString('de-DE')}
                        </Badge>
                      )}
                      {todo.completed && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Erledigt
                        </Badge>
                      )}
                    </div>
                  </div>
                  {canCreateTodos() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTodos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2 text-left text-center">Keine ToDos gefunden</h3>
            <p className="text-gray-600 mb-4 text-left text-center">
              {todos.length === 0 
                ? "Fügen Sie Ihr erstes ToDo hinzu, um zu beginnen."
                : "Keine ToDos entsprechen Ihren Filterkriterien."
              }
            </p>
            {todos.length === 0 && canCreateTodos() && (
              <Button onClick={() => setShowAddForm(true)} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2 text-white" />
                Erstes ToDo hinzufügen
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
