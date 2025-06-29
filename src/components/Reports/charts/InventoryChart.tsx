import React from 'react';
import { Package, Layers, DollarSign } from 'lucide-react';

interface InventoryData {
  category: string;
  count: number;
  value: number;
}

interface InventoryChartProps {
  data: InventoryData[];
}

const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const maxCount = Math.max(...data.map(d => d.count));

  // Generate colors for categories
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-orange-500',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Inventory Statistics</h3>
            <p className="text-sm text-gray-600">Stock distribution by category</p>
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donut Chart */}
          <div className="relative">
            <div className="w-80 h-80 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                {data.map((item, index) => {
                  const percentage = (item.count / totalCount) * 100;
                  const angle = (percentage / 100) * 360;
                  const startAngle = data.slice(0, index).reduce((sum, prev) => 
                    sum + ((prev.count / totalCount) * 360), 0
                  );
                  
                  const x1 = 100 + 70 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 100 + 70 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 100 + 70 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                  const y2 = 100 + 70 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                  
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  return (
                    <g key={index}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={`hsl(${index * 45}, 70%, 60%)`}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    </g>
                  );
                })}
                
                {/* Center circle */}
                <circle cx="100" cy="100" r="40" fill="white" />
                <text x="100" y="95" textAnchor="middle" className="text-sm font-semibold fill-gray-900">
                  Total
                </text>
                <text x="100" y="110" textAnchor="middle" className="text-xs fill-gray-600">
                  {totalCount} items
                </text>
              </svg>
            </div>
            
            {/* Legend */}
            <div className="mt-6 space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: `hsl(${index * 45}, 70%, 60%)` }}
                    />
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-500">
                      {((item.count / totalCount) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Stock Levels by Category</h4>
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    <span className="text-sm text-gray-600">{item.count} items</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Value: ${item.value.toFixed(2)}</span>
                    <span>Avg: ${(item.value / item.count).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Inventory Data</h3>
            <p className="text-gray-600">No inventory data available.</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Items</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{totalCount}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">${totalValue.toFixed(2)}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Categories</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">{data.length}</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryChart;