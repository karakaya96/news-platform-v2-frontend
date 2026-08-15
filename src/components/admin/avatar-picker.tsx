'use client';

import { Camera, Check, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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

interface MediaFile {
  id: number;
  key: string;
  url: string;
  mimeType: string;
}

interface AvatarPickerProps {
  currentAvatar: string | null;
  userName: string;
  onAvatarChange: (url: string) => void;
}

export function AvatarPicker({ currentAvatar, userName, onAvatarChange }: AvatarPickerProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [myMedia, setMyMedia] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPicker && myMedia.length === 0) {
      fetchMyMedia();
    }
  }, [showPicker]);

  async function fetchMyMedia() {
    setLoadingMedia(true);
    try {
      const res = await api.get<{ files: MediaFile[] }>('/api/user/media?page=1&limit=50');
      if (res.success && res.data?.files) {
        setMyMedia(res.data.files.filter((f) => f.mimeType.startsWith('image/')));
      }
    } catch {}
    setLoadingMedia(false);
  }

  const handleSelectMedia = (file: MediaFile) => {
    setSelectedAvatar(file.url);
    onAvatarChange(file.url);
  };

  const handleSelectDefault = (styleId: string) => {
    const url = getStyleAvatarUrl(styleId, userName);
    setSelectedAvatar(url);
    onAvatarChange(url);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Dosya boyutu 2MB'dan küçük olmalı");
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${api.getBaseUrl()}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        setSelectedAvatar(data.data.url);
        onAvatarChange(data.data.url);
        fetchMyMedia();
      } else {
        setUploadError(data.error || 'Yükleme başarısız');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Yükleme sırasında hata oluştu');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = () => {
    setSelectedAvatar(null);
    onAvatarChange('');
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
          {/* Upload Section */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fotoğraf Yükle
            </p>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
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
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Yükleniyor...' : 'Dosya Seç (max 2MB)'}
                </Button>
                {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
              </div>

              {/* User's uploaded media */}
              <div className="flex-1 min-w-0">
                {loadingMedia ? (
                  <div className="flex items-center justify-center h-10 text-xs text-slate-400">
                    Yükleniyor...
                  </div>
                ) : myMedia.length > 0 ? (
                  <div
                    className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin"
                    style={{ maxHeight: 60 }}
                  >
                    {myMedia.map((file) => {
                      const isSelected = selectedAvatar === file.url;
                      return (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => handleSelectMedia(file)}
                          className={`relative flex-shrink-0 rounded-lg overflow-hidden ring-2 transition-all hover:scale-105 ${
                            isSelected
                              ? 'ring-indigo-500 ring-offset-1'
                              : 'ring-transparent hover:ring-slate-300'
                          }`}
                          title={file.key.split('/').pop()}
                        >
                          <img src={file.url} alt={file.key} className="h-10 w-10 object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/30">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 h-10 text-xs text-slate-400">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Yüklenmiş medya yok</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-50 dark:bg-slate-800 px-2 text-slate-500">veya</span>
            </div>
          </div>

          {/* Default Avatars */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Varsayılan Avatar
            </p>
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
