import { Undo2, Redo2, Save, Users, Layers, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScenarioSelector } from './ScenarioSelector';
import { Scenario, OrgHealth } from '@/types/org-builder';
import { Separator } from '@/components/ui/separator';

interface WorkspaceToolbarProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  onCreateScenario: () => void;
  freeAgentCount: number;
  onFreeAgentsClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isBaseline: boolean;
  health: OrgHealth;
  onHealthClick: () => void;
}

export function WorkspaceToolbar({
  scenarios,
  activeScenarioId,
  onScenarioChange,
  onCreateScenario,
  freeAgentCount,
  onFreeAgentsClick,
  onUndo,
  onRedo,
  onSave,
  canUndo,
  canRedo,
  isBaseline,
  health,
  onHealthClick,
}: WorkspaceToolbarProps) {
  const hasFlags = health.flags.length > 0;

  return (
    <div className="bg-card border-b border-border px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ScenarioSelector
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onScenarioChange={onScenarioChange}
          onCreateScenario={onCreateScenario}
        />

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo || isBaseline}
            className="w-8 h-8"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo || isBaseline}
            className="w-8 h-8"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            disabled={isBaseline}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </Button>
        </div>

        {freeAgentCount > 0 && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onFreeAgentsClick}
            >
              <Users className="w-4 h-4" />
              <span className="text-xs">Free Agents ({freeAgentCount})</span>
            </Button>
          </>
        )}
      </div>

      <button
        onClick={onHealthClick}
        className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all"
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
    </div>
  );
}
