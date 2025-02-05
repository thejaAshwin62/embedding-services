import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import customFetch from "../utils/customFetch";

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icon for better visibility
const customIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to recenter map when locations change
const RecenterAutomatically = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((item) => [
          item.location.latitude,
          item.location.longitude,
        ])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

const LocationMap = () => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await customFetch.get("/feedback/locations");
        console.log("Fetched locations:", response.data);

        // Filter out locations with invalid/missing coordinates
        const validLocations = response.data.filter(
          (item) =>
            item?.location?.latitude != null &&
            item?.location?.longitude != null
        );

        // Sort locations by date and time
        const sortedLocations = validLocations.sort((a, b) => {
          const dateA = new Date(`${a.id_date} ${a.id_time}`);
          const dateB = new Date(`${b.id_date} ${b.id_time}`);
          return dateB - dateA;
        });

        setLocations(sortedLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setError("Failed to load locations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Function to handle marker click
  const handleMarkerClick = (location) => {
    setActiveMarker(location);
  };

  // Function to get location display
  const getLocationDisplay = (formattedAddress) => {
    if (!formattedAddress) return 'Unknown Location';
    const parts = formattedAddress.split(',');
    if (parts.length >= 2) {
      return `${parts[0].trim()}, ${parts[1].trim()}`;
    }
    return parts[0].trim();
  };

  // Add this function to format time
  const formatTime = (time24) => {
    try {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return time24; // Return original time if formatting fails
    }
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex gap-2">
          <span className="loading loading-ball loading-sm"></span>
          <span className="loading loading-ball loading-sm"></span>
          <span className="loading loading-ball loading-sm"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const defaultCenter = [11.1271, 78.6569];
  const center = locations.length > 0 && locations[0]?.location
    ? [locations[0].location.latitude, locations[0].location.longitude]
    : defaultCenter;

  return (
    <div className="absolute inset-0 rounded-lg overflow-hidden z-[1]">
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterAutomatically locations={locations} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {locations.map((item, index) => {
            if (!item?.location?.latitude || !item?.location?.longitude) {
              return null;
            }

            const locationDisplay = getLocationDisplay(item.location?.formatted_address);
            const isActive = activeMarker === item;

            return (
              <Marker
                key={index}
                position={[item.location.latitude, item.location.longitude]}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(item),
                }}
              >
                <Popup
                  maxWidth={250}
                  maxHeight={200}
                  autoPan={true}
                  closeButton={true}
                  closeOnClick={false}
                  autoClose={false}
                  className="custom-popup"
                >
                  <div className="max-h-[180px] overflow-y-auto custom-scrollbar">
                    <div className="p-2 space-y-2">
                      <div className="border-b pb-2">
                        <p className="font-semibold text-primary-950 text-sm">
                          {locationDisplay}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.id_date} at {formatTime(item.id_time)}
                        </p>
                        <p className="text-gray-500 text-[10px]">
                          {item.location?.formatted_address}
                        </p>
                      </div>

                      <div className="text-xs space-y-1.5">
                        <p className="text-gray-700">{item.feedback}</p>

                        <div className="border-t pt-1.5 mt-2">
                          {item.location?.latitude && item.location?.longitude && (
                            <div className="text-[10px] text-gray-400 mt-1">
                              <p>
                                Lat: {Number(item.location.latitude).toFixed(6)}
                              </p>
                              <p>
                                Long: {Number(item.location.longitude).toFixed(6)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default LocationMap;
