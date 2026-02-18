import { useState } from 'react';
import { useGetInvoices, useCreateInvoice, usePayInvoice, useGetUserClients, useGetInvoiceReminders } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, CheckCircle, AlertCircle, Clock, FileText, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { InvoiceStatus } from '../backend';
import type { Invoice } from '../backend';
import InvoicePrintView from './InvoicePrintView';

export default function InvoiceManagement() {
  const { data: invoices = [], isLoading } = useGetInvoices();
  const { data: clients = [] } = useGetUserClients();
  const { data: invoiceReminders = [] } = useGetInvoiceReminders();
  const createInvoice = useCreateInvoice();
  const payInvoice = usePayInvoice();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    dueDate: '',
    workDescription: '',
  });

  const resetForm = () => {
    setFormData({
      clientId: '',
      amount: '',
      dueDate: '',
      workDescription: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.amount || !formData.dueDate || !formData.workDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const id = `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const dueDate = BigInt(new Date(formData.dueDate).getTime() * 1000000);
      const amount = BigInt(Math.round(parseFloat(formData.amount) * 100));

      await createInvoice.mutateAsync({
        id,
        clientId: formData.clientId,
        amount,
        dueDate,
        workDescription: formData.workDescription,
      });

      toast.success('Invoice created successfully');
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create invoice');
      console.error(error);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      await payInvoice.mutateAsync(invoiceId);
      toast.success('Invoice marked as paid');
    } catch (error) {
      toast.error('Failed to mark invoice as paid');
      console.error(error);
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPrintViewOpen(true);
    // Delay to ensure dialog is rendered before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPrintViewOpen(true);
    // Delay to ensure dialog is rendered before printing
    setTimeout(() => {
      window.print();
      toast.success('Use your browser\'s print dialog to save as PDF');
    }, 100);
  };

  const getStatusBadge = (invoice: Invoice) => {
    const now = Date.now() * 1000000;
    const isOverdue = invoice.status === InvoiceStatus.pending && Number(invoice.dueDate) < now;

    if (invoice.status === InvoiceStatus.paid) {
      return (
        <Badge className="bg-summer-seafoam/20 text-summer-seafoam border-summer-seafoam/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    } else if (isOverdue) {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-summer-yellow/20 text-summer-yellow border-summer-yellow/30">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getClientDetails = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'paid') return invoice.status === InvoiceStatus.paid;
    if (filterStatus === 'pending') return invoice.status === InvoiceStatus.pending;
    if (filterStatus === 'overdue') {
      const now = Date.now() * 1000000;
      return invoice.status === InvoiceStatus.pending && Number(invoice.dueDate) < now;
    }
    return true;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0) / 100;
  const paidAmount = invoices
    .filter(inv => inv.status === InvoiceStatus.paid)
    .reduce((sum, inv) => sum + Number(inv.amount), 0) / 100;
  const pendingAmount = invoices
    .filter(inv => inv.status === InvoiceStatus.pending)
    .reduce((sum, inv) => sum + Number(inv.amount), 0) / 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoice Management</h2>
          <p className="text-muted-foreground">Create and manage client invoices</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Create an invoice for a client with work description
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workDescription">Work Description *</Label>
                <Textarea
                  id="workDescription"
                  value={formData.workDescription}
                  onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                  placeholder="Describe the services or activities billed..."
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createInvoice.isPending}>
                  {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{invoices.length} total invoices</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-summer-seafoam/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-summer-seafoam" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-summer-seafoam">${paidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.status === InvoiceStatus.paid).length} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-summer-yellow/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-summer-yellow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-summer-yellow">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.status === InvoiceStatus.pending).length} pending invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Label>Filter:</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Invoices</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filterStatus === 'all' 
                  ? 'No invoices yet. Create your first invoice to get started!'
                  : `No ${filterStatus} invoices found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{getClientName(invoice.clientId)}</h3>
                        <p className="text-sm text-muted-foreground">Invoice #{invoice.id.slice(-8)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Work Description:</span>
                      </div>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">{invoice.workDescription}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="ml-2 font-semibold text-lg">${(Number(invoice.amount) / 100).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="ml-2 font-medium">
                          {format(Number(invoice.dueDate) / 1000000, 'PPP')}
                        </span>
                      </div>
                      <div>
                        {getStatusBadge(invoice)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handlePrintInvoice(invoice)}
                      variant="outline"
                      size="sm"
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      onClick={() => handleDownloadPDF(invoice)}
                      variant="outline"
                      size="sm"
                      className="border-summer-teal/30 hover:bg-summer-teal/10"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    {invoice.status === InvoiceStatus.pending && (
                      <Button
                        onClick={() => handlePayInvoice(invoice.id)}
                        disabled={payInvoice.isPending}
                        size="sm"
                        className="bg-summer-seafoam hover:bg-summer-seafoam/90 text-primary-foreground"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Print View Dialog */}
      {selectedInvoice && (
        <Dialog open={isPrintViewOpen} onOpenChange={setIsPrintViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-full print:max-h-full">
            <InvoicePrintView
              invoice={selectedInvoice}
              client={getClientDetails(selectedInvoice.clientId)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
