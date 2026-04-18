import { useInvestigation } from '../hooks/useInvestigation';
import { Sidebar } from '../components/layout/Sidebar';
import { MainPanel } from '../components/layout/MainPanel';
import { StatsBar } from '../components/layout/StatsBar';

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

        <div className="min-h-0 flex-1 overflow-hidden">
          <MainPanel selectedPerson={selectedPerson} isLoading={isLoading} error={error} />
        </div>
      </div>
    </div>
  );
}
