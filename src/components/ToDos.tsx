
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, CheckCircle, Clock, Trash2, Edit, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTodos } from '@/hooks/useSupabaseData';

export function ToDos() {
  const { todos, loading, addTodo, updateTodo, deleteTodo } = useTodos();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'Mittel',
    due_date: ''
  });

  const handleAddTodo = async () => {
    if (newTodo.title) {
      await addTodo(newTodo);
      setNewTodo({ title: '', description: '', priority: 'Mittel', due_date: '' });
      setShowAddForm(false);
    }
  };

  const handleUpdateTodo = async (id: string, updates: any) => {
    await updateTodo(id, updates);
    setEditingTodo(null);
  };

  const handleToggleComplete = async (todo: any) => {
    await updateTodo(todo.id, { completed: !todo.completed });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Kein Datum';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const isPastDue = (dateString: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade ToDos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">ToDos</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Aufgaben</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          ToDo hinzufügen
        </Button>
      </div>

      {/* Add ToDo Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Neues ToDo hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Titel"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                />
                <Input
                  type="date"
                  value={newTodo.due_date}
                  onChange={(e) => setNewTodo({...newTodo, due_date: e.target.value})}
                />
              </div>
              <Textarea
                placeholder="Beschreibung"
                value={newTodo.description}
                onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                className="min-h-[80px]"
              />
              <Select value={newTodo.priority} onValueChange={(value) => setNewTodo({...newTodo, priority: value})}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoch">Hoch</SelectItem>
                  <SelectItem value="Mittel">Mittel</SelectItem>
                  <SelectItem value="Niedrig">Niedrig</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleAddTodo} className="flex-1">
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

      {/* ToDos List */}
      <div className="space-y-4">
        {todos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine ToDos</h3>
              <p className="text-gray-600 mb-4">Fügen Sie Ihr erstes ToDo hinzu, um zu beginnen.</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                ToDo hinzufügen
              </Button>
            </CardContent>
          </Card>
        ) : (
          todos.map((todo) => (
            <Card key={todo.id} className={`${todo.completed ? 'opacity-60' : ''} hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                {editingTodo?.id === todo.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingTodo.title}
                      onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
                    />
                    <Textarea
                      value={editingTodo.description || ''}
                      onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
                      className="min-h-[80px]"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        type="date"
                        value={editingTodo.due_date || ''}
                        onChange={(e) => setEditingTodo({...editingTodo, due_date: e.target.value})}
                      />
                      <Select 
                        value={editingTodo.priority} 
                        onValueChange={(value) => setEditingTodo({...editingTodo, priority: value})}
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
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => handleUpdateTodo(todo.id, editingTodo)} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Speichern
                      </Button>
                      <Button variant="outline" onClick={() => setEditingTodo(null)} className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo)}
                      className="mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium ${todo.completed ? 'line-through' : ''}`}>
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className={`text-sm text-gray-600 mt-1 ${todo.completed ? 'line-through' : ''}`}>
                              {todo.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span className={isPastDue(todo.due_date) && !todo.completed ? 'text-red-600 font-medium' : ''}>
                                {formatDate(todo.due_date)}
                              </span>
                            </div>
                            <Badge 
                              className={`text-xs ${
                                todo.priority === 'Hoch' ? 'bg-red-100 text-red-800' :
                                todo.priority === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}
                            >
                              {todo.priority}
                            </Badge>
                            {todo.completed && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Erledigt
                              </Badge>
                            )}
                            {isPastDue(todo.due_date) && !todo.completed && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Überfällig
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTodo(todo)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTodo(todo.id)}
                            className="h-8 w-8 p-0 hover:bg-red-100"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
