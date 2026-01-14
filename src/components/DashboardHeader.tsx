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
  const { theme } = useTheme();

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
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: theme.textTertiary }}>
          <div><span style={{ color: theme.textMuted }}>Created:</span> <span style={{ color: theme.textSecondary }}>{createdDate}</span></div>
          <div><span style={{ color: theme.textMuted }}>Created by:</span> <span style={{ color: theme.textSecondary }}>{createdBy}</span></div>
          <div><span style={{ color: theme.textMuted }}>Last modified:</span> <span style={{ color: theme.textSecondary }}>{lastModified}</span></div>
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
