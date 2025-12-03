import { Undo2, Redo2, Save, UserPlus, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScenarioSelector } from './ScenarioSelector';
import { OrgHealthPill } from './OrgHealthPill';
import { Scenario, OrgHealth } from '@/types/org-builder';
import { Separator } from '@/components/ui/separator';

interface WorkspaceToolbarProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  onCreateScenario: () => void;
  health: OrgHealth;
  onHealthClick: () => void;
  freeAgentCount: number;
  onFreeAgentsClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onAddPosition: () => void;
  onAddPerson: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isBaseline: boolean;
}

export function WorkspaceToolbar({
  scenarios,
  activeScenarioId,
  onScenarioChange,
  onCreateScenario,
  health,
  onHealthClick,
  freeAgentCount,
  onFreeAgentsClick,
  onUndo,
  onRedo,
  onSave,
  onAddPosition,
  onAddPerson,
  canUndo,
  canRedo,
  isBaseline,
}: WorkspaceToolbarProps) {
  return (
    <div className="bg-card border-b border-border px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <ScenarioSelector
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onScenarioChange={onScenarioChange}
          onCreateScenario={onCreateScenario}
        />
      </div>

      {/* Center Section */}
      <div className="text-center flex-1">
        <h2 className="text-sm font-semibold text-foreground">OrgBuilder</h2>
        <p className="text-xs text-muted-foreground">
          Create and evaluate org scenarios with instant insights
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {!isBaseline && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onAddPosition}
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs">Position</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onAddPerson}
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-xs">Person</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {freeAgentCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onFreeAgentsClick}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs">Free Agents ({freeAgentCount})</span>
          </Button>
        )}

        <OrgHealthPill health={health} onClick={onHealthClick} />

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
      </div>
    </div>
  );
}
