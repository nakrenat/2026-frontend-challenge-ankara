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
}

function TimelineItem({ event, isLast }: TimelineItemProps) {
  const cfg = EVENT_CONFIG[event.type];
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-slate-900 ${BORDER_COLOR[event.suspicionLevel]} ${cfg.color}`}
        >
          {cfg.icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-700" />}
      </div>

      <div
        className={`mb-4 min-w-0 flex-1 rounded-lg border bg-slate-800/50 p-3 ${BORDER_COLOR[event.suspicionLevel]}`}
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
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No timeline events recorded.</p>;
  }

  return (
    <div className="pt-2">
      {events.map((event, i) => (
        <TimelineItem key={event.id} event={event} isLast={i === events.length - 1} />
      ))}
    </div>
  );
}
