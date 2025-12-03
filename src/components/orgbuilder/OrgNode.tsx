import { User, Briefcase } from 'lucide-react';
import { OrgNode as OrgNodeType } from '@/types/org-builder';
import { cn } from '@/lib/utils';

interface OrgNodeProps {
  node: OrgNodeType;
  isSelected: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
}

export function OrgNode({ 
  node, 
  isSelected, 
  isDragging,
  isDropTarget,
  onClick, 
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onDragLeave,
}: OrgNodeProps) {
  const isFilled = !!node.employee;
  const initials = node.employee?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent canvas panning when clicking on a node
    e.stopPropagation();
    onDragStart(e);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDrop();
  };

  return (
    <div
      className={cn(
        'org-node w-[180px] p-3 select-none transition-all',
        isFilled ? 'org-node-filled' : 'org-node-open',
        isSelected && 'ring-2 ring-primary shadow-medium',
        isDragging && 'opacity-50 scale-95 cursor-grabbing',
        isDropTarget && 'ring-2 ring-success bg-success/10 scale-105',
        !isDragging && 'cursor-grab'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={onDragOver}
      onMouseLeave={onDragLeave}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium',
            isFilled
              ? 'bg-primary/10 text-primary'
              : 'bg-warning/10 text-warning border-2 border-dashed border-warning/30'
          )}
        >
          {isFilled ? (
            initials
          ) : (
            <Briefcase className="w-4 h-4" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isFilled ? (
            <>
              <p className="text-sm font-medium text-foreground truncate">
                {node.employee!.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {node.position.title}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground truncate">
                {node.position.title}
              </p>
              <p className="text-xs text-warning">
                Open Position
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
