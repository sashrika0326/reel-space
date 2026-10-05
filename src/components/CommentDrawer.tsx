import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { X, Send, MessageSquare } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    email: string;
  };
}

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reelId: string;
  reelTitle: string;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({ isOpen, onClose, reelId, reelTitle }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reelId) {
      fetchComments();
    }
  }, [isOpen, reelId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('reel_comments')
      .select('id, content, created_at, profiles(email)')
      .eq('reel_id', reelId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data as any);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setLoading(true);

    const { error } = await supabase.from('reel_comments').insert({
      reel_id: reelId,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment('');
      fetchComments();
    } else {
      alert('Error posting comment');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-void/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md h-full glass-card border-l border-subtle flex flex-col shadow-2xl bg-surface">
        {/* Header */}
        <div className="p-4 border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-mint" />
            <h3 className="font-heading font-bold text-white">Comments ({comments.length})</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full bg-surface-hover transition">
            <X size={18} />
          </button>
        </div>

        <p className="px-4 py-2 text-xs text-gray-400 font-sans border-b border-subtle/50 truncate">
          On: <span className="text-white font-medium">{reelTitle}</span>
        </p>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 font-sans text-sm">
              <MessageSquare size={32} className="mb-2 opacity-40" />
              <span>No comments yet. Be the first!</span>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-3 rounded-card bg-void/60 border border-subtle">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-mint truncate max-w-[180px]">
                    {c.profiles?.email || 'Anonymous'}
                  </span>
                  <span className="font-mono text-[10px] text-gray-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-sans text-sm text-gray-200">{c.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handlePostComment} className="p-4 border-t border-subtle bg-surface">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-void border border-subtle rounded-card px-4 py-2.5 text-sm text-white font-sans focus:outline-none focus:border-mint"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2.5 rounded-card bg-primary-gradient text-white hover:opacity-95 transition disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};