import {
  Input,
  Outcome,
  Constraint,
  Objective,
  Calculation,
  Supplier,
  Competitor,
  Packaging,
  Formulation,
  ManufacturingSite,
  DistributionChannel,
} from '../data/demoLibrary';

// Connection between two items across different node types
export interface ItemConnection {
  fromNodeId: string;
  fromItemId: string;
  toNodeId: string;
  toItemId: string;
  relationshipType: string;
}

// Full data for all node types, used by the detail sidebar
export interface FullNodeData {
  inputs: Input[];
  outcomes: Outcome[];
  constraints: Constraint[];
  objectives: Objective[];
  calculations: Calculation[];
  suppliers: Supplier[];
  competitors: Competitor[];
  packaging: Packaging[];
  formulations: Formulation[];
  manufacturingSites: ManufacturingSite[];
  distributionChannels: DistributionChannel[];
}

// Node type identifiers matching the graph view
export type NodeTypeId =
  | 'inputs'
  | 'outcomes'
  | 'constraints'
  | 'objectives'
  | 'calculations'
  | 'suppliers'
  | 'competitors'
  | 'packaging'
  | 'data'
  | 'manufacturingSites'
  | 'distributionChannels';

// Union type for any node data item
export type NodeDataItem =
  | Input
  | Outcome
  | Constraint
  | Objective
  | Calculation
  | Supplier
  | Competitor
  | Packaging
  | Formulation
  | ManufacturingSite
  | DistributionChannel;

// Props for the main NodeDetailSidebar component
export interface NodeDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPillId: string | null; // format: "nodeType-item-index" e.g., "inputs-item-0"
  fullNodeData: FullNodeData;
  connections: ItemConnection[];
  nodeItems: Record<string, { id: string; name: string; type?: string }[]>;
  onNavigateToPill?: (pillKey: string) => void;
}

// Props for individual detail panels
export interface DetailPanelProps<T> {
  item: T;
  theme: {
    text: string;
    textSecondary: string;
    textMuted: string;
    textTertiary: string;
    cardBg: string;
    border: string;
    borderLight: string;
    inputBg: string;
  };
  nodeColor: string;
}

// Props for the connections panel
export interface ConnectionsPanelProps {
  connections: ItemConnection[];
  selectedNodeId: string;
  selectedItemId: string;
  nodeItems: Record<string, { id: string; name: string; type?: string }[]>;
  fullNodeData: FullNodeData;
  onNavigate?: (pillKey: string) => void;
  theme: {
    text: string;
    textSecondary: string;
    textMuted: string;
    textTertiary: string;
    cardBg: string;
    border: string;
    borderLight: string;
    inputBg: string;
  };
}

// Helper to parse pill ID into node type and item ID
export function parsePillId(pillId: string): { nodeType: NodeTypeId; itemId: string } | null {
  // Format: "nodeType-itemId" e.g., "inputs-input-1", "outcomes-outcome-3"
  const nodeTypes: NodeTypeId[] = [
    'inputs', 'outcomes', 'constraints', 'objectives', 'calculations',
    'suppliers', 'competitors', 'packaging', 'data',
    'manufacturingSites', 'distributionChannels'
  ];

  for (const nodeType of nodeTypes) {
    if (pillId.startsWith(nodeType + '-')) {
      const itemId = pillId.slice(nodeType.length + 1);
      return { nodeType, itemId };
    }
  }
  return null;
}

// Helper to get item data from fullNodeData based on node type and item ID
export function getItemFromFullData(
  nodeType: NodeTypeId,
  itemId: string,
  fullNodeData: FullNodeData
): NodeDataItem | null {
  const dataMap: Record<NodeTypeId, NodeDataItem[]> = {
    inputs: fullNodeData.inputs,
    outcomes: fullNodeData.outcomes,
    constraints: fullNodeData.constraints,
    objectives: fullNodeData.objectives,
    calculations: fullNodeData.calculations,
    suppliers: fullNodeData.suppliers,
    competitors: fullNodeData.competitors,
    packaging: fullNodeData.packaging,
    data: fullNodeData.formulations,
    manufacturingSites: fullNodeData.manufacturingSites,
    distributionChannels: fullNodeData.distributionChannels,
  };

  const items = dataMap[nodeType];
  if (!items) return null;

  return items.find((item) => item.id === itemId) || null;
}

// Node colors for consistent styling
export const NODE_COLORS: Record<NodeTypeId, { dark: string; light: string }> = {
  inputs: { dark: '#2DD4BF', light: '#0f766e' },
  outcomes: { dark: '#F472B6', light: '#be185d' },
  calculations: { dark: '#A78BFA', light: '#6d28d9' },
  constraints: { dark: '#FB923C', light: '#c2410c' },
  objectives: { dark: '#60A5FA', light: '#1d4ed8' },
  competitors: { dark: '#EC4899', light: '#be185d' },
  packaging: { dark: '#8B5CF6', light: '#6d28d9' },
  data: { dark: '#14B8A6', light: '#0f766e' },
  manufacturingSites: { dark: '#F59E0B', light: '#d97706' },
  suppliers: { dark: '#D946EF', light: '#a21caf' },
  distributionChannels: { dark: '#6366F1', light: '#4f46e5' },
};

// Human-readable labels for node types
export const NODE_LABELS: Record<NodeTypeId, string> = {
  inputs: 'Input',
  outcomes: 'Outcome',
  calculations: 'Calculation',
  constraints: 'Constraint',
  objectives: 'Objective',
  competitors: 'Competitor',
  packaging: 'Packaging',
  data: 'Formulation',
  manufacturingSites: 'Mfg Site',
  suppliers: 'Supplier',
  distributionChannels: 'Distribution',
};
