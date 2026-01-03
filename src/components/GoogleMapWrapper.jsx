import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useGoogleMaps } from '../lib/useGoogleMaps';
import MapError from './MapError';

const GoogleMapWrapper = ({
  center,
  zoom = 15,
  markers = [],
  directions = null,
  mapContainerStyle,
  children,
}) => {
  const { isLoaded, loadError, apiKey } = useGoogleMaps();
  const [mapError, setMapError] = useState(null);

  // Validate center coordinates
  const isValidCenter = center && 
    typeof center.lat === 'number' && 
    typeof center.lng === 'number' &&
    !isNaN(center.lat) && 
    !isNaN(center.lng) &&
    center.lat !== 0 && 
    center.lng !== 0;

  useEffect(() => {
    // Reset error when map loads successfully
    if (isLoaded && !loadError) {
      setMapError(null);
    }
  }, [isLoaded, loadError]);

  if (!apiKey) {
    return <MapError error="API_KEY_MISSING" />;
  }

  if (loadError) {
    console.error('Google Maps load error:', loadError);
    // Check for specific error types
    if (loadError.message?.includes('InvalidKey') || loadError.message?.includes('ApiNotActivated')) {
      return <MapError error="API_KEY_INVALID" />;
    }
    return <MapError error="LOAD_ERROR" />;
  }

  if (!isLoaded) {
    return (
      <div style={styles.loading}>
        <p>Loading map...</p>
      </div>
    );
  }

  if (!isValidCenter) {
    return (
      <MapError 
        error="INVALID_CENTER" 
        message="Invalid map center coordinates. Please ensure location data is available."
      />
    );
  }

  const defaultMapStyle = {
    width: '100%',
    height: '400px',
    ...mapContainerStyle,
  };

  return (
    <div style={styles.mapContainer}>
      {mapError && (
        <div style={styles.errorBanner}>
          {mapError}
        </div>
      )}
      <GoogleMap
        mapContainerStyle={defaultMapStyle}
        center={center}
        zoom={zoom}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
        onLoad={() => {
          setMapError(null);
        }}
        onError={(error) => {
          console.error('Google Maps error:', error);
          setMapError('Failed to load Google Maps. Please check your API key and internet connection.');
        }}
      >
        {markers.map((marker, index) => (
          marker && marker.position && (
            <Marker
              key={index}
              position={marker.position}
              label={marker.label}
              title={marker.title}
              icon={marker.icon}
            />
          )
        ))}
        {directions && <DirectionsRenderer directions={directions} />}
        {children}
      </GoogleMap>
    </div>
  );
};

const styles = {
  mapContainer: {
    width: '100%',
    position: 'relative',
  },
  loading: {
    width: '100%',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  errorBanner: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    right: '10px',
    backgroundColor: '#ff4757',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    zIndex: 1000,
    fontSize: '14px',
    textAlign: 'center',
  },
};

export default GoogleMapWrapper;

