import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ViewSwitcher, { ViewDefinition } from './ViewSwitcher';

interface Stats {
  totalProjects: number;
  activeProjects: number;
  totalIdeas: number;
  measuredFormulas: number;
  defaultInputs: number;
  defaultOutcomes: number;
}

interface DashboardHeaderProps {
  categoryName: string;
  createdDate: string;
  createdBy: string;
  lastModified: string;
  stats: Stats;
  views: ViewDefinition[];
  activeView: string;
  onViewChange: (viewId: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  categoryName,
  createdDate,
  createdBy,
  lastModified,
  stats,
  views,
  activeView,
  onViewChange,
}) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  const StatCard = ({ label, value }: { label: string; value: number }) => (
    <div style={{
      padding: '10px 14px',
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      minWidth: '100px',
      flex: '1 1 0'
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: 700,
        color: theme.text,
        fontFamily: "'JetBrains Mono', monospace",
        textAlign: 'center'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '10px',
        color: theme.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginTop: '2px',
        textAlign: 'center'
      }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}` }}>
      {/* Top row: Category name and metadata */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: theme.text }}>
          {categoryName}
        </h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: theme.textTertiary }}>
            <div><span style={{ color: theme.textMuted }}>Created:</span> <span style={{ color: theme.textSecondary }}>{createdDate}</span></div>
            <div><span style={{ color: theme.textMuted }}>Created by:</span> <span style={{ color: theme.textSecondary }}>{createdBy}</span></div>
            <div><span style={{ color: theme.textMuted }}>Last modified:</span> <span style={{ color: theme.textSecondary }}>{lastModified}</span></div>
          </div>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Bottom row: Stats on left, View switcher on right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
        {/* Stats - left side */}
        <div style={{ display: 'flex', gap: '12px', flex: '1 1 auto' }}>
          <StatCard label="Total Projects" value={stats.totalProjects} />
          <StatCard label="Active Projects" value={stats.activeProjects} />
          <StatCard label="Ideas" value={stats.totalIdeas} />
          <StatCard label="Measured Formulas" value={stats.measuredFormulas} />
          <StatCard label="Default Inputs" value={stats.defaultInputs} />
          <StatCard label="Default Outcomes" value={stats.defaultOutcomes} />
        </div>

        {/* View Switcher - right side */}
        <ViewSwitcher views={views} activeView={activeView} onViewChange={onViewChange} />
      </div>
    </div>
  );
};

export default DashboardHeader;
