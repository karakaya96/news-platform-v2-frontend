'use client';

import React from 'react';
import { Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm font-medium text-muted-foreground'>Paylaş:</span>
      {shareLinks.map((link) => (
        <Button
          key={link.name}
          variant='outline'
          size='icon'
          asChild
        >
          <a
            href={link.href}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`Share on ${link.name}`}
          >
            <link.icon className='h-4 w-4' />
          </a>
        </Button>
      ))}
      <Button
        variant='outline'
        size='icon'
        onClick={handleCopyLink}
        aria-label='Copy link'
      >
        {copied ? (
          <Check className='h-4 w-4 text-green-500' />
        ) : (
          <Link2 className='h-4 w-4' />
        )}
      </Button>
    </div>
  );
}
