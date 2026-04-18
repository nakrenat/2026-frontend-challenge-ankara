import { SearchBar } from '../common/SearchBar';
import { PersonCard } from '../people/PersonCard';
import { SkeletonList } from '../common/SkeletonCard';
import { EmptyState } from '../common/EmptyState';
import { SuspectLeaderboard } from '../panels/SuspectLeaderboard';
import type { Person } from '../../types/domain';

interface SidebarProps {
  people: Person[];
  allPeople: Person[];
  isLoading: boolean;
  selectedId: string | null;
  searchQuery: string;
  onSelect: (id: string) => void;
  onSearch: (q: string) => void;
}

export function Sidebar({
  people,
  allPeople,
  isLoading,
  selectedId,
  searchQuery,
  onSelect,
  onSearch,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-slate-700 bg-slate-900 lg:w-72">
      <div className="border-b border-slate-700 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          People of Interest
        </p>
      </div>

      <div className="border-b border-slate-700 px-3 py-3">
        <SearchBar value={searchQuery} onChange={onSearch} />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <SkeletonList count={6} />
        ) : people.length === 0 ? (
          <EmptyState message="No suspects match your search." />
        ) : (
          <div className="space-y-2">
            {people.map((p) => (
              <PersonCard
                key={p.id}
                person={p}
                isSelected={p.id === selectedId}
                onClick={() => onSelect(p.id)}
              />
            ))}
          </div>
        )}
      </div>

      {!isLoading && !searchQuery && (
        <div className="shrink-0 border-t border-slate-700 p-3">
          <SuspectLeaderboard people={allPeople} onSelect={onSelect} />
        </div>
      )}
    </aside>
  );
}
