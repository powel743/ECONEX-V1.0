// src/components/WasteMap.jsx
// src/components/WasteMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Make sure this is imported (or in main.jsx)
import L from 'leaflet';

// Fix for default Leaflet icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;
// End of icon fix

// --- NEW: Create a custom icon for the collector ---
const collectorIcon = new L.Icon({
  // Using a simple online icon. You can replace this with a local asset.
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684017.png',
  iconSize: [35, 35], // size of the icon
  iconAnchor: [17, 35], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -35], // point from which the popup should open
});
// ---

// --- 1. UPDATE PROPS ---
function WasteMap({ requests, collectorPosition }) {
  // Default center (e.g., Nairobi)
  const defaultPosition = [-1.286389, 36.817223];

  // --- 2. UPDATE MAP CENTER ---
  // Use collector's position if available, otherwise default
  const mapCenter = collectorPosition
    ? [collectorPosition.latitude, collectorPosition.longitude]
    : defaultPosition;
  
  // We need a key prop on MapContainer to force re-render when center changes
  // This is a common pattern with react-leaflet
  const mapKey = collectorPosition 
    ? `${collectorPosition.latitude}-${collectorPosition.longitude}` 
    : "default";

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      scrollWheelZoom={false} // UX Improvement: Prevent accidental zooming
      className="h-[400px] w-full rounded-xl shadow-inner border border-gray-200 z-0" // Tailwind Styling
      key={mapKey} // Force re-render on center change
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Map over all pending requests and create a marker for each */}
      {requests.map((req) => (
        <Marker
          key={req._id}
          // Leaflet expects [latitude, longitude]
          position={[
            req.pickupLocation.coordinates[1], // latitude
            req.pickupLocation.coordinates[0], // longitude
          ]}
        >
          <Popup className="font-sans">
            <div className="text-center min-w-[120px]">
              <strong className="text-emerald-700 text-lg block mb-1 capitalize">
                {req.type} Waste
              </strong>
              <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-300">
                {req.weight} kg
              </span>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-2">
                {req.status}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* --- 3. NEW: Marker for the Collector --- */}
      {collectorPosition && (
        <Marker
          position={[collectorPosition.latitude, collectorPosition.longitude]}
          icon={collectorIcon} // Use our custom icon
        >
          <Popup>
            <div className="text-center">
              <strong className="text-indigo-600 text-base">You are here</strong>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default WasteMap;