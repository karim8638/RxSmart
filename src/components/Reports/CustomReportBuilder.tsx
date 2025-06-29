import React, { useState } from 'react';
import {
  Plus,
  X,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Save,
  Eye,
  Settings,
  Database,
  Layers,
  Target,
} from 'lucide-react';

interface ReportField {
  id: string;
  name: string;
  type: 'dimension' | 'metric';
  dataType: 'string' | 'number' | 'date';
  table: string;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: string | number;
  value2?: string | number;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  chartType: 'bar' | 'line' | 'pie' | 'table';
  dimensions: string[];
  metrics: string[];
  filters: ReportFilter[];
  dateRange: {
    start: string;
    end: string;
  };
  groupBy?: string;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

const CustomReportBuilder: React.FC = () => {
  const [report, setReport] = useState<CustomReport>({
    id: '',
    name: '',
    description: '',
    chartType: 'bar',
    dimensions: [],
    metrics: [],
    filters: [],
    dateRange: {
      start: '',
      end: '',
    },
    sortOrder: 'desc',
  });

  const [activeStep, setActiveStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  const availableFields: ReportField[] = [
    // Sales fields
    { id: 'sales.created_at', name: 'Sale Date', type: 'dimension', dataType: 'date', table: 'sales' },
    { id: 'sales.total_amount', name: 'Sale Amount', type: 'metric', dataType: 'number', table: 'sales' },
    { id: 'sales.payment_method', name: 'Payment Method', type: 'dimension', dataType: 'string', table: 'sales' },
    { id: 'sales.payment_status', name: 'Payment Status', type: 'dimension', dataType: 'string', table: 'sales' },
    
    // Medicine fields
    { id: 'medicines.name', name: 'Medicine Name', type: 'dimension', dataType: 'string', table: 'medicines' },
    { id: 'medicines.category', name: 'Medicine Category', type: 'dimension', dataType: 'string', table: 'medicines' },
    { id: 'medicines.quantity', name: 'Stock Quantity', type: 'metric', dataType: 'number', table: 'medicines' },
    { id: 'medicines.price', name: 'Medicine Price', type: 'metric', dataType: 'number', table: 'medicines' },
    
    // Patient fields
    { id: 'patients.name', name: 'Patient Name', type: 'dimension', dataType: 'string', table: 'patients' },
    { id: 'patients.created_at', name: 'Registration Date', type: 'dimension', dataType: 'date', table: 'patients' },
    
    // User fields
    { id: 'users.role', name: 'User Role', type: 'dimension', dataType: 'string', table: 'users' },
    { id: 'users.created_at', name: 'User Join Date', type: 'dimension', dataType: 'date', table: 'users' },
  ];

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
    { id: 'line', name: 'Line Chart', icon: TrendingUp, description: 'Show trends over time' },
    { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Show proportions of a whole' },
    { id: 'table', name: 'Data Table', icon: Database, description: 'Display raw data in rows and columns' },
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'between', label: 'Between' },
  ];

  const addDimension = (fieldId: string) => {
    if (!report.dimensions.includes(fieldId)) {
      setReport(prev => ({
        ...prev,
        dimensions: [...prev.dimensions, fieldId],
      }));
    }
  };

  const addMetric = (fieldId: string) => {
    if (!report.metrics.includes(fieldId)) {
      setReport(prev => ({
        ...prev,
        metrics: [...prev.metrics, fieldId],
      }));
    }
  };

  const removeDimension = (fieldId: string) => {
    setReport(prev => ({
      ...prev,
      dimensions: prev.dimensions.filter(d => d !== fieldId),
    }));
  };

  const removeMetric = (fieldId: string) => {
    setReport(prev => ({
      ...prev,
      metrics: prev.metrics.filter(m => m !== fieldId),
    }));
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
    };
    setReport(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter],
    }));
  };

  const updateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setReport(prev => ({
      ...prev,
      filters: prev.filters.map(filter =>
        filter.id === filterId ? { ...filter, ...updates } : filter
      ),
    }));
  };

  const removeFilter = (filterId: string) => {
    setReport(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId),
    }));
  };

  const getFieldByName = (fieldId: string) => {
    return availableFields.find(f => f.id === fieldId);
  };

  const steps = [
    { id: 1, name: 'Basic Info', icon: Settings },
    { id: 2, name: 'Data Selection', icon: Database },
    { id: 3, name: 'Visualization', icon: BarChart3 },
    { id: 4, name: 'Filters', icon: Filter },
    { id: 5, name: 'Preview', icon: Eye },
  ];

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Name
              </label>
              <input
                type="text"
                value={report.name}
                onChange={(e) => setReport(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter report name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={report.description}
                onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this report shows"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={report.dateRange.start}
                  onChange={(e) => setReport(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={report.dateRange.end}
                  onChange={(e) => setReport(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Fields */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Fields</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          field.type === 'dimension' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{field.name}</p>
                          <p className="text-xs text-gray-500">{field.table}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {field.type === 'dimension' && (
                          <button
                            onClick={() => addDimension(field.id)}
                            disabled={report.dimensions.includes(field.id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors disabled:opacity-50"
                          >
                            Add as Dimension
                          </button>
                        )}
                        {field.type === 'metric' && (
                          <button
                            onClick={() => addMetric(field.id)}
                            disabled={report.metrics.includes(field.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            Add as Metric
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Fields */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Fields</h3>
                
                {/* Dimensions */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Dimensions</h4>
                  <div className="space-y-2">
                    {report.dimensions.map((dimensionId) => {
                      const field = getFieldByName(dimensionId);
                      return (
                        <div key={dimensionId} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-blue-900">{field?.name}</span>
                          <button
                            onClick={() => removeDimension(dimensionId)}
                            className="p-1 hover:bg-blue-200 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-blue-700" />
                          </button>
                        </div>
                      );
                    })}
                    {report.dimensions.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No dimensions selected</p>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Metrics</h4>
                  <div className="space-y-2">
                    {report.metrics.map((metricId) => {
                      const field = getFieldByName(metricId);
                      return (
                        <div key={metricId} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-green-900">{field?.name}</span>
                          <button
                            onClick={() => removeMetric(metricId)}
                            className="p-1 hover:bg-green-200 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-green-700" />
                          </button>
                        </div>
                      );
                    })}
                    {report.metrics.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No metrics selected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Visualization Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chartTypes.map((chart) => (
                  <button
                    key={chart.id}
                    onClick={() => setReport(prev => ({ ...prev, chartType: chart.id as any }))}
                    className={`p-6 border-2 rounded-lg transition-colors text-left ${
                      report.chartType === chart.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <chart.icon className={`w-6 h-6 ${
                        report.chartType === chart.id ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <h4 className="font-semibold text-gray-900">{chart.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{chart.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group By
                </label>
                <select
                  value={report.groupBy || ''}
                  onChange={(e) => setReport(prev => ({ ...prev, groupBy: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No grouping</option>
                  {report.dimensions.map((dimensionId) => {
                    const field = getFieldByName(dimensionId);
                    return (
                      <option key={dimensionId} value={dimensionId}>
                        {field?.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <select
                  value={report.sortOrder}
                  onChange={(e) => setReport(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={addFilter}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Filter</span>
              </button>
            </div>

            <div className="space-y-4">
              {report.filters.map((filter) => (
                <div key={filter.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field
                      </label>
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select field</option>
                        {availableFields.map((field) => (
                          <option key={field.id} value={field.id}>
                            {field.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operator
                      </label>
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, { operator: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {operators.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter value"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {report.filters.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No filters added. Click "Add Filter" to create one.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Report Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{report.name || 'Untitled Report'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chart Type:</span>
                      <span className="font-medium capitalize">{report.chartType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-medium">{report.dimensions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metrics:</span>
                      <span className="font-medium">{report.metrics.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Filters:</span>
                      <span className="font-medium">{report.filters.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Selected Fields</h4>
                  <div className="space-y-2">
                    {report.dimensions.map((dimensionId) => {
                      const field = getFieldByName(dimensionId);
                      return (
                        <div key={dimensionId} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm">{field?.name}</span>
                        </div>
                      );
                    })}
                    {report.metrics.map((metricId) => {
                      const field = getFieldByName(metricId);
                      return (
                        <div key={metricId} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">{field?.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mock Chart Preview */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <h5 className="font-medium text-gray-700 mb-3">Chart Preview</h5>
                <div className="h-48 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Chart preview will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Report Builder</h1>
        <p className="text-gray-600">Create custom reports with your own data selections and visualizations</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeStep === step.id
                    ? 'bg-blue-100 text-blue-700'
                    : activeStep > step.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <step.icon className="w-5 h-5" />
                <span className="font-medium">{step.name}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  activeStep > step.id ? 'bg-green-300' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-3">
          {activeStep === 5 ? (
            <>
              <button className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Save className="w-4 h-4" />
                <span>Save Report</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;