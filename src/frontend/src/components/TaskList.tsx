import { useState } from 'react';
import { useGetUserTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTaskCompletion, useGetUserClients } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MoreVertical, Pencil, Trash2, Filter, List, LayoutGrid, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Task, Priority } from '../backend';
import KanbanBoard from './KanbanBoard';

export default function TaskList() {
  const { data: tasks = [], isLoading } = useGetUserTasks();
  const { data: clients = [] } = useGetUserClients();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleCompletion = useToggleTaskCompletion();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as Priority,
    clientId: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium' as Priority,
      clientId: '',
    });
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const dueDate = BigInt(new Date(formData.dueDate).getTime() * 1000000);

      if (editingTask) {
        await updateTask.mutateAsync({
          taskId: editingTask.id,
          title: formData.title,
          description: formData.description,
          dueDate,
          priority: formData.priority,
          completed: editingTask.completed,
          clientId: formData.clientId || null,
        });
        toast.success('Task updated successfully');
      } else {
        const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await createTask.mutateAsync({
          id,
          title: formData.title,
          description: formData.description,
          dueDate,
          priority: formData.priority,
          clientId: formData.clientId || null,
        });
        toast.success('Task created successfully');
      }

      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
      console.error(error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: format(Number(task.dueDate) / 1000000, "yyyy-MM-dd'T'HH:mm"),
      priority: task.priority,
      clientId: task.clientId || '',
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
      console.error(error);
    }
  };

  const handleToggle = async (taskId: string) => {
    try {
      await toggleCompletion.mutateAsync(taskId);
    } catch (error) {
      toast.error('Failed to update task');
      console.error(error);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    if (filterStatus === 'active' && task.completed) return false;
    return true;
  });

  // Sort tasks by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return Number(a.dueDate) - Number(b.dueDate);
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return null;
    const client = clients.find(c => c.id === clientId);
    return client?.name;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Tasks</h2>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'kanban')} className="w-auto">
            <TabsList className="bg-card/50 backdrop-blur-sm border border-primary/15">
              <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-primary/20">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2 data-[state=active]:bg-primary/20">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-summer transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-summer-lg">
              <DialogHeader>
                <DialogTitle className="text-primary">{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Update task details' : 'Add a new task to your list'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Task title"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Task description"
                    rows={3}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                  >
                    <SelectTrigger className="border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Client (Optional)</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No client</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createTask.isPending || updateTask.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {(createTask.isPending || updateTask.isPending) ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="border-primary/20 bg-primary/10 hover:shadow-summer transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-primary">Progress Overview</CardTitle>
          <CardDescription>
            {completedCount} of {tasks.length} tasks completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="h-2 bg-primary/20" />
        </CardContent>
      </Card>

      {viewMode === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] border-primary/20 bg-card/50">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[150px] border-primary/20 bg-card/50">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Task List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : sortedTasks.length === 0 ? (
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No tasks found. Create your first task to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task) => {
                const clientName = getClientName(task.clientId);
                return (
                  <Card key={task.id} className={`border-primary/20 bg-card/50 backdrop-blur-sm hover:shadow-summer transition-all duration-300 ${task.completed ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggle(task.id)}
                          className="mt-1 border-primary data-[state=checked]:bg-primary"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`font-semibold ${task.completed ? 'line-through' : ''}`}>
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(task.priority)} className="shadow-sm">
                                {task.priority}
                              </Badge>
                              {clientName && (
                                <Badge variant="outline" className="bg-summer-seafoam/10 border-summer-seafoam/30 text-summer-seafoam gap-1">
                                  <User className="h-3 w-3" />
                                  {clientName}
                                </Badge>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/15">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-sm">
                                  <DropdownMenuItem onClick={() => handleEdit(task)} className="hover:bg-primary/15">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(task.id)}
                                    className="text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Due: {format(Number(task.dueDate) / 1000000, 'PPp')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {viewMode === 'kanban' && (
        <KanbanBoard onEditTask={handleEdit} />
      )}
    </div>
  );
}
