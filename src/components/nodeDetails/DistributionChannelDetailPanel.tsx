import React from 'react';
import { DistributionChannel } from '../../data/demoLibrary';
import { DetailPanelProps } from '../../types/nodeDetail';

export function DistributionChannelDetailPanel({ item, theme, nodeColor }: DetailPanelProps<DistributionChannel>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Type Badge */}
      {item.type && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            padding: '4px 10px',
            borderRadius: '12px',
            background: `${nodeColor}20`,
            color: nodeColor,
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {item.type}
          </span>
        </div>
      )}

      {/* Empty state if no type */}
      {!item.type && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: theme.textMuted,
          fontSize: '13px',
          background: theme.inputBg,
          borderRadius: '8px',
          border: `1px solid ${theme.borderLight}`,
        }}>
          No additional details available
        </div>
      )}
    </div>
  );
}
