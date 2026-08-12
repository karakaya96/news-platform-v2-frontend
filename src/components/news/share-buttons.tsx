'use client';

import { Check, Copy, Mail, MessageCircle, Send, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/components/ui/button';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false);
  const tNews = useTranslations('news');
  const tShare = useTranslations('share');

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'X',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-4 w-4" />,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Telegram',
      icon: <Send className="h-4 w-4" />,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'Email',
      icon: <Mail className="h-4 w-4" />,
      href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground">{tNews('share')}</span>
      {shareLinks.map((link) => (
        <Button key={link.name} variant="outline" size="icon" asChild>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tShare('shareOn', { name: link.name })}
          >
            {link.icon}
          </a>
        </Button>
      ))}
      <Button variant="outline" size="icon" onClick={handleCopyLink} aria-label={tShare('copyLink')}>
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      {hasNativeShare && (
        <Button variant="outline" size="icon" onClick={handleNativeShare} aria-label={tShare('shareNative')}>
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
