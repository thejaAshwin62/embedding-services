import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

class LocationService {
  constructor() {
    this.ipstackApiKey = process.env.IPSTACK_API_KEY;
  }

  async reverseGeocode(latitude, longitude) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ConclusionAtPeak/1.0'
          }
        }
      );

      const data = response.data;
      return {
        area: data.address.suburb || data.address.neighbourhood || data.address.residential || 'Unknown Area',
        street: data.address.road || data.address.street || 'Unknown Street',
        locality: data.address.locality || data.address.suburb || data.address.city_district || 'Unknown Locality',
        zip: data.address.postcode || 'Unknown Zip',
        formatted_address: data.display_name || ''
      };
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return null;
    }
  }

  async getDeviceLocation() {
    try {
      const ipResponse = await axios.get("https://api.ipify.org?format=json");
      if (!ipResponse.data || !ipResponse.data.ip) {
        throw new Error("Failed to get IP address");
      }
      const ip = ipResponse.data.ip;

      const locationUrl = `http://api.ipstack.com/${ip}?access_key=${this.ipstackApiKey}`;
      const locationResponse = await axios.get(locationUrl);
      const locationData = locationResponse.data;

      if (
        !locationData ||
        !locationData.city ||
        !locationData.region_name ||
        !locationData.country_name ||
        locationData.latitude === undefined ||
        locationData.longitude === undefined
      ) {
        throw new Error("Incomplete location data received");
      }

      // Get detailed area information using reverse geocoding
      const areaDetails = await this.reverseGeocode(
        locationData.latitude,
        locationData.longitude
      );

      return {
        ip: ip,
        city: locationData.city,
        region: locationData.region_name,
        country: locationData.country_name,
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude),
        area: areaDetails?.area || 'Unknown Area',
        street: areaDetails?.street || 'Unknown Street',
        locality: areaDetails?.locality || 'Unknown Locality',
        zip: locationData.zip || areaDetails?.zip || 'Unknown Zip',
        formatted_address: areaDetails?.formatted_address || '',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in getDeviceLocation:", error);
      throw new Error(`Failed to get location data: ${error.message}`);
    }
  }
}

export default new LocationService();
