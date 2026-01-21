import React from 'react';
import { Supplier, Input, Packaging } from '../../data/demoLibrary';
import { DetailPanelProps, FullNodeData } from '../../types/nodeDetail';

interface SupplierDetailPanelProps extends DetailPanelProps<Supplier> {
  fullNodeData?: FullNodeData;
}

export function SupplierDetailPanel({ item, theme, nodeColor, fullNodeData }: SupplierDetailPanelProps) {
  // Resolve input names from IDs
  const suppliedInputs: Input[] = fullNodeData
    ? item.suppliesInputIds
        .map(id => fullNodeData.inputs.find(input => input.id === id))
        .filter((input): input is Input => input !== undefined)
    : [];

  // Resolve packaging names from IDs
  const suppliedPackaging: Packaging[] = fullNodeData && item.suppliesPackagingIds
    ? item.suppliesPackagingIds
        .map(id => fullNodeData.packaging.find(pkg => pkg.id === id))
        .filter((pkg): pkg is Packaging => pkg !== undefined)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Supplies Inputs */}
      {(suppliedInputs.length > 0 || item.suppliesInputIds.length > 0) && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Supplies Inputs ({item.suppliesInputIds.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {suppliedInputs.length > 0 ? (
              suppliedInputs.map((input) => (
                <div
                  key={input.id}
                  style={{
                    padding: '10px 12px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#2DD4BF',
                    }} />
                    <span style={{ fontSize: '13px', color: theme.text }}>
                      {input.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: theme.textMuted,
                    padding: '2px 6px',
                    background: theme.cardBg,
                    borderRadius: '4px',
                  }}>
                    {input.inputType}
                  </span>
                </div>
              ))
            ) : (
              // Fallback to just showing IDs if we don't have full data
              item.suppliesInputIds.map((inputId) => (
                <div
                  key={inputId}
                  style={{
                    padding: '10px 12px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#2DD4BF',
                  }} />
                  <span style={{ fontSize: '13px', color: theme.text }}>
                    {inputId}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Supplies Packaging */}
      {(suppliedPackaging.length > 0 || (item.suppliesPackagingIds && item.suppliesPackagingIds.length > 0)) && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Supplies Packaging ({item.suppliesPackagingIds?.length || 0})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {suppliedPackaging.length > 0 ? (
              suppliedPackaging.map((pkg) => (
                <div
                  key={pkg.id}
                  style={{
                    padding: '10px 12px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#8B5CF6',
                    }} />
                    <span style={{ fontSize: '13px', color: theme.text }}>
                      {pkg.name}
                    </span>
                  </div>
                  {pkg.type && (
                    <span style={{
                      fontSize: '10px',
                      color: theme.textMuted,
                      padding: '2px 6px',
                      background: theme.cardBg,
                      borderRadius: '4px',
                    }}>
                      {pkg.type}
                    </span>
                  )}
                </div>
              ))
            ) : (
              item.suppliesPackagingIds?.map((pkgId) => (
                <div
                  key={pkgId}
                  style={{
                    padding: '10px 12px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#8B5CF6',
                  }} />
                  <span style={{ fontSize: '13px', color: theme.text }}>
                    {pkgId}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {item.suppliesInputIds.length === 0 && (!item.suppliesPackagingIds || item.suppliesPackagingIds.length === 0) && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: theme.textMuted,
          fontSize: '13px',
        }}>
          No supplies configured
        </div>
      )}
    </div>
  );
}
