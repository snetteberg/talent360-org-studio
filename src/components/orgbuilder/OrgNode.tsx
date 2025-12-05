import { Briefcase, Plus } from 'lucide-react';
import { OrgNode as OrgNodeType } from '@/types/org-builder';
import { cn } from '@/lib/utils';

interface OrgNodeProps {
  node: OrgNodeType;
  isSelected: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  isPreview?: boolean;
  isPendingRemoval?: boolean;
  isPendingMove?: boolean;
  isBaseline?: boolean;
  isDragActive?: boolean;
  isValidDropTarget?: boolean;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDropZoneEnter?: () => void;
  onDropZoneLeave?: () => void;
  onAddSubPosition?: () => void;
}

export function OrgNode({ 
  node, 
  isSelected, 
  isDragging,
  isDropTarget,
  isPreview,
  isPendingRemoval,
  isPendingMove,
  isBaseline,
  isDragActive,
  isValidDropTarget,
  onClick, 
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onDragLeave,
  onDropZoneEnter,
  onDropZoneLeave,
  onAddSubPosition,
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
    onDragEnd();
    onDrop();
  };

  return (
    <div
      className={cn(
        'org-node w-[160px] p-2 select-none transition-all relative group',
        isFilled ? 'org-node-filled' : 'org-node-open',
        isSelected && 'ring-2 ring-primary shadow-medium',
        isDragging && 'opacity-50 scale-95 cursor-grabbing',
        isDropTarget && 'ring-2 ring-success bg-success/10 scale-105',
        !isDragging && !isPreview && 'cursor-grab',
        isPreview && 'border-2 border-dashed border-primary/60 bg-primary/5 opacity-80 animate-pulse',
        isPendingRemoval && 'opacity-40 bg-destructive/10 border-destructive line-through',
        isPendingMove && 'ring-2 ring-warning/60 bg-warning/5'
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
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium',
            isFilled
              ? 'bg-primary/10 text-primary'
              : 'bg-warning/10 text-warning border border-dashed border-warning/30'
          )}
        >
          {isFilled ? (
            initials
          ) : (
            <Briefcase className="w-3 h-3" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isFilled ? (
            <>
              <p className="text-xs font-medium text-foreground truncate leading-tight">
                {node.employee!.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">
                {node.position.title}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-foreground truncate leading-tight">
                {node.position.title}
              </p>
              <p className="text-[10px] text-warning leading-tight">
                Open
              </p>
            </>
          )}
        </div>
      </div>

      {/* Add sub-position button */}
      {!isBaseline && !isPreview && !isDragging && !isDragActive && onAddSubPosition && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddSubPosition();
          }}
          className={cn(
            'absolute left-1/2 -translate-x-1/2 -bottom-2 w-5 h-5 rounded-full',
            'bg-primary text-primary-foreground shadow-sm',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100 hover:opacity-100 hover:scale-110',
            'transition-all duration-200',
            isSelected && 'opacity-100'
          )}
        >
          <Plus className="w-3 h-3" />
        </button>
      )}

      {/* Drop zone indicator - appears below node when dragging */}
      {isDragActive && !isDragging && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 top-full mt-2',
            'w-[180px] py-2 px-3 rounded-md',
            'border-2 border-dashed transition-all duration-200',
            'flex items-center justify-center gap-2',
            'text-xs font-medium',
            isValidDropTarget
              ? 'border-success bg-success/20 text-success-foreground scale-105'
              : 'border-muted-foreground/30 bg-muted/50 text-muted-foreground'
          )}
          onMouseEnter={(e) => {
            e.stopPropagation();
            onDropZoneEnter?.();
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            onDropZoneLeave?.();
          }}
        >
          <span className="text-lg">↓</span>
          <span>
            {isValidDropTarget 
              ? `Drop under ${node.employee?.name || node.position.title}`
              : `Move under ${node.employee?.name || node.position.title}`
            }
          </span>
        </div>
      )}
    </div>
  );
}
