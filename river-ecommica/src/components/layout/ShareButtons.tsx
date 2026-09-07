'use client';

import { useState, useEffect } from 'react';

interface ShareButtonsProps {
  title: string;
  /** 'light' 用于白色背景，'dark' 用于暗色背景（如 hero 区域） */
  variant?: 'light' | 'dark';
  labels?: {
    share: string;
  };
}

export function ShareButtons({ title, variant = 'light', labels }: ShareButtonsProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const xUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  const isDark = variant === 'dark';
  const labelClass = isDark
    ? 'text-xs text-white/70 font-medium mr-1'
    : 'text-xs text-muted-foreground font-medium mr-1';
  const fbClass = isDark
    ? 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-white hover:bg-[#1877F2] transition-all duration-200'
    : 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-200';
  const xClass = isDark
    ? 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-white hover:bg-black transition-all duration-200'
    : 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/10 text-black hover:bg-black hover:text-white transition-all duration-200';

  return (
    <div className="flex items-center gap-2 mt-3 mb-1">
      {labels?.share && (
        <span className={labelClass}>{labels.share}</span>
      )}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={fbClass}
      >
        {/* Facebook SVG icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={xClass}
      >
        {/* X (Twitter) SVG icon */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
    </div>
  );
}
