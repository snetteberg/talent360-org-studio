import { useMemo, useState } from 'react';
import { Scenario } from '@/types/org-builder';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TalentSunburstProps {
  scenario: Scenario;
  selectedSkill: string | null;
}

interface SunburstSegment {
  id: string;
  name: string;
  title: string;
  depth: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  proficiency?: number;
  hasSkill?: boolean;
  isVacant?: boolean;
  children: SunburstSegment[];
}

// Simulated skill proficiency data
const getSkillProficiency = (employeeId: string, skill: string): number => {
  const hash = (employeeId + skill).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(hash % 71) + 30;
};

const getProficiencyColor = (proficiency: number | undefined, hasSkill: boolean, isVacant: boolean, skillSelected: boolean): string => {
  if (isVacant) return 'hsl(var(--muted))';
  if (!skillSelected) return 'hsl(var(--muted))';
  if (!hasSkill) return 'hsl(var(--muted))';
  if (!proficiency) return 'hsl(var(--muted))';
  
  if (proficiency >= 90) return '#10b981'; // Expert - green
  if (proficiency >= 70) return '#3b82f6'; // Advanced - blue
  if (proficiency >= 50) return '#f59e0b'; // Intermediate - amber
  return '#f97316'; // Beginner - orange
};

export function TalentSunburst({ scenario, selectedSkill }: TalentSunburstProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const { segments, maxDepth } = useMemo(() => {
    const { nodes, rootId } = scenario;
    if (!rootId) return { segments: [], maxDepth: 0 };

    let maxDepthFound = 0;

    const countDescendants = (nodeId: string): number => {
      const node = nodes[nodeId];
      if (!node || node.children.length === 0) return 1;
      return node.children.reduce((sum, childId) => sum + countDescendants(childId), 0);
    };

    const buildSegment = (
      nodeId: string,
      depth: number,
      startAngle: number,
      endAngle: number
    ): SunburstSegment | null => {
      const node = nodes[nodeId];
      if (!node) return null;

      maxDepthFound = Math.max(maxDepthFound, depth);

      const employee = node.employee;
      const isVacant = !employee;
      const hasSkill = employee && selectedSkill 
        ? employee.skills.includes(selectedSkill) 
        : false;
      
      const proficiency = employee && selectedSkill && hasSkill
        ? getSkillProficiency(employee.id, selectedSkill)
        : undefined;

      const fill = getProficiencyColor(proficiency, hasSkill, isVacant, !!selectedSkill);

      const children: SunburstSegment[] = [];
      
      if (node.children.length > 0) {
        const totalDescendants = node.children.reduce(
          (sum, childId) => sum + countDescendants(childId), 
          0
        );
        
        let currentAngle = startAngle;
        
        node.children.forEach(childId => {
          const childDescendants = countDescendants(childId);
          const childAngleSpan = ((endAngle - startAngle) * childDescendants) / totalDescendants;
          
          const childSegment = buildSegment(
            childId,
            depth + 1,
            currentAngle,
            currentAngle + childAngleSpan
          );
          
          if (childSegment) {
            children.push(childSegment);
          }
          
          currentAngle += childAngleSpan;
        });
      }

      return {
        id: nodeId,
        name: employee?.name || 'Vacant',
        title: node.position.title,
        depth,
        startAngle,
        endAngle,
        fill,
        proficiency,
        hasSkill,
        isVacant,
        children,
      };
    };

    const root = buildSegment(rootId, 0, 0, 360);
    return { 
      segments: root ? [root] : [], 
      maxDepth: maxDepthFound 
    };
  }, [scenario, selectedSkill]);

  const renderSegments = (
    segment: SunburstSegment,
    centerX: number,
    centerY: number,
    innerRadius: number,
    ringWidth: number
  ): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    
    const outerRadius = innerRadius + ringWidth;
    const startRad = (segment.startAngle - 90) * (Math.PI / 180);
    const endRad = (segment.endAngle - 90) * (Math.PI / 180);
    
    // Calculate arc path
    const x1 = centerX + innerRadius * Math.cos(startRad);
    const y1 = centerY + innerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(startRad);
    const y2 = centerY + outerRadius * Math.sin(startRad);
    const x3 = centerX + outerRadius * Math.cos(endRad);
    const y3 = centerY + outerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(endRad);
    const y4 = centerY + innerRadius * Math.sin(endRad);
    
    const largeArcFlag = (segment.endAngle - segment.startAngle) > 180 ? 1 : 0;
    
    const isHovered = hoveredSegment === segment.id;
    
    // Create arc path
    const path = segment.depth === 0 
      ? `M ${centerX} ${centerY} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} Z`
      : `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`;

    const angleSpan = segment.endAngle - segment.startAngle;
    const midAngle = ((segment.startAngle + segment.endAngle) / 2 - 90) * (Math.PI / 180);
    const labelRadius = (innerRadius + outerRadius) / 2;
    const labelX = centerX + labelRadius * Math.cos(midAngle);
    const labelY = centerY + labelRadius * Math.sin(midAngle);
    
    // Only show labels for depth 1 (direct reports to CEO)
    const showLabel = segment.depth === 1 && angleSpan > 15 && ringWidth > 30;
    
    elements.push(
      <TooltipProvider key={segment.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <g>
              <path
                d={path}
                fill={segment.fill}
                stroke="hsl(var(--background))"
                strokeWidth={2}
                opacity={isHovered ? 1 : 0.85}
                style={{ 
                  transition: 'opacity 0.2s, transform 0.2s',
                  cursor: 'pointer',
                  transform: isHovered ? `scale(1.02)` : 'scale(1)',
                  transformOrigin: `${centerX}px ${centerY}px`
                }}
                onMouseEnter={() => setHoveredSegment(segment.id)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              {showLabel && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={10}
                  fontWeight={500}
                  style={{ 
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)', 
                    pointerEvents: 'none' 
                  }}
                  transform={`rotate(${segment.startAngle + angleSpan / 2 > 180 ? segment.startAngle + angleSpan / 2 - 180 : segment.startAngle + angleSpan / 2}, ${labelX}, ${labelY})`}
                >
                  {segment.name.length > 10 ? segment.name.slice(0, 10) + '...' : segment.name}
                </text>
              )}
            </g>
          </TooltipTrigger>
          <TooltipContent className="bg-popover border border-border shadow-lg p-3">
            <p className="font-medium text-foreground">{segment.name}</p>
            <p className="text-muted-foreground text-xs">{segment.title}</p>
            {segment.isVacant && (
              <p className="text-orange-500 text-xs mt-1">Position Vacant</p>
            )}
            {selectedSkill && !segment.isVacant && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {selectedSkill}: {' '}
                  {segment.hasSkill ? (
                    <span className="font-medium text-foreground">{segment.proficiency}%</span>
                  ) : (
                    <span className="text-muted-foreground">No skill</span>
                  )}
                </p>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    // Render children
    segment.children.forEach(child => {
      elements.push(
        ...renderSegments(child, centerX, centerY, outerRadius, ringWidth)
      );
    });

    return elements;
  };

  if (segments.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center text-muted-foreground">
        No organization data available
      </div>
    );
  }

  const size = 500;
  const centerX = size / 2;
  const centerY = size / 2;
  const innerHoleRadius = 40;
  const maxRadius = (size / 2) - 20;
  const ringWidth = (maxRadius - innerHoleRadius) / (maxDepth + 1);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map(segment => renderSegments(segment, centerX, centerY, innerHoleRadius, ringWidth))}
        {/* Center circle with label */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerHoleRadius}
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="hsl(var(--foreground))"
          fontSize={10}
          fontWeight={600}
        >
          CEO
        </text>
      </svg>
      
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} />
          <span className="text-muted-foreground">Expert (90%+)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} />
          <span className="text-muted-foreground">Advanced (70-89%)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }} />
          <span className="text-muted-foreground">Intermediate (50-69%)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }} />
          <span className="text-muted-foreground">Beginner (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded bg-muted" />
          <span className="text-muted-foreground">{selectedSkill ? 'No Skill / Vacant' : 'Select a skill'}</span>
        </div>
      </div>
    </div>
  );
}
