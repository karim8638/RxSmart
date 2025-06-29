import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, Calendar, Package, Edit, Trash2, Wifi, WifiOff, Scan, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Medicine } from '../../types';
import { format, isAfter, addDays, differenceInDays } from 'date-fns';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import AddMedicineForm from './AddMedicineForm';
import ExpiryTracker from './ExpiryTracker';

const MedicineList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState<'medicines' | 'expiry'>('medicines');

  // Use real-time data hook
  const {
    data: medicines,
    loading,
    error,
    refresh,
  } = useRealtimeData<Medicine>({
    table: 'medicines',
    orderBy: { column: 'name', ascending: true },
    cacheKey: 'medicines_list',
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.batch_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLowStock = (medicine: Medicine) => medicine.quantity <= medicine.min_stock_level;
  
  const getExpiryStatus = (medicine: Medicine) => {
    const expiryDate = new Date(medicine.expiry_date);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(expiryDate, today);
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600 bg-red-100', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'critical', color: 'text-orange-600 bg-orange-100', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', color: 'text-yellow-600 bg-yellow-100', days: daysUntilExpiry };
    } else {
      return { status: 'good', color: 'text-green-600 bg-green-100', days: daysUntilExpiry };
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      try {
        const { error } = await supabase
          .from('medicines')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting medicine:', error);
        alert('Failed to delete medicine. Please try again.');
      }
    }
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingMedicine(null);
  };

  const handleFormSuccess = () => {
    refresh();
  };

  // Count medicines by expiry status
  const expiryStats = medicines.reduce((acc, medicine) => {
    const status = getExpiryStatus(medicine).status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading && medicines.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Medicine Management</h1>
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
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medicine</span>
        </button>
      </div>

      {error && !isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-5 h-5" />
            <span>You're offline. Showing cached data. Changes will sync when you're back online.</span>
          </div>
        </div>
      )}

      {error && isOnline && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>Error loading medicines: {error}</span>
            <button
              onClick={refresh}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Expiry Alerts Summary */}
      {(expiryStats.expired > 0 || expiryStats.critical > 0 || expiryStats.warning > 0) && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Expiry Alerts</h3>
                <div className="flex items-center space-x-4 text-sm text-red-700">
                  {expiryStats.expired > 0 && (
                    <span>{expiryStats.expired} expired</span>
                  )}
                  {expiryStats.critical > 0 && (
                    <span>{expiryStats.critical} critical (≤7 days)</span>
                  )}
                  {expiryStats.warning > 0 && (
                    <span>{expiryStats.warning} warning (≤30 days)</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('expiry')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>View Expiry Tracker</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-0">
            <button
              onClick={() => setActiveTab('medicines')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'medicines'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Medicine Inventory</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {medicines.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('expiry')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'expiry'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Expiry Tracker</span>
              {(expiryStats.expired || 0) + (expiryStats.critical || 0) + (expiryStats.warning || 0) > 0 && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  {(expiryStats.expired || 0) + (expiryStats.critical || 0) + (expiryStats.warning || 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'medicines' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search medicines by name, batch number, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Medicine Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedicines.map((medicine) => {
                  const expiryStatus = getExpiryStatus(medicine);
                  
                  return (
                    <div key={medicine.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{medicine.name}</h3>
                            <p className="text-sm text-gray-600">{medicine.category}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditMedicine(medicine)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMedicine(medicine.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Batch No:</span>
                            <span className="text-sm font-medium font-mono">{medicine.batch_no}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <span className={`text-sm font-medium ${
                              isLowStock(medicine) ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {medicine.quantity}
                              {isLowStock(medicine) && <AlertTriangle className="w-4 h-4 inline ml-1" />}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Price:</span>
                            <span className="text-sm font-medium">${medicine.price.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Expiry:</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${
                                expiryStatus.status === 'expired' ? 'text-red-600' :
                                expiryStatus.status === 'critical' ? 'text-orange-600' :
                                expiryStatus.status === 'warning' ? 'text-yellow-600' : 'text-gray-900'
                              }`}>
                                {format(new Date(medicine.expiry_date), 'MMM dd, yyyy')}
                              </span>
                              {expiryStatus.status !== 'good' && (
                                <Calendar className="w-4 h-4 text-current" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Indicators */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {isLowStock(medicine) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Package className="w-3 h-3 mr-1" />
                              Low Stock
                            </span>
                          )}
                          
                          {expiryStatus.status === 'expired' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Calendar className="w-3 h-3 mr-1" />
                              Expired
                            </span>
                          )}
                          
                          {expiryStatus.status === 'critical' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Expires in {expiryStatus.days} days
                            </span>
                          )}
                          
                          {expiryStatus.status === 'warning' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Expires in {expiryStatus.days} days
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredMedicines.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search or add a new medicine.' : 'Get started by adding your first medicine.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'expiry' && (
            <ExpiryTracker medicines={medicines} onRefresh={refresh} />
          )}
        </div>
      </div>

      {/* Add/Edit Medicine Modal */}
      <AddMedicineForm
        isOpen={showAddForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        editingMedicine={editingMedicine}
      />
    </div>
  );
};

export default MedicineList;