import React, { useState } from 'react';
import { X, Copy, Check, Send, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reelTitle: string;
  reelUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, reelTitle, reelUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reelUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-md p-6 border border-subtle shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-surface-hover transition"
        >
          <X size={18} />
        </button>

        <h3 className="font-heading text-xl font-bold text-white mb-1">Share Reel</h3>
        <p className="text-gray-400 font-sans text-xs mb-6 truncate">"{reelTitle}"</p>

        {/* Copy Link Section */}
        <div className="mb-6">
          <label className="block text-xs font-mono text-gray-400 mb-2">DIRECT LINK</label>
          <div className="flex items-center bg-surface border border-subtle rounded-card overflow-hidden p-1">
            <input
              type="text"
              readOnly
              value={reelUrl || window.location.href}
              className="w-full bg-transparent px-3 py-2 text-sm text-gray-300 font-sans focus:outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-primary-gradient text-white rounded font-heading font-bold text-xs flex items-center gap-1.5 shrink-0 hover:opacity-95 transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Social Share Options */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this reel: ${reelTitle}`)}&url=${encodeURIComponent(reelUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 rounded-card bg-surface hover:bg-surface-hover border border-subtle text-white font-sans text-sm transition"
          >
            <Globe size={16} className="text-mint" />
            <span>Twitter / X</span>
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(reelUrl)}&text=${encodeURIComponent(reelTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 rounded-card bg-surface hover:bg-surface-hover border border-subtle text-white font-sans text-sm transition"
          >
            <Send size={16} className="text-soft-pink" />
            <span>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
};