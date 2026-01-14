import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

const AppHeader: React.FC = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { loadFullDemoMode } = useData();

  return (
    <div style={{
      width: '100%',
      height: '48px',
      background: theme.background,
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      {/* Demo Mode Button */}
      <button
        onClick={loadFullDemoMode}
        style={{
          padding: '6px 12px',
          fontSize: '13px',
          fontWeight: 500,
          background: theme.inputBg,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.cardBgHover;
          e.currentTarget.style.borderColor = theme.borderStrong;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = theme.inputBg;
          e.currentTarget.style.borderColor = theme.border;
        }}
        title="Load Full Demo Data"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        Demo Mode
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          padding: '6px',
          fontSize: '13px',
          fontWeight: 500,
          background: theme.inputBg,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '32px',
          width: '32px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.cardBgHover;
          e.currentTarget.style.borderColor = theme.borderStrong;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = theme.inputBg;
          e.currentTarget.style.borderColor = theme.border;
        }}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default AppHeader;
