'use client';

import { useState, useRef } from 'react';
import { Camera, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getAvatarUrl } from '@/lib/utils';

const DEFAULT_AVATARS = [
  { id: 'avataaars', label: 'Karakter' },
  { id: 'big-smile', label: 'Gülümseme' },
  { id: 'bottts', label: 'Robot' },
  { id: 'fun-emoji', label: 'Emoji' },
  { id: 'lorelei', label: 'Lorelei' },
  { id: 'micah', label: 'Micah' },
  { id: 'notionists', label: 'Notion' },
  { id: 'open-peeps', label: 'People' },
  { id: 'personas', label: 'Persona' },
  { id: 'pixel-art', label: 'Pixel' },
  { id: 'shapes', label: 'Şekil' },
  { id: 'thumbs', label: 'Thumb' },
];

function getStyleAvatarUrl(styleId: string, userName: string): string {
  return `https://api.dicebear.com/7.x/${styleId}/svg?seed=${encodeURIComponent(userName || 'User')}`;
}

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

  const handleSelectDefault = (styleId: string) => {
    const url = getStyleAvatarUrl(styleId, userName);
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

      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${api.getBaseUrl()}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        setSelectedAvatar(data.data.url);
        onAvatarChange(data.data.url);
        setShowPicker(false);
      } else {
        alert(data.error || 'Yükleme başarısız');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Yükleme sırasında hata oluştu');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = () => {
    setSelectedAvatar(null);
    onAvatarChange('');
    setShowPicker(false);
  };

  return (
    <div className="space-y-4">
      {/* Current Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <img
            src={getAvatarUrl(selectedAvatar, userName)}
            alt={userName}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800"
          />
          <button
            type="button"
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
                const url = getStyleAvatarUrl(avatar.id, userName);
                const isSelected = selectedAvatar === url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectDefault(avatar.id)}
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
