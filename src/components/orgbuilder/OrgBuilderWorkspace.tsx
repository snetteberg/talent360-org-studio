import { useState, useCallback } from 'react';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import { OrgCanvas } from './OrgCanvas';
import { DetailPanel } from './DetailPanel';
import { FreeAgentsDrawer } from './FreeAgentsDrawer';
import { AddPositionModal } from './AddPositionModal';
import { AddPersonModal } from './AddPersonModal';
import { CreateScenarioModal } from './CreateScenarioModal';
import { Scenario, OrgHealth, PanelContent, Employee, OrgNode } from '@/types/org-builder';
import { createBaselineScenario, mockHealthFlags } from '@/data/mock-org-data';
import { toast } from 'sonner';

interface OrgBuilderWorkspaceProps {
  initialFromBaseline: boolean;
}

export function OrgBuilderWorkspace({ initialFromBaseline }: OrgBuilderWorkspaceProps) {
  // Scenarios
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    const baseline = createBaselineScenario();
    if (initialFromBaseline) {
      return [baseline];
    }
    return [
      baseline,
      {
        id: 'blank',
        name: 'New Scenario',
        isBaseline: false,
        createdAt: new Date(),
        nodes: {},
        rootId: null,
        freeAgents: [],
      },
    ];
  });

  const [activeScenarioId, setActiveScenarioId] = useState(
    initialFromBaseline ? 'baseline' : 'blank'
  );

  const activeScenario = scenarios.find(s => s.id === activeScenarioId)!;
  const isBaseline = activeScenario.isBaseline;

  // Selection & Panels
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [panelContent, setPanelContent] = useState<PanelContent>(null);
  const [showFreeAgents, setShowFreeAgents] = useState(false);

  // Modals
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showCreateScenario, setShowCreateScenario] = useState(false);
  const [addPositionParentId, setAddPositionParentId] = useState<string | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<Scenario[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Calculate health
  const health: OrgHealth = {
    headcount: Object.values(activeScenario.nodes).filter(n => n.employee).length,
    layers: 4, // Simplified calculation
    openPositions: Object.values(activeScenario.nodes).filter(n => !n.employee).length,
    flags: mockHealthFlags,
  };

  // Handlers
  const handleScenarioChange = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setSelectedNodeId(null);
    setPanelContent(null);
  };

  const handleCreateScenario = (name: string) => {
    const baseline = scenarios.find(s => s.isBaseline)!;
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name,
      isBaseline: false,
      createdAt: new Date(),
      nodes: JSON.parse(JSON.stringify(baseline.nodes)),
      rootId: baseline.rootId,
      freeAgents: [],
    };
    setScenarios([...scenarios, newScenario]);
    setActiveScenarioId(newScenario.id);
    toast.success(`Created scenario: ${name}`);
  };

  const handleSelectNode = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (!nodeId) {
      setPanelContent(null);
    }
  };

  const handleViewDetails = (nodeId: string) => {
    const node = activeScenario.nodes[nodeId];
    if (node) {
      setPanelContent({
        type: node.employee ? 'person' : 'position',
        nodeId,
      });
    }
  };

  const handleAddSubPosition = (parentId: string) => {
    setAddPositionParentId(parentId);
    setShowAddPosition(true);
  };

  const handleAddPosition = (position: { title: string; description: string; level: string; skills: string[] }) => {
    if (isBaseline) return;

    const levelMap: Record<string, number> = {
      'Professional': 1,
      'Sr Professional': 2,
      'Manager': 3,
      'Director': 4,
      'Sr Director': 5,
      'Executive Director': 6,
      'VP': 7,
    };

    const newNodeId = `node-${Date.now()}`;
    const newNode: OrgNode = {
      id: newNodeId,
      position: {
        id: `pos-${Date.now()}`,
        title: position.title,
        description: position.description,
        department: 'General',
        requiredSkills: position.skills,
        level: levelMap[position.level] || 3,
      },
      parentId: addPositionParentId,
      children: [],
      x: 0,
      y: 0,
    };

    setScenarios(prev =>
      prev.map(s => {
        if (s.id !== activeScenarioId) return s;
        const updatedNodes = { ...s.nodes, [newNodeId]: newNode };
        if (addPositionParentId && updatedNodes[addPositionParentId]) {
          updatedNodes[addPositionParentId] = {
            ...updatedNodes[addPositionParentId],
            children: [...updatedNodes[addPositionParentId].children, newNodeId],
          };
        }
        return {
          ...s,
          nodes: updatedNodes,
          rootId: s.rootId || newNodeId,
        };
      })
    );

    setAddPositionParentId(null);
    toast.success(`Added position: ${position.title}`);
  };

  const handleMoveNode = (nodeId: string) => {
    toast.info('Click on a node to move this position under it');
  };

  const handleCutNode = (nodeId: string) => {
    if (isBaseline) return;

    const node = activeScenario.nodes[nodeId];
    if (!node) return;

    // Collect all employees in subtree
    const collectEmployees = (nId: string): Employee[] => {
      const n = activeScenario.nodes[nId];
      if (!n) return [];
      const employees: Employee[] = n.employee ? [n.employee] : [];
      n.children.forEach(childId => {
        employees.push(...collectEmployees(childId));
      });
      return employees;
    };

    const displacedEmployees = collectEmployees(nodeId);

    // Remove node and all children
    const removeNode = (nId: string, nodes: Record<string, OrgNode>): Record<string, OrgNode> => {
      const n = nodes[nId];
      if (!n) return nodes;
      let updated = { ...nodes };
      n.children.forEach(childId => {
        updated = removeNode(childId, updated);
      });
      delete updated[nId];
      return updated;
    };

    setScenarios(prev =>
      prev.map(s => {
        if (s.id !== activeScenarioId) return s;
        let updatedNodes = removeNode(nodeId, s.nodes);
        
        // Update parent's children
        if (node.parentId && updatedNodes[node.parentId]) {
          updatedNodes[node.parentId] = {
            ...updatedNodes[node.parentId],
            children: updatedNodes[node.parentId].children.filter(id => id !== nodeId),
          };
        }

        return {
          ...s,
          nodes: updatedNodes,
          freeAgents: [...s.freeAgents, ...displacedEmployees],
          rootId: s.rootId === nodeId ? null : s.rootId,
        };
      })
    );

    setSelectedNodeId(null);
    setPanelContent(null);
    
    if (displacedEmployees.length > 0) {
      toast.info(`${displacedEmployees.length} person(s) moved to Free Agents`);
    } else {
      toast.success('Position removed');
    }
  };

  const handleSave = () => {
    toast.success('Scenario saved');
  };

  const handleUndo = () => {
    // Simplified undo
    toast.info('Undo action');
  };

  const handleRedo = () => {
    // Simplified redo
    toast.info('Redo action');
  };

  const parentNode = addPositionParentId ? activeScenario.nodes[addPositionParentId] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <WorkspaceToolbar
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onScenarioChange={handleScenarioChange}
        onCreateScenario={() => setShowCreateScenario(true)}
        health={health}
        onHealthClick={() => setPanelContent({ type: 'health' })}
        freeAgentCount={activeScenario.freeAgents.length}
        onFreeAgentsClick={() => setShowFreeAgents(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onAddPosition={() => {
          setAddPositionParentId(activeScenario.rootId);
          setShowAddPosition(true);
        }}
        onAddPerson={() => setShowAddPerson(true)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isBaseline={isBaseline}
      />

      <div className="flex flex-1 overflow-hidden">
        <OrgCanvas
          scenario={activeScenario}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          onViewDetails={handleViewDetails}
          onAddSubPosition={handleAddSubPosition}
          onMoveNode={handleMoveNode}
          onCutNode={handleCutNode}
          isBaseline={isBaseline}
        />

        {panelContent && (
          <DetailPanel
            type={panelContent.type}
            node={
              panelContent.type === 'person' || panelContent.type === 'position'
                ? activeScenario.nodes[panelContent.nodeId]
                : undefined
            }
            health={panelContent.type === 'health' ? health : undefined}
            flag={
              panelContent.type === 'flag'
                ? health.flags.find(f => f.id === panelContent.flagId)
                : undefined
            }
            onClose={() => setPanelContent(null)}
            onReassignPerson={() => setShowAddPerson(true)}
            onAssignPerson={() => setShowAddPerson(true)}
            isBaseline={isBaseline}
          />
        )}

        {showFreeAgents && (
          <FreeAgentsDrawer
            agents={activeScenario.freeAgents}
            onClose={() => setShowFreeAgents(false)}
            onAssign={(employeeId) => {
              toast.info('Select a position to assign this person');
              setShowFreeAgents(false);
            }}
          />
        )}
      </div>

      <AddPositionModal
        open={showAddPosition}
        onClose={() => {
          setShowAddPosition(false);
          setAddPositionParentId(null);
        }}
        onAdd={handleAddPosition}
        parentTitle={parentNode?.position.title}
      />

      <AddPersonModal
        open={showAddPerson}
        onClose={() => setShowAddPerson(false)}
        onAddExisting={(employee) => {
          toast.success(`Added ${employee.name}`);
        }}
        onAddNewHire={(name, dept) => {
          toast.success(`Added placeholder: ${name}`);
        }}
        positionTitle={selectedNodeId ? activeScenario.nodes[selectedNodeId]?.position.title : undefined}
      />

      <CreateScenarioModal
        open={showCreateScenario}
        onClose={() => setShowCreateScenario(false)}
        onCreate={handleCreateScenario}
      />
    </div>
  );
}
