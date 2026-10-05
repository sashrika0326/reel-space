import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Upload, Film, CheckCircle, Sliders } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [minTier, setMinTier] = useState<'free' | 'silver' | 'gold'>('free');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Plan Customizer State
  const [editableFeatures, setEditableFeatures] = useState<any[]>([]);

  useEffect(() => {
    fetchEditableFeatures();
  }, []);

  const fetchEditableFeatures = async () => {
    const { data } = await supabase.from('plan_features').select('*');
    if (data) setEditableFeatures(data);
  };

  const handleTierChange = async (featureId: string, newTier: string) => {
    const { error } = await supabase
      .from('plan_features')
      .update({ min_tier: newTier })
      .eq('id', featureId);

    if (!error) {
      setEditableFeatures((prev) =>
        prev.map((f) => (f.id === featureId ? { ...f, min_tier: newTier } : f))
      );
    } else {
      alert('Error updating feature tier');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: storageError } = await supabase.storage
        .from('reels')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: publicURLData } = supabase.storage
        .from('reels')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('reels').insert({
        title,
        video_url: publicURLData.publicUrl,
        admin_id: user.id,
        min_tier: minTier, // Saves the chosen subscription requirement
      });

      if (dbError) throw dbError;

      setSuccess(true);
      setTitle('');
      setMinTier('free');
      setFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error uploading reel');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void p-6 flex flex-col items-center justify-center py-12">
      {/* Reel Uploader Card */}
      <div className="glass-card w-full max-w-lg p-8 border border-subtle shadow-2xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-card bg-surface-hover text-mint border border-subtle">
            <Film size={24} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Admin Reel Uploader</h1>
            <p className="text-gray-400 font-sans text-sm">Publish targeted video reels for users.</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-card bg-surface flex items-center gap-3 border border-mint/30 text-mint font-sans">
            <CheckCircle size={20} />
            <span>Reel uploaded and published successfully!</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2">REEL TITLE</label>
            <input
              type="text"
              placeholder="e.g. Exclusive Behind-the-Scenes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface border border-subtle rounded-card py-3 px-4 text-white font-sans focus:outline-none focus:border-mint"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2">MINIMUM REQUIRED SUBSCRIPTION TIER</label>
            <select
              value={minTier}
              onChange={(e) => setMinTier(e.target.value as 'free' | 'silver' | 'gold')}
              className="w-full bg-surface border border-subtle rounded-card py-3 px-4 text-white font-sans focus:outline-none focus:border-mint cursor-pointer"
            >
              <option value="free">Free Tier (Visible to Everyone)</option>
              <option value="silver">Silver Tier & Above</option>
              <option value="gold">Gold Tier Only (Exclusive)</option>
            </select>
            <p className="text-xs text-gray-500 font-sans mt-1">Users below this tier will see an upgrade lock screen instead of the video.</p>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2">VIDEO FILE (MP4 / WEBM)</label>
            <div className="border-2 border-dashed border-subtle rounded-card p-6 text-center hover:border-mint transition cursor-pointer bg-surface">
              <Upload className="mx-auto text-gray-400 mb-2" size={28} />
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-card file:border-0 file:text-xs file:font-mono file:bg-surface-hover file:text-mint hover:file:opacity-90"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3.5 rounded-card bg-primary-gradient text-white font-heading font-bold tracking-wide hover:opacity-95 transition shadow-lg"
          >
            {uploading ? 'Uploading to Supabase...' : 'Publish Tiered Reel'}
          </button>
        </form>
      </div>

      {/* Subscription Plan Customizer Card */}
      <div className="glass-card w-full max-w-lg p-8 border border-subtle shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-card bg-surface-hover text-mint border border-subtle">
            <Sliders size={24} />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">Subscription Plan Customizer</h1>
            <p className="text-gray-400 font-sans text-sm">Assign platform features dynamically to tiers.</p>
          </div>
        </div>

        <div className="space-y-4">
          {editableFeatures.map((feat) => (
            <div key={feat.id} className="flex items-center justify-between p-3 rounded-card bg-surface border border-subtle">
              <span className="font-sans text-sm text-white font-medium">{feat.name}</span>
              <select
                value={feat.min_tier}
                onChange={(e) => handleTierChange(feat.id, e.target.value)}
                className="bg-void border border-subtle rounded px-3 py-1.5 text-xs font-mono text-mint focus:outline-none focus:border-mint cursor-pointer"
              >
                <option value="free">Free Tier</option>
                <option value="silver">Silver Tier</option>
                <option value="gold">Gold Tier</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};