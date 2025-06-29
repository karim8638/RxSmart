import React from 'react';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface RevenueData {
  month: string;
  amount: number;
  count: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxAmount = Math.max(...data.map(d => d.amount));
  const minAmount = Math.min(...data.map(d => d.amount));

  // Calculate growth rate
  const calculateGrowthRate = () => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1]?.amount || 0;
    const previous = data[data.length - 2]?.amount || 0;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const growthRate = calculateGrowthRate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analysis</h3>
            <p className="text-sm text-gray-600">Monthly revenue trends and growth</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
          growthRate >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <TrendingUp className={`w-4 h-4 ${growthRate < 0 ? 'rotate-180' : ''}`} />
          <span className="text-sm font-medium">
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="relative">
          {/* Line Chart */}
          <div className="h-80 relative bg-gradient-to-t from-gray-50 to-transparent rounded-lg p-4">
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="80" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 60" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Revenue Line */}
              <path
                d={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 760 + 20;
                  const y = 280 - ((item.amount - minAmount) / (maxAmount - minAmount)) * 240;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              
              {/* Data Points */}
              {data.map((item, index) => {
                const x = (index / (data.length - 1)) * 760 + 20;
                const y = 280 - ((item.amount - minAmount) / (maxAmount - minAmount)) * 240;
                
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="3"
                      className="hover:r-8 transition-all duration-200 cursor-pointer"
                    />
                    {/* Tooltip on hover */}
                    <g className="opacity-0 hover:opacity-100 transition-opacity">
                      <rect
                        x={x - 40}
                        y={y - 35}
                        width="80"
                        height="25"
                        fill="#1f2937"
                        rx="4"
                      />
                      <text
                        x={x}
                        y={y - 18}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="500"
                      >
                        ${item.amount.toFixed(0)}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between px-4 mt-2">
            {data.map((item, index) => (
              <span key={index} className="text-xs text-gray-500">
                {new Date(item.month + '-01').toLocaleDateString('en-US', { 
                  month: 'short',
                  year: '2-digit'
                })}
              </span>
            ))}
          </div>

          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 h-80 flex flex-col justify-between py-4 -ml-16">
            <span className="text-xs text-gray-500">${maxAmount.toFixed(0)}</span>
            <span className="text-xs text-gray-500">${(maxAmount * 0.75).toFixed(0)}</span>
            <span className="text-xs text-gray-500">${(maxAmount * 0.5).toFixed(0)}</span>
            <span className="text-xs text-gray-500">${(maxAmount * 0.25).toFixed(0)}</span>
            <span className="text-xs text-gray-500">${minAmount.toFixed(0)}</span>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Revenue Data</h3>
            <p className="text-gray-600">No revenue data available for the selected period.</p>
          </div>
        </div>
      )}

      {/* Revenue Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            ${data.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Average Monthly</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            ${data.length > 0 ? (data.reduce((sum, item) => sum + item.amount, 0) / data.length).toFixed(2) : '0.00'}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Highest Month</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            ${maxAmount.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <div className="flex items-center space-x-2">
            <TrendingUp className={`w-5 h-5 text-orange-600 ${growthRate < 0 ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium text-orange-800">Growth Rate</span>
          </div>
          <p className={`text-2xl font-bold mt-1 ${
            growthRate >= 0 ? 'text-green-900' : 'text-red-900'
          }`}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;