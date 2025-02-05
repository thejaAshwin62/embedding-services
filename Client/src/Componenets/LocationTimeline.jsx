import { useEffect, useRef, useState } from "react";
import { Timeline } from "vis-timeline/standalone";
import { DataSet } from "vis-data";
import "vis-timeline/styles/vis-timeline-graph2d.css";
import customFetch from "../utils/customFetch";

const LocationTimeline = () => {
  const timelineRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState(null);

  // Function to format time to 12-hour format
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    let timelineInstance = null;

    const fetchLocations = async () => {
      try {
        const response = await customFetch.get("/feedback/locations");
        const locations = response.data;

        // Create timeline items from locations
        const items = locations.map((loc) => ({
          id: loc._id || Math.random().toString(),
          content: `
            <div class="p-2 sm:p-3">
              <div class="flex flex-col gap-1 sm:gap-2">
                <div class="font-medium text-xs sm:text-base text-gray-900">
                  ${loc.location?.area || "Unknown Area"}
                </div>
                <div class="text-[10px] sm:text-xs text-gray-500 leading-tight sm:leading-relaxed">
                  ${loc.location?.formatted_address || "No address available"}
                </div>
                <div class="text-[10px] sm:text-xs text-gray-600">
                  ${loc.id_date} at ${formatTime(loc.id_time)}
                </div>
              </div>
            </div>
          `,
          start: new Date(
            `${loc.id_date.split("/").reverse().join("-")} ${loc.id_time}`
          ),
          group: loc.location?.area || "Unknown",
        }));

        // Create groups based on unique areas
        const uniqueAreas = [
          ...new Set(locations.map((loc) => loc.location?.area || "Unknown")),
        ];
        const groups = uniqueAreas.map((area) => ({
          id: area,
          content: `
            <div class="font-medium text-[10px] sm:text-sm text-gray-900 px-2 py-1">
              ${area}
            </div>
          `,
        }));

        // Configure timeline options
        const options = {
          width: "100%",
          height: "400px",
          stack: true,
          showCurrentTime: true,
          zoomable: true,
          horizontalScroll: true,
          verticalScroll: true,
          orientation: { axis: "both" },
          margin: {
            item: {
              horizontal: 8,
              vertical: 8,
            }
          },
          format: {
            minorLabels: {
              minute: "h:mma",
              hour: "ha",
            },
            majorLabels: {
              millisecond: "HH:mm:ss",
              second: "D MMMM HH:mm",
              minute: "ddd D MMMM",
              hour: "ddd D MMMM",
              weekday: "MMMM YYYY",
              day: "MMMM YYYY",
              week: "MMMM YYYY",
              month: "YYYY",
              year: "",
            },
          },
        };

        // Initialize timeline
        if (timelineRef.current) {
          timelineInstance = new Timeline(
            timelineRef.current,
            new DataSet(items),
            new DataSet(groups),
            options
          );

          timelineInstance.on("select", (properties) => {
            const selectedItem = items.find(
              (item) => item.id === properties.items[0]
            );
            if (selectedItem) {
              console.log("Selected:", selectedItem);
            }
          });

          setTimeline(timelineInstance);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setError("Failed to load timeline data");
        setIsLoading(false);
      }
    };

    fetchLocations();

    return () => {
      if (timelineInstance) {
        timelineInstance.destroy();
      }
    };
  }, []);

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
        <p className="text-red-500 text-sm sm:text-base">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div
        ref={timelineRef}
        className="timeline-container"
        style={{ 
          height: "400px", 
          width: "100%",
          minHeight: "300px" // Minimum height for smaller screens
        }}
      />
    </div>
  );
};

export default LocationTimeline;
