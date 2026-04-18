import { Users, UserCircle2, Map } from 'lucide-react';

export type MobileTabKey = 'people' | 'detail' | 'map';

interface MobileTabBarProps {
  activeTab: MobileTabKey;
  onChange: (tab: MobileTabKey) => void;
  hasSelectedPerson: boolean;
}

const TABS: { id: MobileTabKey; label: string; icon: React.ReactNode }[] = [
  { id: 'people', label: 'People', icon: <Users size={14} /> },
  { id: 'detail', label: 'Detail', icon: <UserCircle2 size={14} /> },
  { id: 'map', label: 'Map', icon: <Map size={14} /> },
];

export function MobileTabBar({ activeTab, onChange, hasSelectedPerson }: MobileTabBarProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-slate-700 bg-slate-900 p-2 lg:hidden">
      {TABS.map((tab) => {
        const isDisabled = tab.id === 'detail' && !hasSelectedPerson;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onChange(tab.id)}
            disabled={isDisabled}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-slate-600 text-slate-100'
                : isDisabled
                ? 'cursor-not-allowed bg-slate-800 text-slate-600'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
