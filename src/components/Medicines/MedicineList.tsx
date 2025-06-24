import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, Calendar, Package, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Medicine } from '../../types';
import { format, isAfter, addDays } from 'date-fns';

const MedicineList: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMedicines(data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.batch_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLowStock = (medicine: Medicine) => medicine.quantity <= medicine.min_stock_level;
  const isExpiringSoon = (medicine: Medicine) => {
    const expiryDate = new Date(medicine.expiry_date);
    const thirtyDaysFromNow = addDays(new Date(), 30);
    return isAfter(thirtyDaysFromNow, expiryDate);
  };

  const handleDeleteMedicine = async (id: string) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      try {
        const { error } = await supabase
          .from('medicines')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  if (loading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
      </div>

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.map((medicine) => (
          <div key={medicine.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{medicine.name}</h3>
                  <p className="text-sm text-gray-600">{medicine.category}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingMedicine(medicine)}
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
                  <span className="text-sm font-medium">{medicine.batch_no}</span>
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
                  <span className={`text-sm font-medium ${
                    isExpiringSoon(medicine) ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {format(new Date(medicine.expiry_date), 'MMM dd, yyyy')}
                    {isExpiringSoon(medicine) && <Calendar className="w-4 h-4 inline ml-1" />}
                  </span>
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
                {isExpiringSoon(medicine) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Calendar className="w-3 h-3 mr-1" />
                    Expiring Soon
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
          <p className="text-gray-600">Try adjusting your search or add a new medicine.</p>
        </div>
      )}

      {/* Add/Edit Medicine Modal would go here */}
    </div>
  );
};

export default MedicineList;