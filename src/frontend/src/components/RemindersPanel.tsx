import { useState } from 'react';
import { useGetUserReminders, useCreateReminder, useUpdateReminder, useDeleteReminder, useGetInvoiceReminders, useGetInvoices, useGetUserClients } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Pencil, Trash2, Bell, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, isPast, isFuture } from 'date-fns';
import { InvoiceStatus } from '../backend';
import type { Reminder } from '../backend';

export default function RemindersPanel() {
  const { data: reminders = [], isLoading } = useGetUserReminders();
  const { data: invoiceReminders = [] } = useGetInvoiceReminders();
  const { data: invoices = [] } = useGetInvoices();
  const { data: clients = [] } = useGetUserClients();
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const [formData, setFormData] = useState({
    message: '',
    time: '',
  });

  const resetForm = () => {
    setFormData({
      message: '',
      time: '',
    });
    setEditingReminder(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message.trim() || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const time = BigInt(new Date(formData.time).getTime() * 1000000);

      if (editingReminder) {
        await updateReminder.mutateAsync({
          reminderId: editingReminder.id,
          message: formData.message,
          time,
        });
        toast.success('Reminder updated successfully');
      } else {
        const id = `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await createReminder.mutateAsync({
          id,
          message: formData.message,
          time,
        });
        toast.success('Reminder created successfully');
      }

      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error(editingReminder ? 'Failed to update reminder' : 'Failed to create reminder');
      console.error(error);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      message: reminder.message,
      time: format(Number(reminder.time) / 1000000, "yyyy-MM-dd'T'HH:mm"),
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (reminderId: string) => {
    try {
      await deleteReminder.mutateAsync(reminderId);
      toast.success('Reminder deleted successfully');
    } catch (error) {
      toast.error('Failed to delete reminder');
      console.error(error);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getInvoiceDetails = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    return invoice;
  };

  // Sort reminders by time
  const sortedReminders = [...reminders].sort((a, b) => Number(a.time) - Number(b.time));

  // Separate active and past reminders
  const activeReminders = sortedReminders.filter(r => isFuture(Number(r.time) / 1000000));
  const pastReminders = sortedReminders.filter(r => isPast(Number(r.time) / 1000000));

  // Filter active invoice reminders
  const activeInvoiceReminders = invoiceReminders.filter(r => {
    const invoice = getInvoiceDetails(r.invoiceId);
    return invoice && invoice.status === InvoiceStatus.pending;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reminders</h2>
          <p className="text-muted-foreground">Manage your reminders and notifications</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</DialogTitle>
              <DialogDescription>
                {editingReminder ? 'Update reminder details' : 'Set a new reminder'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="What do you want to be reminded about?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Reminder Time *</Label>
                <Input
                  id="time"
                  type="datetime-local"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createReminder.isPending || updateReminder.isPending}>
                  {(createReminder.isPending || updateReminder.isPending) ? 'Saving...' : editingReminder ? 'Update Reminder' : 'Create Reminder'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReminders.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoice Reminders</CardTitle>
            <DollarSign className="h-4 w-4 text-summer-yellow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-summer-yellow">{activeInvoiceReminders.length}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Reminders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastReminders.length}</div>
            <p className="text-xs text-muted-foreground">Completed reminders</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Reminders */}
      {activeInvoiceReminders.length > 0 && (
        <Card className="border-summer-yellow/30 bg-summer-yellow/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-summer-yellow" />
              Unpaid Invoice Reminders
            </CardTitle>
            <CardDescription>Invoices requiring payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeInvoiceReminders.map(reminder => {
                const invoice = getInvoiceDetails(reminder.invoiceId);
                if (!invoice) return null;

                return (
                  <div key={reminder.id} className="p-4 border border-summer-yellow/30 rounded-lg bg-card/50 backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-summer-yellow" />
                          <p className="font-semibold">{getClientName(invoice.clientId)}</p>
                          <Badge className="bg-summer-yellow/20 text-summer-yellow border-summer-yellow/30">
                            ${(Number(invoice.amount) / 100).toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{reminder.message}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Due: {format(Number(invoice.dueDate) / 1000000, 'PPP')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Reminders */}
      {activeReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Reminders</CardTitle>
            <CardDescription>Upcoming reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeReminders.map(reminder => (
                <div key={reminder.id} className="p-4 border rounded-lg bg-primary/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        <p className="font-medium">{reminder.message}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(Number(reminder.time) / 1000000, 'PPp')}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(reminder)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(reminder.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Reminders */}
      {pastReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Reminders</CardTitle>
            <CardDescription>Completed reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastReminders.map(reminder => (
                <div key={reminder.id} className="p-4 border rounded-lg opacity-60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <p className="font-medium line-through">{reminder.message}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(Number(reminder.time) / 1000000, 'PPp')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : reminders.length === 0 && activeInvoiceReminders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reminders yet. Create your first reminder to get started!</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
