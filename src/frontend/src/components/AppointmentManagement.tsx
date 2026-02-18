import { useState } from 'react';
import { useGetUserAppointments, useUpdateAppointment, useDeleteAppointment, useGetUserClients } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Edit, Trash2, CheckCircle, XCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { AppointmentStatus, type Appointment } from '../backend';

export default function AppointmentManagement() {
  const { data: appointments = [], isLoading } = useGetUserAppointments();
  const { data: clients = [] } = useGetUserClients();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    serviceType: '',
    date: '',
    time: '',
    status: AppointmentStatus.pending,
    clientId: '',
  });

  const handleEdit = (appointment: Appointment) => {
    const date = new Date(Number(appointment.dateTime) / 1000000);
    setFormData({
      clientName: appointment.clientName,
      serviceType: appointment.serviceType,
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().slice(0, 5),
      status: appointment.status,
      clientId: appointment.clientId || '',
    });
    setEditingAppointment(appointment);
  };

  const handleUpdate = async () => {
    if (!editingAppointment) return;

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      await updateAppointment.mutateAsync({
        id: editingAppointment.id,
        clientName: formData.clientName,
        serviceType: formData.serviceType,
        dateTime: BigInt(dateTime.getTime() * 1000000),
        status: formData.status,
        clientId: formData.clientId || null,
      });

      toast.success('Appointment updated successfully');
      setEditingAppointment(null);
    } catch (error) {
      toast.error('Failed to update appointment');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAppointment.mutateAsync(id);
      toast.success('Appointment deleted');
    } catch (error) {
      toast.error('Failed to delete appointment');
      console.error(error);
    }
  };

  const handleQuickStatusUpdate = async (appointment: Appointment, newStatus: AppointmentStatus) => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        clientName: appointment.clientName,
        serviceType: appointment.serviceType,
        dateTime: appointment.dateTime,
        status: newStatus,
        clientId: appointment.clientId || null,
      });

      toast.success(`Appointment ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.pending:
        return <Badge className="bg-summer-yellow/20 text-summer-yellow border-summer-yellow/30">Pending</Badge>;
      case AppointmentStatus.confirmed:
        return <Badge className="bg-summer-seafoam/20 text-summer-seafoam border-summer-seafoam/30">Confirmed</Badge>;
      case AppointmentStatus.completed:
        return <Badge className="bg-primary/20 text-primary border-primary/30">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return null;
    const client = clients.find(c => c.id === clientId);
    return client?.name;
  };

  const pendingAppointments = appointments.filter(a => a.status === AppointmentStatus.pending);
  const confirmedAppointments = appointments.filter(a => a.status === AppointmentStatus.confirmed);
  const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.completed);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-summer-yellow/10 border-summer-yellow/30 shadow-summer hover:shadow-summer-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-summer-yellow">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-summer-yellow">{pendingAppointments.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-summer-seafoam/10 border-summer-seafoam/30 shadow-summer hover:shadow-summer-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-summer-seafoam">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-summer-seafoam">{confirmedAppointments.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/30 shadow-summer hover:shadow-summer-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-primary">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{completedAppointments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/15 shadow-summer">
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>Manage client appointment requests and schedules</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No appointments to display</div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.dateTime);
                const linkedClient = getClientName(appointment.clientId);
                return (
                  <Card key={appointment.id} className="bg-background/50 border-primary/10 hover:border-primary/30 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{appointment.clientName}</h3>
                            {getStatusBadge(appointment.status)}
                            {linkedClient && (
                              <Badge variant="outline" className="bg-summer-coral/10 border-summer-coral/30 text-summer-coral gap-1">
                                <User className="h-3 w-3" />
                                {linkedClient}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.serviceType}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>{time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {appointment.status === AppointmentStatus.pending && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleQuickStatusUpdate(appointment, AppointmentStatus.confirmed)}
                                disabled={updateAppointment.isPending}
                                className="bg-summer-seafoam hover:bg-summer-seafoam/90 text-primary-foreground gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(appointment.id)}
                                disabled={deleteAppointment.isPending}
                                className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1"
                              >
                                <XCircle className="h-4 w-4" />
                                Decline
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(appointment)}
                            className="hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(appointment.id)}
                            disabled={deleteAppointment.isPending}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingAppointment} onOpenChange={(open) => !open && setEditingAppointment(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-summer-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment details and status</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-clientName">Client Name</Label>
              <Input
                id="edit-clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-serviceType">Service Type</Label>
              <Textarea
                id="edit-serviceType"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="border-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="border-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as AppointmentStatus })}
              >
                <SelectTrigger className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AppointmentStatus.pending}>Pending</SelectItem>
                  <SelectItem value={AppointmentStatus.confirmed}>Confirmed</SelectItem>
                  <SelectItem value={AppointmentStatus.completed}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-clientId">Link to Client (Optional)</Label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAppointment(null)} className="border-primary/20">
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateAppointment.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {updateAppointment.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
