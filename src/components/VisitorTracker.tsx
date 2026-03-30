import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Helper to determine the OS
const getOS = () => {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

  if (macosPlatforms.indexOf(platform) !== -1) return 'macOS';
  if (iosPlatforms.indexOf(platform) !== -1) return 'iOS';
  if (windowsPlatforms.indexOf(platform) !== -1) return 'Windows';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Linux/.test(platform)) return 'Linux';
  
  return 'Unknown OS';
};

// Helper to determine the Browser
const getBrowser = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.match(/chrome|chromium|crios/i)) return 'Chrome';
  if (userAgent.match(/firefox|fxios/i)) return 'Firefox';
  if (userAgent.match(/safari/i)) return 'Safari';
  if (userAgent.match(/opr\//i)) return 'Opera';
  if (userAgent.match(/edg/i)) return 'Edge';
  
  return 'Unknown Browser';
};

// Helper to determine Device Type
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
};

// Generate a random session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const VisitorTracker = () => {
  const tracked = useRef(false);

  useEffect(() => {
    // Only run once per session/mount
    if (tracked.current) return;
    tracked.current = true;

    // Check if we already tracked this session in sessionStorage
    const sessionKey = 'visitor_tracker_session_id';
    let sessionId = sessionStorage.getItem(sessionKey);
    const isNewSession = !sessionId;
    
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(sessionKey, sessionId);
    }

    // Only send the tracking event if it's a new session
    // This prevents spamming the DB/Edge Function on every page navigation
    if (!isNewSession) return;

    const trackVisit = async () => {
      try {
        // 1. Get location data from ip-api (free, no API key needed, very reliable)
        let locationData: any = {};
        try {
          const response = await fetch('http://ip-api.com/json/');
          if (response.ok) {
            locationData = await response.json();
          }
        } catch (e) {
          console.warn('Could not fetch geolocation', e);
        }

        // 2. Collect local data
        const { data: { session } } = await supabase.auth.getSession();
        
        const visitorData = {
          // Geolocation & IP
          ip_address: locationData.query || null,
          country: locationData.country || null,
          country_code: locationData.countryCode || null,
          region: locationData.regionName || null,
          city: locationData.city || null,
          latitude: locationData.lat || null,
          longitude: locationData.lon || null,
          isp: locationData.isp || null,
          timezone: locationData.timezone || null,
          
          // Device & Browser
          user_agent: navigator.userAgent,
          browser: getBrowser(),
          os: getOS(),
          device_type: getDeviceType(),
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          
          // Navigation
          referrer: document.referrer || null,
          page_url: window.location.href,
          page_title: document.title,
          
          // Auth & Session
          is_authenticated: !!session,
          user_id: session?.user?.id || null,
          session_id: sessionId
        };

        // 3. Send to Edge Function
        const { error } = await supabase.functions.invoke('track-visit', {
          body: visitorData
        });
        
        if (error) {
          console.error('Error tracking visit:', error);
        }
      } catch (err) {
        console.error('Failed to run visitor tracker:', err);
      }
    };

    // Run without blocking the main thread
    setTimeout(trackVisit, 2000);

  }, []);

  return null; // This is an invisible component
};
