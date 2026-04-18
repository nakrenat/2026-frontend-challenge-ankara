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

  const avatarLabel = person.isMainSubject ? '🐾' : initials;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700/60 hover:shadow-[0_10px_24px_rgba(2,6,23,0.45)] ${borderColor} ${
        isSelected ? 'bg-slate-700/60 shadow-[0_8px_20px_rgba(15,23,42,0.45)]' : 'bg-slate-800/60'
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
          {avatarLabel}
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

      {person.suspicionScore > 0 && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full rounded-full transition-all ${
              person.suspicionScore >= 50
                ? 'bg-red-500'
                : person.suspicionScore >= 25
                ? 'bg-orange-500'
                : 'bg-yellow-600'
            }`}
            style={{ width: `${person.suspicionScore}%` }}
          />
        </div>
      )}
    </button>
  );
}
