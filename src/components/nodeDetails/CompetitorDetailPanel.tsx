import React from 'react';
import { Competitor } from '../../data/demoLibrary';
import { DetailPanelProps } from '../../types/nodeDetail';

export function CompetitorDetailPanel({ item, theme, nodeColor }: DetailPanelProps<Competitor>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Description */}
      {item.description ? (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '6px',
          }}>
            Description
          </div>
          <p style={{
            fontSize: '13px',
            color: theme.textSecondary,
            lineHeight: 1.5,
            margin: 0,
          }}>
            {item.description}
          </p>
        </div>
      ) : (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: theme.textMuted,
          fontSize: '13px',
          background: theme.inputBg,
          borderRadius: '8px',
          border: `1px solid ${theme.borderLight}`,
        }}>
          No description available
        </div>
      )}
    </div>
  );
}
