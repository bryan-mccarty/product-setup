import React from 'react';
import { Objective } from '../../data/demoLibrary';
import { DetailPanelProps } from '../../types/nodeDetail';

const OBJECTIVE_TYPE_LABELS: Record<string, string> = {
  maximize: 'Maximize',
  minimize: 'Minimize',
  between: 'Target Range',
  target: 'Target Value',
};

const OBJECTIVE_TYPE_ICONS: Record<string, string> = {
  maximize: '↑',
  minimize: '↓',
  between: '↔',
  target: '◎',
};

const TAG_COLORS: Record<string, string> = {
  Primary: '#3B82F6',
  Secondary: '#8B5CF6',
  'Consumer Focus': '#EC4899',
  'Cost Reduction': '#22C55E',
};

export function ObjectiveDetailPanel({ item, theme, nodeColor }: DetailPanelProps<Objective>) {
  const typeLabel = OBJECTIVE_TYPE_LABELS[item.objectiveType] || item.objectiveType;
  const typeIcon = OBJECTIVE_TYPE_ICONS[item.objectiveType] || '';

  // Format the objective value display
  const formatValue = () => {
    switch (item.objectiveType) {
      case 'between':
        return `${item.value1} — ${item.value2}`;
      case 'maximize':
      case 'minimize':
        return item.value1 ? `Target: ${item.value1}` : '—';
      case 'target':
        return item.value1;
      default:
        return item.value1;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Objective Type Badge */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{
          padding: '4px 10px',
          borderRadius: '12px',
          background: `${nodeColor}20`,
          color: nodeColor,
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span style={{ fontSize: '14px' }}>{typeIcon}</span>
          {typeLabel}
        </span>
        {item.isPrerequisite && (
          <span style={{
            padding: '4px 10px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#EF4444',
            fontSize: '11px',
            fontWeight: 600,
          }}>
            Prerequisite
          </span>
        )}
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
          Optimizes
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
          Goal
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

      {/* Success Criteria */}
      {item.successCriteria && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '6px',
          }}>
            Success Criteria
          </div>
          <div style={{
            padding: '12px 14px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            fontSize: '14px',
            fontWeight: 600,
            color: '#22C55E',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {item.successCriteria}
          </div>
        </div>
      )}

      {/* Priority & Weight */}
      {(item.priority !== undefined || item.weight !== undefined || item.chips !== undefined) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '8px',
        }}>
          {item.priority !== undefined && (
            <div style={{
              padding: '10px 12px',
              background: theme.inputBg,
              borderRadius: '6px',
              border: `1px solid ${theme.borderLight}`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '4px' }}>Priority</div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: theme.text,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                #{item.priority}
              </div>
            </div>
          )}
          {item.weight !== undefined && (
            <div style={{
              padding: '10px 12px',
              background: theme.inputBg,
              borderRadius: '6px',
              border: `1px solid ${theme.borderLight}`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '4px' }}>Weight</div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: theme.text,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {item.weight}%
              </div>
            </div>
          )}
          {item.chips !== undefined && (
            <div style={{
              padding: '10px 12px',
              background: theme.inputBg,
              borderRadius: '6px',
              border: `1px solid ${theme.borderLight}`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '4px' }}>Chips</div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: theme.text,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {item.chips}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dependencies */}
      {item.dependsOn && item.dependsOn.length > 0 && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Depends On
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {item.dependsOn.map((depId, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 12px',
                  background: theme.inputBg,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: theme.textSecondary,
                }}
              >
                {depId}
              </div>
            ))}
          </div>
        </div>
      )}

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
