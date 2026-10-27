import { DoctorListing } from '../types';

export interface UserGeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName: string;
  city?: string;
  state?: string;
  isManual?: boolean;
}

export interface DoctorSearchRadiusResult {
  doctors: (DoctorListing & { calculatedDistance: number })[];
  radiusTier: 'within10km' | 'within100km' | 'none';
  message: string;
  totalFound: number;
}

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula.
 * @returns Distance in kilometers rounded to 1 decimal place.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Requests the user's actual geographic coordinates via browser Geolocation API.
 * Uses high accuracy, a 10s timeout, and a 60s max cache age.
 */
export function getBrowserCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        });
      },
      (err) => {
        let msg = 'Unable to retrieve location.';
        if (err.code === 1) {
          msg = 'Location permission was denied. You can enter your location manually.';
        } else if (err.code === 2) {
          msg = 'Location position is unavailable. Please enter your location manually.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please enter your location manually.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Reverse geocodes coordinates to a human-readable locality and city.
 * Queries OpenStreetMap Nominatim with a 4-second timeout, falling back
 * to geometric coordinate bounds for Indian cities.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<{ locationName: string; city: string; state: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`,
      {
        headers: { 'User-Agent': 'HealYaarHealthApp/1.0' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
      const city = addr.city || addr.town || addr.county || addr.state_district || 'Your Area';
      const state = addr.state || 'India';

      const locationName = locality ? `${locality}, ${city}, ${state}` : `${city}, ${state}`;
      return { locationName, city, state };
    }
  } catch (e) {
    // Fallback to coordinate bounding boxes below
  }

  // Offline / timeout geometric bounding fallback for major Indian hubs
  if (lat >= 28.38 && lat <= 28.55 && lon >= 76.95 && lon <= 77.15) {
    return { locationName: 'Gurugram, Haryana', city: 'Gurugram', state: 'Haryana' };
  }
  if (lat >= 28.50 && lat <= 28.75 && lon >= 77.05 && lon <= 77.35) {
    return { locationName: 'New Delhi, Delhi NCR', city: 'Delhi', state: 'Delhi' };
  }
  if (lat >= 28.45 && lat <= 28.65 && lon >= 77.30 && lon <= 77.45) {
    return { locationName: 'Noida, Uttar Pradesh', city: 'Noida', state: 'Uttar Pradesh' };
  }
  if (lat >= 18.90 && lat <= 19.30 && lon >= 72.75 && lon <= 73.00) {
    return { locationName: 'Mumbai, Maharashtra', city: 'Mumbai', state: 'Maharashtra' };
  }
  if (lat >= 18.40 && lat <= 18.65 && lon >= 73.75 && lon <= 74.00) {
    return { locationName: 'Pune, Maharashtra', city: 'Pune', state: 'Maharashtra' };
  }
  if (lat >= 12.85 && lat <= 13.15 && lon >= 77.45 && lon <= 77.75) {
    return { locationName: 'Bengaluru, Karnataka', city: 'Bengaluru', state: 'Karnataka' };
  }

  return {
    locationName: `Latitude ${lat.toFixed(3)}, Longitude ${lon.toFixed(3)}`,
    city: 'Local Area',
    state: ''
  };
}

/**
 * Forward geocodes a user-typed location (city, locality, or PIN code).
 * Uses Nominatim with fallback to an offline dictionary of common Indian localities.
 */
export async function forwardGeocodeLocation(query: string): Promise<UserGeoLocation | null> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cleanQuery + ', India'
      )}&limit=1`,
      {
        headers: { 'User-Agent': 'HealYaarHealthApp/1.0' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        return {
          latitude: lat,
          longitude: lon,
          locationName: item.display_name.split(',').slice(0, 3).join(','),
          isManual: true
        };
      }
    }
  } catch (e) {
    // Fallback to local dictionary
  }

  // Common Indian cities & localities fallback dictionary
  const lower = cleanQuery.toLowerCase();
  const dict: Record<string, { lat: number; lon: number; name: string }> = {
    'gurgaon': { lat: 28.4595, lon: 77.0266, name: 'Gurugram, Haryana' },
    'gurugram': { lat: 28.4595, lon: 77.0266, name: 'Gurugram, Haryana' },
    '122001': { lat: 28.4595, lon: 77.0266, name: 'Sector 14 / Sadar Bazar, Gurugram, 122001' },
    '122002': { lat: 28.4735, lon: 77.0877, name: 'DLF Phase 1 / Sector 28, Gurugram, 122002' },
    '122018': { lat: 28.4395, lon: 77.0425, name: 'Sector 38 / Medanta, Gurugram, 122018' },
    'delhi': { lat: 28.6139, lon: 77.2090, name: 'Central Delhi, Delhi' },
    'new delhi': { lat: 28.6139, lon: 77.2090, name: 'New Delhi, Delhi' },
    'saket': { lat: 28.5284, lon: 77.2114, name: 'Saket, South Delhi' },
    '110017': { lat: 28.5284, lon: 77.2114, name: 'Saket, New Delhi, 110017' },
    '110001': { lat: 28.6304, lon: 77.2177, name: 'Connaught Place, New Delhi, 110001' },
    'noida': { lat: 28.5355, lon: 77.3910, name: 'Noida, Uttar Pradesh' },
    '201301': { lat: 28.5700, lon: 77.3200, name: 'Sector 18, Noida, 201301' },
    'mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai, Maharashtra' },
    'bandra': { lat: 19.0596, lon: 72.8295, name: 'Bandra West, Mumbai' },
    '400050': { lat: 19.0596, lon: 72.8295, name: 'Bandra, Mumbai, 400050' },
    'pune': { lat: 18.5204, lon: 73.8567, name: 'Pune, Maharashtra' },
    '411004': { lat: 18.5144, lon: 73.8402, name: 'Deccan Gymkhana, Pune, 411004' },
    'bengaluru': { lat: 12.9716, lon: 77.5946, name: 'Bengaluru, Karnataka' },
    'bangalore': { lat: 12.9716, lon: 77.5946, name: 'Bengaluru, Karnataka' },
    '560034': { lat: 12.9352, lon: 77.6245, name: 'Koramangala, Bengaluru, 560034' }
  };

  for (const [key, val] of Object.entries(dict)) {
    if (lower.includes(key)) {
      return {
        latitude: val.lat,
        longitude: val.lon,
        locationName: val.name,
        isManual: true
      };
    }
  }

  return null;
}

/**
 * STRICT RADIUS FILTERING ENGINE:
 * Priority 1: <= 10 km. If any doctors exist, SHOW ONLY THOSE DOCTORS.
 * Priority 2: If NO doctors <= 10 km, expand to <= 100 km (> 10 km AND <= 100 km).
 * Fallback: If NO doctors <= 100 km, show zero results with appropriate notice.
 * NEVER shows doctors > 100 km away!
 */
export function filterDoctorsByRadius(
  allDoctors: DoctorListing[],
  userLat: number,
  userLon: number,
  specialtyCategory: string,
  searchQuery: string = ''
): DoctorSearchRadiusResult {
  // 1. Calculate actual Haversine distance for all doctors and match specialty/search
  const cleanQuery = searchQuery.trim().toLowerCase();

  const matched = allDoctors
    .map((doc) => {
      const dist = calculateHaversineDistanceKm(userLat, userLon, doc.latitude, doc.longitude);
      return {
        ...doc,
        calculatedDistance: dist
      };
    })
    .filter((doc) => {
      // Specialty matching
      const matchesSpecialty =
        specialtyCategory === 'All' ||
        doc.specialtyCategory.toLowerCase() === specialtyCategory.toLowerCase() ||
        (specialtyCategory.toLowerCase().includes('gynec') &&
          doc.specialtyCategory.toLowerCase().includes('gynec')) ||
        (specialtyCategory.toLowerCase().includes('urolog') &&
          doc.specialtyCategory.toLowerCase().includes('urolog')) ||
        (specialtyCategory.toLowerCase().includes('gastro') &&
          doc.specialtyCategory.toLowerCase().includes('gastro')) ||
        (specialtyCategory.toLowerCase().includes('psych') &&
          doc.specialtyCategory.toLowerCase().includes('psych')) ||
        (specialtyCategory.toLowerCase().includes('derma') &&
          doc.specialtyCategory.toLowerCase().includes('derma')) ||
        (specialtyCategory.toLowerCase().includes('general') &&
          doc.specialtyCategory.toLowerCase().includes('general'));

      // Search query matching
      const matchesQuery =
        !cleanQuery ||
        doc.name.toLowerCase().includes(cleanQuery) ||
        doc.specialty.toLowerCase().includes(cleanQuery) ||
        doc.hospitalOrClinic.toLowerCase().includes(cleanQuery) ||
        (doc.address && doc.address.toLowerCase().includes(cleanQuery));

      return matchesSpecialty && matchesQuery;
    });

  // PRIORITY 1 — 10 km:
  // If at least one valid doctor exists within 10 km, SHOW ONLY THOSE DOCTORS.
  const within10Km = matched
    .filter((d) => d.calculatedDistance <= 10)
    .sort((a, b) => a.calculatedDistance - b.calculatedDistance);

  if (within10Km.length > 0) {
    return {
      doctors: within10Km,
      radiusTier: 'within10km',
      message: `Showing ${within10Km.length} verified specialist(s) within 10 km of your location.`,
      totalFound: within10Km.length
    };
  }

  // PRIORITY 2 — 100 km:
  // If NO suitable doctors within 10 km, expand search radius to max 100 km.
  // Show only doctors whose calculated distance is > 10 km AND <= 100 km.
  const within100Km = matched
    .filter((d) => d.calculatedDistance > 10 && d.calculatedDistance <= 100)
    .sort((a, b) => a.calculatedDistance - b.calculatedDistance);

  if (within100Km.length > 0) {
    return {
      doctors: within100Km,
      radiusTier: 'within100km',
      message: `No specialists found within 10 km. Expanded search to ${within100Km.length} specialist(s) within 100 km radius.`,
      totalFound: within100Km.length
    };
  }

  // IF NOTHING FOUND WITHIN 100 km:
  // Do NOT fill results with unrelated doctors from other cities!
  return {
    doctors: [],
    radiusTier: 'none',
    message: 'No suitable specialist was found within 100 km of your selected location.',
    totalFound: 0
  };
}
