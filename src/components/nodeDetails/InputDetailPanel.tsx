import React from 'react';
import { Input } from '../../data/demoLibrary';
import { DetailPanelProps } from '../../types/nodeDetail';

export function InputDetailPanel({ item, theme, nodeColor }: DetailPanelProps<Input>) {
  const hasRange = item.minValue || item.maxValue || item.suggestedMin || item.suggestedMax;
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
          {item.inputType}
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
        {item.status && (
          <span style={{
            padding: '4px 10px',
            borderRadius: '12px',
            background: item.status === 'confirmed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 146, 60, 0.15)',
            color: item.status === 'confirmed' ? '#22C55E' : '#FB923C',
            fontSize: '11px',
            fontWeight: 500,
          }}>
            {item.status}
          </span>
        )}
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

      {/* Cost */}
      {item.cost !== undefined && item.cost !== null && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          background: theme.inputBg,
          borderRadius: '8px',
          border: `1px solid ${theme.borderLight}`,
        }}>
          <span style={{
            fontSize: '12px',
            color: theme.textMuted,
            fontWeight: 500,
          }}>
            Cost per unit
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: nodeColor,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            ${item.cost.toFixed(2)}
          </span>
        </div>
      )}

      {/* Range (for continuous variables) */}
      {hasRange && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Range
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}>
            <div style={{
              padding: '10px 12px',
              background: theme.inputBg,
              borderRadius: '6px',
              border: `1px solid ${theme.borderLight}`,
            }}>
              <div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '4px' }}>Min</div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: theme.text,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {item.minValue || item.suggestedMin || '—'}
              </div>
            </div>
            <div style={{
              padding: '10px 12px',
              background: theme.inputBg,
              borderRadius: '6px',
              border: `1px solid ${theme.borderLight}`,
            }}>
              <div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '4px' }}>Max</div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: theme.text,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {item.maxValue || item.suggestedMax || '—'}
              </div>
            </div>
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

      {/* Source */}
      {item.source && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '12px', color: theme.textMuted }}>Source</span>
          <span style={{
            fontSize: '12px',
            color: theme.textSecondary,
            fontWeight: 500,
          }}>
            {item.source}
          </span>
        </div>
      )}

      {/* Comment */}
      {item.comment && (
        <div style={{
          padding: '12px',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(251, 191, 36, 0.2)',
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#FBBF24',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '6px',
          }}>
            Note
          </div>
          <p style={{
            fontSize: '12px',
            color: theme.textSecondary,
            lineHeight: 1.5,
            margin: 0,
          }}>
            {item.comment}
          </p>
        </div>
      )}
    </div>
  );
}
