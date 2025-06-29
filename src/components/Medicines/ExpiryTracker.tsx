import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertTriangle,
  Clock,
  Package,
  Filter,
  Download,
  Bell,
  X,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
import { Medicine } from '../../types';

interface ExpiryAlert {
  id: string;
  medicine: Medicine;
  daysUntilExpiry: number;
  status: 'expired' | 'critical' | 'warning' | 'good';
  priority: 'high' | 'medium' | 'low';
}

interface ExpiryTrackerProps {
  medicines: Medicine[];
  onRefresh: () => void;
}

const ExpiryTracker: React.FC<ExpiryTrackerProps> = ({ medicines, onRefresh }) => {
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'expired' | 'critical' | 'warning'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateExpiryAlerts();
  }, [medicines]);

  const generateExpiryAlerts = () => {
    const today = new Date();
    const alertsData: ExpiryAlert[] = [];

    medicines.forEach(medicine => {
      const expiryDate = new Date(medicine.expiry_date);
      const daysUntilExpiry = differenceInDays(expiryDate, today);
      
      let status: ExpiryAlert['status'] = 'good';
      let priority: ExpiryAlert['priority'] = 'low';

      if (daysUntilExpiry < 0) {
        status = 'expired';
        priority = 'high';
      } else if (daysUntilExpiry <= 7) {
        status = 'critical';
        priority = 'high';
      } else if (daysUntilExpiry <= 30) {
        status = 'warning';
        priority = 'medium';
      }

      if (status !== 'good') {
        alertsData.push({
          id: medicine.id,
          medicine,
          daysUntilExpiry,
          status,
          priority,
        });
      }
    });

    // Sort by priority and days until expiry
    alertsData.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });

    setAlerts(alertsData);
  };

  const getStatusColor = (status: ExpiryAlert['status']) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'critical':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status: ExpiryAlert['status']) => {
    switch (status) {
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getStatusText = (alert: ExpiryAlert) => {
    if (alert.daysUntilExpiry < 0) {
      return `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`;
    } else if (alert.daysUntilExpiry === 0) {
      return 'Expires today';
    } else {
      return `Expires in ${alert.daysUntilExpiry} days`;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const exportExpiryReport = () => {
    const csvData = [
      ['Medicine Name', 'Batch Number', 'Expiry Date', 'Days Until Expiry', 'Status', 'Quantity', 'Category'],
      ...alerts.map(alert => [
        alert.medicine.name,
        alert.medicine.batch_no,
        alert.medicine.expiry_date,
        alert.daysUntilExpiry.toString(),
        alert.status,
        alert.medicine.quantity.toString(),
        alert.medicine.category,
      ])
    ];

    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expiry-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const criticalAlerts = alerts.filter(alert => 
    (alert.status === 'expired' || alert.status === 'critical') && 
    !dismissedAlerts.has(alert.id)
  );

  return (
    <div className="space-y-6">
      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Critical Expiry Alerts</h3>
                <p className="text-red-700">
                  {criticalAlerts.length} medicines require immediate attention
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNotifications(true)}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {alerts.filter(a => a.status === 'expired').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-100 to-pink-100">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical (≤7 days)</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {alerts.filter(a => a.status === 'critical').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-100 to-red-100">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warning (≤30 days)</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {alerts.filter(a => a.status === 'warning').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Medicines</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{medicines.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              {(['all', 'expired', 'critical', 'warning'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {alerts.filter(a => a.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={exportExpiryReport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expiry Alerts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Expiry Alerts</h3>
        </div>
        
        {filteredAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Medicine</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Batch</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{alert.medicine.name}</p>
                        <p className="text-sm text-gray-600">{alert.medicine.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">
                      {alert.medicine.batch_no}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {format(new Date(alert.medicine.expiry_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(alert.status)}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(alert.status)}`}>
                          {getStatusText(alert)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${
                        alert.medicine.quantity <= alert.medicine.min_stock_level
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {alert.medicine.quantity}
                      </span>
                      {alert.medicine.quantity <= alert.medicine.min_stock_level && (
                        <span className="ml-2 text-xs text-red-600">(Low Stock)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Dismiss Alert"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Expiry Alerts</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'All medicines are within safe expiry periods.'
                : `No medicines in ${filter} status.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Critical Expiry Notifications</h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {criticalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getStatusColor(alert.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(alert.status)}
                        <div>
                          <p className="font-semibold">{alert.medicine.name}</p>
                          <p className="text-sm opacity-75">
                            Batch: {alert.medicine.batch_no} • {getStatusText(alert)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryTracker;