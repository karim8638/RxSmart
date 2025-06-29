import React from 'react';
import { Download, Printer, Mail, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  paymentMethod: string;
  notes?: string;
}

interface InvoicePDFProps {
  invoice: Invoice;
  onDownload: () => void;
  onPrint: () => void;
  onEmail: () => void;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({
  invoice,
  onDownload,
  onPrint,
  onEmail,
}) => {
  const generatePDFContent = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNo}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .invoice-header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .invoice-header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
          }
          .invoice-header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
          }
          .invoice-body {
            padding: 30px;
          }
          .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .info-section h3 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 1.1rem;
            font-weight: 600;
          }
          .info-section p {
            margin: 5px 0;
            color: #6b7280;
          }
          .invoice-details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .invoice-details table {
            width: 100%;
            border-collapse: collapse;
          }
          .invoice-details td {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .invoice-details td:first-child {
            font-weight: 600;
            color: #374151;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            background: #f3f4f6;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
          }
          .items-table td {
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
          }
          .items-table tr:hover {
            background: #f9fafb;
          }
          .totals {
            margin-left: auto;
            width: 300px;
          }
          .totals table {
            width: 100%;
            border-collapse: collapse;
          }
          .totals td {
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals td:first-child {
            font-weight: 600;
            color: #374151;
          }
          .totals td:last-child {
            text-align: right;
            font-weight: 600;
          }
          .total-row {
            background: #f3f4f6;
            font-size: 1.2rem;
          }
          .total-row td {
            padding: 15px 0;
            border-top: 2px solid #d1d5db;
            border-bottom: 2px solid #d1d5db;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-paid {
            background: #d1fae5;
            color: #065f46;
          }
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          .status-overdue {
            background: #fee2e2;
            color: #991b1b;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.875rem;
          }
          .notes {
            background: #fffbeb;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
          }
          .notes h4 {
            margin: 0 0 10px 0;
            color: #92400e;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .invoice-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <h1>RxSmart Pharmacy</h1>
            <p>Professional Pharmacy Services</p>
          </div>
          
          <div class="invoice-body">
            <div class="invoice-info">
              <div class="info-section">
                <h3>Bill To:</h3>
                <p><strong>${invoice.customer.name}</strong></p>
                ${invoice.customer.email ? `<p>${invoice.customer.email}</p>` : ''}
                <p>${invoice.customer.phone}</p>
                <p>${invoice.customer.address}</p>
              </div>
              
              <div class="info-section">
                <h3>Invoice Details:</h3>
                <div class="invoice-details">
                  <table>
                    <tr>
                      <td>Invoice Number:</td>
                      <td><strong>${invoice.invoiceNo}</strong></td>
                    </tr>
                    <tr>
                      <td>Invoice Date:</td>
                      <td>${format(new Date(invoice.date), 'MMMM dd, yyyy')}</td>
                    </tr>
                    <tr>
                      <td>Due Date:</td>
                      <td>${format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}</td>
                    </tr>
                    <tr>
                      <td>Payment Method:</td>
                      <td>${invoice.paymentMethod}</td>
                    </tr>
                    <tr>
                      <td>Status:</td>
                      <td>
                        <span class="status-badge status-${invoice.paymentStatus}">
                          ${invoice.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice.toFixed(2)}</td>
                    <td>$${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <table>
                <tr>
                  <td>Subtotal:</td>
                  <td>$${invoice.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Tax:</td>
                  <td>$${invoice.tax.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td>Total:</td>
                  <td>$${invoice.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            ${invoice.notes ? `
              <div class="notes">
                <h4>Notes:</h4>
                <p>${invoice.notes}</p>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>For questions about this invoice, please contact us at info@rxsmart.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadPDF = () => {
    const content = generatePDFContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoiceNo}.html`;
    a.click();
    URL.revokeObjectURL(url);
    onDownload();
  };

  const handlePrint = () => {
    const content = generatePDFContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
    onPrint();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Invoice #{invoice.invoiceNo}</h3>
            <p className="text-sm text-gray-600">
              Generated on {format(new Date(invoice.date), 'MMMM dd, yyyy')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onEmail}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="p-6">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div
            className="invoice-preview"
            dangerouslySetInnerHTML={{ __html: generatePDFContent() }}
            style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicePDF;