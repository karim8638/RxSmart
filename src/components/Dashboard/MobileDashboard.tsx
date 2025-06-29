import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  Calendar,
  BarChart3,
  Menu,
  X,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ChevronRight,
  Activity,
  ShoppingCart,
  Clock,
} from 'lucide-react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { useAuthContext } from '../../contexts/AuthContext';
import { format, subDays } from 'date-fns';

interface MobileKPI {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

const MobileDashboard: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [kpis, setKpis] = useState<MobileKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useAuthContext();

  // Real-time data hooks
  const { data: sales } = useRealtimeData({
    table: 'sales',
    select: '*',
    cacheKey: 'mobile_sales',
  });

  const { data: medicines } = useRealtimeData({
    table: 'medicines',
    cacheKey: 'mobile_medicines',
  });

  const { data: patients } = useRealtimeData({
    table: 'patients',
    cacheKey: 'mobile_patients',
  });

  useEffect(() => {
    calculateKPIs();
  }, [sales, medicines, patients, selectedTimeframe]);

  const calculateKPIs = () => {
    const days = parseInt(selectedTimeframe.replace('d', ''));
    const startDate = subDays(new Date(), days);
    
    // Filter data by timeframe
    const recentSales = sales.filter(sale => 
      new Date(sale.created_at) >= startDate
    );

    const previousPeriodSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= subDays(startDate, days) && saleDate < startDate;
    });

    // Calculate metrics
    const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const totalSales = recentSales.length;
    const previousSalesCount = previousPeriodSales.length;
    const salesChange = previousSalesCount > 0 ? ((totalSales - previousSalesCount) / previousSalesCount) * 100 : 0;

    const lowStockCount = medicines.filter(med => med.quantity <= med.min_stock_level).length;
    const totalMedicines = medicines.length;

    const newKpis: MobileKPI[] = [
      {
        title: 'Revenue',
        value: `$${totalRevenue.toFixed(0)}`,
        change: revenueChange,
        icon: <DollarSign className="w-5 h-5" />,
        color: 'bg-green-500',
        trend: revenueChange >= 0 ? 'up' : 'down',
      },
      {
        title: 'Sales',
        value: totalSales,
        change: salesChange,
        icon: <ShoppingCart className="w-5 h-5" />,
        color: 'bg-blue-500',
        trend: salesChange >= 0 ? 'up' : 'down',
      },
      {
        title: 'Inventory',
        value: totalMedicines,
        change: lowStockCount,
        icon: <Package className="w-5 h-5" />,
        color: 'bg-purple-500',
        trend: lowStockCount > 0 ? 'down' : 'neutral',
      },
      {
        title: 'Patients',
        value: patients.length,
        change: 0,
        icon: <Users className="w-5 h-5" />,
        color: 'bg-orange-500',
        trend: 'neutral',
      },
    ];

    setKpis(newKpis);
    setLoading(false);
  };

  const timeframes = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  const quickActions = [
    { icon: Package, label: 'Add Medicine', color: 'bg-blue-500', href: '/medicines' },
    { icon: ShoppingCart, label: 'New Sale', color: 'bg-green-500', href: '/sales' },
    { icon: Users, label: 'Add Patient', color: 'bg-purple-500', href: '/patients' },
    { icon: BarChart3, label: 'Reports', color: 'bg-orange-500', href: '/reports' },
  ];

  const recentActivity = sales.slice(0, 5).map(sale => ({
    id: sale.id,
    title: `Sale #${sale.invoice_no}`,
    subtitle: `$${sale.total_amount.toFixed(2)}`,
    time: format(new Date(sale.created_at), 'HH:mm'),
    status: sale.payment_status,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">RxSmart</h1>
              <p className="text-xs text-gray-500">Welcome, {appUser?.full_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white w-80 h-full shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {[
                { icon: BarChart3, label: 'Dashboard', href: '/' },
                { icon: Package, label: 'Medicines', href: '/medicines' },
                { icon: ShoppingCart, label: 'Sales', href: '/sales' },
                { icon: Users, label: 'Patients', href: '/patients' },
                { icon: TrendingUp, label: 'Reports', href: '/reports' },
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Timeframe Selector */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Overview</h3>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="flex space-x-2">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.value}
                onClick={() => setSelectedTimeframe(timeframe.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          {kpis.map((kpi, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <div className="text-white">{kpi.icon}</div>
                </div>
                <div className={`flex items-center space-x-1 text-xs ${
                  kpi.trend === 'up' ? 'text-green-600' :
                  kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {kpi.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {kpi.trend === 'down' && <TrendingUp className="w-3 h-3 rotate-180" />}
                  <span>{Math.abs(kpi.change).toFixed(1)}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-sm text-gray-600">{kpi.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {kpis[2]?.change > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Low Stock Alert</p>
                <p className="text-sm text-amber-700">
                  {kpis[2].change} medicines are running low on stock
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <button className="flex items-center space-x-1 text-blue-600 text-sm">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{activity.time}</p>
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    activity.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Preview */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Sales Trend</h3>
            <a href="/reports" className="text-blue-600 text-sm">View Details</a>
          </div>
          <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-end p-2 space-x-1">
            {[40, 65, 45, 80, 55, 70, 85].map((height, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;