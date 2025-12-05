import { useRef, useState, useEffect, useCallback } from 'react';
import { OrgNode as OrgNodeType, Scenario } from '@/types/org-builder';
import { PreviewState } from '@/types/org-chat';
import { OrgNode } from './OrgNode';
import { NodePopover } from './NodePopover';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrgCanvasProps {
  scenario: Scenario;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onViewDetails: (nodeId: string) => void;
  onAddSubPosition: (parentId: string) => void;
  onMoveNode: (nodeId: string, newParentId: string) => void;
  onCutNode: (nodeId: string) => void;
  onModifyNewScenario?: (nodeId: string) => void;
  isBaseline: boolean;
  preview?: PreviewState | null;
}

export function OrgCanvas({
  scenario,
  selectedNodeId,
  onSelectNode,
  onViewDetails,
  onAddSubPosition,
  onMoveNode,
  onCutNode,
  onModifyNewScenario,
  isBaseline,
  preview,
}: OrgCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Drag and drop state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [hasDragStarted, setHasDragStarted] = useState(false);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleFit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if we didn't drag
    if (!hasDragged && (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('org-canvas-inner'))) {
      onSelectNode(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start canvas panning if not dragging a node
    if (e.button === 0 && !draggingNodeId) {
      setIsPanning(true);
      setHasDragged(false);
      setDragStart({ x: e.clientX, y: e.clientY });
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
  // Check if we should start node dragging (after threshold)
    if (dragStartPos && draggingNodeId && !hasDragStarted) {
      const dx = Math.abs(e.clientX - dragStartPos.x);
      const dy = Math.abs(e.clientY - dragStartPos.y);
      if (dx > 10 || dy > 10) {
        setHasDragStarted(true);
      }
    }

    // Canvas panning
    if (isPanning && dragStart && !draggingNodeId) {
      const dx = Math.abs(e.clientX - dragStart.x);
      const dy = Math.abs(e.clientY - dragStart.y);
      if (dx > 5 || dy > 5) {
        setHasDragged(true);
      }
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    // Handle node drop
    if (draggingNodeId && dropTargetId && hasDragStarted && !isBaseline) {
      // Don't allow dropping on self or descendants
      if (draggingNodeId !== dropTargetId && !isDescendant(draggingNodeId, dropTargetId)) {
        onMoveNode(draggingNodeId, dropTargetId);
      }
    }
    
    setIsPanning(false);
    setDragStart(null);
    setDraggingNodeId(null);
    setDropTargetId(null);
    setDragStartPos(null);
    setHasDragStarted(false);
  };

  // Check if targetId is a descendant of nodeId
  const isDescendant = (nodeId: string, targetId: string): boolean => {
    const node = scenario.nodes[nodeId];
    if (!node) return false;
    if (node.children.includes(targetId)) return true;
    return node.children.some(childId => isDescendant(childId, targetId));
  };

  // Handle node drag start - only allow drag if node is already selected
  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    if (isBaseline) return;
    // Only initiate drag if this node is already selected (prevents accidental drags on first click)
    if (selectedNodeId === nodeId) {
      setDraggingNodeId(nodeId);
      setDragStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle node drag end
  const handleNodeDragEnd = () => {
    if (!hasDragStarted && draggingNodeId) {
      // It was just a click, not a drag
      onSelectNode(draggingNodeId);
    }
  };

  // Handle wheel zoom and two-finger pinch
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey) {
      const delta = -e.deltaY * 0.01;
      setZoom(z => Math.min(Math.max(z + delta, 0.5), 2));
    } else {
      setPan(p => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY,
      }));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Calculate tree layout including preview nodes
  const calculateLayout = useCallback(() => {
    // Merge scenario nodes with preview nodes
    const allNodes: Record<string, OrgNodeType> = { ...scenario.nodes };
    const previewNodeIds = new Set<string>();
    
    // Add preview nodes to the node map
    if (preview?.pendingNodes) {
      preview.pendingNodes.forEach(node => {
        allNodes[node.id] = node;
        previewNodeIds.add(node.id);
        // Add to parent's children list for layout calculation
        if (node.parentId && allNodes[node.parentId]) {
          const parent = allNodes[node.parentId];
          if (!parent.children.includes(node.id)) {
            allNodes[node.parentId] = {
              ...parent,
              children: [...parent.children, node.id]
            };
          }
        }
      });
    }

    const rootId = scenario.rootId;
    if (!rootId || !allNodes[rootId]) return { positions: {}, connections: [], previewNodeIds, allNodes };

    const nodeWidth = 160;
    const nodeHeight = 56;
    const horizontalGap = 16;
    const verticalGap = 40;

    const positions: Record<string, { x: number; y: number }> = {};
    const connections: { from: string; to: string; isPreview?: boolean }[] = [];

    const calculateSubtreeWidth = (nodeId: string): number => {
      const node = allNodes[nodeId];
      if (!node || node.children.length === 0) return nodeWidth;
      
      let totalWidth = 0;
      node.children.forEach((childId, index) => {
        if (allNodes[childId]) {
          totalWidth += calculateSubtreeWidth(childId);
          if (index < node.children.length - 1) {
            totalWidth += horizontalGap;
          }
        }
      });
      return Math.max(nodeWidth, totalWidth);
    };

    const positionNode = (nodeId: string, x: number, y: number) => {
      const node = allNodes[nodeId];
      if (!node) return;

      const subtreeWidth = calculateSubtreeWidth(nodeId);
      positions[nodeId] = { x: x + subtreeWidth / 2 - nodeWidth / 2, y };

      let childX = x;
      node.children.forEach(childId => {
        if (allNodes[childId]) {
          const isPreviewConnection = previewNodeIds.has(childId) || previewNodeIds.has(nodeId);
          connections.push({ from: nodeId, to: childId, isPreview: isPreviewConnection });
          const childWidth = calculateSubtreeWidth(childId);
          positionNode(childId, childX, y + nodeHeight + verticalGap);
          childX += childWidth + horizontalGap;
        }
      });
    };

    const totalWidth = calculateSubtreeWidth(rootId);
    positionNode(rootId, 0, 40);

    return { positions, connections, previewNodeIds, allNodes };
  }, [scenario, preview]);

  const { positions, connections, previewNodeIds, allNodes } = calculateLayout();

  const canvasBounds = Object.values(positions).reduce(
    (bounds, pos) => ({
      minX: Math.min(bounds.minX, pos.x),
      maxX: Math.max(bounds.maxX, pos.x + 160),
      minY: Math.min(bounds.minY, pos.y),
      maxY: Math.max(bounds.maxY, pos.y + 56),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );

  const canvasWidth = Math.max(1200, canvasBounds.maxX - canvasBounds.minX + 200);
  const canvasHeight = Math.max(800, canvasBounds.maxY - canvasBounds.minY + 200);

  // Determine cursor based on state
  const getCursor = () => {
    if (draggingNodeId && hasDragStarted) return 'grabbing';
    if (isPanning) return 'grabbing';
    return 'grab';
  };

  return (
    <div className="relative flex-1 overflow-hidden org-canvas">
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-soft">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground px-2 min-w-[48px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleFit}>
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Drag hint */}
      {draggingNodeId && hasDragStarted && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-card border border-border rounded-lg px-4 py-2 shadow-medium">
          <p className="text-sm text-muted-foreground">
            Drop on another position to move
          </p>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full overflow-hidden select-none"
        style={{ cursor: getCursor() }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="org-canvas-inner relative"
          style={{
            width: canvasWidth * zoom,
            height: canvasHeight * zoom,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* SVG Connectors */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight}
          >
          {/* Draw elbow connectors: horizontal bar + vertical drops */}
            {(() => {
              // Group connections by parent
              const parentGroups: Record<string, string[]> = {};
              connections.forEach(({ from, to }) => {
                if (!parentGroups[from]) parentGroups[from] = [];
                parentGroups[from].push(to);
              });

              return Object.entries(parentGroups).map(([parentId, children]) => {
                const parentPos = positions[parentId];
                if (!parentPos) return null;

                const parentCenterX = parentPos.x + 80;
                const parentBottomY = parentPos.y + 56;
                const midY = parentBottomY + 20;

                // Get child positions
                const childPositions = children
                  .map(childId => ({ id: childId, pos: positions[childId] }))
                  .filter(c => c.pos);

                if (childPositions.length === 0) return null;

                const isPreviewConn = previewNodeIds?.has(parentId) || children.some(c => previewNodeIds?.has(c));
                const strokeColor = isPreviewConn ? "hsl(var(--primary))" : "hsl(var(--border))";
                const strokeOpacity = isPreviewConn ? 0.6 : 1;

                // Single child: straight vertical line
                if (childPositions.length === 1) {
                  const childCenterX = childPositions[0].pos!.x + 80;
                  const childTopY = childPositions[0].pos!.y;
                  return (
                    <g key={`connector-${parentId}`}>
                      <path
                        d={`M ${parentCenterX} ${parentBottomY} L ${parentCenterX} ${midY} L ${childCenterX} ${midY} L ${childCenterX} ${childTopY}`}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={1}
                        strokeOpacity={strokeOpacity}
                        strokeDasharray={isPreviewConn ? "5,5" : undefined}
                      />
                    </g>
                  );
                }

                // Multiple children: horizontal bar + vertical drops
                const childXs = childPositions.map(c => c.pos!.x + 80);
                const minX = Math.min(...childXs);
                const maxX = Math.max(...childXs);

                return (
                  <g key={`connector-${parentId}`}>
                    {/* Vertical from parent to midline */}
                    <line
                      x1={parentCenterX} y1={parentBottomY}
                      x2={parentCenterX} y2={midY}
                      stroke={strokeColor}
                      strokeWidth={1}
                      strokeOpacity={strokeOpacity}
                      strokeDasharray={isPreviewConn ? "5,5" : undefined}
                    />
                    {/* Horizontal bar across children */}
                    <line
                      x1={minX} y1={midY}
                      x2={maxX} y2={midY}
                      stroke={strokeColor}
                      strokeWidth={1}
                      strokeOpacity={strokeOpacity}
                      strokeDasharray={isPreviewConn ? "5,5" : undefined}
                    />
                    {/* Vertical drops to each child */}
                    {childPositions.map(({ id, pos }) => (
                      <line
                        key={`drop-${id}`}
                        x1={pos!.x + 80} y1={midY}
                        x2={pos!.x + 80} y2={pos!.y}
                        stroke={strokeColor}
                        strokeWidth={1}
                        strokeOpacity={strokeOpacity}
                        strokeDasharray={isPreviewConn ? "5,5" : undefined}
                      />
                    ))}
                  </g>
                );
              });
            })()}
          </svg>

          {/* Nodes */}
          {Object.entries(positions).map(([nodeId, pos]) => {
            const node = allNodes[nodeId];
            if (!node) return null;

            const isPreviewNode = previewNodeIds?.has(nodeId) || false;
            const isPendingRemoval = preview?.pendingRemovals?.includes(nodeId) || false;
            const isPendingMove = preview?.pendingMoves?.some(m => m.nodeId === nodeId) || false;
            const isDragging = draggingNodeId === nodeId && hasDragStarted;
            const isDropTarget = dropTargetId === nodeId && draggingNodeId && draggingNodeId !== nodeId && !isDescendant(draggingNodeId, nodeId);

            // Check if this is a valid drop target (not self, not descendant of dragging node)
            const canBeDropTarget = draggingNodeId && 
              draggingNodeId !== nodeId && 
              !isDescendant(draggingNodeId, nodeId) &&
              !isPreviewNode;

            return (
              <div
                key={nodeId}
                className="absolute"
                style={{ left: pos.x, top: pos.y }}
              >
                <OrgNode
                  node={node}
                  isSelected={selectedNodeId === nodeId}
                  isDragging={isDragging}
                  isDropTarget={isDropTarget}
                  isPreview={isPreviewNode}
                  isPendingRemoval={isPendingRemoval}
                  isPendingMove={isPendingMove}
                  isBaseline={isBaseline}
                  isDragActive={hasDragStarted && !!draggingNodeId}
                  isValidDropTarget={dropTargetId === nodeId && canBeDropTarget}
                  onClick={() => {
                    if (!hasDragStarted && !isPreviewNode) {
                      onSelectNode(nodeId);
                    }
                  }}
                  onDragStart={(e) => !isPreviewNode && handleNodeDragStart(nodeId, e)}
                  onDragEnd={handleNodeDragEnd}
                  onDrop={() => {
                    if (draggingNodeId && draggingNodeId !== nodeId) {
                      // Drop handled in handleMouseUp
                    }
                  }}
                  onDragOver={() => {
                    if (draggingNodeId && draggingNodeId !== nodeId && hasDragStarted) {
                      setDropTargetId(nodeId);
                    }
                  }}
                  onDragLeave={() => {
                    if (dropTargetId === nodeId) {
                      setDropTargetId(null);
                    }
                  }}
                  onDropZoneEnter={() => {
                    if (canBeDropTarget && hasDragStarted) {
                      setDropTargetId(nodeId);
                    }
                  }}
                  onDropZoneLeave={() => {
                    if (dropTargetId === nodeId) {
                      setDropTargetId(null);
                    }
                  }}
                  onAddSubPosition={() => onAddSubPosition(nodeId)}
                />
                {selectedNodeId === nodeId && !isDragging && !isPreviewNode && !hasDragStarted && (
                  <div className="absolute left-full top-0 ml-2 z-20">
                    <NodePopover
                      onAddSubPosition={() => onAddSubPosition(nodeId)}
                      onCut={() => onCutNode(nodeId)}
                      onViewDetails={() => onViewDetails(nodeId)}
                      onModifyNewScenario={isBaseline && onModifyNewScenario ? () => onModifyNewScenario(nodeId) : undefined}
                      isBaseline={isBaseline}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
