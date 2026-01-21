import React from 'react';
import { Formulation, Input, Outcome, ManufacturingSite, Packaging, Competitor } from '../../data/demoLibrary';
import { DetailPanelProps, FullNodeData } from '../../types/nodeDetail';

interface FormulationDetailPanelProps extends DetailPanelProps<Formulation> {
  fullNodeData?: FullNodeData;
}

const TYPE_COLORS: Record<string, string> = {
  internal: '#22C55E',
  competitor: '#EC4899',
  'in-market': '#3B82F6',
};

export function FormulationDetailPanel({ item, theme, nodeColor, fullNodeData }: FormulationDetailPanelProps) {
  // Resolve related entities
  const inputs: Input[] = fullNodeData && item.inputIds
    ? item.inputIds
        .map(id => fullNodeData.inputs.find(input => input.id === id))
        .filter((input): input is Input => input !== undefined)
    : [];

  const outcomes: Outcome[] = fullNodeData && item.outcomeIds
    ? item.outcomeIds
        .map(id => fullNodeData.outcomes.find(outcome => outcome.id === id))
        .filter((outcome): outcome is Outcome => outcome !== undefined)
    : [];

  const mfgSite: ManufacturingSite | undefined = fullNodeData && item.mfgSiteId
    ? fullNodeData.manufacturingSites.find(site => site.id === item.mfgSiteId)
    : undefined;

  const packaging: Packaging | undefined = fullNodeData && item.packagingId
    ? fullNodeData.packaging.find(pkg => pkg.id === item.packagingId)
    : undefined;

  const competitor: Competitor | undefined = fullNodeData && item.competitorId
    ? fullNodeData.competitors.find(comp => comp.id === item.competitorId)
    : undefined;

  const typeColor = item.type ? TYPE_COLORS[item.type] || nodeColor : nodeColor;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Type Badge */}
      {item.type && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            padding: '4px 10px',
            borderRadius: '12px',
            background: `${typeColor}20`,
            color: typeColor,
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {item.type}
          </span>
        </div>
      )}

      {/* Competitor (if competitor formulation) */}
      {competitor && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '6px',
          }}>
            Competitor
          </div>
          <div style={{
            padding: '10px 12px',
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#EC4899',
            }} />
            <span style={{ fontSize: '13px', color: theme.text, fontWeight: 500 }}>
              {competitor.name}
            </span>
          </div>
        </div>
      )}

      {/* Inputs */}
      {(inputs.length > 0 || (item.inputIds && item.inputIds.length > 0)) && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Inputs ({item.inputIds?.length || 0})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {inputs.length > 0 ? (
              inputs.map((input) => (
                <span
                  key={input.id}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(45, 212, 191, 0.1)',
                    border: '1px solid rgba(45, 212, 191, 0.2)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#2DD4BF',
                  }}
                >
                  {input.name}
                </span>
              ))
            ) : (
              item.inputIds?.map((inputId) => (
                <span
                  key={inputId}
                  style={{
                    padding: '6px 10px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: theme.textSecondary,
                  }}
                >
                  {inputId}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Outcomes */}
      {(outcomes.length > 0 || (item.outcomeIds && item.outcomeIds.length > 0)) && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Outcomes Measured ({item.outcomeIds?.length || 0})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {outcomes.length > 0 ? (
              outcomes.map((outcome) => (
                <span
                  key={outcome.id}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(244, 114, 182, 0.1)',
                    border: '1px solid rgba(244, 114, 182, 0.2)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#F472B6',
                  }}
                >
                  {outcome.name}
                </span>
              ))
            ) : (
              item.outcomeIds?.map((outcomeId) => (
                <span
                  key={outcomeId}
                  style={{
                    padding: '6px 10px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: theme.textSecondary,
                  }}
                >
                  {outcomeId}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Manufacturing Site */}
      {(mfgSite || item.mfgSiteId) && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '6px',
          }}>
            Manufacturing Site
          </div>
          <div style={{
            padding: '10px 12px',
            background: theme.inputBg,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#F59E0B',
              }} />
              <span style={{ fontSize: '13px', color: theme.text }}>
                {mfgSite?.name || item.mfgSiteId}
              </span>
            </div>
            {mfgSite?.location && (
              <span style={{
                fontSize: '10px',
                color: theme.textMuted,
                padding: '2px 6px',
                background: theme.cardBg,
                borderRadius: '4px',
              }}>
                {mfgSite.location}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Packaging */}
      {(packaging || item.packagingId) && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '6px',
          }}>
            Packaging
          </div>
          <div style={{
            padding: '10px 12px',
            background: theme.inputBg,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#8B5CF6',
              }} />
              <span style={{ fontSize: '13px', color: theme.text }}>
                {packaging?.name || item.packagingId}
              </span>
            </div>
            {packaging?.type && (
              <span style={{
                fontSize: '10px',
                color: theme.textMuted,
                padding: '2px 6px',
                background: theme.cardBg,
                borderRadius: '4px',
              }}>
                {packaging.type}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
