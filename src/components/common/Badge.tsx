import type { SuspicionLevel } from '../../types/domain';

interface BadgeProps {
  level: SuspicionLevel;
  size?: 'sm' | 'md';
}

const CONFIG: Record<SuspicionLevel, { label: string; className: string }> = {
  none: { label: 'Clear', className: 'bg-slate-700 text-slate-300' },
  low: { label: 'Low', className: 'bg-yellow-900 text-yellow-300' },
  medium: { label: 'Medium', className: 'bg-orange-900 text-orange-300' },
  high: { label: 'High', className: 'bg-red-900 text-red-300 animate-pulse' },
};

export function SuspicionBadge({ level, size = 'md' }: BadgeProps) {
  const { label, className } = CONFIG[level];
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded font-semibold uppercase tracking-wide ${padding} ${className}`}
    >
      {label}
    </span>
  );
}

interface UrgencyBadgeProps {
  urgency: 'low' | 'medium' | 'high';
}

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const map = {
    low: 'bg-slate-700 text-slate-300',
    medium: 'bg-yellow-900 text-yellow-300',
    high: 'bg-red-900 text-red-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[urgency]}`}
    >
      {urgency}
    </span>
  );
}
