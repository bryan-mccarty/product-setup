import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  NodeDetailSidebarProps,
  parsePillId,
  getItemFromFullData,
  NODE_COLORS,
  NODE_LABELS,
  NodeTypeId,
} from '../types/nodeDetail';
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
import {
  InputDetailPanel,
  OutcomeDetailPanel,
  ConstraintDetailPanel,
  ObjectiveDetailPanel,
  CalculationDetailPanel,
  SupplierDetailPanel,
  CompetitorDetailPanel,
  PackagingDetailPanel,
  FormulationDetailPanel,
  ManufacturingSiteDetailPanel,
  DistributionChannelDetailPanel,
  ConnectionsPanel,
} from './nodeDetails';

// Node type icons (matching graph_view.tsx)
function NodeIcon({ nodeType, color, size = 20 }: { nodeType: string; color: string; size?: number }) {
  const iconProps = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" };

  switch (nodeType) {
    case 'inputs':
      return (
        <svg {...iconProps}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case 'outcomes':
      return (
        <svg {...iconProps}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'calculations':
      return (
        <svg {...iconProps}>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      );
    case 'constraints':
      return (
        <svg {...iconProps}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      );
    case 'objectives':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'competitors':
      return (
        <svg {...iconProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'packaging':
      return (
        <svg {...iconProps}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case 'data':
      return (
        <svg {...iconProps}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'manufacturingSites':
      return (
        <svg {...iconProps}>
          <path d="M3 21h18" />
          <path d="M5 21V7l8-4v18" />
          <path d="M19 21V11l-6-4" />
          <path d="M9 9v.01" />
          <path d="M9 12v.01" />
          <path d="M9 15v.01" />
          <path d="M9 18v.01" />
        </svg>
      );
    case 'suppliers':
      return (
        <svg {...iconProps}>
          <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case 'distributionChannels':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export function NodeDetailSidebar({
  isOpen,
  onClose,
  selectedPillId,
  fullNodeData,
  connections,
  nodeItems,
  onNavigateToPill,
}: NodeDetailSidebarProps) {
  const { theme, isDarkMode } = useTheme();

  // Parse the selected pill ID
  const parsedPill = useMemo(() => {
    if (!selectedPillId) return null;
    return parsePillId(selectedPillId);
  }, [selectedPillId]);

  // Get the item info from nodeItems
  const itemInfo = useMemo(() => {
    if (!parsedPill) return null;
    const items = nodeItems[parsedPill.nodeType];
    if (!items) return null;
    return items.find(item => item.id === parsedPill.itemId) || null;
  }, [parsedPill, nodeItems]);

  // Get the full item data
  const itemData = useMemo(() => {
    if (!parsedPill) return null;
    return getItemFromFullData(parsedPill.nodeType, parsedPill.itemId, fullNodeData);
  }, [parsedPill, fullNodeData]);

  // Get node color
  const nodeColor = useMemo(() => {
    if (!parsedPill) return '#888888';
    const colors = NODE_COLORS[parsedPill.nodeType];
    return colors ? (isDarkMode ? colors.dark : colors.light) : '#888888';
  }, [parsedPill, isDarkMode]);

  // Get node label
  const nodeLabel = parsedPill ? NODE_LABELS[parsedPill.nodeType] || parsedPill.nodeType : '';

  // Theme object for detail panels
  const panelTheme = {
    text: theme.text,
    textSecondary: theme.textSecondary,
    textMuted: theme.textMuted,
    textTertiary: theme.textTertiary,
    cardBg: theme.cardBg,
    border: theme.border,
    borderLight: theme.borderLight,
    inputBg: theme.inputBg,
  };

  // Render the appropriate detail panel based on node type
  const renderDetailPanel = () => {
    if (!parsedPill || !itemData) return null;

    switch (parsedPill.nodeType) {
      case 'inputs':
        return <InputDetailPanel item={itemData as Input} theme={panelTheme} nodeColor={nodeColor} />;
      case 'outcomes':
        return <OutcomeDetailPanel item={itemData as Outcome} theme={panelTheme} nodeColor={nodeColor} />;
      case 'constraints':
        return <ConstraintDetailPanel item={itemData as Constraint} theme={panelTheme} nodeColor={nodeColor} />;
      case 'objectives':
        return <ObjectiveDetailPanel item={itemData as Objective} theme={panelTheme} nodeColor={nodeColor} />;
      case 'calculations':
        return <CalculationDetailPanel item={itemData as Calculation} theme={panelTheme} nodeColor={nodeColor} />;
      case 'suppliers':
        return <SupplierDetailPanel item={itemData as Supplier} theme={panelTheme} nodeColor={nodeColor} fullNodeData={fullNodeData} />;
      case 'competitors':
        return <CompetitorDetailPanel item={itemData as Competitor} theme={panelTheme} nodeColor={nodeColor} />;
      case 'packaging':
        return <PackagingDetailPanel item={itemData as Packaging} theme={panelTheme} nodeColor={nodeColor} fullNodeData={fullNodeData} />;
      case 'data':
        return <FormulationDetailPanel item={itemData as Formulation} theme={panelTheme} nodeColor={nodeColor} fullNodeData={fullNodeData} />;
      case 'manufacturingSites':
        return <ManufacturingSiteDetailPanel item={itemData as ManufacturingSite} theme={panelTheme} nodeColor={nodeColor} fullNodeData={fullNodeData} />;
      case 'distributionChannels':
        return <DistributionChannelDetailPanel item={itemData as DistributionChannel} theme={panelTheme} nodeColor={nodeColor} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '320px',
          background: theme.sidebarBg,
          borderRight: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease-out',
          zIndex: 50,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}>
          {/* Icon */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${nodeColor}15`,
            border: `1px solid ${nodeColor}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {parsedPill && <NodeIcon nodeType={parsedPill.nodeType} color={nodeColor} size={20} />}
          </div>

          {/* Title & Subtitle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: theme.text,
              lineHeight: 1.3,
              wordBreak: 'break-word',
            }}>
              {itemInfo?.name || 'Unknown Item'}
            </h3>
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: `${nodeColor}15`,
              color: nodeColor,
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {nodeLabel}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'transparent',
              border: `1px solid ${theme.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.inputBg;
              e.currentTarget.style.borderColor = theme.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = theme.borderLight;
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}>
          {renderDetailPanel()}

          {/* Connections Panel */}
          {parsedPill && itemInfo && (
            <ConnectionsPanel
              connections={connections}
              selectedNodeId={parsedPill.nodeType}
              selectedItemId={itemInfo.id}
              nodeItems={nodeItems}
              fullNodeData={fullNodeData}
              onNavigate={onNavigateToPill}
              theme={panelTheme}
            />
          )}
        </div>
      </div>

      {/* Toggle button when closed */}
      {!isOpen && selectedPillId && (
        <button
          onClick={() => {/* Parent handles this via selectedPillId */}}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '80px',
            borderRadius: '0 8px 8px 0',
            background: theme.sidebarBg,
            border: `1px solid ${theme.border}`,
            borderLeft: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 40,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </>
  );
}
