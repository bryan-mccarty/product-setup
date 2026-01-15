import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import DashboardHeader from '../components/DashboardHeader';
import ProjectsView from './projects_view';
import GraphView from './graph_view';
import DataView from './data_view';
import InputsModal from './inputs';
import OutcomesModal from './outcomes';
import CombinationsModal from './combinations';
import ConstraintsModal from './constraints';
import ObjectivesModal from './objectives';

const CPGCategoryDashboard = () => {
  const { theme, isDarkMode } = useTheme();
  const {
    inputs,
    setInputs,
    outcomes,
    setOutcomes,
    constraints,
    objectives,
    combinations,
    projects,
    setProjects,
    ideas,
    setIdeas,
    suppliers,
  } = useData();

  // View state with localStorage persistence
  const [activeView, setActiveView] = useState<'projects' | 'graph' | 'data'>(() => {
    try {
      return (localStorage.getItem('dashboardView') as 'projects' | 'graph' | 'data') || 'projects';
    } catch {
      return 'projects';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dashboardView', activeView);
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [activeView]);

  // Right panel state
  const [activeTab, setActiveTab] = useState('inputs');
  const [panelSearch, setPanelSearch] = useState('');
  const [panelFilter, setPanelFilter] = useState('All');

  // Chat panel state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. I can help you analyze your projects, suggest optimizations, and answer questions about your data.' }
  ]);

  // All data now comes from context - no local state needed

  // Modal states
  const [showInputsModal, setShowInputsModal] = useState(false);
  const [showOutcomesModal, setShowOutcomesModal] = useState(false);
  const [showCombinationsModal, setShowCombinationsModal] = useState(false);
  const [showConstraintsModal, setShowConstraintsModal] = useState(false);
  const [showObjectivesModal, setShowObjectivesModal] = useState(false);

  // Node status for graph view (derived from data)
  const nodeStatus = {
    inputs: { complete: inputs.length > 0, items: inputs.length, required: true },
    outcomes: { complete: outcomes.length > 0, items: outcomes.length, required: true },
    combinations: { complete: false, items: 0, required: false },
    constraints: { complete: constraints.length > 0, items: constraints.length, required: false },
    objectives: { complete: objectives.length > 0, items: objectives.length, required: false },
  };

  // Compute connections between items based on matching names
  // Inputs → Constraints: when constraint.targetName matches input.name
  // Outcomes → Objectives: when objective.targetName matches outcome.name
  // Suppliers → Inputs: based on suppliesInputIds
  const itemConnections = React.useMemo(() => {
    const connections: Array<{
      fromNodeId: string;
      fromItemId: string;
      toNodeId: string;
      toItemId: string;
      relationshipType: string;
    }> = [];

    // Input → Constraint connections
    constraints.forEach(constraint => {
      const matchingInput = inputs.find(input => input.name === constraint.targetName);
      if (matchingInput) {
        connections.push({
          fromNodeId: 'inputs',
          fromItemId: matchingInput.id,
          toNodeId: 'constraints',
          toItemId: constraint.id,
          relationshipType: 'constrained_by',
        });
      }
    });

    // Outcome → Objective connections
    objectives.forEach(objective => {
      const matchingOutcome = outcomes.find(outcome => outcome.name === objective.targetName);
      if (matchingOutcome) {
        connections.push({
          fromNodeId: 'outcomes',
          fromItemId: matchingOutcome.id,
          toNodeId: 'objectives',
          toItemId: objective.id,
          relationshipType: 'used_in',
        });
      }
    });

    // Supplier → Input connections
    suppliers.forEach(supplier => {
      supplier.suppliesInputIds.forEach(inputId => {
        const matchingInput = inputs.find(input => input.id === inputId);
        if (matchingInput) {
          connections.push({
            fromNodeId: 'suppliers',
            fromItemId: supplier.id,
            toNodeId: 'inputs',
            toItemId: matchingInput.id,
            relationshipType: 'supplies',
          });
        }
      });
    });

    return connections;
  }, [inputs, outcomes, constraints, objectives, suppliers]);

  // Handle graph node clicks
  const handleGraphNodeClick = (nodeId: string) => {
    switch (nodeId) {
      case 'inputs':
        setShowInputsModal(true);
        break;
      case 'outcomes':
        setShowOutcomesModal(true);
        break;
      case 'combinations':
        setShowCombinationsModal(true);
        break;
      case 'constraints':
        setShowConstraintsModal(true);
        break;
      case 'objectives':
        setShowObjectivesModal(true);
        break;
    }
  };

  // Stats calculations
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.roundsCompleted > 0).length;
  const totalIdeas = ideas.length;
  const measuredFormulas = 47;
  const defaultInputs = inputs.filter(i => i.isDefault).length;
  const defaultOutcomes = outcomes.filter(o => o.isDefault).length;

  // Reset panel search/filter when tab changes
  useEffect(() => {
    setPanelSearch('');
    setPanelFilter('All');
  }, [activeTab]);

  const toggleProjectStar = (id: string) => setProjects(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p));
  const toggleIdeaStar = (id: string) => setIdeas(prev => prev.map(i => i.id === id ? { ...i, starred: !i.starred } : i));
  const toggleInputDefault = (id: string) => setInputs(prev => prev.map(i => i.id === id ? { ...i, isDefault: !i.isDefault } : i));
  const toggleOutcomeDefault = (id: string) => setOutcomes(prev => prev.map(o => o.id === id ? { ...o, isDefault: !o.isDefault } : o));

  const handleDeleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));
  const handleDuplicateProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const newProject = { ...project, id: project.id.slice(0, 3) + String.fromCharCode(65 + Math.floor(Math.random() * 26)), name: `${project.name} (Copy)`, starred: false, dateModified: new Date().toISOString() };
      setProjects(prev => [...prev, newProject]);
    }
  };

  const handleDeleteIdea = (id: string) => setIdeas(prev => prev.filter(i => i.id !== id));
  const handlePromoteIdea = (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (idea) {
      const newProject = { id: 'PRJ' + String.fromCharCode(65 + Math.floor(Math.random() * 26)), name: idea.name, roundsCompleted: 0, owner: idea.source, dateModified: new Date().toISOString(), starred: false, status: { current: 0, projectedMean: 0, projectedStd: 0 } };
      setProjects(prev => [...prev, newProject]);
      setIdeas(prev => prev.filter(i => i.id !== id));
    }
  };

  // View definitions for switcher
  const views = [
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      id: 'graph',
      label: 'Graph',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="5" r="2" />
          <circle cx="19" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
          <circle cx="5" cy="12" r="2" />
          <line x1="12" y1="7" x2="12" y2="9" />
          <line x1="17" y1="12" x2="15" y2="12" />
          <line x1="12" y1="17" x2="12" y2="15" />
          <line x1="7" y1="12" x2="9" y2="12" />
        </svg>
      )
    },
    {
      id: 'data',
      label: 'Data',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M7 16l4-4 4 4 5-6" />
        </svg>
      )
    }
  ];

  // Type Tags
  const InputTypeTag = ({ type }: { type: string }) => {
    const { isDarkMode } = useTheme();
    const colors: Record<string, { bg: string; text: string }> = {
      'Ingredient': { bg: isDarkMode ? 'rgba(45, 212, 191, 0.15)' : '#f0fdfa', text: isDarkMode ? '#2DD4BF' : '#0f766e' },
      'Processing': { bg: isDarkMode ? 'rgba(251, 146, 60, 0.15)' : '#fff7ed', text: isDarkMode ? '#FB923C' : '#c2410c' }
    };
    const c = colors[type] || { bg: isDarkMode ? 'rgba(167, 139, 250, 0.15)' : '#f5f3ff', text: isDarkMode ? '#A78BFA' : '#6d28d9' };
    return <span style={{ padding: '2px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 600, background: c.bg, color: c.text }}>{type === 'Processing' ? 'Process' : type}</span>;
  };

  const OutcomeTypeTag = ({ type }: { type: string }) => {
    const { isDarkMode } = useTheme();
    const colors: Record<string, { bg: string; text: string }> = {
      'Analytical': { bg: isDarkMode ? 'rgba(96, 165, 250, 0.15)' : '#eff6ff', text: isDarkMode ? '#60A5FA' : '#1e40af' },
      'Sensory': { bg: isDarkMode ? 'rgba(244, 114, 182, 0.15)' : '#fdf2f8', text: isDarkMode ? '#F472B6' : '#be185d' },
      'Consumer': { bg: isDarkMode ? 'rgba(167, 139, 250, 0.15)' : '#f5f3ff', text: isDarkMode ? '#A78BFA' : '#6d28d9' }
    };
    const c = colors[type] || { bg: isDarkMode ? 'rgba(113, 113, 122, 0.15)' : '#f8fafc', text: isDarkMode ? '#A1A1AA' : '#64748b' };
    return <span style={{ padding: '2px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 600, background: c.bg, color: c.text }}>{type === 'Analytical' ? 'Analyt.' : type}</span>;
  };

  const VariableTypeTag = ({ type }: { type: string }) => {
    const { isDarkMode } = useTheme();
    const colors: Record<string, { bg: string; text: string }> = {
      'Continuous': { bg: isDarkMode ? 'rgba(45, 212, 191, 0.12)' : '#f0fdfa', text: isDarkMode ? '#2DD4BF' : '#0f766e' },
      'Ordinal': { bg: isDarkMode ? 'rgba(244, 114, 182, 0.12)' : '#fdf2f8', text: isDarkMode ? '#F472B6' : '#be185d' },
      'Nominal': { bg: isDarkMode ? 'rgba(251, 191, 36, 0.12)' : '#fffbeb', text: isDarkMode ? '#FBBF24' : '#d97706' }
    };
    const c = colors[type] || colors['Continuous'];
    return <span style={{ padding: '2px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 500, background: c.bg, color: c.text }}>{type === 'Continuous' ? 'Cont' : type === 'Ordinal' ? 'Ord' : 'Nom'}</span>;
  };

  const ObjectiveTypeTag = ({ type }: { type: string }) => {
    const { isDarkMode } = useTheme();
    const config: Record<string, { bg: string; text: string; icon: string }> = {
      'maximize': { bg: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4', text: isDarkMode ? '#22C55E' : '#15803d', icon: '↑' },
      'minimize': { bg: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2', text: isDarkMode ? '#EF4444' : '#b91c1c', icon: '↓' },
      'target': { bg: isDarkMode ? 'rgba(96, 165, 250, 0.15)' : '#eff6ff', text: isDarkMode ? '#60A5FA' : '#1e40af', icon: '◎' },
      'between': { bg: isDarkMode ? 'rgba(167, 139, 250, 0.15)' : '#f5f3ff', text: isDarkMode ? '#A78BFA' : '#6d28d9', icon: '↔' }
    };
    const c = config[type] || config['target'];
    return <span style={{ padding: '2px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 600, background: c.bg, color: c.text, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>{c.icon} {type.charAt(0).toUpperCase() + type.slice(1)}</span>;
  };

  const ConstraintTypeTag = ({ type }: { type: string }) => {
    const { isDarkMode } = useTheme();
    const labels: Record<string, string> = { 'at_least': 'At Least', 'at_most': 'At Most', 'between': 'Between', 'equals': 'Equals' };
    return <span style={{ padding: '2px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 600, background: isDarkMode ? 'rgba(251, 146, 60, 0.15)' : '#fff7ed', color: isDarkMode ? '#FB923C' : '#c2410c' }}>{labels[type] || type}</span>;
  };

  const ConstraintTagPill = ({ tag }: { tag: string }) => {
    const { isDarkMode } = useTheme();
    const colorsMap: Record<string, { light: string; dark: string; bg: string }> = {
      'Regulatory': { dark: '#EF4444', light: '#b91c1c', bg: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2' },
      'Cost Control': { dark: '#22C55E', light: '#15803d', bg: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4' },
      'Quality': { dark: '#3B82F6', light: '#1d4ed8', bg: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff' },
      'Safety': { dark: '#F59E0B', light: '#d97706', bg: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb' }
    };
    const colorConfig = colorsMap[tag] || { dark: '#71717A', light: '#64748b', bg: isDarkMode ? 'rgba(113, 113, 122, 0.15)' : '#f8fafc' };
    const color = isDarkMode ? colorConfig.dark : colorConfig.light;
    return <span style={{ padding: '2px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 500, background: colorConfig.bg, color: color, border: isDarkMode ? `1px solid ${color}40` : `1px solid ${color}30` }}>{tag}</span>;
  };

  // Get filter options based on active tab
  const getFilterOptions = () => {
    switch (activeTab) {
      case 'inputs': return ['All', 'Ingredient', 'Processing', 'Default'];
      case 'outcomes': return ['All', 'Analytical', 'Sensory', 'Consumer', 'Default'];
      case 'objectives': return ['All', 'Maximize', 'Minimize', 'Target', 'Between'];
      case 'constraints': return ['All', 'Regulatory', 'Cost Control', 'Quality', 'Safety'];
      default: return ['All'];
    }
  };

  // Get filtered panel items
  const getFilteredPanelItems = () => {
    const search = panelSearch.toLowerCase();
    let items: any[] = [];
    if (activeTab === 'inputs') {
      items = inputs.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(search) || i.description.toLowerCase().includes(search);
        if (panelFilter === 'All') return matchesSearch;
        if (panelFilter === 'Default') return matchesSearch && i.isDefault;
        return matchesSearch && i.inputType === panelFilter;
      });
      items.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    } else if (activeTab === 'outcomes') {
      items = outcomes.filter(o => {
        const matchesSearch = o.name.toLowerCase().includes(search) || o.description.toLowerCase().includes(search);
        if (panelFilter === 'All') return matchesSearch;
        if (panelFilter === 'Default') return matchesSearch && o.isDefault;
        return matchesSearch && o.outcomeType === panelFilter;
      });
      items.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    } else if (activeTab === 'objectives') {
      items = objectives.filter(o => {
        const matchesSearch = o.targetName.toLowerCase().includes(search);
        if (panelFilter === 'All') return matchesSearch;
        return matchesSearch && o.objectiveType.toLowerCase() === panelFilter.toLowerCase();
      });
    } else if (activeTab === 'constraints') {
      items = constraints.filter(c => {
        const matchesSearch = c.targetName.toLowerCase().includes(search) ||
          c.tags.some(tag => tag.toLowerCase().includes(search));
        if (panelFilter === 'All') return matchesSearch;
        return matchesSearch && c.tags.includes(panelFilter);
      });
    }
    return items;
  };

  const tabs = [
    { id: 'inputs', label: `Inputs (${defaultInputs})`, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>, color: '#2DD4BF' },
    { id: 'outcomes', label: `Outcomes (${defaultOutcomes})`, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>, color: '#F472B6' },
    { id: 'objectives', label: 'Objectives', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, color: '#60A5FA' },
    { id: 'constraints', label: 'Constraints', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>, color: '#FB923C' },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab)!;
  const panelItems = getFilteredPanelItems();

  return (
    <div style={{ minHeight: '100vh', background: theme.background, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: ${theme.scrollbarTrack}; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${theme.scrollbarThumb}; border-radius: 3px; }
        .table-row { transition: background 0.1s ease; }
        .table-row:hover { background: ${theme.rowHoverBg}; }
        .star-btn { transition: all 0.15s ease; }
        .star-btn:hover { transform: scale(1.15); }
        .menu-btn { opacity: 0; transition: opacity 0.15s ease; }
        .table-row:hover .menu-btn { opacity: 1; }
        .sort-header { cursor: pointer; user-select: none; transition: color 0.15s ease; }
        .sort-header:hover { color: ${theme.textSecondary}; }
      `}</style>

      {/* Header */}
      <DashboardHeader
        categoryName="Brownie Mix"
        createdDate="Dec 15, 2024"
        createdBy="Sarah Chen"
        lastModified="Jan 15, 2025"
        stats={{
          totalProjects,
          activeProjects,
          totalIdeas,
          measuredFormulas,
          defaultInputs,
          defaultOutcomes
        }}
        views={views}
        activeView={activeView}
        onViewChange={(viewId) => setActiveView(viewId as 'projects' | 'graph' | 'data')}
      />

      {/* Main Content Area - Two Column Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Content - Conditional View Rendering */}
        {activeView === 'projects' && (
          <ProjectsView
            projects={projects}
            ideas={ideas}
            onToggleProjectStar={toggleProjectStar}
            onToggleIdeaStar={toggleIdeaStar}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteIdea={handleDeleteIdea}
            onPromoteIdea={handlePromoteIdea}
          />
        )}
        {activeView === 'graph' && (
          <GraphView
            categoryName="Brownie Mix"
            nodeStatus={nodeStatus}
            nodeItems={{
              inputs: inputs.map(i => ({ id: i.id, name: i.name, type: i.inputType })),
              outcomes: outcomes.map(o => ({ id: o.id, name: o.name, type: o.outcomeType })),
              constraints: constraints.map(c => ({ id: c.id, name: c.targetName, type: c.constraintType })),
              objectives: objectives.map(o => ({ id: o.id, name: o.targetName, type: o.objectiveType })),
              suppliers: suppliers.map(s => ({ id: s.id, name: s.name })),
            }}
            connections={itemConnections}
            onNodeClick={handleGraphNodeClick}
          />
        )}
        {activeView === 'data' && (
          <DataView />
        )}

        {/* Right Panel - aligned with Projects section */}
        <div style={{ width: '374px', flexShrink: 0, background: theme.sidebarBg, borderLeft: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '12px 8px', fontSize: '11px', fontWeight: 500, background: activeTab === tab.id ? theme.cardBg : 'transparent', color: activeTab === tab.id ? tab.color : '#71717A', border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.15s ease' }}>
                <span style={{ color: activeTab === tab.id ? tab.color : '#52525b' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Panel Header */}
          <div style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, flexShrink: 0 }}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" value={panelSearch} onChange={(e) => setPanelSearch(e.target.value)} placeholder={`Search ${activeTab}...`} style={{ width: '100%', padding: '8px 10px 8px 32px', fontSize: '12px', background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, borderRadius: '6px', color: theme.text, outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {getFilterOptions().map(filter => (
                <button key={filter} onClick={() => setPanelFilter(filter)} style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 500, background: panelFilter === filter ? `${activeTabData.color}20` : theme.cardBg, color: panelFilter === filter ? activeTabData.color : '#71717A', border: panelFilter === filter ? `1px solid ${activeTabData.color}40` : `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer' }}>{filter}</button>
              ))}
            </div>
          </div>

          {/* Panel Content */}
          <div className="custom-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
            {panelItems.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}><p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>No {activeTab} found</p></div>
            ) : (
              panelItems.map((item: any) => {
                if (activeTab === 'inputs') {
                  return (
                    <div key={item.id} style={{ padding: '10px 12px', marginBottom: '6px', background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <button onClick={() => toggleInputDefault(item.id)} style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer', color: item.isDefault ? '#FBBF24' : theme.textSecondary, marginTop: '2px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={item.isDefault ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>{item.name}</span>
                          <div style={{ display: 'flex', gap: '4px' }}><InputTypeTag type={item.inputType} /><VariableTypeTag type={item.variableType} /></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '10px', color: theme.textTertiary }}>{item.description}</span>
                          {item.cost && <span style={{ fontSize: '10px', color: '#2DD4BF', fontWeight: 500 }}>${item.cost.toFixed(2)}</span>}
                        </div>
                      </div>
                    </div>
                  );
                } else if (activeTab === 'outcomes') {
                  return (
                    <div key={item.id} style={{ padding: '10px 12px', marginBottom: '6px', background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <button onClick={() => toggleOutcomeDefault(item.id)} style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer', color: item.isDefault ? '#FBBF24' : theme.textSecondary, marginTop: '2px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={item.isDefault ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>{item.name}</span>
                          <div style={{ display: 'flex', gap: '4px' }}><OutcomeTypeTag type={item.outcomeType} /><VariableTypeTag type={item.variableType} /></div>
                        </div>
                        <span style={{ fontSize: '10px', color: theme.textTertiary }}>{item.description}</span>
                      </div>
                    </div>
                  );
                } else if (activeTab === 'objectives') {
                  return (
                    <div key={item.id} style={{ padding: '10px 12px', marginBottom: '6px', background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>{item.targetName}</span>
                        <ObjectiveTypeTag type={item.objectiveType} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.objectiveType === 'between' && item.value1 && item.value2 && <span style={{ fontSize: '11px', color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{item.value1} – {item.value2}</span>}
                        {item.objectiveType === 'target' && item.value1 && <span style={{ fontSize: '11px', color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>Target: {item.value1}</span>}
                        {item.successCriteria && <span style={{ fontSize: '10px', color: '#22C55E', fontWeight: 500 }}>{item.successCriteria}</span>}
                      </div>
                    </div>
                  );
                } else if (activeTab === 'constraints') {
                  return (
                    <div key={item.id} style={{ padding: '10px 12px', marginBottom: '6px', background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>{item.targetName}</span>
                        <ConstraintTypeTag type={item.constraintType} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{item.constraintType === 'between' ? `${item.value1} – ${item.value2}` : item.value1}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>{item.tags.map((tag: string) => <ConstraintTagPill key={tag} tag={tag} />)}</div>
                      </div>
                    </div>
                  );
                }
                return null;
              })
            )}
          </div>

          {/* Panel Footer */}
          <div style={{ padding: '12px', borderTop: `1px solid ${theme.border}`, flexShrink: 0 }}>
            <button style={{ width: '100%', padding: '10px 16px', fontSize: '12px', fontWeight: 600, background: `${activeTabData.color}15`, color: activeTabData.color, border: `1px solid ${activeTabData.color}30`, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add {activeTab === 'inputs' ? 'Input' : activeTab === 'outcomes' ? 'Outcome' : activeTab === 'objectives' ? 'Objective' : 'Constraint'}
            </button>
          </div>
        </div>

        {/* Chat Toggle Button - Fixed position on right edge */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            position: 'fixed',
            right: chatOpen ? '420px' : '0',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
            border: 'none',
            borderRadius: chatOpen ? '6px 0 0 6px' : '6px 0 0 6px',
            padding: '12px 8px',
            cursor: 'pointer',
            boxShadow: isDarkMode ? '-2px 0 10px rgba(124, 58, 237, 0.15)' : '-1px 0 4px rgba(124, 58, 237, 0.08)',
            zIndex: 1000,
            transition: 'right 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(90deg)' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Luna AI
        </button>

        {/* Chat Panel - Slides in from right */}
        <div style={{
          position: 'fixed',
          right: chatOpen ? '0' : '-420px',
          top: 0,
          bottom: 0,
          width: '420px',
          background: '#0a0a0f',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: isDarkMode ? '-4px 0 20px rgba(0,0,0,0.5)' : '-2px 0 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          transition: 'right 0.3s ease'
        }}>
          {/* Chat Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: theme.text }}>Luna AI</h3>
                <p style={{ margin: 0, fontSize: '10px', color: theme.textTertiary }}>Powered by Claude</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'transparent', border: 'none', color: theme.textTertiary, cursor: 'pointer', padding: '4px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="custom-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: msg.role === 'user' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(45, 212, 191, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {msg.role === 'user' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4"/>
                    </svg>
                  )}
                </div>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: msg.role === 'user' ? 'rgba(45, 212, 191, 0.08)' : 'rgba(139, 92, 246, 0.08)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(139, 92, 246, 0.15)'}`,
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: theme.text,
                  maxWidth: '80%'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    setChatMessages([...chatMessages, { role: 'user', content: chatInput }]);
                    const userMsg = chatInput;
                    setChatInput('');
                    setTimeout(() => {
                      setChatMessages(prev => [...prev, { role: 'assistant', content: `I received your message: "${userMsg}". This is a demo response. In production, this would connect to an AI service.` }]);
                    }, 1000);
                  }
                }}
                placeholder="Ask me anything about your projects..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: '13px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  color: theme.text,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={() => {
                  if (chatInput.trim()) {
                    const userMsg = chatInput;
                    setChatMessages([...chatMessages, { role: 'user', content: userMsg }]);
                    setChatInput('');
                    setTimeout(() => {
                      setChatMessages(prev => [...prev, { role: 'assistant', content: `I received your message: "${userMsg}". This is a demo response. In production, this would connect to an AI service.` }]);
                    }, 1000);
                  }
                }}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInputsModal && (
        <InputsModal
          onClose={() => setShowInputsModal(false)}
        />
      )}

      {showOutcomesModal && (
        <OutcomesModal
          onClose={() => setShowOutcomesModal(false)}
        />
      )}

      {showCombinationsModal && (
        <CombinationsModal
          onClose={() => setShowCombinationsModal(false)}
        />
      )}

      {showConstraintsModal && (
        <ConstraintsModal
          onClose={() => setShowConstraintsModal(false)}
        />
      )}

      {showObjectivesModal && (
        <ObjectivesModal
          onClose={() => setShowObjectivesModal(false)}
        />
      )}
    </div>
  );
};

export default CPGCategoryDashboard;
