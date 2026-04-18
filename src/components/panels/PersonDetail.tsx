import { useState } from 'react';
import {
  MessageSquare,
  Eye,
  FileText,
  Megaphone,
  LogIn,
  MapPin,
  Clock,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import type { EventType, Person } from '../../types/domain';
import { SuspicionBadge, UrgencyBadge } from '../common/Badge';
import { Timeline } from '../timeline/Timeline';

type FilterKey = 'all' | 'messages' | 'sightings' | 'checkins' | 'tips' | 'notes';

const FILTER_TYPES: Record<FilterKey, EventType[]> = {
  all: [],
  messages: ['message_sent', 'message_received'],
  sightings: ['sighting_of', 'sighting_with'],
  checkins: ['checkin'],
  tips: ['tip'],
  notes: ['note_authored', 'note_mentioned'],
};

const FILTER_LABELS: Record<FilterKey, { label: string; icon: React.ReactNode }> = {
  all: { label: 'All', icon: <Filter size={11} /> },
  messages: { label: 'Messages', icon: <MessageSquare size={11} /> },
  sightings: { label: 'Sightings', icon: <Eye size={11} /> },
  checkins: { label: 'Check-ins', icon: <LogIn size={11} /> },
  tips: { label: 'Tips', icon: <Megaphone size={11} /> },
  notes: { label: 'Notes', icon: <FileText size={11} /> },
};

function StatPill({ icon, count, label }: { icon: React.ReactNode; count: number; label: string }) {
  if (count === 0) return null;
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-slate-800 px-3 py-2 text-center">
      <div className="text-slate-400">{icon}</div>
      <span className="text-lg font-bold text-slate-100">{count}</span>
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}

interface Props {
  person: Person;
  hoveredEventId?: string | null;
  onHoverEvent?: (eventId: string | null) => void;
}

export function PersonDetail({ person, hoveredEventId, onHoverEvent }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const suspiciousEvents = person.timeline.filter(
    (e) => e.suspicionLevel === 'high' || e.suspicionLevel === 'medium',
  );

  const filteredEvents =
    activeFilter === 'all'
      ? person.timeline
      : person.timeline.filter((e) => FILTER_TYPES[activeFilter].includes(e.type));

  const counts: Record<FilterKey, number> = {
    all: person.timeline.length,
    messages: person.messagesSent.length + person.messagesReceived.length,
    sightings: person.sightingsOf.length + person.sightingsWith.length,
    checkins: person.checkins.length,
    tips: person.tips.length,
    notes: person.notesAuthored.length + person.notesMentioned.length,
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className={`shrink-0 border-b p-5 ${
          person.suspicionLevel === 'high'
            ? 'border-red-700 bg-red-950/30'
            : 'border-slate-700 bg-slate-800/40'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{person.name}</h2>
            {person.isMainSubject && (
              <p className="text-xs text-blue-400">★ Main Subject — Missing Person</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <SuspicionBadge level={person.suspicionLevel} />
            {person.suspicionScore > 0 && (
              <span className="text-xs text-slate-500">
                Score: <span className="font-bold text-slate-300">{person.suspicionScore}</span>
                /100
              </span>
            )}
          </div>
        </div>

        {(person.lastSeenLocation || person.lastSeenTime) && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
            {person.lastSeenLocation && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {person.lastSeenLocation}
              </span>
            )}
            {person.lastSeenTime && (
              <span className="flex items-center gap-1">
                <Clock size={11} /> {person.lastSeenTime}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <StatPill icon={<LogIn size={14} />} count={person.checkins.length} label="Check-ins" />
          <StatPill
            icon={<MessageSquare size={14} />}
            count={person.messagesSent.length}
            label="Sent"
          />
          <StatPill
            icon={<MessageSquare size={14} />}
            count={person.messagesReceived.length}
            label="Received"
          />
          <StatPill icon={<Eye size={14} />} count={person.sightingsOf.length} label="Sightings" />
          <StatPill
            icon={<FileText size={14} />}
            count={person.notesAuthored.length}
            label="Notes"
          />
          <StatPill icon={<Megaphone size={14} />} count={person.tips.length} label="Tips" />
        </div>
      </div>

      {suspiciousEvents.length > 0 && (
        <div className="shrink-0 border-b border-red-900/50 bg-red-950/20 px-5 py-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={14} />
            <span className="text-xs font-semibold">
              {suspiciousEvents.length} suspicious clue
              {suspiciousEvents.length > 1 ? 's' : ''} detected
            </span>
          </div>
          <ul className="mt-2 space-y-1">
            {suspiciousEvents.map((e) => (
              <li key={e.id} className="flex items-start gap-2 text-xs text-slate-300">
                <UrgencyBadge urgency={e.suspicionLevel as 'low' | 'medium' | 'high'} />
                <span className="leading-tight">{e.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="shrink-0 border-b border-slate-700 bg-slate-900/60 px-4 py-2">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => {
            const { label, icon } = FILTER_LABELS[key];
            const count = counts[key];
            if (key !== 'all' && count === 0) return null;
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-600 text-slate-100'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {icon}
                {label}
                <span
                  className={`rounded px-1 text-[10px] ${
                    isActive ? 'bg-slate-500' : 'bg-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
          Chain of Events
        </h3>
        <Timeline
          events={filteredEvents}
          hoveredEventId={hoveredEventId}
          onHoverEvent={onHoverEvent}
        />
      </div>
    </div>
  );
}
