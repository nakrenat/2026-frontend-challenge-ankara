import { AlertTriangle, Clock, MapPin, Users } from 'lucide-react';
import type { Person } from '../../types/domain';

interface MobileCaseStatsProps {
  people: Person[];
}

export function MobileCaseStats({ people }: MobileCaseStatsProps) {
  const podo = people.find((p) => p.isMainSubject);
  const highSuspects = people.filter((p) => p.suspicionLevel === 'high').length;

  return (
    <div className="grid shrink-0 grid-cols-2 gap-px border-b border-slate-700 bg-slate-700 lg:hidden">
      <Cell
        icon={<Clock size={12} className="text-blue-400" />}
        label="Last seen"
        value={podo?.lastSeenTime ?? '—'}
      />
      <Cell
        icon={<MapPin size={12} className="text-yellow-400" />}
        label="Location"
        value={podo?.lastSeenLocation ?? '—'}
      />
      <Cell
        icon={<Users size={12} className="text-slate-300" />}
        label="Tracked"
        value={String(people.length)}
      />
      <Cell
        icon={<AlertTriangle size={12} className="text-red-400" />}
        label="High suspects"
        value={String(highSuspects)}
        highlight={highSuspects > 0}
      />
    </div>
  );
}

function Cell({
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
    <div className="bg-slate-900 px-3 py-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      </div>
      <p className={`mt-1 truncate text-xs font-semibold ${highlight ? 'text-red-400' : 'text-slate-200'}`}>
        {value}
      </p>
    </div>
  );
}
