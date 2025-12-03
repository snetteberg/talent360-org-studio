import { Undo2, Redo2, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScenarioSelector } from './ScenarioSelector';
import { Scenario } from '@/types/org-builder';
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
}: WorkspaceToolbarProps) {
  return (
    <div className="bg-card border-b border-border px-4 py-2.5 flex items-center gap-3">
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
  );
}
