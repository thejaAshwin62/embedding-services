import { useState, useEffect } from 'react';
import { useGeolocated } from 'react-geolocated';

const useLocation = () => {
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState(null);

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  });

  useEffect(() => {
    const getLocationDetails = async (latitude, longitude) => {
      try {
        // Using OpenStreetMap's Nominatim service for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'ConclusionAtPeak/1.0'
            }
          }
        );
        const data = await response.json();

        setLocationData({
          latitude,
          longitude,
          city: data.address.city || data.address.town || data.address.village || 'Unknown City',
          region: data.address.state || 'Unknown Region',
          country: data.address.country || 'Unknown Country',
          area: data.address.suburb || data.address.neighbourhood || data.address.residential || 'Unknown Area',
          street: data.address.road || data.address.street || 'Unknown Street',
          locality: data.address.locality || data.address.suburb || data.address.city_district || 'Unknown Locality',
          zip: data.address.postcode || 'Unknown Zip',
          formatted_address: data.display_name || '',
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        setError('Failed to get location details');
        console.error('Error getting location details:', err);
      }
    };

    if (coords) {
      getLocationDetails(coords.latitude, coords.longitude);
    } else if (!isGeolocationAvailable) {
      setError('Your browser does not support geolocation');
    } else if (!isGeolocationEnabled) {
      setError('Geolocation is disabled');
    }
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

  return { locationData, error };
};

export default useLocation; 