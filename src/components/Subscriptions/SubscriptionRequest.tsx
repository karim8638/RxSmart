import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Clock, Star, Shield, Zap, Users, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

const SubscriptionRequest: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const plans = {
    monthly: {
      name: 'Monthly Pro',
      price: 29.99,
      period: 'month',
      savings: null,
    },
    yearly: {
      name: 'Yearly Pro',
      price: 299.99,
      period: 'year',
      savings: 'Save $59.89',
    },
  };

  const features = [
    { icon: Users, text: 'Unlimited patient records' },
    { icon: BarChart3, text: 'Advanced analytics & reports' },
    { icon: Shield, text: 'Enhanced security features' },
    { icon: Zap, text: 'Priority customer support' },
    { icon: Crown, text: 'Multi-branch management' },
    { icon: Star, text: 'Custom integrations' },
  ];

  const handleSubmitRequest = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const plan = plans[selectedPlan];
      const endDate = new Date();
      if (selectedPlan === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan: selectedPlan,
          price: plan.price,
          is_active: false, // Will be activated by admin
          end_date: endDate.toISOString(),
        });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      console.error('Error submitting subscription request:', error);
      alert('Failed to submit subscription request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your subscription request has been submitted successfully. Our admin team will review and activate your subscription within 24 hours.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Status: Pending Approval</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upgrade to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pro</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Unlock advanced features and take your pharmacy management to the next level
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Features Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What's included</h2>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2">✨ Special Launch Offer</h3>
                <p className="text-gray-600 text-sm">
                  Get your first month free when you upgrade to yearly plan. Limited time offer!
                </p>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose your plan</h2>
              
              {/* Plan Toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    selectedPlan === 'monthly'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 relative ${
                    selectedPlan === 'yearly'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  {plans.yearly.savings && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                      Save 17%
                    </span>
                  )}
                </button>
              </div>

              {/* Selected Plan Details */}
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  ${plans[selectedPlan].price}
                  <span className="text-lg text-gray-500 font-normal">/{plans[selectedPlan].period}</span>
                </div>
                {plans[selectedPlan].savings && (
                  <div className="text-green-600 font-semibold">{plans[selectedPlan].savings}</div>
                )}
              </div>

              {/* Request Button */}
              <button
                onClick={handleSubmitRequest}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Request...</span>
                  </div>
                ) : (
                  'Request Subscription'
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Your request will be reviewed by our admin team within 24 hours
              </p>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>24h Approval</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Premium Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequest;