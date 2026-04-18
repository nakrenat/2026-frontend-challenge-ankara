import { User } from 'lucide-react';
import type { Person } from '../../types/domain';
import { PersonDetail } from '../panels/PersonDetail';
import { SkeletonCard } from '../common/SkeletonCard';

interface MainPanelProps {
  selectedPerson: Person | null;
  isLoading: boolean;
  error: string | null;
  hoveredEventId?: string | null;
  onHoverEvent?: (eventId: string | null) => void;
}

export function MainPanel({
  selectedPerson,
  isLoading,
  error,
  hoveredEventId,
  onHoverEvent,
}: MainPanelProps) {
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-full max-w-md rounded-lg border border-red-700 bg-red-950/30 p-6">
          <p className="text-sm font-semibold text-red-400">Failed to fetch case files</p>
          <p className="mt-2 rounded bg-slate-900 px-3 py-2 font-mono text-xs text-slate-300">
            {error}
          </p>
          <div className="mt-4 space-y-1 text-xs text-slate-500">
            <p>Checklist:</p>
            <p>
              1. <code className="text-slate-400">.env.local</code> file exists in the project
              root
            </p>
            <p>
              2. It contains{' '}
              <code className="text-slate-400">VITE_JOTFORM_API_KEY=your_key</code>
            </p>
            <p>
              3. Dev server was <strong className="text-slate-400">restarted</strong> after
              creating the file
            </p>
            <p>4. Check the browser console (F12) for network errors</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4 p-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!selectedPerson) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
        <User size={40} />
        <p className="text-sm">Select a person of interest from the sidebar.</p>
      </div>
    );
  }

  return (
    <PersonDetail
      person={selectedPerson}
      hoveredEventId={hoveredEventId}
      onHoverEvent={onHoverEvent}
    />
  );
}
