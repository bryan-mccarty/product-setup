import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';

// Unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Available tags from product
const productTags = [
  { id: 'tag-default', name: 'Default', color: '#60A5FA', isDefault: true },
  { id: 'tag-1', name: 'Primary', color: '#3B82F6' },
  { id: 'tag-2', name: 'Secondary', color: '#A78BFA' },
  { id: 'tag-3', name: 'Consumer Focus', color: '#F472B6' },
  { id: 'tag-4', name: 'Cost Reduction', color: '#22C55E' },
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
    tags: [productTags[0], productTags[3]] // Default, Consumer Focus
  },
  { 
    id: 'po-2', 
    targetId: 'combo-4', 
    targetName: 'Total Cost', 
    targetType: 'combination',
    objectiveType: 'minimize', 
    value1: '', 
    value2: '',
    tags: [productTags[0], productTags[4]] // Default, Cost Reduction
  },
  { 
    id: 'po-3', 
    targetId: 'outcome-1', 
    targetName: 'Sweetness', 
    targetType: 'outcome',
    objectiveType: 'approximately', 
    value1: '7.5', 
    value2: '',
    tags: [productTags[0]] // Default
  },
  { 
    id: 'po-4', 
    targetId: 'outcome-5', 
    targetName: 'Moisture Content', 
    targetType: 'outcome',
    objectiveType: 'between', 
    value1: '0.65', 
    value2: '0.75',
    tags: [productTags[1]] // Primary
  },
  { 
    id: 'po-5', 
    targetId: 'outcome-4', 
    targetName: 'Purchase Intent', 
    targetType: 'outcome',
    objectiveType: 'maximize', 
    value1: '', 
    value2: '',
    tags: [productTags[3]] // Consumer Focus
  },
];

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
    'Other': { bg: 'rgba(113, 113, 122, 0.15)', text: '#A1A1AA', border: 'rgba(113, 113, 122, 0.3)' },
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
          background: 'rgba(255,255,255,0.03)',
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
          <div key={i} style={{ background: tag.color, borderRadius: '2px', width: '100%', height: '100%' }} />
        ))}
        {(objective.tags || []).length < 4 && Array(4 - (objective.tags || []).length).fill(0).map((_, i) => (
          <div key={`empty-${i}`} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '2px', width: '100%', height: '100%' }} />
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
            <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
                  color: '#E4E4E7',
                  outline: 'none',
                }}
              />
            </div>
            {/* Current tags */}
            {(objective.tags || []).length > 0 && (
              <div style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '9px', color: '#71717A', marginBottom: '4px', textTransform: 'uppercase' }}>Current</div>
                {objective.tags.map(tag => (
                  <div key={tag.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: tag.color }} />
                      <span style={{ fontSize: '11px', color: '#E4E4E7' }}>{tag.name}</span>
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
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
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
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
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
  const navigate = useNavigate();
  const {
    projectOutcomes,          // ONLY project outcomes (from step 5)
    projectCombinations,      // Project combinations (if any)
    draftObjectives,          // From Goals/Claims step
    projectMetadata,
    projectObjectives,
    setProjectObjectives,
    stepStatuses,
    setStepStatus
  } = useData();

  const currentStep = 6;

  const steps = [
    { number: 1, name: 'Basic Information' },
    { number: 2, name: 'Define Goals / Claims' },
    { number: 3, name: 'Select Inputs' },
    { number: 4, name: 'Define Constraints' },
    { number: 5, name: 'Select Outcomes' },
    { number: 6, name: 'Set Objectives' },
    { number: 7, name: 'Prioritize Objectives' },
    { number: 8, name: 'Review' }
  ];

  // Get step status from context
  const getStepStatus = (stepNumber: number) => {
    // Current step shows cyan UNLESS it's been saved as draft (then show orange)
    if (stepNumber === currentStep) {
      if (stepStatuses[stepNumber] === 'draft') return 'draft';
      return 'current';
    }
    if (stepStatuses[stepNumber] === 'completed') return 'completed';
    if (stepStatuses[stepNumber] === 'draft') return 'draft';
    if (stepStatuses[stepNumber] === 'incomplete') return 'incomplete';
    return 'upcoming';
  };

  const getStepClass = (step) => {
    return getStepStatus(step.number);
  };

  // Navigation handlers
  const handleStepClick = (stepNumber: number) => {
    // Mark current step as incomplete ONLY when leaving via stepper (not Continue button)
    const currentStatus = stepStatuses[currentStep];
    if (currentStatus !== 'completed' && currentStatus !== 'draft') {
      setStepStatus(currentStep, 'incomplete');
    }
    navigate(`/project/new/step-${stepNumber}`);
  };

  const handleContinue = () => {
    // Save objectives to project context
    setProjectObjectives(objectives.map((o: any) => ({
      id: o.id,
      targetName: o.targetName,
      objectiveType: o.objectiveType,
      value1: o.value1,
      value2: o.value2,
      successCriteria: '',
      tags: o.tags?.map((t: any) => t.name || t) || [],
    })));
    setStepStatus(currentStep, 'completed');
    navigate('/project/new/step-7');
  };

  const handleSaveAsDraft = () => {
    setProjectObjectives(objectives.map((o: any) => ({
      id: o.id,
      targetName: o.targetName,
      objectiveType: o.objectiveType,
      value1: o.value1,
      value2: o.value2,
      successCriteria: '',
      tags: o.tags?.map((t: any) => t.name || t) || [],
    })));
    setStepStatus(currentStep, 'draft');
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Project info from context
  const projectInfo = {
    title: projectMetadata?.name || "New Project",
    description: projectMetadata?.description || "Define objectives for your formulation project"
  };

  // ========== STATE ==========
  // Auto-generate objectives from drafts that can be matched to outcomes/combinations
  const [objectives, setObjectives] = useState<any[]>(() => {
    // If we have existing project objectives, use those
    if (projectObjectives.length > 0) {
      return projectObjectives.map(o => {
        const matchedOutcome = projectOutcomes.find((out: any) => out.name === o.targetName);
        return {
          ...o,
          targetId: matchedOutcome?.id || null,
          targetType: matchedOutcome ? 'outcome' : 'combination',
          targetOutcomeType: matchedOutcome?.outcomeType || 'Combination',
          targetVariableType: matchedOutcome?.variableType || 'Continuous',
          mappedDraftId: null,
          needsConfirmation: false,
        };
      });
    }

    // Otherwise, auto-create from draft objectives
    const autoCreated: any[] = [];
    draftObjectives.forEach((draft: any) => {
      // Try to match draft to an outcome or combination
      const matchedOutcome = projectOutcomes.find((o: any) => o.name === draft.metricName);
      const matchedCombo = projectCombinations.find((c: any) => c.name === draft.metricName);
      const matched = matchedOutcome || matchedCombo;

      if (matched && draft.metricRef) {
        // Create an objective that needs confirmation
        autoCreated.push({
          id: `auto-${draft.id}`,
          targetId: matched.id,
          targetName: draft.metricName,
          targetType: matchedOutcome ? 'outcome' : 'combination',
          targetOutcomeType: matchedOutcome?.outcomeType || 'Combination',
          targetVariableType: matchedOutcome?.variableType || 'Continuous',
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
    return draftObjectives.map((draft: any) => {
      const matchedOutcome = projectOutcomes.find((o: any) => o.name === draft.metricName);
      const matchedCombo = projectCombinations.find((c: any) => c.name === draft.metricName);
      const matched = matchedOutcome || matchedCombo;

      if (matched && draft.metricRef) {
        return { ...draft, mappedObjectiveId: `auto-${draft.id}`, needsConfirmation: true };
      }
      return { ...draft, mappedObjectiveId: null, needsConfirmation: false };
    });
  });
  
  // Available tags
  const [tags, setTags] = useState(productTags);
  
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
  const themeColor = '#60A5FA';
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
          background: #09090b;
          color: #E4E4E7;
          line-height: 1.5;
        }

        .page-container {
          display: grid;
          grid-template-columns: 1fr 380px;
          min-height: 100vh;
          background: #09090b;
        }

        .main-content {
          padding: 32px 48px;
          overflow-y: auto;
          max-height: 100vh;
          background: linear-gradient(180deg, rgba(96, 165, 250, 0.02) 0%, transparent 40%);
        }

        .main-content::-webkit-scrollbar {
          width: 6px;
        }
        .main-content::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .main-content::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }

        /* Stepper Header */
        .stepper-header-section {
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .stepper-container {
          width: 100%;
        }

        .stepper-top {
          margin-bottom: 20px;
        }

        .stepper-title {
          font-size: 15px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }

        .stepper-subtitle {
          font-size: 12px;
          color: #71717A;
          font-weight: 400;
        }

        .progress-wrapper {
          position: relative;
          margin-bottom: 16px;
        }

        .progress-line-container {
          position: absolute;
          top: 16px;
          left: 0;
          right: 0;
          height: 2px;
          display: flex;
          align-items: center;
          padding: 0 16px;
        }

        .progress-line-bg {
          flex: 1;
          height: 2px;
          background: rgba(255,255,255,0.08);
          border-radius: 1px;
          position: relative;
        }

        .progress-line-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: linear-gradient(90deg, #2DD4BF 0%, #22D3EE 100%);
          border-radius: 1px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 12px rgba(45, 212, 191, 0.4);
        }

        .steps-container {
          position: relative;
          display: flex;
          justify-content: space-between;
          z-index: 1;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .step-circle-wrapper {
          position: relative;
        }

        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          font-size: 12px;
          transition: all 0.25s ease;
          cursor: pointer;
          background: #18181B;
        }

        .step-circle.completed {
          background: linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%);
          color: #0a0a0f;
          border: none;
        }

        .step-circle.current {
          background: linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%);
          color: #0a0a0f;
          border: none;
          box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2), 0 0 20px rgba(45, 212, 191, 0.3);
        }

        .step-circle.upcoming {
          background: #18181B;
          color: #52525b;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .step-circle:hover {
          transform: scale(1.08);
        }

        .step-label {
          margin-top: 8px;
          text-align: center;
          max-width: 85px;
          font-size: 10px;
          font-weight: 500;
          line-height: 1.3;
        }

        .step-label.current {
          color: #2DD4BF;
        }

        .step-label.completed {
          color: #A1A1AA;
        }

        .step-label.upcoming {
          color: #52525b;
        }

        .step-circle.draft {
          background: #18181B;
          color: #F59E0B;
          border: 2px solid #F59E0B;
        }

        .step-circle.incomplete {
          background: #18181B;
          color: #EF4444;
          border: 2px solid #EF4444;
        }

        .step {
          cursor: pointer;
        }

        .step-label.draft {
          color: #F59E0B;
        }

        .step-label.incomplete {
          color: #EF4444;
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
          color: #52525b;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .project-title {
          font-size: 18px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }

        .project-description {
          font-size: 13px;
          color: #71717A;
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
          color: #E4E4E7;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .section-subtitle {
          font-size: 13px;
          color: #71717A;
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
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
        }

        .sidebar-section-header {
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-section-title {
          font-size: 11px;
          font-weight: 600;
          color: #A1A1AA;
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
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
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
          color: #E4E4E7;
        }

        .draft-item-objective {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #A1A1AA;
        }

        /* Library Item */
        .library-item {
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
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
          color: #E4E4E7;
        }

        .library-item-description {
          font-size: 11px;
          color: #71717A;
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
          color: #A1A1AA;
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
          color: #A1A1AA;
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.15);
          color: #E4E4E7;
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
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
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
          color: #E4E4E7;
          outline: none;
          font-family: inherit;
          transition: all 0.15s ease;
        }

        .objective-field:focus {
          border-color: rgba(${themeColorRgb}, 0.5);
          background: rgba(${themeColorRgb}, 0.05);
        }

        .objective-field::placeholder {
          color: #52525b;
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
          color: #52525b;
          opacity: 0;
          transition: all 0.15s ease;
        }

        .objective-row:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
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
          color: #A1A1AA;
          margin-bottom: 8px;
        }

        .empty-state-text {
          font-size: 12px;
          color: #71717A;
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
          border-top: 1px solid rgba(255,255,255,0.06);
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

        /* Chat Panel */
        .chat-panel {
          background: #0a0a0f;
          display: flex;
          flex-direction: column;
          border-left: 1px solid rgba(255,255,255,0.06);
        }

        .chat-header {
          padding: 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-header-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-header-text {
          flex: 1;
        }

        .chat-title {
          font-size: 13px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 2px;
        }

        .chat-subtitle {
          font-size: 11px;
          color: #71717A;
        }

        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chat-messages::-webkit-scrollbar {
          width: 5px;
        }
        .chat-messages::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
        }

        .chat-message {
          display: flex;
          gap: 10px;
        }

        .chat-message.user {
          flex-direction: row-reverse;
        }

        .avatar {
          width: 28px;
          height: 28px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message-content {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          color: #A1A1AA;
          line-height: 1.6;
          max-width: 280px;
        }

        .chat-message.user .message-content {
          background: rgba(${themeColorRgb}, 0.1);
          border-color: rgba(${themeColorRgb}, 0.2);
          color: #E4E4E7;
        }

        .chat-input-container {
          padding: 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .chat-input-wrapper {
          display: flex;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 6px 6px 6px 14px;
          transition: all 0.15s ease;
        }

        .chat-input-wrapper:focus-within {
          border-color: rgba(139, 92, 246, 0.4);
          background: rgba(139, 92, 246, 0.03);
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          color: #E4E4E7;
          font-family: inherit;
        }

        .chat-input::placeholder {
          color: #52525b;
        }

        .send-btn {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }

        .send-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
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
          color: #52525b;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 32px;
          font-size: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #E4E4E7;
          outline: none;
          font-family: inherit;
        }

        .search-input:focus {
          border-color: rgba(${themeColorRgb}, 0.4);
        }

        .search-input::placeholder {
          color: #52525b;
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
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          color: #71717A;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #A1A1AA;
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
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 10px;
          font-family: inherit;
          color: #71717A;
        }
      `}</style>

      <div className="page-container">
        <main className="main-content">
          {/* Stepper Header */}
          <header className="stepper-header-section">
            <div className="stepper-container">
              <div className="stepper-top">
                <h2 className="stepper-title">Project Setup</h2>
                <p className="stepper-subtitle">
                  Step {currentStep} of {steps.length} • {Math.round(progressPercentage)}% Complete
                </p>
              </div>

              <div className="progress-wrapper">
                <div className="progress-line-container">
                  <div className="progress-line-bg">
                    <div 
                      className="progress-line-fill"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="steps-container">
                  {steps.map((step) => {
                    const status = getStepStatus(step.number);
                    const stepClass = getStepClass(step);

                    return (
                      <div key={step.number} className="step" onClick={() => handleStepClick(step.number)}>
                        <div className="step-circle-wrapper">
                          <div className={`step-circle ${stepClass}`}>
                            {status === 'completed' ? <CheckIcon /> : step.number}
                          </div>
                        </div>
                        <div className={`step-label ${stepClass}`}>
                          {step.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="project-info">
                <div className="breadcrumb">Project Overview</div>
                <h1 className="project-title">{projectInfo.title}</h1>
                <p className="project-description">{projectInfo.description}</p>
              </div>
            </div>
          </header>

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
                      <p style={{ fontSize: '11px', color: '#52525b', margin: 0 }}>
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
                            border: '1px solid rgba(255,255,255,0.06)',
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
                              color: '#E4E4E7',
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
                      <p style={{ fontSize: '11px', color: '#52525b', margin: 0 }}>
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
                                background: 'rgba(255,255,255,0.06)',
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
                                background: 'rgba(255,255,255,0.06)',
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
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}>
                                <span style={{ fontSize: '9px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Select target
                                </span>
                                <span style={{ fontSize: '9px', color: '#52525b' }}>
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
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#E4E4E7' }}>{item.name}</span>
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
                                <span style={{ color: '#52525b', fontSize: '10px' }}>–</span>
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
                                <span style={{ color: '#52525b', fontSize: '10px' }}>–</span>
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
                          <span style={{ fontSize: '11px', color: '#52525b', fontStyle: 'italic' }}>
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
            <button className="btn btn-large btn-secondary" onClick={handleSaveAsDraft}>
              Save as Draft
            </button>
            <button
              className="btn btn-large btn-primary"
              disabled={!isValid}
              onClick={handleContinue}
            >
              Continue to Prioritization
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </main>

        {/* Chat Panel */}
        <aside className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              </svg>
            </div>
            <div className="chat-header-text">
              <div className="chat-title">Luna AI</div>
              <div className="chat-subtitle">Objectives Assistant</div>
            </div>
          </div>

          <div className="chat-messages">
            <div className="chat-message">
              <div className="avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4m0 12v4"/>
                </svg>
              </div>
              <div className="message-content">
                I'll help you define objectives for your project. Objectives are hard limits that must be satisfied - 
                like maximum sugar content or cost limits. Start by mapping any draft objectives from your goals, 
                or add new ones from your product library.
              </div>
            </div>
          </div>

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask about objectives..."
              />
              <button className="send-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </div>

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
  const themeColor = '#60A5FA';
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
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#E4E4E7' }}>
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
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '10px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Draft from Goals
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#E4E4E7' }}>{draft.metricName}</span>
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
              borderBottom: '1px solid rgba(255,255,255,0.06)',
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
                  <p style={{ fontSize: '12px', color: '#52525b', margin: 0 }}>
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
                        border: `1px solid ${isCurrentlyMapped ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '8px',
                        cursor: isCurrentlyMapped ? 'default' : 'pointer',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#E4E4E7' }}>
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
            borderTop: '1px solid rgba(255,255,255,0.08)',
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
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'tags'
  const [selectedTagId, setSelectedTagId] = useState(null); // For tag drill-down

  const themeColor = '#60A5FA';
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
            borderBottom: '1px solid rgba(255,255,255,0.08)',
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
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#E4E4E7' }}>
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
            borderBottom: '1px solid rgba(255,255,255,0.08)',
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
                stroke="#52525b" 
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
                  color: '#E4E4E7',
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
                    <p style={{ fontSize: '13px', color: '#52525b', margin: 0 }}>
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
                          border: isSelected ? `1px solid rgba(${themeColorRgb}, 0.3)` : '1px solid rgba(255,255,255,0.06)',
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
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Objective Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#E4E4E7' }}>
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
                    <p style={{ fontSize: '13px', color: '#52525b', margin: 0 }}>
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
                          border: '1px solid rgba(255,255,255,0.06)',
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
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#E4E4E7' }}>
                            {tag.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#71717A' }}>
                            {count} objective{count !== 1 ? 's' : ''}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2">
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
                    border: '1px solid rgba(255,255,255,0.08)',
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
                        border: isSelected ? `1px solid rgba(${themeColorRgb}, 0.3)` : '1px solid rgba(255,255,255,0.06)',
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
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#E4E4E7' }}>
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
            borderTop: '1px solid rgba(255,255,255,0.08)',
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
                  color: selectedItems.length > 0 ? '#0a0a0f' : '#52525b',
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
