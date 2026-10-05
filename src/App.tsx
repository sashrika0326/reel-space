import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReelFeed } from './views/ReelFeed';
import { AdminDashboard } from './views/AdminDashboard';
import { SubscriptionModal } from './views/SubscriptionModal';
import { supabase } from './lib/supabase';
import { LogOut, Shield, Crown } from 'lucide-react';
import { SubscriptionProvider } from './context/SubscriptionContext';

function MainApp() {
  const { user, loading, signOut, signInWithGoogle } = useAuth();
  const [view, setView] = useState<'feed' | 'admin'>('feed');
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Simple Auth state for demo login/signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-void flex items-center justify-center text-mint font-mono animate-pulse">
        Loading Application...
      </div>
    );
  }

  if (!user) {
    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          alert('Check your email or log in!');
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
      } catch (err: any) {
        alert(err.message);
      }
    };

    const handleGoogleLogin = async () => {
      try {
        await signInWithGoogle();
      } catch (err: any) {
        alert(err.message || 'Failed to sign in with Google');
      }
    };

    return (
      <div className="h-screen w-screen bg-void flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-md p-8 border border-subtle shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-[#7C2CE0] via-[#E0219C] to-[#FF6B35] bg-clip-text text-transparent">
              ReelSpace
            </h1>
            <p className="text-gray-400 font-sans text-sm mt-2">Log in to view reels and manage subscriptions</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-subtle rounded-card py-3 px-4 text-white font-sans focus:outline-none focus:border-mint"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-subtle rounded-card py-3 px-4 text-white font-sans focus:outline-none focus:border-mint"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-card bg-primary-gradient text-white font-heading font-bold tracking-wide hover:opacity-95 transition shadow-lg mt-2"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-subtle"></div>
            <span className="px-3 text-xs text-gray-400 font-mono uppercase">Or continue with</span>
            <div className="flex-1 border-t border-subtle"></div>
          </div>

          {/* Google Login Button */}
         {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-card bg-surface hover:bg-surface-hover border border-subtle text-white font-heading font-medium transition shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.8-2.5 1.3-4.3 1.3-3.1 0-5.8-2.1-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center mt-6 text-xs font-mono text-gray-400 hover:text-white"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-white flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="h-16 border-b border-subtle px-6 flex items-center justify-between bg-surface/50 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <h1 className="font-heading text-xl font-bold tracking-wide bg-gradient-to-r from-[#7C2CE0] to-[#FF6B35] bg-clip-text text-transparent cursor-pointer" onClick={() => setView('feed')}>
            ReelSpace
          </h1>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setView('feed')}
              className={`px-4 py-2 rounded-card text-sm transition font-heading ${
                view === 'feed' ? 'bg-surface-hover text-mint border border-subtle' : 'text-gray-400 hover:text-white'
              }`}
            >
              Reels Feed
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => setView('admin')}
                className={`px-4 py-2 rounded-card text-sm transition font-heading flex items-center gap-1.5 ${
                  view === 'admin' ? 'bg-surface-hover text-mint border border-subtle' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shield size={16} /> Admin Uploader
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-card bg-surface border border-subtle hover:border-mint transition text-xs font-mono text-soft-pink"
          >
            <Crown size={14} />
            <span className="uppercase">{user.subscription_plan} Plan</span>
          </button>

          <button
            onClick={signOut}
            className="p-2 rounded-card bg-surface hover:bg-surface-hover text-gray-400 hover:text-white border border-subtle transition"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {view === 'feed' ? <ReelFeed onUpgradeClick={() => setIsSubModalOpen(true)} /> : <AdminDashboard />}
      </main>

      {/* Subscription & Billing Modal */}
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <MainApp />
      </SubscriptionProvider>
    </AuthProvider>
  );
}