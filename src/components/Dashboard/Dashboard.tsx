import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  Users, 
  Receipt,
  Calendar,
  DollarSign,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Medicine, Sale, Patient } from '../../types';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import SubscriptionStatus from '../Subscriptions/SubscriptionStatus';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface DashboardStats {
  totalSales: number;
  totalMedicines: number;
  lowStockCount: number;
  expiringCount: number;
  totalPatients: number;
  todaySales: number;
  recentSales: Sale[];
  lowStockMedicines: Medicine[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalMedicines: 0,
    lowStockCount: 0,
    expiringCount: 0,
    totalPatients: 0,
    todaySales: 0,
    recentSales: [],
    lowStockMedicines: [],
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cache dashboard stats
  const [cachedStats, setCachedStats] = useLocalStorage({
    key: 'dashboard_stats',
    defaultValue: stats,
  });

  // Real-time data for medicines
  const { data: medicines } = useRealtimeData<Medicine>({
    table: 'medicines',
    cacheKey: 'dashboard_medicines',
  });

  // Real-time data for sales
  const { data: sales } = useRealtimeData<Sale>({
    table: 'sales',
    cacheKey: 'dashboard_sales',
  });

  // Real-time data for patients
  const { data: patients } = useRealtimeData<Patient>({
    table: 'patients',
    cacheKey: 'dashboard_patients',
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchDashboardStats();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached data immediately when offline
  useEffect(() => {
    if (!isOnline && cachedStats) {
      setStats(cachedStats);
      setLoading(false);
    }
  }, [isOnline, cachedStats]);

  useEffect(() => {
    fetchDashboardStats();
  }, [medicines, sales, patients]);

  const fetchDashboardStats = async () => {
    try {
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      const thirtyDaysAgo = subDays(today, 30);

      // Calculate stats from real-time data
      const totalSales = sales.reduce((sum, sale) => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= thirtyDaysAgo ? sum + sale.total_amount : sum;
      }, 0);

      const todaySalesAmount = sales.reduce((sum, sale) => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= todayStart && saleDate <= todayEnd ? sum + sale.total_amount : sum;
      }, 0);

      const lowStockMedicines = medicines.filter(med => med.quantity <= med.min_stock_level);
      const expiringMedicines = medicines.filter(med => {
        const expiryDate = new Date(med.expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      });

      // Fetch recent sales with patient info if online
      let recentSalesData = [];
      if (isOnline) {
        const { data } = await supabase
          .from('sales')
          .select(`
            *,
            patients (name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        recentSalesData = data || [];
      } else {
        // Use cached recent sales
        recentSalesData = cachedStats.recentSales || [];
      }

      const newStats = {
        totalSales,
        totalMedicines: medicines.length,
        lowStockCount: lowStockMedicines.length,
        expiringCount: expiringMedicines.length,
        totalPatients: patients.length,
        todaySales: todaySalesAmount,
        recentSales: recentSalesData,
        lowStockMedicines: lowStockMedicines.slice(0, 5),
      };

      setStats(newStats);
      setCachedStats(newStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Use cached data if available
      if (cachedStats && Object.keys(cachedStats).length > 0) {
        setStats(cachedStats);
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string;
    color: string;
  }> = ({ title, value, icon, trend, trendValue, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading && !cachedStats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* Online/Offline Status */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Updated: {format(lastUpdated, 'HH:mm:ss')}</span>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchDashboardStats}
            disabled={!isOnline}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-5 h-5" />
            <span>You're offline. Showing cached data. Data will sync when you're back online.</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales (30 days)"
          value={`$${stats.totalSales.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Today's Sales"
          value={`$${stats.todaySales.toFixed(2)}`}
          icon={<Receipt className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Medicines"
          value={stats.totalMedicines}
          icon={<Package className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-indigo-500"
        />
      </div>

      {/* Subscription Status and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SubscriptionStatus />
        </div>
        
        <div className="lg:col-span-2">
          {(stats.lowStockCount > 0 || stats.expiringCount > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.lowStockCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                    <h3 className="text-lg font-semibold text-amber-800">Low Stock Alert</h3>
                  </div>
                  <p className="text-amber-700 mb-4">{stats.lowStockCount} medicines are running low on stock</p>
                  <div className="space-y-2">
                    {stats.lowStockMedicines.map((medicine) => (
                      <div key={medicine.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{medicine.name}</span>
                        <span className="text-amber-600">{medicine.quantity} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.expiringCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-800">Expiry Alert</h3>
                  </div>
                  <p className="text-red-700">{stats.expiringCount} medicines are expiring within 30 days</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
        </div>
        <div className="p-6">
          {stats.recentSales.length > 0 ? (
            <div className="space-y-4">
              {stats.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">Invoice #{sale.invoice_no}</p>
                    <p className="text-sm text-gray-600">
                      {sale.patient?.name || 'Walk-in Customer'} • {format(new Date(sale.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${sale.total_amount.toFixed(2)}</p>
                    <p className={`text-sm ${
                      sale.payment_status === 'paid' ? 'text-green-600' : 
                      sale.payment_status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {sale.payment_status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent sales</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;