import { ChevronDown, Plus, Lock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Scenario } from '@/types/org-builder';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  onCreateScenario: () => void;
}

export function ScenarioSelector({
  scenarios,
  activeScenarioId,
  onScenarioChange,
  onCreateScenario,
}: ScenarioSelectorProps) {
  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
          <span className="truncate">{activeScenario?.name || 'Select Scenario'}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px] bg-popover">
        {scenarios.map((scenario) => (
          <DropdownMenuItem
            key={scenario.id}
            onClick={() => onScenarioChange(scenario.id)}
            className="gap-2 cursor-pointer"
          >
            {scenario.isBaseline && (
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className={scenario.id === activeScenarioId ? 'font-medium' : ''}>
              {scenario.name}
            </span>
            {scenario.isBaseline && (
              <span className="ml-auto text-xs text-muted-foreground">Read-only</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateScenario} className="gap-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>New Scenario</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
