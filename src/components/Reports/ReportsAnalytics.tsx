import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  DollarSign,
  Package,
  Users,
  Activity,
  ArrowUp,
  ArrowDown,
  Eye,
  ShoppingCart,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, subDays, startOfDay, endOfDay, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import SalesChart from './charts/SalesChart';
import RevenueChart from './charts/RevenueChart';
import InventoryChart from './charts/InventoryChart';
import TopMedicinesChart from './charts/TopMedicinesChart';
import UserActivityChart from './charts/UserActivityChart';
import ExportModal from './ExportModal';

interface AnalyticsData {
  totalRevenue: number;
  totalSales: number;
  totalMedicines: number;
  totalUsers: number;
  revenueGrowth: number;
  salesGrowth: number;
  lowStockCount: number;
  expiringCount: number;
  dailySales: Array<{ date: string; amount: number; count: number }>;
  weeklySales: Array<{ week: string; amount: number; count: number }>;
  monthlySales: Array<{ month: string; amount: number; count: number }>;
  topMedicines: Array<{ name: string; sales: number; revenue: number }>;
  inventoryByCategory: Array<{ category: string; count: number; value: number }>;
  userActivity: Array<{ date: string; logins: number; registrations: number }>;
  recentTransactions: Array<any>;
}

type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
type ChartType = 'sales' | 'revenue' | 'inventory' | 'medicines' | 'activity';

const ReportsAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalSales: 0,
    totalMedicines: 0,
    totalUsers: 0,
    revenueGrowth: 0,
    salesGrowth: 0,
    lowStockCount: 0,
    expiringCount: 0,
    dailySales: [],
    weeklySales: [],
    monthlySales: [],
    topMedicines: [],
    inventoryByCategory: [],
    userActivity: [],
    recentTransactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customDateRange, setCustomDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [activeChart, setActiveChart] = useState<ChartType>('sales');
  const [showExportModal, setShowExportModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time data hooks
  const { data: sales } = useRealtimeData({
    table: 'sales',
    select: `
      *,
      patients (name),
      sale_items (
        *,
        medicines (name, category)
      )
    `,
    cacheKey: 'analytics_sales',
  });

  const { data: medicines } = useRealtimeData({
    table: 'medicines',
    cacheKey: 'analytics_medicines',
  });

  const { data: users } = useRealtimeData({
    table: 'users',
    cacheKey: 'analytics_users',
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, customDateRange, sales, medicines, users]);

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: subDays(now, 90), end: now };
      case 'year':
        return { start: subDays(now, 365), end: now };
      case 'custom':
        return {
          start: new Date(customDateRange.start),
          end: new Date(customDateRange.end),
        };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRangeFilter();

      // Filter sales data by date range
      const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= start && saleDate <= end;
      });

      // Calculate basic metrics
      const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
      const totalSalesCount = filteredSales.length;

      // Calculate growth rates (compare with previous period)
      const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const previousStart = subDays(start, periodDays);
      const previousEnd = start;

      const previousSales = sales.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= previousStart && saleDate < previousEnd;
      });

      const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total_amount, 0);
      const previousSalesCount = previousSales.length;

      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const salesGrowth = previousSalesCount > 0 ? ((totalSalesCount - previousSalesCount) / previousSalesCount) * 100 : 0;

      // Calculate inventory metrics
      const lowStockMedicines = medicines.filter(med => med.quantity <= med.min_stock_level);
      const expiringMedicines = medicines.filter(med => {
        const expiryDate = new Date(med.expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      });

      // Generate daily sales data
      const dailySales = generateDailySalesData(filteredSales, start, end);
      const weeklySales = generateWeeklySalesData(sales);
      const monthlySales = generateMonthlySalesData(sales);

      // Calculate top medicines
      const topMedicines = calculateTopMedicines(filteredSales);

      // Calculate inventory by category
      const inventoryByCategory = calculateInventoryByCategory(medicines);

      // Generate user activity data
      const userActivity = generateUserActivityData(users);

      // Get recent transactions
      const recentTransactions = filteredSales
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setAnalyticsData({
        totalRevenue,
        totalSales: totalSalesCount,
        totalMedicines: medicines.length,
        totalUsers: users.length,
        revenueGrowth,
        salesGrowth,
        lowStockCount: lowStockMedicines.length,
        expiringCount: expiringMedicines.length,
        dailySales,
        weeklySales,
        monthlySales,
        topMedicines,
        inventoryByCategory,
        userActivity,
        recentTransactions,
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailySalesData = (salesData: any[], start: Date, end: Date) => {
    const days = [];
    const current = new Date(start);
    
    while (current <= end) {
      const dayStr = format(current, 'yyyy-MM-dd');
      const daySales = salesData.filter(sale => 
        format(new Date(sale.created_at), 'yyyy-MM-dd') === dayStr
      );
      
      days.push({
        date: dayStr,
        amount: daySales.reduce((sum, sale) => sum + sale.total_amount, 0),
        count: daySales.length,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const generateWeeklySalesData = (salesData: any[]) => {
    const weeks = new Map();
    
    salesData.forEach(sale => {
      const weekStart = startOfWeek(new Date(sale.created_at));
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, { week: weekKey, amount: 0, count: 0 });
      }
      
      const week = weeks.get(weekKey);
      week.amount += sale.total_amount;
      week.count += 1;
    });
    
    return Array.from(weeks.values()).sort((a, b) => a.week.localeCompare(b.week));
  };

  const generateMonthlySalesData = (salesData: any[]) => {
    const months = new Map();
    
    salesData.forEach(sale => {
      const monthKey = format(new Date(sale.created_at), 'yyyy-MM');
      
      if (!months.has(monthKey)) {
        months.set(monthKey, { month: monthKey, amount: 0, count: 0 });
      }
      
      const month = months.get(monthKey);
      month.amount += sale.total_amount;
      month.count += 1;
    });
    
    return Array.from(months.values()).sort((a, b) => a.month.localeCompare(b.month));
  };

  const calculateTopMedicines = (salesData: any[]) => {
    const medicineStats = new Map();
    
    salesData.forEach(sale => {
      sale.sale_items?.forEach((item: any) => {
        const medicineName = item.medicines?.name || 'Unknown';
        if (!medicineStats.has(medicineName)) {
          medicineStats.set(medicineName, { name: medicineName, sales: 0, revenue: 0 });
        }
        
        const stats = medicineStats.get(medicineName);
        stats.sales += item.quantity;
        stats.revenue += item.total_price;
      });
    });
    
    return Array.from(medicineStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const calculateInventoryByCategory = (medicinesData: any[]) => {
    const categories = new Map();
    
    medicinesData.forEach(medicine => {
      const category = medicine.category || 'Other';
      if (!categories.has(category)) {
        categories.set(category, { category, count: 0, value: 0 });
      }
      
      const cat = categories.get(category);
      cat.count += medicine.quantity;
      cat.value += medicine.quantity * medicine.price;
    });
    
    return Array.from(categories.values());
  };

  const generateUserActivityData = (usersData: any[]) => {
    const activity = new Map();
    
    usersData.forEach(user => {
      const dateKey = format(new Date(user.created_at), 'yyyy-MM-dd');
      if (!activity.has(dateKey)) {
        activity.set(dateKey, { date: dateKey, logins: 0, registrations: 0 });
      }
      
      const day = activity.get(dateKey);
      day.registrations += 1;
    });
    
    return Array.from(activity.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, trend, color, subtitle }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
              <span>{Math.abs(trend).toFixed(1)}% vs previous period</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading && analyticsData.totalRevenue === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your pharmacy performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              {(['today', 'week', 'month', 'quarter', 'year', 'custom'] as DateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-8 h-8 text-white" />}
          trend={analyticsData.revenueGrowth}
          color="bg-gradient-to-r from-green-500 to-emerald-600"
        />
        <StatCard
          title="Total Sales"
          value={analyticsData.totalSales}
          icon={<ShoppingCart className="w-8 h-8 text-white" />}
          trend={analyticsData.salesGrowth}
          color="bg-gradient-to-r from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Inventory Items"
          value={analyticsData.totalMedicines}
          icon={<Package className="w-8 h-8 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          subtitle={`${analyticsData.lowStockCount} low stock`}
        />
        <StatCard
          title="Active Users"
          value={analyticsData.totalUsers}
          icon={<Users className="w-8 h-8 text-white" />}
          color="bg-gradient-to-r from-orange-500 to-red-500"
        />
      </div>

      {/* Alert Cards */}
      {(analyticsData.lowStockCount > 0 || analyticsData.expiringCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyticsData.lowStockCount > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-800">Low Stock Alert</h3>
              </div>
              <p className="text-amber-700 mb-2">{analyticsData.lowStockCount} medicines are running low on stock</p>
              <button className="text-amber-800 font-medium hover:text-amber-900 transition-colors">
                View Details →
              </button>
            </div>
          )}

          {analyticsData.expiringCount > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Expiry Alert</h3>
              </div>
              <p className="text-red-700 mb-2">{analyticsData.expiringCount} medicines are expiring within 30 days</p>
              <button className="text-red-800 font-medium hover:text-red-900 transition-colors">
                View Details →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chart Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-0">
            {[
              { key: 'sales', label: 'Sales Trends', icon: BarChart3 },
              { key: 'revenue', label: 'Revenue Analysis', icon: TrendingUp },
              { key: 'inventory', label: 'Inventory Stats', icon: Package },
              { key: 'medicines', label: 'Top Medicines', icon: Activity },
              { key: 'activity', label: 'User Activity', icon: Users },
            ].map((chart) => (
              <button
                key={chart.key}
                onClick={() => setActiveChart(chart.key as ChartType)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeChart === chart.key
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <chart.icon className="w-5 h-5" />
                <span>{chart.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeChart === 'sales' && <SalesChart data={analyticsData.dailySales} />}
          {activeChart === 'revenue' && <RevenueChart data={analyticsData.monthlySales} />}
          {activeChart === 'inventory' && <InventoryChart data={analyticsData.inventoryByCategory} />}
          {activeChart === 'medicines' && <TopMedicinesChart data={analyticsData.topMedicines} />}
          {activeChart === 'activity' && <UserActivityChart data={analyticsData.userActivity} />}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analyticsData.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">#{transaction.invoice_no}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {transaction.patients?.name || 'Walk-in Customer'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ${transaction.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      transaction.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : transaction.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          data={analyticsData}
          dateRange={dateRange}
          customDateRange={customDateRange}
        />
      )}
    </div>
  );
};

export default ReportsAnalytics;