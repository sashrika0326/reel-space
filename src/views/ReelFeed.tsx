import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Heart, MessageCircle, Share2, Download, Lock, Crown } from 'lucide-react';
import { ShareModal } from '../components/ShareModal';
import { CommentDrawer } from '../components/CommentDrawer';

interface Reel {
  id: string;
  title: string;
  video_url: string;
  admin_id: string;
  min_tier: 'free' | 'silver' | 'gold';
}

const PLAN_HIERARCHY = { free: 0, silver: 1, gold: 2 };

export const ReelFeed: React.FC<{ onUpgradeClick?: () => void }> = ({ onUpgradeClick }) => {
  const { user } = useAuth();
  const { canUseFeature } = useSubscription();
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  // Interaction states
  const [likedReels, setLikedReels] = useState<{ [key: string]: boolean }>({});
  const [shareModalData, setShareModalData] = useState<{ isOpen: boolean; title: string; url: string }>({
    isOpen: false,
    title: '',
    url: '',
  });
  const [commentDrawerData, setCommentDrawerData] = useState<{ isOpen: boolean; reelId: string; title: string }>({
    isOpen: false,
    reelId: '',
    title: '',
  });

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    const { data } = await supabase.from('reels').select('*').order('created_at', { ascending: false });
    if (data) {
      setReels(data as Reel[]);
      if (data.length > 0) setActiveId(data[0].id);
    }
  };

  const userHasAccess = (minTier: 'free' | 'silver' | 'gold') => {
    if (user?.role === 'admin') return true;
    const currentPlan = user?.subscription_plan || 'free';
    return PLAN_HIERARCHY[currentPlan as keyof typeof PLAN_HIERARCHY] >= PLAN_HIERARCHY[minTier];
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-reel-id');
          if (entry.isIntersecting && id) setActiveId(id);
        });
      },
      { threshold: 0.7 }
    );

    Object.keys(videoRefs.current).forEach((id) => {
      const el = document.getElementById(`reel-container-${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [reels]);

  useEffect(() => {
    Object.keys(videoRefs.current).forEach((id) => {
      const video = videoRefs.current[id];
      if (video) {
        if (id === activeId && isPlaying) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [activeId, isPlaying]);

  const handleVideoEnded = (currentIndex: number) => {
    if (currentIndex < reels.length - 1) {
      const nextReelId = reels[currentIndex + 1].id;
      document.getElementById(`reel-container-${nextReelId}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Feature Action Handlers
  const handleToggleLike = (reelId: string) => {
    if (!canUseFeature('like_reels')) {
      onUpgradeClick?.();
      return;
    }
    setLikedReels((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const handleOpenComments = (reelId: string, reelTitle: string) => {
    if (!canUseFeature('comment_reels')) {
      onUpgradeClick?.();
      return;
    }
    setCommentDrawerData({ isOpen: true, reelId, title: reelTitle });
  };

  const handleShare = (reelTitle: string, reelUrl: string) => {
    if (!canUseFeature('share_reels')) {
      onUpgradeClick?.();
      return;
    }
    setShareModalData({ isOpen: true, title: reelTitle, url: reelUrl });
  };

  const handleDownload = async (videoUrl: string, reelTitle: string) => {
    if (!canUseFeature('download_reels')) {
      onUpgradeClick?.();
      return;
    }

    try {
      // If videoUrl is already the full public URL, you can use it directly.
      // Otherwise, you can generate the public URL using Supabase storage:
      const urlObj = new URL(videoUrl);
      const pathParts = urlObj.pathname.split('/storage/v1/object/public/reels/');
      const filePath = pathParts[1] || videoUrl.split('/').pop();

      if (!filePath) throw new Error('Invalid file path');

      // Get the direct public URL instead of a signed URL
      const { data } = supabase.storage
        .from('reels')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      const response = await fetch(publicUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${reelTitle.toLowerCase().replace(/\s+/g, '-')}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert('Download failed or unauthorized.');
    }
  };

  return (
    <div className="h-screen w-full bg-void overflow-y-scroll snap-y snap-mandatory flex flex-col items-center">
      {reels.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400 font-sans">
          No reels available yet. Check back later!
        </div>
      ) : (
        reels.map((reel, index) => {
          const hasAccess = userHasAccess(reel.min_tier);
          const isLiked = !!likedReels[reel.id];

          return (
            <div
              key={reel.id}
              id={`reel-container-${reel.id}`}
              data-reel-id={reel.id}
              className="h-screen w-full max-w-md snap-start relative flex items-center justify-center p-4"
            >
              <div className="relative h-[85vh] w-full glass-card overflow-hidden flex items-center justify-center shadow-2xl">
                {hasAccess ? (
                  <>
                    <video
                      ref={(el) => (videoRefs.current[reel.id] = el)}
                      src={reel.video_url}
                      className="h-full w-full object-cover cursor-pointer"
                      loop={false}
                      playsInline
                      muted={false}
                      onEnded={() => handleVideoEnded(index)}
                      onClick={() => setIsPlaying(!isPlaying)}
                    />

                    {/* Video Overlay Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-void via-void/50 to-transparent flex justify-between items-end pointer-events-none">
                      <div className="pointer-events-auto">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs text-mint uppercase tracking-wider bg-surface px-2 py-1 rounded border border-subtle">
                            Reel #{index + 1}
                          </span>
                          {reel.min_tier !== 'free' && (
                            <span className="font-mono text-xs text-soft-pink uppercase tracking-wider bg-surface px-2 py-1 rounded border border-subtle flex items-center gap-1">
                              <Crown size={10} /> {reel.min_tier} Only
                            </span>
                          )}
                        </div>
                        <h2 className="font-heading text-lg font-bold text-white">{reel.title}</h2>
                      </div>

                      {/* Engagement Action Bar */}
                      <div className="flex flex-col items-center gap-3 text-white pointer-events-auto">
                        <button 
                          onClick={() => handleToggleLike(reel.id)}
                          title="Like Reel"
                          className="p-3 rounded-full bg-surface/80 hover:bg-surface-hover backdrop-blur border border-subtle transition group"
                        >
                          <Heart 
                            size={20} 
                            className={`transition group-hover:scale-110 ${isLiked ? 'text-soft-pink fill-soft-pink' : 'text-white'}`} 
                          />
                        </button>
                        <button 
                          onClick={() => handleOpenComments(reel.id, reel.title)}
                          title="Comment"
                          className="p-3 rounded-full bg-surface/80 hover:bg-surface-hover backdrop-blur border border-subtle transition group"
                        >
                          <MessageCircle size={20} className="group-hover:scale-110 transition" />
                        </button>
                        <button 
                          onClick={() => handleShare(reel.title, reel.video_url)}
                          title="Share"
                          className="p-3 rounded-full bg-surface/80 hover:bg-surface-hover backdrop-blur border border-subtle transition group"
                        >
                          <Share2 size={20} className="group-hover:scale-110 transition" />
                        </button>
                        <button 
                          onClick={() => handleDownload(reel.video_url, reel.title)}
                          title="Download Reel"
                          className="p-3 rounded-full bg-surface/80 hover:bg-surface-hover backdrop-blur border border-subtle transition group"
                        >
                          <Download size={20} className="text-mint group-hover:scale-110 transition" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-surface/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center mb-4 text-soft-pink border border-subtle shadow-lg">
                      <Lock size={26} />
                    </div>
                    <span className="font-mono text-xs text-mint uppercase tracking-widest mb-1">
                      Exclusive {reel.min_tier.toUpperCase()} Reel
                    </span>
                    <h3 className="font-heading text-xl font-bold mb-2">{reel.title}</h3>
                    <p className="text-gray-400 font-sans text-sm mb-6">
                      This video is restricted to our <span className="text-soft-pink font-mono uppercase">{reel.min_tier}</span> subscribers and above.
                    </p>
                    <button
                      onClick={onUpgradeClick}
                      className="px-6 py-3 rounded-card bg-primary-gradient text-white font-heading font-bold tracking-wide hover:opacity-95 transition shadow-lg"
                    >
                      Upgrade to Unlock
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData({ isOpen: false, title: '', url: '' })}
        reelTitle={shareModalData.title}
        reelUrl={shareModalData.url}
      />

      {/* Comment Drawer */}
      <CommentDrawer
        isOpen={commentDrawerData.isOpen}
        onClose={() => setCommentDrawerData({ isOpen: false, reelId: '', title: '' })}
        reelId={commentDrawerData.reelId}
        reelTitle={commentDrawerData.title}
      />
    </div>
  );
};