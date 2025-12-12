import { useMemo, useState, useRef, useEffect } from 'react';
import { Scenario } from '@/types/org-builder';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, X } from 'lucide-react';

interface TalentSunburstProps {
  scenario: Scenario;
  selectedSkills: string[] | null; // Now accepts array of skill names
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
  hasChildren: boolean;
  children: SunburstSegment[];
}

// Simulated skill proficiency data - 0 to 4 scale
const getSkillProficiency = (employeeId: string, skill: string): { hasSkill: boolean; proficiency: number } => {
  const hash = (employeeId + skill).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // 90% chance of having any skill at some level (0-4)
  const hasSkill = Math.abs(hash % 100) < 90;
  if (!hasSkill) {
    return { hasSkill: false, proficiency: 0 };
  }
  
  // Distribute proficiency on 0-4 scale
  const profRand = Math.abs((hash * 17) % 100);
  let proficiency: number;
  if (profRand < 15) {
    proficiency = 4; // Top level
  } else if (profRand < 35) {
    proficiency = 3;
  } else if (profRand < 60) {
    proficiency = 2;
  } else if (profRand < 85) {
    proficiency = 1;
  } else {
    proficiency = 0;
  }
  
  return { hasSkill: true, proficiency };
};

// Get average proficiency across multiple skills
const getAverageProficiency = (employeeId: string, skills: string[]): { hasSkill: boolean; proficiency: number } => {
  if (skills.length === 0) return { hasSkill: false, proficiency: 0 };
  
  let totalProficiency = 0;
  let skillCount = 0;
  
  for (const skill of skills) {
    const result = getSkillProficiency(employeeId, skill);
    if (result.hasSkill) {
      totalProficiency += result.proficiency;
      skillCount++;
    }
  }
  
  if (skillCount === 0) return { hasSkill: false, proficiency: 0 };
  
  return {
    hasSkill: true,
    proficiency: Math.round(totalProficiency / skillCount),
  };
};

// Blue gradient from very light (0) to deep blue (4)
const getProficiencyColor = (proficiency: number | undefined, hasSkill: boolean, isVacant: boolean, skillSelected: boolean): string => {
  if (isVacant) return 'hsl(var(--muted))';
  if (!skillSelected) return 'hsl(var(--muted))';
  if (!hasSkill) return 'hsl(var(--muted))';
  if (proficiency === undefined) return 'hsl(var(--muted))';
  
  // Blue gradient: light gray-blue (0) to deep blue (4)
  const colors = [
    '#f0f4f8', // 0 - very light blue/gray
    '#c7d9e8', // 1 - light blue
    '#7fb3d3', // 2 - medium blue
    '#3b82c4', // 3 - blue
    '#1e4976', // 4 - deep blue
  ];
  
  return colors[Math.min(Math.max(proficiency, 0), 4)];
};

export function TalentSunburst({ scenario, selectedSkills }: TalentSunburstProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const hasSkillSelection = selectedSkills && selectedSkills.length > 0;

  // Get all people in the org for search
  const allPeople = useMemo(() => {
    return Object.entries(scenario.nodes)
      .filter(([_, node]) => node.employee)
      .map(([id, node]) => ({
        id,
        name: node.employee!.name,
        title: node.position.title,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [scenario.nodes]);

  // Filter people based on search query
  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allPeople.filter(
      p => p.name.toLowerCase().includes(query) || p.title.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [allPeople, searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPerson = (personId: string) => {
    setFocusedNodeId(personId);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Get the center node info (either focused or root)
  const centerNodeInfo = useMemo(() => {
    const nodeId = focusedNodeId || scenario.rootId;
    if (!nodeId) return { name: 'Organization', fill: 'hsl(var(--muted))' };
    
    const node = scenario.nodes[nodeId];
    if (!node) return { name: 'Organization', fill: 'hsl(var(--muted))' };
    
    const employee = node.employee;
    const name = employee?.name || node.position.title || 'Unknown';
    const isVacant = !employee;
    
    let hasSkill = false;
    let proficiency: number | undefined = undefined;
    
    if (employee && hasSkillSelection) {
      const skillData = selectedSkills.length === 1
        ? getSkillProficiency(employee.id, selectedSkills[0])
        : getAverageProficiency(employee.id, selectedSkills);
      hasSkill = skillData.hasSkill;
      proficiency = skillData.hasSkill ? skillData.proficiency : undefined;
    }
    
    const fill = getProficiencyColor(proficiency, hasSkill, isVacant, hasSkillSelection);
    
    return { name, fill };
  }, [focusedNodeId, scenario.rootId, scenario.nodes, selectedSkills, hasSkillSelection]);

  const { segments, maxDepth } = useMemo(() => {
    const { nodes, rootId } = scenario;
    const startNodeId = focusedNodeId || rootId;
    if (!startNodeId || !nodes[startNodeId]) return { segments: [], maxDepth: 0 };

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
      
      let hasSkill = false;
      let proficiency: number | undefined = undefined;
      
      if (employee && hasSkillSelection) {
        const skillData = selectedSkills.length === 1
          ? getSkillProficiency(employee.id, selectedSkills[0])
          : getAverageProficiency(employee.id, selectedSkills);
        hasSkill = skillData.hasSkill;
        proficiency = skillData.hasSkill ? skillData.proficiency : undefined;
      }

      const fill = getProficiencyColor(proficiency, hasSkill, isVacant, hasSkillSelection);

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
        hasChildren: node.children.length > 0,
        children,
      };
    };

    const root = buildSegment(startNodeId, 0, 0, 360);
    return { 
      segments: root ? [root] : [], 
      maxDepth: maxDepthFound 
    };
  }, [scenario, selectedSkills, focusedNodeId, hasSkillSelection]);

  const handleSegmentClick = (segment: SunburstSegment) => {
    // Only drill down if the segment has children
    if (segment.hasChildren) {
      setFocusedNodeId(segment.id);
    }
  };

  const handleReturnToFullView = () => {
    setFocusedNodeId(null);
  };

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
    
    // Only show labels for depth 1 (direct reports to focused node)
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
                  cursor: segment.hasChildren ? 'pointer' : 'default',
                  transform: isHovered ? `scale(1.02)` : 'scale(1)',
                  transformOrigin: `${centerX}px ${centerY}px`
                }}
                onMouseEnter={() => setHoveredSegment(segment.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => handleSegmentClick(segment)}
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
            {segment.hasChildren && (
              <p className="text-primary text-xs mt-1">Click to drill down</p>
            )}
            {hasSkillSelection && !segment.isVacant && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {selectedSkills!.length > 1 ? 'Avg Proficiency' : selectedSkills![0]}: {' '}
                  {segment.hasSkill ? (
                    <span className="font-medium text-foreground">Level {segment.proficiency}</span>
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
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No organization data available
      </div>
    );
  }

  const size = 700;
  const centerX = size / 2;
  const centerY = size / 2;
  const innerHoleRadius = 50;
  const maxRadius = (size / 2) - 20;
  const ringWidth = (maxRadius - innerHoleRadius) / (maxDepth + 1);

  return (
    <div className="relative flex flex-col items-center h-full">
      {/* Top controls: Return button and Search */}
      <div className="shrink-0 w-full flex items-center justify-between gap-4 pb-2">
        {/* Return to full view button */}
        <div className="flex-1">
          {focusedNodeId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReturnToFullView}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to full view
            </Button>
          )}
        </div>

        {/* Search input */}
        <div ref={searchRef} className="relative w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search person..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-8 pr-8 h-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showSuggestions && filteredPeople.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-20 overflow-hidden">
              {filteredPeople.map((person) => (
                <button
                  key={person.id}
                  onClick={() => handleSelectPerson(person.id)}
                  className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.title}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full min-h-0">
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="w-full h-full max-h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Render children of root segment directly, skipping the root segment itself */}
          {segments[0]?.children.map(child => renderSegments(child, centerX, centerY, innerHoleRadius, ringWidth))}
          {/* Center circle with label */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerHoleRadius}
            fill={centerNodeInfo.fill}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={hasSkillSelection ? 'white' : 'hsl(var(--foreground))'}
            fontSize={14}
            fontWeight={500}
            style={{ textShadow: hasSkillSelection ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}
          >
            {centerNodeInfo.name.length > 12 ? centerNodeInfo.name.slice(0, 12) + '...' : centerNodeInfo.name}
          </text>
        </svg>
      </div>
      
      <div className="shrink-0 py-3 flex items-center gap-2 justify-center">
        <span className="text-xs text-muted-foreground">0</span>
        <div className="flex h-4 rounded overflow-hidden">
          <div className="w-8" style={{ backgroundColor: '#f0f4f8' }} />
          <div className="w-8" style={{ backgroundColor: '#c7d9e8' }} />
          <div className="w-8" style={{ backgroundColor: '#7fb3d3' }} />
          <div className="w-8" style={{ backgroundColor: '#3b82c4' }} />
          <div className="w-8" style={{ backgroundColor: '#1e4976' }} />
        </div>
        <span className="text-xs text-muted-foreground">4</span>
        <span className="text-xs text-muted-foreground ml-4">
          {hasSkillSelection ? 'Proficiency Level' : 'Select a skill to view proficiency'}
        </span>
      </div>
    </div>
  );
}
