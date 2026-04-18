import { useEffect, useState } from 'react';
import { Map, List } from 'lucide-react';
import { useInvestigation } from '../hooks/useInvestigation';
import { Sidebar } from '../components/layout/Sidebar';
import { MainPanel } from '../components/layout/MainPanel';
import { StatsBar } from '../components/layout/StatsBar';
import { MapView } from '../components/map/MapView';
import { MobileCaseStats } from '../components/layout/MobileCaseStats';
import { MobileTabBar, type MobileTabKey } from '../components/layout/MobileTabBar';

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
  const [mobileTab, setMobileTab] = useState<MobileTabKey>('people');
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const highSuspects = people.filter((p) => p.suspicionLevel === 'high').length;
  const mediumSuspects = people.filter((p) => p.suspicionLevel === 'medium').length;
  const caseStatus =
    highSuspects >= 3
      ? { label: 'Critical', cls: 'bg-red-950/70 text-red-300 border border-red-700/70' }
      : highSuspects >= 1 || mediumSuspects >= 3
      ? { label: 'Escalating', cls: 'bg-orange-950/70 text-orange-300 border border-orange-700/70' }
      : { label: 'Stable', cls: 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/70' };

  useEffect(() => {
    setHoveredEventId(null);
  }, [selectedPersonId]);

  useEffect(() => {
    if (!isLoading && !error && people.length > 0) {
      setLastRefresh(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [isLoading, error, people.length]);

  const handleSelectPerson = (id: string) => {
    selectPerson(id);
    setMobileTab('detail');
  };

  const handleSelectFromMap = (id: string) => {
    selectPerson(id);
    setMobileTab('detail');
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-sm">
            🐾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">Missing Podo</span>
              <span className="rounded bg-red-900/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-red-300">
                Active Case
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${caseStatus.cls}`}
              >
                {caseStatus.label}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Ankara Field Investigation Dashboard</p>
            {lastRefresh && <p className="text-[10px] text-slate-600">Last refresh: {lastRefresh}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1 sm:flex">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: '#FF6100', boxShadow: '0 0 6px #FF6100' }}
            />
            <img
              src="https://www.jotform.com/uploads/static/images/jotform-logo-new.png"
              alt="Jotform"
              className="h-3.5 opacity-90"
            />
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
        </div>
      </header>

      {!isLoading && !error && people.length > 0 && (
        <div className="hidden lg:block">
          <StatsBar people={people} />
        </div>
      )}
      {!isLoading && !error && people.length > 0 && <MobileCaseStats people={people} />}
      <MobileTabBar
        activeTab={mobileTab}
        onChange={setMobileTab}
        hasSelectedPerson={Boolean(selectedPerson)}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden lg:hidden">
        {mobileTab === 'people' && (
          <Sidebar
            people={filteredPeople}
            allPeople={people}
            isLoading={isLoading}
            selectedId={selectedPersonId}
            searchQuery={searchQuery}
            onSelect={handleSelectPerson}
            onSearch={setSearch}
            showLeaderboard={false}
          />
        )}
        {mobileTab === 'detail' && (
          <MainPanel
            selectedPerson={selectedPerson}
            isLoading={isLoading}
            error={error}
            hoveredEventId={hoveredEventId}
            onHoverEvent={setHoveredEventId}
          />
        )}
        {mobileTab === 'map' && (
          <div className="min-h-0 w-full p-3">
            <MapView
              selectedPerson={selectedPerson}
              allPeople={people}
              onSelectPerson={handleSelectFromMap}
              hoveredEventId={hoveredEventId}
              onHoverEvent={setHoveredEventId}
            />
          </div>
        )}
      </div>

      <div className="hidden flex-1 overflow-hidden lg:flex">
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

      <footer className="flex shrink-0 items-center justify-center gap-3 border-t border-slate-800 bg-slate-900/60 py-1.5">
        <img
          src="https://cdn.jotfor.ms/assets/img/v4.0/static/jotform-logo.svg"
          alt="Jotform"
          className="h-3.5 opacity-60"
        />
        <span className="text-[10px] text-slate-500">
          Powered by <span style={{ color: '#FF6100' }} className="font-semibold">Jotform API</span> · 5 form sources · live data
        </span>
      </footer>
    </div>
  );
}
