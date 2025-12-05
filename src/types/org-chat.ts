import { OrgNode, Position } from './org-builder';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: ChatAction;
}

export type ChatAction =
  | { type: 'preview'; command: ChatCommand }
  | { type: 'clarification'; options: ClarificationOption[] }
  | { type: 'error'; message: string };

export interface ClarificationOption {
  label: string;
  value: string;
}

export type ChatCommand =
  | CreateTeamCommand
  | CreatePositionCommand
  | MoveNodeCommand
  | RemovePositionCommand
  | ReassignPersonCommand;

export interface CreateTeamCommand {
  type: 'create_team';
  parentTitle: string;
  parentId: string;
  teamName: string;
  positions: NewPositionData[];
}

export interface CreatePositionCommand {
  type: 'create_position';
  parentTitle: string;
  parentId: string;
  position: NewPositionData;
}

export interface MoveNodeCommand {
  type: 'move_node';
  nodeTitle: string;
  nodeId: string;
  newParentTitle: string;
  newParentId: string;
}

export interface RemovePositionCommand {
  type: 'remove_position';
  nodeTitle: string;
  nodeId: string;
}

export interface ReassignPersonCommand {
  type: 'reassign_person';
  personName: string;
  personId: string;
  newPositionTitle: string;
  newPositionId: string;
}

export interface NewPositionData {
  title: string;
  level: number;
  description?: string;
}

export interface PreviewState {
  pendingNodes: OrgNode[];
  pendingMoves: { nodeId: string; newParentId: string }[];
  pendingRemovals: string[];
  command: ChatCommand | null;
}
