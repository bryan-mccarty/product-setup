import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export interface ViewDefinition {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ViewSwitcherProps {
  views: ViewDefinition[];
  activeView: string;
  onViewChange: (viewId: string) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ views, activeView, onViewChange }) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <div style={{
      display: 'flex',
      background: isDarkMode ? 'rgba(255,255,255,0.03)' : theme.cardBgHover,
      borderRadius: '8px',
      padding: '4px',
      gap: '4px',
    }}>
      {views.map((view) => {
        const isActive = activeView === view.id;

        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            style={{
              padding: '8px 16px',
              width: '100px',
              fontSize: '13px',
              fontWeight: 500,
              background: isActive
                ? 'rgba(45, 212, 191, 0.12)'
                : 'transparent',
              color: isActive ? '#2DD4BF' : theme.textTertiary,
              border: isActive
                ? '1px solid rgba(45, 212, 191, 0.3)'
                : `1px solid ${theme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : theme.cardBgHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {view.icon}
            <span>{view.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewSwitcher;
