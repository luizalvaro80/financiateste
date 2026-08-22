import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function generateDeviceId(): string {
  let id = localStorage.getItem('pwa-device-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('pwa-device-id', id);
  }
  return id;
}

function detectPlatform(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/windows/.test(ua)) return 'windows';
  if (/macintosh|mac os/.test(ua)) return 'macos';
  return 'unknown';
}

export function usePWAInstallTracking() {
  const { user } = useAuth();

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || (navigator as any).standalone === true;

  const trackInstallation = useCallback(async () => {
    if (!user || !isStandalone) return;

    const deviceId = generateDeviceId();
    const platform = detectPlatform();

    try {
      // Upsert - update last_opened_at if exists, insert if not
      const { error } = await supabase
        .from('pwa_installations' as any)
        .upsert(
          {
            device_id: deviceId,
            user_id: user.id,
            platform,
            is_active: true,
            last_opened_at: new Date().toISOString(),
          },
          { onConflict: 'device_id' }
        );

      if (error) console.error('PWA tracking error:', error);
    } catch (e) {
      console.error('PWA tracking error:', e);
    }
  }, [user, isStandalone]);

  useEffect(() => {
    trackInstallation();
  }, [trackInstallation]);

  return { isStandalone };
}
