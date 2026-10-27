import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHero } from '../components/ui/SectionHero';
import { DoctorFinderIllustration } from '../components/ContextualIllustrations';
import { syntheticDoctors } from '../data/syntheticData';
import { DoctorListing } from '../types';
import {
  getBrowserCurrentPosition,
  reverseGeocodeCoordinates,
  forwardGeocodeLocation,
  filterDoctorsByRadius,
  UserGeoLocation,
  DoctorSearchRadiusResult
} from '../services/locationService';
import {
  Stethoscope,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Phone,
  ShieldAlert,
  Sparkles,
  Accessibility,
  Compass,
  RefreshCw,
  AlertCircle,
  Building2,
  Star,
  Map as MapIcon,
  List as ListIcon,
  ZoomIn,
  ZoomOut,
  Navigation,
  X
} from 'lucide-react';

export const DoctorsNearbyView: React.FC = () => {
  const { t, showToast } = useApp();

  // View Mode: 'list' | 'map'
  const [activeViewMode, setActiveViewMode] = useState<'list' | 'map'>('list');
  const [selectedMapDoctor, setSelectedMapDoctor] = useState<(DoctorListing & { calculatedDistance?: number }) | null>(null);

  // Location State with Session Persistence
  const [userLocation, setUserLocation] = useState<UserGeoLocation | null>(() => {
    try {
      const saved = sessionStorage.getItem('healyaar_user_location');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isManualLocationOpen, setIsManualLocationOpen] = useState<boolean>(false);
  const [manualLocationInput, setManualLocationInput] = useState<string>('');
  const [isGeocodingManual, setIsGeocodingManual] = useState<boolean>(false);

  // Search & Filters (placed BELOW results per requirement)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeChecklistDoctor, setActiveChecklistDoctor] = useState<(DoctorListing & { calculatedDistance?: number }) | null>(null);

  // Map Zoom State
  const [mapZoom, setMapZoom] = useState<number>(1);

  const specialties = [
    'All',
    'Gynecology',
    'General Medicine',
    'Dermatology',
    'Urology',
    'Gastroenterology',
    'Cardiology',
    'Orthopedics',
    'Psychiatry',
    'Endocrinology'
  ];

  const quickCities = [
    { label: 'Gurugram (NCR)', query: 'Gurugram, Haryana' },
    { label: 'South Delhi', query: 'Saket, New Delhi' },
    { label: 'Central Delhi', query: 'Connaught Place, New Delhi' },
    { label: 'Noida', query: 'Noida, Uttar Pradesh' },
    { label: 'Mumbai', query: 'Bandra, Mumbai' },
    { label: 'Pune', query: 'Pune, Maharashtra' },
    { label: 'Bengaluru', query: 'Bengaluru, Karnataka' }
  ];

  const saveLocation = (loc: UserGeoLocation) => {
    setUserLocation(loc);
    try {
      sessionStorage.setItem('healyaar_user_location', JSON.stringify(loc));
    } catch {
      // ignore
    }
  };

  // Voice Assistant Event Listeners
  useEffect(() => {
    const handleVoiceSwitchMap = () => {
      setActiveViewMode('map');
      showToast('Switched to Map View. Showing doctors on the map.');
    };

    const handleVoiceFilterSpecialty = (e: Event) => {
      const customEvent = e as CustomEvent<{ specialty?: string; query?: string }>;
      if (customEvent.detail?.specialty) {
        setSelectedSpecialty(customEvent.detail.specialty);
        showToast(`Filtered by ${customEvent.detail.specialty}`);
      }
      if (customEvent.detail?.query) {
        setSearchQuery(customEvent.detail.query);
      }
    };

    window.addEventListener('healyaar_voice_switch_map_view', handleVoiceSwitchMap);
    window.addEventListener('healyaar_voice_filter_specialty', handleVoiceFilterSpecialty);

    return () => {
      window.removeEventListener('healyaar_voice_switch_map_view', handleVoiceSwitchMap);
      window.removeEventListener('healyaar_voice_filter_specialty', handleVoiceFilterSpecialty);
    };
  }, [showToast]);

  /**
   * Detect Real Location via Browser Geolocation API
   */
  const handleDetectUserLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    showToast('Getting your location via GPS...');

    try {
      const coords = await getBrowserCurrentPosition();
      const geo = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);

      const loc: UserGeoLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        locationName: geo.locationName,
        city: geo.city,
        state: geo.state,
        isManual: false
      };

      saveLocation(loc);
      setIsManualLocationOpen(false);
      showToast(`📍 Located: ${geo.locationName}`);
    } catch (err: any) {
      setLocationError(err.message || 'Could not detect your GPS location. Please choose a city or enter your area manually.');
      setIsManualLocationOpen(true);
    } finally {
      setIsLocating(false);
    }
  };

  /**
   * Forward Geocode a Manually Entered City, Locality, or PIN Code
   */
  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocationInput.trim()) return;

    setIsGeocodingManual(true);
    setLocationError(null);

    try {
      const geo = await forwardGeocodeLocation(manualLocationInput);
      if (geo) {
        saveLocation(geo);
        setIsManualLocationOpen(false);
        showToast(`📍 Location set: ${geo.locationName}`);
      } else {
        setLocationError(`Could not find coordinates for "${manualLocationInput}". Please try typing a nearby city name or PIN code.`);
      }
    } catch (e: any) {
      setLocationError('Geocoding request failed. Please check your internet connection.');
    } finally {
      setIsGeocodingManual(false);
    }
  };

  const handleQuickCitySelect = async (query: string) => {
    setIsGeocodingManual(true);
    setLocationError(null);
    try {
      const geo = await forwardGeocodeLocation(query);
      if (geo) {
        saveLocation(geo);
        setIsManualLocationOpen(false);
        showToast(`📍 Set location to: ${geo.locationName}`);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsGeocodingManual(false);
    }
  };

  /**
   * STRICT RADIUS FILTERING ENGINE:
   * Priority 1 (<= 10 km) -> Priority 2 (10 - 100 km) -> None (> 100 km)
   */
  const radiusResult: DoctorSearchRadiusResult = useMemo(() => {
    if (!userLocation) {
      const filtered = syntheticDoctors.filter((doc) => {
        const matchesSpecialty =
          selectedSpecialty === 'All' ||
          doc.specialtyCategory.toLowerCase() === selectedSpecialty.toLowerCase() ||
          (selectedSpecialty.toLowerCase().includes('gynec') &&
            doc.specialtyCategory.toLowerCase().includes('gynec')) ||
          (selectedSpecialty.toLowerCase().includes('cardio') &&
            doc.specialtyCategory.toLowerCase().includes('cardio'));
        const matchesQuery =
          !searchQuery ||
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.hospitalOrClinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.city.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSpecialty && matchesQuery;
      });

      return {
        doctors: filtered.map((d) => ({ ...d, calculatedDistance: 0 })),
        radiusTier: 'within10km',
        message: 'Detect your location via GPS or select your city to calculate real distances with 10 km strict radius filtering.',
        totalFound: filtered.length
      };
    }

    return filterDoctorsByRadius(
      syntheticDoctors,
      userLocation.latitude,
      userLocation.longitude,
      selectedSpecialty,
      searchQuery
    );
  }, [userLocation, selectedSpecialty, searchQuery]);

  // When doctors change, select the first doctor for map preview if none selected
  useEffect(() => {
    if (radiusResult.doctors.length > 0) {
      if (!selectedMapDoctor || !radiusResult.doctors.some(d => d.id === selectedMapDoctor.id)) {
        setSelectedMapDoctor(radiusResult.doctors[0]);
      }
    } else {
      setSelectedMapDoctor(null);
    }
  }, [radiusResult.doctors]);

  /**
   * Coordinate Bounds for the Vector Map:
   * Computes min/max lat/lng from userLocation and actual doctor results
   */
  const mapBounds = useMemo(() => {
    const docs = radiusResult.doctors;
    const centerLat = userLocation ? userLocation.latitude : (docs[0]?.latitude || 28.4595);
    const centerLng = userLocation ? userLocation.longitude : (docs[0]?.longitude || 77.0266);

    let minLat = centerLat;
    let maxLat = centerLat;
    let minLng = centerLng;
    let maxLng = centerLng;

    docs.forEach(d => {
      if (d.latitude < minLat) minLat = d.latitude;
      if (d.latitude > maxLat) maxLat = d.latitude;
      if (d.longitude < minLng) minLng = d.longitude;
      if (d.longitude > maxLng) maxLng = d.longitude;
    });

    // Provide a comfortable margin around pins
    const padLat = Math.max((maxLat - minLat) * 0.25, 0.04) / mapZoom;
    const padLng = Math.max((maxLng - minLng) * 0.25, 0.04) / mapZoom;

    return {
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
      centerLat,
      centerLng
    };
  }, [radiusResult.doctors, userLocation, mapZoom]);

  /**
   * Project (lat, lng) to SVG viewBox coordinates [50 to 750, 50 to 450]
   */
  const projectCoord = (lat: number, lng: number) => {
    const width = 800;
    const height = 500;
    const padding = 60;

    const spanLng = mapBounds.maxLng - mapBounds.minLng || 0.1;
    const spanLat = mapBounds.maxLat - mapBounds.minLat || 0.1;

    // Standard equirectangular projection
    const x = padding + ((lng - mapBounds.minLng) / spanLng) * (width - 2 * padding);
    // Y is inverted in SVG (higher latitude is higher up, smaller Y)
    const y = height - padding - ((lat - mapBounds.minLat) / spanLat) * (height - 2 * padding);

    return { x: Math.max(30, Math.min(width - 30, x)), y: Math.max(30, Math.min(height - 30, y)) };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* 1. Header Banner */}
      <SectionHero
        title="Doctors & Clinics Nearby"
        description="Verified regional hospital listings with GPS-calculated distances and strict radius rules."
        badge={{
          icon: Stethoscope,
          text: 'Verified Specialists',
          variant: 'emerald'
        }}
        illustration={<DoctorFinderIllustration size="md" />}
        actions={
          <button
            onClick={handleDetectUserLocation}
            disabled={isLocating}
            className="interactive-button inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap self-start sm:self-auto"
          >
            {isLocating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Getting your location...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4 text-white" />
                <span>Use My Current Location</span>
              </>
            )}
          </button>
        }
      />

      {/* 2. Location Status & Strict Radius Indicator */}
      <div className="space-y-3">
        {userLocation ? (
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div>
              <div className="font-bold text-teal-950 dark:text-teal-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Searching near: {userLocation.locationName}</span>
              </div>
              {userLocation.accuracy && (
                <span className="text-teal-700 dark:text-teal-400 text-xs block mt-0.5">
                  Location accuracy: approximately {userLocation.accuracy} meters
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsManualLocationOpen((prev) => !prev)}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300 font-bold rounded-xl text-xs hover:bg-teal-100 transition-all shadow-xs whitespace-nowrap self-start sm:self-auto"
            >
              Change location
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <span>
                Tap <strong>"Use My Current Location"</strong> or enter your locality for strict 10 km distance filtering.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsManualLocationOpen((prev) => !prev)}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-100 transition-all shadow-xs whitespace-nowrap self-start sm:self-auto"
            >
              Enter Location Manually
            </button>
          </div>
        )}

        {/* Manual Location Input Form */}
        {isManualLocationOpen && (
          <form
            onSubmit={handleManualLocationSubmit}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 shadow-sm space-y-3 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                Enter Your Location (City, Locality, or PIN Code):
              </label>
              <button
                type="button"
                onClick={() => setIsManualLocationOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualLocationInput}
                onChange={(e) => setManualLocationInput(e.target.value)}
                placeholder="e.g. Gurugram, Sector 14 Gurgaon, Saket New Delhi, Bandra Mumbai..."
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={isGeocodingManual}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap"
              >
                {isGeocodingManual ? 'Finding...' : 'Set Location'}
              </button>
            </div>

            {/* Quick Indian City Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Quick Select:</span>
              {quickCities.map((city) => (
                <button
                  key={city.label}
                  type="button"
                  onClick={() => handleQuickCitySelect(city.query)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-800 dark:hover:text-teal-300 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {city.label}
                </button>
              ))}
            </div>
          </form>
        )}

        {/* Location Error Notice */}
        {locationError && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>{locationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* Strict Radius Priority Status Banner */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span className="font-semibold">{radiusResult.message}</span>
          </div>
          <div className="flex items-center gap-2">
            {userLocation && radiusResult.radiusTier === 'within10km' && (
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg text-xs whitespace-nowrap shadow-2xs">
                Priority 1: ≤ 10 km Active
              </span>
            )}
            {userLocation && radiusResult.radiusTier === 'within100km' && (
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold rounded-lg text-xs whitespace-nowrap shadow-2xs">
                Priority 2: 10 – 100 km Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ==============================================================
          3. CLINICS NEARBY (ACTUAL RESULTS) APPEARS FIRST!
      ============================================================== */}
      <section className="space-y-4">
        {/* Results Header with View Mode Switch: [List View] / [Map View] */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              <span>Clinics & Specialists Nearby</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Found {radiusResult.totalFound} clinic(s) matching your location and filters.
            </p>
          </div>

          {/* Toggle buttons: [List View] / [Map View] */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveViewMode('list')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeViewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListIcon className="w-4 h-4" />
              <span>List View</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('map')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeViewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* ==============================================================
            A. MAP VIEW OPTION (Interactive Vector Map with Real Pins)
        ============================================================== */}
        {activeViewMode === 'map' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
            {radiusResult.doctors.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  No clinics found on the map within 100 km.
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We strictly respect actual geographic coordinates and do not fabricate distant doctors. Try resetting your search filters below.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Map View Canvas Container */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner h-[460px] flex items-center justify-center">
                  {/* Grid Lines Pattern for Map Feel */}
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 800 500"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-200/80 dark:text-slate-800/60" strokeWidth="1" />
                      </pattern>
                      <radialGradient id="userRadar" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Background Grid */}
                    <rect width="800" height="500" fill="url(#grid)" />

                    {/* Soft Concentric Distance Rings around user location */}
                    {userLocation && (() => {
                      const userPt = projectCoord(userLocation.latitude, userLocation.longitude);
                      return (
                        <g>
                          <circle cx={userPt.x} cy={userPt.y} r="180" fill="url(#userRadar)" />
                          <circle cx={userPt.x} cy={userPt.y} r="80" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                          <circle cx={userPt.x} cy={userPt.y} r="160" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
                          <text x={userPt.x + 85} y={userPt.y - 5} fill="#0d9488" fontSize="10" fontWeight="bold">10 km radius</text>
                          <text x={userPt.x + 165} y={userPt.y - 5} fill="#0d9488" fontSize="10" fontWeight="bold">50 km radius</text>
                        </g>
                      );
                    })()}

                    {/* Doctor Connecting Lines to Selected Doctor */}
                    {selectedMapDoctor && (() => {
                      const docPt = projectCoord(selectedMapDoctor.latitude, selectedMapDoctor.longitude);
                      if (userLocation) {
                        const userPt = projectCoord(userLocation.latitude, userLocation.longitude);
                        return (
                          <line
                            x1={userPt.x}
                            y1={userPt.y}
                            x2={docPt.x}
                            y2={docPt.y}
                            stroke="#0d9488"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            className="animate-pulse"
                          />
                        );
                      }
                      return null;
                    })()}

                    {/* User Location Marker (Pulse Pin) */}
                    {userLocation && (() => {
                      const userPt = projectCoord(userLocation.latitude, userLocation.longitude);
                      return (
                        <g transform={`translate(${userPt.x}, ${userPt.y})`} className="cursor-default">
                          <circle r="12" fill="#0d9488" opacity="0.25" className="animate-ping" />
                          <circle r="7" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" />
                          <rect x="-45" y="-30" width="90" height="20" rx="6" fill="#134e4a" opacity="0.92" />
                          <text x="0" y="-16" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                            You Are Here
                          </text>
                        </g>
                      );
                    })()}

                    {/* Actual Doctor Markers */}
                    {radiusResult.doctors.map((doc) => {
                      const pt = projectCoord(doc.latitude, doc.longitude);
                      const isSelected = selectedMapDoctor?.id === doc.id;

                      return (
                        <g
                          key={doc.id}
                          transform={`translate(${pt.x}, ${pt.y})`}
                          onClick={() => setSelectedMapDoctor(doc)}
                          className="cursor-pointer group"
                        >
                          {isSelected && (
                            <circle r="22" fill="#14b8a6" opacity="0.3" className="animate-ping" />
                          )}

                          {/* Pin Drop SVG Icon */}
                          <path
                            d="M 0 0 C -10 -15 -14 -22 -14 -32 A 14 14 0 1 1 14 -32 C 14 -22 10 -15 0 0 Z"
                            fill={isSelected ? '#0f766e' : '#059669'}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="filter drop-shadow-md transition-transform group-hover:scale-110"
                          />
                          <circle cx="0" cy="-32" r="5" fill="#ffffff" />

                          {/* Pin Label */}
                          <rect
                            x="-50"
                            y="-56"
                            width="100"
                            height="18"
                            rx="5"
                            fill={isSelected ? '#0f766e' : '#1e293b'}
                            opacity="0.9"
                          />
                          <text
                            x="0"
                            y="-44"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {doc.name.replace('Dr. ', '').slice(0, 14)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Map Zoom Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setMapZoom(prev => Math.min(prev + 0.3, 3))}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapZoom(prev => Math.max(prev - 0.3, 0.7))}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapZoom(1)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold"
                      title="Reset View"
                    >
                      1x
                    </button>
                  </div>

                  {/* Map Legend Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                      <span>Your Location</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                      <span>Doctor / Clinic Pin</span>
                    </span>
                  </div>
                </div>

                {/* Selected Doctor Map Detail Card (Clicking marker displays details) */}
                {selectedMapDoctor && (
                  <div className="p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border-2 border-teal-500/60 shadow-sm space-y-3 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-md text-xs font-bold">
                            {selectedMapDoctor.specialtyCategory}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {selectedMapDoctor.qualification}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {selectedMapDoctor.name}
                        </h3>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>{selectedMapDoctor.hospitalOrClinic}</span>
                        </p>
                        {selectedMapDoctor.address && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            📍 {selectedMapDoctor.address}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{selectedMapDoctor.rating || 4.9}</span>
                        </div>
                        <span className="text-xs font-bold text-teal-800 dark:text-teal-300 mt-1">
                          {userLocation && (selectedMapDoctor.calculatedDistance ?? 0) > 0 ? (
                            <span className="text-teal-700 dark:text-teal-300 font-extrabold">
                              📍 {selectedMapDoctor.calculatedDistance} km away
                            </span>
                          ) : (
                            <span className="text-slate-400">{selectedMapDoctor.city}</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-teal-200 dark:border-teal-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-slate-700 dark:text-slate-300">
                        {selectedMapDoctor.contactPhone && (
                          <span className="mr-3 font-semibold text-teal-800 dark:text-teal-300">
                            📞 {selectedMapDoctor.contactPhone}
                          </span>
                        )}
                        <span>Fee: <strong>₹{selectedMapDoctor.consultationFeeRupees}</strong></span>
                        <span className="mx-2">•</span>
                        <span>{selectedMapDoctor.availableDays}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedMapDoctor.contactPhone && (
                          <button
                            type="button"
                            onClick={() => showToast(`📞 Calling ${selectedMapDoctor.hospitalOrClinic} at ${selectedMapDoctor.contactPhone}`)}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 font-bold transition-all active:scale-95"
                          >
                            Call Clinic
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveChecklistDoctor(selectedMapDoctor)}
                          className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-2xs active:scale-95"
                        >
                          Prepare for Visit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            B. LIST VIEW OPTION (Cards Grid)
        ============================================================== */}
        {activeViewMode === 'list' && (
          <div>
            {radiusResult.radiusTier === 'none' || radiusResult.doctors.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-sm text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  No suitable specialist was found within 100 km of your selected location.
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  HealYaar strictly enforces a 100 km maximum radius to prevent recommending clinics that are too far away. Try choosing a nearby metropolitan hub or clearing your search filters below.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSpecialty('All');
                      setSearchQuery('');
                      setIsManualLocationOpen(true);
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow"
                  >
                    Change Location or Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {radiusResult.doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="interactive-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold">
                            {doc.specialtyCategory}
                          </span>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                            {doc.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            {doc.qualification}
                          </p>
                        </div>

                        {/* Calculated Distance */}
                        <div className="text-right">
                          {userLocation && doc.calculatedDistance > 0 ? (
                            <>
                              <span className="text-sm font-black text-teal-700 dark:text-teal-400 flex items-center justify-end gap-1">
                                <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                {doc.calculatedDistance} km
                              </span>
                              <div className="text-[10px] text-slate-400 font-medium">calculated distance</div>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-bold text-slate-400">Regional</span>
                              <div className="text-[10px] text-slate-400">{doc.city}</div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-slate-800 dark:text-slate-200 font-medium pt-1">
                        <strong className="text-slate-900 dark:text-white">Hospital/Clinic:</strong> {doc.hospitalOrClinic}
                      </div>

                      {doc.address && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span>{doc.address}</span>
                        </div>
                      )}

                      {doc.contactPhone && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                          <span className="font-semibold text-teal-800 dark:text-teal-300">{doc.contactPhone}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                          {doc.experienceYears}+ years exp
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                          ₹{doc.consultationFeeRupees} approx fee
                        </span>
                        {doc.rating && (
                          <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {doc.rating}
                          </span>
                        )}
                        {doc.wheelchairAccessible && (
                          <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-md flex items-center gap-1">
                            <Accessibility className="w-3.5 h-3.5" />
                            Wheelchair accessible
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <strong>Languages:</strong> {doc.languages.join(', ')} • <strong>Timings:</strong> {doc.availableDays}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {doc.city}, {doc.state || 'India'}
                      </span>
                      <button
                        onClick={() => setActiveChecklistDoctor(doc)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Prepare for Visit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ==============================================================
          4. SEARCH & FILTER SECTION (BELOW CLINICS NEARBY)
      ============================================================== */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Refine Search & Filter By Specialty</span>
          </h3>
          {(selectedSpecialty !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSpecialty('All');
                setSearchQuery('');
              }}
              className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Search by text */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, hospital, clinic, or specialty..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Specialty Filter Pills */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mr-1">Specialties:</span>
          {specialties.map((spec) => {
            const isSelected = selectedSpecialty === spec;
            return (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-300'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </section>

      {/* ==============================================================
          5. HEALTHCARE DIRECTORY NOTE (VERY BOTTOM OF PAGE)
      ============================================================== */}
      <footer className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs leading-relaxed space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <ShieldAlert className="w-4 h-4 text-slate-500" />
          <span>Healthcare Directory Notice</span>
        </div>
        <p>
          This directory is provided strictly for educational and informational convenience. Healthcare provider details, consulting fees, accepted insurance, and clinic timings may change without notice. Users should verify real-time availability and appointment timings directly with the medical facility before visiting.
        </p>
        <p>
          HealYaar does not endorse, guarantee availability, or ensure treatment outcomes for any healthcare provider or facility listed. In emergency medical situations, please call <strong>108</strong> or <strong>112</strong> or go to the nearest emergency room immediately.
        </p>
      </footer>

      {/* Appointment Prep Checklist Modal */}
      {activeChecklistDoctor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-full text-xs font-bold">
                  Simulated Appointment Preparation
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  Visit Checklist for {activeChecklistDoctor.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeChecklistDoctor.specialty} • {activeChecklistDoctor.hospitalOrClinic}
                </p>
              </div>
              <button
                onClick={() => setActiveChecklistDoctor(null)}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-800 dark:text-slate-200">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Things to carry with you:</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Your current medicine strips, boxes, or written prescription list.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Previous blood tests, scans, or discharge summaries from the last 6 months.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>A written note of when your symptoms began and what triggers them.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>A government photo ID and health insurance card (if applicable).</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
              * Note: This is an educational checklist. Real appointment bookings must be made through licensed hospital counters or verified medical clinics.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  showToast('Checklist ready! Save it to your notes.');
                  setActiveChecklistDoctor(null);
                }}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow"
              >
                Got It, Thank You
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
