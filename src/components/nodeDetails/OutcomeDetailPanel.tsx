import React from 'react';
import { Outcome } from '../../data/demoLibrary';
import { DetailPanelProps } from '../../types/nodeDetail';

export function OutcomeDetailPanel({ item, theme, nodeColor }: DetailPanelProps<Outcome>) {
  const hasLevels = item.levels && item.levels.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Type & Variable Type */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
          {item.outcomeType}
        </span>
        <span style={{
          padding: '4px 10px',
          borderRadius: '12px',
          background: theme.inputBg,
          color: theme.textSecondary,
          fontSize: '11px',
          fontWeight: 500,
        }}>
          {item.variableType}
        </span>
      </div>

      {/* Description */}
      {item.description && (
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
      )}

      {/* Limits */}
      {item.limits && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '6px',
          }}>
            Typical Range
          </div>
          <div style={{
            padding: '12px 14px',
            background: `${nodeColor}10`,
            borderRadius: '8px',
            border: `1px solid ${nodeColor}30`,
            textAlign: 'center',
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: 600,
              color: nodeColor,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {item.limits}
            </span>
          </div>
        </div>
      )}

      {/* Levels (for ordinal/nominal variables) */}
      {hasLevels && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Levels
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {item.levels!.map((level, idx) => (
              <span
                key={idx}
                style={{
                  padding: '6px 10px',
                  background: theme.inputBg,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: theme.text,
                }}
              >
                {level}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
