import React, { useState, useEffect } from 'react';
import { Crown, Check, X, Clock, Users, Calendar, DollarSign, Filter, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  price: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
}

const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (id: string, isActive: boolean) => {
    setProcessingId(id);
    try {
      const updateData: any = { 
        is_active: isActive,
        updated_at: new Date().toISOString()
      };

      // If activating, set start_date to now
      if (isActive) {
        updateData.start_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update subscription status');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusInfo = (subscription: Subscription) => {
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const isExpired = endDate < now;

    if (!subscription.is_active && !isExpired) {
      return { status: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    } else if (subscription.is_active && !isExpired) {
      return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-800', icon: Check };
    } else {
      return { status: 'cancelled', label: 'Expired', color: 'bg-red-100 text-red-800', icon: X };
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const statusInfo = getStatusInfo(subscription);
    const matchesFilter = filter === 'all' || statusInfo.status === filter;
    const matchesSearch = subscription.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.plan.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: subscriptions.length,
    pending: subscriptions.filter(s => getStatusInfo(s).status === 'pending').length,
    active: subscriptions.filter(s => getStatusInfo(s).status === 'active').length,
    cancelled: subscriptions.filter(s => getStatusInfo(s).status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired/Cancelled</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              {(['all', 'pending', 'active', 'cancelled'] as const).map((status) => (
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
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by user name or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Start Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">End Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => {
                const statusInfo = getStatusInfo(subscription);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {subscription.profiles?.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {subscription.profiles?.full_name || 'Unknown User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        <Crown className="w-4 h-4 mr-1" />
                        {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Pro
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{subscription.price}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {subscription.start_date ? format(new Date(subscription.start_date), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(subscription.end_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {statusInfo.status === 'pending' && (
                          <button
                            onClick={() => updateSubscriptionStatus(subscription.id, true)}
                            disabled={processingId === subscription.id}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {processingId === subscription.id ? 'Approving...' : 'Approve'}
                          </button>
                        )}
                        {statusInfo.status === 'active' && (
                          <button
                            onClick={() => updateSubscriptionStatus(subscription.id, false)}
                            disabled={processingId === subscription.id}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {processingId === subscription.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
            <p className="text-gray-600">No subscriptions match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;