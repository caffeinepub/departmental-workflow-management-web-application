import { useState } from 'react';
import { useGetAdminData } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Eye, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { Priority, AppointmentStatus, InvoiceStatus, AutomationStatus } from '../backend';
import type { Task, Client, Meeting, Reminder, Invoice, Appointment, WorkflowAutomationLogEntry } from '../backend';

export default function AdminDatabaseDashboard() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const {
    tasks,
    clients,
    meetings,
    reminders,
    invoices,
    invoiceReminders,
    appointments,
    workflowLogs,
    isLoading,
    error,
    entityCounts,
  } = useGetAdminData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-in fade-in duration-500">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/30 animate-in fade-in duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You do not have permission to access the admin database dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  const filterData = <T extends Record<string, any>>(data: T[], searchFields: string[]): T[] => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const formatPriority = (priority: Priority) => {
    const colors = {
      [Priority.high]: 'bg-destructive/20 text-destructive border-destructive/30',
      [Priority.medium]: 'bg-accent/20 text-accent border-accent/30',
      [Priority.low]: 'bg-secondary/20 text-secondary border-secondary/30',
    };
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const formatStatus = (status: AppointmentStatus | InvoiceStatus | AutomationStatus) => {
    const colors: Record<string, string> = {
      pending: 'bg-summer-yellow/20 text-summer-yellow border-summer-yellow/30',
      confirmed: 'bg-primary/20 text-primary border-primary/30',
      completed: 'bg-summer-seafoam/20 text-summer-seafoam border-summer-seafoam/30',
      paid: 'bg-summer-seafoam/20 text-summer-seafoam border-summer-seafoam/30',
      overdue: 'bg-destructive/20 text-destructive border-destructive/30',
      inProgress: 'bg-primary/20 text-primary border-primary/30',
      failed: 'bg-destructive/20 text-destructive border-destructive/30',
    };
    return <Badge className={colors[status] || 'bg-muted'}>{status}</Badge>;
  };

  const renderTasksTable = () => {
    const filteredTasks = filterData(tasks, ['title', 'description', 'id']);
    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map((task) => (
            <TableRow key={task.id} className="hover:bg-primary/5 transition-colors">
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>{formatPriority(task.priority)}</TableCell>
              <TableCell>{formatTimestamp(task.dueDate)}</TableCell>
              <TableCell>
                <Badge variant={task.completed ? 'default' : 'outline'} className={task.completed ? 'bg-summer-seafoam/20 text-summer-seafoam border-summer-seafoam/30' : ''}>
                  {task.completed ? 'Completed' : 'Pending'}
                </Badge>
              </TableCell>
              <TableCell>{task.clientId || 'N/A'}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(task)} className="hover:bg-primary/10">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderClientsTable = () => {
    const filteredClients = filterData(clients, ['name', 'email', 'company']);
    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => (
            <TableRow key={client.id} className="hover:bg-primary/5 transition-colors">
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>{client.company}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(client)} className="hover:bg-primary/10">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderMeetingsTable = () => {
    const filteredMeetings = filterData(meetings, ['title', 'description']);
    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Title</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMeetings.map((meeting) => (
            <TableRow key={meeting.id} className="hover:bg-primary/5 transition-colors">
              <TableCell className="font-medium">{meeting.title}</TableCell>
              <TableCell>{formatTimestamp(meeting.startTime)}</TableCell>
              <TableCell>{formatTimestamp(meeting.endTime)}</TableCell>
              <TableCell>{meeting.participants.length}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(meeting)} className="hover:bg-primary/10">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderRemindersTable = () => {
    const filteredReminders = filterData(reminders, ['message']);
    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Message</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReminders.map((reminder) => (
            <TableRow key={reminder.id} className="hover:bg-primary/5 transition-colors">
              <TableCell className="font-medium">{reminder.message}</TableCell>
              <TableCell>{formatTimestamp(reminder.time)}</TableCell>
              <TableCell className="text-xs font-mono">{reminder.owner.toString().slice(0, 10)}...</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(reminder)} className="hover:bg-primary/10">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderInvoicesTable = () => {
    const filteredInvoices = filterData(invoices, ['clientId', 'workDescription']);
    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Client ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map((invoice) => (
            <TableRow key={invoice.id} className="hover:bg-primary/5 transition-colors">
              <TableCell className="font-medium">{invoice.clientId}</TableCell>
              <TableCell>${(Number(invoice.amount) / 100).toFixed(2)}</TableCell>
              <TableCell>{formatTimestamp(invoice.dueDate)}</TableCell>
              <TableCell>{formatStatus(invoice.status)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(invoice)} className="hover:bg-primary/10">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderInvoiceRemindersTable = () => {
    const filteredReminders = filterData(invoiceReminders, ['message', 'invoiceId']);
    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Invoice ID</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Reminder Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReminders.map((reminder) => (
            <TableRow key={reminder.id} className="hover:bg-primary/5 transition-colors">
              <TableCell className="font-medium">{reminder.invoiceId}</TableCell>
              <TableCell>{reminder.message}</TableCell>
              <TableCell>{formatTimestamp(reminder.dueDate)}</TableCell>
              <TableCell>{formatTimestamp(reminder.reminderTime)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(reminder)} className="hover:bg-primary/10">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderAppointmentsTable = () => {
    const filteredAppointments = filterData(appointments, ['clientName', 'serviceType']);
    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Client Name</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAppointments.map((appointment) => (
            <TableRow key={appointment.id} className="hover:bg-primary/5 transition-colors">
              <TableCell className="font-medium">{appointment.clientName}</TableCell>
              <TableCell>{appointment.serviceType}</TableCell>
              <TableCell>{formatTimestamp(appointment.dateTime)}</TableCell>
              <TableCell>{formatStatus(appointment.status)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(appointment)} className="hover:bg-primary/10">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderWorkflowLogsTable = () => {
    const filteredLogs = filterData(workflowLogs, ['ruleId']);
    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Rule ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log) => (
            <TableRow key={log.id} className="hover:bg-primary/5 transition-colors">
              <TableCell className="font-medium">{log.ruleId}</TableCell>
              <TableCell>{formatStatus(log.status)}</TableCell>
              <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
              <TableCell className="text-xs font-mono">{log.user.toString().slice(0, 10)}...</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(log)} className="hover:bg-primary/10">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-summer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow-primary">
              <Database className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Admin Database Dashboard</CardTitle>
              <CardDescription>
                Comprehensive view and management of all system data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Card className="bg-primary/10 border-primary/30 hover:bg-primary/15 transition-all hover:shadow-glow-primary">
              <CardHeader className="pb-2">
                <CardDescription>Tasks</CardDescription>
                <CardTitle className="text-3xl">{entityCounts?.tasks ? Number(entityCounts.tasks) : 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-secondary/10 border-secondary/30 hover:bg-secondary/15 transition-all hover:shadow-glow-secondary">
              <CardHeader className="pb-2">
                <CardDescription>Clients</CardDescription>
                <CardTitle className="text-3xl">{entityCounts?.clients ? Number(entityCounts.clients) : 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-accent/10 border-accent/30 hover:bg-accent/15 transition-all hover:shadow-glow-accent">
              <CardHeader className="pb-2">
                <CardDescription>Meetings</CardDescription>
                <CardTitle className="text-3xl">{entityCounts?.meetings ? Number(entityCounts.meetings) : 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-primary/10 border-primary/30 hover:bg-primary/15 transition-all hover:shadow-glow-primary">
              <CardHeader className="pb-2">
                <CardDescription>Invoices</CardDescription>
                <CardTitle className="text-3xl">{entityCounts?.invoices ? Number(entityCounts.invoices) : 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-secondary/10 border-secondary/30 hover:bg-secondary/15 transition-all hover:shadow-glow-secondary">
              <CardHeader className="pb-2">
                <CardDescription>Appointments</CardDescription>
                <CardTitle className="text-3xl">{entityCounts?.appointments ? Number(entityCounts.appointments) : 0}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-summer">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40 transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-card/50 backdrop-blur-sm border border-primary/15 shadow-summer p-1 flex-wrap h-auto">
              <TabsTrigger value="tasks" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="clients" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Clients ({clients.length})</TabsTrigger>
              <TabsTrigger value="meetings" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Meetings ({meetings.length})</TabsTrigger>
              <TabsTrigger value="reminders" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Reminders ({reminders.length})</TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Invoices ({invoices.length})</TabsTrigger>
              <TabsTrigger value="invoice-reminders" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Invoice Reminders ({invoiceReminders.length})</TabsTrigger>
              <TabsTrigger value="appointments" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Appointments ({appointments.length})</TabsTrigger>
              <TabsTrigger value="workflow-logs" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Workflow Logs ({workflowLogs.length})</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[600px] mt-4">
              <TabsContent value="tasks" className="animate-in fade-in duration-300">{renderTasksTable()}</TabsContent>
              <TabsContent value="clients" className="animate-in fade-in duration-300">{renderClientsTable()}</TabsContent>
              <TabsContent value="meetings" className="animate-in fade-in duration-300">{renderMeetingsTable()}</TabsContent>
              <TabsContent value="reminders" className="animate-in fade-in duration-300">{renderRemindersTable()}</TabsContent>
              <TabsContent value="invoices" className="animate-in fade-in duration-300">{renderInvoicesTable()}</TabsContent>
              <TabsContent value="invoice-reminders" className="animate-in fade-in duration-300">{renderInvoiceRemindersTable()}</TabsContent>
              <TabsContent value="appointments" className="animate-in fade-in duration-300">{renderAppointmentsTable()}</TabsContent>
              <TabsContent value="workflow-logs" className="animate-in fade-in duration-300">{renderWorkflowLogsTable()}</TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-md border-primary/30 shadow-summer-lg">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
            <DialogDescription>Read-only view of the selected record</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-4">
              {selectedRecord && (
                <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto border border-primary/10">
                  {JSON.stringify(selectedRecord, null, 2)}
                </pre>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
