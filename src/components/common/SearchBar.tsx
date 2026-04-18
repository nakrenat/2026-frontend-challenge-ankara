import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search suspects...',
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pl-8 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-red-500 focus:outline-none"
      />
    </div>
  );
}
