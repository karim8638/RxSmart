import React, { useState, useEffect } from 'react';
import { Crown, Check, Clock, X, Calendar, DollarSign, Star, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import { format, isAfter } from 'date-fns';

interface UserSubscription {
  id: string;
  plan: string;
  price: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
}

const SubscriptionStatus: React.FC = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return { status: 'none', label: 'No Subscription', color: 'text-gray-600' };
    
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const isExpired = isAfter(now, endDate);

    if (!subscription.is_active && !isExpired) {
      return { status: 'pending', label: 'Pending Approval', color: 'text-yellow-600' };
    } else if (subscription.is_active && !isExpired) {
      return { status: 'active', label: 'Active', color: 'text-green-600' };
    } else {
      return { status: 'expired', label: 'Expired', color: 'text-red-600' };
    }
  };

  const proFeatures = [
    { icon: Star, text: 'Unlimited patient records' },
    { icon: Zap, text: 'Advanced analytics & reports' },
    { icon: Crown, text: 'Priority customer support' },
    { icon: Check, text: 'Multi-branch management' },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const statusInfo = getSubscriptionStatus();

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
            <p className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </p>
          </div>
        </div>
        
        {statusInfo.status === 'pending' && (
          <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Under Review</span>
          </div>
        )}
        
        {statusInfo.status === 'active' && (
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Pro Active</span>
          </div>
        )}
      </div>

      {subscription ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Plan</span>
              </div>
              <p className="font-semibold text-gray-900 capitalize">
                {subscription.plan} Pro
              </p>
            </div>
            
            <div className="bg-white/60 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Price</span>
              </div>
              <p className="font-semibold text-gray-900">
                ${subscription.price}/{subscription.plan === 'monthly' ? 'month' : 'year'}
              </p>
            </div>
          </div>

          {subscription.is_active && (
            <div className="bg-white/60 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Valid Until</span>
              </div>
              <p className="font-semibold text-gray-900">
                {format(new Date(subscription.end_date), 'MMMM dd, yyyy')}
              </p>
            </div>
          )}

          {statusInfo.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Your subscription request is being reviewed by our admin team. 
                You'll be notified once it's approved and activated.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="mb-4">
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Upgrade to Pro</h4>
            <p className="text-gray-600 mb-6">
              Unlock advanced features and take your pharmacy management to the next level
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                <feature.icon className="w-4 h-4 text-purple-600" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          <a
            href="/subscription-request"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Crown className="w-5 h-5" />
            <span>Upgrade Now</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;