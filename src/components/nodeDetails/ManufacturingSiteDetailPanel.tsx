import React from 'react';
import { ManufacturingSite, DistributionChannel } from '../../data/demoLibrary';
import { DetailPanelProps, FullNodeData } from '../../types/nodeDetail';

interface ManufacturingSiteDetailPanelProps extends DetailPanelProps<ManufacturingSite> {
  fullNodeData?: FullNodeData;
}

export function ManufacturingSiteDetailPanel({ item, theme, nodeColor, fullNodeData }: ManufacturingSiteDetailPanelProps) {
  // Resolve channel names from IDs
  const channels: DistributionChannel[] = fullNodeData && item.channelIds
    ? item.channelIds
        .map(id => fullNodeData.distributionChannels.find(ch => ch.id === id))
        .filter((ch): ch is DistributionChannel => ch !== undefined)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Location */}
      {item.location && (
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '6px',
          }}>
            Location
          </div>
          <div style={{
            padding: '12px 14px',
            background: `${nodeColor}10`,
            borderRadius: '8px',
            border: `1px solid ${nodeColor}30`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={nodeColor} strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: theme.text,
            }}>
              {item.location}
            </span>
          </div>
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
            Ships To ({item.channelIds?.length || 0})
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
      {!item.location && (!item.channelIds || item.channelIds.length === 0) && (
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
