export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  toolCalls?: {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }[];
  toolResult?: {
    toolCallId: string;
    success: boolean;
    result: unknown;
  };
}

export interface CategoryInfo {
  id: string;
  label: string;
  color: string;
  visible: boolean;
  expanded: boolean;
  itemCount: number;
  complete: boolean;
}

export interface ItemInfo {
  id: string;
  name: string;
  type?: string;
}

export interface ConnectionInfo {
  fromNodeId: string;
  fromItemId: string;
  toNodeId: string;
  toItemId: string;
  relationshipType: string;
}

export interface GraphAPI {
  // Read operations
  getVisibleNodes: () => Array<{ id: string; label: string; color: string; x: number; y: number }>;
  getAllNodes: () => Array<{ id: string; label: string; color: string }>;
  getNodeItems: (nodeId: string) => ItemInfo[];
  getAllItems: () => Record<string, ItemInfo[]>;
  getConnections: () => ConnectionInfo[];
  getExpandedNodes: () => Set<string>;
  getVisibleNodeIds: () => Record<string, boolean>;
  getConnectionGraph: () => Record<string, Set<string>>;
  getConnectedItems: (startKey: string) => Set<string>;
  getNodeStatus: () => Record<string, { complete: boolean; items: number; required: boolean }>;

  // Mutation operations
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  setNodeVisibility: (nodeId: string, visible: boolean) => void;
  setAllNodesVisibility: (visible: boolean) => void;
  selectPill: (pillKey: string | null) => void;
  setRenderMode: (mode: 'showAll' | 'showOnClick') => void;
  setSearchDepth: (depth: 'allLinks' | 'relevantOnly') => void;
  activatePill: (pillKey: string | null) => void;

  // Navigation operations
  focusOnItem: (nodeId: string, itemId: string, zoom?: number) => void;
  focusOnNode: (nodeId: string, zoom?: number) => void;
  resetView: () => void;
}

export interface AgentHighlights {
  pills: Set<string>;
  connections: Set<number>;
}

export interface AgentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  graphAPI: GraphAPI;
  highlights: AgentHighlights;
  onHighlightsChange: (highlights: AgentHighlights) => void;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  systemPrompt?: string;
}
