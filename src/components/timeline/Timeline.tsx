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
  { icon: React.ReactNode; label: string; color: string; chipClass: string }
> = {
  checkin: {
    icon: <LogIn size={12} />,
    label: 'Check-in',
    color: 'text-blue-300',
    chipClass: 'bg-blue-900/40 text-blue-300 border-blue-700/60',
  },
  message_sent: {
    icon: <MessageSquare size={12} />,
    label: 'Sent',
    color: 'text-green-300',
    chipClass: 'bg-green-900/40 text-green-300 border-green-700/60',
  },
  message_received: {
    icon: <MessageSquare size={12} />,
    label: 'Received',
    color: 'text-slate-300',
    chipClass: 'bg-slate-700/60 text-slate-300 border-slate-600/70',
  },
  sighting_of: {
    icon: <Eye size={12} />,
    label: 'Sighted',
    color: 'text-yellow-300',
    chipClass: 'bg-yellow-900/35 text-yellow-300 border-yellow-700/60',
  },
  sighting_with: {
    icon: <Eye size={12} />,
    label: 'Seen with',
    color: 'text-yellow-200',
    chipClass: 'bg-yellow-900/30 text-yellow-200 border-yellow-700/60',
  },
  note_authored: {
    icon: <FileText size={12} />,
    label: 'Note',
    color: 'text-purple-300',
    chipClass: 'bg-purple-900/35 text-purple-300 border-purple-700/60',
  },
  note_mentioned: {
    icon: <FileText size={12} />,
    label: 'Mentioned',
    color: 'text-purple-200',
    chipClass: 'bg-purple-900/30 text-purple-200 border-purple-700/60',
  },
  tip: {
    icon: <Megaphone size={12} />,
    label: 'Anonymous Tip',
    color: 'text-red-300',
    chipClass: 'bg-red-900/35 text-red-300 border-red-700/60',
  },
};

const BORDER_COLOR: Record<SuspicionLevel, string> = {
  none: 'border-slate-700',
  low: 'border-yellow-700',
  medium: 'border-orange-600',
  high: 'border-red-500',
};

interface TimelineItemProps {
  event: TimelineEvent;
  index: number;
  isLast: boolean;
  isHovered: boolean;
  onHoverEvent?: (eventId: string | null) => void;
  registerRef?: (eventId: string, el: HTMLDivElement | null) => void;
}

function TimelineItem({
  event,
  index,
  isLast,
  isHovered,
  onHoverEvent,
  registerRef,
}: TimelineItemProps) {
  const cfg = EVENT_CONFIG[event.type];
  return (
    <div
      className="timeline-item-enter flex gap-3"
      onMouseEnter={() => onHoverEvent?.(event.id)}
      onMouseLeave={() => onHoverEvent?.(null)}
      ref={(el) => registerRef?.(event.id, el)}
      style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
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
            : 'bg-slate-800/50 hover:bg-slate-800/70'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${cfg.chipClass}`}
          >
            {cfg.icon}
            {cfg.label}
          </span>
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
          index={i}
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
