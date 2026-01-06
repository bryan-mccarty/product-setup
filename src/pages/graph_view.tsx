import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface NodeStatus {
  complete: boolean;
  items: number;
  required: boolean;
}

interface NodeItem {
  id: string;
  name: string;
  type?: string;
}

// Connection between two items across different node types
interface ItemConnection {
  fromNodeId: string;  // e.g., 'inputs'
  fromItemId: string;  // e.g., 'input-2' (Sugar)
  toNodeId: string;    // e.g., 'constraints'
  toItemId: string;    // e.g., 'con-1' (Sugar constraint)
  relationshipType: string; // e.g., 'constrained_by', 'used_in', 'supplies'
}

interface GraphViewProps {
  categoryName: string;
  nodeStatus: Record<string, NodeStatus>;
  nodeItems?: Record<string, NodeItem[]>;
  connections?: ItemConnection[];
  onNodeClick: (nodeId: string) => void;
}

// All possible node definitions
const ALL_NODES = [
  { id: 'inputs', label: 'Inputs', color: '#2DD4BF', description: 'View and manage inputs' },
  { id: 'outcomes', label: 'Outcomes', color: '#F472B6', description: 'View and manage outcomes' },
  { id: 'combinations', label: 'Combinations', color: '#A78BFA', description: 'View combinations' },
  { id: 'constraints', label: 'Constraints', color: '#FB923C', description: 'View constraints' },
  { id: 'objectives', label: 'Objectives', color: '#60A5FA', description: 'View objectives' },
  { id: 'competitors', label: 'Competitors', color: '#EC4899', description: 'View competitors' },
  { id: 'packaging', label: 'Packaging', color: '#8B5CF6', description: 'View packaging options' },
  { id: 'data', label: 'Data', color: '#14B8A6', description: 'View data sources' },
  { id: 'manufacturingSites', label: 'Mfg Sites', color: '#F59E0B', description: 'View manufacturing sites' },
  { id: 'suppliers', label: 'Suppliers', color: '#10B981', description: 'View suppliers' },
  { id: 'distributionChannels', label: 'Distribution', color: '#6366F1', description: 'View distribution channels' },
];

const DEFAULT_VISIBILITY: Record<string, boolean> = {
  inputs: true,
  outcomes: true,
  combinations: true,
  constraints: true,
  objectives: true,
  competitors: false,
  packaging: false,
  data: false,
  manufacturingSites: false,
  suppliers: false,
  distributionChannels: false,
};

// Canvas constants
const WORLD_SIZE = 4000;
const WORLD_CENTER = WORLD_SIZE / 2; // 2000

const GraphView: React.FC<GraphViewProps> = ({
  categoryName,
  nodeStatus,
  nodeItems = {},
  connections = [],
  onNodeClick,
}) => {
  const { theme } = useTheme();
  const viewportRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Pill drag state: tracks offset from calculated position for each item
  const [pillDragOffsets, setPillDragOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingPill, setDraggingPill] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Pill measured widths for accurate connection edge calculations
  const [pillWidths, setPillWidths] = useState<Record<string, number>>({});

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');

  // Hover state
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Node visibility state with localStorage persistence
  const [visibleNodes, setVisibleNodes] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('graphVisibleNodes');
      return stored ? JSON.parse(stored) : DEFAULT_VISIBILITY;
    } catch {
      return DEFAULT_VISIBILITY;
    }
  });

  // Visibility menu state
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  // Expanded nodes state (for showing items in outer ring)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Connection mode state
  const [connectionMode, setConnectionMode] = useState<'all' | 'onClick'>('onClick');
  const [selectedPillId, setSelectedPillId] = useState<string | null>(null);
  const [showConnectionMenu, setShowConnectionMenu] = useState(false);

  // Minimap interaction state
  const [minimapHovered, setMinimapHovered] = useState(false);
  const [minimapDragging, setMinimapDragging] = useState(false);
  const minimapRef = useRef<SVGSVGElement>(null);

  // Persist visibility to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('graphVisibleNodes', JSON.stringify(visibleNodes));
    } catch {
      // Silently fail
    }
  }, [visibleNodes]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowVisibilityMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize pan offset to center the graph in viewport
  useEffect(() => {
    if (viewportRef.current && !isInitialized) {
      const { width, height } = viewportRef.current.getBoundingClientRect();
      setPanOffset({
        x: width / 2 - WORLD_CENTER,
        y: height / 2 - WORLD_CENTER,
      });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Handle window resize to keep centered
  useEffect(() => {
    const handleResize = () => {
      // Optionally recenter on resize - for now we'll leave pan position alone
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic positions for visible nodes with dynamic node sizing
  const nodesWithPositions = useMemo(() => {
    const visibleNodesList = ALL_NODES.filter(n => visibleNodes[n.id]);
    const nodeCount = visibleNodesList.length;

    // Fixed radius - keep the graph the same size
    const radius = 160;

    // Dynamic node size: shrink nodes when more are visible
    // Base: 100px for 5 or fewer nodes, shrinks for more
    const baseNodeSize = 100;
    const minNodeSize = 60;
    const nodeSize = nodeCount <= 5
      ? baseNodeSize
      : Math.max(minNodeSize, baseNodeSize - (nodeCount - 5) * 8);

    const angleOffset = -Math.PI / 2; // Start from top

    return visibleNodesList.map((node, index) => {
      const angle = angleOffset + (2 * Math.PI / nodeCount) * index;
      return {
        ...node,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        angle,
        nodeSize, // Dynamic node size
      };
    });
  }, [visibleNodes]);

  const NodeIcon = ({ id, color, size = 28 }: { id: string; color: string; size?: number }) => {
    const iconStyle = { width: size, height: size, color };

    switch(id) {
      case 'inputs':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        );
      case 'outcomes':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        );
      case 'combinations':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        );
      case 'constraints':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case 'objectives':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'competitors':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'packaging':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        );
      case 'data':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
        );
      case 'manufacturingSites':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 20h20" />
            <path d="M5 20V8l5-4v4l5-4v16" />
            <path d="M15 20v-8h5v8" />
          </svg>
        );
      case 'suppliers':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        );
      case 'distributionChannels':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="2" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
          </svg>
        );
      default:
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  // Get node status with fallback
  const getStatus = (nodeId: string): NodeStatus => {
    return nodeStatus[nodeId] || { complete: false, items: 0, required: false };
  };

  // Filter nodes based on search and filter
  const getNodeOpacity = (nodeId: string) => {
    const status = getStatus(nodeId);

    if (searchQuery) {
      const node = ALL_NODES.find(n => n.id === nodeId);
      if (!node?.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        return 0.2;
      }
    }

    if (filterStatus === 'complete' && !status.complete) return 0.2;
    if (filterStatus === 'incomplete' && status.complete) return 0.2;

    return 1;
  };

  // Toggle node visibility
  const toggleNodeVisibility = (nodeId: string) => {
    setVisibleNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Show/hide all nodes
  const setAllNodesVisibility = (visible: boolean) => {
    const newVisibility: Record<string, boolean> = {};
    ALL_NODES.forEach(node => { newVisibility[node.id] = visible; });
    setVisibleNodes(newVisibility);
  };

  // Toggle node expansion
  const toggleNodeExpansion = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  // Zoom helper - preserves the viewport center point
  const zoomTo = useCallback((newZoom: number) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      setZoom(newZoom);
      return;
    }

    const { width, height } = viewport.getBoundingClientRect();
    const centerX = width / 2;
    const centerY = height / 2;

    // Point in world space that's currently at viewport center
    const worldX = (centerX - panOffset.x) / zoom;
    const worldY = (centerY - panOffset.y) / zoom;

    // Adjust pan so that same world point stays at viewport center after zoom
    const newPanX = centerX - worldX * newZoom;
    const newPanY = centerY - worldY * newZoom;

    setZoom(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  }, [zoom, panOffset]);

  // Zoom handlers - expanded range for larger canvas
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(3.0, Math.max(0.2, zoom + delta));
    zoomTo(newZoom);
  };

  const handleZoomIn = () => zoomTo(Math.min(3.0, zoom + 0.2));
  const handleZoomOut = () => zoomTo(Math.max(0.2, zoom - 0.2));
  
  // Reset to centered view
  const handleZoomReset = useCallback(() => {
    setZoom(1);
    if (viewportRef.current) {
      const { width, height } = viewportRef.current.getBoundingClientRect();
      setPanOffset({
        x: width / 2 - WORLD_CENTER,
        y: height / 2 - WORLD_CENTER,
      });
    }
  }, []);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start panning if clicking on the background
    const target = e.target as HTMLElement;
    if (target === viewportRef.current || 
        target.tagName === 'svg' || 
        target.closest('[data-pannable="true"]')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Minimap click/drag handlers
  const handleMinimapMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setMinimapDragging(true);
    handleMinimapNavigation(e);
  };

  const handleMinimapMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (minimapDragging) {
      handleMinimapNavigation(e);
    }
  };

  const handleMinimapMouseUp = () => {
    setMinimapDragging(false);
  };

  const handleMinimapNavigation = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = minimapRef.current;
    const viewport = viewportRef.current;
    if (!svg || !viewport) return;

    const svgRect = svg.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();

    // Get click position relative to SVG element (0-1 range)
    const clickX = (e.clientX - svgRect.left) / svgRect.width;
    const clickY = (e.clientY - svgRect.top) / svgRect.height;

    // Calculate dynamic viewBox dimensions (must match what's rendered)
    const minSize = 2000;
    const dynamicWidth = Math.max(minSize, contentBounds.width);
    const dynamicHeight = Math.max(minSize, contentBounds.height);
    const viewBoxX = WORLD_CENTER - dynamicWidth / 2;
    const viewBoxY = WORLD_CENTER - dynamicHeight / 2;

    // Convert click to world coordinates
    const worldX = viewBoxX + clickX * dynamicWidth;
    const worldY = viewBoxY + clickY * dynamicHeight;

    // Calculate pan offset to center viewport on clicked world point
    const newPanX = viewportRect.width / 2 - worldX * zoom;
    const newPanY = viewportRect.height / 2 - worldY * zoom;

    setPanOffset({ x: newPanX, y: newPanY });
  };

  // Global mouse up for minimap dragging
  useEffect(() => {
    const handleGlobalMinimapMouseUp = () => setMinimapDragging(false);
    window.addEventListener('mouseup', handleGlobalMinimapMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMinimapMouseUp);
  }, []);

  // Completion stats
  const visibleNodeIds = nodesWithPositions.map(n => n.id);
  const completedCount = visibleNodeIds.filter(id => getStatus(id).complete).length;
  const totalVisibleNodes = visibleNodeIds.length;

  // Calculate item positions as a cloud around the parent node
  // Returns positions with drag offsets applied
  const getItemPositions = (parentNode: typeof nodesWithPositions[0], items: NodeItem[]) => {
    const maxVisibleItems = 8;
    const itemsToShow = items.slice(0, maxVisibleItems);
    const hasMore = items.length > maxVisibleItems;

    const parentAngle = parentNode.angle;
    const nodeHalfSize = parentNode.nodeSize / 2;

    // Edge point: outer edge of parent node in the outward direction
    const edgeX = parentNode.x + Math.cos(parentAngle) * nodeHalfSize;
    const edgeY = parentNode.y + Math.sin(parentAngle) * nodeHalfSize;

    // Unit vectors for local coordinate system
    const outwardX = Math.cos(parentAngle);  // Points away from graph center
    const outwardY = Math.sin(parentAngle);
    const perpX = -Math.sin(parentAngle);    // Points 90° counterclockwise (for spread)
    const perpY = Math.cos(parentAngle);

    // Layout slots: {spread, dist}
    // spread = perpendicular offset (negative=left, positive=right)
    // dist = distance outward from edge (always positive)
    const SLOTS = [
      { spread: -70, dist: 35 },   // Row 1: left
      { spread: 0,   dist: 30 },   // Row 1: center
      { spread: 70,  dist: 35 },   // Row 1: right
      { spread: -105, dist: 65 },  // Row 2: far-left
      { spread: -35, dist: 60 },   // Row 2: mid-left
      { spread: 35,  dist: 60 },   // Row 2: mid-right
      { spread: 105, dist: 65 },   // Row 2: far-right
      { spread: 0,   dist: 90 },   // Row 3: center (for 8th item)
    ];

    const positions = itemsToShow.map((item, index) => {
      const slot = SLOTS[index];
      const baseX = edgeX + (perpX * slot.spread) + (outwardX * slot.dist);
      const baseY = edgeY + (perpY * slot.spread) + (outwardY * slot.dist);
      // Apply drag offset if exists
      const dragKey = `${parentNode.id}-${item.id}`;
      const offset = pillDragOffsets[dragKey] || { x: 0, y: 0 };
      return {
        ...item,
        x: baseX + offset.x,
        y: baseY + offset.y,
        dragKey, // Used for drag state and connection lookup
        parentNodeId: parentNode.id,
      };
    });

    if (hasMore) {
      positions.push({
        id: 'more',
        name: `+${items.length - maxVisibleItems}`,
        x: edgeX + (outwardX * 115),
        y: edgeY + (outwardY * 115),
        dragKey: `${parentNode.id}-more`,
        parentNodeId: parentNode.id,
      });
    }

    return positions;
  };

  // Get all visible item positions for connection rendering
  const allItemPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; nodeId: string; itemId: string; color: string; width: number }> = {};

    nodesWithPositions.forEach(node => {
      if (!expandedNodes.has(node.id)) return;
      const items = nodeItems[node.id] || [];
      const itemPositions = getItemPositions(node, items);

      itemPositions.forEach(item => {
        if (item.id !== 'more') {
          const dragKey = `${node.id}-${item.id}`;
          positions[dragKey] = {
            x: item.x,
            y: item.y,
            nodeId: node.id,
            itemId: item.id,
            color: node.color,
            width: pillWidths[dragKey] || 50, // fallback to minWidth
          };
        }
      });
    });

    return positions;
  }, [nodesWithPositions, expandedNodes, nodeItems, pillDragOffsets, pillWidths]);

  // Filter connections to only show when both nodes are expanded
  const visibleConnections = useMemo(() => {
    return connections.filter(conn =>
      expandedNodes.has(conn.fromNodeId) && expandedNodes.has(conn.toNodeId)
    );
  }, [connections, expandedNodes]);

  // Build bidirectional connection graph
  const connectionGraph = useMemo(() => {
    const graph: Record<string, Set<string>> = {};
    connections.forEach(conn => {
      const fromKey = `${conn.fromNodeId}-${conn.fromItemId}`;
      const toKey = `${conn.toNodeId}-${conn.toItemId}`;
      if (!graph[fromKey]) graph[fromKey] = new Set();
      if (!graph[toKey]) graph[toKey] = new Set();
      graph[fromKey].add(toKey);
      graph[toKey].add(fromKey);
    });
    return graph;
  }, [connections]);

  // DFS traversal to get all connected items
  const getConnectedItems = useCallback((startKey: string): Set<string> => {
    const visited = new Set<string>();
    const stack = [startKey];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = connectionGraph[current] || new Set();
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) stack.push(neighbor);
      });
    }

    return visited;
  }, [connectionGraph]);

  // Determine which connections to render based on mode
  const connectionsToRender = useMemo(() => {
    if (connectionMode === 'all') {
      return visibleConnections;
    }

    if (connectionMode === 'onClick' && selectedPillId) {
      const connectedSet = getConnectedItems(selectedPillId);
      const collapsedNodeLinks = new Set<string>(); // Deduplicate parent node connections

      return connections.filter(conn => {
        const fromKey = `${conn.fromNodeId}-${conn.fromItemId}`;
        const toKey = `${conn.toNodeId}-${conn.toItemId}`;

        // Must involve selected pill or its connections
        if (!connectedSet.has(fromKey) && !connectedSet.has(toKey)) {
          return false;
        }

        const fromExpanded = expandedNodes.has(conn.fromNodeId);
        const toExpanded = expandedNodes.has(conn.toNodeId);

        // Both expanded: show pill-to-pill connection
        if (fromExpanded && toExpanded) return true;

        // One collapsed: show pill-to-parent connection (deduplicated)
        if (fromExpanded && !toExpanded) {
          const linkKey = `${fromKey}-${conn.toNodeId}`;
          if (collapsedNodeLinks.has(linkKey)) return false;
          collapsedNodeLinks.add(linkKey);
          return true;
        }
        if (!fromExpanded && toExpanded) {
          const linkKey = `${conn.fromNodeId}-${toKey}`;
          if (collapsedNodeLinks.has(linkKey)) return false;
          collapsedNodeLinks.add(linkKey);
          return true;
        }

        return false;
      });
    }

    return [];
  }, [connectionMode, selectedPillId, connections, expandedNodes, visibleConnections, getConnectedItems]);

  // Pill drag handlers
  const handlePillMouseDown = (e: React.MouseEvent, dragKey: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingPill(dragKey);
    const currentOffset = pillDragOffsets[dragKey] || { x: 0, y: 0 };
    setDragStart({
      x: e.clientX / zoom - currentOffset.x,
      y: e.clientY / zoom - currentOffset.y
    });
  };

  const handlePillMouseMove = (e: React.MouseEvent) => {
    if (!draggingPill) return;
    const newX = e.clientX / zoom - dragStart.x;
    const newY = e.clientY / zoom - dragStart.y;
    setPillDragOffsets(prev => ({
      ...prev,
      [draggingPill]: { x: newX, y: newY }
    }));
  };

  const handlePillMouseUp = () => {
    setDraggingPill(null);
  };

  // Global mouse up for pill dragging
  useEffect(() => {
    const handleGlobalPillMouseUp = () => setDraggingPill(null);
    window.addEventListener('mouseup', handleGlobalPillMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalPillMouseUp);
  }, []);

  // Intersection detection: check if line segment intersects circle
  const doesLineIntersectCircle = (
    x1: number, y1: number, x2: number, y2: number,
    cx: number, cy: number, radius: number
  ): boolean => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - cx;
    const fy = y1 - cy;

    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - radius * radius;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return false;

    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);

    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
  };

  // Calculate right-angle path that avoids center node
  const calculateRightAnglePath = (
    x1: number, y1: number, x2: number, y2: number,
    centerX: number, centerY: number, avoidRadius: number
  ): { x: number; y: number }[] => {
    // Check if direct line intersects center
    if (!doesLineIntersectCircle(x1, y1, x2, y2, centerX, centerY, avoidRadius)) {
      return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    }

    // Route around center with right angles
    // Simple heuristic: route horizontally first, then vertically
    const midX = (x1 + x2) / 2;

    return [
      { x: x1, y: y1 },
      { x: midX, y: y1 },  // Horizontal waypoint
      { x: midX, y: y2 },  // Vertical waypoint
      { x: x2, y: y2 }
    ];
  };

  // Calculate the edge point of a pill where a line from center to another point exits
  // Pill: width W, height H=20, borderRadius = H/2 = 10 (semicircle caps)
  // Flat top/bottom edges run from x = -(W/2 - 10) to x = +(W/2 - 10)
  // Left semicircle centered at x = -(W/2 - 10), right at x = +(W/2 - 10)
  const calculatePillEdgePoint = (
    pillCenterX: number, 
    pillCenterY: number, 
    otherX: number, 
    otherY: number,
    pillWidth: number = 60,
    pillHeight: number = 20
  ): { x: number; y: number } => {
    const dx = otherX - pillCenterX;
    const dy = otherY - pillCenterY;
    
    if (dx === 0 && dy === 0) {
      return { x: pillCenterX, y: pillCenterY };
    }

    const halfWidth = pillWidth / 2;
    const halfHeight = pillHeight / 2; // 10
    const borderRadius = halfHeight;   // 10
    
    // The flat edges span this x range (relative to pill center)
    const flatEdgeHalfWidth = halfWidth - borderRadius;

    // Normalize direction
    const length = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / length;
    const dirY = dy / length;

    // Try intersection with top edge (y = +halfHeight) or bottom edge (y = -halfHeight)
    if (Math.abs(dirY) > 0.0001) {
      // Which edge? Top if going up (dirY > 0), bottom if going down
      const edgeY = dirY > 0 ? halfHeight : -halfHeight;
      const t = edgeY / dirY; // parameter along ray where y = edgeY
      
      if (t > 0) {
        const intersectX = dirX * t;
        // Check if within the flat portion
        if (Math.abs(intersectX) <= flatEdgeHalfWidth) {
          return {
            x: pillCenterX + intersectX,
            y: pillCenterY + edgeY
          };
        }
      }
    }

    // Must exit through a semicircle cap
    // Which side? Right if dx > 0, left if dx < 0
    const semicircleCenterXOffset = dx > 0 ? flatEdgeHalfWidth : -flatEdgeHalfWidth;
    const scCenterX = pillCenterX + semicircleCenterXOffset;
    const scCenterY = pillCenterY;

    // Ray from pill center: P(t) = pillCenter + t * dir
    // Circle: |P - scCenter|² = borderRadius²
    // Substitute: |pillCenter + t*dir - scCenter|² = r²
    // Let v = pillCenter - scCenter = (-semicircleCenterXOffset, 0)
    // |v + t*dir|² = r²
    // (vx + t*dirX)² + (vy + t*dirY)² = r²
    // t²(dirX² + dirY²) + 2t(vx*dirX + vy*dirY) + (vx² + vy²) - r² = 0
    // Since |dir| = 1: t² + 2t(vx*dirX + vy*dirY) + (vx² + vy² - r²) = 0
    
    const vx = -semicircleCenterXOffset;
    const vy = 0;
    
    const a = 1;
    const b = 2 * (vx * dirX + vy * dirY);
    const c = vx * vx + vy * vy - borderRadius * borderRadius;
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) {
      // Fallback: shouldn't happen
      return {
        x: scCenterX + (dx > 0 ? borderRadius : -borderRadius),
        y: scCenterY
      };
    }
    
    const sqrtDisc = Math.sqrt(discriminant);
    const t1 = (-b - sqrtDisc) / 2;
    const t2 = (-b + sqrtDisc) / 2;
    
    // We want the positive t that's an exit point (farther from center)
    // Since pill center may be inside or outside the semicircle region,
    // take the larger positive t
    const t = Math.max(t1, t2);
    
    if (t <= 0) {
      // Fallback
      return {
        x: scCenterX + (dx > 0 ? borderRadius : -borderRadius),
        y: scCenterY
      };
    }
    
    return {
      x: pillCenterX + t * dirX,
      y: pillCenterY + t * dirY
    };
  };

  // Calculate content bounds for minimap
  const contentBounds = useMemo(() => {
    let minX = -200, minY = -200, maxX = 200, maxY = 200; // Minimum bounds around center

    // Include all parent nodes
    nodesWithPositions.forEach(node => {
      const halfSize = node.nodeSize / 2 + 20;
      minX = Math.min(minX, node.x - halfSize);
      maxX = Math.max(maxX, node.x + halfSize);
      minY = Math.min(minY, node.y - halfSize);
      maxY = Math.max(maxY, node.y + halfSize);
    });

    // Include all pills (with drag offsets)
    Object.values(allItemPositions).forEach(pos => {
      minX = Math.min(minX, pos.x - 60);
      maxX = Math.max(maxX, pos.x + 60);
      minY = Math.min(minY, pos.y - 30);
      maxY = Math.max(maxY, pos.y + 30);
    });

    // Add padding
    const padding = 100;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [nodesWithPositions, allItemPositions]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      background: theme.background,
    }}>
      <style>{`
        @keyframes nodeAppear {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .node-position-transition {
          transition: left 0.4s ease-out, top 0.4s ease-out, transform 0.2s ease;
        }
      `}</style>

      {/* Search/Filter Bar - Top center overlay (FLOATING) */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 100,
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(12px)',
        padding: '10px 16px',
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{ position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            style={{
              width: '180px',
              padding: '8px 10px 8px 32px',
              fontSize: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              color: theme.text,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'complete', 'incomplete'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 500,
                background: filterStatus === status ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                color: filterStatus === status ? '#2DD4BF' : theme.textTertiary,
                border: filterStatus === status ? '1px solid rgba(45, 212, 191, 0.3)' : `1px solid ${theme.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Top-right controls: Connections + Nodes side by side */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '8px',
        zIndex: 100,
      }}>
        {/* Connection toggle menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowConnectionMenu(!showConnectionMenu)}
            style={{
              padding: '10px 14px',
              background: 'rgba(10, 10, 15, 0.9)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              color: theme.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            ⚡ Connections
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showConnectionMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showConnectionMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'rgba(10, 10, 15, 0.98)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              padding: '8px',
              minWidth: '160px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              animation: 'fadeIn 0.15s ease-out',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                color: theme.text,
                borderRadius: '6px',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <input
                  type="radio"
                  checked={connectionMode === 'all'}
                  onChange={() => setConnectionMode('all')}
                  style={{ cursor: 'pointer' }}
                />
                Show All
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                color: theme.text,
                borderRadius: '6px',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <input
                  type="radio"
                  checked={connectionMode === 'onClick'}
                  onChange={() => setConnectionMode('onClick')}
                  style={{ cursor: 'pointer' }}
                />
                Show on Click
              </label>
            </div>
          )}
        </div>

        {/* Visibility Menu (Nodes) */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            style={{
              padding: '10px 14px',
              background: 'rgba(10, 10, 15, 0.9)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              color: theme.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Nodes
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showVisibilityMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showVisibilityMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'rgba(10, 10, 15, 0.98)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              padding: '8px 0',
              minWidth: '180px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              animation: 'fadeIn 0.15s ease-out',
            }}>
              <div style={{ padding: '6px 12px 8px', fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Core Nodes
              </div>
              {ALL_NODES.slice(0, 5).map(node => (
                <label
                  key={node.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={visibleNodes[node.id]}
                    onChange={() => toggleNodeVisibility(node.id)}
                    style={{ accentColor: node.color }}
                  />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: node.color }} />
                  <span style={{ fontSize: '12px', color: theme.text }}>{node.label}</span>
                </label>
              ))}

              <div style={{ height: '1px', background: theme.border, margin: '8px 0' }} />

              <div style={{ padding: '6px 12px 8px', fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Additional Nodes
              </div>
              {ALL_NODES.slice(5).map(node => (
                <label
                  key={node.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={visibleNodes[node.id]}
                    onChange={() => toggleNodeVisibility(node.id)}
                    style={{ accentColor: node.color }}
                  />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: node.color }} />
                  <span style={{ fontSize: '12px', color: theme.text }}>{node.label}</span>
                </label>
              ))}

              <div style={{ height: '1px', background: theme.border, margin: '8px 0' }} />

              <div style={{ display: 'flex', gap: '8px', padding: '8px 12px' }}>
                <button
                  onClick={() => setAllNodesVisibility(true)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '10px',
                    fontWeight: 500,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '4px',
                    color: theme.textSecondary,
                    cursor: 'pointer',
                  }}
                >
                  Show All
                </button>
                <button
                  onClick={() => setAllNodesVisibility(false)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '10px',
                    fontWeight: 500,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '4px',
                    color: theme.textSecondary,
                    cursor: 'pointer',
                  }}
                >
                  Hide All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls - Bottom right (FIXED to viewport) */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '394px', // 374px panel width + 20px margin
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 100,
      }}>
        <div style={{
          background: 'rgba(10, 10, 15, 0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: '10px',
          border: `1px solid ${theme.border}`,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <button onClick={handleZoomIn} style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 300 }}>+</button>
          <div style={{ textAlign: 'center', fontSize: '10px', color: theme.textTertiary, fontFamily: "'JetBrains Mono', monospace", padding: '4px 0' }}>{Math.round(zoom * 100)}%</div>
          <button onClick={handleZoomOut} style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 300 }}>−</button>
        </div>
        <button onClick={handleZoomReset} style={{ padding: '8px 12px', background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(12px)', border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.textSecondary, cursor: 'pointer', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reset</button>
      </div>

      {/* Mini-map - Bottom left (FIXED to viewport, expands on hover, click/drag to navigate) */}
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: minimapHovered ? '200px' : '120px',
          height: minimapHovered ? '200px' : '120px',
          background: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '10px',
          border: `1px solid ${minimapHovered ? 'rgba(45, 212, 191, 0.4)' : theme.border}`,
          overflow: 'hidden',
          zIndex: 100,
          transition: 'width 0.2s ease-out, height 0.2s ease-out, border-color 0.2s ease-out',
          cursor: minimapDragging ? 'grabbing' : 'pointer',
        }}
        onMouseEnter={() => setMinimapHovered(true)}
        onMouseLeave={() => {
          setMinimapHovered(false);
          setMinimapDragging(false);
        }}
      >
        {(() => {
          // Calculate dynamic viewBox with 2000x2000 minimum
          const minSize = 2000;
          const dynamicWidth = Math.max(minSize, contentBounds.width);
          const dynamicHeight = Math.max(minSize, contentBounds.height);
          
          // Center the viewBox around world center, ensuring minimum size
          const viewBoxX = WORLD_CENTER - dynamicWidth / 2;
          const viewBoxY = WORLD_CENTER - dynamicHeight / 2;
          
          // Scale factor for stroke widths based on viewBox size
          const minimapSize = minimapHovered ? 200 : 120;
          const scaleFactor = dynamicWidth / minimapSize;
          
          return (
            <svg 
              ref={minimapRef}
              width={minimapSize}
              height={minimapSize}
              viewBox={`${viewBoxX} ${viewBoxY} ${dynamicWidth} ${dynamicHeight}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ 
                display: 'block',
                transition: 'width 0.2s ease-out, height 0.2s ease-out',
              }}
              onMouseDown={handleMinimapMouseDown}
              onMouseMove={handleMinimapMouseMove}
              onMouseUp={handleMinimapMouseUp}
            >
              {/* Center indicator */}
              <circle 
                cx={WORLD_CENTER} 
                cy={WORLD_CENTER} 
                r={Math.max(30, dynamicWidth / 50)} 
                fill="rgba(45, 212, 191, 0.3)" 
                stroke="rgba(45, 212, 191, 0.6)" 
                strokeWidth={Math.max(2, scaleFactor / 10)} 
              />

              {/* Parent nodes */}
              {nodesWithPositions.map((node) => {
                const status = getStatus(node.id);
                const isExpanded = expandedNodes.has(node.id);

                return (
                  <React.Fragment key={node.id}>
                    <circle
                      cx={WORLD_CENTER + node.x}
                      cy={WORLD_CENTER + node.y}
                      r={Math.max(node.nodeSize / 3, dynamicWidth / 80)}
                      fill={status.complete ? '#22C55E' : '#3f3f46'}
                      opacity={getNodeOpacity(node.id)}
                    />
                    {/* Show expanded items as tiny dots */}
                    {isExpanded && (nodeItems[node.id] || []).slice(0, 8).map((item, idx) => {
                      const itemPos = allItemPositions[`${node.id}-${item.id}`];
                      if (!itemPos) return null;
                      return (
                        <circle
                          key={`mini-${node.id}-${idx}`}
                          cx={WORLD_CENTER + itemPos.x}
                          cy={WORLD_CENTER + itemPos.y}
                          r={Math.max(10, dynamicWidth / 150)}
                          fill={node.color}
                          opacity="0.6"
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* Viewport indicator */}
              {viewportRef.current && (() => {
                const { width, height } = viewportRef.current.getBoundingClientRect();
                // Calculate viewport bounds in world coordinates
                const viewportWorldX = -panOffset.x / zoom;
                const viewportWorldY = -panOffset.y / zoom;
                const viewportWorldWidth = width / zoom;
                const viewportWorldHeight = height / zoom;
                
                return (
                  <rect
                    x={viewportWorldX}
                    y={viewportWorldY}
                    width={viewportWorldWidth}
                    height={viewportWorldHeight}
                    fill="rgba(255,255,255,0.05)"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth={Math.max(4, scaleFactor / 15)}
                    rx={scaleFactor / 20}
                  />
                );
              })()}
            </svg>
          );
        })()}

        <div style={{ 
          position: 'absolute', 
          bottom: '4px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          fontSize: minimapHovered ? '9px' : '8px', 
          color: minimapHovered ? theme.textSecondary : theme.textMuted, 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          transition: 'font-size 0.2s ease-out, color 0.2s ease-out',
          pointerEvents: 'none',
        }}>
          {minimapHovered ? 'Click to navigate' : 'Overview'}
        </div>
      </div>

      {/* Legend - Bottom center (FIXED to viewport, offset for right panel) */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: 'calc(50% - 187px)', // Offset by half of 374px right panel
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '24px',
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(12px)',
        padding: '10px 20px',
        borderRadius: '10px',
        border: `1px solid ${theme.border}`,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
          <span style={{ fontSize: '11px', color: theme.textTertiary }}>Complete</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3f3f46' }} />
          <span style={{ fontSize: '11px', color: theme.textTertiary }}>Not configured</span>
        </div>
        <div style={{ fontSize: '11px', color: theme.textMuted }}>
          {completedCount}/{totalVisibleNodes} complete
        </div>
      </div>

      {/* VIEWPORT - The pannable/zoomable area */}
      <div
        ref={viewportRef}
        data-pannable="true"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handlePillMouseMove(e);
        }}
        onMouseUp={() => {
          handleMouseUp();
          handlePillMouseUp();
        }}
        style={{
          flex: 1,
          overflow: 'hidden',
          cursor: draggingPill ? 'grabbing' : isPanning ? 'grabbing' : 'grab',
          position: 'relative',
        }}
      >
        {/* TRANSFORM LAYER - applies pan and zoom */}
        <div style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isPanning || draggingPill ? 'none' : 'transform 0.1s ease-out',
          position: 'absolute',
          top: 0,
          left: 0,
        }}>
          {/* WORLD LAYER - the large canvas */}
          <div 
            data-pannable="true"
            style={{
              position: 'relative',
              width: `${WORLD_SIZE}px`,
              height: `${WORLD_SIZE}px`,
            }}
          >
            {/* SVG for connection lines - covers entire world */}
            <svg
              width={WORLD_SIZE}
              height={WORLD_SIZE}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }}
            >
              {/* Lines from center to nodes */}
              {nodesWithPositions.map((node) => {
                const centerX = WORLD_CENTER;
                const centerY = WORLD_CENTER;
                const nodeX = centerX + node.x;
                const nodeY = centerY + node.y;

                const dx = node.x;
                const dy = node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const dirX = dx / dist;
                const dirY = dy / dist;

                const startX = centerX + dirX * 70;
                const startY = centerY + dirY * 70;

                // Use dynamic node size
                const boxHalfSize = node.nodeSize / 2;
                const tX = Math.abs(dirX) > 0.001 ? boxHalfSize / Math.abs(dirX) : Infinity;
                const tY = Math.abs(dirY) > 0.001 ? boxHalfSize / Math.abs(dirY) : Infinity;
                const t = Math.min(tX, tY);

                const endX = nodeX - dirX * t;
                const endY = nodeY - dirY * t;

                const opacity = getNodeOpacity(node.id);

                return (
                  <line
                    key={node.id}
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1.5"
                    style={{ opacity: opacity * 0.7, transition: 'all 0.4s ease-out' }}
                  />
                );
              })}

              {/* Connection lines between related pill items */}
              {connectionsToRender.map((conn, idx) => {
                const fromKey = `${conn.fromNodeId}-${conn.fromItemId}`;
                const toKey = `${conn.toNodeId}-${conn.toItemId}`;
                let fromPos = allItemPositions[fromKey];
                let toPos = allItemPositions[toKey];
                let fromIsParentNode = false;
                let toIsParentNode = false;

                // If fromPos is missing and node is collapsed, draw to parent node
                if (!fromPos && !expandedNodes.has(conn.fromNodeId)) {
                  const parentNode = nodesWithPositions.find(n => n.id === conn.fromNodeId);
                  if (parentNode) {
                    fromPos = {
                      x: parentNode.x,
                      y: parentNode.y,
                      nodeId: conn.fromNodeId,
                      itemId: conn.fromItemId,
                      color: parentNode.color
                    };
                    fromIsParentNode = true;
                  }
                }

                // If toPos is missing and node is collapsed, draw to parent node
                if (!toPos && !expandedNodes.has(conn.toNodeId)) {
                  const parentNode = nodesWithPositions.find(n => n.id === conn.toNodeId);
                  if (parentNode) {
                    toPos = {
                      x: parentNode.x,
                      y: parentNode.y,
                      nodeId: conn.toNodeId,
                      itemId: conn.toItemId,
                      color: parentNode.color
                    };
                    toIsParentNode = true;
                  }
                }

                if (!fromPos || !toPos) return null;

                // Get center points in SVG coordinates
                const fromCenterX = WORLD_CENTER + fromPos.x;
                const fromCenterY = WORLD_CENTER + fromPos.y;
                const toCenterX = WORLD_CENTER + toPos.x;
                const toCenterY = WORLD_CENTER + toPos.y;

                // Get actual pill widths (use fallback for parent nodes)
                const fromWidth = 'width' in fromPos ? fromPos.width : 50;
                const toWidth = 'width' in toPos ? toPos.width : 50;

                // Calculate edge points for pills (not for parent nodes)
                const fromEdge = fromIsParentNode 
                  ? { x: fromCenterX, y: fromCenterY }
                  : calculatePillEdgePoint(fromCenterX, fromCenterY, toCenterX, toCenterY, fromWidth, 20);
                
                const toEdge = toIsParentNode
                  ? { x: toCenterX, y: toCenterY }
                  : calculatePillEdgePoint(toCenterX, toCenterY, fromCenterX, fromCenterY, toWidth, 20);

                // Calculate right-angle path that avoids center (radius 100px)
                const waypoints = calculateRightAnglePath(fromEdge.x, fromEdge.y, toEdge.x, toEdge.y, WORLD_CENTER, WORLD_CENTER, 100);
                const pathData = waypoints.map((point, i) =>
                  i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
                ).join(' ');

                // Determine line color based on relationship type
                const lineColor = conn.relationshipType === 'constrained_by'
                  ? '#FB923C' // Orange for constraints
                  : conn.relationshipType === 'used_in'
                    ? '#60A5FA' // Blue for objectives
                    : conn.relationshipType === 'supplies'
                      ? '#10B981' // Green for suppliers
                      : '#A78BFA'; // Purple default

                return (
                  <g key={`conn-${idx}`}>
                    {/* Glow effect */}
                    <path
                      d={pathData}
                      stroke={lineColor}
                      strokeWidth="4"
                      fill="none"
                      opacity="0.15"
                    />
                    {/* Main line */}
                    <path
                      d={pathData}
                      stroke={lineColor}
                      strokeWidth="1.5"
                      fill="none"
                      opacity="0.8"
                      strokeDasharray="4 2"
                    />
                    {/* Anchor dot at start (from pill) */}
                    {!fromIsParentNode && (
                      <circle
                        cx={fromEdge.x}
                        cy={fromEdge.y}
                        r="2.5"
                        fill={fromPos.color}
                      />
                    )}
                    {/* Anchor dot at end (to pill) */}
                    {!toIsParentNode && (
                      <circle
                        cx={toEdge.x}
                        cy={toEdge.y}
                        r="2.5"
                        fill={toPos.color}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Central node */}
            <div
              style={{
                position: 'absolute',
                left: WORLD_CENTER,
                top: WORLD_CENTER,
                transform: 'translate(-50%, -50%)',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
                border: '2px solid rgba(45, 212, 191, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
              }}
            >
              <span style={{
                fontSize: '20px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: '110px',
                color: theme.text,
              }}>
                {categoryName}
              </span>
              <span style={{
                fontSize: '10px',
                color: 'rgba(45, 212, 191, 0.8)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginTop: '8px',
                fontWeight: 500,
              }}>
                Category
              </span>
            </div>

            {/* Outer nodes */}
            {nodesWithPositions.map((node) => {
              const status = getStatus(node.id);
              const isHovered = hoveredNode === node.id;
              const opacity = getNodeOpacity(node.id);
              const isExpanded = expandedNodes.has(node.id);
              const items = nodeItems[node.id] || [];
              const hasItems = items.length > 0;
              const nodeSize = node.nodeSize;
              const iconSize = Math.max(16, Math.round(nodeSize * 0.28)); // Scale icon with node
              const labelSize = Math.max(9, Math.round(nodeSize * 0.12)); // Scale label with node

              return (
                <React.Fragment key={node.id}>
                  {/* Main node */}
                  <div
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeClick(node.id);
                    }}
                    className="node-position-transition"
                    style={{
                      position: 'absolute',
                      left: WORLD_CENTER + node.x,
                      top: WORLD_CENTER + node.y,
                      transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.05)' : 'scale(1)'}`,
                      opacity,
                      cursor: 'pointer',
                      zIndex: isHovered ? 30 : 10,
                    }}
                  >
                    <div style={{
                      width: `${nodeSize}px`,
                      height: `${nodeSize}px`,
                      borderRadius: `${Math.max(8, nodeSize * 0.16)}px`,
                      background: 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${status.complete ? node.color : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: isHovered ? `0 0 30px ${node.color}20` : 'none',
                      transition: 'width 0.3s, height 0.3s',
                    }}>

                      {/* Status indicator - top right */}
                      <div style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: status.complete ? '#22C55E' : '#3f3f46',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: status.complete ? '0 0 12px #22C55E, 0 0 24px rgba(34, 197, 94, 0.6)' : 'none',
                        border: '2px solid #0a0a0f',
                      }}>
                        {status.complete && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      {/* Item count badge - bottom right */}
                      {status.items > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '-6px',
                          right: '-6px',
                          minWidth: '20px',
                          height: '20px',
                          borderRadius: '10px',
                          background: node.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 6px',
                          border: '2px solid #0a0a0f',
                        }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#0a0a0f',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            {status.items}
                          </span>
                        </div>
                      )}

                      {/* Expand button - bottom left */}
                      {hasItems && (
                        <button
                          onClick={(e) => toggleNodeExpansion(node.id, e)}
                          style={{
                            position: 'absolute',
                            bottom: '-6px',
                            left: '-6px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: isExpanded ? node.color : '#3f3f46',
                            border: '2px solid #0a0a0f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={isExpanded ? '#0a0a0f' : '#a1a1aa'}
                            strokeWidth="3"
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      )}

                      <NodeIcon id={node.id} color={node.color} size={iconSize} />

                      <span style={{
                        fontSize: `${labelSize}px`,
                        fontWeight: 500,
                        color: theme.text,
                        marginTop: `${Math.max(4, nodeSize * 0.06)}px`,
                      }}>
                        {node.label}
                      </span>
                    </div>

                    {/* Tooltip */}
                    {isHovered && !isExpanded && (
                      <div style={{
                        position: 'absolute',
                        top: '110%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(20, 20, 28, 0.98)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        zIndex: 100,
                        animation: 'slideUp 0.2s ease-out',
                        whiteSpace: 'nowrap',
                      }}>
                        <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0, textAlign: 'center' }}>
                          {node.description}
                        </p>
                        {status.items > 0 && (
                          <p style={{ fontSize: '11px', color: theme.textTertiary, margin: '6px 0 0 0', textAlign: 'center' }}>
                            {status.items} item{status.items !== 1 ? 's' : ''} configured
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded item nodes - pill-shaped cloud layout */}
                  {isExpanded && items.length > 0 && getItemPositions(node, items).map((item, idx) => {
                    const isDragging = draggingPill === item.dragKey;
                    const hasConnection = connectionsToRender.some(
                      conn => (conn.fromNodeId === node.id && conn.fromItemId === item.id) ||
                              (conn.toNodeId === node.id && conn.toItemId === item.id)
                    );

                    return (
                      <div
                        key={`${node.id}-item-${idx}`}
                        style={{
                          position: 'absolute',
                          left: WORLD_CENTER + item.x,
                          top: WORLD_CENTER + item.y,
                          transform: 'translate(-50%, -50%)',
                          animation: isDragging ? 'none' : 'fadeIn 0.2s ease-out',
                          zIndex: isDragging ? 100 : hasConnection ? 15 : 5,
                          transition: isDragging ? 'none' : 'left 0.1s, top 0.1s',
                        }}
                      >
                        {/* PILL SHAPE - horizontal rounded rectangle */}
                        <div
                          ref={(el) => {
                            if (el && item.id !== 'more') {
                              const width = el.offsetWidth;
                              if (pillWidths[item.dragKey] !== width) {
                                setPillWidths(prev => ({
                                  ...prev,
                                  [item.dragKey]: width
                                }));
                              }
                            }
                          }}
                          style={{
                            minWidth: '50px',
                            maxWidth: '100px',
                            height: '20px',
                            borderRadius: '10px',
                            background: hasConnection ? `${node.color}25` : `${node.color}15`,
                            border: `1px solid ${hasConnection ? node.color : `${node.color}50`}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 8px',
                            cursor: item.id === 'more' ? 'pointer' : 'grab',
                            boxShadow: isDragging
                              ? `0 4px 12px rgba(0,0,0,0.4), 0 0 0 2px ${node.color}`
                              : hasConnection
                                ? `0 2px 8px ${node.color}40`
                                : '0 1px 3px rgba(0,0,0,0.2)',
                            transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.1s, box-shadow 0.1s',
                          }}
                          onMouseDown={(e) => {
                            if (item.id !== 'more') {
                              handlePillMouseDown(e, item.dragKey);
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.id === 'more') {
                              onNodeClick(node.id);
                            } else {
                              setSelectedPillId(item.dragKey);
                            }
                          }}
                        >
                          {/* SMALL FONT - 7px for readability */}
                          <span style={{
                            fontSize: '7px',
                            fontWeight: 600,
                            color: node.color,
                            letterSpacing: '0.02em',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            userSelect: 'none',
                          }}>
                            {item.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphView;