import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Person } from '../../types/domain';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeIcon(color: string, size = 12) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid rgba(255,255,255,0.6);
      border-radius:50%;
      box-shadow:0 0 6px ${color};
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const ICON_CHECKIN = makeIcon('#60a5fa');
const ICON_SIGHTING = makeIcon('#facc15');
const ICON_SUSPECT = makeIcon('#f87171', 14);
const ICON_PODO = makeIcon('#818cf8', 16);

interface MapEvent {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: 'checkin' | 'sighting' | 'suspect' | 'podo';
  time: string;
}

function buildMapEvents(person: Person): MapEvent[] {
  const events: MapEvent[] = [];
  for (const e of person.timeline) {
    if (!e.coordinates) continue;
    const { lat, lng } = e.coordinates;
    let type: MapEvent['type'] = 'checkin';
    if (e.type === 'sighting_of' || e.type === 'sighting_with') type = 'sighting';
    if (e.type === 'checkin') type = 'checkin';

    events.push({
      id: e.id,
      lat,
      lng,
      label: e.description.slice(0, 80),
      type,
      time: e.timestamp,
    });
  }
  return events;
}

function routeFromEvents(events: MapEvent[]): [number, number][] {
  const pts: [number, number][] = [];
  let last = '';
  for (const e of events) {
    const key = `${e.lat},${e.lng}`;
    if (key !== last) {
      pts.push([e.lat, e.lng]);
      last = key;
    }
  }
  return pts;
}

function BoundsFitter({ points }: { points: [number, number][] }) {
  const map = useMap();
  const prev = useRef('');

  useEffect(() => {
    if (points.length === 0) return;
    const key = points.map((p) => p.join(',')).join('|');
    if (key === prev.current) return;
    prev.current = key;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [points, map]);

  return null;
}

interface MapViewProps {
  selectedPerson: Person | null;
  allPeople: Person[];
  onSelectPerson?: (id: string) => void;
  hoveredEventId?: string | null;
  onHoverEvent?: (eventId: string | null) => void;
}

export function MapView({
  selectedPerson,
  allPeople,
  onSelectPerson,
  hoveredEventId,
  onHoverEvent,
}: MapViewProps) {
  const defaultCenter: [number, number] = [39.9208, 32.8541];
  const selectedEvents = selectedPerson ? buildMapEvents(selectedPerson) : [];
  const routePoints = routeFromEvents(selectedEvents);

  const suspectMarkers = allPeople
    .filter((p) => !p.isMainSubject && p.suspicionLevel !== 'none' && p.lastSeenLocation)
    .flatMap((p) => {
      const last = [...p.timeline].reverse().find((e) => e.coordinates);
      if (!last?.coordinates) return [];
      return [{ lat: last.coordinates.lat, lng: last.coordinates.lng, name: p.name, id: p.id }];
    });

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-slate-700">
      <MapContainer center={defaultCenter} zoom={13} className="h-full w-full" zoomControl={true}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {routePoints.length > 0 && <BoundsFitter points={routePoints} />}

        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: '#818cf8', weight: 2, opacity: 0.7, dashArray: '5, 5' }}
          />
        )}

        {selectedEvents.map((e, i) => {
          const isHovered = hoveredEventId === e.id;
          const icon = isHovered
            ? makeIcon('#22d3ee', 18)
            : e.type === 'sighting'
            ? ICON_SIGHTING
            : selectedPerson?.isMainSubject
            ? ICON_PODO
            : ICON_CHECKIN;

          return (
            <Marker
              key={i}
              position={[e.lat, e.lng]}
              icon={icon}
              eventHandlers={{
                mouseover: () => onHoverEvent?.(e.id),
                mouseout: () => onHoverEvent?.(null),
              }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold">{e.time}</div>
                  <div className="mt-1">{e.label}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {suspectMarkers.map((s, i) => (
          <Marker
            key={`suspect-${i}`}
            position={[s.lat, s.lng]}
            icon={ICON_SUSPECT}
            eventHandlers={{ click: () => onSelectPerson?.(s.id) }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-semibold">{s.name} — last seen here</div>
                <div className="mt-1 text-[10px] text-slate-500">
                  Click marker to focus this suspect
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
