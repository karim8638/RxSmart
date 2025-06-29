import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Calendar,
  Target,
  Activity,
  BarChart3,
  Zap,
  Clock,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface KPIWidget {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
  format: 'currency' | 'number' | 'percentage';
  target?: number;
  description: string;
  timeframe: string;
}

interface SmartKPIWidgetsProps {
  timeframe?: '24h' | '7d' | '30d' | '90d';
  layout?: 'grid' | 'list';
  showTargets?: boolean;
}

const SmartKPIWidgets: React.FC<SmartKPIWidgetsProps> = ({
  timeframe = '30d',
  layout = 'grid',
  showTargets = true,
}) => {
  const [kpis, setKpis] = useState<KPIWidget[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time data hooks
  const { data: sales } = useRealtimeData({
    table: 'sales',
    select: '*',
    cacheKey: 'kpi_sales',
  });

  const { data: medicines } = useRealtimeData({
    table: 'medicines',
    cacheKey: 'kpi_medicines',
  });

  const { data: patients } = useRealtimeData({
    table: 'patients',
    cacheKey: 'kpi_patients',
  });

  const { data: users } = useRealtimeData({
    table: 'users',
    cacheKey: 'kpi_users',
  });

  useEffect(() => {
    calculateKPIs();
  }, [sales, medicines, patients, users, timeframe]);

  const getDateRange = () => {
    const now = new Date();
    const days = parseInt(timeframe.replace(/[^0-9]/g, ''));
    
    return {
      current: {
        start: subDays(now, days),
        end: now,
      },
      previous: {
        start: subDays(now, days * 2),
        end: subDays(now, days),
      },
    };
  };

  const calculateKPIs = () => {
    const { current, previous } = getDateRange();

    // Filter data by timeframes
    const currentSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= current.start && saleDate <= current.end;
    });

    const previousSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= previous.start && saleDate < previous.end;
    });

    const currentPatients = patients.filter(patient => {
      const patientDate = new Date(patient.created_at);
      return patientDate >= current.start && patientDate <= current.end;
    });

    const previousPatients = patients.filter(patient => {
      const patientDate = new Date(patient.created_at);
      return patientDate >= previous.start && patientDate < previous.end;
    });

    // Calculate metrics
    const totalRevenue = currentSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const totalSales = currentSales.length;
    const previousSalesCount = previousSales.length;
    const salesChange = previousSalesCount > 0 ? ((totalSales - previousSalesCount) / previousSalesCount) * 100 : 0;

    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const previousAOV = previousSalesCount > 0 ? previousRevenue / previousSalesCount : 0;
    const aovChange = previousAOV > 0 ? ((averageOrderValue - previousAOV) / previousAOV) * 100 : 0;

    const newPatients = currentPatients.length;
    const previousNewPatients = previousPatients.length;
    const patientChange = previousNewPatients > 0 ? ((newPatients - previousNewPatients) / previousNewPatients) * 100 : 0;

    const lowStockCount = medicines.filter(med => med.quantity <= med.min_stock_level).length;
    const expiringCount = medicines.filter(med => {
      const expiryDate = new Date(med.expiry_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow;
    }).length;

    const inventoryValue = medicines.reduce((sum, med) => sum + (med.quantity * med.price), 0);
    const inventoryTurnover = totalRevenue > 0 ? (totalRevenue / inventoryValue) * 100 : 0;

    const newKpis: KPIWidget[] = [
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: totalRevenue,
        previousValue: previousRevenue,
        change: revenueChange,
        changeType: revenueChange >= 0 ? 'increase' : 'decrease',
        trend: revenueChange >= 0 ? 'up' : 'down',
        icon: <DollarSign className="w-6 h-6" />,
        color: 'bg-gradient-to-r from-green-500 to-emerald-600',
        format: 'currency',
        target: 50000,
        description: 'Total sales revenue',
        timeframe: timeframe,
      },
      {
        id: 'sales',
        title: 'Total Sales',
        value: totalSales,
        previousValue: previousSalesCount,
        change: salesChange,
        changeType: salesChange >= 0 ? 'increase' : 'decrease',
        trend: salesChange >= 0 ? 'up' : 'down',
        icon: <ShoppingCart className="w-6 h-6" />,
        color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        format: 'number',
        target: 200,
        description: 'Number of transactions',
        timeframe: timeframe,
      },
      {
        id: 'aov',
        title: 'Average Order Value',
        value: averageOrderValue,
        previousValue: previousAOV,
        change: aovChange,
        changeType: aovChange >= 0 ? 'increase' : 'decrease',
        trend: aovChange >= 0 ? 'up' : 'down',
        icon: <Target className="w-6 h-6" />,
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        format: 'currency',
        target: 250,
        description: 'Average transaction value',
        timeframe: timeframe,
      },
      {
        id: 'patients',
        title: 'New Patients',
        value: newPatients,
        previousValue: previousNewPatients,
        change: patientChange,
        changeType: patientChange >= 0 ? 'increase' : 'decrease',
        trend: patientChange >= 0 ? 'up' : 'down',
        icon: <Users className="w-6 h-6" />,
        color: 'bg-gradient-to-r from-orange-500 to-red-500',
        format: 'number',
        target: 50,
        description: 'New patient registrations',
        timeframe: timeframe,
      },
      {
        id: 'inventory',
        title: 'Inventory Value',
        value: inventoryValue,
        change: 0,
        changeType: 'neutral',
        trend: 'neutral',
        icon: <Package className="w-6 h-6" />,
        color: 'bg-gradient-to-r from-indigo-500 to-blue-600',
        format: 'currency',
        description: 'Total inventory worth',
        timeframe: 'current',
      },
      {
        id: 'turnover',
        title: 'Inventory Turnover',
        value: inventoryTurnover,
        change: 0,
        changeType: 'neutral',
        trend: 'neutral',
        icon: <Activity className="w-6 h-6" />,
        color: 'bg-gradient-to-r from-teal-500 to-cyan-600',
        format: 'percentage',
        target: 15,
        description: 'Inventory efficiency ratio',
        timeframe: timeframe,
      },
      {
        id: 'alerts',
        title: 'Stock Alerts',
        value: lowStockCount + expiringCount,
        change: 0,
        changeType: lowStockCount + expiringCount > 0 ? 'decrease' : 'neutral',
        trend: lowStockCount + expiringCount > 0 ? 'down' : 'neutral',
        icon: <AlertTriangle className="w-6 h-6" />,
        color: 'bg-gradient-to-r from-amber-500 to-orange-500',
        format: 'number',
        description: 'Low stock & expiring items',
        timeframe: 'current',
      },
      {
        id: 'efficiency',
        title: 'Sales Efficiency',
        value: totalSales > 0 ? (totalRevenue / totalSales) / 100 : 0,
        change: 0,
        changeType: 'neutral',
        trend: 'neutral',
        icon: <Zap className="w-6 h-6" />,
        color: 'bg-gradient-to-r from-pink-500 to-rose-600',
        format: 'percentage',
        target: 85,
        description: 'Revenue per transaction efficiency',
        timeframe: timeframe,
      },
    ];

    setKpis(newKpis);
    setLoading(false);
  };

  const formatValue = (value: number | string, format: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (trend: string, size = 'w-4 h-4') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className={`${size} text-green-600`} />;
      case 'down':
        return <ArrowDown className={`${size} text-red-600`} />;
      default:
        return <Minus className={`${size} text-gray-600`} />;
    }
  };

  const getProgressPercentage = (value: number, target?: number) => {
    if (!target) return 0;
    return Math.min((value / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className={`grid ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${kpi.color} group-hover:scale-110 transition-transform duration-200`}>
              <div className="text-white">{kpi.icon}</div>
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(kpi.trend)}
              {kpi.change !== undefined && (
                <span className={`text-sm font-medium ${
                  kpi.changeType === 'increase' ? 'text-green-600' :
                  kpi.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatValue(kpi.value, kpi.format)}
            </p>
            <p className="text-xs text-gray-500">{kpi.description}</p>
          </div>

          {showTargets && kpi.target && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Target: {formatValue(kpi.target, kpi.format)}</span>
                <span>{getProgressPercentage(Number(kpi.value), kpi.target).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    getProgressPercentage(Number(kpi.value), kpi.target) >= 100
                      ? 'bg-green-500'
                      : getProgressPercentage(Number(kpi.value), kpi.target) >= 75
                      ? 'bg-blue-500'
                      : getProgressPercentage(Number(kpi.value), kpi.target) >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${getProgressPercentage(Number(kpi.value), kpi.target)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{kpi.timeframe}</span>
            </span>
            {kpi.previousValue !== undefined && (
              <span>
                vs {formatValue(kpi.previousValue, kpi.format)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SmartKPIWidgets;