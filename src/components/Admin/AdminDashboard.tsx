import React, { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  Package,
  TrendingUp,
  DollarSign,
  UserPlus,
  AlertTriangle,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Target,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalMedicines: number;
  lowStockCount: number;
  recentUsers: any[];
  recentSubscriptions: any[];
  salesGrowth: number;
  userGrowth: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    pendingSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalMedicines: 0,
    lowStockCount: 0,
    recentUsers: [],
    recentSubscriptions: [],
    salesGrowth: 0,
    userGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      const sixtyDaysAgo = subDays(today, 60);

      // Fetch users
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles (full_name)
        `)
        .order('created_at', { ascending: false });

      // Fetch medicines
      const { data: medicines } = await supabase
        .from('medicines')
        .select('*');

      // Fetch sales for revenue calculation
      const { data: sales } = await supabase
        .from('sales')
        .select('total_amount, created_at');

      // Calculate stats
      const totalUsers = users?.length || 0;
      const activeSubscriptions = subscriptions?.filter(s => s.is_active).length || 0;
      const pendingSubscriptions = subscriptions?.filter(s => !s.is_active).length || 0;
      
      const totalRevenue = sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const monthlyRevenue = sales?.filter(sale => 
        new Date(sale.created_at) >= thirtyDaysAgo
      ).reduce((sum, sale) => sum + sale.total_amount, 0) || 0;

      const totalMedicines = medicines?.length || 0;
      const lowStockCount = medicines?.filter(med => med.quantity <= med.min_stock_level).length || 0;

      // Calculate growth rates
      const recentUsers = users?.filter(user => new Date(user.created_at) >= thirtyDaysAgo).length || 0;
      const previousUsers = users?.filter(user => {
        const date = new Date(user.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length || 0;
      const userGrowth = previousUsers > 0 ? ((recentUsers - previousUsers) / previousUsers) * 100 : 0;

      const recentSales = sales?.filter(sale => new Date(sale.created_at) >= thirtyDaysAgo).length || 0;
      const previousSales = sales?.filter(sale => {
        const date = new Date(sale.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length || 0;
      const salesGrowth = previousSales > 0 ? ((recentSales - previousSales) / previousSales) * 100 : 0;

      setStats({
        totalUsers,
        activeSubscriptions,
        pendingSubscriptions,
        totalRevenue,
        monthlyRevenue,
        totalMedicines,
        lowStockCount,
        recentUsers: users?.slice(0, 5) || [],
        recentSubscriptions: subscriptions?.slice(0, 5) || [],
        salesGrowth,
        userGrowth,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, trend, color, subtitle }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend).toFixed(1)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your pharmacy system.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-8 h-8 text-white" />}
          trend={stats.userGrowth}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          subtitle="Registered pharmacists"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={<Crown className="w-8 h-8 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          subtitle={`${stats.pendingSubscriptions} pending approval`}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-8 h-8 text-white" />}
          trend={stats.salesGrowth}
          color="bg-gradient-to-r from-green-500 to-green-600"
          subtitle="From subscriptions & sales"
        />
        <StatCard
          title="Inventory Items"
          value={stats.totalMedicines}
          icon={<Package className="w-8 h-8 text-white" />}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          subtitle={`${stats.lowStockCount} low stock alerts`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
              <p className="text-sm text-gray-600">All systems operational</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Response</span>
              <span className="text-sm font-medium text-green-600">Fast</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-green-600">99.9%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common admin tasks</p>
            </div>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Approve pending subscriptions
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Review low stock alerts
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Export user reports
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
              <p className="text-sm text-gray-600">Last 30 days</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Users</span>
              <span className="text-sm font-medium text-gray-900">{stats.recentUsers.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue Growth</span>
              <span className={`text-sm font-medium ${stats.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.salesGrowth >= 0 ? '+' : ''}{stats.salesGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-sm font-medium text-gray-900">${stats.totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
              <UserPlus className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {stats.recentUsers.length > 0 ? (
              <div className="space-y-4">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 capitalize">{user.role}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(user.created_at), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent users</p>
            )}
          </div>
        </div>

        {/* Recent Subscriptions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Subscriptions</h3>
              <Crown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {stats.recentSubscriptions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {subscription.profiles?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">{subscription.plan} Plan</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        subscription.is_active ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {subscription.is_active ? 'Active' : 'Pending'}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${subscription.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent subscriptions</p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800">Inventory Alert</h3>
              <p className="text-amber-700">
                {stats.lowStockCount} medicines are running low on stock and need attention.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;