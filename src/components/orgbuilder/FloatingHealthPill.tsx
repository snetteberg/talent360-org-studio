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
      className="fixed top-32 right-4 z-20 flex items-center gap-3 px-4 py-2.5 rounded-full bg-warning/10 border border-warning/30 text-warning-foreground hover:bg-warning/20 transition-all shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-1.5">
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">{health.headcount}</span>
      </div>
      <div className="w-px h-4 bg-warning/30" />
      <div className="flex items-center gap-1.5">
        <Layers className="w-4 h-4" />
        <span className="text-sm font-medium">{health.layers}</span>
      </div>
      {hasFlags && (
        <>
          <div className="w-px h-4 bg-warning/30" />
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{health.flags.length}</span>
          </div>
        </>
      )}
    </button>
  );
}
