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
  RefreshCw,
  Settings,
  BarChart3,
  Clock,
  XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Medicine, Sale, Patient } from '../../types';
import { format, subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import SubscriptionStatus from '../Subscriptions/SubscriptionStatus';
import SmartKPIWidgets from '../KPI/SmartKPIWidgets';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuthContext } from '../../contexts/AuthContext';

interface DashboardStats {
  totalSales: number;
  totalMedicines: number;
  lowStockCount: number;
  expiringCount: number;
  expiredCount: number;
  totalPatients: number;
  todaySales: number;
  recentSales: Sale[];
  lowStockMedicines: Medicine[];
  expiringMedicines: Medicine[];
  expiredMedicines: Medicine[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalMedicines: 0,
    lowStockCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    totalPatients: 0,
    todaySales: 0,
    recentSales: [],
    lowStockMedicines: [],
    expiringMedicines: [],
    expiredMedicines: [],
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [kpiTimeframe, setKpiTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [showKPISettings, setShowKPISettings] = useState(false);

  const { appUser } = useAuthContext();

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

      // Calculate expiry-related stats
      const lowStockMedicines = medicines.filter(med => med.quantity <= med.min_stock_level);
      
      const expiringMedicines = medicines.filter(med => {
        const expiryDate = new Date(med.expiry_date);
        const daysUntilExpiry = differenceInDays(expiryDate, today);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
      });

      const expiredMedicines = medicines.filter(med => {
        const expiryDate = new Date(med.expiry_date);
        return differenceInDays(expiryDate, today) < 0;
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
        expiredCount: expiredMedicines.length,
        totalPatients: patients.length,
        todaySales: todaySalesAmount,
        recentSales: recentSalesData,
        lowStockMedicines: lowStockMedicines.slice(0, 5),
        expiringMedicines: expiringMedicines.slice(0, 5),
        expiredMedicines: expiredMedicines.slice(0, 5),
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

  const handleRefresh = async () => {
    await fetchDashboardStats();
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {appUser?.full_name}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your pharmacy today</p>
        </div>
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

          {/* KPI Settings */}
          <button
            onClick={() => setShowKPISettings(!showKPISettings)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>KPI Settings</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
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

      {/* Critical Alerts */}
      {(stats.expiredCount > 0 || stats.expiringCount > 0 || stats.lowStockCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.expiredCount > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Expired Medicines</h3>
                  <p className="text-red-700">{stats.expiredCount} medicines have expired</p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {stats.expiredMedicines.map((medicine) => (
                  <div key={medicine.id} className="text-sm text-red-700">
                    • {medicine.name} (Batch: {medicine.batch_no})
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.expiringCount > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-800">Expiring Soon</h3>
                  <p className="text-orange-700">{stats.expiringCount} medicines expire within 30 days</p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {stats.expiringMedicines.map((medicine) => (
                  <div key={medicine.id} className="text-sm text-orange-700">
                    • {medicine.name} (Expires: {format(new Date(medicine.expiry_date), 'MMM dd')})
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.lowStockCount > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">Low Stock Alert</h3>
                  <p className="text-amber-700">{stats.lowStockCount} medicines are running low</p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {stats.lowStockMedicines.map((medicine) => (
                  <div key={medicine.id} className="text-sm text-amber-700">
                    • {medicine.name} ({medicine.quantity} left)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Settings Panel */}
      {showKPISettings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">KPI Dashboard Settings</h3>
            <button
              onClick={() => setShowKPISettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Frame
              </label>
              <select
                value={kpiTimeframe}
                onChange={(e) => setKpiTimeframe(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart KPI Widgets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h2>
          <a
            href="/reports"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Detailed Reports</span>
          </a>
        </div>
        <SmartKPIWidgets
          timeframe={kpiTimeframe}
          layout="grid"
          showTargets={true}
        />
      </div>

      {/* Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SubscriptionStatus />
        </div>
        
        {/* Recent Sales */}
        <div className="lg:col-span-2">
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
      </div>
    </div>
  );
};

export default Dashboard;