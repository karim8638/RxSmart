import React from 'react';
import { Users, UserPlus, Activity, TrendingUp } from 'lucide-react';

interface ActivityData {
  date: string;
  logins: number;
  registrations: number;
}

interface UserActivityChartProps {
  data: ActivityData[];
}

const UserActivityChart: React.FC<UserActivityChartProps> = ({ data }) => {
  const maxLogins = Math.max(...data.map(d => d.logins));
  const maxRegistrations = Math.max(...data.map(d => d.registrations));
  const maxValue = Math.max(maxLogins, maxRegistrations);

  const totalRegistrations = data.reduce((sum, item) => sum + item.registrations, 0);
  const totalLogins = data.reduce((sum, item) => sum + item.logins, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
            <p className="text-sm text-gray-600">User registrations and login activity</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Registrations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Logins</span>
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="space-y-6">
          {/* Activity Chart */}
          <div className="relative">
            <div className="h-80 flex items-end space-x-2 p-4 bg-gradient-to-t from-gray-50 to-transparent rounded-lg">
              {data.map((item, index) => {
                const registrationHeight = maxValue > 0 ? (item.registrations / maxValue) * 100 : 0;
                const loginHeight = maxValue > 0 ? (item.logins / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                    {/* Bars */}
                    <div className="w-full flex space-x-1 items-end" style={{ height: '240px' }}>
                      {/* Registrations Bar */}
                      <div className="flex-1 relative group">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md transition-all duration-300 hover:from-indigo-600 hover:to-indigo-500"
                          style={{ height: `${registrationHeight}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.registrations} registrations
                        </div>
                      </div>
                      
                      {/* Logins Bar */}
                      <div className="flex-1 relative group">
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                          style={{ height: `${loginHeight}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.logins} logins
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
            <div className="absolute left-0 top-0 h-80 flex flex-col justify-between py-4 -ml-8">
              <span className="text-xs text-gray-500">{maxValue}</span>
              <span className="text-xs text-gray-500">{Math.round(maxValue * 0.75)}</span>
              <span className="text-xs text-gray-500">{Math.round(maxValue * 0.5)}</span>
              <span className="text-xs text-gray-500">{Math.round(maxValue * 0.25)}</span>
              <span className="text-xs text-gray-500">0</span>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Timeline</h4>
            <div className="space-y-3">
              {data.slice(-7).reverse().map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-indigo-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(item.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <UserPlus className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-600">{item.registrations}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">{item.logins}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Data</h3>
            <p className="text-gray-600">No user activity data available for the selected period.</p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">New Users</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900 mt-1">{totalRegistrations}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Logins</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{totalLogins}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Daily Average</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {data.length > 0 ? Math.round(totalRegistrations / data.length) : 0}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Peak Day</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {Math.max(...data.map(d => d.registrations + d.logins))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserActivityChart;