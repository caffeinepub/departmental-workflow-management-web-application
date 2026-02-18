import { format } from 'date-fns';
import { InvoiceStatus } from '../backend';
import type { Invoice, Client } from '../backend';

interface InvoicePrintViewProps {
  invoice: Invoice;
  client?: Client;
}

export default function InvoicePrintView({ invoice, client }: InvoicePrintViewProps) {
  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.paid:
        return 'PAID';
      case InvoiceStatus.pending:
        return 'PENDING';
      case InvoiceStatus.overdue:
        return 'OVERDUE';
      default:
        return 'PENDING';
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.paid:
        return 'text-summer-seafoam';
      case InvoiceStatus.pending:
        return 'text-summer-yellow';
      case InvoiceStatus.overdue:
        return 'text-destructive';
      default:
        return 'text-summer-yellow';
    }
  };

  return (
    <div className="invoice-print-view bg-white text-gray-900 p-8 print:p-12">
      {/* Header */}
      <div className="border-b-4 border-summer-teal pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-summer-teal mb-2">INVOICE</h1>
            <p className="text-sm text-gray-600">Invoice #{invoice.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Issue Date</div>
            <div className="font-medium">{format(new Date(), 'PPP')}</div>
            <div className="text-sm text-gray-600 mt-3 mb-1">Due Date</div>
            <div className="font-medium">{format(Number(invoice.dueDate) / 1000000, 'PPP')}</div>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase mb-3">Bill To</h2>
          <div className="space-y-1">
            <div className="font-semibold text-lg">{client?.name || 'Unknown Client'}</div>
            {client?.company && <div className="text-gray-700">{client.company}</div>}
            {client?.email && <div className="text-gray-600">{client.email}</div>}
            {client?.phone && <div className="text-gray-600">{client.phone}</div>}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase mb-3">Status</h2>
          <div className={`text-2xl font-bold ${getStatusColor(invoice.status)}`}>
            {getStatusText(invoice.status)}
          </div>
        </div>
      </div>

      {/* Work Description */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-600 uppercase mb-3">Description of Services</h2>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-gray-800 whitespace-pre-wrap">{invoice.workDescription}</p>
        </div>
      </div>

      {/* Amount Details */}
      <div className="border-t-2 border-gray-200 pt-6 mb-8">
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-medium">${(Number(invoice.amount) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (0%):</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="border-t-2 border-summer-teal pt-3 flex justify-between text-xl font-bold">
              <span className="text-summer-teal">Total Due:</span>
              <span className="text-summer-teal">${(Number(invoice.amount) / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      {invoice.status === InvoiceStatus.pending && (
        <div className="bg-summer-yellow/10 border border-summer-yellow/30 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-gray-800 mb-2">Payment Instructions</h3>
          <p className="text-sm text-gray-700">
            Please remit payment by the due date listed above. For questions regarding this invoice, 
            please contact us at your earliest convenience.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6 mt-12">
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">Thank you for your business!</p>
          <p className="flex items-center justify-center gap-1">
            © {new Date().getFullYear()}. Built with 
            <span className="text-summer-coral">♥</span> 
            using <a href="https://caffeine.ai" className="text-summer-teal hover:underline">caffeine.ai</a>
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .invoice-print-view {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 1.5cm;
          }
          
          @page {
            size: A4;
            margin: 1cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
