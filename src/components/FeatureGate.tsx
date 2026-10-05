import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  requiredPlan: 'silver' | 'gold';
  children: React.ReactNode;
  onUpgradeClick?: () => void;
}

const PLAN_HIERARCHY = { free: 0, silver: 1, gold: 2 };

export const FeatureGate: React.FC<FeatureGateProps> = ({ requiredPlan, children, onUpgradeClick }) => {
  const { user } = useAuth();
  
  // Admins bypass all subscription and feature restrictions
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  const currentPlan = user?.subscription_plan || 'free';
  const hasAccess = PLAN_HIERARCHY[currentPlan as keyof typeof PLAN_HIERARCHY] >= PLAN_HIERARCHY[requiredPlan];

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="glass-card p-6 text-center border border-subtle max-w-md mx-auto my-4">
      <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-4 text-soft-pink">
        <Lock size={24} />
      </div>
      <h3 className="font-heading text-xl font-bold mb-2">Premium Feature Locked</h3>
      <p className="text-gray-400 font-sans text-sm mb-6">
        Upgrade to our <span className="text-mint font-mono uppercase">{requiredPlan}</span> plan to unlock this feature and enjoy an enhanced experience.
      </p>
      <button
        onClick={onUpgradeClick}
        className="w-full py-3 rounded-card bg-primary-gradient text-white font-heading font-bold tracking-wide hover:opacity-95 transition shadow-lg"
      >
        Upgrade Plan Now
      </button>
    </div>
  );
};