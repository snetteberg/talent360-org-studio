import { Users, Layers, AlertTriangle } from 'lucide-react';
import { OrgHealth } from '@/types/org-builder';

interface FloatingHealthPillProps {
  health: OrgHealth;
  onClick: () => void;
}

export function FloatingHealthPill({ health, onClick }: FloatingHealthPillProps) {
  const hasFlags = health.flags.length > 0;

  return (
    <button
      onClick={onClick}
      className="fixed top-[72px] right-4 z-20 flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-lg"
    >
      <span className="text-xs font-semibold tracking-wide">Org Health Alerts</span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">{health.headcount}</span>
        </div>
        <div className="w-px h-4 bg-white/30" />
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4" />
          <span className="text-sm font-medium">{health.layers}</span>
        </div>
        {hasFlags && (
          <>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{health.flags.length}</span>
            </div>
          </>
        )}
      </div>
    </button>
  );
}
