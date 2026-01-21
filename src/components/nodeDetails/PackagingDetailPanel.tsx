import React from 'react';
import { Packaging, DistributionChannel } from '../../data/demoLibrary';
import { DetailPanelProps, FullNodeData } from '../../types/nodeDetail';

interface PackagingDetailPanelProps extends DetailPanelProps<Packaging> {
  fullNodeData?: FullNodeData;
}

export function PackagingDetailPanel({ item, theme, nodeColor, fullNodeData }: PackagingDetailPanelProps) {
  // Resolve channel names from IDs
  const channels: DistributionChannel[] = fullNodeData && item.channelIds
    ? item.channelIds
        .map(id => fullNodeData.distributionChannels.find(ch => ch.id === id))
        .filter((ch): ch is DistributionChannel => ch !== undefined)
    : [];

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

      {/* Distribution Channels */}
      {(channels.length > 0 || (item.channelIds && item.channelIds.length > 0)) && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Distribution Channels ({item.channelIds?.length || 0})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {channels.length > 0 ? (
              channels.map((channel) => (
                <div
                  key={channel.id}
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
                      background: '#6366F1',
                    }} />
                    <span style={{ fontSize: '13px', color: theme.text }}>
                      {channel.name}
                    </span>
                  </div>
                  {channel.type && (
                    <span style={{
                      fontSize: '10px',
                      color: theme.textMuted,
                      padding: '2px 6px',
                      background: theme.cardBg,
                      borderRadius: '4px',
                    }}>
                      {channel.type}
                    </span>
                  )}
                </div>
              ))
            ) : (
              item.channelIds?.map((channelId) => (
                <div
                  key={channelId}
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
                    background: '#6366F1',
                  }} />
                  <span style={{ fontSize: '13px', color: theme.text }}>
                    {channelId}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!item.type && (!item.channelIds || item.channelIds.length === 0) && (
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
