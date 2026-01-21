import React from 'react';
import { Constraint } from '../../data/demoLibrary';
import { DetailPanelProps } from '../../types/nodeDetail';

const CONSTRAINT_TYPE_LABELS: Record<string, string> = {
  between: 'Between',
  at_least: 'At Least',
  at_most: 'At Most',
  equals: 'Equals',
};

const TAG_COLORS: Record<string, string> = {
  Regulatory: '#F59E0B',
  'Cost Control': '#22C55E',
  Quality: '#3B82F6',
  Safety: '#EF4444',
  Nutrition: '#8B5CF6',
};

export function ConstraintDetailPanel({ item, theme, nodeColor }: DetailPanelProps<Constraint>) {
  const typeLabel = CONSTRAINT_TYPE_LABELS[item.constraintType] || item.constraintType;

  // Format the constraint value display
  const formatValue = () => {
    switch (item.constraintType) {
      case 'between':
        return `${item.value1} — ${item.value2}`;
      case 'at_least':
        return `≥ ${item.value1}`;
      case 'at_most':
        return `≤ ${item.value1}`;
      case 'equals':
        return `= ${item.value1}`;
      default:
        return item.value1;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Constraint Type Badge */}
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
          {typeLabel}
        </span>
      </div>

      {/* Target */}
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          color: theme.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '6px',
        }}>
          Constrains
        </div>
        <div style={{
          padding: '12px 14px',
          background: theme.inputBg,
          borderRadius: '8px',
          border: `1px solid ${theme.borderLight}`,
          fontSize: '14px',
          fontWeight: 500,
          color: theme.text,
        }}>
          {item.targetName}
        </div>
      </div>

      {/* Value */}
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          color: theme.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '6px',
        }}>
          Value
        </div>
        <div style={{
          padding: '16px',
          background: `${nodeColor}10`,
          borderRadius: '8px',
          border: `1px solid ${nodeColor}30`,
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            color: nodeColor,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {formatValue()}
          </span>
        </div>
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Tags
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {item.tags.map((tag, idx) => {
              const tagColor = TAG_COLORS[tag] || theme.textSecondary;
              return (
                <span
                  key={idx}
                  style={{
                    padding: '5px 10px',
                    background: `${tagColor}15`,
                    border: `1px solid ${tagColor}30`,
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: tagColor,
                  }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
