import { useState } from 'react';
import { useGetUserClients, useCreateClient, useUpdateClient, useDeleteClient, useGetTasksByClient, useGetAppointmentsByClient } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Mail, Phone, Building2, FileText, CheckSquare, Calendar, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '../backend';

export default function ClientManagement() {
  const { data: clients = [], isLoading } = useGetUserClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
    });
    setEditingClient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in name and email');
      return;
    }

    try {
      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient.id,
          ...formData,
        });
        toast.success('Client updated successfully');
      } else {
        const id = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await createClient.mutateAsync({
          id,
          ...formData,
        });
        toast.success('Client added successfully');
      }

      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error(editingClient ? 'Failed to update client' : 'Failed to add client');
      console.error(error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      notes: client.notes,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This will remove client associations from tasks and appointments.')) {
      return;
    }

    try {
      await deleteClient.mutateAsync(clientId);
      toast.success('Client deleted successfully');
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
    } catch (error) {
      toast.error('Failed to delete client');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Client Management</h2>
          <p className="text-muted-foreground">Manage client contacts, intake information, and relationships</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-summer transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur-sm max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary flex items-center gap-2">
                {editingClient ? (
                  <>
                    <Pencil className="h-5 w-5" />
                    Edit Client
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Add New Client
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {editingClient 
                  ? 'Update client information and contact details' 
                  : 'Add a new client with their contact information and intake details'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Client full name"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Additional Information</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes, requirements, or intake information about the client"
                  rows={4}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createClient.isPending || updateClient.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {(createClient.isPending || updateClient.isPending) ? 'Saving...' : editingClient ? 'Update Client' : 'Add Client'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : clients.length === 0 ? (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-primary mb-1">No clients yet</p>
              <p className="text-muted-foreground">Add your first client to get started with client management</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={setSelectedClient}
              isSelected={selectedClient?.id === client.id}
            />
          ))}
        </div>
      )}

      {selectedClient && (
        <ClientDetailsPanel client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
}

function ClientCard({ 
  client, 
  onEdit, 
  onDelete, 
  onSelect, 
  isSelected 
}: { 
  client: Client; 
  onEdit: (client: Client) => void; 
  onDelete: (id: string) => void; 
  onSelect: (client: Client) => void;
  isSelected: boolean;
}) {
  return (
    <Card 
      className={`border-primary/20 bg-card/50 backdrop-blur-sm hover:shadow-summer transition-all duration-300 cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onSelect(client)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg text-primary">{client.name}</CardTitle>
            {client.company && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{client.company}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(client);
              }}
              className="h-8 w-8 hover:bg-primary/15"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(client.id);
              }}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 text-primary" />
          <span className="truncate">{client.email}</span>
        </div>
        {client.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.notes && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 text-primary mt-0.5" />
            <span className="line-clamp-2">{client.notes}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClientDetailsPanel({ client, onClose }: { client: Client; onClose: () => void }) {
  const { data: tasks = [] } = useGetTasksByClient(client.id);
  const { data: appointments = [] } = useGetAppointmentsByClient(client.id);

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-summer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl text-primary">{client.name}</CardTitle>
            <CardDescription>Client details and associated items</CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-primary/10 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                Associated Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{tasks.length}</div>
              {tasks.length > 0 && (
                <div className="mt-2 space-y-1">
                  {tasks.slice(0, 3).map(task => (
                    <div key={task.id} className="text-sm text-muted-foreground truncate">
                      • {task.title}
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{tasks.length - 3} more</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-seafoam/10 border-seafoam/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-seafoam" />
                Associated Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-seafoam">{appointments.length}</div>
              {appointments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {appointments.slice(0, 3).map(apt => (
                    <div key={apt.id} className="text-sm text-muted-foreground truncate">
                      • {apt.serviceType}
                    </div>
                  ))}
                  {appointments.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{appointments.length - 3} more</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-primary">Contact Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.company && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{client.company}</span>
              </div>
            )}
          </div>
        </div>

        {client.notes && (
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Notes & Additional Information</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
