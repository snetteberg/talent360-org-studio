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
  onMoveNode: (nodeId: string) => void;
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

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleFit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('org-canvas-inner')) {
      onSelectNode(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

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

    // BFS to calculate positions
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

  // Calculate canvas dimensions
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

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full overflow-auto cursor-grab"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
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

            return (
              <div
                key={nodeId}
                className="absolute"
                style={{ left: pos.x, top: pos.y }}
              >
                <OrgNode
                  node={node}
                  isSelected={selectedNodeId === nodeId}
                  onClick={() => onSelectNode(nodeId)}
                />
                {selectedNodeId === nodeId && (
                  <div className="absolute left-full top-0 ml-2 z-20">
                    <NodePopover
                      onAddSubPosition={() => onAddSubPosition(nodeId)}
                      onMove={() => onMoveNode(nodeId)}
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
