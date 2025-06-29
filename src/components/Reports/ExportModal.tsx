import React, { useState } from 'react';
import { X, Download, FileText, Table, BarChart3, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ExportModalProps {
  onClose: () => void;
  data: any;
  dateRange: string;
  customDateRange: { start: string; end: string };
}

const ExportModal: React.FC<ExportModalProps> = ({
  onClose,
  data,
  dateRange,
  customDateRange,
}) => {
  const [exportType, setExportType] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [exportData, setExportData] = useState({
    summary: true,
    sales: true,
    revenue: true,
    inventory: true,
    medicines: true,
    transactions: true,
  });
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (exportType === 'csv') {
        exportToCSV();
      } else if (exportType === 'excel') {
        exportToExcel();
      } else {
        exportToPDF();
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = [];
    
    // Add summary data
    if (exportData.summary) {
      csvData.push(['Summary Report']);
      csvData.push(['Date Range', getDateRangeText()]);
      csvData.push(['Total Revenue', `$${data.totalRevenue.toFixed(2)}`]);
      csvData.push(['Total Sales', data.totalSales]);
      csvData.push(['Total Medicines', data.totalMedicines]);
      csvData.push(['Total Users', data.totalUsers]);
      csvData.push([]);
    }
    
    // Add sales data
    if (exportData.sales && data.dailySales.length > 0) {
      csvData.push(['Daily Sales']);
      csvData.push(['Date', 'Amount', 'Count']);
      data.dailySales.forEach((sale: any) => {
        csvData.push([sale.date, sale.amount.toFixed(2), sale.count]);
      });
      csvData.push([]);
    }
    
    // Add top medicines data
    if (exportData.medicines && data.topMedicines.length > 0) {
      csvData.push(['Top Medicines']);
      csvData.push(['Medicine', 'Sales', 'Revenue']);
      data.topMedicines.forEach((medicine: any) => {
        csvData.push([medicine.name, medicine.sales, medicine.revenue.toFixed(2)]);
      });
      csvData.push([]);
    }
    
    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');
    
    // Download CSV
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmacy-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // For demo purposes, we'll export as CSV with .xlsx extension
    // In a real app, you'd use a library like xlsx or exceljs
    exportToCSV();
  };

  const exportToPDF = () => {
    // For demo purposes, we'll create a simple HTML report
    // In a real app, you'd use a library like jsPDF or Puppeteer
    const reportHTML = generateReportHTML();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateReportHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pharmacy Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
          .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RxSmart Pharmacy Analytics Report</h1>
          <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
          <p>Period: ${getDateRangeText()}</p>
        </div>
        
        ${exportData.summary ? `
        <div class="section">
          <h2>Summary</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Revenue</h3>
              <p>$${data.totalRevenue.toFixed(2)}</p>
            </div>
            <div class="stat-card">
              <h3>Total Sales</h3>
              <p>${data.totalSales}</p>
            </div>
            <div class="stat-card">
              <h3>Total Medicines</h3>
              <p>${data.totalMedicines}</p>
            </div>
            <div class="stat-card">
              <h3>Total Users</h3>
              <p>${data.totalUsers}</p>
            </div>
          </div>
        </div>
        ` : ''}
        
        ${exportData.medicines && data.topMedicines.length > 0 ? `
        <div class="section">
          <h2>Top Performing Medicines</h2>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${data.topMedicines.slice(0, 10).map((medicine: any) => `
                <tr>
                  <td>${medicine.name}</td>
                  <td>${medicine.sales}</td>
                  <td>$${medicine.revenue.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        ${exportData.transactions && data.recentTransactions.length > 0 ? `
        <div class="section">
          <h2>Recent Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${data.recentTransactions.map((transaction: any) => `
                <tr>
                  <td>#${transaction.invoice_no}</td>
                  <td>${transaction.patients?.name || 'Walk-in Customer'}</td>
                  <td>$${transaction.total_amount.toFixed(2)}</td>
                  <td>${transaction.payment_status}</td>
                  <td>${format(new Date(transaction.created_at), 'MMM dd, yyyy')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  const getDateRangeText = () => {
    if (dateRange === 'custom') {
      return `${customDateRange.start} to ${customDateRange.end}`;
    }
    return dateRange.charAt(0).toUpperCase() + dateRange.slice(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Export Report</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'pdf', label: 'PDF', icon: FileText },
                { type: 'csv', label: 'CSV', icon: Table },
                { type: 'excel', label: 'Excel', icon: BarChart3 },
              ].map((format) => (
                <button
                  key={format.type}
                  onClick={() => setExportType(format.type as any)}
                  className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-colors ${
                    exportType === format.type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <format.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{format.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Data Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include Data
            </label>
            <div className="space-y-3">
              {[
                { key: 'summary', label: 'Summary Statistics' },
                { key: 'sales', label: 'Sales Data' },
                { key: 'revenue', label: 'Revenue Analysis' },
                { key: 'inventory', label: 'Inventory Stats' },
                { key: 'medicines', label: 'Top Medicines' },
                { key: 'transactions', label: 'Recent Transactions' },
              ].map((item) => (
                <label key={item.key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportData[item.key as keyof typeof exportData]}
                    onChange={(e) =>
                      setExportData(prev => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Date Range: {getDateRangeText()}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{loading ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;