import React, { useState, useEffect } from 'react';
import {
  Mail,
  Calendar,
  Clock,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Eye,
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface EmailSchedule {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  reportType: 'summary' | 'sales' | 'inventory' | 'custom';
  isActive: boolean;
  lastSent?: string;
  nextSend: string;
  template: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

const EmailReports: React.FC = () => {
  const [schedules, setSchedules] = useState<EmailSchedule[]>([
    {
      id: '1',
      name: 'Daily Sales Summary',
      description: 'Daily overview of sales performance and key metrics',
      frequency: 'daily',
      time: '09:00',
      recipients: ['admin@pharmacy.com', 'manager@pharmacy.com'],
      reportType: 'summary',
      isActive: true,
      lastSent: '2024-01-15T09:00:00Z',
      nextSend: '2024-01-16T09:00:00Z',
      template: 'daily-summary',
    },
    {
      id: '2',
      name: 'Weekly Inventory Report',
      description: 'Weekly inventory status and low stock alerts',
      frequency: 'weekly',
      time: '08:00',
      recipients: ['inventory@pharmacy.com'],
      reportType: 'inventory',
      isActive: true,
      nextSend: '2024-01-22T08:00:00Z',
      template: 'inventory-weekly',
    },
  ]);

  const [templates] = useState<EmailTemplate[]>([
    {
      id: 'daily-summary',
      name: 'Daily Summary',
      subject: 'Daily Pharmacy Report - {{date}}',
      content: `
        <h2>Daily Pharmacy Summary</h2>
        <p>Here's your daily performance overview for {{date}}:</p>
        
        <h3>Key Metrics</h3>
        <ul>
          <li>Total Sales: {{totalSales}}</li>
          <li>Revenue: {{totalRevenue}}</li>
          <li>New Patients: {{newPatients}}</li>
          <li>Low Stock Items: {{lowStockCount}}</li>
        </ul>
        
        <h3>Top Performing Medicines</h3>
        {{topMedicines}}
        
        <p>Have a great day!</p>
      `,
      variables: ['date', 'totalSales', 'totalRevenue', 'newPatients', 'lowStockCount', 'topMedicines'],
    },
    {
      id: 'inventory-weekly',
      name: 'Weekly Inventory',
      subject: 'Weekly Inventory Report - {{weekOf}}',
      content: `
        <h2>Weekly Inventory Report</h2>
        <p>Inventory status for the week of {{weekOf}}:</p>
        
        <h3>Stock Alerts</h3>
        <ul>
          <li>Low Stock Items: {{lowStockItems}}</li>
          <li>Expiring Soon: {{expiringItems}}</li>
          <li>Out of Stock: {{outOfStockItems}}</li>
        </ul>
        
        <h3>Inventory by Category</h3>
        {{inventoryByCategory}}
        
        <p>Please review and take necessary actions.</p>
      `,
      variables: ['weekOf', 'lowStockItems', 'expiringItems', 'outOfStockItems', 'inventoryByCategory'],
    },
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<EmailSchedule | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const reportTypes = [
    { value: 'summary', label: 'Daily Summary' },
    { value: 'sales', label: 'Sales Report' },
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'custom', label: 'Custom Report' },
  ];

  const toggleSchedule = (id: string) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === id
          ? { ...schedule, isActive: !schedule.isActive }
          : schedule
      )
    );
  };

  const deleteSchedule = (id: string) => {
    if (confirm('Are you sure you want to delete this email schedule?')) {
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
    }
  };

  const sendTestEmail = async (scheduleId: string) => {
    // Simulate sending test email
    alert('Test email sent successfully!');
  };

  const generatePreviewContent = (template: EmailTemplate, schedule: EmailSchedule) => {
    let content = template.content;
    
    // Replace variables with sample data
    const sampleData: Record<string, string> = {
      date: format(new Date(), 'MMMM dd, yyyy'),
      weekOf: format(new Date(), 'MMMM dd, yyyy'),
      totalSales: '45',
      totalRevenue: '$12,450.00',
      newPatients: '8',
      lowStockCount: '3',
      lowStockItems: '3 items need restocking',
      expiringItems: '5 items expiring within 30 days',
      outOfStockItems: '1 item out of stock',
      topMedicines: `
        <ol>
          <li>Paracetamol - 25 units sold</li>
          <li>Amoxicillin - 18 units sold</li>
          <li>Ibuprofen - 15 units sold</li>
        </ol>
      `,
      inventoryByCategory: `
        <ul>
          <li>Antibiotics: 150 items</li>
          <li>Pain Relief: 200 items</li>
          <li>Vitamins: 180 items</li>
        </ul>
      `,
    };

    template.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      content = content.replace(regex, sampleData[variable] || `[${variable}]`);
    });

    return content;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Reports</h1>
          <p className="text-gray-600 mt-1">Automated email reports and schedules</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Schedule</span>
        </button>
      </div>

      {/* Active Schedules */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Email Schedules</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{schedule.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      schedule.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{schedule.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} at {schedule.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{schedule.recipients.length} recipients</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 capitalize">{schedule.reportType} report</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Next: {format(new Date(schedule.nextSend), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>

                  {schedule.lastSent && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Last sent: {format(new Date(schedule.lastSent), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPreview(schedule.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => sendTestEmail(schedule.id)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Send Test"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingSchedule(schedule);
                      setShowScheduleModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleSchedule(schedule.id)}
                    className={`p-2 transition-colors ${
                      schedule.isActive
                        ? 'text-gray-400 hover:text-red-600'
                        : 'text-gray-400 hover:text-green-600'
                    }`}
                    title={schedule.isActive ? 'Disable' : 'Enable'}
                  >
                    {schedule.isActive ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable) => (
                    <span
                      key={variable}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Email Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Email Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                id: '1',
                subject: 'Daily Pharmacy Report - January 15, 2024',
                recipients: 2,
                status: 'delivered',
                sentAt: '2024-01-15T09:00:00Z',
              },
              {
                id: '2',
                subject: 'Weekly Inventory Report - Week of January 8, 2024',
                recipients: 1,
                status: 'delivered',
                sentAt: '2024-01-15T08:00:00Z',
              },
              {
                id: '3',
                subject: 'Daily Pharmacy Report - January 14, 2024',
                recipients: 2,
                status: 'failed',
                sentAt: '2024-01-14T09:00:00Z',
              },
            ].map((email) => (
              <div key={email.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{email.subject}</p>
                  <p className="text-sm text-gray-600">
                    Sent to {email.recipients} recipient{email.recipients > 1 ? 's' : ''} • {format(new Date(email.sentAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    email.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : email.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {email.status}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Email Preview</h2>
                <button
                  onClick={() => setShowPreview(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {(() => {
                const schedule = schedules.find(s => s.id === showPreview);
                const template = templates.find(t => t.id === schedule?.template);
                if (!schedule || !template) return null;

                return (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Email Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Subject:</span>
                          <p className="font-medium">{template.subject.replace('{{date}}', format(new Date(), 'MMMM dd, yyyy'))}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Recipients:</span>
                          <p className="font-medium">{schedule.recipients.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: generatePreviewContent(template, schedule)
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailReports;