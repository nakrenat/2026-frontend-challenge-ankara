import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No clues found.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
      <SearchX size={36} />
      <p className="text-sm">{message}</p>
    </div>
  );
}
