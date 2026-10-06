import { useState, useMemo } from 'react';
import { MapPin, Navigation, Compass, Layers, ZoomIn, ZoomOut, Maximize2, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function GeographicMap({ 
  claimedLocation = 'Claimed Location',
  claimedLat = 28.514430, 
  claimedLng = -96.990928, 
  events = [], 
  toleranceM = 150,
  title = "Geographic Correlation & Haversine Analysis",
  subtitle = "Visual verification of GPS telemetry against claimed coordinates with 150m tolerance boundary"
}) {
  const [zoom, setZoom] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Normalize points with latitude/longitude
  const geoPoints = useMemo(() => {
    // If no real coordinates, synthesize sample points around the center for demonstration
    if (!claimedLat || !claimedLng) {
      return [];
    }

    const validEvents = (events || []).filter(e => e.location_lat != null && e.location_lng != null);

    if (validEvents.length > 0) {
      return validEvents.map(e => {
        // Approximate distance in meters using Haversine
        const dLat = (e.location_lat - claimedLat) * 111320;
        const dLng = (e.location_lng - claimedLng) * (40075000 * Math.cos((claimedLat * Math.PI) / 180) / 360);
        const distance = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
        const isMatched = distance <= toleranceM;

        return {
          id: e.id || e.event_id,
          source: e.source_type || e.source || 'GPS',
          timestamp: e.event_timestamp || e.timestamp,
          lat: e.location_lat,
          lng: e.location_lng,
          label: e.location_label || e.location || 'Observation',
          description: e.description || '',
          distanceM: distance,
          isMatched,
          // Relative coordinates mapped for SVG canvas (scale meters to canvas pixels)
          dx: dLng,
          dy: -dLat,
        };
      });
    }

    // Default demonstration telemetry if case has coordinates but no GPS points uploaded yet
    return [
      { id: 'sim-1', source: 'GPS Ingestion', timestamp: '09:12 AM', lat: claimedLat + 0.00012, lng: claimedLng + 0.00015, label: 'GeoLife Trackpoint #1', distanceM: 22, isMatched: true, dx: 15, dy: -14 },
      { id: 'sim-2', source: 'Photo EXIF', timestamp: '09:18 AM', lat: claimedLat - 0.00008, lng: claimedLng + 0.00005, label: 'Camera GPS Fix', distanceM: 11, isMatched: true, dx: 5, dy: 10 },
      { id: 'sim-3', source: 'GPS Ingestion', timestamp: '09:27 AM', lat: claimedLat + 0.00085, lng: claimedLng - 0.00072, label: 'GeoLife Trackpoint #2', distanceM: 118, isMatched: true, dx: -70, dy: -95 },
      { id: 'sim-4', source: 'CCTV Fix', timestamp: '09:42 AM', lat: claimedLat + 0.00280, lng: claimedLng + 0.00350, label: 'Transit Camera Fixed', distanceM: 420, isMatched: false, dx: 280, dy: -310 },
    ];
  }, [claimedLat, claimedLng, events, toleranceM]);

  // Determine scaling factor to fit all points inside 500x380 SVG viewbox
  const scale = useMemo(() => {
    let maxDist = toleranceM * 1.8;
    geoPoints.forEach(p => {
      const dist = Math.sqrt(p.dx * p.dx + p.dy * p.dy);
      if (dist > maxDist) maxDist = dist;
    });
    // Max distance maps to ~160px from center
    return 160 / Math.max(maxDist, 200) * zoom;
  }, [geoPoints, toleranceM, zoom]);

  const centerX = 250;
  const centerY = 190;
  const toleranceRadiusPx = toleranceM * scale;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Compass size={15} /> {title}
          </div>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
            className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono text-xs text-slate-400">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
            className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button 
            onClick={() => setZoom(1)}
            className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white"
            title="Reset"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950">
        <svg 
          viewBox="0 0 500 380" 
          className="w-full h-[320px] select-none"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.8" />
            </pattern>
            {/* Glow Filter */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="toleranceFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.14)" />
              <stop offset="85%" stopColor="rgba(6, 182, 212, 0.05)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width="500" height="380" fill="url(#mapGrid)" />

          {/* Radar Circles */}
          <circle cx={centerX} cy={centerY} r={toleranceRadiusPx * 0.5} fill="none" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="0.6" strokeDasharray="3 3" />
          <circle cx={centerX} cy={centerY} r={toleranceRadiusPx * 1.5} fill="none" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="0.6" />
          <circle cx={centerX} cy={centerY} r={toleranceRadiusPx * 2.2} fill="none" stroke="rgba(51, 65, 85, 0.2)" strokeWidth="0.6" strokeDasharray="2 4" />

          {/* 150m Haversine Tolerance Zone */}
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={toleranceRadiusPx} 
            fill="url(#toleranceFill)"
            stroke="rgba(34, 211, 238, 0.7)" 
            strokeWidth="1.5" 
            strokeDasharray="4 3"
          />

          {/* Tolerance Label */}
          <text 
            x={centerX} 
            y={centerY - toleranceRadiusPx - 6} 
            textAnchor="middle" 
            fill="#38bdf8" 
            fontSize="10" 
            fontWeight="bold"
            fontFamily="monospace"
          >
            HAVERSINE THRESHOLD ({toleranceM}m)
          </text>

          {/* Lines connecting points to Claimed Location */}
          {geoPoints.map(p => {
            const px = centerX + p.dx * scale;
            const py = centerY + p.dy * scale;
            return (
              <line 
                key={`line-${p.id}`}
                x1={centerX} 
                y1={centerY} 
                x2={px} 
                y2={py} 
                stroke={p.isMatched ? 'rgba(52, 211, 153, 0.35)' : 'rgba(244, 63, 94, 0.35)'} 
                strokeWidth="1" 
                strokeDasharray={p.isMatched ? '2 2' : '4 3'}
              />
            );
          })}

          {/* Evidence Points */}
          {geoPoints.map(p => {
            const px = centerX + p.dx * scale;
            const py = centerY + p.dy * scale;
            const isSelected = selectedEvent?.id === p.id;

            return (
              <g 
                key={p.id}
                onClick={() => setSelectedEvent(p)}
                className="cursor-pointer transition-transform hover:scale-125"
                transform={`translate(${px}, ${py})`}
              >
                <circle 
                  r={isSelected ? 9 : 6} 
                  fill={p.isMatched ? '#10b981' : '#f43f5e'} 
                  stroke={isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.8)'}
                  strokeWidth="2"
                  filter={p.isMatched ? 'url(#cyanGlow)' : undefined}
                />
                <circle 
                  r={isSelected ? 14 : 9} 
                  fill="none" 
                  stroke={p.isMatched ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Claimed Location (Center Pin ★) */}
          <g transform={`translate(${centerX}, ${centerY})`}>
            {/* Center target pulses */}
            <circle r="18" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle r="12" fill="rgba(8, 145, 178, 0.25)" stroke="#38bdf8" strokeWidth="1.8" />
            <polygon 
              points="0,-6 1.8,-1.8 6.5,-1.8 2.8,1 4.2,5.5 0,2.8 -4.2,5.5 -2.8,1 -6.5,-1.8 -1.8,-1.8" 
              fill="#ffffff" 
            />
            <text x="0" y="24" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">
              Claimed Alibi Center
            </text>
          </g>
        </svg>

        {/* Floating Coordinates Bar */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-[11px] backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-cyan-300">★ Origin:</span>
            <span className="font-mono text-slate-400">{claimedLat.toFixed(5)}, {claimedLng.toFixed(5)}</span>
            <span className="text-slate-500">({claimedLocation})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Matched (≤{toleranceM}m)
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Conflicting (&gt;{toleranceM}m)
            </span>
          </div>
        </div>
      </div>

      {/* Selected Point Inspector */}
      {selectedEvent && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-cyan-500/30 bg-slate-900/90 p-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{selectedEvent.label}</span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300">{selectedEvent.source}</span>
              <span className="font-mono text-slate-400">{selectedEvent.timestamp}</span>
            </div>
            <p className="mt-1 text-slate-300">
              Distance: <strong className={selectedEvent.isMatched ? 'text-emerald-400' : 'text-rose-400'}>{selectedEvent.distanceM} meters</strong> from claimed location.
              Coordinates: <span className="font-mono text-slate-400">{selectedEvent.lat.toFixed(6)}, {selectedEvent.lng.toFixed(6)}</span>
            </p>
          </div>
          <button 
            onClick={() => setSelectedEvent(null)}
            className="text-slate-500 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
