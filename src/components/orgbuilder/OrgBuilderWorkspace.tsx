import { useState, useCallback } from 'react';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import { OrgCanvas } from './OrgCanvas';
import { DetailPanel } from './DetailPanel';
import { FreeAgentsDrawer } from './FreeAgentsDrawer';
import { AddPositionModal } from './AddPositionModal';
import { AddPersonModal } from './AddPersonModal';
import { CreateScenarioModal } from './CreateScenarioModal';
import { FloatingActionButtons } from './FloatingActionButtons';
import { OrgChatBubble } from './OrgChatBubble';
import { OrgChatPanel } from './OrgChatPanel';
import { Scenario, OrgHealth, PanelContent, Employee, OrgNode } from '@/types/org-builder';
import { ChatCommand } from '@/types/org-chat';
import { createBaselineScenario, mockHealthFlags } from '@/data/mock-org-data';
import { useOrgChat } from '@/hooks/useOrgChat';
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

  const handleMoveNode = (nodeId: string, newParentId: string) => {
    if (isBaseline) return;
    
    const node = activeScenario.nodes[nodeId];
    if (!node || nodeId === newParentId) return;

    setScenarios(prev =>
      prev.map(s => {
        if (s.id !== activeScenarioId) return s;
        
        const updatedNodes = { ...s.nodes };
        
        // Remove from old parent's children
        if (node.parentId && updatedNodes[node.parentId]) {
          updatedNodes[node.parentId] = {
            ...updatedNodes[node.parentId],
            children: updatedNodes[node.parentId].children.filter(id => id !== nodeId),
          };
        }
        
        // Add to new parent's children
        if (updatedNodes[newParentId]) {
          updatedNodes[newParentId] = {
            ...updatedNodes[newParentId],
            children: [...updatedNodes[newParentId].children, nodeId],
          };
        }
        
        // Update node's parent
        updatedNodes[nodeId] = {
          ...updatedNodes[nodeId],
          parentId: newParentId,
        };

        return {
          ...s,
          nodes: updatedNodes,
        };
      })
    );

    const movedNode = activeScenario.nodes[nodeId];
    const newParent = activeScenario.nodes[newParentId];
    toast.success(`Moved ${movedNode?.position.title || 'position'} under ${newParent?.position.title || 'new parent'}`);
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

  // Chat command handler
  const handleApplyChatCommand = useCallback((command: ChatCommand) => {
    // If in baseline, create a new scenario first
    if (isBaseline) {
      const baseline = scenarios.find(s => s.isBaseline)!;
      const newScenarioName = `Scenario ${scenarios.length}`;
      const newScenario: Scenario = {
        id: `scenario-${Date.now()}`,
        name: newScenarioName,
        isBaseline: false,
        createdAt: new Date(),
        nodes: JSON.parse(JSON.stringify(baseline.nodes)),
        rootId: baseline.rootId,
        freeAgents: [...baseline.freeAgents],
      };
      setScenarios(prev => [...prev, newScenario]);
      setActiveScenarioId(newScenario.id);
      toast.info(`Created new scenario: ${newScenarioName}`);
      
      // Apply the command to the new scenario after state update
      setTimeout(() => {
        applyCommandToScenario(command, newScenario.id);
      }, 0);
      return;
    }

    applyCommandToScenario(command, activeScenarioId);
  }, [isBaseline, scenarios, activeScenarioId]);

  // Helper to apply command to a specific scenario
  const applyCommandToScenario = useCallback((command: ChatCommand, scenarioId: string) => {
    switch (command.type) {
      case 'create_team':
      case 'create_position': {
        const positions = command.type === 'create_team' 
          ? command.positions 
          : [command.position];
        
        let parentId = command.parentId;
        
        setScenarios(prev => prev.map(s => {
          if (s.id !== scenarioId) return s;
          
          const updatedNodes = { ...s.nodes };
          
          positions.forEach((pos, index) => {
            const newNodeId = `node-${Date.now()}-${index}`;
            const newNode: OrgNode = {
              id: newNodeId,
              position: {
                id: `pos-${Date.now()}-${index}`,
                title: pos.title,
                description: pos.description || '',
                department: 'General',
                requiredSkills: [],
                level: pos.level,
              },
              parentId: index === 0 ? command.parentId : parentId,
              children: [],
              x: 0,
              y: 0,
            };
            
            updatedNodes[newNodeId] = newNode;
            
            // Update parent's children
            const pId = index === 0 ? command.parentId : parentId;
            if (pId && updatedNodes[pId]) {
              updatedNodes[pId] = {
                ...updatedNodes[pId],
                children: [...updatedNodes[pId].children, newNodeId],
              };
            }
            
            // For team creation, subsequent positions report to the first (lead)
            if (index === 0 && command.type === 'create_team') {
              parentId = newNodeId;
            }
          });
          
          return { ...s, nodes: updatedNodes };
        }));
        
        const msg = command.type === 'create_team' 
          ? `Created ${command.teamName} team with ${positions.length} positions`
          : `Created ${command.position.title} position`;
        toast.success(msg);
        break;
      }
      
      case 'move_node': {
        // For move and cut, we need to handle them inline since they depend on current scenario state
        setScenarios(prev => prev.map(s => {
          if (s.id !== scenarioId) return s;
          
          const node = s.nodes[command.nodeId];
          if (!node) return s;
          
          const updatedNodes = { ...s.nodes };
          
          // Remove from old parent's children
          if (node.parentId && updatedNodes[node.parentId]) {
            updatedNodes[node.parentId] = {
              ...updatedNodes[node.parentId],
              children: updatedNodes[node.parentId].children.filter(id => id !== command.nodeId),
            };
          }
          
          // Add to new parent's children
          if (updatedNodes[command.newParentId]) {
            updatedNodes[command.newParentId] = {
              ...updatedNodes[command.newParentId],
              children: [...updatedNodes[command.newParentId].children, command.nodeId],
            };
          }
          
          // Update node's parent
          updatedNodes[command.nodeId] = {
            ...updatedNodes[command.nodeId],
            parentId: command.newParentId,
          };

          return { ...s, nodes: updatedNodes };
        }));
        toast.success(`Moved ${command.nodeTitle} under ${command.newParentTitle}`);
        break;
      }
      
      case 'remove_position': {
        setScenarios(prev => prev.map(s => {
          if (s.id !== scenarioId) return s;
          
          const node = s.nodes[command.nodeId];
          if (!node) return s;
          
          // Collect employees in subtree
          const collectEmployees = (nId: string): Employee[] => {
            const n = s.nodes[nId];
            if (!n) return [];
            const employees: Employee[] = n.employee ? [n.employee] : [];
            n.children.forEach(childId => {
              employees.push(...collectEmployees(childId));
            });
            return employees;
          };
          
          const displacedEmployees = collectEmployees(command.nodeId);
          
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
          
          let updatedNodes = removeNode(command.nodeId, s.nodes);
          
          // Update parent's children
          if (node.parentId && updatedNodes[node.parentId]) {
            updatedNodes[node.parentId] = {
              ...updatedNodes[node.parentId],
              children: updatedNodes[node.parentId].children.filter(id => id !== command.nodeId),
            };
          }

          return {
            ...s,
            nodes: updatedNodes,
            freeAgents: [...s.freeAgents, ...displacedEmployees],
            rootId: s.rootId === command.nodeId ? null : s.rootId,
          };
        }));
        toast.success(`Removed ${command.nodeTitle}`);
        break;
      }
      
      case 'reassign_person': {
        toast.success(`Reassigned ${command.personName} to ${command.newPositionTitle}`);
        break;
      }
    }
  }, []);

  // Initialize chat hook
  const orgChat = useOrgChat({
    scenario: activeScenario,
    isBaseline,
    onApplyChanges: handleApplyChatCommand,
  });

  const parentNode = addPositionParentId ? activeScenario.nodes[addPositionParentId] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <WorkspaceToolbar
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onScenarioChange={handleScenarioChange}
        onCreateScenario={() => setShowCreateScenario(true)}
        freeAgentCount={activeScenario.freeAgents.length}
        onFreeAgentsClick={() => setShowFreeAgents(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isBaseline={isBaseline}
        health={health}
        onHealthClick={() => setPanelContent({ type: 'health' })}
      />

      <FloatingActionButtons
        onAddPosition={() => {
          setAddPositionParentId(activeScenario.rootId);
          setShowAddPosition(true);
        }}
        onAddPerson={() => setShowAddPerson(true)}
        disabled={isBaseline}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <OrgCanvas
          scenario={activeScenario}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          onViewDetails={handleViewDetails}
          onAddSubPosition={handleAddSubPosition}
          onMoveNode={handleMoveNode}
          onCutNode={handleCutNode}
          isBaseline={isBaseline}
          preview={orgChat.preview}
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

        {/* Chat Panel */}
        <OrgChatPanel
          isOpen={orgChat.isOpen}
          onClose={() => orgChat.setIsOpen(false)}
          messages={orgChat.messages}
          isProcessing={orgChat.isProcessing}
          hasPreview={!!orgChat.preview}
          onSendMessage={orgChat.sendMessage}
          onApplyPreview={orgChat.applyPreview}
          onClearPreview={orgChat.clearPreview}
          onClearChat={orgChat.clearChat}
          onSelectOption={orgChat.handleClarificationSelect}
        />
      </div>

      {/* Chat Bubble */}
      <OrgChatBubble
        isOpen={orgChat.isOpen}
        onClick={() => orgChat.setIsOpen(true)}
        hasPreview={!!orgChat.preview}
      />

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
