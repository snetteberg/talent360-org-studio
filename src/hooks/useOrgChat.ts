import { useState, useCallback } from 'react';
import { OrgNode, Scenario } from '@/types/org-builder';
import { ChatMessage, ChatCommand, PreviewState, NewPositionData } from '@/types/org-chat';
import { findBestMatch, fuzzySearch } from '@/utils/fuzzyMatch';

interface UseOrgChatOptions {
  scenario: Scenario;
  onApplyChanges: (command: ChatCommand) => void;
}

export function useOrgChat({ scenario, onApplyChanges }: UseOrgChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingClarification, setPendingClarification] = useState<{
    originalInput: string;
    field: string;
    options: { label: string; value: string; id: string }[];
  } | null>(null);

  const getAllNodes = useCallback((): OrgNode[] => {
    return Object.values(scenario.nodes);
  }, [scenario.nodes]);

  const findNodeByTitle = useCallback((title: string) => {
    const nodes = getAllNodes();
    return findBestMatch(
      title,
      nodes,
      (node) => node.position.title
    );
  }, [getAllNodes]);

  const findNodeByPersonName = useCallback((name: string) => {
    const nodes = getAllNodes().filter(n => n.employee);
    return findBestMatch(
      name,
      nodes,
      (node) => node.employee?.name || ''
    );
  }, [getAllNodes]);

  const parseCommand = useCallback((input: string): {
    command: ChatCommand | null;
    needsClarification: boolean;
    clarificationMessage?: string;
    clarificationOptions?: { label: string; value: string; id: string }[];
    errorMessage?: string;
  } => {
    const inputLower = input.toLowerCase();

    // Pattern: Create team
    const createTeamMatch = inputLower.match(
      /create\s+(?:a\s+)?(?:new\s+)?(.+?)\s+team\s+(?:under|reporting\s+to|below)\s+(?:the\s+)?(.+?)(?:\s+with\s+(\d+)\s+(?:people|positions|members))?$/i
    );
    if (createTeamMatch) {
      const teamName = createTeamMatch[1].trim();
      const parentQuery = createTeamMatch[2].trim();
      const count = parseInt(createTeamMatch[3]) || 3;

      const parentResult = findNodeByTitle(parentQuery);
      
      if (!parentResult.match && parentResult.alternatives.length > 0) {
        return {
          command: null,
          needsClarification: true,
          clarificationMessage: `I found multiple matches for "${parentQuery}". Which one did you mean?`,
          clarificationOptions: parentResult.alternatives.map(alt => ({
            label: alt.item.position.title,
            value: alt.item.position.title,
            id: alt.item.id
          }))
        };
      }

      if (!parentResult.match) {
        return {
          command: null,
          needsClarification: false,
          errorMessage: `I couldn't find a position matching "${parentQuery}". Please try again with a different name.`
        };
      }

      const positions: NewPositionData[] = [
        { title: `${teamName} Lead`, level: 4, description: `Lead the ${teamName} team` },
        ...Array.from({ length: count - 1 }, (_, i) => ({
          title: `${teamName} Specialist`,
          level: 5,
          description: `${teamName} team member`
        }))
      ];

      return {
        command: {
          type: 'create_team',
          parentTitle: parentResult.match.position.title,
          parentId: parentResult.match.id,
          teamName,
          positions
        },
        needsClarification: false
      };
    }

    // Pattern: Create position
    const createPositionMatch = inputLower.match(
      /(?:create|add)\s+(?:a\s+)?(?:new\s+)?(.+?)\s+(?:position\s+)?(?:under|reporting\s+to|below)\s+(?:the\s+)?(.+)$/i
    );
    if (createPositionMatch) {
      const positionTitle = createPositionMatch[1].trim();
      const parentQuery = createPositionMatch[2].trim();

      const parentResult = findNodeByTitle(parentQuery);
      
      if (!parentResult.match && parentResult.alternatives.length > 0) {
        return {
          command: null,
          needsClarification: true,
          clarificationMessage: `I found multiple matches for "${parentQuery}". Which one did you mean?`,
          clarificationOptions: parentResult.alternatives.map(alt => ({
            label: alt.item.position.title,
            value: alt.item.position.title,
            id: alt.item.id
          }))
        };
      }

      if (!parentResult.match) {
        return {
          command: null,
          needsClarification: false,
          errorMessage: `I couldn't find a position matching "${parentQuery}". Please try again with a different name.`
        };
      }

      return {
        command: {
          type: 'create_position',
          parentTitle: parentResult.match.position.title,
          parentId: parentResult.match.id,
          position: {
            title: positionTitle.charAt(0).toUpperCase() + positionTitle.slice(1),
            level: 4,
            description: `New ${positionTitle} position`
          }
        },
        needsClarification: false
      };
    }

    // Pattern: Move node
    const moveMatch = inputLower.match(
      /move\s+(?:the\s+)?(.+?)\s+(?:under|to|below|reporting\s+to)\s+(?:the\s+)?(.+)$/i
    );
    if (moveMatch) {
      const nodeQuery = moveMatch[1].trim();
      const newParentQuery = moveMatch[2].trim();

      const nodeResult = findNodeByTitle(nodeQuery);
      const parentResult = findNodeByTitle(newParentQuery);

      if (!nodeResult.match && nodeResult.alternatives.length > 0) {
        return {
          command: null,
          needsClarification: true,
          clarificationMessage: `I found multiple matches for "${nodeQuery}". Which one did you mean?`,
          clarificationOptions: nodeResult.alternatives.map(alt => ({
            label: alt.item.position.title,
            value: alt.item.position.title,
            id: alt.item.id
          }))
        };
      }

      if (!nodeResult.match) {
        return {
          command: null,
          needsClarification: false,
          errorMessage: `I couldn't find a position matching "${nodeQuery}". Please try again.`
        };
      }

      if (!parentResult.match && parentResult.alternatives.length > 0) {
        return {
          command: null,
          needsClarification: true,
          clarificationMessage: `I found multiple matches for "${newParentQuery}". Which one did you mean?`,
          clarificationOptions: parentResult.alternatives.map(alt => ({
            label: alt.item.position.title,
            value: alt.item.position.title,
            id: alt.item.id
          }))
        };
      }

      if (!parentResult.match) {
        return {
          command: null,
          needsClarification: false,
          errorMessage: `I couldn't find a position matching "${newParentQuery}". Please try again.`
        };
      }

      return {
        command: {
          type: 'move_node',
          nodeTitle: nodeResult.match.position.title,
          nodeId: nodeResult.match.id,
          newParentTitle: parentResult.match.position.title,
          newParentId: parentResult.match.id
        },
        needsClarification: false
      };
    }

    // Pattern: Remove position
    const removeMatch = inputLower.match(
      /(?:remove|delete|cut)\s+(?:the\s+)?(.+?)(?:\s+position)?$/i
    );
    if (removeMatch) {
      const nodeQuery = removeMatch[1].trim();
      const nodeResult = findNodeByTitle(nodeQuery);

      if (!nodeResult.match && nodeResult.alternatives.length > 0) {
        return {
          command: null,
          needsClarification: true,
          clarificationMessage: `I found multiple matches for "${nodeQuery}". Which one did you mean?`,
          clarificationOptions: nodeResult.alternatives.map(alt => ({
            label: alt.item.position.title,
            value: alt.item.position.title,
            id: alt.item.id
          }))
        };
      }

      if (!nodeResult.match) {
        return {
          command: null,
          needsClarification: false,
          errorMessage: `I couldn't find a position matching "${nodeQuery}". Please try again.`
        };
      }

      return {
        command: {
          type: 'remove_position',
          nodeTitle: nodeResult.match.position.title,
          nodeId: nodeResult.match.id
        },
        needsClarification: false
      };
    }

    // Pattern: Reassign person
    const reassignMatch = inputLower.match(
      /(?:reassign|move|assign)\s+(.+?)\s+to\s+(?:the\s+)?(.+?)(?:\s+position)?$/i
    );
    if (reassignMatch) {
      const personQuery = reassignMatch[1].trim();
      const positionQuery = reassignMatch[2].trim();

      const personResult = findNodeByPersonName(personQuery);
      const positionResult = findNodeByTitle(positionQuery);

      if (!personResult.match && personResult.alternatives.length > 0) {
        return {
          command: null,
          needsClarification: true,
          clarificationMessage: `I found multiple people matching "${personQuery}". Which one did you mean?`,
          clarificationOptions: personResult.alternatives.map(alt => ({
            label: alt.item.employee?.name || '',
            value: alt.item.employee?.name || '',
            id: alt.item.id
          }))
        };
      }

      if (!personResult.match) {
        return {
          command: null,
          needsClarification: false,
          errorMessage: `I couldn't find anyone matching "${personQuery}". Please try again.`
        };
      }

      if (!positionResult.match && positionResult.alternatives.length > 0) {
        return {
          command: null,
          needsClarification: true,
          clarificationMessage: `I found multiple positions matching "${positionQuery}". Which one did you mean?`,
          clarificationOptions: positionResult.alternatives.map(alt => ({
            label: alt.item.position.title,
            value: alt.item.position.title,
            id: alt.item.id
          }))
        };
      }

      if (!positionResult.match) {
        return {
          command: null,
          needsClarification: false,
          errorMessage: `I couldn't find a position matching "${positionQuery}". Please try again.`
        };
      }

      return {
        command: {
          type: 'reassign_person',
          personName: personResult.match.employee!.name,
          personId: personResult.match.employee!.id,
          newPositionTitle: positionResult.match.position.title,
          newPositionId: positionResult.match.id
        },
        needsClarification: false
      };
    }

    return {
      command: null,
      needsClarification: false,
      errorMessage: `I didn't understand that command. Try something like:\n• "Create a new Marketing team under the COO with 3 people"\n• "Add a Product Manager position under the CTO"\n• "Move VP of Sales under the CEO"\n• "Remove the Director of DevOps position"`
    };
  }, [findNodeByTitle, findNodeByPersonName]);

  const generatePreview = useCallback((command: ChatCommand): PreviewState => {
    const preview: PreviewState = {
      pendingNodes: [],
      pendingMoves: [],
      pendingRemovals: [],
      command
    };

    switch (command.type) {
      case 'create_team':
        // Create lead position first
        const leadId = `preview-${Date.now()}-lead`;
        const leadNode: OrgNode = {
          id: leadId,
          position: {
            id: `pos-preview-lead`,
            title: command.positions[0].title,
            description: command.positions[0].description || '',
            requiredSkills: [],
            level: command.positions[0].level,
            department: 'General'
          },
          parentId: command.parentId,
          children: [],
          x: 0,
          y: 0
        };
        preview.pendingNodes.push(leadNode);

        // Create team member positions
        command.positions.slice(1).forEach((pos, i) => {
          const memberId = `preview-${Date.now()}-member-${i}`;
          preview.pendingNodes.push({
            id: memberId,
            position: {
              id: `pos-preview-member-${i}`,
              title: pos.title,
              description: pos.description || '',
              requiredSkills: [],
              level: pos.level,
              department: 'General'
            },
            parentId: leadId,
            children: [],
            x: 0,
            y: 0
          });
        });
        break;

      case 'create_position':
        const newId = `preview-${Date.now()}`;
        preview.pendingNodes.push({
          id: newId,
          position: {
            id: `pos-preview`,
            title: command.position.title,
            description: command.position.description || '',
            requiredSkills: [],
            level: command.position.level,
            department: 'General'
          },
          parentId: command.parentId,
          children: [],
          x: 0,
          y: 0
        });
        break;

      case 'move_node':
        preview.pendingMoves.push({
          nodeId: command.nodeId,
          newParentId: command.newParentId
        });
        break;

      case 'remove_position':
        preview.pendingRemovals.push(command.nodeId);
        break;
    }

    return preview;
  }, []);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, action?: ChatMessage['action']) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
      action
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const sendMessage = useCallback((input: string) => {
    if (!input.trim()) return;

    addMessage('user', input);
    setIsProcessing(true);

    // Handle pending clarification
    if (pendingClarification) {
      const selectedOption = pendingClarification.options.find(
        opt => opt.label.toLowerCase() === input.toLowerCase() || opt.value.toLowerCase() === input.toLowerCase()
      );

      if (selectedOption) {
        // Re-process original command with clarified value
        setPendingClarification(null);
        const result = parseCommand(
          pendingClarification.originalInput.replace(
            new RegExp(pendingClarification.field, 'i'),
            selectedOption.value
          )
        );
        
        if (result.command) {
          const previewState = generatePreview(result.command);
          setPreview(previewState);
          addMessage('assistant', getCommandDescription(result.command) + '\n\nPreview shown on canvas. Click "Apply" to confirm or type to refine.', {
            type: 'preview',
            command: result.command
          });
        }
      } else {
        addMessage('assistant', 'Please select one of the options above or type your command again.');
      }
      setIsProcessing(false);
      return;
    }

    // Parse new command
    setTimeout(() => {
      const result = parseCommand(input);

      if (result.errorMessage) {
        addMessage('assistant', result.errorMessage, { type: 'error', message: result.errorMessage });
      } else if (result.needsClarification && result.clarificationOptions) {
        setPendingClarification({
          originalInput: input,
          field: result.clarificationOptions[0].value,
          options: result.clarificationOptions
        });
        addMessage('assistant', result.clarificationMessage!, {
          type: 'clarification',
          options: result.clarificationOptions.map(opt => ({ label: opt.label, value: opt.value }))
        });
      } else if (result.command) {
        const previewState = generatePreview(result.command);
        setPreview(previewState);
        addMessage('assistant', getCommandDescription(result.command) + '\n\nPreview shown on canvas. Click "Apply" to confirm or type to refine.', {
          type: 'preview',
          command: result.command
        });
      }

      setIsProcessing(false);
    }, 300);
  }, [addMessage, parseCommand, generatePreview, pendingClarification]);

  const handleClarificationSelect = useCallback((option: string) => {
    sendMessage(option);
  }, [sendMessage]);

  const applyPreview = useCallback(() => {
    if (preview?.command) {
      onApplyChanges(preview.command);
      addMessage('assistant', '✓ Changes applied successfully!');
      setPreview(null);
      setPendingClarification(null);
    }
  }, [preview, onApplyChanges, addMessage]);

  const clearPreview = useCallback(() => {
    setPreview(null);
    addMessage('assistant', 'Preview cleared. What would you like to do?');
  }, [addMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setPreview(null);
    setPendingClarification(null);
  }, []);

  return {
    messages,
    isOpen,
    setIsOpen,
    preview,
    isProcessing,
    sendMessage,
    applyPreview,
    clearPreview,
    clearChat,
    handleClarificationSelect,
    pendingClarification
  };
}

function getCommandDescription(command: ChatCommand): string {
  switch (command.type) {
    case 'create_team':
      return `I'll create a "${command.teamName}" team with ${command.positions.length} positions under ${command.parentTitle}:\n• ${command.positions.map(p => p.title).join('\n• ')}`;
    case 'create_position':
      return `I'll add a new "${command.position.title}" position under ${command.parentTitle}.`;
    case 'move_node':
      return `I'll move "${command.nodeTitle}" to report under ${command.newParentTitle}.`;
    case 'remove_position':
      return `I'll remove the "${command.nodeTitle}" position from the org chart.`;
    case 'reassign_person':
      return `I'll reassign ${command.personName} to the ${command.newPositionTitle} position.`;
    default:
      return 'Processing your request...';
  }
}
