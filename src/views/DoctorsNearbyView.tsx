import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHero } from '../components/ui/SectionHero';
import { DoctorFinderIllustration } from '../components/ContextualIllustrations';
import { Tooltip } from '../components/ui/Tooltip';
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
  Clock,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Video,
  X
} from 'lucide-react';

export const DoctorsNearbyView: React.FC = () => {
  const { showToast, addReminder, setTab } = useApp();

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

  // Search & Filters (Practo/Zocdoc workflow pattern)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedVisitType, setSelectedVisitType] = useState<'All' | 'In-person Clinic' | 'Teleconsultation'>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [activeChecklistDoctor, setActiveChecklistDoctor] = useState<(DoctorListing & { calculatedDistance?: number }) | null>(null);
  const [appointmentModalDoctor, setAppointmentModalDoctor] = useState<(DoctorListing & { calculatedDistance?: number }) | null>(null);

  // Personal Appointment Reminder Form State
  const [appointmentDate, setAppointmentDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState<string>('10:30');
  const [appointmentVisitType, setAppointmentVisitType] = useState<'In-person Clinic' | 'Teleconsultation'>('In-person Clinic');
  const [appointmentNotes, setAppointmentNotes] = useState<string>('Carry previous blood reports and prescription slips.');
  const [appointmentSavedSuccess, setAppointmentSavedSuccess] = useState<boolean>(false);

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
    } catch {
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
    } catch {
      // ignore
    } finally {
      setIsGeocodingManual(false);
    }
  };

  /**
   * STRICT RADIUS FILTERING ENGINE + PRACTO/ZOCDOC FILTERS:
   * Priority 1 (<= 10 km) -> Priority 2 (10 - 100 km) -> None (> 100 km)
   */
  const radiusResult: DoctorSearchRadiusResult = useMemo(() => {
    let baseList = syntheticDoctors;

    // Apply visit type filter
    if (selectedVisitType === 'Teleconsultation') {
      baseList = baseList.filter((d) => d.audioConsultAvailable);
    }

    if (!userLocation) {
      const filtered = baseList.filter((doc) => {
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
        message: 'Detect GPS location or choose a city for strict 10 km distance calculation.',
        totalFound: filtered.length
      };
    }

    return filterDoctorsByRadius(
      baseList,
      userLocation.latitude,
      userLocation.longitude,
      selectedSpecialty,
      searchQuery
    );
  }, [userLocation, selectedSpecialty, selectedVisitType, searchQuery]);

  // When doctors change, select the first doctor for map preview if none selected
  useEffect(() => {
    if (radiusResult.doctors.length > 0) {
      if (!selectedMapDoctor || !radiusResult.doctors.some((d) => d.id === selectedMapDoctor.id)) {
        setSelectedMapDoctor(radiusResult.doctors[0]);
      }
    } else {
      setSelectedMapDoctor(null);
    }
  }, [radiusResult.doctors]);

  /**
   * Vector Map Coordinate Bounds
   */
  const mapBounds = useMemo(() => {
    const docs = radiusResult.doctors;
    const centerLat = userLocation ? userLocation.latitude : (docs[0]?.latitude || 28.4595);
    const centerLng = userLocation ? userLocation.longitude : (docs[0]?.longitude || 77.0266);

    let minLat = centerLat;
    let maxLat = centerLat;
    let minLng = centerLng;
    let maxLng = centerLng;

    docs.forEach((d) => {
      if (d.latitude < minLat) minLat = d.latitude;
      if (d.latitude > maxLat) maxLat = d.latitude;
      if (d.longitude < minLng) minLng = d.longitude;
      if (d.longitude > maxLng) maxLng = d.longitude;
    });

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

  const projectCoord = (lat: number, lng: number) => {
    const width = 800;
    const height = 500;
    const padding = 60;

    const spanLng = mapBounds.maxLng - mapBounds.minLng || 0.1;
    const spanLat = mapBounds.maxLat - mapBounds.minLat || 0.1;

    const x = padding + ((lng - mapBounds.minLng) / spanLng) * (width - 2 * padding);
    const y = height - padding - ((lat - mapBounds.minLat) / spanLat) * (height - 2 * padding);

    return { x: Math.max(30, Math.min(width - 30, x)), y: Math.max(30, Math.min(height - 30, y)) };
  };

  /**
   * Save Personal Appointment to Reminders
   * Conforms to: "If booking is not connected, say so clearly and offer a real call or external booking link.
   * Never show a fake 'confirmed' appointment. Let users distinguish a saved personal appointment from a provider-confirmed booking."
   */
  const handleSavePersonalAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentModalDoctor) return;

    addReminder({
      title: `Doctor Visit: ${appointmentModalDoctor.name}`,
      type: 'appointment',
      time: appointmentTime,
      date: appointmentDate,
      repeatDays: ['Once'],
      instructions: `${appointmentVisitType} at ${appointmentModalDoctor.hospitalOrClinic}. Fee: ₹${appointmentModalDoctor.consultationFeeRupees}. ${appointmentNotes}`,
      active: true,
      doctorName: appointmentModalDoctor.name,
      clinicName: appointmentModalDoctor.hospitalOrClinic,
      isPersonalReminder: true
    });

    setAppointmentSavedSuccess(true);
    showToast(`Appointment saved in personal reminders for ${appointmentDate} at ${appointmentTime}.`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* 1. Header Banner */}
      <SectionHero
        title="Find Doctors & Clinics"
        description="Verified healthcare facilities with GPS distance calculation and practical search filters."
        badge={{
          icon: Stethoscope,
          text: 'Verified Specialists',
          variant: 'emerald'
        }}
        illustration={<DoctorFinderIllustration size="md" />}
        actions={
          <Tooltip content="Auto-detect via GPS" position="bottom">
            <button
              onClick={handleDetectUserLocation}
              disabled={isLocating}
              className="interactive-button inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap self-start sm:self-auto"
            >
              {isLocating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-white" />
                  <span>My Location</span>
                </>
              )}
            </button>
          </Tooltip>
        }
      />

      {/* 2. Location Status & Search Filters Bar (Prominent at top) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Location Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span className="font-semibold">
              {userLocation ? userLocation.locationName : 'Location not set (showing national network)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Change city or locality" position="left">
              <button
                type="button"
                onClick={() => setIsManualLocationOpen((prev) => !prev)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 font-bold rounded-xl text-xs transition-colors"
              >
                {userLocation ? 'Change Area' : 'Enter Location'}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Manual Location Form Popup */}
        {isManualLocationOpen && (
          <form
            onSubmit={handleManualLocationSubmit}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-teal-200 dark:border-teal-800 shadow-xs space-y-3 animate-fade-in"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Select City or Enter Locality / PIN:</span>
              <button
                type="button"
                onClick={() => setIsManualLocationOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualLocationInput}
                onChange={(e) => setManualLocationInput(e.target.value)}
                placeholder="e.g. Gurugram, Saket New Delhi, Bandra Mumbai, Bengaluru..."
                className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={isGeocodingManual}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap"
              >
                {isGeocodingManual ? 'Finding...' : 'Set Area'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Quick Select:</span>
              {quickCities.map((city) => (
                <button
                  key={city.label}
                  type="button"
                  onClick={() => handleQuickCitySelect(city.query)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-800 dark:hover:text-teal-300 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
                >
                  {city.label}
                </button>
              ))}
            </div>
          </form>
        )}

        {/* Location Error Notice */}
        {locationError && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{locationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="font-bold text-amber-700 hover:text-amber-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor, clinic, specialty, or condition..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filters Row: Visit Type & Specialties */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Visit Type Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start">
            <button
              onClick={() => setSelectedVisitType('All')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedVisitType === 'All'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Visits
            </button>
            <button
              onClick={() => setSelectedVisitType('In-person Clinic')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedVisitType === 'In-person Clinic'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              In-Clinic
            </button>
            <button
              onClick={() => setSelectedVisitType('Teleconsultation')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                selectedVisitType === 'Teleconsultation'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>Video / Audio</span>
            </button>
          </div>

          {/* Reset Filters */}
          {(selectedSpecialty !== 'All' || searchQuery || selectedVisitType !== 'All') && (
            <button
              onClick={() => {
                setSelectedSpecialty('All');
                setSelectedVisitType('All');
                setSearchQuery('');
              }}
              className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline self-end sm:self-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 overflow-x-auto pb-1">
          {specialties.map((spec) => {
            const isSelected = selectedSpecialty === spec;
            return (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Results Section Header & View Toggle (List vs Map) */}
      <section className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              <span>Available Specialists ({radiusResult.totalFound})</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              {radiusResult.message}
            </p>
          </div>

          {/* Toggle buttons: [List View] / [Map View] */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <Tooltip content="Show card list" position="top">
              <button
                type="button"
                onClick={() => setActiveViewMode('list')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeViewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ListIcon className="w-4 h-4" />
                <span>List</span>
              </button>
            </Tooltip>
            <Tooltip content="Show interactive map" position="top">
              <button
                type="button"
                onClick={() => setActiveViewMode('map')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeViewMode === 'map'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <MapIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Map</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* MAP VIEW */}
        {activeViewMode === 'map' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
            {radiusResult.doctors.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  No clinics found within radius.
                </h4>
                <p className="text-xs text-slate-500">
                  Try clearing specialty filters or searching another area.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner h-[460px] flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-200/80 dark:text-slate-800/60" strokeWidth="1" />
                      </pattern>
                      <radialGradient id="userRadar" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    <rect width="800" height="500" fill="url(#grid)" />

                    {/* Concentric Distance Rings */}
                    {userLocation && (() => {
                      const userPt = projectCoord(userLocation.latitude, userLocation.longitude);
                      return (
                        <g>
                          <circle cx={userPt.x} cy={userPt.y} r={180} fill="url(#userRadar)" />
                          <circle cx={userPt.x} cy={userPt.y} r={80} fill="none" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                          <circle cx={userPt.x} cy={userPt.y} r={160} fill="none" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
                          <text x={userPt.x + 85} y={userPt.y - 5} fill="#0d9488" fontSize="10" fontWeight="bold">10 km radius</text>
                          <text x={userPt.x + 165} y={userPt.y - 5} fill="#0d9488" fontSize="10" fontWeight="bold">50 km radius</text>
                        </g>
                      );
                    })()}

                    {/* User Location Marker */}
                    {userLocation && (() => {
                      const userPt = projectCoord(userLocation.latitude, userLocation.longitude);
                      return (
                        <g transform={`translate(${userPt.x}, ${userPt.y})`}>
                          <circle r="12" fill="#0d9488" opacity="0.25" className="animate-ping" />
                          <circle r="7" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" />
                          <rect x="-45" y="-30" width="90" height="20" rx="6" fill="#134e4a" opacity="0.92" />
                          <text x="0" y="-16" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                            You Are Here
                          </text>
                        </g>
                      );
                    })()}

                    {/* Doctor Markers */}
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
                          {isSelected && <circle r="22" fill="#14b8a6" opacity="0.3" className="animate-ping" />}
                          <path
                            d="M 0 0 C -10 -15 -14 -22 -14 -32 A 14 14 0 1 1 14 -32 C 14 -22 10 -15 0 0 Z"
                            fill={isSelected ? '#0f766e' : '#059669'}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="filter drop-shadow-md transition-transform group-hover:scale-110"
                          />
                          <circle cx="0" cy="-32" r="5" fill="#ffffff" />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Zoom Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setMapZoom((prev) => Math.min(prev + 0.3, 3))}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapZoom((prev) => Math.max(prev - 0.3, 0.7))}
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
                </div>

                {/* Selected Doctor Summary Card */}
                {selectedMapDoctor && (
                  <div className="p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-500/60 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-md text-xs font-bold">
                            {selectedMapDoctor.specialtyCategory}
                          </span>
                          <span className="text-xs text-slate-500">{selectedMapDoctor.qualification}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                          {selectedMapDoctor.name}
                        </h3>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                          {selectedMapDoctor.hospitalOrClinic} • {selectedMapDoctor.city}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                          {userLocation && (selectedMapDoctor.calculatedDistance ?? 0) > 0 ? (
                            `📍 ${selectedMapDoctor.calculatedDistance} km away`
                          ) : (
                            selectedMapDoctor.city
                          )}
                        </span>
                        <div className="text-xs text-slate-500 mt-0.5">Fee: ₹{selectedMapDoctor.consultationFeeRupees}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-teal-200 dark:border-teal-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-slate-600 dark:text-slate-300">
                        Next Slot: <strong>{selectedMapDoctor.availableDays.split('(')[0]}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedMapDoctor.contactPhone && (
                          <a
                            href={`tel:${selectedMapDoctor.contactPhone.replace(/\s+/g, '')}`}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 font-bold"
                          >
                            Call Clinic
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setAppointmentModalDoctor(selectedMapDoctor);
                            setAppointmentSavedSuccess(false);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                        >
                          Save Reminder
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* LIST VIEW (Doctor Cards Grid) */}
        {activeViewMode === 'list' && (
          <div>
            {radiusResult.doctors.length === 0 ? (
              <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-sm text-center space-y-3">
                <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  No specialists found matching filters.
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try clearing filters or changing your location.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecialty('All');
                    setSelectedVisitType('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {radiusResult.doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="interactive-card p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-600 shadow-sm transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Header: Specialty & Distance Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md text-xs font-bold">
                              {doc.specialtyCategory}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                              <span>Verified Clinic</span>
                            </span>
                          </div>

                          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">
                            {doc.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold">{doc.qualification}</p>
                        </div>

                        {/* Distance */}
                        <div className="text-right flex-shrink-0">
                          {userLocation && doc.calculatedDistance > 0 ? (
                            <span className="text-sm font-black text-teal-700 dark:text-teal-400 flex items-center justify-end gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {doc.calculatedDistance} km
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">{doc.city}</span>
                          )}
                        </div>
                      </div>

                      {/* Clinic Info */}
                      <div className="text-xs text-slate-800 dark:text-slate-200 font-medium space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>{doc.hospitalOrClinic}</span>
                        </div>
                        {doc.address && (
                          <p className="text-slate-500 dark:text-slate-400 pl-5 text-[11px] leading-relaxed">
                            {doc.address}
                          </p>
                        )}
                      </div>

                      {/* Key Attributes Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1 text-xs font-semibold">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                          {doc.experienceYears}+ yrs exp
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                          ₹{doc.consultationFeeRupees} Fee
                        </span>
                        {doc.rating && (
                          <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-lg flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {doc.rating}
                          </span>
                        )}
                        {doc.wheelchairAccessible && (
                          <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-lg flex items-center gap-1">
                            <Accessibility className="w-3 h-3" />
                            Accessible
                          </span>
                        )}
                      </div>

                      {/* Next Slot & Languages */}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Timings: {doc.availableDays}</span>
                      </div>
                    </div>

                    {/* Card Actions (Call, Directions, Save Personal Reminder, Checklist) */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {doc.contactPhone && (
                          <Tooltip content="Call hospital reception" position="top">
                            <a
                              href={`tel:${doc.contactPhone.replace(/\s+/g, '')}`}
                              className="interactive-button px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5 text-teal-600" />
                              <span>Call</span>
                            </a>
                          </Tooltip>
                        )}
                        <Tooltip content="Open in Google Maps" position="top">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${doc.latitude},${doc.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="interactive-button px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            <span>Map</span>
                          </a>
                        </Tooltip>
                        <Tooltip content="Preparation checklist" position="top">
                          <button
                            type="button"
                            onClick={() => setActiveChecklistDoctor(doc)}
                            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline px-1"
                          >
                            Checklist
                          </button>
                        </Tooltip>
                      </div>

                      <Tooltip content="Save to your personal reminders" position="top">
                        <button
                          type="button"
                          onClick={() => {
                            setAppointmentModalDoctor(doc);
                            setAppointmentSavedSuccess(false);
                          }}
                          className="interactive-button px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Save Appointment</span>
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Directory Disclaimer */}
      <footer className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs leading-relaxed space-y-1">
        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          <span>Provider Information Notice</span>
        </div>
        <p>
          Facility listings and coordinates are sourced from OpenStreetMap Healthcare. Consultation fees and clinic timings are regional estimates. In emergency medical situations, call <strong>108</strong> or <strong>112</strong> immediately.
        </p>
      </footer>

      {/* MODAL 1: Save Personal Appointment Reminder */}
      {appointmentModalDoctor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-md text-xs font-bold">
                  Personal Health Reminder
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                  Schedule Reminder for {appointmentModalDoctor.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {appointmentModalDoctor.hospitalOrClinic} • Fee: ₹{appointmentModalDoctor.consultationFeeRupees}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAppointmentModalDoctor(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Clear Provider Notice (No Fake Bookings) */}
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-xs text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Direct clinic booking not integrated:</strong> This creates a personal calendar reminder in your HealYaar account. To confirm your slot with the hospital counter, call{' '}
                {appointmentModalDoctor.contactPhone ? (
                  <a href={`tel:${appointmentModalDoctor.contactPhone.replace(/\s+/g, '')}`} className="font-bold underline">
                    {appointmentModalDoctor.contactPhone}
                  </a>
                ) : (
                  'the clinic reception'
                )}.
              </div>
            </div>

            {appointmentSavedSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Reminder Saved Successfully!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Scheduled for <strong>{appointmentDate}</strong> at <strong>{appointmentTime}</strong>.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAppointmentModalDoctor(null);
                      setTab('reminders');
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow"
                  >
                    View in Reminders
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppointmentModalDoctor(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSavePersonalAppointment} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Date:
                    </label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Time:
                    </label>
                    <input
                      type="time"
                      required
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Visit Type:
                  </label>
                  <select
                    value={appointmentVisitType}
                    onChange={(e) => setAppointmentVisitType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white"
                  >
                    <option value="In-person Clinic">In-person Clinic Visit</option>
                    <option value="Teleconsultation">Audio / Video Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Reminder Note:
                  </label>
                  <textarea
                    rows={2}
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAppointmentModalDoctor(null)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-transform active:scale-95"
                  >
                    Save Reminder
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Visit Preparation Checklist */}
      {activeChecklistDoctor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-md text-xs font-bold">
                  Visit Checklist
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                  Checklist for {activeChecklistDoctor.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeChecklistDoctor.specialty} • {activeChecklistDoctor.hospitalOrClinic}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveChecklistDoctor(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase text-slate-400">
                Items to carry:
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Current prescription slips or medication packaging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Recent blood tests or imaging reports from past 6 months</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Brief notes on symptom duration and triggers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Government photo ID card</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveChecklistDoctor(null)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
