import { Users, AlertTriangle, MapPin, Clock } from 'lucide-react';
import type { Person } from '../../types/domain';

interface StatsBarProps {
  people: Person[];
}

export function StatsBar({ people }: StatsBarProps) {
  const podo = people.find((p) => p.isMainSubject);
  const highSuspects = people.filter((p) => p.suspicionLevel === 'high').length;
  const totalEvents = people.reduce((s, p) => s + p.timeline.length, 0);

  return (
    <div className="flex shrink-0 items-center gap-px border-b border-slate-700 bg-slate-900">
      <Stat
        icon={<Clock size={13} className="text-blue-400" />}
        label="Last seen"
        value={podo?.lastSeenTime ?? '—'}
      />
      <Stat
        icon={<MapPin size={13} className="text-yellow-400" />}
        label="Location"
        value={podo?.lastSeenLocation ?? '—'}
      />
      <Stat
        icon={<Users size={13} className="text-slate-400" />}
        label="Persons tracked"
        value={String(people.length)}
      />
      <Stat
        icon={<AlertTriangle size={13} className="text-red-400" />}
        label="High suspects"
        value={String(highSuspects)}
        highlight={highSuspects > 0}
      />
      <Stat
        icon={<Clock size={13} className="text-slate-400" />}
        label="Total events"
        value={String(totalEvents)}
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
      {icon}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
        <p className={`text-xs font-semibold ${highlight ? 'text-red-400' : 'text-slate-200'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
