import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Store, Users, Shield, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

interface OrganizationData {
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
  subscription_plan: 'basic' | 'professional' | 'enterprise';
}

interface StoreData {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
}

const OrganizationSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orgData, setOrgData] = useState<OrganizationData>({
    name: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    license_number: '',
    subscription_plan: 'professional',
  });
  const [storeData, setStoreData] = useState<StoreData>({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    license_number: '',
  });

  const { user } = useAuthContext();
  const navigate = useNavigate();

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$29/month',
      features: ['1 Store', '5 Users', 'Basic Reports', 'Email Support'],
      maxStores: 1,
      maxUsers: 5,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$79/month',
      features: ['5 Stores', '25 Users', 'Advanced Analytics', 'Priority Support', 'API Access'],
      maxStores: 5,
      maxUsers: 25,
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$199/month',
      features: ['Unlimited Stores', 'Unlimited Users', 'Custom Reports', '24/7 Support', 'White Label'],
      maxStores: -1,
      maxUsers: -1,
    },
  ];

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOrgNameChange = (name: string) => {
    setOrgData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleCreateOrganization = async () => {
    setLoading(true);
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          ...orgData,
          max_stores: plans.find(p => p.id === orgData.subscription_plan)?.maxStores || 1,
          max_users: plans.find(p => p.id === orgData.subscription_plan)?.maxUsers || 5,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create first store
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert({
          organization_id: org.id,
          ...storeData,
          manager_id: user?.id,
        })
        .select()
        .single();

      if (storeError) throw storeError;

      // Update user with organization
      const { error: userError } = await supabase
        .from('users')
        .update({
          organization_id: org.id,
          role: 'admin',
        })
        .eq('id', user?.id);

      if (userError) throw userError;

      // Create store membership for the user
      const { error: memberError } = await supabase
        .from('store_members')
        .insert({
          store_id: store.id,
          user_id: user?.id,
          role_id: (await supabase
            .from('roles')
            .select('id')
            .eq('name', 'org_admin')
            .eq('is_system_role', true)
            .single()).data?.id,
          position: 'Owner',
          created_by: user?.id,
        });

      if (memberError) throw memberError;

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Set Up Your Pharmacy Organization
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create your multi-store pharmacy management system in just a few steps
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    step >= stepNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 ${
                      step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
                  <p className="text-gray-600">Select the plan that best fits your pharmacy needs</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                        orgData.subscription_plan === plan.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${plan.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                      onClick={() => setOrgData(prev => ({ ...prev, subscription_plan: plan.id as any }))}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold text-blue-600 mb-4">{plan.price}</div>
                      </div>

                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Details</h2>
                  <p className="text-gray-600">Tell us about your pharmacy organization</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      value={orgData.name}
                      onChange={(e) => handleOrgNameChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ABC Pharmacy Chain"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Slug *
                    </label>
                    <input
                      type="text"
                      value={orgData.slug}
                      onChange={(e) => setOrgData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="abc-pharmacy-chain"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be used in your organization URL</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={orgData.description}
                      onChange={(e) => setOrgData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of your pharmacy organization"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={orgData.address}
                      onChange={(e) => setOrgData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main Street, City, State, ZIP"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={orgData.phone}
                      onChange={(e) => setOrgData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={orgData.email}
                      onChange={(e) => setOrgData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contact@abcpharmacy.com"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pharmacy License Number *
                    </label>
                    <input
                      type="text"
                      value={orgData.license_number}
                      onChange={(e) => setOrgData(prev => ({ ...prev, license_number: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="PH-123456789"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">First Store Setup</h2>
                  <p className="text-gray-600">Set up your first pharmacy store location</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      value={storeData.name}
                      onChange={(e) => setStoreData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Main Branch"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Code *
                    </label>
                    <input
                      type="text"
                      value={storeData.code}
                      onChange={(e) => setStoreData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MAIN"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Unique identifier for this store</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Address *
                    </label>
                    <input
                      type="text"
                      value={storeData.address}
                      onChange={(e) => setStoreData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main Street, City, State, ZIP"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Phone *
                    </label>
                    <input
                      type="tel"
                      value={storeData.phone}
                      onChange={(e) => setStoreData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Email
                    </label>
                    <input
                      type="email"
                      value={storeData.email}
                      onChange={(e) => setStoreData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="main@abcpharmacy.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store License Number
                    </label>
                    <input
                      type="text"
                      value={storeData.license_number}
                      onChange={(e) => setStoreData(prev => ({ ...prev, license_number: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ST-123456789"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreateOrganization}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Creating...' : 'Create Organization'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSetup;