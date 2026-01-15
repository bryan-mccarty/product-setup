import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useData, DraftObjective } from '../../contexts/DataContext';
import { ProjectPageLayout, ChatMessage } from '../../components/project-setup/ProjectPageLayout';

// Unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Default objective tags for product library
const defaultProductTags = [
  { id: 'tag-1', name: 'Default', color: '#6B7280', category: 'objective' },
  { id: 'tag-2', name: 'Primary', color: '#10B981', category: 'objective' },
  { id: 'tag-3', name: 'Secondary', color: '#F59E0B', category: 'objective' },
  { id: 'tag-4', name: 'Consumer Focus', color: '#EC4899', category: 'objective' },
  { id: 'tag-5', name: 'Cost Reduction', color: '#EF4444', category: 'objective' },
];

// Product library objectives (available for import)
const productObjectives = [
  { 
    id: 'po-1', 
    targetId: 'outcome-3', 
    targetName: 'Overall Liking', 
    targetType: 'outcome',
    objectiveType: 'maximize', 
    value1: '', 
    value2: '',
    tags: [defaultProductTags[0], defaultProductTags[3]] // Default, Consumer Focus
  },
  { 
    id: 'po-2', 
    targetId: 'combo-4', 
    targetName: 'Total Cost', 
    targetType: 'combination',
    objectiveType: 'minimize', 
    value1: '', 
    value2: '',
    tags: [defaultProductTags[0], defaultProductTags[4]] // Default, Cost Reduction
  },
  { 
    id: 'po-3', 
    targetId: 'outcome-1', 
    targetName: 'Sweetness', 
    targetType: 'outcome',
    objectiveType: 'approximately', 
    value1: '7.5', 
    value2: '',
    tags: [defaultProductTags[0]] // Default
  },
  { 
    id: 'po-4', 
    targetId: 'outcome-5', 
    targetName: 'Moisture Content', 
    targetType: 'outcome',
    objectiveType: 'between', 
    value1: '0.65', 
    value2: '0.75',
    tags: [defaultProductTags[1]] // Primary
  },
  { 
    id: 'po-5', 
    targetId: 'outcome-4', 
    targetName: 'Purchase Intent', 
    targetType: 'outcome',
    objectiveType: 'maximize', 
    value1: '', 
    value2: '',
    tags: [defaultProductTags[3]] // Consumer Focus
  },
];

// Draft objectives now come from context (derived from Goals & Claims page)

// ============================================
// OBJECTIVE TYPE DEFINITIONS
// ============================================
const objectiveTypes = [
  { id: 'maximize', label: 'Maximize', symbol: '↑', eligibleVariables: ['Continuous', 'Ordinal'], fields: 0 },
  { id: 'minimize', label: 'Minimize', symbol: '↓', eligibleVariables: ['Continuous', 'Ordinal'], fields: 0 },
  { id: 'approximately', label: 'Target', symbol: '◎', eligibleVariables: ['Continuous', 'Ordinal', 'Nominal'], fields: 1 },
  { id: 'between', label: 'Between', symbol: '↔', eligibleVariables: ['Continuous', 'Ordinal'], fields: 2 },
];

// ============================================
// ICONS
// ============================================
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 7l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" />
  </svg>
);

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const UnlinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" opacity="0.5" />
    <path d="M5.16 11.75l-1.72 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71" opacity="0.5" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const ImportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ObjectivesIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ============================================
// TYPE TAG COMPONENTS
// ============================================
const OutcomeTypeTag = ({ type, small }) => {
  const colors = {
    'Sensory': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
    'Consumer': { bg: 'rgba(244, 114, 182, 0.15)', text: '#F472B6', border: 'rgba(244, 114, 182, 0.3)' },
    'Analytical': { bg: 'rgba(96, 165, 250, 0.15)', text: '#60A5FA', border: 'rgba(96, 165, 250, 0.3)' },
    'Combination': { bg: 'rgba(167, 139, 250, 0.15)', text: '#A78BFA', border: 'rgba(167, 139, 250, 0.3)' },
    'Other': { bg: 'rgba(113, 113, 122, 0.15)', text: '#71717A', border: 'rgba(113, 113, 122, 0.3)' },
  };
  const c = colors[type] || colors['Other'];
  return (
    <span style={{
      padding: small ? '2px 6px' : '4px 10px',
      borderRadius: '4px',
      fontSize: small ? '9px' : '10px',
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    }}>
      {type === 'Analytical' ? 'Analyt' : type === 'Combination' ? 'Combo' : type}
    </span>
  );
};

const VariableTypeTag = ({ type, small }) => {
  const colors = {
    'Continuous': { bg: 'rgba(45, 212, 191, 0.15)', text: '#2DD4BF', border: 'rgba(45, 212, 191, 0.3)' },
    'Ordinal': { bg: 'rgba(244, 114, 182, 0.15)', text: '#F472B6', border: 'rgba(244, 114, 182, 0.3)' },
    'Nominal': { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)' },
  };
  const c = colors[type] || colors['Continuous'];
  return (
    <span style={{
      padding: small ? '2px 6px' : '4px 10px',
      borderRadius: '4px',
      fontSize: small ? '9px' : '10px',
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    }}>
      {type === 'Continuous' ? 'Cont' : type === 'Ordinal' ? 'Ord' : 'Nom'}
    </span>
  );
};

const ObjectiveTypeTag = ({ type, small }) => {
  const config = objectiveTypes.find(ct => ct.id === type) || { symbol: '?', label: type };
  return (
    <span style={{
      padding: small ? '2px 6px' : '3px 8px',
      borderRadius: '4px',
      fontSize: small ? '9px' : '10px',
      fontWeight: 600,
      background: 'rgba(96, 165, 250, 0.15)',
      color: '#60A5FA',
      border: '1px solid rgba(96, 165, 250, 0.3)',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    }}>
      <span style={{ fontFamily: 'system-ui' }}>{config.symbol}</span>
      {!small && config.label.split(' ')[1]}
    </span>
  );
};

const MappingStatusTag = ({ mapped }) => {
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '9px',
      fontWeight: 600,
      background: mapped ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
      color: mapped ? '#22C55E' : '#EF4444',
      border: `1px solid ${mapped ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {mapped ? 'Mapped' : 'Unmapped'}
    </span>
  );
};

const ObjectiveTagPill = ({ tag, onRemove, small }) => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: small ? '2px 6px' : '3px 8px',
      borderRadius: '4px',
      fontSize: small ? '9px' : '10px',
      fontWeight: 500,
      background: `${tag.color}20`,
      color: tag.color,
      border: `1px solid ${tag.color}40`,
      whiteSpace: 'nowrap',
    }}>
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            padding: 0, width: '12px', height: '12px',
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.7,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
};

// ============================================
// TAG POPUP COMPONENT - Rebuilt with proper hover behavior
// ============================================
const TagPopup = ({ 
  objective, 
  tags, 
  setTags, 
  tagSearchQuery, 
  setTagSearchQuery, 
  getTagSuggestions, 
  addTagToObjective, 
  updateObjective,
  themeColor 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const containerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Handle mouse enter on the entire container (trigger + popup)
  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    // Set timeout to open after brief delay (prevents accidental opens)
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  // Handle mouse leave from the entire container
  const handleMouseLeave = () => {
    // Clear any pending open timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Delay close to allow moving to popup
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setSearchValue('');
    }, 100);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleAddTag = (tag) => {
    addTagToObjective(objective.id, tag);
    setSearchValue('');
  };

  const handleCreateTag = () => {
    const query = searchValue.trim();
    if (query) {
      const newTag = { id: `tag-${Date.now()}`, name: query, color: '#60A5FA' };
      setTags(prev => [...prev, newTag]);
      addTagToObjective(objective.id, newTag);
      setSearchValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const suggestions = getTagSuggestions(searchValue, objective.tags);
      if (suggestions.length > 0) {
        handleAddTag(suggestions[0]);
      } else if (searchValue.trim()) {
        handleCreateTag();
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchValue('');
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger - the 2x2 color grid */}
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)',
          cursor: 'pointer',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '2px',
          padding: '4px',
        }}
        title={objective.tags?.length ? objective.tags.map(t => t.name).join(', ') : 'Add tags'}
      >
        {(objective.tags || []).slice(0, 4).map((tag, i) => (
          <div key={i} style={{ background: tag.color, borderRadius: '2px' }} />
        ))}
        {(objective.tags || []).length < 4 && Array(4 - (objective.tags || []).length).fill(0).map((_, i) => (
          <div key={`empty-${i}`} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
        ))}
      </div>
      
      {/* Popup - positioned with invisible bridge to trigger */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            paddingTop: '4px', /* Small gap but mouse can still cross it */
            zIndex: 1000,
          }}
        >
          <div style={{
            width: '200px',
            background: '#15151a',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}>
            {/* Search/Add input */}
            <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search or add tag..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '11px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  color: '#FAFAFA',
                  outline: 'none',
                }}
              />
            </div>
            {/* Current tags */}
            {(objective.tags || []).length > 0 && (
              <div style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: '9px', color: '#71717A', marginBottom: '4px', textTransform: 'uppercase' }}>Current</div>
                {objective.tags.map(tag => (
                  <div key={tag.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: tag.color }} />
                      <span style={{ fontSize: '11px', color: '#FAFAFA' }}>{tag.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateObjective(objective.id, { tags: objective.tags.filter(t => t.id !== tag.id) });
                      }}
                      style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717A' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Available tags */}
            <div style={{ maxHeight: '120px', overflow: 'auto' }}>
              {getTagSuggestions(searchValue, objective.tags).map(tag => (
                <div
                  key={tag.id}
                  onClick={() => handleAddTag(tag)}
                  style={{
                    padding: '6px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: tag.color }} />
                  <span style={{ fontSize: '11px', color: '#A1A1AA' }}>{tag.name}</span>
                </div>
              ))}
              {/* Create new tag option */}
              {searchValue.trim() && !tags.some(t => t.name.toLowerCase() === searchValue.toLowerCase()) && (
                <div
                  onClick={handleCreateTag}
                  style={{
                    padding: '6px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span style={{ fontSize: '11px', color: themeColor }}>Create "{searchValue}"</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function AllObjectivesPage() {
  // Theme and data context
  const { theme, isDarkMode } = useTheme();
  const {
    projectOutcomes,        // Project-level outcomes (user's selections)
    projectCombinations,    // Project-level combinations
    projectObjectives,      // Project-level objectives
    tags: contextTags,
    projectMetadata,
    setProjectObjectives,
    addProjectObjective,
    removeProjectObjective,
    stepStatuses,
    setStepStatus,
    draftObjectives: contextDraftObjectives,  // From Goals & Claims page
    setDraftObjectives: setContextDraftObjectives
  } = useData();
  const navigate = useNavigate();

  const productTags = useMemo(() => contextTags.filter(t => t.category === 'objective'), [contextTags]);

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'll help you define objectives for your project. Objectives are targets you want to optimize - like maximizing overall liking, minimizing cost, or achieving a specific sweetness level. Start by mapping any draft objectives from your goals, or add new ones from your project library."
    }
  ]);

  const handleSendMessage = (message: string) => {
    setChatMessages([
      ...chatMessages,
      { id: generateId(), role: 'user', content: message },
      { id: generateId(), role: 'assistant', content: "I'll help with that objective..." }
    ]);
  };

  // Project info
  const [projectInfo] = useState({
    title: "Low-Sugar Brownie Mix",
    description: "Reduce sugar while maintaining sweetness and fudginess near full-sugar version"
  });

  // ========== STATE ==========
  // Auto-generate objectives from drafts that can be matched to outcomes/combinations
  const [objectives, setObjectives] = useState(() => {
    const autoCreated: any[] = [];
    contextDraftObjectives.forEach(draft => {
      // Try to match draft to an outcome or combination
      const matchedOutcome = projectOutcomes.find(o => o.name === draft.metricName);
      const matchedCombo = projectCombinations.find(c => c.name === draft.metricName);
      const matched = matchedOutcome || matchedCombo;

      if (matched && draft.metricRef) {
        // Create an objective that needs confirmation
        autoCreated.push({
          id: `auto-${draft.id}`,
          targetId: matched.id,
          targetName: draft.metricName,
          targetType: matchedOutcome ? 'outcome' : 'combination',
          targetOutcomeType: matchedOutcome?.outcomeType || 'Combination',
          targetVariableType: matched.variableType,
          objectiveType: draft.operator,
          value1: draft.value1,
          value2: draft.value2 || '',
          tags: [],
          mappedDraftId: draft.id,
          needsConfirmation: true, // Flag for amber highlight
        });
      }
    });
    return autoCreated;
  });

  // Draft objectives from goals/claims (need mapping)
  // Update drafts to reflect auto-created mappings
  const [drafts, setDrafts] = useState(() => {
    return contextDraftObjectives.map(draft => {
      const matchedOutcome = projectOutcomes.find(o => o.name === draft.metricName);
      const matchedCombo = projectCombinations.find(c => c.name === draft.metricName);
      const matched = matchedOutcome || matchedCombo;

      if (matched && draft.metricRef) {
        return { ...draft, mappedObjectiveId: `auto-${draft.id}`, needsConfirmation: true };
      }
      return { ...draft, mappedObjectiveId: null, needsConfirmation: false };
    });
  });
  
  // Available tags
  const [tags, setTags] = useState(productTags);

  // Sync local objectives to context when they change
  useEffect(() => {
    const objectivesToSave = objectives.map(o => ({
      id: o.id,
      targetId: o.targetId,
      targetName: o.targetName,
      targetType: o.targetType,
      objectiveType: o.objectiveType,
      value1: o.value1,
      value2: o.value2,
      tags: o.tags,
    }));
    setProjectObjectives(objectivesToSave);
  }, [objectives, setProjectObjectives]);

  // Sync draft status back to context when drafts are confirmed
  useEffect(() => {
    // Update context with current draft states (confirmed status)
    const updatedDrafts: DraftObjective[] = drafts.map(d => ({
      id: d.id,
      metricName: d.metricName,
      metricRef: d.metricRef,
      operator: d.operator,
      value1: d.value1,
      value2: d.value2 || '',
      goalId: d.goalId,
      goalName: d.goalName || '',
      status: d.mappedObjectiveId && !d.needsConfirmation ? 'confirmed' : 'draft',
      isPrefilled: d.isPrefilled || !!d.metricRef,
    }));
    setContextDraftObjectives(updatedDrafts);
  }, [drafts, setContextDraftObjectives]);

  // Mapping modal state
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [mappingDraftId, setMappingDraftId] = useState(null);
  
  // UI State
  const [showAddFromModal, setShowAddFromModal] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarFilter, setSidebarFilter] = useState('All');
  const [hoveredObjective, setHoveredObjective] = useState(null);
  const [hoveredDraft, setHoveredDraft] = useState(null);
  
  // Autocomplete state for subject field
  const [activeAutocomplete, setActiveAutocomplete] = useState(null);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  
  // Tag autocomplete state
  const [activeTagAutocomplete, setActiveTagAutocomplete] = useState(null);
  const [tagSearchQuery, setTagSearchQuery] = useState({});
  const [tagAutocompleteIndex, setTagAutocompleteIndex] = useState(0);

  // ========== HANDLERS ==========
  const handleAddNew = () => {
    const newObjective = {
      id: generateId(),
      targetId: null,
      targetName: '',
      targetType: null, // 'outcome' or 'combination'
      targetOutcomeType: null,
      targetVariableType: null,
      objectiveType: null,
      value1: '',
      value2: '',
      tags: [],
      mappedDraftId: null,
      needsConfirmation: false,
    };
    setObjectives(prev => [...prev, newObjective]);
  };
  
  // Import default objectives (those with Default tag)
  const handleImportDefaults = () => {
    const defaultTag = productTags.find(t => t.isDefault);
    if (!defaultTag) return;
    
    const defaultObjectives = productObjectives.filter(obj => 
      obj.tags?.some(t => t.id === defaultTag.id)
    );
    
    const newObjectives = defaultObjectives.map(obj => ({
      ...obj,
      id: `imported-${generateId()}`,
      needsConfirmation: false,
    }));
    
    setObjectives(prev => [...prev, ...newObjectives]);
  };
  
  // Confirm an auto-created objective
  const confirmObjective = (objectiveId) => {
    setObjectives(prev => prev.map(c => 
      c.id === objectiveId ? { ...c, needsConfirmation: false } : c
    ));
    setDrafts(prev => prev.map(d => {
      if (d.mappedObjectiveId === objectiveId) {
        return { ...d, needsConfirmation: false };
      }
      return d;
    }));
  };
  
  // Open mapping modal for a draft
  const openMappingModal = (draftId) => {
    setMappingDraftId(draftId);
    setShowMappingModal(true);
  };
  
  // Map a draft to an existing objective
  const mapDraftToObjective = (draftId, objectiveId) => {
    // Remove any existing mapping from the objective
    setObjectives(prev => prev.map(c => {
      if (c.mappedDraftId === draftId) {
        return { ...c, mappedDraftId: null };
      }
      if (c.id === objectiveId) {
        return { ...c, mappedDraftId: draftId, needsConfirmation: false };
      }
      return c;
    }));
    // Update draft
    setDrafts(prev => prev.map(d => 
      d.id === draftId ? { ...d, mappedObjectiveId: objectiveId, needsConfirmation: false } : d
    ));
    setShowMappingModal(false);
    setMappingDraftId(null);
  };
  
  // Unmap a draft
  const unmapDraft = (draftId) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft?.mappedObjectiveId) {
      setObjectives(prev => prev.map(c => 
        c.id === draft.mappedObjectiveId ? { ...c, mappedDraftId: null } : c
      ));
    }
    setDrafts(prev => prev.map(d => 
      d.id === draftId ? { ...d, mappedObjectiveId: null, needsConfirmation: false } : d
    ));
  };

  const updateObjective = (id, updates) => {
    setObjectives(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteObjective = (id) => {
    setObjectives(prev => prev.filter(c => c.id !== id));
  };

  // Get filtered library items for sidebar
  const getFilteredLibraryItems = () => {
    const allItems = [
      ...projectOutcomes.map(o => ({ ...o, itemType: 'outcome' })),
      ...projectCombinations.map(c => ({ ...c, itemType: 'combination', outcomeType: 'Combination' })),
    ];
    
    let filtered = allItems;
    
    if (sidebarFilter !== 'All') {
      if (sidebarFilter === 'Combination') {
        filtered = filtered.filter(i => i.itemType === 'combination');
      } else {
        filtered = filtered.filter(i => i.outcomeType === sidebarFilter);
      }
    }
    
    if (sidebarSearch) {
      const search = sidebarSearch.toLowerCase();
      filtered = filtered.filter(i => 
        i.name.toLowerCase().includes(search) ||
        i.description?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  };
  
  // Get autocomplete suggestions for objective subject
  const getAutocompleteSuggestions = (query) => {
    const allItems = [
      ...projectOutcomes.map(o => ({ ...o, itemType: 'outcome' })),
      ...projectCombinations.map(c => ({ ...c, itemType: 'combination', outcomeType: 'Combination' })),
    ];
    
    if (!query || query.length < 1) return allItems.slice(0, 6);
    
    const search = query.toLowerCase();
    return allItems.filter(i => 
      i.name.toLowerCase().includes(search) ||
      i.description?.toLowerCase().includes(search)
    ).slice(0, 6);
  };
  
  // Apply autocomplete selection
  const applyAutocompleteSelection = (objectiveId, item) => {
    updateObjective(objectiveId, {
      targetId: item.id,
      targetName: item.name,
      targetType: item.itemType,
      targetOutcomeType: item.outcomeType,
      targetVariableType: item.variableType,
      targetLevels: item.levels || null,
    });
    setActiveAutocomplete(null);
    setAutocompleteIndex(0);
  };
  
  // Get tag suggestions
  const getTagSuggestions = (query, existingTags) => {
    const existingIds = existingTags?.map(t => t.id) || [];
    let eligible = tags.filter(t => !existingIds.includes(t.id));
    
    if (query && query.length >= 1) {
      const lowerQuery = query.toLowerCase();
      eligible = eligible.filter(t => t.name.toLowerCase().includes(lowerQuery));
    }
    
    return eligible;
  };
  
  // Add tag to objective
  const addTagToObjective = (objectiveId, tag) => {
    setObjectives(prev => prev.map(c => {
      if (c.id !== objectiveId) return c;
      if (c.tags?.find(t => t.id === tag.id)) return c;
      return { ...c, tags: [...(c.tags || []), tag] };
    }));
    setActiveTagAutocomplete(null);
    setTagSearchQuery(prev => ({ ...prev, [objectiveId]: '' }));
    setTagAutocompleteIndex(0);
  };

  // Check if all drafts are mapped
  const unmappedDrafts = drafts.filter(d => !d.mappedObjectiveId);
  const allDraftsMapped = unmappedDrafts.length === 0;

  // Validation
  const isValid = objectives.length > 0 || drafts.length === 0;

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= 6) {
      navigate(`/project/new/step-${stepNumber}`);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleAddNew();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        handleImportDefaults();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        setShowAddFromModal(true);
      }
      if (e.key === 'Escape') {
        if (activeAutocomplete) {
          setActiveAutocomplete(null);
          setAutocompleteIndex(0);
        } else if (activeTagAutocomplete) {
          setActiveTagAutocomplete(null);
          setTagAutocompleteIndex(0);
        } else if (showAddFromModal) {
          setShowAddFromModal(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAutocomplete, activeTagAutocomplete, showAddFromModal]);

  // Theme color for objectives
  const themeColor = theme.accentObjectives;
  const themeColorRgb = '96, 165, 250';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: ${theme.background};
          color: ${theme.text};
          line-height: 1.5;
        }

        /* Project Info */
        .project-info {
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .breadcrumb {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: ${theme.textMuted};
          margin-bottom: 4px;
          font-weight: 600;
        }

        .project-title {
          font-size: 18px;
          font-weight: 600;
          color: ${theme.text};
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }

        .project-description {
          font-size: 13px;
          color: ${theme.textTertiary};
          line-height: 1.5;
        }

        /* Section Header */
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 24px;
        }

        .section-header-left {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .section-icon {
          color: ${themeColor};
          opacity: 0.9;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .section-text {
          flex: 1;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: ${theme.text};
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .section-subtitle {
          font-size: 13px;
          color: ${theme.textTertiary};
          line-height: 1.5;
        }

        /* Main Two-Column Layout */
        .content-columns {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 24px;
          min-height: 400px;
        }

        /* Sidebar Column */
        .sidebar-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-section {
          background: ${theme.cardBg};
          border: 1px solid ${theme.border};
          border-radius: 12px;
          overflow: hidden;
        }

        .sidebar-section-header {
          padding: 12px 16px;
          background: ${theme.cardBg};
          border-bottom: 1px solid ${theme.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-section-title {
          font-size: 11px;
          font-weight: 600;
          color: ${theme.textSecondary};
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sidebar-section-badge {
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
        }

        .sidebar-section-content {
          padding: 12px;
          max-height: 200px;
          overflow-y: auto;
        }

        .sidebar-section-content::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-section-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-section-content::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }

        /* Draft Item */
        .draft-item {
          padding: 10px 12px;
          background: ${theme.cardBg};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .draft-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }

        .draft-item.mapped {
          border-left: 3px solid #22C55E;
        }

        .draft-item.unmapped {
          border-left: 3px solid #EF4444;
        }

        .draft-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .draft-item-name {
          font-size: 12px;
          font-weight: 600;
          color: ${theme.text};
        }

        .draft-item-objective {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: ${theme.textSecondary};
        }

        /* Library Item */
        .library-item {
          padding: 10px 12px;
          background: ${theme.cardBg};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .library-item:hover {
          background: rgba(${themeColorRgb}, 0.06);
          border-color: rgba(${themeColorRgb}, 0.2);
        }

        .library-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .library-item-name {
          font-size: 12px;
          font-weight: 600;
          color: ${theme.text};
        }

        .library-item-description {
          font-size: 11px;
          color: ${theme.textTertiary};
        }

        /* Objectives Column */
        .objectives-column {
          display: flex;
          flex-direction: column;
        }

        .objectives-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .objectives-title {
          font-size: 13px;
          font-weight: 600;
          color: ${theme.textSecondary};
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .objectives-actions {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: ${theme.textSecondary};
        }

        .btn-secondary:hover {
          background: ${theme.border};
          border-color: rgba(255,255,255,0.15);
          color: ${theme.text};
        }

        .btn-primary {
          background: linear-gradient(135deg, ${themeColor} 0%, #3B82F6 100%);
          border: none;
          color: #fff;
          box-shadow: 0 2px 12px rgba(${themeColorRgb}, 0.25);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(${themeColorRgb}, 0.4);
        }

        /* Objectives List */
        .objectives-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .objective-row {
          position: relative;
          padding: 12px 16px;
          background: ${theme.cardBg};
          border: 1px solid ${theme.border};
          border-radius: 10px;
          border-left: 3px solid rgba(${themeColorRgb}, 0.5);
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.15s ease;
        }

        .objective-row:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }

        .objective-field {
          padding: 6px 10px;
          font-size: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 5px;
          color: ${theme.text};
          outline: none;
          font-family: inherit;
          transition: all 0.15s ease;
        }

        .objective-field:focus {
          border-color: rgba(${themeColorRgb}, 0.5);
          background: rgba(${themeColorRgb}, 0.05);
        }

        .objective-field::placeholder {
          color: ${theme.textMuted};
        }

        select.objective-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          padding-right: 28px;
          cursor: pointer;
        }

        .value-field {
          padding: 6px 8px;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 5px;
          color: ${themeColor};
          text-align: center;
          outline: none;
          width: 70px;
          transition: all 0.15s ease;
        }

        .value-field:focus {
          border-color: rgba(${themeColorRgb}, 0.5);
          background: rgba(${themeColorRgb}, 0.08);
        }

        .delete-btn {
          padding: 6px;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: ${theme.textMuted};
          opacity: 0;
          transition: all 0.15s ease;
        }

        .objective-row:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: ${theme.accentError};
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
        }

        .empty-state-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: rgba(${themeColorRgb}, 0.08);
          border: 1px dashed rgba(${themeColorRgb}, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .empty-state-title {
          font-size: 14px;
          font-weight: 500;
          color: ${theme.textSecondary};
          margin-bottom: 8px;
        }

        .empty-state-text {
          font-size: 12px;
          color: ${theme.textTertiary};
          max-width: 280px;
          line-height: 1.5;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid ${theme.border};
        }

        .btn-large {
          padding: 10px 20px;
          font-size: 13px;
        }

        .btn-large.btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-continue {
          background: linear-gradient(135deg, ${theme.accentInputs} 0%, #22D3EE 100%);
          border: none;
          color: #0a0a0f;
          box-shadow: 0 2px 12px rgba(45, 212, 191, 0.25);
        }

        .btn-continue:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(45, 212, 191, 0.4);
        }

        .btn-continue:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Search Input */
        .search-input-wrapper {
          position: relative;
          margin-bottom: 10px;
        }

        .search-input-wrapper svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: ${theme.textMuted};
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 32px;
          font-size: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid ${theme.borderStrong};
          border-radius: 6px;
          color: ${theme.text};
          outline: none;
          font-family: inherit;
        }

        .search-input:focus {
          border-color: rgba(${themeColorRgb}, 0.4);
        }

        .search-input::placeholder {
          color: ${theme.textMuted};
        }

        /* Filter Buttons */
        .filter-buttons {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 4px 8px;
          font-size: 10px;
          font-weight: 500;
          background: rgba(255,255,255,0.04);
          border: 1px solid ${theme.borderStrong};
          border-radius: 4px;
          color: ${theme.textTertiary};
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-btn:hover {
          background: ${theme.border};
          color: ${theme.textSecondary};
        }

        .filter-btn.active {
          background: rgba(${themeColorRgb}, 0.15);
          border-color: rgba(${themeColorRgb}, 0.3);
          color: ${themeColor};
        }

        /* Keyboard shortcuts */
        kbd {
          padding: 2px 5px;
          border-radius: 3px;
          background: ${theme.border};
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 10px;
          font-family: inherit;
          color: ${theme.textTertiary};
        }
      `}</style>

      <ProjectPageLayout
        currentStep={6}
        stepStatuses={stepStatuses}
        chatMessages={chatMessages}
        onSendChatMessage={handleSendMessage}
        onStepClick={handleStepClick}
        chatSubtitle="Objective Configuration Assistant"
      >
        {/* Project Info */}
        <div className="project-info">
          <div className="breadcrumb">Project Overview</div>
          <h1 className="project-title">{projectInfo.title}</h1>
          <p className="project-description">{projectInfo.description}</p>
        </div>

        {/* Section Header */}
          <div className="section-header">
            <div className="section-header-left">
              <div className="section-icon">
                <ObjectivesIcon />
              </div>
              <div className="section-text">
                <h2 className="section-title">
                  All Objectives
                  <span style={{ 
                    marginLeft: '12px',
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    background: `rgba(${themeColorRgb}, 0.15)`,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: themeColor,
                  }}>
                    {objectives.length}
                  </span>
                </h2>
                <p className="section-subtitle">
                  Set all Aims for Optimizations on Outcomes and Combinations
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Two Columns */}
          <div className="content-columns">
            {/* Left Sidebar */}
            <div className="sidebar-column">
              {/* Draft Objectives Section */}
              <div className="sidebar-section">
                <div className="sidebar-section-header">
                  <span className="sidebar-section-title">
                    <LinkIcon />
                    Draft Objectives
                    <span
                      className="sidebar-section-badge"
                      style={{
                        background: allDraftsMapped ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: allDraftsMapped ? '#22C55E' : '#EF4444',
                      }}
                    >
                      {unmappedDrafts.length === 0 ? 'All Mapped' : `${unmappedDrafts.length} Unmapped`}
                    </span>
                  </span>
                </div>
                <div className="sidebar-section-content">
                  {drafts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#52525B', margin: 0 }}>
                        No draft objectives from goals
                      </p>
                    </div>
                  ) : (
                    drafts.map((draft) => {
                      const isMapped = !!draft.mappedObjectiveId;
                      const needsConfirm = draft.needsConfirmation;
                      const canAutoCreate = !!draft.metricRef;

                      // Determine border color: amber=needs confirm, green=confirmed, red=unmapped
                      let borderColor = '#EF4444'; // red - unmapped
                      if (isMapped && needsConfirm) borderColor = '#F59E0B'; // amber - needs confirmation
                      else if (isMapped && !needsConfirm) borderColor = '#22C55E'; // green - confirmed

                      return (
                        <div
                          key={draft.id}
                          style={{
                            padding: '6px 10px',
                            marginBottom: '4px',
                            background: 'rgba(255,255,255,0.02)',
                            borderTop: `1px solid ${theme.border}`,
                            borderRight: `1px solid ${theme.border}`,
                            borderBottom: `1px solid ${theme.border}`,
                            borderLeft: `3px solid ${borderColor}`,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease',
                          }}
                          onClick={() => {
                            // Open mapping modal
                            setMappingDraftId(draft.id);
                            setShowMappingModal(true);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                          }}
                        >
                          {/* Left: Name + objective type & value */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#FAFAFA',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {draft.metricName}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              color: themeColor,
                              fontFamily: "'JetBrains Mono', monospace",
                              whiteSpace: 'nowrap',
                            }}>
                              {objectiveTypes.find(ct => ct.id === draft.operator)?.symbol || ''} {draft.value1}{draft.value2 ? `–${draft.value2}` : ''}
                            </span>
                          </div>

                          {/* Right: Status indicator */}
                          <div style={{ flexShrink: 0 }}>
                            {isMapped && needsConfirm && (
                              <span style={{
                                fontSize: '9px',
                                fontWeight: 600,
                                color: '#F59E0B',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="12" y1="8" x2="12" y2="12"/>
                                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                Confirm
                              </span>
                            )}
                            {isMapped && !needsConfirm && (
                              <span style={{
                                fontSize: '9px',
                                fontWeight: 600,
                                color: '#22C55E',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Linked
                              </span>
                            )}
                            {!isMapped && (
                              <span style={{
                                fontSize: '9px',
                                fontWeight: 600,
                                color: '#EF4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="15" y1="9" x2="9" y2="15"/>
                                  <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                Map
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Library Section */}
              <div className="sidebar-section" style={{ flex: 1 }}>
                <div className="sidebar-section-header">
                  <span className="sidebar-section-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    Outcomes & Combinations
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      style={{
                        padding: '4px 8px',
                        fontSize: '9px',
                        fontWeight: 600,
                        background: 'rgba(244, 114, 182, 0.1)',
                        color: '#F472B6',
                        border: '1px solid rgba(244, 114, 182, 0.25)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Outcome
                    </button>
                    <button
                      style={{
                        padding: '4px 8px',
                        fontSize: '9px',
                        fontWeight: 600,
                        background: 'rgba(167, 139, 250, 0.1)',
                        color: '#A78BFA',
                        border: '1px solid rgba(167, 139, 250, 0.25)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Combo
                    </button>
                  </div>
                </div>
                
                <div style={{ padding: '12px 12px 0 12px' }}>
                  <div className="search-input-wrapper">
                    <SearchIcon />
                    <input
                      type="text"
                      className="search-input"
                      value={sidebarSearch}
                      onChange={(e) => setSidebarSearch(e.target.value)}
                      placeholder="Search..."
                    />
                  </div>
                  <div className="filter-buttons">
                    {['All', 'Sensory', 'Consumer', 'Analytical', 'Combination'].map((filter) => (
                      <button
                        key={filter}
                        className={`filter-btn ${sidebarFilter === filter ? 'active' : ''}`}
                        onClick={() => setSidebarFilter(filter)}
                      >
                        {filter === 'Combination' ? 'Combos' : filter === 'Analytical' ? 'Analyt' : filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="sidebar-section-content" style={{ maxHeight: '300px' }}>
                  {getFilteredLibraryItems().length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#52525B', margin: 0 }}>
                        No outcomes or combinations found
                      </p>
                    </div>
                  ) : (
                    getFilteredLibraryItems().map((item) => (
                      <div
                        key={item.id}
                        className="library-item"
                        onClick={() => {
                          // Quick-add objective with this item
                          const newObjective = {
                            id: generateId(),
                            targetId: item.id,
                            targetName: item.name,
                            targetType: item.itemType,
                            targetOutcomeType: item.outcomeType,
                            targetVariableType: item.variableType,
                            targetLevels: item.levels || null,
                            objectiveType: null,
                            value1: '',
                            value2: '',
                            successCriteria1: '',
                            showSuccessCriteria: false,
                            tags: [],
                            mappedDraftId: null,
                          };
                          setObjectives(prev => [...prev, newObjective]);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="library-item-name">{item.name}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <OutcomeTypeTag type={item.outcomeType} small />
                            <VariableTypeTag type={item.variableType} small />
                          </div>
                        </div>
                        {item.description && (
                          <span className="library-item-description">{item.description}</span>
                        )}
                        {item.levels && (
                          <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {item.levels.slice(0, 3).map((level, i) => (
                              <span key={i} style={{
                                padding: '2px 6px',
                                borderRadius: '3px',
                                background: 'rgba(255,255,255,0.1)',
                                fontSize: '9px',
                                color: '#A1A1AA',
                              }}>
                                {level}
                              </span>
                            ))}
                            {item.levels.length > 3 && (
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '3px',
                                background: 'rgba(255,255,255,0.1)',
                                fontSize: '9px',
                                color: '#71717A',
                              }}>
                                +{item.levels.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right - Objectives List */}
            <div className="objectives-column">
              <div className="objectives-header">
                <span className="objectives-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Project Objectives
                </span>
                <div className="objectives-actions">
                  <button className="btn btn-secondary" onClick={handleImportDefaults}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Add Defaults
                    <kbd>⌘D</kbd>
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowAddFromModal(true)}>
                    <ImportIcon />
                    Product
                    <kbd>⌘O</kbd>
                  </button>
                  <button className="btn btn-primary" onClick={handleAddNew}>
                    <PlusIcon />
                    Add New
                    <kbd style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>⌘N</kbd>
                  </button>
                </div>
              </div>

              <div className="objectives-list">
                {objectives.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <ObjectivesIcon style={{ color: themeColor, opacity: 0.5 }} />
                    </div>
                    <p className="empty-state-title">No objectives defined</p>
                    <p className="empty-state-text">
                      Add objectives from your product library, import defaults, or click an outcome/combination 
                      from the sidebar to get started.
                    </p>
                  </div>
                ) : (
                  objectives.map((objective) => {
                    const needsConfirm = objective.needsConfirmation;
                    const isNominal = objective.targetVariableType === 'Nominal';
                    const isOrdinal = objective.targetVariableType === 'Ordinal';
                    const isContinuous = objective.targetVariableType === 'Continuous' || !objective.targetVariableType;
                    
                    return (
                      <div
                        key={objective.id}
                        className="objective-row"
                        style={{
                          borderLeft: needsConfirm ? '3px solid #F59E0B' : undefined,
                          background: needsConfirm ? 'rgba(245, 158, 11, 0.05)' : undefined,
                        }}
                        onMouseEnter={() => setHoveredObjective(objective.id)}
                        onMouseLeave={() => setHoveredObjective(null)}
                      >
                        {/* Target with Autocomplete */}
                        <div style={{ position: 'relative', flex: '0 0 180px' }}>
                        <input
                          type="text"
                          className="objective-field"
                          style={{ width: '100%' }}
                          value={objective.targetName}
                          onChange={(e) => {
                            updateObjective(objective.id, { 
                              targetName: e.target.value,
                              targetId: null,
                              targetType: null,
                              targetOutcomeType: null,
                              targetVariableType: null,
                              targetLevels: null,
                            });
                            if (e.target.value.length >= 1) {
                              setActiveAutocomplete(objective.id);
                              setAutocompleteIndex(0);
                            } else {
                              setActiveAutocomplete(null);
                            }
                          }}
                          onFocus={() => {
                            setActiveAutocomplete(objective.id);
                            setAutocompleteIndex(0);
                          }}
                          onBlur={() => {
                            setTimeout(() => setActiveAutocomplete(null), 150);
                          }}
                          onKeyDown={(e) => {
                            const suggestions = getAutocompleteSuggestions(objective.targetName);
                            if (activeAutocomplete === objective.id && suggestions.length > 0) {
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setAutocompleteIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setAutocompleteIndex(prev => Math.max(prev - 1, 0));
                              } else if (e.key === 'Enter') {
                                e.preventDefault();
                                applyAutocompleteSelection(objective.id, suggestions[autocompleteIndex]);
                              }
                            }
                          }}
                          placeholder="Target outcome..."
                          autoComplete="off"
                        />
                        
                        {/* Autocomplete Dropdown */}
                        {activeAutocomplete === objective.id && (() => {
                          const suggestions = getAutocompleteSuggestions(objective.targetName);
                          if (suggestions.length === 0) return null;
                          
                          return (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              width: '300px',
                              marginTop: '4px',
                              background: '#15151a',
                              border: `1px solid rgba(${themeColorRgb}, 0.3)`,
                              borderRadius: '8px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                              zIndex: 100,
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                padding: '6px 10px',
                                borderBottom: `1px solid ${theme.border}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}>
                                <span style={{ fontSize: '9px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Select target
                                </span>
                                <span style={{ fontSize: '9px', color: '#52525B' }}>
                                  ↑↓ nav · Enter select
                                </span>
                              </div>
                              {suggestions.map((item, idx) => (
                                <div
                                  key={item.id}
                                  onClick={() => applyAutocompleteSelection(objective.id, item)}
                                  onMouseEnter={() => setAutocompleteIndex(idx)}
                                  style={{
                                    padding: '8px 10px',
                                    cursor: 'pointer',
                                    background: idx === autocompleteIndex ? `rgba(${themeColorRgb}, 0.1)` : 'transparent',
                                    borderLeft: idx === autocompleteIndex ? `2px solid ${themeColor}` : '2px solid transparent',
                                    transition: 'all 0.1s ease',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#FAFAFA' }}>{item.name}</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <OutcomeTypeTag type={item.outcomeType} small />
                                      <VariableTypeTag type={item.variableType} small />
                                    </div>
                                  </div>
                                  {item.description && (
                                    <span style={{ fontSize: '10px', color: '#71717A' }}>{item.description}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Objective Type */}
                      <select
                        className="objective-field"
                        style={{ flex: '0 0 100px' }}
                        value={objective.objectiveType || ''}
                        onChange={(e) => {
                          updateObjective(objective.id, { 
                            objectiveType: e.target.value || null,
                            showSuccessCriteria: false,
                            successCriteria1: '',
                            value1: '',
                            value2: '',
                          });
                        }}
                      >
                        <option value="">Type...</option>
                        {objectiveTypes
                          .filter(ot => {
                            if (!objective.targetVariableType) return true;
                            return ot.eligibleVariables.includes(objective.targetVariableType);
                          })
                          .map(ot => (
                            <option key={ot.id} value={ot.id}>{ot.symbol} {ot.label}</option>
                          ))}
                      </select>
                      
                      {/* Value Fields + Success Criteria - conditional on objective type */}
                      <div style={{ flex: '0 0 200px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {/* Maximize - optional "+ Success Criteria" success criteria */}
                        {objective.objectiveType === 'maximize' && (
                          <>
                            {!objective.showSuccessCriteria ? (
                              <button
                                onClick={() => updateObjective(objective.id, { showSuccessCriteria: true })}
                                className="success-toggle"
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '10px',
                                  fontWeight: 500,
                                  background: 'rgba(34, 197, 94, 0.1)',
                                  color: '#22C55E',
                                  border: '1px dashed rgba(34, 197, 94, 0.3)',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                              >
                                + Success Criteria
                              </button>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '9px', fontStyle: 'italic', color: '#22C55E', opacity: 0.7 }}>Success</span><span style={{ fontSize: '10px', color: '#22C55E', fontWeight: 600 }}>At Least</span>
                                {isContinuous ? (
                                  <input
                                    type="number"
                                    step="any"
                                    value={objective.successCriteria1 || ''}
                                    onChange={(e) => updateObjective(objective.id, { successCriteria1: e.target.value })}
                                    placeholder="Min"
                                    className="value-field"
                                    style={{ width: '70px' }}
                                  />
                                ) : isOrdinal && objective.targetLevels ? (
                                  <select
                                    value={objective.successCriteria1 || ''}
                                    onChange={(e) => updateObjective(objective.id, { successCriteria1: e.target.value })}
                                    className="objective-field"
                                    style={{ width: '100px', fontSize: '10px', padding: '5px 6px' }}
                                  >
                                    <option value="">Min level...</option>
                                    {objective.targetLevels.map((level, idx) => (
                                      <option key={idx} value={level}>{level}</option>
                                    ))}
                                  </select>
                                ) : null}
                                <button
                                  onClick={() => updateObjective(objective.id, { showSuccessCriteria: false, successCriteria1: '' })}
                                  style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717A', display: 'flex' }}
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {/* Minimize - optional "+ Success Criteria" success criteria */}
                        {objective.objectiveType === 'minimize' && (
                          <>
                            {!objective.showSuccessCriteria ? (
                              <button
                                onClick={() => updateObjective(objective.id, { showSuccessCriteria: true })}
                                className="success-toggle"
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '10px',
                                  fontWeight: 500,
                                  background: 'rgba(34, 197, 94, 0.1)',
                                  color: '#22C55E',
                                  border: '1px dashed rgba(34, 197, 94, 0.3)',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                              >
                                + Success Criteria
                              </button>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '9px', fontStyle: 'italic', color: '#22C55E', opacity: 0.7 }}>Success</span><span style={{ fontSize: '10px', color: '#22C55E', fontWeight: 600 }}>At Most</span>
                                {isContinuous ? (
                                  <input
                                    type="number"
                                    step="any"
                                    value={objective.successCriteria1 || ''}
                                    onChange={(e) => updateObjective(objective.id, { successCriteria1: e.target.value })}
                                    placeholder="Max"
                                    className="value-field"
                                    style={{ width: '70px' }}
                                  />
                                ) : isOrdinal && objective.targetLevels ? (
                                  <select
                                    value={objective.successCriteria1 || ''}
                                    onChange={(e) => updateObjective(objective.id, { successCriteria1: e.target.value })}
                                    className="objective-field"
                                    style={{ width: '100px', fontSize: '10px', padding: '5px 6px' }}
                                  >
                                    <option value="">Max level...</option>
                                    {objective.targetLevels.map((level, idx) => (
                                      <option key={idx} value={level}>{level}</option>
                                    ))}
                                  </select>
                                ) : null}
                                <button
                                  onClick={() => updateObjective(objective.id, { showSuccessCriteria: false, successCriteria1: '' })}
                                  style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717A', display: 'flex' }}
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Target/Approximately - value field + optional "+ Success Criteria" (not for Nominal) */}
                        {objective.objectiveType === 'approximately' && (
                          <>
                            {isContinuous && (
                              <input
                                type="number"
                                step="any"
                                value={objective.value1 || ''}
                                onChange={(e) => updateObjective(objective.id, { value1: e.target.value })}
                                placeholder="Target"
                                className="value-field"
                                style={{ width: '70px' }}
                              />
                            )}
                            {(isOrdinal || isNominal) && objective.targetLevels && (
                              <select
                                value={objective.value1 || ''}
                                onChange={(e) => updateObjective(objective.id, { value1: e.target.value })}
                                className="objective-field"
                                style={{ width: '120px', fontSize: '11px', padding: '6px 8px' }}
                              >
                                <option value="">Target...</option>
                                {objective.targetLevels.map((level, idx) => (
                                  <option key={idx} value={level}>{level}</option>
                                ))}
                              </select>
                            )}
                            {/* Success criteria for Target - NOT for Nominal */}
                            {!isNominal && (
                              <>
                                {!objective.showSuccessCriteria ? (
                                  <button
                                    onClick={() => updateObjective(objective.id, { showSuccessCriteria: true })}
                                    className="success-toggle"
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '10px',
                                      fontWeight: 500,
                                      background: 'rgba(34, 197, 94, 0.1)',
                                      color: '#22C55E',
                                      border: '1px dashed rgba(34, 197, 94, 0.3)',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    + Success Criteria
                                  </button>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '9px', fontStyle: 'italic', color: '#22C55E', opacity: 0.7 }}>Success</span><span style={{ fontSize: '10px', color: '#22C55E', fontWeight: 600 }}>Within</span>
                                    {isContinuous ? (
                                      <input
                                        type="number"
                                        step="any"
                                        value={objective.successCriteria1 || ''}
                                        onChange={(e) => updateObjective(objective.id, { successCriteria1: e.target.value })}
                                        placeholder="Tol"
                                        className="value-field"
                                        style={{ width: '50px' }}
                                      />
                                    ) : isOrdinal ? (
                                      <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={objective.successCriteria1 || ''}
                                        onChange={(e) => updateObjective(objective.id, { successCriteria1: e.target.value })}
                                        placeholder="Lvls"
                                        className="value-field"
                                        style={{ width: '50px' }}
                                      />
                                    ) : null}
                                    <button
                                      onClick={() => updateObjective(objective.id, { showSuccessCriteria: false, successCriteria1: '' })}
                                      style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717A', display: 'flex' }}
                                    >
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                        
                        {/* Between - two value fields, no success criteria */}
                        {objective.objectiveType === 'between' && (
                          <>
                            {isContinuous && (
                              <>
                                <input
                                  type="number"
                                  step="any"
                                  value={objective.value1 || ''}
                                  onChange={(e) => updateObjective(objective.id, { value1: e.target.value })}
                                  placeholder="Min"
                                  className="value-field"
                                  style={{ width: '70px' }}
                                />
                                <span style={{ color: '#52525B', fontSize: '10px' }}>–</span>
                                <input
                                  type="number"
                                  step="any"
                                  value={objective.value2 || ''}
                                  onChange={(e) => updateObjective(objective.id, { value2: e.target.value })}
                                  placeholder="Max"
                                  className="value-field"
                                  style={{ width: '70px' }}
                                />
                              </>
                            )}
                            {isOrdinal && objective.targetLevels && (
                              <>
                                <select
                                  value={objective.value1 || ''}
                                  onChange={(e) => updateObjective(objective.id, { value1: e.target.value })}
                                  className="objective-field"
                                  style={{ width: '100px', fontSize: '10px', padding: '5px 6px' }}
                                >
                                  <option value="">Min</option>
                                  {objective.targetLevels.map((level, idx) => (
                                    <option key={idx} value={level}>{level}</option>
                                  ))}
                                </select>
                                <span style={{ color: '#52525B', fontSize: '10px' }}>–</span>
                                <select
                                  value={objective.value2 || ''}
                                  onChange={(e) => updateObjective(objective.id, { value2: e.target.value })}
                                  className="objective-field"
                                  style={{ width: '100px', fontSize: '10px', padding: '5px 6px' }}
                                >
                                  <option value="">Max</option>
                                  {objective.targetLevels.map((level, idx) => (
                                    <option key={idx} value={level}>{level}</option>
                                  ))}
                                </select>
                              </>
                            )}
                          </>
                        )}
                        
                        {!objective.objectiveType && (
                          <span style={{ fontSize: '11px', color: '#52525B', fontStyle: 'italic' }}>
                            Select type
                          </span>
                        )}
                      </div>
                      
                      {/* Spacer to push right-aligned items */}
                      <div style={{ flex: 1 }} />
                      
                      {/* Right-aligned: Tags + Confirm/Reject + Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {/* Compact Tags with Hover Popup */}
                        <TagPopup
                          objective={objective}
                          tags={tags}
                          setTags={setTags}
                          tagSearchQuery={tagSearchQuery}
                          setTagSearchQuery={setTagSearchQuery}
                          getTagSuggestions={getTagSuggestions}
                          addTagToObjective={addTagToObjective}
                          updateObjective={updateObjective}
                          themeColor={themeColor}
                        />
                        
                        {/* Confirm/Reject buttons - only show for objectives needing confirmation */}
                        {needsConfirm && (
                          <>
                            {/* Reject (X) button */}
                            <button
                              onClick={() => {
                                deleteObjective(objective.id);
                                if (objective.mappedDraftId) {
                                  setDrafts(prev => prev.map(d => 
                                    d.id === objective.mappedDraftId ? { ...d, mappedObjectiveId: null, needsConfirmation: false } : d
                                  ));
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '4px',
                                color: '#EF4444',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                flexShrink: 0,
                              }}
                              title="Reject"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                            {/* Confirm (checkmark) button */}
                            <button
                              onClick={() => {
                                updateObjective(objective.id, { needsConfirmation: false });
                                if (objective.mappedDraftId) {
                                  setDrafts(prev => prev.map(d => 
                                    d.id === objective.mappedDraftId ? { ...d, needsConfirmation: false } : d
                                  ));
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                background: 'rgba(34, 197, 94, 0.15)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: '4px',
                                color: '#22C55E',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                flexShrink: 0,
                              }}
                              title="Confirm"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          </>
                        )}
                        
                        {/* Delete - only show when NOT needing confirmation (shows after confirm/reject) */}
                        {!needsConfirm && (
                          <button 
                            className="delete-btn"
                            onClick={() => deleteObjective(objective.id)}
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button className="btn btn-large btn-secondary" onClick={() => setStepStatus(6, 'draft')}>
              Save as Draft
            </button>
            <button
              className="btn btn-large btn-continue"
              disabled={!isValid}
              onClick={() => {
                setStepStatus(6, 'completed');
                navigate('/project/new/step-7');
              }}
            >
              Continue to Prioritization
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
      </ProjectPageLayout>

      {/* Add From Product Modal - Phase 5 */}
      {showAddFromModal && (
        <AddFromProductModal 
          onClose={() => setShowAddFromModal(false)}
          onImport={(selected) => {
            // Import selected objectives
            const newObjectives = selected.map(item => ({
              ...item,
              id: generateId(),
            }));
            setObjectives(prev => [...prev, ...newObjectives]);
            setShowAddFromModal(false);
          }}
          productObjectives={productObjectives}
          productTags={productTags}
        />
      )}
      
      {/* Mapping Modal */}
      {showMappingModal && mappingDraftId && (
        <MappingModal 
          draft={drafts.find(d => d.id === mappingDraftId)}
          objectives={objectives}
          onClose={() => {
            setShowMappingModal(false);
            setMappingDraftId(null);
          }}
          onMap={(objectiveId) => {
            mapDraftToObjective(mappingDraftId, objectiveId);
            // Confirm the objective
            setObjectives(prev => prev.map(c => 
              c.id === objectiveId ? { ...c, needsConfirmation: false } : c
            ));
            // Mark draft as confirmed
            setDrafts(prev => prev.map(d => 
              d.id === mappingDraftId ? { ...d, needsConfirmation: false } : d
            ));
            setShowMappingModal(false);
            setMappingDraftId(null);
          }}
          onUnmap={() => {
            unmapDraft(mappingDraftId);
            setShowMappingModal(false);
            setMappingDraftId(null);
          }}
        />
      )}
    </>
  );
}

// ============================================
// MAPPING MODAL
// ============================================
const MappingModal = ({ draft, objectives, onClose, onMap, onUnmap }) => {
  const { theme } = useTheme();
  const themeColor = theme.accentObjectives;
  const themeColorRgb = '96, 165, 250';
  
  if (!draft) return null;
  
  const isMapped = !!draft.mappedObjectiveId;
  const currentObjective = isMapped ? objectives.find(c => c.id === draft.mappedObjectiveId) : null;
  
  // Get available objectives to map to (ones that aren't already mapped to another draft)
  const availableObjectives = objectives.filter(c => !c.mappedDraftId || c.mappedDraftId === draft.id);
  
  return (
    <>
      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '500px',
            maxWidth: '95vw',
            background: '#0f0f14',
            borderRadius: '16px',
            border: `1px solid rgba(${themeColorRgb}, 0.2)`,
            boxShadow: `0 0 60px rgba(${themeColorRgb}, 0.1), 0 25px 80px rgba(0,0,0,0.6)`,
            overflow: 'hidden',
            animation: 'modalEnter 0.25s ease-out',
          }}
        >
          {/* Modal Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.borderStrong}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#FAFAFA' }}>
                Map Draft Objective
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#71717A' }}>
                Link "{draft.metricName}" to a objective
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '6px',
                background: 'rgba(255,255,255,0.04)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#71717A',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Draft Info */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(96, 165, 250, 0.05)',
            borderBottom: `1px solid ${theme.border}`,
          }}>
            <div style={{ fontSize: '10px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Draft from Goals
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA' }}>{draft.metricName}</span>
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontSize: '11px', 
                fontWeight: 600,
                background: `rgba(${themeColorRgb}, 0.15)`,
                color: themeColor,
              }}>
                {objectiveTypes.find(ot => ot.id === draft.operator)?.symbol || ''} {draft.value1}{draft.value2 ? `–${draft.value2}` : ''}
              </span>
            </div>
          </div>

          {/* Current Mapping Status */}
          {isMapped && currentObjective && (
            <div style={{
              padding: '12px 20px',
              background: 'rgba(245, 158, 11, 0.08)',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span style={{ fontSize: '12px', color: '#F59E0B' }}>
                  Currently linked to: <strong>{currentObjective.targetName}</strong>
                </span>
              </div>
              <button
                onClick={onUnmap}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 500,
                  background: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '4px',
                  color: '#EF4444',
                  cursor: 'pointer',
                }}
              >
                Unlink
              </button>
            </div>
          )}

          {/* Available Objectives to Map */}
          <div style={{ padding: '12px 20px' }}>
            <div style={{ fontSize: '10px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Select a objective to link
            </div>
            <div style={{ maxHeight: '240px', overflow: 'auto' }}>
              {availableObjectives.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#52525B', margin: 0 }}>
                    No objectives available. Create one first.
                  </p>
                </div>
              ) : (
                availableObjectives.map(objective => {
                  const isCurrentlyMapped = objective.id === draft.mappedObjectiveId;
                  return (
                    <div
                      key={objective.id}
                      onClick={() => !isCurrentlyMapped && onMap(objective.id)}
                      style={{
                        padding: '10px 12px',
                        marginBottom: '6px',
                        background: isCurrentlyMapped ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isCurrentlyMapped ? 'rgba(245, 158, 11, 0.3)' : theme.borderStrong}`,
                        borderRadius: '8px',
                        cursor: isCurrentlyMapped ? 'default' : 'pointer',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>
                            {objective.targetName}
                          </span>
                          <span style={{ 
                            fontSize: '11px', 
                            color: themeColor,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            {objectiveTypes.find(ot => ot.id === objective.objectiveType)?.symbol || ''} {objective.value1}{objective.value2 ? `–${objective.value2}` : ''}
                          </span>
                        </div>
                        {isCurrentlyMapped && (
                          <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 600 }}>CURRENT</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px',
            borderTop: `1px solid ${theme.borderStrong}`,
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                background: 'transparent',
                color: '#71717A',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
const AddFromProductModal = ({ onClose, onImport, productObjectives, productTags }) => {
  const { theme } = useTheme();
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'tags'
  const [selectedTagId, setSelectedTagId] = useState(null); // For tag drill-down

  const themeColor = theme.accentObjectives;
  const themeColorRgb = '96, 165, 250';

  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
      return [...prev, item];
    });
  };
  
  const selectAll = () => {
    const toSelect = activeTab === 'tags' && selectedTagId 
      ? objectivesForSelectedTag 
      : filteredObjectives;
    setSelectedItems([...toSelect]);
  };

  // Filter for All Objectives tab
  const filteredObjectives = productObjectives.filter(c => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const matchesName = c.targetName?.toLowerCase().includes(lowerQuery);
    const matchesTag = c.tags?.some(t => t.name.toLowerCase().includes(lowerQuery));
    return matchesName || matchesTag;
  });

  // Filter tags for Tags tab
  const filteredTags = productTags.filter(t => {
    if (!searchQuery) return true;
    return t.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get objectives for selected tag
  const objectivesForSelectedTag = selectedTagId 
    ? productObjectives.filter(c => c.tags?.some(t => t.id === selectedTagId))
    : [];

  const selectedTag = productTags.find(t => t.id === selectedTagId);

  return (
    <>
      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '700px',
            maxWidth: '95vw',
            maxHeight: '80vh',
            background: '#0f0f14',
            borderRadius: '16px',
            border: `1px solid rgba(${themeColorRgb}, 0.2)`,
            boxShadow: `0 0 60px rgba(${themeColorRgb}, 0.1), 0 25px 80px rgba(0,0,0,0.6)`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'modalEnter 0.25s ease-out',
          }}
        >
          {/* Modal Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid ${theme.borderStrong}',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `rgba(${themeColorRgb}, 0.1)`,
                border: `1px solid rgba(${themeColorRgb}, 0.25)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ImportIcon style={{ color: themeColor }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#FAFAFA' }}>
                  Import from Product
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#71717A' }}>
                  Select objectives from your product library
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#71717A',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${theme.borderStrong}`,
          }}>
            <button
              onClick={() => { setActiveTab('all'); setSelectedTagId(null); setSearchQuery(''); }}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: 600,
                background: activeTab === 'all' ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'all' ? `2px solid ${themeColor}` : '2px solid transparent',
                color: activeTab === 'all' ? themeColor : '#71717A',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All Objectives
            </button>
            <button
              onClick={() => { setActiveTab('tags'); setSearchQuery(''); }}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: 600,
                background: activeTab === 'tags' ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'tags' ? `2px solid ${themeColor}` : '2px solid transparent',
                color: activeTab === 'tags' ? themeColor : '#71717A',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Browse by Tag
            </button>
          </div>

          {/* Search Bar */}
          <div style={{
            padding: '12px 24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#52525B"
                strokeWidth="2"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'all' ? 'Search objectives...' : (selectedTagId ? 'Search within tag...' : 'Search tags...')}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  fontSize: '13px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#FAFAFA',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            {(activeTab === 'all' || selectedTagId) && (
              <button
                onClick={selectAll}
                style={{
                  padding: '10px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#A1A1AA',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
              >
                Select all
              </button>
            )}
          </div>

          {/* Content Area */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '0 24px 12px',
          }}>
            {/* ALL CONSTRAINTS TAB */}
            {activeTab === 'all' && (
              <>
                {filteredObjectives.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#52525B', margin: 0 }}>
                      No objectives found
                    </p>
                  </div>
                ) : (
                  filteredObjectives.map(objective => {
                    const isSelected = selectedItems.find(i => i.id === objective.id);
                    return (
                      <div
                        key={objective.id}
                        onClick={() => toggleItem(objective)}
                        style={{
                          padding: '12px 14px',
                          marginBottom: '8px',
                          background: isSelected ? `rgba(${themeColorRgb}, 0.1)` : 'rgba(255,255,255,0.02)',
                          border: isSelected ? `1px solid rgba(${themeColorRgb}, 0.3)` : `1px solid ${theme.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Checkbox */}
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.2)',
                            background: isSelected ? themeColor : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {isSelected && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>

                          {/* Objective Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>
                                {objective.targetName}
                              </span>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 600,
                                background: `rgba(${themeColorRgb}, 0.15)`,
                                color: themeColor,
                              }}>
                                {objectiveTypes.find(ot => ot.id === objective.objectiveType)?.symbol || ''} {objective.value1}{objective.value2 ? `–${objective.value2}` : ''}
                              </span>
                            </div>
                            {/* Tags */}
                            {objective.tags && objective.tags.length > 0 && (
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {objective.tags.map(tag => (
                                  <span key={tag.id} style={{
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontSize: '10px',
                                    fontWeight: 500,
                                    background: `${tag.color}20`,
                                    color: tag.color,
                                  }}>
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* BROWSE BY TAG TAB */}
            {activeTab === 'tags' && !selectedTagId && (
              <>
                {filteredTags.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#52525B', margin: 0 }}>
                      No tags found
                    </p>
                  </div>
                ) : (
                  filteredTags.map(tag => {
                    const count = productObjectives.filter(c => c.tags?.some(t => t.id === tag.id)).length;
                    return (
                      <div
                        key={tag.id}
                        onClick={() => { setSelectedTagId(tag.id); setSearchQuery(''); }}
                        style={{
                          padding: '14px 16px',
                          marginBottom: '8px',
                          background: 'rgba(255,255,255,0.02)',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: tag.color,
                          }} />
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA' }}>
                            {tag.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#71717A' }}>
                            {count} objective{count !== 1 ? 's' : ''}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525B" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* TAG DRILL-DOWN VIEW */}
            {activeTab === 'tags' && selectedTagId && (
              <>
                {/* Back button */}
                <button
                  onClick={() => { setSelectedTagId(null); setSearchQuery(''); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    marginBottom: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${theme.borderStrong}`,
                    borderRadius: '6px',
                    color: '#A1A1AA',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  Back to tags
                </button>

                {/* Tag header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  padding: '12px 14px',
                  background: `${selectedTag?.color}10`,
                  border: `1px solid ${selectedTag?.color}30`,
                  borderRadius: '8px',
                }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    background: selectedTag?.color,
                  }} />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: selectedTag?.color }}>
                    {selectedTag?.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#71717A' }}>
                    ({objectivesForSelectedTag.length} objective{objectivesForSelectedTag.length !== 1 ? 's' : ''})
                  </span>
                </div>

                {/* Objectives for this tag */}
                {objectivesForSelectedTag.map(objective => {
                  const isSelected = selectedItems.find(i => i.id === objective.id);
                  return (
                    <div
                      key={objective.id}
                      onClick={() => toggleItem(objective)}
                      style={{
                        padding: '12px 14px',
                        marginBottom: '8px',
                        background: isSelected ? `rgba(${themeColorRgb}, 0.1)` : 'rgba(255,255,255,0.02)',
                        border: isSelected ? `1px solid rgba(${themeColorRgb}, 0.3)` : `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.2)',
                          background: isSelected ? themeColor : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>
                              {objective.targetName}
                            </span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              background: `rgba(${themeColorRgb}, 0.15)`,
                              color: themeColor,
                            }}>
                              {objectiveTypes.find(ot => ot.id === objective.objectiveType)?.symbol || ''} {objective.value1}{objective.value2 ? `–${objective.value2}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: `1px solid ${theme.borderStrong}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '12px', color: '#71717A' }}>
              {selectedItems.length} selected
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#71717A',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => onImport(selectedItems)}
                disabled={selectedItems.length === 0}
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: selectedItems.length > 0
                    ? `linear-gradient(135deg, ${themeColor} 0%, #3B82F6 100%)`
                    : 'rgba(255,255,255,0.04)',
                  border: selectedItems.length > 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: selectedItems.length > 0 ? '#0A0A0C' : '#52525B',
                  cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: selectedItems.length > 0 ? `0 2px 12px rgba(${themeColorRgb}, 0.3)` : 'none',
                }}
              >
                Import Selected
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
