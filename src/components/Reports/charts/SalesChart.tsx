import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface SalesData {
  date: string;
  amount: number;
  count: number;
}

interface SalesChartProps {
  data: SalesData[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const maxAmount = Math.max(...data.map(d => d.amount));
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sales Trends</h3>
            <p className="text-sm text-gray-600">Daily sales performance over time</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Count</span>
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="relative">
          {/* Chart Container */}
          <div className="h-80 flex items-end space-x-2 p-4 bg-gradient-to-t from-gray-50 to-transparent rounded-lg">
            {data.map((item, index) => {
              const amountHeight = (item.amount / maxAmount) * 100;
              const countHeight = (item.count / maxCount) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                  {/* Bars */}
                  <div className="w-full flex space-x-1 items-end" style={{ height: '240px' }}>
                    {/* Revenue Bar */}
                    <div className="flex-1 relative group">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                        style={{ height: `${amountHeight}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Count Bar */}
                    <div className="flex-1 relative group">
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-300 hover:from-green-600 hover:to-green-500"
                        style={{ height: `${countHeight}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.count} sales
                      </div>
                    </div>
                  </div>
                  
                  {/* Date Label */}
                  <div className="text-xs text-gray-500 transform -rotate-45 origin-center">
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 h-80 flex flex-col justify-between py-4 -ml-12">
            <span className="text-xs text-gray-500">${maxAmount.toFixed(0)}</span>
            <span className="text-xs text-gray-500">${(maxAmount * 0.75).toFixed(0)}</span>
            <span className="text-xs text-gray-500">${(maxAmount * 0.5).toFixed(0)}</span>
            <span className="text-xs text-gray-500">${(maxAmount * 0.25).toFixed(0)}</span>
            <span className="text-xs text-gray-500">$0</span>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Data</h3>
            <p className="text-gray-600">No sales data available for the selected period.</p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            ${data.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Sales</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Average Sale</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            ${data.length > 0 ? (data.reduce((sum, item) => sum + item.amount, 0) / data.reduce((sum, item) => sum + item.count, 0) || 0).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;