import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ShieldAlert, Map as MapIcon, Info, User, Activity, AlertCircle } from 'lucide-react';

const REGION_BOUNDS = {
  'India': [[68.16, 6.75], [97.41, 35.5]],
  'North': [[72.0, 24.0], [88.0, 35.5]],
  'South': [[74.0, 8.0], [82.0, 18.0]],
  'East': [[83.0, 19.0], [93.0, 27.0]],
  'West': [[68.0, 18.0], [78.0, 25.0]],
  'West/Central': [[68.0, 18.0], [78.0, 25.0]],
  'North-East': [[89.0, 22.0], [97.5, 30.0]]
};

const CITY_COORDINATES = {
  "Delhi": [77.209, 28.6139], "Jaipur": [75.7873, 26.9124], "Udaipur": [73.7125, 24.5854],
  "Shimla": [77.1734, 31.1048], "Manali": [77.1892, 32.2432], "Leh": [77.5771, 34.1526],
  "Srinagar": [74.7973, 34.0837], "Varanasi": [82.9739, 25.3176], "Agra": [78.0081, 27.1767],
  "Rishikesh": [78.3266, 30.0869], "Haridwar": [78.1642, 29.9457], "Amritsar": [74.8723, 31.634],
  "Mumbai": [72.8777, 19.076], "Goa": [74.124, 15.2993], "Jaisalmer": [70.916, 26.9157],
  "Ajanta": [75.7031, 20.5519], "Gir": [70.5229, 21.1441], "Pune": [73.8567, 18.5204],
  "Ahmedabad": [72.5714, 23.0225], "Rann of Kutch": [69.8597, 23.7337], "Bhopal": [77.4126, 23.2599],
  "Indore": [75.8577, 22.7196], "Khajuraho": [79.9199, 24.8318], "Ujjain": [75.7849, 23.1765],
  "Gwalior": [78.1828, 26.2183], "Chennai": [80.2707, 13.0827], "Kochi": [76.2673, 9.9312],
  "Munnar": [77.0595, 10.0889], "Mysore": [76.6394, 12.2958], "Hampi": [76.46, 15.335],
  "Rameshwaram": [79.3129, 9.2876], "Bengaluru": [77.5946, 12.9716], "Hyderabad": [78.4867, 17.385],
  "Ooty": [76.6932, 11.4118], "Madurai": [78.1198, 9.9252], "Kanyakumari": [77.5385, 8.0883],
  "Port Blair": [92.7265, 11.6234], "Havelock": [92.9786, 11.9761], "Kavaratti": [72.6369, 10.5667],
  "Kolkata": [88.3639, 22.5726], "Puri": [85.8312, 19.8135], "Bodh Gaya": [84.9841, 24.6961],
  "Darjeeling": [88.2663, 27.041], "Konark": [86.0945, 19.8876], "Bhubaneswar": [85.8245, 20.2961],
  "Patna": [85.1376, 25.5941], "Guwahati": [91.7362, 26.1445], "Gangtok": [88.6138, 27.3314],
  "Dispur": [91.7898, 26.1433], "Tawang": [91.8594, 27.5851], "Shillong": [91.8933, 25.5788],
  "Kohima": [94.1086, 25.6701], "Agartala": [91.2868, 23.8315], "Imphal": [93.9368, 24.817],
  "Aizawl": [92.7176, 23.7271]
};

const UnifiedMapNode = ({ tourists, role, zone }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const markersRef = useRef([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Hardened MapLibre Initialization
    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [78.9629, 20.5937],
        zoom: 3,
        attributionControl: false
      });

      // Add navigation controls for easier tactical movement
      map.current.addControl(new maplibregl.NavigationControl({
        showCompass: false,
        visualizePitch: false
      }), 'top-right');

      map.current.on('style.load', () => {
        // Add Zonal Systematic Layer
        const zonesData = {
          type: 'FeatureCollection',
          features: Object.entries(REGION_BOUNDS).filter(([k]) => k !== 'India').map(([name, bounds]) => ({
            type: 'Feature',
            properties: { name },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [bounds[0][0], bounds[0][1]],
                [bounds[1][0], bounds[0][1]],
                [bounds[1][0], bounds[1][1]],
                [bounds[0][0], bounds[1][1]],
                [bounds[0][0], bounds[0][1]]
              ]]
            }
          }))
        };

        map.current.addSource('zones', { type: 'geojson', data: zonesData });
        
        map.current.addLayer({
          id: 'zones-fill',
          type: 'fill',
          source: 'zones',
          paint: {
            'fill-color': [
              'match', ['get', 'name'],
              'North', '#FF9933',
              'South', '#000080',
              'East', '#10B981',
              'West', '#F59E0B',
              'North-East', '#8B5CF6',
              '#ccc'
            ],
            'fill-opacity': 0.08
          }
        });

        // Resolve Projection Race Conditions
        setIsMapReady(true);
      });

      // Role-Based Locking with increased breathing room
      const targetZone = (role === 'Zone_Manager' || role === 'Regional_Admin') && zone ? zone : 'India';
      const bounds = REGION_BOUNDS[targetZone] || REGION_BOUNDS['India'];
      map.current.fitBounds(bounds, { 
        padding: 100,
        animate: true,
        duration: 2000
      });

    } catch (err) {
      console.error('MapLibre Optimization Failure:', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setIsMapReady(false);
      }
    };
  }, [role, zone]);

  // Synchronized Marker Ingestion
  useEffect(() => {
    if (!map.current || !isMapReady || !Array.isArray(tourists)) return;

    // Clear Tactical Buffer
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    tourists.forEach(t => {
      const coords = CITY_COORDINATES[t.city] || [78.9629, 20.5937];
      
      // Health Logic (Saffron/Ashoka/Emerald)
      let statusClass = 'marker-emerald';
      if (t.status === 'Flagged' || t.policeStatus === 'Flagged') statusClass = 'marker-saffron';
      if (t.sosActive || t.policeStatus === 'Security Risk') statusClass = 'marker-ashoka';

      // Create Tactical Pulse Element (Strict Sizing Fail-safe)
      const el = document.createElement('div');
      el.className = `maplibre-marker-pulse ${statusClass} ${t.is_VIP ? 'vip-pulse' : ''}`;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map.current);

      el.addEventListener('mouseenter', () => setSelectedNode(t));
      el.addEventListener('mouseleave', () => setSelectedNode(null));

      markersRef.current.push(marker);
    });
  }, [tourists, isMapReady]);

  return (
    <div className="relative w-full h-[550px] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl animate-in fade-in duration-700">
      <div ref={mapContainer} className="w-full h-full absolute inset-0 z-0" />
      
      {/* Tactical HUD Overlay (Pointer Isolation) */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl max-w-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ashoka rounded-xl flex items-center justify-center text-white shadow-lg"><Activity className="w-5 h-5 shadow-inner" /></div>
            <div>
              <h3 className="text-[10px] font-black text-ashoka uppercase tracking-widest leading-none">Command Map</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {isMapReady ? `Sector: ${zone || 'India'}` : 'Syncing Engine...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Situational Awareness popover */}
      {selectedNode && (
        <div className="absolute bottom-6 left-6 z-20 w-80 bg-white/98 backdrop-blur-2xl border border-ashoka/10 rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300 pointer-events-none border-l-4 border-l-ashoka">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${selectedNode.is_VIP ? 'bg-saffron shadow-saffron/20' : 'bg-ashoka shadow-ashoka/20'}`}>
                {selectedNode.is_VIP ? <ShieldAlert className="w-7 h-7" /> : <User className="w-7 h-7" />}
              </div>
              <div>
                <h4 className="text-sm font-black text-ashoka uppercase tracking-tight leading-tight">{selectedNode.name}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Zone: {selectedNode.zone}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${selectedNode.sosActive ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
              {selectedNode.sosActive ? 'SOS ACTIVE' : 'SECURE'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID Trace</p>
             <p className="text-[10px] font-black text-ashoka uppercase truncate">{(selectedNode.aadhaar || selectedNode.aadhaarNumber) ? `AHD: ${selectedNode.aadhaar || selectedNode.aadhaarNumber}` : `PAS: ${selectedNode.passport || selectedNode.passportNumber || 'N/A'}`}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Location</p>
              <p className="text-[10px] font-black text-ashoka uppercase">{selectedNode.city || selectedNode.zone || 'Unknown'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend Overlay */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
         {['Stable', 'Anomaly', 'Critical'].map((label, idx) => (
           <div key={label} className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-lg flex items-center gap-3">
             <div className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-saffron' : 'bg-ashoka'} animate-pulse shadow-sm`}></div>
             <span className="text-[9px] font-black text-ashoka uppercase tracking-widest">{label}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

export default UnifiedMapNode;
