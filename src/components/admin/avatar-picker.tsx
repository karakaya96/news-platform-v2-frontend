'use client';

import { useState, useRef } from 'react';
import { Camera, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const DEFAULT_AVATARS = [
  { id: 'avataaars', label: 'Karakter', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' },
  { id: 'big-smile', label: 'Gülümseme', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=' },
  { id: 'bottts', label: 'Robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=' },
  { id: 'fun-emoji', label: 'Emoji', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=' },
  { id: 'lorelei', label: 'Lorelei', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=' },
  { id: 'micah', label: 'Micah', url: 'https://api.dicebear.com/7.x/micah/svg?seed=' },
  { id: 'notionists', label: 'Notion', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=' },
  { id: 'open-peeps', label: 'People', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=' },
  { id: 'personas', label: 'Persona', url: 'https://api.dicebear.com/7.x/personas/svg?seed=' },
  { id: 'pixel-art', label: 'Pixel', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' },
  { id: 'shapes', label: 'Şekil', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=' },
  {id: 'thumbs', label: 'Thumb', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=' },
];

interface AvatarPickerProps {
  currentAvatar: string | null;
  userName: string;
  onAvatarChange: (url: string) => void;
}

export function AvatarPicker({ currentAvatar, userName, onAvatarChange }: AvatarPickerProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectDefault = (avatar: typeof DEFAULT_AVATARS[0]) => {
    const url = `${avatar.url}${encodeURIComponent(userName)}`;
    setSelectedAvatar(url);
    onAvatarChange(url);
    setShowPicker(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Dosya boyutu 2MB\'dan küçük olmalı');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${api.getBaseUrl()}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        setSelectedAvatar(data.data.url);
        onAvatarChange(data.data.url);
        setShowPicker(false);
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
  };

  const handleRemove = () => {
    setSelectedAvatar(null);
    onAvatarChange('');
    setShowPicker(false);
  };

  const getAvatarUrl = () => {
    if (selectedAvatar) return selectedAvatar;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;
  };

  return (
    <div className="space-y-4">
      {/* Current Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <img
            src={getAvatarUrl()}
            alt={userName}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800"
          />
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="h-5 w-5 text-white" />
          </button>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPicker(!showPicker)}
          >
            {showPicker ? 'Kapat' : 'Avatar Değiştir'}
          </Button>
        </div>
      </div>

      {/* Avatar Picker Panel */}
      {showPicker && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
          {/* Upload Button */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fotoğraf Yükle</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Yükleniyor...' : 'Dosya Seç (max 2MB)'}
            </Button>
          </div>

          {/* Default Avatars */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Varsayılan Avatarlar</p>
            <div className="grid grid-cols-6 gap-2">
              {DEFAULT_AVATARS.map((avatar) => {
                const url = `${avatar.url}${encodeURIComponent(userName)}`;
                const isSelected = selectedAvatar === url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectDefault(avatar)}
                    className={`relative rounded-full overflow-hidden ring-2 transition-all hover:scale-110 ${
                      isSelected
                        ? 'ring-indigo-500 ring-offset-2'
                        : 'ring-transparent hover:ring-slate-300'
                    }`}
                    title={avatar.label}
                  >
                    <img src={url} alt={avatar.label} className="h-12 w-12" />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/30">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remove Avatar */}
          {selectedAvatar && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600"
            >
              <X className="h-4 w-4 mr-1" />
              Varsayılanı Kullan
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
