import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Scan, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Medicine } from '../../types';
import { useAutoSave } from '../../hooks/useAutoSave';
import AutoSaveIndicator from '../Common/AutoSaveIndicator';
import RestoreDataBanner from '../Common/RestoreDataBanner';
import BarcodeScanner from './BarcodeScanner';
import { differenceInDays, format } from 'date-fns';

interface AddMedicineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingMedicine?: Medicine | null;
}

interface MedicineFormData {
  name: string;
  batch_no: string;
  expiry_date: string;
  quantity: number;
  price: number;
  cost_price: number;
  category: string;
  description: string;
  manufacturer: string;
  min_stock_level: number;
  barcode?: string;
}

const AddMedicineForm: React.FC<AddMedicineFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingMedicine,
}) => {
  const [formData, setFormData] = useState<MedicineFormData>({
    name: '',
    batch_no: '',
    expiry_date: '',
    quantity: 0,
    price: 0,
    cost_price: 0,
    category: '',
    description: '',
    manufacturer: '',
    min_stock_level: 10,
    barcode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | 'pending'>('pending');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [expiryWarning, setExpiryWarning] = useState<string | null>(null);

  // Auto-save functionality
  const {
    savedData,
    restoreData,
    clearSavedData,
    hasSavedData,
  } = useAutoSave({
    key: editingMedicine ? `medicine_edit_${editingMedicine.id}` : 'medicine_add',
    data: formData,
    delay: 2000,
    onSave: (data) => {
      setSaveStatus('saved');
      setLastSaved(new Date());
    },
  });

  // Initialize form data
  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name,
        batch_no: editingMedicine.batch_no,
        expiry_date: editingMedicine.expiry_date,
        quantity: editingMedicine.quantity,
        price: editingMedicine.price,
        cost_price: editingMedicine.cost_price,
        category: editingMedicine.category,
        description: editingMedicine.description || '',
        manufacturer: editingMedicine.manufacturer || '',
        min_stock_level: editingMedicine.min_stock_level,
        barcode: (editingMedicine as any).barcode || '',
      });
    } else {
      // Reset form for new medicine
      setFormData({
        name: '',
        batch_no: '',
        expiry_date: '',
        quantity: 0,
        price: 0,
        cost_price: 0,
        category: '',
        description: '',
        manufacturer: '',
        min_stock_level: 10,
        barcode: '',
      });
    }
  }, [editingMedicine, isOpen]);

  // Check expiry date for warnings
  useEffect(() => {
    if (formData.expiry_date) {
      const expiryDate = new Date(formData.expiry_date);
      const today = new Date();
      const daysUntilExpiry = differenceInDays(expiryDate, today);

      if (daysUntilExpiry < 0) {
        setExpiryWarning('⚠️ This medicine has already expired!');
      } else if (daysUntilExpiry <= 30) {
        setExpiryWarning(`⚠️ This medicine expires in ${daysUntilExpiry} days`);
      } else if (daysUntilExpiry <= 90) {
        setExpiryWarning(`ℹ️ This medicine expires in ${daysUntilExpiry} days`);
      } else {
        setExpiryWarning(null);
      }
    } else {
      setExpiryWarning(null);
    }
  }, [formData.expiry_date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSaveStatus('pending');
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' || name === 'cost_price' || name === 'min_stock_level'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleBarcodeScanned = (barcode: string, medicineData?: any) => {
    setFormData(prev => ({
      ...prev,
      barcode,
      ...(medicineData && {
        name: medicineData.name,
        batch_no: medicineData.batch_no,
        expiry_date: medicineData.expiry_date,
        manufacturer: medicineData.manufacturer || prev.manufacturer,
        category: medicineData.category || prev.category,
      }),
    }));
    
    setSaveStatus('pending');
    setShowBarcodeScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaveStatus('saving');

    try {
      if (editingMedicine) {
        const { error } = await supabase
          .from('medicines')
          .update(formData)
          .eq('id', editingMedicine.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('medicines')
          .insert([formData]);

        if (error) throw error;
      }

      setSaveStatus('saved');
      clearSavedData();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving medicine:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = () => {
    const restored = restoreData();
    if (restored) {
      setFormData(restored);
      setSaveStatus('saved');
    }
  };

  const handleDismissRestore = () => {
    clearSavedData();
  };

  const categories = [
    'Antibiotics',
    'Pain Relief',
    'Vitamins',
    'Cardiovascular',
    'Diabetes',
    'Respiratory',
    'Digestive',
    'Dermatology',
    'Neurology',
    'Other',
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              <div className="flex items-center space-x-3">
                <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved || undefined} />
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {hasSavedData && !editingMedicine && (
              <RestoreDataBanner
                onRestore={handleRestore}
                onDismiss={handleDismissRestore}
                dataType="medicine form"
                lastSaved={savedData ? new Date() : undefined}
              />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Barcode Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Barcode Scanner</h3>
                    <p className="text-blue-700 text-sm">Scan or enter barcode to auto-fill medicine details</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBarcodeScanner(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Scan className="w-5 h-5" />
                    <span>Scan Barcode</span>
                  </button>
                </div>
                
                <div>
                  <label htmlFor="barcode" className="block text-sm font-medium text-blue-800 mb-2">
                    Barcode (Optional)
                  </label>
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Enter barcode manually or use scanner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter medicine name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="batch_no" className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    id="batch_no"
                    name="batch_no"
                    value={formData.batch_no}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter batch number"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="expiry_date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        expiryWarning ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {expiryWarning && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      </div>
                    )}
                  </div>
                  {expiryWarning && (
                    <p className="mt-1 text-sm text-yellow-700">{expiryWarning}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    id="min_stock_level"
                    name="min_stock_level"
                    value={formData.min_stock_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter minimum stock level"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price *
                  </label>
                  <input
                    type="number"
                    id="cost_price"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter cost price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter selling price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter manufacturer name"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter medicine description"
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : editingMedicine ? 'Update Medicine' : 'Add Medicine'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScanResult={handleBarcodeScanned}
      />
    </>
  );
};

export default AddMedicineForm;