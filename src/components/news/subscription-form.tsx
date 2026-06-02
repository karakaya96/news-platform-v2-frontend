'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, Loader2, Check, X } from 'lucide-react';

interface SubscriptionFormProps {
  categories: { slug: string; name: string; color: string }[];
}

export function SubscriptionForm({ categories }: SubscriptionFormProps) {
  const [email, setEmail] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [browserSubscribed, setBrowserSubscribed] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';

  // Check existing browser subscription on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Get VAPID public key
    fetch(`${apiUrl}/api/subscribe/vapid-public-key`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.publicKey) {
          setVapidKey(data.data.publicKey);
        }
      })
      .catch(() => {});

    // Check if already subscribed in browser
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setBrowserSubscribed(!!subscription);
        });
      });
    }
  }, [apiUrl]);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleBrowserSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setMessage({ type: 'error', text: 'Tarayıcınız bildirimleri desteklemiyor' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setMessage({ type: 'error', text: 'Bildirim izni reddedildi' });
        return;
      }

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        if (!vapidKey) {
          setMessage({ type: 'error', text: 'Bildirim sistemi yapılandırılmamış' });
          return;
        }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const res = await fetch(`${apiUrl}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'browser',
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          categories: selectedCategories.length > 0 ? selectedCategories : [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        setBrowserSubscribed(true);
        setMessage({ type: 'success', text: data.data?.message || '🔔 Bildirim aboneliği başarıyla oluşturuldu!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Abone olunamadı' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBrowserUnsubscribe = async () => {
    if (!('serviceWorker' in navigator)) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        // Unsubscribe from browser
        await subscription.unsubscribe();
        setBrowserSubscribed(false);
        setPermission('default');

        // Remove from server
        await fetch(`${apiUrl}/api/subscribe/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        });

        setMessage({ type: 'success', text: '🔕 Tarayıcı bildirimi iptal edildi' });
      } else {
        setBrowserSubscribed(false);
        setMessage({ type: 'success', text: '🔕 Tarayıcı bildirimi iptal edildi' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubscribe = async () => {
    if (!email.trim() || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Geçerli bir e-posta adresi girin' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${apiUrl}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          email: email.trim(),
          categories: selectedCategories.length > 0 ? selectedCategories : [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.data?.message || '📧 E-posta aboneliği başarıyla oluşturuldu!' });
        setEmail('');
        setSelectedCategories([]);
      } else {
        setMessage({ type: 'error', text: data.error || 'Abone olunamadı' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900">
          <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bildirim Aboneliği</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Yeni haberlerden haberdar olun</p>
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Kategori Seçin (boş bırakırsanız tümü)
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => toggleCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategories.includes(cat.slug)
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Browser Push Notification */}
      {permission !== 'denied' && (
        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          {browserSubscribed ? (
            <>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 mb-3">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Tarayıcı bildirimi aktif — yeni haberlerden anında haberdar olacaksınız
                </p>
              </div>
              <button
                onClick={handleBrowserUnsubscribe}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-950 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-600 hover:border-red-200 dark:hover:border-red-800"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Bildirimi İptal Et
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBrowserSubscribe}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium text-sm shadow-md shadow-indigo-500/25 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    İşlem Yapılıyor...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Anlık Bildirim Al
                  </>
                )}
              </button>
              {permission === 'granted' && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 text-center">
                  ✓ Bildirim izni verilmiş — abone olmak için tıklayın
                </p>
              )}
              {permission === 'default' && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  Tarayıcınızdan bildirim izni istenecek
                </p>
              )}
            </>
          )}
        </div>
      )}

      {permission === 'denied' && (
        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
            <BellOff className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Bildirim izni reddedildi. Tarayıcı ayarlarından izin verebilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* Email Subscription */}
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          E-posta ile Abone Ol
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
          />
          <button
            onClick={handleEmailSubscribe}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Abone Ol
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          📬 Abone olduğunuzda onay e-postası gönderilecektir. Spam klasörünüzü kontrol etmeyi unutmayın.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
