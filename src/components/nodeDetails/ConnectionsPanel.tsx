import React, { useState, useMemo } from 'react';
import { ConnectionsPanelProps, NODE_COLORS, NODE_LABELS, NodeTypeId } from '../../types/nodeDetail';

const RELATIONSHIP_LABELS: Record<string, string> = {
  constrained_by: 'Constrained By',
  used_in: 'Used In',
  supplies: 'Supplied By',
  measured_in: 'Measured In',
  produced_at: 'Produced At',
  packaged_in: 'Packaged In',
  owns: 'Owned By',
  distributed_via: 'Distributed Via',
  ships_to: 'Ships To',
};

interface GroupedConnection {
  relationshipType: string;
  direction: 'incoming' | 'outgoing';
  nodeId: string;
  itemId: string;
  itemName: string;
}

export function ConnectionsPanel({
  connections,
  selectedNodeId,
  selectedItemId,
  nodeItems,
  onNavigate,
  theme,
}: ConnectionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get all connections for the selected item, grouped by relationship type
  const groupedConnections = useMemo(() => {
    const groups: Record<string, GroupedConnection[]> = {};

    connections.forEach(conn => {
      let direction: 'incoming' | 'outgoing' | null = null;
      let otherNodeId: string = '';
      let otherItemId: string = '';

      // Check if this connection involves our selected item
      if (conn.fromNodeId === selectedNodeId && conn.fromItemId === selectedItemId) {
        direction = 'outgoing';
        otherNodeId = conn.toNodeId;
        otherItemId = conn.toItemId;
      } else if (conn.toNodeId === selectedNodeId && conn.toItemId === selectedItemId) {
        direction = 'incoming';
        otherNodeId = conn.fromNodeId;
        otherItemId = conn.fromItemId;
      }

      if (direction && otherNodeId) {
        // Find the item name
        const items = nodeItems[otherNodeId] || [];
        const item = items.find(i => i.id === otherItemId);
        const itemName = item?.name || otherItemId;

        const key = `${conn.relationshipType}-${direction}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push({
          relationshipType: conn.relationshipType,
          direction,
          nodeId: otherNodeId,
          itemId: otherItemId,
          itemName,
        });
      }
    });

    return groups;
  }, [connections, selectedNodeId, selectedItemId, nodeItems]);

  const hasConnections = Object.keys(groupedConnections).length > 0;

  if (!hasConnections) {
    return null;
  }

  return (
    <div style={{
      borderTop: `1px solid ${theme.border}`,
      marginTop: '8px',
    }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          color: theme.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          Connections
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.textMuted}
          strokeWidth="2"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Connection groups */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '8px' }}>
          {Object.entries(groupedConnections).map(([key, conns]) => {
            const [relationshipType, direction] = key.split('-');
            const label = RELATIONSHIP_LABELS[relationshipType] || relationshipType;
            const isIncoming = direction === 'incoming';

            return (
              <div key={key}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  color: theme.textTertiary,
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  {isIncoming ? '←' : '→'} {label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {conns.map((conn, idx) => {
                    const nodeColor = NODE_COLORS[conn.nodeId as NodeTypeId];
                    const color = nodeColor ? (theme.textMuted.includes('a1a1aa') ? nodeColor.dark : nodeColor.light) : theme.textSecondary;
                    const nodeLabel = NODE_LABELS[conn.nodeId as NodeTypeId] || conn.nodeId;
                    const pillKey = `${conn.nodeId}-${conn.itemId}`;

                    return (
                      <button
                        key={idx}
                        onClick={() => onNavigate?.(pillKey)}
                        style={{
                          padding: '8px 10px',
                          background: theme.inputBg,
                          border: `1px solid ${theme.borderLight}`,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: onNavigate ? 'pointer' : 'default',
                          transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (onNavigate) {
                            e.currentTarget.style.borderColor = color;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = theme.borderLight;
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: color,
                          }} />
                          <span style={{
                            fontSize: '12px',
                            color: theme.text,
                          }}>
                            {conn.itemName}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '9px',
                          color: color,
                          padding: '2px 6px',
                          background: `${color}15`,
                          borderRadius: '4px',
                          fontWeight: 500,
                        }}>
                          {nodeLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
