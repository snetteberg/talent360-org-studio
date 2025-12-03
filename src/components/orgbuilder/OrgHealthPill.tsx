import { Users, Layers, AlertTriangle } from 'lucide-react';
import { OrgHealth } from '@/types/org-builder';
import { cn } from '@/lib/utils';

interface OrgHealthPillProps {
  health: OrgHealth;
  onClick: () => void;
}

export function OrgHealthPill({ health, onClick }: OrgHealthPillProps) {
  const hasFlags = health.flags.length > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'health-pill cursor-pointer hover:shadow-soft transition-all',
        hasFlags && 'health-pill-warning'
      )}
    >
      <div className="flex items-center gap-1">
        <Users className="w-3.5 h-3.5" />
        <span>{health.headcount}</span>
      </div>
      <div className="w-px h-3 bg-current opacity-20" />
      <div className="flex items-center gap-1">
        <Layers className="w-3.5 h-3.5" />
        <span>{health.layers}</span>
      </div>
      {hasFlags && (
        <>
          <div className="w-px h-3 bg-current opacity-20" />
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{health.flags.length}</span>
          </div>
        </>
      )}
    </button>
  );
}
