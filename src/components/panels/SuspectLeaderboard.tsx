import { Trophy, AlertTriangle } from 'lucide-react';
import type { Person } from '../../types/domain';
import { SuspicionBadge } from '../common/Badge';

interface Props {
  people: Person[];
  onSelect: (id: string) => void;
}

export function SuspectLeaderboard({ people, onSelect }: Props) {
  const suspects = people
    .filter((p) => !p.isMainSubject && p.suspicionScore > 0)
    .slice(0, 5);

  if (suspects.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
      <div className="mb-3 flex items-center gap-2 text-red-400">
        <Trophy size={14} />
        <span className="text-xs font-bold uppercase tracking-widest">Most Suspicious</span>
      </div>
      <ol className="space-y-2">
        {suspects.map((p, i) => (
          <li key={p.id}>
            <button
              onClick={() => onSelect(p.id)}
              className="flex w-full items-center gap-2 rounded p-1.5 text-left transition-colors hover:bg-red-900/20"
            >
              <span className="w-4 shrink-0 text-center text-xs text-slate-500">{i + 1}.</span>
              <span className="flex-1 truncate text-sm text-slate-200">{p.name}</span>
              <SuspicionBadge level={p.suspicionLevel} size="sm" />
              {p.suspicionLevel === 'high' && (
                <AlertTriangle size={12} className="shrink-0 text-red-400" />
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
