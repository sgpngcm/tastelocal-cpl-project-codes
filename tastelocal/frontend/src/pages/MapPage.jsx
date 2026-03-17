import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { FiMapPin, FiNavigation, FiCrosshair } from 'react-icons/fi';
import { configAPI, vendorAPI } from '../utils/api';
import { LoadingSpinner } from '../components/UI';
import { getVendorFallback, resolveMediaUrl } from '../utils/media';

const mapContainerStyle = { width: '100%', height: '100%' };
const singaporeCenter = { lat: 1.3521, lng: 103.8198 };

function isFiniteCoord(value) {
  return Number.isFinite(Number(value));
}

function parseVendor(vendor) {
  return {
    ...vendor,
    latitude: Number(vendor.latitude),
    longitude: Number(vendor.longitude),
  };
}

function buildGoogleMapsLink({ lat, lng, label }) {
  const query = encodeURIComponent(label ? `${label} @ ${lat},${lng}` : `${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function haversineKm(a, b) {
  if (!a || !b) return null;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const p1 = toRad(a.lat);
  const p2 = toRad(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h = sinLat * sinLat + Math.cos(p1) * Math.cos(p2) * sinLng * sinLng;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function MapCanvas({
  apiKey,
  vendors,
  selectedVendor,
  setSelectedVendor,
  hoveredId,
  setHoveredId,
  userLocation,
}) {
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'tastelocal-google-map',
    googleMapsApiKey: apiKey.trim(),
  });

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasBounds = false;

    vendors.forEach((vendor) => {
      if (isFiniteCoord(vendor.latitude) && isFiniteCoord(vendor.longitude)) {
        bounds.extend({ lat: Number(vendor.latitude), lng: Number(vendor.longitude) });
        hasBounds = true;
      }
    });

    if (userLocation) {
      bounds.extend(userLocation);
      hasBounds = true;
    }

    if (hasBounds) {
      mapRef.current.fitBounds(bounds, 80);
    } else {
      mapRef.current.setCenter(singaporeCenter);
      mapRef.current.setZoom(11);
    }
  }, [isLoaded, vendors, userLocation]);

  if (loadError) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(238,122,27,0.18),_transparent_30%),linear-gradient(180deg,#FFF7ED_0%,#FFFFFF_100%)] px-8 text-center">
        <FiMapPin size={52} className="text-primary-500" />
        <h2 className="mt-5 font-display text-3xl font-semibold text-gray-900">Map failed to load</h2>
        <p className="mt-3 max-w-md text-gray-500">Check that your Google Maps JavaScript API is enabled and that your API key referrer settings allow your frontend origin.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={userLocation || selectedVendor ? {
        lat: userLocation?.lat ?? selectedVendor.latitude,
        lng: userLocation?.lng ?? selectedVendor.longitude,
      } : singaporeCenter}
      zoom={12}
      onLoad={onLoad}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
      }}
    >
      {userLocation && (
        <MarkerF
          position={userLocation}
          label="You"
          zIndex={999}
        />
      )}

      {vendors.map((vendor) => (
        <MarkerF
          key={vendor.id}
          position={{ lat: vendor.latitude, lng: vendor.longitude }}
          onClick={() => setSelectedVendor(vendor)}
          onMouseOver={() => setHoveredId(vendor.id)}
          onMouseOut={() => setHoveredId(null)}
          animation={hoveredId === vendor.id ? window.google?.maps?.Animation?.BOUNCE : undefined}
        />
      ))}

      {selectedVendor && (
        <InfoWindowF
          position={{ lat: selectedVendor.latitude, lng: selectedVendor.longitude }}
          onCloseClick={() => setSelectedVendor(null)}
        >
          <div className="max-w-[240px] text-sm">
            <p className="font-semibold text-gray-900">{selectedVendor.business_name}</p>
            <p className="mt-1 text-gray-600">{selectedVendor.cuisine_type?.replace(/_/g, ' ')}</p>
            {selectedVendor.avg_rating > 0 && (
              <p className="mt-1 text-primary-600">★ {Number(selectedVendor.avg_rating).toFixed(1)}</p>
            )}
            <a
              href={buildGoogleMapsLink({
                lat: selectedVendor.latitude,
                lng: selectedVendor.longitude,
                label: selectedVendor.business_name,
              })}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-semibold text-primary-600"
            >
              Open in Google Maps
            </a>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}

export default function MapPage() {
  const [vendors, setVendors] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      vendorAPI.mapData().catch(() => ({ data: [] })),
      configAPI.get().catch(() => ({ data: {} })),
    ])
      .then(([vendorRes, configRes]) => {
        const items = (vendorRes.data || [])
          .map(parseVendor)
          .filter((vendor) => isFiniteCoord(vendor.latitude) && isFiniteCoord(vendor.longitude));

        setVendors(items);
        setSelectedVendor(items[0] || null);
        setApiKey(String(configRes.data?.google_maps_api_key || '').trim());
      })
      .finally(() => setLoading(false));
  }, []);

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('This browser does not support geolocation.');
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoLoading(false);
      },
      (error) => {
        const messageMap = {
          1: 'Location permission was denied.',
          2: 'Location information is unavailable.',
          3: 'Location request timed out.',
        };
        setGeoError(messageMap[error.code] || 'Unable to retrieve your location.');
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  const averageCenter = useMemo(() => {
    if (userLocation) return userLocation;
    if (!vendors.length) return singaporeCenter;

    return vendors.reduce(
      (acc, vendor) => ({
        lat: acc.lat + vendor.latitude / vendors.length,
        lng: acc.lng + vendor.longitude / vendors.length,
      }),
      { lat: 0, lng: 0 }
    );
  }, [vendors, userLocation]);

  const vendorsWithDistance = useMemo(() => {
    return vendors.map((vendor) => ({
      ...vendor,
      distanceKm: userLocation
        ? haversineKm(userLocation, { lat: vendor.latitude, lng: vendor.longitude })
        : null,
    })).sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [vendors, userLocation]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-warm-200/60 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">Map-led discovery</p>
            <h1 className="section-title mt-2">Find food experiences near your current location</h1>
            <p className="mt-3 max-w-3xl text-gray-500">This version uses both vendor coordinates and browser geolocation, so the map can focus on nearby places instead of showing only a generic center point.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-warm-100 px-4 py-2 text-sm font-medium text-gray-600">
              {vendors.length} mapped vendor{vendors.length === 1 ? '' : 's'}
            </div>
            <button
              type="button"
              onClick={requestUserLocation}
              disabled={geoLoading}
              className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiCrosshair />
              {geoLoading ? 'Locating…' : 'Use my location'}
            </button>
          </div>
        </div>
        {geoError && (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{geoError} Browser geolocation works only on localhost or a secure HTTPS site.</p>
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-warm-200/60">
          <div className="h-[620px] w-full">
            {apiKey ? (
              <MapCanvas
                apiKey={apiKey}
                vendors={vendors}
                selectedVendor={selectedVendor}
                setSelectedVendor={setSelectedVendor}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
                userLocation={userLocation}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(238,122,27,0.18),_transparent_30%),linear-gradient(180deg,#FFF7ED_0%,#FFFFFF_100%)] px-8 text-center">
                <FiMapPin size={52} className="text-primary-500" />
                <h2 className="mt-5 font-display text-3xl font-semibold text-gray-900">Map key missing</h2>
                <p className="mt-3 max-w-md text-gray-500">Add a valid Google Maps Platform JavaScript API key to your backend .env as GOOGLE_MAPS_API_KEY. The vendor list still uses your seeded coordinates and map links below.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {vendorsWithDistance.map((vendor) => {
            const selected = selectedVendor?.id === vendor.id;
            return (
              <div
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor)}
                className={`w-full overflow-hidden rounded-[1.5rem] border bg-white text-left shadow-md shadow-warm-200/40 transition hover:-translate-y-0.5 hover:shadow-lg ${selected ? 'border-primary-300 ring-2 ring-primary-100' : 'border-white/70'}`}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') setSelectedVendor(vendor);
                }}
              >
                <div className="flex gap-4 p-4">
                  <img
                    src={resolveMediaUrl(vendor.cover_image) || getVendorFallback(vendor)}
                    alt={vendor.business_name}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-primary-500">{vendor.cuisine_type?.replace(/_/g, ' ')}</p>
                    <h3 className="mt-1 truncate font-display text-2xl font-semibold text-gray-900">{vendor.business_name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">Lat {vendor.latitude.toFixed(4)} • Lng {vendor.longitude.toFixed(4)}</p>
                    {vendor.distanceKm != null && (
                      <p className="mt-2 text-sm font-medium text-gray-700">About {vendor.distanceKm.toFixed(1)} km from you</p>
                    )}
                    {vendor.avg_rating > 0 && (
                      <p className="mt-3 text-sm font-medium text-primary-600">★ {Number(vendor.avg_rating).toFixed(1)} average rating</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2"><FiNavigation /> Select marker</span>
                  <div className="flex items-center gap-4">
                    <a
                      href={buildGoogleMapsLink({
                        lat: vendor.latitude,
                        lng: vendor.longitude,
                        label: vendor.business_name,
                      })}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="font-semibold text-gray-500 hover:text-gray-700"
                    >
                      Directions
                    </a>
                    <Link
                      to={`/vendors/${vendor.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="font-semibold text-primary-600"
                    >
                      Open vendor
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!vendors.length && (
        <div className="mt-6 rounded-[2rem] bg-white p-6 text-gray-500 shadow-xl shadow-warm-200/60">
          No vendors with valid coordinates were found. Check that your vendor records have latitude, longitude, and is_approved=True.
        </div>
      )}
    </div>
  );
}
