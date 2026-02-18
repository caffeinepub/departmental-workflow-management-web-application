import { useState, useEffect } from 'react';
import { useGetUserTasks, useUpdateTask, useToggleTaskCompletion, useDeleteTask, useGetKanbanBoard, useSaveKanbanBoard } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Task, Priority, KanbanBoard as KanbanBoardType } from '../backend';

type TaskStatus = 'todo' | 'inProgress' | 'completed';

interface KanbanBoardProps {
  onEditTask: (task: Task) => void;
}

export default function KanbanBoard({ onEditTask }: KanbanBoardProps) {
  const { data: tasks = [], isLoading: tasksLoading } = useGetUserTasks();
  const { data: kanbanBoard, isLoading: kanbanLoading } = useGetKanbanBoard();
  const saveKanbanBoard = useSaveKanbanBoard();
  const updateTask = useUpdateTask();
  const toggleCompletion = useToggleTaskCompletion();
  const deleteTask = useDeleteTask();

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [localBoard, setLocalBoard] = useState<KanbanBoardType | null>(null);

  // Initialize or sync Kanban board with tasks
  useEffect(() => {
    if (!kanbanBoard || tasksLoading) return;

    const taskIds = new Set(tasks.map(t => t.id));
    const boardTaskIds = new Set<string>();
    
    kanbanBoard.columns.forEach(col => {
      col.taskOrder.forEach(id => boardTaskIds.add(id));
    });

    // Check if we need to add new tasks or remove deleted ones
    const newTaskIds = [...taskIds].filter(id => !boardTaskIds.has(id));
    const removedTaskIds = [...boardTaskIds].filter(id => !taskIds.has(id));

    if (newTaskIds.length > 0 || removedTaskIds.length > 0 || kanbanBoard.columns.length === 0) {
      // Initialize or update board structure
      const updatedColumns = [
        { name: 'To Do', taskOrder: [] as string[] },
        { name: 'In Progress', taskOrder: [] as string[] },
        { name: 'Completed', taskOrder: [] as string[] },
      ];

      // Preserve existing task positions
      kanbanBoard.columns.forEach(col => {
        const targetCol = updatedColumns.find(c => c.name === col.name);
        if (targetCol) {
          targetCol.taskOrder = col.taskOrder.filter(id => taskIds.has(id));
        }
      });

      // Add new tasks to appropriate columns based on their status
      newTaskIds.forEach(taskId => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (task.completed) {
          updatedColumns[2].taskOrder.push(taskId);
        } else {
          updatedColumns[0].taskOrder.push(taskId);
        }
      });

      const newBoard: KanbanBoardType = {
        columns: updatedColumns,
        layout: ['To Do', 'In Progress', 'Completed'],
      };

      setLocalBoard(newBoard);
      saveKanbanBoard.mutate(newBoard);
    } else {
      setLocalBoard(kanbanBoard);
    }
  }, [tasks, kanbanBoard, tasksLoading]);

  const getTasksByColumn = (columnName: string): Task[] => {
    if (!localBoard) return [];
    
    const column = localBoard.columns.find(c => c.name === columnName);
    if (!column) return [];

    return column.taskOrder
      .map(taskId => tasks.find(t => t.id === taskId))
      .filter((t): t is Task => t !== undefined);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnName: string) => {
    e.preventDefault();
    const statusMap: Record<string, TaskStatus> = {
      'To Do': 'todo',
      'In Progress': 'inProgress',
      'Completed': 'completed',
    };
    setDragOverColumn(statusMap[columnName] || null);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumnName: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTask || !localBoard) return;

    // Find source and target columns
    const sourceColumn = localBoard.columns.find(col => 
      col.taskOrder.includes(draggedTask.id)
    );
    const targetColumn = localBoard.columns.find(col => col.name === targetColumnName);

    if (!sourceColumn || !targetColumn || sourceColumn.name === targetColumn.name) {
      setDraggedTask(null);
      return;
    }

    try {
      // Update Kanban board layout
      const updatedColumns = localBoard.columns.map(col => {
        if (col.name === sourceColumn.name) {
          return {
            ...col,
            taskOrder: col.taskOrder.filter(id => id !== draggedTask.id),
          };
        }
        if (col.name === targetColumn.name) {
          return {
            ...col,
            taskOrder: [...col.taskOrder, draggedTask.id],
          };
        }
        return col;
      });

      const newBoard: KanbanBoardType = {
        ...localBoard,
        columns: updatedColumns,
      };

      setLocalBoard(newBoard);
      await saveKanbanBoard.mutateAsync(newBoard);

      // Sync essential attributes with task system
      if (targetColumnName === 'Completed' && !draggedTask.completed) {
        await toggleCompletion.mutateAsync(draggedTask.id);
        toast.success('Task marked as completed');
      } else if (targetColumnName !== 'Completed' && draggedTask.completed) {
        await toggleCompletion.mutateAsync(draggedTask.id);
        toast.success('Task reopened');
      } else {
        toast.success(`Task moved to ${targetColumnName}`);
      }
    } catch (error) {
      toast.error('Failed to update task');
      console.error(error);
    }

    setDraggedTask(null);
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

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const columns = [
    { name: 'To Do', color: 'bg-accent/10 border-accent/30' },
    { name: 'In Progress', color: 'bg-primary/10 border-primary/30' },
    { name: 'Completed', color: 'bg-secondary/10 border-secondary/30' },
  ];

  const isLoading = tasksLoading || kanbanLoading || !localBoard;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const statusMap: Record<string, TaskStatus> = {
    'To Do': 'todo',
    'In Progress': 'inProgress',
    'Completed': 'completed',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(({ name, color }) => {
        const columnTasks = getTasksByColumn(name);
        return (
          <div
            key={name}
            className={`space-y-4 ${dragOverColumn === statusMap[name] ? 'opacity-70' : ''}`}
            onDragOver={(e) => handleDragOver(e, name)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, name)}
          >
            <Card className={`border-2 ${color} shadow-summer`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{name}</span>
                  <Badge variant="outline" className="ml-2">
                    {columnTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-3 min-h-[400px]">
              {columnTasks.length === 0 ? (
                <Card className="border-dashed border-2 border-primary/20 bg-card/30">
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  </CardContent>
                </Card>
              ) : (
                columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-move hover:shadow-summer-lg transition-all duration-300 bg-card/80 backdrop-blur-sm border-primary/20 ${
                      draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm leading-tight">
                              {task.title}
                            </h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/15 shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-sm">
                                <DropdownMenuItem onClick={() => onEditTask(task)} className="hover:bg-primary/15">
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

                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <Badge variant={getPriorityColor(task.priority)} className="text-xs shadow-sm">
                              {task.priority}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {format(Number(task.dueDate) / 1000000, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
