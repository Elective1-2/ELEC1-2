import React, { useState, useEffect, useRef } from 'react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

function LiveMap({ busLocation, origin, destination }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [userLocation, setUserLocation] = useState({ lat: 14.5995, lng: 120.9842 });
  const [mapReady, setMapReady] = useState(false);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        console.log('Google Maps API is ready');
        setMapReady(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    window.addEventListener('google-maps-loaded', checkGoogleMaps);
    return () => window.removeEventListener('google-maps-loaded', checkGoogleMaps);
  }, []);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.warn('Geolocation error:', error)
      );
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const center = busLocation || userLocation;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.lat, lng: center.lng },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 4,
        strokeOpacity: 0.7,
      },
    });
    directionsRendererRef.current.setMap(mapInstanceRef.current);

    console.log('Map initialized');
  }, [mapReady, userLocation]);

  // Update bus marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    if (busLocation) {
      if (markerRef.current) {
        markerRef.current.setPosition({ lat: busLocation.lat, lng: busLocation.lng });
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: { lat: busLocation.lat, lng: busLocation.lng },
          map: mapInstanceRef.current,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/bus.png',
            scaledSize: new window.google.maps.Size(40, 40),
          },
          title: 'Bus Location',
        });
      }
      mapInstanceRef.current.panTo({ lat: busLocation.lat, lng: busLocation.lng });
    } else if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  }, [busLocation, mapReady]);

  // Fetch directions
  useEffect(() => {
    if (!mapReady || !origin || !destination || !directionsRendererRef.current) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
        } else {
          console.error('Directions failed:', status);
        }
      }
    );
  }, [origin, destination, mapReady]);

  return (
    <div ref={mapRef} style={mapContainerStyle}>
      {!mapReady && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f0f0f0' }}>
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
}

export default LiveMap;