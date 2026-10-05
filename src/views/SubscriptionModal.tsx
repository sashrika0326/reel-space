import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CreditCard, CheckCircle, X } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'silver' | 'gold'>(user?.subscription_plan || 'free');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Dummy payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  if (!isOpen) return null;

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: selectedPlan, subscription_status: 'active' })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setSuccessMsg('Subscription updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Error updating subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ subscription_plan: 'free', subscription_status: 'canceled' })
        .eq('id', user.id);

      await refreshProfile();
      setSuccessMsg('Subscription canceled successfully.');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-void/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-xl p-8 relative border border-subtle">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="font-heading text-2xl font-bold mb-2">Manage Subscription</h2>
        <p className="text-gray-400 font-sans text-sm mb-6">Choose your tier or update your billing details instantly.</p>

        {successMsg && (
          <div className="mb-6 p-4 rounded-card bg-surface flex items-center gap-3 border border-mint/30 text-mint font-sans">
            <CheckCircle size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Plan Selectors */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(['free', 'silver', 'gold'] as const).map((plan) => (
            <button
              key={plan}
              type="button"
              onClick={() => setSelectedPlan(plan)}
              className={`p-4 rounded-card border text-left transition ${
                selectedPlan === plan
                  ? 'border-mint bg-surface-hover shadow-lg'
                  : 'border-subtle bg-surface hover:border-gray-500'
              }`}
            >
              <div className="font-mono uppercase text-xs text-soft-pink mb-1">{plan}</div>
              <div className="font-heading font-bold text-lg capitalize">{plan} Tier</div>
            </button>
          ))}
        </div>

        {/* Dummy Payment Form */}
        {selectedPlan !== 'free' && (
          <form onSubmit={handleUpdateSubscription} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">CARD NUMBER (DUMMY)</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-surface border border-subtle rounded-card py-2.5 pl-10 pr-4 text-white font-mono focus:outline-none focus:border-mint"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">EXPIRY DATE</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full bg-surface border border-subtle rounded-card py-2.5 px-4 text-white font-mono focus:outline-none focus:border-mint"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full bg-surface border border-subtle rounded-card py-2.5 px-4 text-white font-mono focus:outline-none focus:border-mint"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-card bg-primary-gradient text-white font-heading font-bold tracking-wide hover:opacity-95 transition shadow-lg mt-2"
            >
              {loading ? 'Processing...' : `Confirm & Upgrade to ${selectedPlan.toUpperCase()}`}
            </button>
          </form>
        )}

        {selectedPlan === 'free' && (
          <button
            onClick={handleUpdateSubscription}
            disabled={loading}
            className="w-full py-3 rounded-card bg-surface-hover border border-subtle text-white font-heading font-bold tracking-wide hover:border-gray-400 transition mb-4"
          >
            {loading ? 'Processing...' : 'Switch to Free Plan'}
          </button>
        )}

        {user?.subscription_plan !== 'free' && (
          <button
            onClick={handleCancelSubscription}
            disabled={loading}
            className="w-full py-2 text-xs font-mono text-soft-pink hover:underline text-center"
          >
            Cancel Active Subscription
          </button>
        )}
      </div>
    </div>
  );
};