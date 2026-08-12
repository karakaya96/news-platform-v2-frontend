'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Bell,
  Globe,
  Mail,
  MessageCircle,
  Save,
  Search,
  Settings,
  Share2,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const settingsSchema = z.object({
  site_name: z.string().min(1, 'Site adı zorunludur'),
  site_description: z.string().max(500).optional(),
  site_url: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  site_logo: z.string().url().optional().or(z.literal('')),
  site_favicon: z.string().url().optional().or(z.literal('')),
  site_language: z.string(),
  seo_title: z.string().max(70).optional(),
  seo_description: z.string().max(160).optional(),
  seo_keywords: z.string().optional(),
  seo_og_image: z.string().url().optional().or(z.literal('')),
  social_twitter: z.string().url().optional().or(z.literal('')),
  social_facebook: z.string().url().optional().or(z.literal('')),
  social_instagram: z.string().url().optional().or(z.literal('')),
  social_youtube: z.string().url().optional().or(z.literal('')),
  social_telegram: z.string().optional(),
  email_from_name: z.string().optional(),
  email_from_address: z.string().email().optional().or(z.literal('')),
  email_reply_to: z.string().email().optional().or(z.literal('')),
  comments_enabled: z.boolean(),
  comments_moderation: z.boolean(),
  comments_max_length: z.string(),
  notifications_enabled: z.boolean(),
  notifications_email_enabled: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const TABS = [
  { value: 'general', label: 'Genel', icon: Settings },
  { value: 'seo', label: 'SEO', icon: Search },
  { value: 'social', label: 'Sosyal Medya', icon: Share2 },
  { value: 'email', label: 'E-posta', icon: Mail },
  { value: 'comments', label: 'Yorumlar', icon: MessageCircle },
  { value: 'notifications', label: 'Bildirimler', icon: Bell },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      site_name: '',
      site_description: '',
      site_url: '',
      site_logo: '',
      site_favicon: '',
      site_language: 'tr',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      seo_og_image: '',
      social_twitter: '',
      social_facebook: '',
      social_instagram: '',
      social_youtube: '',
      social_telegram: '',
      email_from_name: '',
      email_from_address: '',
      email_reply_to: '',
      comments_enabled: true,
      comments_moderation: true,
      comments_max_length: '1000',
      notifications_enabled: true,
      notifications_email_enabled: false,
    },
  });

  const commentsEnabled = watch('comments_enabled');
  const notificationsEnabled = watch('notifications_enabled');

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get<Record<string, string>>('/api/settings');
      if (res.success && res.data) {
        const data = res.data;
        reset({
          site_name: data.site_name || '',
          site_description: data.site_description || '',
          site_url: data.site_url || '',
          site_logo: data.site_logo || '',
          site_favicon: data.site_favicon || '',
          site_language: data.site_language || 'tr',
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || '',
          seo_keywords: data.seo_keywords || '',
          seo_og_image: data.seo_og_image || '',
          social_twitter: data.social_twitter || '',
          social_facebook: data.social_facebook || '',
          social_instagram: data.social_instagram || '',
          social_youtube: data.social_youtube || '',
          social_telegram: data.social_telegram || '',
          email_from_name: data.email_from_name || '',
          email_from_address: data.email_from_address || '',
          email_reply_to: data.email_reply_to || '',
          comments_enabled: data.comments_enabled !== 'false',
          comments_moderation: data.comments_moderation !== 'false',
          comments_max_length: data.comments_max_length || '1000',
          notifications_enabled: data.notifications_enabled !== 'false',
          notifications_email_enabled: data.notifications_email_enabled === 'true',
        });
      }
    } catch {
      toast.error('Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, string> = {};
      for (const [key, value] of Object.entries(data)) {
        payload[key] = typeof value === 'boolean' ? String(value) : value || '';
      }
      const res = await api.put('/api/settings', payload);
      if (res.success) {
        toast.success('Ayarlar kaydedildi');
        setSaved(true);
        reset(data);
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error(res.error || 'Kaydetme başarısız');
      }
    } catch {
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Ayarlar
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Site yapılandırması ve tercihleri
          </p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Ayarlar
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Site yapılandırması ve tercihleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" />
              Kaydedildi
            </div>
          )}
          {isDirty && !saved && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Kaydedilmemiş değişiklikler var
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6 mt-6">
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-primary" />
                  Site Bilgileri
                </CardTitle>
                <CardDescription>
                  Sitenizin temel bilgilerini yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site Adı *</Label>
                    <Input
                      id="site_name"
                      placeholder="News Platform"
                      {...register('site_name')}
                      className={cn(errors.site_name && 'border-red-500')}
                    />
                    {errors.site_name && (
                      <p className="text-xs text-red-500">{errors.site_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_url">Site URL</Label>
                    <Input
                      id="site_url"
                      placeholder="https://newshaberglobal.com"
                      {...register('site_url')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_description">Site Açıklaması</Label>
                  <Textarea
                    id="site_description"
                    placeholder="Sitenizin kısa açıklaması..."
                    rows={3}
                    {...register('site_description')}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_logo">Logo URL</Label>
                    <Input
                      id="site_logo"
                      placeholder="https://ornek.com/logo.png"
                      {...register('site_logo')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_favicon">Favicon URL</Label>
                    <Input
                      id="site_favicon"
                      placeholder="https://ornek.com/favicon.ico"
                      {...register('site_favicon')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_language">Dil</Label>
                  <select
                    id="site_language"
                    {...register('site_language')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo" className="space-y-6 mt-6">
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-primary" />
                  SEO Ayarları
                </CardTitle>
                <CardDescription>
                  Arama motoru optimizasyonu ayarları
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">Varsayılan SEO Başlığı</Label>
                  <Input
                    id="seo_title"
                    placeholder="News Platform - Gündem, Teknoloji, Ekonomi"
                    {...register('seo_title')}
                  />
                  <p className="text-xs text-muted-foreground">
                    {watch('seo_title')?.length || 0}/70 karakter
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_description">Varsayılan Meta Açıklama</Label>
                  <Textarea
                    id="seo_description"
                    placeholder="Son dakika haberleri, gündem, teknoloji, ekonomi ve daha fazlası."
                    rows={3}
                    {...register('seo_description')}
                  />
                  <p className="text-xs text-muted-foreground">
                    {watch('seo_description')?.length || 0}/160 karakter
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_keywords">Anahtar Kelimeler</Label>
                  <Input
                    id="seo_keywords"
                    placeholder="haber, gündem, son dakika, türkiye"
                    {...register('seo_keywords')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Virgülle ayırın
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_og_image">Varsayılan OG Görseli</Label>
                  <Input
                    id="seo_og_image"
                    placeholder="https://ornek.com/og-image.jpg"
                    {...register('seo_og_image')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Settings */}
          <TabsContent value="social" className="space-y-6 mt-6">
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Share2 className="h-5 w-5 text-primary" />
                  Sosyal Medya
                </CardTitle>
                <CardDescription>
                  Sosyal medya hesap bağlantıları
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="social_twitter">Twitter / X</Label>
                    <Input
                      id="social_twitter"
                      placeholder="https://x.com/kullaniciadi"
                      {...register('social_twitter')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social_facebook">Facebook</Label>
                    <Input
                      id="social_facebook"
                      placeholder="https://facebook.com/sayfa"
                      {...register('social_facebook')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social_instagram">Instagram</Label>
                    <Input
                      id="social_instagram"
                      placeholder="https://instagram.com/kullaniciadi"
                      {...register('social_instagram')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social_youtube">YouTube</Label>
                    <Input
                      id="social_youtube"
                      placeholder="https://youtube.com/@kanal"
                      {...register('social_youtube')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_telegram">Telegram Kanalı</Label>
                  <Input
                    id="social_telegram"
                    placeholder="https://t.me/kanaladi"
                    {...register('social_telegram')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6 mt-6">
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  E-posta Ayarları
                </CardTitle>
                <CardDescription>
                  E-posta gönderim ayarları
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email_from_name">Gönderen Adı</Label>
                    <Input
                      id="email_from_name"
                      placeholder="News Platform"
                      {...register('email_from_name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_from_address">Gönderen E-posta</Label>
                    <Input
                      id="email_from_address"
                      placeholder="noreply@newshaberglobal.com"
                      {...register('email_from_address')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_reply_to">Yanıtla Adresi</Label>
                  <Input
                    id="email_reply_to"
                    placeholder="info@newshaberglobal.com"
                    {...register('email_reply_to')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Settings */}
          <TabsContent value="comments" className="space-y-6 mt-6">
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Yorum Ayarları
                </CardTitle>
                <CardDescription>
                  Yorum sistemini yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-0.5">
                    <Label className="text-base">Yorumları Etkinleştir</Label>
                    <p className="text-sm text-muted-foreground">
                      Haberlerde yorum yapılmasını sağlar
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="comments_enabled"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {commentsEnabled && (
                  <>
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                      <div className="space-y-0.5">
                        <Label className="text-base">Moderasyon Gerekli</Label>
                        <p className="text-sm text-muted-foreground">
                          Yorumlar yayınlanmadan önce onaylanmalı
                        </p>
                      </div>
                      <Controller
                        control={control}
                        name="comments_moderation"
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comments_max_length">Maksimum Yorum Uzunluğu</Label>
                      <Input
                        id="comments_max_length"
                        type="number"
                        placeholder="1000"
                        {...register('comments_max_length')}
                        className="max-w-[200px]"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-primary" />
                  Bildirim Ayarları
                </CardTitle>
                <CardDescription>
                  Bildirim tercihlerini yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-0.5">
                    <Label className="text-base">Bildirimleri Etkinleştir</Label>
                    <p className="text-sm text-muted-foreground">
                      Yeni haberlerde bildirim gönderilir
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="notifications_enabled"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {notificationsEnabled && (
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                    <div className="space-y-0.5">
                      <Label className="text-base">E-posta Bildirimleri</Label>
                      <p className="text-sm text-muted-foreground">
                        Abonelere e-posta ile bildirim gönder
                      </p>
                    </div>
                    <Controller
                      control={control}
                      name="notifications_email_enabled"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                toast.info('Değişiklikler iptal edildi');
              }}
            >
              İptal
            </Button>
          )}
          <Button
            type="submit"
            disabled={saving || !isDirty}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-600 text-white shadow-md shadow-indigo-500/25"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Kaydet
          </Button>
        </div>
      </form>
    </div>
  );
}
