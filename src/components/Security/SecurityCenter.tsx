import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  Activity,
  Users,
  Database,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, subDays } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
}

interface SecurityEvent {
  id: string;
  type: 'login_success' | 'login_failed' | 'password_change' | 'permission_change' | 'data_export';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface DataBackup {
  id: string;
  backup_type: 'manual' | 'scheduled' | 'emergency';
  status: 'in_progress' | 'completed' | 'failed';
  file_size: number;
  created_at: string;
  completed_at?: string;
}

const SecurityCenter: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [dataBackups, setDataBackups] = useState<DataBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'audit' | 'security' | 'backups' | 'settings'>('audit');
  const [dateFilter, setDateFilter] = useState('7d');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchSecurityData();
  }, [dateFilter, actionFilter]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      const days = parseInt(dateFilter.replace('d', ''));
      const startDate = subDays(new Date(), days);

      // Fetch audit logs
      let auditQuery = supabase
        .from('audit_trail')
        .select(`
          *,
          users (full_name, email)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        auditQuery = auditQuery.eq('action', actionFilter);
      }

      const { data: auditData } = await auditQuery;

      // Fetch data backups
      const { data: backupsData } = await supabase
        .from('data_backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setAuditLogs(auditData || []);
      setDataBackups(backupsData || []);

      // Generate mock security events for demo
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login_success',
          severity: 'low',
          description: 'Successful login from new device',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'login_failed',
          severity: 'medium',
          description: 'Multiple failed login attempts',
          ip_address: '203.0.113.45',
          user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          created_at: subDays(new Date(), 1).toISOString(),
        },
        {
          id: '3',
          type: 'data_export',
          severity: 'high',
          description: 'Large data export performed',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          created_at: subDays(new Date(), 2).toISOString(),
        },
      ];

      setSecurityEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const { error } = await supabase
        .from('data_backups')
        .insert({
          backup_type: 'manual',
          status: 'in_progress',
        });

      if (error) throw error;
      
      // Simulate backup completion
      setTimeout(() => {
        fetchSecurityData();
      }, 2000);
      
      alert('Backup initiated successfully!');
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup. Please try again.');
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'update':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'audit', label: 'Audit Logs', icon: Activity },
    { id: 'security', label: 'Security Events', icon: Shield },
    { id: 'backups', label: 'Data Backups', icon: Database },
    { id: 'settings', label: 'Security Settings', icon: Lock },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Center</h1>
          <p className="text-gray-600 mt-1">Monitor system security, audit logs, and data protection</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSecurityData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCreateBackup}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>Create Backup</span>
          </button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <p className="text-3xl font-bold text-green-600 mt-1">95%</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">12</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Logins</p>
              <p className="text-3xl font-bold text-red-600 mt-1">3</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-100 to-pink-100">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Backup</p>
              <p className="text-lg font-bold text-gray-900 mt-1">2 hours ago</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100">
              <Database className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Actions</option>
                  <option value="INSERT">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                </select>
              </div>

              {/* Audit Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Resource</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">IP Address</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {getActionIcon(log.action)}
                            <span className="font-medium text-gray-900">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{log.users?.full_name || 'System'}</p>
                            <p className="text-sm text-gray-600">{log.users?.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{log.resource_type}</p>
                            <p className="text-sm text-gray-600">{log.resource_id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{log.ip_address}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Globe className="w-4 h-4" />
                            <span>{event.ip_address}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(event.created_at), 'MMM dd, HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Data Backups</h3>
                <button
                  onClick={handleCreateBackup}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span>Create Backup</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dataBackups.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {backup.backup_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                            backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {backup.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {backup.file_size ? formatFileSize(backup.file_size) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {format(new Date(backup.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-3">
                          {backup.status === 'completed' && (
                            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Authentication Settings</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Enable
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Session Timeout</p>
                        <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 rounded-lg">
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>2 hours</option>
                        <option>4 hours</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Password Policy</p>
                        <p className="text-sm text-gray-600">Enforce strong passwords</p>
                      </div>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Data Protection</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Automatic Backups</p>
                        <p className="text-sm text-gray-600">Schedule regular data backups</p>
                      </div>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Enabled
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Data Encryption</p>
                        <p className="text-sm text-gray-600">Encrypt sensitive data at rest</p>
                      </div>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Enabled
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Audit Logging</p>
                        <p className="text-sm text-gray-600">Track all system activities</p>
                      </div>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Enabled
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityCenter;