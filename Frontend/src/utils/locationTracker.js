/**
 * Track user location for analytics
 * Call this on the landing page after a redirect from a short link
 */

export const trackUserLocation = async (shortUrl, visitorId = null) => {
  if (!shortUrl) {
    console.warn('trackUserLocation: shortUrl is required');
    return false;
  }

  if (!navigator.geolocation) {
    console.log('Geolocation not available');
    return false;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });

    const { latitude, longitude } = position.coords;

    try {
      const response = await fetch(window.location.origin + '/api/create/track-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          shortUrl: String(shortUrl).trim(),
          latitude: Number(latitude),
          longitude: Number(longitude),
          visitorId: visitorId ? String(visitorId).trim() : null,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Location tracked successfully:', data);
        return true;
      } else {
        const error = await response.text();
        console.error('Failed to track location:', response.status, error);
        return false;
      }
    } catch (fetchError) {
      console.error('Fetch error during location tracking:', fetchError);
      return false;
    }
  } catch (error) {
    console.log('Location tracking skipped - geolocation error:', error.message);
    return false;
  }
};

export const createLocationBanner = (onAllow, onDeny) => {
  const banner = document.createElement('div');
  banner.id = 'location-tracking-banner';
  banner.className =
    'fixed bottom-4 left-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-50';

  banner.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="flex-1">
        <p class="text-sm font-semibold text-slate-900">Share your location?</p>
        <p class="text-xs text-slate-600 mt-1">Help us improve analytics by sharing your location.</p>
      </div>
      <button type="button" class="text-slate-400 hover:text-slate-600 flex-shrink-0">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    <div class="mt-3 flex items-center gap-2">
      <button type="button" class="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition" id="allow-location">
        Allow
      </button>
      <button type="button" class="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition" id="deny-location">
        Not now
      </button>
    </div>
  `;

  const closeBtn = banner.querySelector('button:nth-of-type(1)');
  const allowBtn = banner.querySelector('#allow-location');
  const denyBtn = banner.querySelector('#deny-location');

  const removeBanner = () => banner.remove();

  closeBtn.addEventListener('click', () => {
    removeBanner();
    onDeny?.();
  });

  allowBtn.addEventListener('click', () => {
    removeBanner();
    onAllow?.();
  });

  denyBtn.addEventListener('click', () => {
    removeBanner();
    onDeny?.();
  });

  return banner;
};
