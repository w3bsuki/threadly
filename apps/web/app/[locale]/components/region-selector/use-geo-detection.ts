import {
  getRegionByCountryCode,
  type Region,
} from '@repo/internationalization/client';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

interface GeoData {
  country?: string;
  region?: Region;
  isDetected: boolean;
}

export function useGeoDetection() {
  const [geoData, setGeoData] = useState<GeoData>({
    isDetected: false,
  });

  useEffect(() => {
    // Check if user already has a preferred region
    const savedRegion = getCookie('preferredRegion');
    if (savedRegion) {
      return;
    }

    // Try to detect from Vercel headers (in production)
    if (typeof window !== 'undefined') {
      // Client-side: Make a request to get geo data
      fetch('/api/geo')
        .then((res) => res.json())
        .then((data) => {
          if (data.country) {
            const region = getRegionByCountryCode(data.country);
            setGeoData({
              country: data.country,
              region,
              isDetected: true,
            });
          }
        })
        .catch(() => {
          // Silently fail - geo detection is optional
        });
    }
  }, []);

  return geoData;
}
