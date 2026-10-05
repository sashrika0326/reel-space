import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FeatureConfig {
  id: string;
  name: string;
  min_tier: 'free' | 'silver' | 'gold';
}

interface SubscriptionContextType {
  features: { [key: string]: 'free' | 'silver' | 'gold' };
  canUseFeature: (featureId: string) => boolean;
  loading: boolean;
  refreshFeatures: () => Promise<void>;
}

const PLAN_HIERARCHY = { free: 0, silver: 1, gold: 2 };

const SubscriptionContext = createContext<SubscriptionContextType>({
  features: {},
  canUseFeature: () => true,
  loading: true,
  refreshFeatures: async () => {},
});

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<{ [key: string]: 'free' | 'silver' | 'gold' }>({});
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase.from('plan_features').select('*');
      if (error) throw error;
      
      const featureMap: { [key: string]: 'free' | 'silver' | 'gold' } = {};
      data?.forEach((f: FeatureConfig) => {
        featureMap[f.id] = f.min_tier;
      });
      setFeatures(featureMap);
    } catch (err) {
      console.error('Error fetching plan features:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const canUseFeature = (featureId: string): boolean => {
    // Admins bypass all feature restrictions
    if (user?.role === 'admin') return true;

    const requiredTier = features[featureId] || 'free';
    const currentPlan = user?.subscription_plan || 'free';

    return PLAN_HIERARCHY[currentPlan as keyof typeof PLAN_HIERARCHY] >= PLAN_HIERARCHY[requiredTier];
  };

  return (
    <SubscriptionContext.Provider value={{ features, canUseFeature, loading, refreshFeatures: fetchFeatures }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);