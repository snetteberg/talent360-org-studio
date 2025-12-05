import { Plus, Scissors, Eye, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NodePopoverProps {
  onAddSubPosition: () => void;
  onCut: () => void;
  onViewDetails: () => void;
  onModifyNewScenario?: () => void;
  isBaseline: boolean;
}

export function NodePopover({
  onAddSubPosition,
  onCut,
  onViewDetails,
  onModifyNewScenario,
  isBaseline,
}: NodePopoverProps) {
  return (
    <div className="bg-popover border border-border rounded-lg shadow-medium p-1.5 animate-scale-in">
      <div className="flex flex-col gap-0.5 min-w-[160px]">
        {!isBaseline && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-8 text-sm font-normal"
              onClick={onAddSubPosition}
            >
              <Plus className="w-4 h-4" />
              Add Sub-Position
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-8 text-sm font-normal text-destructive hover:text-destructive"
              onClick={onCut}
            >
              <Scissors className="w-4 h-4" />
              Cut Position
            </Button>
            <div className="h-px bg-border my-1" />
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2 h-8 text-sm font-normal"
          onClick={onViewDetails}
        >
          <Eye className="w-4 h-4" />
          View Details
        </Button>
        {isBaseline && onModifyNewScenario && (
          <>
            <div className="h-px bg-border my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-8 text-sm font-normal text-muted-foreground hover:text-foreground"
              onClick={onModifyNewScenario}
            >
              <GitBranch className="w-4 h-4" />
              Modify (New Scenario)
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
