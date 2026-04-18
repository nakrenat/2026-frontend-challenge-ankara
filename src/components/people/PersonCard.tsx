import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { SuspicionBadge } from '../common/Badge';
import type { Person } from '../../types/domain';

interface PersonCardProps {
  person: Person;
  isSelected: boolean;
  onClick: () => void;
}

export function PersonCard({ person, isSelected, onClick }: PersonCardProps) {
  const initials = person.name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);

  const borderColor =
    person.suspicionLevel === 'high'
      ? 'border-red-600'
      : person.suspicionLevel === 'medium'
      ? 'border-orange-600'
      : isSelected
      ? 'border-slate-500'
      : 'border-slate-700';

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-slate-700/60 ${borderColor} ${
        isSelected ? 'bg-slate-700/60' : 'bg-slate-800/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            person.isMainSubject
              ? 'bg-blue-600 text-white'
              : person.suspicionLevel === 'high'
              ? 'bg-red-700 text-white'
              : 'bg-slate-600 text-slate-200'
          }`}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-100">{person.name}</span>
            {person.suspicionLevel !== 'none' && (
              <SuspicionBadge level={person.suspicionLevel} size="sm" />
            )}
          </div>

          {person.lastSeenLocation && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin size={10} />
              <span className="truncate">{person.lastSeenLocation}</span>
            </div>
          )}
          {person.lastSeenTime && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Clock size={10} />
              <span>{person.lastSeenTime}</span>
            </div>
          )}

          <div className="mt-1.5 flex gap-2 text-[10px] text-slate-500">
            {person.tips.length > 0 && (
              <span className="flex items-center gap-0.5 text-red-400">
                <AlertTriangle size={9} />
                {person.tips.length} tip{person.tips.length > 1 ? 's' : ''}
              </span>
            )}
            <span>{person.timeline.length} events</span>
          </div>
        </div>

        {person.suspicionScore > 0 && (
          <div
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              person.suspicionScore >= 50
                ? 'bg-red-900 text-red-300'
                : person.suspicionScore >= 25
                ? 'bg-orange-900 text-orange-300'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {person.suspicionScore}
          </div>
        )}
      </div>
    </button>
  );
}
