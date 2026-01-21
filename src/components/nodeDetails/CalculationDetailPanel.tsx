import React from 'react';
import { Calculation } from '../../data/demoLibrary';
import { DetailPanelProps } from '../../types/nodeDetail';

export function CalculationDetailPanel({ item, theme, nodeColor }: DetailPanelProps<Calculation>) {
  const hasTerms = item.terms && item.terms.length > 0;

  // Build formula string from terms
  const formulaString = hasTerms
    ? item.terms!
        .map((term, idx) => {
          const sign = term.coefficient >= 0 && idx > 0 ? '+' : '';
          const coef = term.coefficient === 1 ? '' : term.coefficient === -1 ? '-' : term.coefficient.toString();
          return `${sign}${coef}${term.inputName}`;
        })
        .join(' ')
    : item.formula;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Unit badge */}
      {item.unit && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            padding: '4px 10px',
            borderRadius: '12px',
            background: `${nodeColor}20`,
            color: nodeColor,
            fontSize: '11px',
            fontWeight: 600,
          }}>
            Unit: {item.unit}
          </span>
        </div>
      )}

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

      {/* Formula */}
      {formulaString && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Formula
          </div>
          <div style={{
            padding: '12px 14px',
            background: theme.inputBg,
            borderRadius: '8px',
            border: `1px solid ${theme.borderLight}`,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            color: nodeColor,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}>
            {item.name} = {formulaString}
          </div>
        </div>
      )}

      {/* Terms table (for linear calculations) */}
      {hasTerms && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Input Terms
          </div>
          <div style={{
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px',
              padding: '8px 12px',
              background: theme.inputBg,
              borderBottom: `1px solid ${theme.borderLight}`,
            }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Input
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'right',
              }}>
                Coefficient
              </span>
            </div>
            {/* Rows */}
            {item.terms!.map((term, idx) => (
              <div
                key={term.inputId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px',
                  padding: '10px 12px',
                  borderBottom: idx < item.terms!.length - 1 ? `1px solid ${theme.borderLight}` : 'none',
                }}
              >
                <span style={{
                  fontSize: '13px',
                  color: theme.text,
                }}>
                  {term.inputName}
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: term.coefficient >= 0 ? '#22C55E' : '#F87171',
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: 'right',
                }}>
                  {term.coefficient >= 0 ? '+' : ''}{term.coefficient}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
