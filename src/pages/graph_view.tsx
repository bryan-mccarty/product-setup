import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AgentSidebar } from '../components/AgentSidebar';
import { ChatMessage, GraphAPI, AgentHighlights } from '../types/agent';

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

// Simulation pill for force-directed layout
interface SimulationPill {
  id: string;          // e.g., "inputs-item-3"
  parentId: string;    // e.g., "inputs"
  width: number;
  height: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  anchorDistance: number;
  anchorAngle: number;
  isFixed: boolean;
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

// All possible node definitions - function to support theme-aware colors
const getAllNodes = (isDarkMode: boolean) => [
  { id: 'inputs', label: 'Inputs', color: isDarkMode ? '#2DD4BF' : '#0f766e', description: 'View and manage inputs' },
  { id: 'outcomes', label: 'Outcomes', color: isDarkMode ? '#F472B6' : '#be185d', description: 'View and manage outcomes' },
  { id: 'calculations', label: 'Calculations', color: isDarkMode ? '#A78BFA' : '#6d28d9', description: 'View calculations' },
  { id: 'constraints', label: 'Constraints', color: isDarkMode ? '#FB923C' : '#c2410c', description: 'View constraints' },
  { id: 'objectives', label: 'Objectives', color: isDarkMode ? '#60A5FA' : '#1d4ed8', description: 'View objectives' },
  { id: 'competitors', label: 'Competitors', color: isDarkMode ? '#EC4899' : '#be185d', description: 'View competitors' },
  { id: 'packaging', label: 'Packaging', color: isDarkMode ? '#8B5CF6' : '#6d28d9', description: 'View packaging options' },
  { id: 'data', label: 'Data', color: isDarkMode ? '#14B8A6' : '#0f766e', description: 'View data sources' },
  { id: 'manufacturingSites', label: 'Mfg Sites', color: isDarkMode ? '#F59E0B' : '#d97706', description: 'View manufacturing sites' },
  { id: 'suppliers', label: 'Suppliers', color: isDarkMode ? '#D946EF' : '#a21caf', description: 'View suppliers' },
  { id: 'distributionChannels', label: 'Distribution', color: isDarkMode ? '#6366F1' : '#4f46e5', description: 'View distribution channels' },
];

const DEFAULT_VISIBILITY: Record<string, boolean> = {
  inputs: true,
  outcomes: true,
  calculations: true,
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

// Force-directed simulation constants
const SIMULATION = {
  RADIAL_SPRING: 0.3,
  PILL_REPULSION: 1.0,
  PARENT_REPULSION: 1.5,
  GAP_BETWEEN_PILLS: 8,
  GAP_FROM_PARENT: 12,
  BASE_DISTANCE: 50,
  RING_SPACING: 28,
  PILLS_PER_RING_BASE: 5,
  DAMPING: 0.75,
  MAX_ITERATIONS: 200,
  CONVERGENCE_THRESHOLD: 0.3,
  PILL_HEIGHT: 20,
  PILL_MIN_WIDTH: 50,
  PILL_MAX_WIDTH: 100,
  MAX_ANGLE_FROM_PARENT: Math.PI / 2,  // 90 degrees max from parent's outward direction
  INITIAL_SPREAD: 0.1,                  // ~6 degrees initial spacing between pills
  BOUNDARY_FORCE: 2.0,                  // Strength of angular boundary push
  ANGULAR_CENTERING: 0.23,              // Gentle pull toward parent's outward direction
};

const GraphView: React.FC<GraphViewProps> = ({
  categoryName,
  nodeStatus,
  nodeItems = {},
  connections = [],
  onNodeClick,
}) => {
  const { theme, isDarkMode } = useTheme();
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

  // Force-directed simulation state
  const [calculatedPillPositions, setCalculatedPillPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedPills, setDraggedPills] = useState<Set<string>>(new Set());

  // Refs for simulation to avoid dependency issues
  const nodeItemsRef = useRef(nodeItems);
  const nodesWithPositionsRef = useRef<typeof nodesWithPositions>([]);
  const pillWidthsRef = useRef(pillWidths);
  const draggedPillsRef = useRef(draggedPills);
  const pillDragOffsetsRef = useRef(pillDragOffsets);
  const calculatedPillPositionsRef = useRef(calculatedPillPositions);

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

  // Connection hover state (for highlighting in 'all' mode)
  const [hoveredPillKey, setHoveredPillKey] = useState<string | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Minimap interaction state
  const [minimapHovered, setMinimapHovered] = useState(false);
  const [minimapDragging, setMinimapDragging] = useState(false);
  const minimapRef = useRef<SVGSVGElement>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Agent sidebar state
  const [isAgentSidebarOpen, setIsAgentSidebarOpen] = useState(false);
  const [agentHighlights, setAgentHighlights] = useState<AgentHighlights>({ pills: new Set(), connections: new Set() });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // All nodes with theme-aware colors
  const ALL_NODES = useMemo(() => getAllNodes(isDarkMode), [isDarkMode]);

  // Keep refs in sync with state
  useEffect(() => { nodeItemsRef.current = nodeItems; }, [nodeItems]);
  useEffect(() => { pillWidthsRef.current = pillWidths; }, [pillWidths]);
  useEffect(() => { draggedPillsRef.current = draggedPills; }, [draggedPills]);
  useEffect(() => { pillDragOffsetsRef.current = pillDragOffsets; }, [pillDragOffsets]);
  useEffect(() => { calculatedPillPositionsRef.current = calculatedPillPositions; }, [calculatedPillPositions]);

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

  // ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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

  // Keep nodesWithPositions ref in sync
  useEffect(() => { nodesWithPositionsRef.current = nodesWithPositions; }, [nodesWithPositions]);

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
      case 'calculations':
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
      if (next.has(nodeId)) {
        // COLLAPSING - clean up drag state for this node's pills
        next.delete(nodeId);

        // Remove dragged pill markers for this node
        setDraggedPills(prevDragged => {
          const newSet = new Set(prevDragged);
          for (const key of prevDragged) {
            if (key.startsWith(`${nodeId}-`)) {
              newSet.delete(key);
            }
          }
          return newSet;
        });

        // Remove drag offsets for this node's pills
        setPillDragOffsets(prevOffsets => {
          const newOffsets = { ...prevOffsets };
          for (const key of Object.keys(newOffsets)) {
            if (key.startsWith(`${nodeId}-`)) {
              delete newOffsets[key];
            }
          }
          return newOffsets;
        });
      } else {
        next.add(nodeId);
      }
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

  // Estimate pill width based on text length
  const estimatePillWidth = (name: string): number => {
    const estimated = Math.ceil(name.length * 7 * 0.6) + 16;
    return Math.max(SIMULATION.PILL_MIN_WIDTH, Math.min(SIMULATION.PILL_MAX_WIDTH, estimated));
  };

  // Get pill width from measured or estimated
  const getPillWidth = (dragKey: string, name: string): number => {
    return pillWidths[dragKey] || estimatePillWidth(name);
  };

  // Initialize pills for force simulation
  const initializePills = (
    expandedNodeIds: Set<string>,
    items: Record<string, NodeItem[]>,
    nodes: typeof nodesWithPositions,
    existingPositions: Record<string, { x: number; y: number }>,
    draggedPillsSet: Set<string>
  ): SimulationPill[] => {
    const pills: SimulationPill[] = [];

    for (const node of nodes) {
      if (!expandedNodeIds.has(node.id)) continue;
      const nodeItems = items[node.id] || [];
      if (nodeItems.length === 0) continue;

      const parentAngle = node.angle;
      const parentRadius = node.nodeSize / 2;

      let ringIndex = 0;
      let indexInRing = 0;
      let pillsInCurrentRing = SIMULATION.PILLS_PER_RING_BASE;

      for (let i = 0; i < nodeItems.length; i++) {
        const item = nodeItems[i];
        const dragKey = `${node.id}-${item.id}`;
        const width = getPillWidth(dragKey, item.name);

        // Move to next ring if current is full
        if (indexInRing >= pillsInCurrentRing) {
          ringIndex++;
          indexInRing = 0;
          pillsInCurrentRing = SIMULATION.PILLS_PER_RING_BASE + ringIndex * 2;
        }

        const ringDistance = SIMULATION.BASE_DISTANCE + parentRadius + ringIndex * SIMULATION.RING_SPACING;

        // Calculate how many pills in this ring for initial spread
        const remainingItems = nodeItems.length - i;
        const pillsInRingForSpacing = Math.min(pillsInCurrentRing - indexInRing, remainingItems) + indexInRing;
        const offsetIndex = indexInRing - (pillsInRingForSpacing - 1) / 2;

        // Slight initial spread so pills don't all start exactly on top of each other
        const angularOffset = offsetIndex * SIMULATION.INITIAL_SPREAD;
        const pillAngle = parentAngle + angularOffset;

        // Check if this pill was dragged (is fixed)
        const isFixed = draggedPillsSet.has(dragKey);

        let initialX: number, initialY: number;
        if (isFixed && existingPositions[dragKey]) {
          // Fixed pills already have their final position baked into existingPositions
          initialX = existingPositions[dragKey].x;
          initialY = existingPositions[dragKey].y;
        } else {
          // Calculate fresh position based on ring layout
          initialX = node.x + Math.cos(pillAngle) * ringDistance;
          initialY = node.y + Math.sin(pillAngle) * ringDistance;
        }

        pills.push({
          id: dragKey,
          parentId: node.id,
          width,
          height: SIMULATION.PILL_HEIGHT,
          x: initialX,
          y: initialY,
          vx: 0,
          vy: 0,
          anchorDistance: ringDistance,
          anchorAngle: pillAngle,
          isFixed,
        });

        indexInRing++;
      }
    }

    return pills;
  };

  // Run force-directed simulation
  const runForceSimulation = (
    pills: SimulationPill[],
    parentNodes: typeof nodesWithPositions
  ): Record<string, { x: number; y: number }> => {
    // Create a map for quick parent lookup
    const parentMap = new Map(parentNodes.map(n => [n.id, n]));

    for (let iter = 0; iter < SIMULATION.MAX_ITERATIONS; iter++) {
      let maxVelocity = 0;

      // Calculate forces for each pill
      for (const pill of pills) {
        if (pill.isFixed) continue;

        let fx = 0, fy = 0;
        const parent = parentMap.get(pill.parentId);
        if (!parent) continue;

        // 1. Radial spring: pull toward target distance from parent
        const dx = pill.x - parent.x;
        const dy = pill.y - parent.y;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        if (currentDistance > 0) {
          const radialError = currentDistance - pill.anchorDistance;
          const radialDirX = dx / currentDistance;
          const radialDirY = dy / currentDistance;
          fx += -SIMULATION.RADIAL_SPRING * radialError * radialDirX;
          fy += -SIMULATION.RADIAL_SPRING * radialError * radialDirY;
        }

        // 2. Pill-pill repulsion
        for (const other of pills) {
          if (other.id === pill.id) continue;
          const pdx = pill.x - other.x;
          const pdy = pill.y - other.y;
          const dist = Math.sqrt(pdx * pdx + pdy * pdy);
          const pillRadius = (pill.width + pill.height) / 4;
          const otherRadius = (other.width + other.height) / 4;
          const minDist = pillRadius + otherRadius + SIMULATION.GAP_BETWEEN_PILLS;
          if (dist < minDist && dist > 0) {
            const overlap = minDist - dist;
            fx += (pdx / dist) * overlap * SIMULATION.PILL_REPULSION;
            fy += (pdy / dist) * overlap * SIMULATION.PILL_REPULSION;
          }
        }

        // 3. Parent node repulsion (from ALL parent nodes)
        for (const parentNode of parentNodes) {
          const ndx = pill.x - parentNode.x;
          const ndy = pill.y - parentNode.y;
          const nDist = Math.sqrt(ndx * ndx + ndy * ndy);
          const nodeRadius = parentNode.nodeSize / 2;
          const pillRadius = (pill.width + pill.height) / 4;
          const minDist = nodeRadius + pillRadius + SIMULATION.GAP_FROM_PARENT;
          if (nDist < minDist && nDist > 0) {
            const overlap = minDist - nDist;
            fx += (ndx / nDist) * overlap * SIMULATION.PARENT_REPULSION;
            fy += (ndy / nDist) * overlap * SIMULATION.PARENT_REPULSION;
          }
        }

        // 4. Angular boundary: hard limit at MAX_ANGLE_FROM_PARENT from parent's outward direction
        if (currentDistance > 0) {
          // Get parent's outward angle (angle from center to parent)
          const parentAngle = Math.atan2(parent.y, parent.x);
          const currentAngle = Math.atan2(dy, dx);
          let angleDiff = currentAngle - parentAngle;
          // Normalize to [-PI, PI]
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

          if (Math.abs(angleDiff) > SIMULATION.MAX_ANGLE_FROM_PARENT) {
            const excess = Math.abs(angleDiff) - SIMULATION.MAX_ANGLE_FROM_PARENT;
            const pushDirection = angleDiff > 0 ? -1 : 1;
            // Tangent direction (perpendicular to radial)
            const tangentX = -dy / currentDistance;
            const tangentY = dx / currentDistance;
            const boundaryForce = excess * SIMULATION.BOUNDARY_FORCE;
            fx += pushDirection * tangentX * boundaryForce * currentDistance;
            fy += pushDirection * tangentY * boundaryForce * currentDistance;
          }

          // 5. Angular centering: gentle pull toward parent's outward direction
          const centeringForce = -angleDiff * SIMULATION.ANGULAR_CENTERING;
          const tangentX = -dy / currentDistance;
          const tangentY = dx / currentDistance;
          fx += tangentX * centeringForce;
          fy += tangentY * centeringForce;
        }

        // Apply forces with damping
        pill.vx = (pill.vx + fx) * SIMULATION.DAMPING;
        pill.vy = (pill.vy + fy) * SIMULATION.DAMPING;
      }

      // Update positions
      for (const pill of pills) {
        if (pill.isFixed) continue;
        pill.x += pill.vx;
        pill.y += pill.vy;
        maxVelocity = Math.max(maxVelocity, Math.sqrt(pill.vx * pill.vx + pill.vy * pill.vy));
      }

      // Check convergence
      if (maxVelocity < SIMULATION.CONVERGENCE_THRESHOLD) break;
    }

    // Build result
    const result: Record<string, { x: number; y: number }> = {};
    for (const pill of pills) {
      result[pill.id] = { x: pill.x, y: pill.y };
    }
    return result;
  };

  // Run simulation when expansion state changes
  useEffect(() => {
    if (expandedNodes.size === 0) {
      setCalculatedPillPositions({});
      return;
    }
    const pills = initializePills(
      expandedNodes,
      nodeItemsRef.current,
      nodesWithPositionsRef.current,
      calculatedPillPositionsRef.current,
      draggedPillsRef.current
    );
    if (pills.length === 0) {
      setCalculatedPillPositions({});
      return;
    }
    const positions = runForceSimulation(pills, nodesWithPositionsRef.current);

    // Merge results: preserve dragged pill positions with their offsets baked in
    setCalculatedPillPositions(prev => {
      const merged = { ...positions };
      // For dragged pills, bake their final absolute position (prev + offset)
      for (const dragKey of draggedPillsRef.current) {
        if (prev[dragKey]) {
          const offset = pillDragOffsetsRef.current[dragKey] || { x: 0, y: 0 };
          merged[dragKey] = {
            x: prev[dragKey].x + offset.x,
            y: prev[dragKey].y + offset.y
          };
        }
      }
      return merged;
    });

    // Clear offsets for dragged pills since we baked them into calculatedPillPositions
    setPillDragOffsets(prev => {
      const newOffsets = { ...prev };
      for (const dragKey of draggedPillsRef.current) {
        delete newOffsets[dragKey];
      }
      return newOffsets;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedNodes]);

  // Calculate item positions - uses pre-calculated simulation positions
  const getItemPositions = (parentNode: typeof nodesWithPositions[0], items: NodeItem[]) => {
    return items.map(item => {
      const dragKey = `${parentNode.id}-${item.id}`;
      const calculated = calculatedPillPositions[dragKey] || { x: parentNode.x, y: parentNode.y };
      const offset = pillDragOffsets[dragKey] || { x: 0, y: 0 };
      return {
        ...item,
        x: calculated.x + offset.x,
        y: calculated.y + offset.y,
        dragKey,
        parentNodeId: parentNode.id,
      };
    });
  };

  // Get all visible item positions for connection rendering
  const allItemPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; nodeId: string; itemId: string; color: string; width: number }> = {};

    nodesWithPositions.forEach(node => {
      if (!expandedNodes.has(node.id)) return;
      const items = nodeItems[node.id] || [];
      const itemPositions = getItemPositions(node, items);

      itemPositions.forEach(item => {
        const dragKey = `${node.id}-${item.id}`;
        positions[dragKey] = {
          x: item.x,
          y: item.y,
          nodeId: node.id,
          itemId: item.id,
          color: node.color,
          width: pillWidths[dragKey] || 50, // fallback to minWidth
        };
      });
    });

    return positions;
  }, [nodesWithPositions, expandedNodes, nodeItems, pillDragOffsets, pillWidths]);

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

  // Graph API for agent sidebar
  const graphAPI = useMemo<GraphAPI>(() => ({
    // Read operations
    getVisibleNodes: () => nodesWithPositions,
    getAllNodes: () => ALL_NODES,
    getNodeItems: (nodeId: string) => nodeItems[nodeId] || [],
    getAllItems: () => nodeItems,
    getConnections: () => connections,
    getExpandedNodes: () => expandedNodes,
    getVisibleNodeIds: () => visibleNodes,
    getConnectionGraph: () => connectionGraph,
    getConnectedItems: (startKey: string) => getConnectedItems(startKey),
    getNodeStatus: () => nodeStatus,

    // Mutation operations
    expandNode: (nodeId: string) => {
      setExpandedNodes(prev => new Set(prev).add(nodeId));
    },
    collapseNode: (nodeId: string) => {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
    },
    setNodeVisibility: (nodeId: string, visible: boolean) => {
      setVisibleNodes(prev => ({ ...prev, [nodeId]: visible }));
    },
    setAllNodesVisibility: (visible: boolean) => {
      setVisibleNodes(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(k => updated[k] = visible);
        return updated;
      });
    },
    selectPill: (pillKey: string | null) => {
      setSelectedPillId(pillKey);
    },
    setConnectionMode: (mode: 'all' | 'onClick') => {
      setConnectionMode(mode);
    },
    activatePill: (pillKey: string | null) => {
      // Deprecated - now handled via selectPill for graph mode
      setSelectedPillId(pillKey);
    },

    // Navigation operations
    focusOnItem: (nodeId: string, itemId: string, zoomLevel?: number) => {
      const pillKey = `${nodeId}-${itemId}`;
      const pos = calculatedPillPositions[pillKey];
      if (!pos || !viewportRef.current) return;

      const { width, height } = viewportRef.current.getBoundingClientRect();
      const targetZoom = zoomLevel ?? zoom;
      setPanOffset({
        x: width / 2 - pos.x * targetZoom,
        y: height / 2 - pos.y * targetZoom,
      });
      if (zoomLevel) setZoom(zoomLevel);
    },
    focusOnNode: (nodeId: string, zoomLevel?: number) => {
      const node = nodesWithPositions.find(n => n.id === nodeId);
      if (!node || !viewportRef.current) return;

      const { width, height } = viewportRef.current.getBoundingClientRect();
      const targetZoom = zoomLevel ?? zoom;
      setPanOffset({
        x: width / 2 - (WORLD_CENTER + node.x) * targetZoom,
        y: height / 2 - (WORLD_CENTER + node.y) * targetZoom,
      });
      if (zoomLevel) setZoom(zoomLevel);
    },
    resetView: () => {
      handleZoomReset();
    },
  }), [
    nodesWithPositions, ALL_NODES, nodeItems, connections, expandedNodes,
    visibleNodes, connectionGraph, getConnectedItems, nodeStatus,
    calculatedPillPositions, zoom, handleZoomReset
  ]);

  // Filter connections to only show when both nodes are expanded
  const visibleConnections = useMemo(() => {
    return connections.filter(conn =>
      expandedNodes.has(conn.fromNodeId) && expandedNodes.has(conn.toNodeId)
    );
  }, [connections, expandedNodes]);

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

  // Terminal node types - never traverse THROUGH these (but can start from them)
  const TERMINAL_NODE_TYPES = new Set(['suppliers', 'manufacturingSites', 'distributionChannels']);

  // Get highlighted connection indices using hierarchical DFS
  // Responds to hover (in 'all' mode only)
  const highlightedConnectionIndices = useMemo(() => {
    const activePill = hoveredPillKey;
    if (connectionMode !== 'all' || !activePill) return null;

    const [startNodeType] = activePill.split('-');
    const startedFromData = startNodeType === 'data';

    const visitedPills = new Set<string>([activePill]);
    const highlightedIndices = new Set<number>();
    const queue = [activePill];

    while (queue.length > 0) {
      const currentPill = queue.shift()!;
      const [currentNodeType] = currentPill.split('-');
      const isStartNode = currentPill === activePill;

      // Terminal check: stop traversing FROM terminal nodes (unless we started there)
      const isTerminal = TERMINAL_NODE_TYPES.has(currentNodeType);
      if (isTerminal && !isStartNode) continue;

      connectionsToRender.forEach((conn, idx) => {
        const fromKey = `${conn.fromNodeId}-${conn.fromItemId}`;
        const toKey = `${conn.toNodeId}-${conn.toItemId}`;

        if (fromKey === currentPill || toKey === currentPill) {
          highlightedIndices.add(idx);

          const neighborKey = fromKey === currentPill ? toKey : fromKey;
          const [neighborNodeType] = neighborKey.split('-');

          if (!visitedPills.has(neighborKey)) {
            visitedPills.add(neighborKey);

            // If we started from data, don't continue traversal from inputs/outcomes
            // (this prevents lighting up sibling data items)
            const blockBecauseDataStart = startedFromData &&
              (neighborNodeType === 'inputs' || neighborNodeType === 'outcomes');

            if (!blockBecauseDataStart) {
              queue.push(neighborKey);
            }
          }
        }
      });
    }

    return highlightedIndices;
  }, [connectionMode, hoveredPillKey, connectionsToRender]);

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
    if (draggingPill) {
      const offset = pillDragOffsets[draggingPill];
      // Mark as "fixed" if user actually moved it (not just a click)
      if (offset && (Math.abs(offset.x) > 5 || Math.abs(offset.y) > 5)) {
        setDraggedPills(prev => new Set(prev).add(draggingPill));
      }
    }
    setDraggingPill(null);
  };

  // Global mouse up for pill dragging
  useEffect(() => {
    const handleGlobalPillMouseUp = () => {
      if (draggingPill) {
        const offset = pillDragOffsets[draggingPill];
        if (offset && (Math.abs(offset.x) > 5 || Math.abs(offset.y) > 5)) {
          setDraggedPills(prev => new Set(prev).add(draggingPill));
        }
      }
      setDraggingPill(null);
    };
    window.addEventListener('mouseup', handleGlobalPillMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalPillMouseUp);
  }, [draggingPill, pillDragOffsets]);

  // Connection hover handlers (for highlighting in 'all' mode)
  const handleHoverStart = (pillKey: string) => {
    if (connectionMode !== 'all') return;

    hoverTimerRef.current = setTimeout(() => {
      setHoveredPillKey(pillKey);
    }, 400);
  };

  const handleHoverEnd = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredPillKey(null);
  };

  // Cleanup hover timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  // Calculate Manhattan (right-angle) path for all connections
  const calculateManhattanPath = (
    x1: number, y1: number,
    x2: number, y2: number,
    centerX: number, centerY: number,
    avoidRadius: number
  ): { x: number; y: number }[] => {
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Choose elbow direction: horizontal-first if more horizontal travel
    const horizontalFirst = Math.abs(dx) > Math.abs(dy);

    let elbowX: number, elbowY: number;

    if (horizontalFirst) {
      elbowX = x2;
      elbowY = y1;
    } else {
      elbowX = x1;
      elbowY = y2;
    }

    // Check if elbow lands inside exclusion zone
    const elbowDistFromCenter = Math.sqrt(
      (elbowX - centerX) ** 2 + (elbowY - centerY) ** 2
    );

    if (elbowDistFromCenter < avoidRadius) {
      // Push elbow outward from center
      const angle = Math.atan2(elbowY - centerY, elbowX - centerX);
      elbowX = centerX + Math.cos(angle) * (avoidRadius + 10);
      elbowY = centerY + Math.sin(angle) * (avoidRadius + 10);

      // 4-point path going around the center
      if (horizontalFirst) {
        return [
          { x: x1, y: y1 },
          { x: elbowX, y: y1 },
          { x: elbowX, y: y2 },
          { x: x2, y: y2 }
        ];
      } else {
        return [
          { x: x1, y: y1 },
          { x: x1, y: elbowY },
          { x: x2, y: elbowY },
          { x: x2, y: y2 }
        ];
      }
    }

    return [
      { x: x1, y: y1 },
      { x: elbowX, y: elbowY },
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

  // Calculate sidebar-aware positioning offsets
  const sidebarWidth = 340;
  const controlOffset = (isFullscreen && isAgentSidebarOpen) ? sidebarWidth / 2 : 0;
  const rightControlOffset = (isFullscreen && isAgentSidebarOpen) ? sidebarWidth + 20 : 20;

  return (
    <div style={{
      ...(isFullscreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      } : {
        flex: 1,
      }),
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      position: isFullscreen ? 'fixed' : 'relative',
      background: theme.background,
    }}>
      {/* Graph area wrapper */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
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
        left: controlOffset > 0 ? `calc(50% - ${controlOffset}px)` : '50%',
        transform: 'translateX(-50%)',
        transition: 'left 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 100,
        background: theme.overlayBgStrong,
        backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
        padding: '10px 16px',
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
      }}>
        <div style={{ position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
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
              background: theme.inputBg,
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
                background: filterStatus === status ? 'rgba(45, 212, 191, 0.15)' : theme.cardBg,
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
        right: `${rightControlOffset}px`,
        display: 'flex',
        gap: '8px',
        zIndex: 100,
        transition: 'right 0.2s ease',
      }}>
        {/* Connection toggle menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowConnectionMenu(!showConnectionMenu)}
            style={{
              padding: '10px 14px',
              background: theme.overlayBgStrong,
              backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
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
              background: theme.overlayBgStrong,
              backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              padding: '8px',
              minWidth: '160px',
              boxShadow: theme.shadowMd,
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
              onMouseEnter={(e) => e.currentTarget.style.background = theme.cardBgHover}
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
              onMouseEnter={(e) => e.currentTarget.style.background = theme.cardBgHover}
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
              background: theme.overlayBgStrong,
              backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
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
              background: theme.overlayBgStrong,
              backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              padding: '8px 0',
              minWidth: '180px',
              boxShadow: theme.shadowMd,
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
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.cardBgHover}
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
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.cardBgHover}
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
                    background: theme.cardBg,
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
                    background: theme.cardBg,
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

        {/* Fullscreen toggle button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          style={{
            padding: '10px',
            background: theme.overlayBgStrong,
            backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
            border: `1px solid ${theme.border}`,
            borderRadius: '10px',
            color: theme.textSecondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 14 10 14 10 20" />
              <polyline points="20 10 14 10 14 4" />
              <line x1="14" y1="10" x2="21" y2="3" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          )}
        </button>
      </div>

      {/* Zoom Controls - Bottom right (FIXED to viewport) */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: isFullscreen ? `${rightControlOffset}px` : '394px', // 374px panel width + 20px margin when not fullscreen
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: isFullscreen ? 10000 : 100,
        transition: 'right 0.2s ease',
      }}>
        <div style={{
          background: theme.overlayBgStrong,
          backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
          borderRadius: '10px',
          border: `1px solid ${theme.border}`,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <button onClick={handleZoomIn} style={{ width: '32px', height: '32px', background: isDarkMode ? theme.cardBg : '#ffffff', border: isDarkMode ? 'none' : `1.5px solid ${theme.border}`, borderRadius: '6px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 300 }}>+</button>
          <div style={{ textAlign: 'center', fontSize: '10px', color: theme.textTertiary, fontFamily: "'JetBrains Mono', monospace", padding: '4px 0' }}>{Math.round(zoom * 100)}%</div>
          <button onClick={handleZoomOut} style={{ width: '32px', height: '32px', background: isDarkMode ? theme.cardBg : '#ffffff', border: isDarkMode ? 'none' : `1.5px solid ${theme.border}`, borderRadius: '6px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 300 }}>−</button>
        </div>
        <button onClick={handleZoomReset} style={{ padding: '8px 12px', background: theme.modalBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.textSecondary, cursor: 'pointer', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reset</button>
      </div>

      {/* Mini-map - Bottom left (FIXED to viewport, expands on hover, click/drag to navigate) */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: minimapHovered ? '200px' : '120px',
          height: minimapHovered ? '200px' : '120px',
          background: theme.overlayBgStrong,
          backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
          borderRadius: '10px',
          border: `1px solid ${minimapHovered ? 'rgba(45, 212, 191, 0.4)' : theme.border}`,
          overflow: 'hidden',
          zIndex: isFullscreen ? 10000 : 100,
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
                      fill={status.complete ? '#22C55E' : (isDarkMode ? theme.textMuted : '#64748b')}
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
                    fill={isDarkMode ? theme.cardBg : 'rgba(248, 250, 252, 0.3)'}
                    stroke={theme.border}
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

      {/* Legend - Bottom center (FIXED to viewport, offset for right panel when not fullscreen) */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: isFullscreen ? (controlOffset > 0 ? `calc(50% - ${controlOffset}px)` : '50%') : 'calc(50% - 187px)', // Offset by half of 374px right panel when not fullscreen
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '24px',
        background: theme.overlayBgStrong,
        backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
        padding: '10px 20px',
        borderRadius: '10px',
        border: `1px solid ${theme.border}`,
        zIndex: isFullscreen ? 10000 : 100,
        transition: 'left 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
          <span style={{ fontSize: '11px', color: theme.textTertiary }}>Complete</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.textMuted }} />
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
                    stroke={theme.border}
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

                // Calculate Manhattan path that avoids center (radius 100px)
                const waypoints = calculateManhattanPath(fromEdge.x, fromEdge.y, toEdge.x, toEdge.y, WORLD_CENTER, WORLD_CENTER, 100);
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

                // Calculate opacity for hover/activation dimming (only in 'all' mode)
                const isHighlighted = highlightedConnectionIndices?.has(idx) ?? false;
                const somethingIsActive = highlightedConnectionIndices !== null;
                const dimmedOpacity = isDarkMode ? 0.12 : 0.2;
                const connectionOpacity = connectionMode === 'all' && somethingIsActive && !isHighlighted
                  ? dimmedOpacity
                  : 0.8;

                return (
                  <g key={`conn-${idx}`}>
                    {/* Invisible fat hit area - only in 'all' mode */}
                    {connectionMode === 'all' && (
                      <path
                        d={pathData}
                        stroke="transparent"
                        strokeWidth="16"
                        fill="none"
                        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                        onMouseEnter={() => handleHoverStart(fromKey)}
                        onMouseLeave={handleHoverEnd}
                      />
                    )}
                    {/* Glow effect */}
                    <path
                      d={pathData}
                      stroke={lineColor}
                      strokeWidth="4"
                      fill="none"
                      opacity={isHighlighted ? 0.3 : 0.15 * (connectionOpacity / 0.8)}
                      style={{ pointerEvents: 'none' }}
                    />
                    {/* Main line */}
                    <path
                      d={pathData}
                      stroke={lineColor}
                      strokeWidth="1.5"
                      fill="none"
                      opacity={connectionOpacity}
                      strokeDasharray="4 2"
                      style={{ pointerEvents: 'none' }}
                    />
                    {/* Anchor dot at start (from pill) */}
                    {!fromIsParentNode && (
                      <circle
                        cx={fromEdge.x}
                        cy={fromEdge.y}
                        r="2.5"
                        fill={fromPos.color}
                        opacity={connectionOpacity}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                    {/* Anchor dot at end (to pill) */}
                    {!toIsParentNode && (
                      <circle
                        cx={toEdge.x}
                        cy={toEdge.y}
                        r="2.5"
                        fill={toPos.color}
                        opacity={connectionOpacity}
                        style={{ pointerEvents: 'none' }}
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
                background: isDarkMode ? 'linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)' : 'linear-gradient(135deg, rgba(14, 116, 110, 0.08) 0%, rgba(109, 40, 217, 0.08) 100%)',
                border: `2px solid ${isDarkMode ? 'rgba(45, 212, 191, 0.6)' : '#0f766e'}`,
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
                color: isDarkMode ? 'rgba(45, 212, 191, 0.8)' : '#0f766e',
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
                      background: theme.cardBg,
                      border: `1.5px solid ${status.complete ? node.color : theme.borderLight}`,
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
                        background: status.complete ? '#22C55E' : theme.textMuted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: status.complete ? '0 0 12px #22C55E, 0 0 24px rgba(34, 197, 94, 0.6)' : 'none',
                        border: `2px solid ${theme.background}`,
                      }}>
                        {status.complete && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={theme.background} strokeWidth="3">
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
                          border: `2px solid ${theme.background}`,
                        }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: isDarkMode ? '#0a0a0f' : '#ffffff',
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
                            background: isExpanded ? node.color : (isDarkMode ? '#3f3f46' : theme.borderStrong),
                            border: `2px solid ${theme.background}`,
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
                            stroke={isExpanded ? (isDarkMode ? '#0a0a0f' : '#ffffff') : (isDarkMode ? '#a1a1aa' : theme.textMuted)}
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
                        background: theme.modalBg,
                        border: `1px solid ${theme.border}`,
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
                    const isAmberHighlighted = agentHighlights.pills.has(item.dragKey);

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
                            if (el) {
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
                            background: isAmberHighlighted ? 'rgba(245, 158, 11, 0.25)' : hasConnection ? `${node.color}25` : `${node.color}15`,
                            border: isAmberHighlighted ? '2px solid #F59E0B' : `1px solid ${hasConnection ? node.color : `${node.color}50`}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 8px',
                            cursor: 'grab',
                            boxShadow: isDragging
                              ? `0 4px 12px rgba(0,0,0,0.4), 0 0 0 2px ${node.color}`
                              : isAmberHighlighted
                                ? '0 0 12px rgba(245, 158, 11, 0.6)'
                                : hasConnection
                                  ? `0 2px 8px ${node.color}40`
                                  : '0 1px 3px rgba(0,0,0,0.2)',
                            transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.1s, box-shadow 0.1s, border 0.1s',
                          }}
                          onMouseDown={(e) => {
                            handlePillMouseDown(e, item.dragKey);
                          }}
                          onMouseEnter={() => handleHoverStart(item.dragKey)}
                          onMouseLeave={handleHoverEnd}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPillId(item.dragKey);
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

      {/* Agent Sidebar - only visible in fullscreen mode */}
      {isFullscreen && (
        <AgentSidebar
          isOpen={isAgentSidebarOpen}
          onToggle={() => setIsAgentSidebarOpen(prev => !prev)}
          graphAPI={graphAPI}
          highlights={agentHighlights}
          onHighlightsChange={setAgentHighlights}
          messages={chatMessages}
          onMessagesChange={setChatMessages}
        />
      )}
    </div>
  );
};

export default GraphView;