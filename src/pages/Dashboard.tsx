import { useEffect, useState } from 'react';
import { Map, List } from 'lucide-react';
import { useInvestigation } from '../hooks/useInvestigation';
import { Sidebar } from '../components/layout/Sidebar';
import { MainPanel } from '../components/layout/MainPanel';
import { StatsBar } from '../components/layout/StatsBar';
import { MapView } from '../components/map/MapView';

type ViewMode = 'timeline' | 'map' | 'split';

export function Dashboard() {
  const {
    filteredPeople,
    people,
    isLoading,
    error,
    selectedPersonId,
    selectedPerson,
    searchQuery,
    selectPerson,
    setSearch,
  } = useInvestigation();
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  useEffect(() => {
    setHoveredEventId(null);
  }, [selectedPersonId]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-100">Missing Podo</span>
            <span className="rounded bg-red-900/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-red-300">
              Active Case
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Ankara Field Investigation Dashboard</p>
        </div>

        <div className="hidden items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 p-1 lg:flex">
          {([
            { id: 'timeline', icon: <List size={13} />, label: 'Timeline' },
            { id: 'split', icon: <span className="text-[10px] font-bold">⊞</span>, label: 'Split' },
            { id: 'map', icon: <Map size={13} />, label: 'Map' },
          ] as { id: ViewMode; icon: React.ReactNode; label: string }[]).map(
            ({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors ${
                  viewMode === id
                    ? 'bg-slate-600 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ),
          )}
        </div>
      </header>

      {!isLoading && !error && people.length > 0 && <StatsBar people={people} />}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="h-full min-h-0 w-72 shrink-0 border-r border-slate-700">
          <Sidebar
            people={filteredPeople}
            allPeople={people}
            isLoading={isLoading}
            selectedId={selectedPersonId}
            searchQuery={searchQuery}
            onSelect={selectPerson}
            onSearch={setSearch}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {viewMode !== 'map' && (
            <div
              className={`min-h-0 overflow-hidden ${
                viewMode === 'split' ? 'w-full lg:w-1/2 lg:border-r lg:border-slate-700' : 'flex-1'
              }`}
            >
              <MainPanel
                selectedPerson={selectedPerson}
                isLoading={isLoading}
                error={error}
                hoveredEventId={hoveredEventId}
                onHoverEvent={setHoveredEventId}
              />
            </div>
          )}

          {viewMode !== 'timeline' && (
            <div
              className={`min-h-0 overflow-hidden p-3 ${
                viewMode === 'split' ? 'h-[45vh] w-full lg:h-auto lg:w-1/2' : 'flex-1'
              }`}
            >
              {isLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Loading map…
                </div>
              ) : (
                <MapView
                  selectedPerson={selectedPerson}
                  allPeople={people}
                  onSelectPerson={selectPerson}
                  hoveredEventId={hoveredEventId}
                  onHoverEvent={setHoveredEventId}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
