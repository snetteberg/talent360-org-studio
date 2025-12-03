import { useRef, useState, useEffect, useCallback } from 'react';
import { OrgNode as OrgNodeType, Scenario } from '@/types/org-builder';
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
  isBaseline: boolean;
}

export function OrgCanvas({
  scenario,
  selectedNodeId,
  onSelectNode,
  onViewDetails,
  onAddSubPosition,
  onMoveNode,
  onCutNode,
  isBaseline,
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
      if (dx > 5 || dy > 5) {
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

  // Handle node drag start
  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    if (isBaseline) return;
    setDraggingNodeId(nodeId);
    setDragStartPos({ x: e.clientX, y: e.clientY });
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

  // Calculate tree layout
  const calculateLayout = useCallback(() => {
    const nodes = scenario.nodes;
    const rootId = scenario.rootId;
    if (!rootId || !nodes[rootId]) return { positions: {}, connections: [] };

    const nodeWidth = 200;
    const nodeHeight = 80;
    const horizontalGap = 40;
    const verticalGap = 80;

    const positions: Record<string, { x: number; y: number }> = {};
    const connections: { from: string; to: string }[] = [];

    const calculateSubtreeWidth = (nodeId: string): number => {
      const node = nodes[nodeId];
      if (!node || node.children.length === 0) return nodeWidth;
      
      let totalWidth = 0;
      node.children.forEach((childId, index) => {
        if (nodes[childId]) {
          totalWidth += calculateSubtreeWidth(childId);
          if (index < node.children.length - 1) {
            totalWidth += horizontalGap;
          }
        }
      });
      return Math.max(nodeWidth, totalWidth);
    };

    const positionNode = (nodeId: string, x: number, y: number) => {
      const node = nodes[nodeId];
      if (!node) return;

      const subtreeWidth = calculateSubtreeWidth(nodeId);
      positions[nodeId] = { x: x + subtreeWidth / 2 - nodeWidth / 2, y };

      let childX = x;
      node.children.forEach(childId => {
        if (nodes[childId]) {
          connections.push({ from: nodeId, to: childId });
          const childWidth = calculateSubtreeWidth(childId);
          positionNode(childId, childX, y + nodeHeight + verticalGap);
          childX += childWidth + horizontalGap;
        }
      });
    };

    const totalWidth = calculateSubtreeWidth(rootId);
    positionNode(rootId, 0, 40);

    return { positions, connections };
  }, [scenario]);

  const { positions, connections } = calculateLayout();

  const canvasBounds = Object.values(positions).reduce(
    (bounds, pos) => ({
      minX: Math.min(bounds.minX, pos.x),
      maxX: Math.max(bounds.maxX, pos.x + 180),
      minY: Math.min(bounds.minY, pos.y),
      maxY: Math.max(bounds.maxY, pos.y + 80),
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
            {connections.map(({ from, to }) => {
              const fromPos = positions[from];
              const toPos = positions[to];
              if (!fromPos || !toPos) return null;

              const fromX = fromPos.x + 90;
              const fromY = fromPos.y + 72;
              const toX = toPos.x + 90;
              const toY = toPos.y;

              return (
                <path
                  key={`${from}-${to}`}
                  className="org-connector"
                  d={`M ${fromX} ${fromY} C ${fromX} ${fromY + 40}, ${toX} ${toY - 40}, ${toX} ${toY}`}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {Object.entries(positions).map(([nodeId, pos]) => {
            const node = scenario.nodes[nodeId];
            if (!node) return null;

            const isDragging = draggingNodeId === nodeId && hasDragStarted;
            const isDropTarget = dropTargetId === nodeId && draggingNodeId && draggingNodeId !== nodeId && !isDescendant(draggingNodeId, nodeId);

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
                  onClick={() => {
                    if (!hasDragStarted) {
                      onSelectNode(nodeId);
                    }
                  }}
                  onDragStart={(e) => handleNodeDragStart(nodeId, e)}
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
                />
                {selectedNodeId === nodeId && !isDragging && (
                  <div className="absolute left-full top-0 ml-2 z-20">
                    <NodePopover
                      onAddSubPosition={() => onAddSubPosition(nodeId)}
                      onCut={() => onCutNode(nodeId)}
                      onViewDetails={() => onViewDetails(nodeId)}
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
