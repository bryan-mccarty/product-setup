import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface Project {
  id: string;
  name: string;
  roundsCompleted: number;
  owner: string;
  dateModified: string;
  starred: boolean;
  status: {
    current: number;
    projectedMean: number;
    projectedStd: number;
  };
}

interface Idea {
  id: string;
  name: string;
  fidelity: number;
  source: string;
  dateModified: string;
  starred: boolean;
  status: {
    current: number;
    projectedMean: number;
    projectedStd: number;
  };
}

interface ProjectsViewProps {
  projects: Project[];
  ideas: Idea[];
  onToggleProjectStar: (id: string) => void;
  onToggleIdeaStar: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteIdea: (id: string) => void;
  onPromoteIdea: (id: string) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  ideas,
  onToggleProjectStar,
  onToggleIdeaStar,
  onDeleteProject,
  onDuplicateProject,
  onDeleteIdea,
  onPromoteIdea,
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Projects state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('modified');
  const [sortDir, setSortDir] = useState('desc');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ideas state
  const [ideasSearchQuery, setIdeasSearchQuery] = useState('');
  const [openIdeasMenuId, setOpenIdeasMenuId] = useState<string | null>(null);
  const ideasMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
      if (ideasMenuRef.current && !ideasMenuRef.current.contains(e.target as Node)) setOpenIdeasMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(column); setSortDir('desc'); }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '3px', transform: sortDir === 'asc' ? 'rotate(180deg)' : 'none', opacity: 0.7 }}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    );
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.owner.toLowerCase().includes(searchQuery.toLowerCase());
      if (statusFilter === 'All') return matchesSearch;
      if (statusFilter === 'Starred') return matchesSearch && p.starred;
      if (statusFilter === 'Not Started') return matchesSearch && p.roundsCompleted === 0;
      if (statusFilter === 'In Progress') return matchesSearch && p.roundsCompleted > 0 && p.status.current < 80;
      if (statusFilter === 'High Confidence') return matchesSearch && p.status.current >= 80;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (a.starred !== b.starred) return b.starred ? 1 : -1;
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'rounds') cmp = a.roundsCompleted - b.roundsCompleted;
      else if (sortBy === 'owner') cmp = a.owner.localeCompare(b.owner);
      else if (sortBy === 'modified') cmp = new Date(a.dateModified).getTime() - new Date(b.dateModified).getTime();
      else if (sortBy === 'status') cmp = a.status.current - b.status.current;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const filteredIdeas = ideas
    .filter(i => i.name.toLowerCase().includes(ideasSearchQuery.toLowerCase()) || i.id.toLowerCase().includes(ideasSearchQuery.toLowerCase()) || i.source.toLowerCase().includes(ideasSearchQuery.toLowerCase()))
    .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Status Visualization with all original details
  const StatusVisualization = ({ current, projectedMean, projectedStd, compact = false }: { current: number; projectedMean: number; projectedStd: number; compact?: boolean }) => {
    const width = compact ? 130 : 150;
    const height = compact ? 32 : 36;
    const padding = { left: 8, right: 8, top: 6, bottom: 14 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (current === 0 && projectedMean === 0) {
      return (
        <div style={{ width: `${width}px`, height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '9px', color: theme.textMuted, fontStyle: 'italic' }}>Not started</span>
        </div>
      );
    }

    const generateGaussianPath = (mean: number, std: number, baseY: number) => {
      const points: { x: number; y: number }[] = [];
      const numPoints = 50;
      const rangeMultiplier = 3;
      const meanX = padding.left + (mean / 100) * chartWidth;
      const stdX = (std / 100) * chartWidth;
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * 2 - 1;
        const x = meanX + t * stdX * rangeMultiplier;
        const normalizedX = t * rangeMultiplier;
        const y = Math.exp(-0.5 * normalizedX * normalizedX);
        const maxHeight = chartHeight * 0.9;
        const scaledY = baseY - y * maxHeight * (1 - std / 30);
        if (x >= padding.left && x <= width - padding.right) points.push({ x, y: scaledY });
      }
      return points;
    };

    const baseY = height - padding.bottom;
    const curvePoints = generateGaussianPath(projectedMean, projectedStd, baseY);
    const pathD = curvePoints.length > 0 ? `M ${curvePoints[0].x} ${baseY} ` + curvePoints.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${curvePoints[curvePoints.length - 1].x} ${baseY} Z` : '';
    const currentX = padding.left + (current / 100) * chartWidth;
    const projectedMeanX = padding.left + (projectedMean / 100) * chartWidth;
    const improvement = projectedMean - current;
    const curveColor = improvement > 15 ? '#22C55E' : improvement > 5 ? '#60A5FA' : '#A78BFA';

    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <rect x={padding.left} y={baseY - 1} width={chartWidth} height={2} fill={theme.borderStrong} rx={1} />
        {[0, 25, 50, 75, 100].map(tick => (
          <line key={tick} x1={padding.left + (tick / 100) * chartWidth} y1={baseY + 2} x2={padding.left + (tick / 100) * chartWidth} y2={baseY + 5} stroke={theme.border} strokeWidth={1} />
        ))}
        {pathD && <path d={pathD} fill={`${curveColor}20`} stroke="none" />}
        {curvePoints.length > 0 && (
          <path d={curvePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke={curveColor} strokeWidth={1.5} strokeLinecap="round" />
        )}
        <line x1={projectedMeanX} y1={baseY - chartHeight * 0.7} x2={projectedMeanX} y2={baseY} stroke={curveColor} strokeWidth={1} strokeDasharray="2,2" opacity={0.6} />
        <circle cx={currentX} cy={baseY} r={4} fill={theme.text} stroke={theme.border} strokeWidth={2} />
        <text x={currentX} y={baseY - 8} textAnchor="middle" fill={theme.text} fontSize="9" fontWeight="600" fontFamily="'JetBrains Mono', monospace">{current}</text>
        <text x={padding.left} y={baseY + 11} textAnchor="start" fill={theme.textMuted} fontSize="8" fontFamily="'Inter', sans-serif">0</text>
        <text x={width - padding.right} y={baseY + 11} textAnchor="end" fill={theme.textMuted} fontSize="8" fontFamily="'Inter', sans-serif">100</text>
      </svg>
    );
  };

  return (
    <div style={{ flex: 1, padding: '20px 24px', minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        .table-row { transition: background 0.1s ease; }
        .table-row:hover { background: ${theme.rowHoverBg}; }
        .star-btn { transition: all 0.15s ease; }
        .star-btn:hover { transform: scale(1.15); }
        .menu-btn { opacity: 0; transition: opacity 0.15s ease; }
        .table-row:hover .menu-btn { opacity: 1; }
        .sort-header { cursor: pointer; user-select: none; transition: color 0.15s ease; }
        .sort-header:hover { color: #A1A1AA; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      {/* Scrollable Content */}
      <div className="custom-scrollbar" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>

      {/* Projects Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme.text }}>Projects</h2>
        </div>

        {/* Search, Filters, New Project */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '0 0 200px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search projects..." style={{ width: '100%', padding: '7px 10px 7px 32px', fontSize: '12px', background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, borderRadius: '6px', color: theme.text, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['All', 'Starred', 'In Progress', 'High Confidence', 'Not Started'].map((filter) => (
              <button key={filter} onClick={() => setStatusFilter(filter)} style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 500, background: statusFilter === filter ? 'rgba(45, 212, 191, 0.12)' : theme.cardBg, color: statusFilter === filter ? '#2DD4BF' : theme.textTertiary, border: statusFilter === filter ? '1px solid rgba(45, 212, 191, 0.3)' : `1px solid ${theme.border}`, borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {filter === 'Starred' && <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
                {filter}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => navigate('/project/new/step-1')} style={{ padding: '7px 12px', fontSize: '11px', fontWeight: 600, background: 'linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%)', color: '#0a0a0f', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(45, 212, 191, 0.3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Project
          </button>
        </div>

        {/* Projects Table */}
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}`, background: theme.cardBgDark }}>
                <th style={{ width: '36px', padding: '10px 6px' }}></th>
                <th className="sort-header" onClick={() => handleSort('name')} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '200px', cursor: 'pointer', userSelect: 'none' }}><div style={{ display: 'flex', alignItems: 'center' }}>ID / Name<SortIcon column="name" /></div></th>
                <th className="sort-header" onClick={() => handleSort('rounds')} style={{ padding: '10px 8px', textAlign: 'center', fontSize: '9px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '80px', cursor: 'pointer', userSelect: 'none' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Rounds<SortIcon column="rounds" /></div></th>
                <th className="sort-header" onClick={() => handleSort('owner')} style={{ padding: '10px 8px', textAlign: 'left', fontSize: '9px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '120px', cursor: 'pointer', userSelect: 'none' }}><div style={{ display: 'flex', alignItems: 'center' }}>Owner<SortIcon column="owner" /></div></th>
                <th className="sort-header" onClick={() => handleSort('modified')} style={{ padding: '10px 8px', textAlign: 'left', fontSize: '9px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '90px', cursor: 'pointer', userSelect: 'none' }}><div style={{ display: 'flex', alignItems: 'center' }}>Modified<SortIcon column="modified" /></div></th>
                <th className="sort-header" onClick={() => handleSort('status')} style={{ padding: '10px 8px', textAlign: 'left', fontSize: '9px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '180px', cursor: 'pointer', userSelect: 'none' }}><div style={{ display: 'flex', alignItems: 'center' }}>Status<SortIcon column="status" /></div></th>
                <th style={{ width: '40px', padding: '10px 6px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center' }}><p style={{ margin: 0, fontSize: '12px', color: theme.textTertiary }}>No projects found</p></td></tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="table-row" style={{ borderBottom: `1px solid ${theme.borderLight}`, cursor: 'pointer' }}>
                    <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                      <button className="star-btn" onClick={(e) => { e.stopPropagation(); onToggleProjectStar(project.id); }} style={{ padding: '3px', background: 'transparent', border: 'none', cursor: 'pointer', color: project.starred ? '#FBBF24' : theme.textSecondary, transition: 'all 0.15s ease' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={project.starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </button>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '3px 6px', borderRadius: '3px', background: 'rgba(167, 139, 250, 0.12)', color: '#A78BFA', fontSize: '10px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', flexShrink: 0 }}>{project.id}</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}><span style={{ fontSize: '12px', fontWeight: 600, color: project.roundsCompleted > 0 ? theme.text : theme.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{project.roundsCompleted}</span></td>
                    <td style={{ padding: '10px 8px' }}><span style={{ fontSize: '12px', color: theme.textSecondary }}>{project.owner}</span></td>
                    <td style={{ padding: '10px 8px' }}><span style={{ fontSize: '11px', color: theme.textTertiary }}>{formatDate(project.dateModified)}</span></td>
                    <td style={{ padding: '10px 8px' }}><StatusVisualization current={project.status.current} projectedMean={project.status.projectedMean} projectedStd={project.status.projectedStd} /></td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', position: 'relative' }}>
                      <button className="menu-btn" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === project.id ? null : project.id); }} style={{ padding: '4px', background: openMenuId === project.id ? theme.cardBgHover : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', color: theme.textTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                      </button>
                      {openMenuId === project.id && (
                        <div ref={menuRef} style={{ position: 'absolute', top: '100%', right: '6px', marginTop: '4px', background: theme.modalBg, border: `1px solid ${theme.border}`, borderRadius: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100, minWidth: '140px', overflow: 'hidden', animation: 'fadeIn 0.1s ease-out' }}>
                          <button onClick={() => { onDuplicateProject(project.id); setOpenMenuId(null); }} style={{ width: '100%', padding: '8px 12px', fontSize: '12px', background: 'transparent', border: 'none', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = theme.cardBgHover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Duplicate
                          </button>
                          <button onClick={() => setOpenMenuId(null)} style={{ width: '100%', padding: '8px 12px', fontSize: '12px', background: 'transparent', border: 'none', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = theme.cardBgHover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>Archive
                          </button>
                          <div style={{ height: '1px', background: theme.borderLight, margin: '4px 0' }} />
                          <button onClick={() => { onDeleteProject(project.id); setOpenMenuId(null); }} style={{ width: '100%', padding: '8px 12px', fontSize: '12px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ marginTop: '10px', padding: '8px 12px', background: theme.cardBg, border: `1px solid ${theme.borderLight}`, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '9px', color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legend:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E4E4E7', border: '2px solid #0a0a0f' }} /><span style={{ fontSize: '10px', color: theme.textTertiary }}>Current desirability</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '16px', height: '8px', background: 'linear-gradient(90deg, rgba(96, 165, 250, 0.1), rgba(96, 165, 250, 0.4), rgba(96, 165, 250, 0.1))', borderRadius: '3px' }} /><span style={{ fontSize: '10px', color: theme.textTertiary }}>Projected range</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '0', borderTop: '1px dashed #60A5FA' }} /><span style={{ fontSize: '10px', color: theme.textTertiary }}>Projected mean</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '2px', background: '#22C55E' }} /><span style={{ fontSize: '10px', color: theme.textTertiary }}>High improvement</span></div>
        </div>
      </div>

      {/* Ideas Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme.text }}>Ideas</h2>
        </div>

        {/* Ideas Search and New Idea */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ position: 'relative', flex: '0 0 200px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={ideasSearchQuery} onChange={(e) => setIdeasSearchQuery(e.target.value)} placeholder="Search ideas..." style={{ width: '100%', padding: '7px 10px 7px 32px', fontSize: '12px', background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, borderRadius: '6px', color: theme.text, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ padding: '7px 12px', fontSize: '11px', fontWeight: 600, background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Idea
          </button>
        </div>

        {/* Ideas Table */}
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}`, background: theme.cardBgDark }}>
                <th style={{ width: '36px', padding: '10px 6px' }}></th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '200px' }}>ID / Name</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '9px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '80px' }}>Fidelity</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '9px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '120px' }}>Source</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '9px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '90px' }}>Modified</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '9px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '180px' }}>Projection</th>
                <th style={{ width: '40px', padding: '10px 6px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredIdeas.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center' }}><p style={{ margin: 0, fontSize: '12px', color: theme.textTertiary }}>No ideas found</p></td></tr>
              ) : (
                filteredIdeas.map((idea) => (
                  <tr key={idea.id} className="table-row" style={{ borderBottom: `1px solid ${theme.borderLight}`, cursor: 'pointer' }}>
                    <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                      <button className="star-btn" onClick={(e) => { e.stopPropagation(); onToggleIdeaStar(idea.id); }} style={{ padding: '3px', background: 'transparent', border: 'none', cursor: 'pointer', color: idea.starred ? '#FBBF24' : theme.textSecondary, transition: 'all 0.15s ease' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={idea.starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </button>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '3px 6px', borderRadius: '3px', background: 'rgba(167, 139, 250, 0.12)', color: '#A78BFA', fontSize: '10px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', flexShrink: 0 }}>{idea.id}</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{idea.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}><span style={{ fontSize: '12px', fontWeight: 600, color: theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{idea.fidelity}%</span></td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ fontSize: '12px', color: idea.source === 'Luna AI' ? '#A78BFA' : '#A1A1AA', fontWeight: idea.source === 'Luna AI' ? 500 : 400, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {idea.source === 'Luna AI' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z" /><path d="M12 2a7 7 0 0 1 7 7h-7V2z" /></svg>}
                        {idea.source}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}><span style={{ fontSize: '11px', color: theme.textTertiary }}>{formatDate(idea.dateModified)}</span></td>
                    <td style={{ padding: '10px 8px' }}><StatusVisualization current={idea.status.current} projectedMean={idea.status.projectedMean} projectedStd={idea.status.projectedStd} compact /></td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', position: 'relative' }}>
                      <button className="menu-btn" onClick={(e) => { e.stopPropagation(); setOpenIdeasMenuId(openIdeasMenuId === idea.id ? null : idea.id); }} style={{ padding: '4px', background: openIdeasMenuId === idea.id ? theme.cardBgHover : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', color: theme.textTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                      </button>
                      {openIdeasMenuId === idea.id && (
                        <div ref={ideasMenuRef} style={{ position: 'absolute', top: '100%', right: '6px', marginTop: '4px', background: theme.modalBg, border: `1px solid ${theme.border}`, borderRadius: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100, minWidth: '150px', overflow: 'hidden', animation: 'fadeIn 0.1s ease-out' }}>
                          <button onClick={() => { onPromoteIdea(idea.id); setOpenIdeasMenuId(null); }} style={{ width: '100%', padding: '8px 12px', fontSize: '12px', background: 'transparent', border: 'none', color: '#22C55E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>Promote to Project
                          </button>
                          <button onClick={() => setOpenIdeasMenuId(null)} style={{ width: '100%', padding: '8px 12px', fontSize: '12px', background: 'transparent', border: 'none', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = theme.cardBgHover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Duplicate
                          </button>
                          <div style={{ height: '1px', background: theme.borderLight, margin: '4px 0' }} />
                          <button onClick={() => { onDeleteIdea(idea.id); setOpenIdeasMenuId(null); }} style={{ width: '100%', padding: '8px 12px', fontSize: '12px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProjectsView;
