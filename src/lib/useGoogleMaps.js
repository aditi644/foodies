import { useLoadScript } from '@react-google-maps/api';

const libraries = ['places', 'directions'];

export const useGoogleMaps = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
    id: 'google-map-script',
  });

  // Log errors for debugging
  if (loadError) {
    console.error('Google Maps Load Error:', loadError);
    console.error('Error details:', {
      message: loadError.message,
      name: loadError.name,
      stack: loadError.stack,
    });
  }

  return {
    isLoaded,
    loadError,
    apiKey,
  };
};

