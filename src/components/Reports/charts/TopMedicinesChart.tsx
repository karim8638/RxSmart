import React from 'react';
import { Activity, Star, TrendingUp, Package } from 'lucide-react';

interface MedicineData {
  name: string;
  sales: number;
  revenue: number;
}

interface TopMedicinesChartProps {
  data: MedicineData[];
}

const TopMedicinesChart: React.FC<TopMedicinesChartProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxSales = Math.max(...data.map(d => d.sales));
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Medicines</h3>
            <p className="text-sm text-gray-600">Best sellers by revenue and quantity</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Quantity</span>
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="space-y-6">
          {/* Top Medicines List */}
          <div className="space-y-4">
            {data.slice(0, 10).map((medicine, index) => {
              const revenuePercentage = (medicine.revenue / maxRevenue) * 100;
              const salesPercentage = (medicine.sales / maxSales) * 100;
              const revenueShare = (medicine.revenue / totalRevenue) * 100;
              
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{medicine.name}</h4>
                        <p className="text-sm text-gray-600">
                          {medicine.sales} units sold • {revenueShare.toFixed(1)}% of total revenue
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">${medicine.revenue.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{medicine.sales} units</div>
                    </div>
                  </div>
                  
                  {/* Progress Bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Revenue</span>
                        <span>${medicine.revenue.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${revenuePercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Quantity Sold</span>
                        <span>{medicine.sales} units</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${salesPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Distribution */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border border-orange-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h4>
              <div className="space-y-3">
                {data.slice(0, 5).map((medicine, index) => {
                  const percentage = (medicine.revenue / totalRevenue) * 100;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-orange-500' :
                          index === 1 ? 'bg-red-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-pink-500' : 'bg-purple-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                          {medicine.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sales Performance */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Best Seller</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {data[0]?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Top Revenue</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${data[0]?.revenue.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Units Sold</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {data.reduce((sum, item) => sum + item.sales, 0)} total
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Price</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${data.length > 0 ? (totalRevenue / data.reduce((sum, item) => sum + item.sales, 0)).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Data</h3>
            <p className="text-gray-600">No medicine sales data available for the selected period.</p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Top Performer</span>
          </div>
          <p className="text-lg font-bold text-orange-900 mt-1 truncate">
            {data[0]?.name || 'N/A'}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Revenue</span>
          </div>
          <p className="text-lg font-bold text-green-900 mt-1">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Units Sold</span>
          </div>
          <p className="text-lg font-bold text-blue-900 mt-1">
            {data.reduce((sum, item) => sum + item.sales, 0)}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Products</span>
          </div>
          <p className="text-lg font-bold text-purple-900 mt-1">
            {data.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopMedicinesChart;