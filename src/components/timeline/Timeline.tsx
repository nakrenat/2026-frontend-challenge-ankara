import { useEffect, useRef } from 'react';
import {
  LogIn,
  MessageSquare,
  Eye,
  FileText,
  Megaphone,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import type { EventType, SuspicionLevel, TimelineEvent } from '../../types/domain';
import { SuspicionBadge } from '../common/Badge';

const EVENT_CONFIG: Record<
  EventType,
  { icon: React.ReactNode; label: string; color: string }
> = {
  checkin: { icon: <LogIn size={13} />, label: 'Check-in', color: 'text-blue-400' },
  message_sent: {
    icon: <MessageSquare size={13} />,
    label: 'Sent',
    color: 'text-green-400',
  },
  message_received: {
    icon: <MessageSquare size={13} />,
    label: 'Received',
    color: 'text-slate-400',
  },
  sighting_of: { icon: <Eye size={13} />, label: 'Sighted', color: 'text-yellow-400' },
  sighting_with: {
    icon: <Eye size={13} />,
    label: 'Seen with',
    color: 'text-yellow-300',
  },
  note_authored: { icon: <FileText size={13} />, label: 'Note', color: 'text-purple-400' },
  note_mentioned: {
    icon: <FileText size={13} />,
    label: 'Mentioned',
    color: 'text-purple-300',
  },
  tip: { icon: <Megaphone size={13} />, label: 'Anonymous Tip', color: 'text-red-400' },
};

const BORDER_COLOR: Record<SuspicionLevel, string> = {
  none: 'border-slate-700',
  low: 'border-yellow-700',
  medium: 'border-orange-600',
  high: 'border-red-500',
};

interface TimelineItemProps {
  event: TimelineEvent;
  isLast: boolean;
  isHovered: boolean;
  onHoverEvent?: (eventId: string | null) => void;
  registerRef?: (eventId: string, el: HTMLDivElement | null) => void;
}

function TimelineItem({
  event,
  isLast,
  isHovered,
  onHoverEvent,
  registerRef,
}: TimelineItemProps) {
  const cfg = EVENT_CONFIG[event.type];
  return (
    <div
      className="flex gap-3"
      onMouseEnter={() => onHoverEvent?.(event.id)}
      onMouseLeave={() => onHoverEvent?.(null)}
      ref={(el) => registerRef?.(event.id, el)}
    >
      <div className="flex flex-col items-center">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-slate-900 ${BORDER_COLOR[event.suspicionLevel]} ${cfg.color} ${
            isHovered ? 'ring-2 ring-cyan-400/70 shadow-[0_0_12px_rgba(34,211,238,0.45)]' : ''
          }`}
        >
          {cfg.icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-700" />}
      </div>

      <div
        className={`mb-4 min-w-0 flex-1 rounded-lg border p-3 transition-all ${BORDER_COLOR[event.suspicionLevel]} ${
          isHovered
            ? 'bg-slate-700/80 ring-1 ring-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.20)]'
            : 'bg-slate-800/50'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
          {event.suspicionLevel !== 'none' && (
            <SuspicionBadge level={event.suspicionLevel} size="sm" />
          )}
          {event.suspicionLevel === 'high' && (
            <AlertTriangle size={12} className="text-red-400" />
          )}
          <span className="ml-auto text-[10px] text-slate-500">{event.timestamp}</span>
        </div>

        <p className="mt-1 text-sm leading-snug text-slate-300">{event.description}</p>

        {event.location && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
            <MapPin size={10} />
            {event.location}
          </div>
        )}
      </div>
    </div>
  );
}

interface TimelineProps {
  events: TimelineEvent[];
  hoveredEventId?: string | null;
  onHoverEvent?: (eventId: string | null) => void;
}

export function Timeline({ events, hoveredEventId, onHoverEvent }: TimelineProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!hoveredEventId) return;
    const target = itemRefs.current[hoveredEventId];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [hoveredEventId]);

  if (events.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No timeline events recorded.</p>;
  }

  return (
    <div className="pt-2">
      {events.map((event, i) => (
        <TimelineItem
          key={event.id}
          event={event}
          isLast={i === events.length - 1}
          isHovered={hoveredEventId === event.id}
          onHoverEvent={onHoverEvent}
          registerRef={(eventId, el) => {
            itemRefs.current[eventId] = el;
          }}
        />
      ))}
    </div>
  );
}
