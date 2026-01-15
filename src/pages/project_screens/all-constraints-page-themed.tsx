import React, { useState, useRef, useEffect } from 'react';

// Unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// ============================================
// SAMPLE DATA
// ============================================

// Project inputs (from earlier step - selected for this project)
const projectInputs = [
  { id: 'input-1', name: 'Flour', inputType: 'Ingredient', variableType: 'Continuous', description: 'Base flour amount', cost: 0.42 },
  { id: 'input-2', name: 'Sugar', inputType: 'Ingredient', variableType: 'Continuous', description: 'Granulated sugar', cost: 0.68 },
  { id: 'input-3', name: 'Butter', inputType: 'Ingredient', variableType: 'Continuous', description: 'Unsalted butter', cost: 1.85 },
  { id: 'input-4', name: 'Eggs', inputType: 'Ingredient', variableType: 'Continuous', description: 'Whole eggs', cost: 0.35 },
  { id: 'input-5', name: 'Cocoa Powder', inputType: 'Ingredient', variableType: 'Continuous', description: 'Dutch-process cocoa', cost: 2.15 },
  { id: 'input-6', name: 'Sweetener Substitute', inputType: 'Ingredient', variableType: 'Continuous', description: 'Alternative sweetener', cost: 3.20 },
  { id: 'input-7', name: 'Baking Temperature', inputType: 'Processing', variableType: 'Continuous', description: 'Oven temp °F' },
  { id: 'input-8', name: 'Bake Time', inputType: 'Processing', variableType: 'Continuous', description: 'Duration in minutes' },
  { id: 'input-9', name: 'Mixer Speed', inputType: 'Processing', variableType: 'Ordinal', description: 'Speed setting', levels: ['Low', 'Medium', 'High'] },
];

// Project combinations (from earlier step)  
const projectCombinations = [
  { id: 'combo-1', name: 'Total Fat Content', variableType: 'Continuous', description: 'Butter + Eggs fat contribution', components: ['Butter', 'Eggs'] },
  { id: 'combo-2', name: 'Total Sweetener', variableType: 'Continuous', description: 'Sugar + substitute total', components: ['Sugar', 'Sweetener Substitute'] },
  { id: 'combo-3', name: 'Chocolate Intensity', variableType: 'Continuous', description: 'Cocoa percentage of dry', components: ['Cocoa Powder', 'Flour'] },
  { id: 'combo-4', name: 'Total Cost', variableType: 'Continuous', description: 'Sum of all ingredient costs', components: ['All Ingredients'] },
];

// Available tags from product
const productTags = [
  { id: 'tag-1', name: 'Regulatory', color: '#EF4444' },
  { id: 'tag-2', name: 'Cost Control', color: '#22C55E' },
  { id: 'tag-3', name: 'Quality', color: '#3B82F6' },
  { id: 'tag-4', name: 'Safety', color: '#F59E0B' },
  { id: 'tag-5', name: 'Nutrition', color: '#8B5CF6' },
];

// Product library constraints (available for import)
const productConstraints = [
  { 
    id: 'pc-1', 
    targetId: 'input-2', 
    targetName: 'Sugar', 
    targetType: 'input',
    constraintType: 'at_most', 
    value1: '30', 
    value2: '',
    tags: [productTags[0], productTags[4]] // Regulatory, Nutrition
  },
  { 
    id: 'pc-2', 
    targetId: 'combo-4', 
    targetName: 'Total Cost', 
    targetType: 'combination',
    constraintType: 'at_most', 
    value1: '2.50', 
    value2: '',
    tags: [productTags[1]] // Cost Control
  },
  { 
    id: 'pc-3', 
    targetId: 'input-7', 
    targetName: 'Baking Temperature', 
    targetType: 'input',
    constraintType: 'between', 
    value1: '325', 
    value2: '375',
    tags: [productTags[2], productTags[3]] // Quality, Safety
  },
  { 
    id: 'pc-4', 
    targetId: 'input-5', 
    targetName: 'Cocoa Powder', 
    targetType: 'input',
    constraintType: 'at_least', 
    value1: '15', 
    value2: '',
    tags: [productTags[2]] // Quality
  },
  { 
    id: 'pc-5', 
    targetId: 'input-3', 
    targetName: 'Butter', 
    targetType: 'input',
    constraintType: 'between', 
    value1: '20', 
    value2: '35',
    tags: [productTags[1], productTags[2]] // Cost Control, Quality
  },
  { 
    id: 'pc-6', 
    targetId: 'combo-1', 
    targetName: 'Total Fat Content', 
    targetType: 'combination',
    constraintType: 'at_most', 
    value1: '40', 
    value2: '',
    tags: [productTags[0], productTags[4]] // Regulatory, Nutrition
  },
  { 
    id: 'pc-7', 
    targetId: 'input-8', 
    targetName: 'Bake Time', 
    targetType: 'input',
    constraintType: 'between', 
    value1: '25', 
    value2: '35',
    tags: [productTags[2]] // Quality
  },
];

// Draft constraints from Goals/Claims step (need to be mapped to real constraints)
const initialDraftConstraints = [
  { 
    id: 'draft-1', 
    metricName: 'Sugar', 
    metricRef: { id: 'input-2', type: 'input' }, // Has a valid ref - can auto-create
    operator: 'at_most', 
    value1: '25', 
    value2: '',
    goalId: 'goal-1',
    mappedConstraintId: null,
  },
  { 
    id: 'draft-2', 
    metricName: 'Total Cost', 
    metricRef: { id: 'combo-4', type: 'combination' }, // Has a valid ref
    operator: 'at_most', 
    value1: '2.20', 
    value2: '',
    goalId: 'goal-1',
    mappedConstraintId: null,
  },
  { 
    id: 'draft-3', 
    metricName: 'Cocoa Powder', 
    metricRef: { id: 'input-5', type: 'input' }, // Has a valid ref
    operator: 'at_least', 
    value1: '18', 
    value2: '',
    goalId: 'goal-2',
    mappedConstraintId: null,
  },
  { 
    id: 'draft-4', 
    metricName: 'Resting Time', 
    metricRef: null, // NO valid ref - input doesn't exist in project, must map manually
    operator: 'between', 
    value1: '10', 
    value2: '30',
    goalId: 'goal-2',
    mappedConstraintId: null,
  },
];

// ============================================
// CONSTRAINT TYPE DEFINITIONS
// ============================================
const constraintTypes = [
  { id: 'equals', label: '= Equals', symbol: '=', eligibleVariables: ['Continuous', 'Ordinal', 'Nominal'], fields: 1 },
  { id: 'between', label: '↔ Between', symbol: '↔', eligibleVariables: ['Continuous', 'Ordinal'], fields: 2 },
  { id: 'at_least', label: '≥ At Least', symbol: '≥', eligibleVariables: ['Continuous', 'Ordinal'], fields: 1 },
  { id: 'at_most', label: '≤ At Most', symbol: '≤', eligibleVariables: ['Continuous', 'Ordinal'], fields: 1 },
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

const ConstraintsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="18" width="36" height="24" rx="4" />
    <path d="M14 18V12a10 10 0 0 1 20 0v6" />
    <circle cx="24" cy="30" r="3" fill="currentColor" opacity="0.4" />
    <line x1="24" y1="33" x2="24" y2="37" strokeLinecap="round" />
  </svg>
);

// ============================================
// TYPE TAG COMPONENTS
// ============================================
const InputTypeTag = ({ type, small }) => {
  const colors = {
    'Ingredient': { bg: 'rgba(45, 212, 191, 0.15)', text: '#2DD4BF', border: 'rgba(45, 212, 191, 0.3)' },
    'Processing': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
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
      {type === 'Processing' ? 'Process' : type === 'Combination' ? 'Combo' : type}
    </span>
  );
};

const ConstraintTypeTag = ({ type, small }) => {
  const config = constraintTypes.find(ct => ct.id === type) || { symbol: '?', label: type };
  return (
    <span style={{
      padding: small ? '2px 6px' : '3px 8px',
      borderRadius: '4px',
      fontSize: small ? '9px' : '10px',
      fontWeight: 600,
      background: 'rgba(251, 146, 60, 0.15)',
      color: '#FB923C',
      border: '1px solid rgba(251, 146, 60, 0.3)',
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

const ConstraintTagPill = ({ tag, onRemove, small }) => {
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
// MAIN COMPONENT
// ============================================
export default function AllConstraintsPage() {
  // Step configuration
  const [currentStep] = useState(4);
  const steps = [
    { number: 1, name: 'Basic Information', status: 'complete' },
    { number: 2, name: 'Define Goals / Claims', status: 'complete' },
    { number: 3, name: 'Select Inputs', status: 'complete' },
    { number: 4, name: 'Define Constraints', status: 'current' },
    { number: 5, name: 'Select Outcomes', status: null },
    { number: 6, name: 'Set Objectives', status: null },
    { number: 7, name: 'Prioritize Objectives', status: null },
    { number: 8, name: 'Review', status: null }
  ];

  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepClass = (step) => {
    const status = getStepStatus(step.number);
    if (status === 'upcoming') return 'upcoming';
    if (status === 'current') return 'current';
    return 'completed';
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Project info
  const [projectInfo] = useState({
    title: "Low-Sugar Brownie Mix",
    description: "Reduce sugar while maintaining sweetness and fudginess near full-sugar version"
  });

  // ========== STATE ==========
  // Auto-generate constraints from drafts that can be matched to inputs/combinations
  const [constraints, setConstraints] = useState(() => {
    const autoCreated = [];
    initialDraftConstraints.forEach(draft => {
      // Try to match draft to an input or combination
      const matchedInput = projectInputs.find(i => i.name === draft.metricName);
      const matchedCombo = projectCombinations.find(c => c.name === draft.metricName);
      const matched = matchedInput || matchedCombo;
      
      if (matched && draft.metricRef) {
        // Create a constraint that needs confirmation
        autoCreated.push({
          id: `auto-${draft.id}`,
          targetId: matched.id,
          targetName: draft.metricName,
          targetType: matchedInput ? 'input' : 'combination',
          targetInputType: matchedInput?.inputType || 'Combination',
          targetVariableType: matched.variableType,
          constraintType: draft.operator,
          value1: draft.value1,
          value2: draft.value2 || '',
          tags: [],
          mappedDraftId: draft.id,
          needsConfirmation: true, // Flag for yellow highlight
        });
      }
    });
    return autoCreated;
  });
  
  // Draft constraints from goals/claims (need mapping)
  // Update drafts to reflect auto-created mappings
  const [drafts, setDrafts] = useState(() => {
    return initialDraftConstraints.map(draft => {
      const matchedInput = projectInputs.find(i => i.name === draft.metricName);
      const matchedCombo = projectCombinations.find(c => c.name === draft.metricName);
      const matched = matchedInput || matchedCombo;
      
      if (matched && draft.metricRef) {
        return { ...draft, mappedConstraintId: `auto-${draft.id}`, needsConfirmation: true };
      }
      return { ...draft, mappedConstraintId: null, needsConfirmation: false };
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
  const [hoveredConstraint, setHoveredConstraint] = useState(null);
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
    const newConstraint = {
      id: generateId(),
      targetId: null,
      targetName: '',
      targetType: null, // 'input' or 'combination'
      targetInputType: null,
      targetVariableType: null,
      constraintType: null,
      value1: '',
      value2: '',
      tags: [],
      mappedDraftId: null,
      needsConfirmation: false,
    };
    setConstraints(prev => [...prev, newConstraint]);
  };
  
  // Confirm an auto-created constraint
  const confirmConstraint = (constraintId) => {
    setConstraints(prev => prev.map(c => 
      c.id === constraintId ? { ...c, needsConfirmation: false } : c
    ));
    setDrafts(prev => prev.map(d => {
      if (d.mappedConstraintId === constraintId) {
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
  
  // Map a draft to an existing constraint
  const mapDraftToConstraint = (draftId, constraintId) => {
    // Remove any existing mapping from the constraint
    setConstraints(prev => prev.map(c => {
      if (c.mappedDraftId === draftId) {
        return { ...c, mappedDraftId: null };
      }
      if (c.id === constraintId) {
        return { ...c, mappedDraftId: draftId, needsConfirmation: false };
      }
      return c;
    }));
    // Update draft
    setDrafts(prev => prev.map(d => 
      d.id === draftId ? { ...d, mappedConstraintId: constraintId, needsConfirmation: false } : d
    ));
    setShowMappingModal(false);
    setMappingDraftId(null);
  };
  
  // Unmap a draft
  const unmapDraft = (draftId) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft?.mappedConstraintId) {
      setConstraints(prev => prev.map(c => 
        c.id === draft.mappedConstraintId ? { ...c, mappedDraftId: null } : c
      ));
    }
    setDrafts(prev => prev.map(d => 
      d.id === draftId ? { ...d, mappedConstraintId: null, needsConfirmation: false } : d
    ));
  };

  const updateConstraint = (id, updates) => {
    setConstraints(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteConstraint = (id) => {
    setConstraints(prev => prev.filter(c => c.id !== id));
  };

  // Get filtered library items for sidebar
  const getFilteredLibraryItems = () => {
    const allItems = [
      ...projectInputs.map(i => ({ ...i, itemType: 'input' })),
      ...projectCombinations.map(c => ({ ...c, itemType: 'combination', inputType: 'Combination' })),
    ];
    
    let filtered = allItems;
    
    if (sidebarFilter !== 'All') {
      if (sidebarFilter === 'Combination') {
        filtered = filtered.filter(i => i.itemType === 'combination');
      } else {
        filtered = filtered.filter(i => i.inputType === sidebarFilter);
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
  
  // Get autocomplete suggestions for constraint subject
  const getAutocompleteSuggestions = (query) => {
    const allItems = [
      ...projectInputs.map(i => ({ ...i, itemType: 'input' })),
      ...projectCombinations.map(c => ({ ...c, itemType: 'combination', inputType: 'Combination' })),
    ];
    
    if (!query || query.length < 1) return allItems.slice(0, 6);
    
    const search = query.toLowerCase();
    return allItems.filter(i => 
      i.name.toLowerCase().includes(search) ||
      i.description?.toLowerCase().includes(search)
    ).slice(0, 6);
  };
  
  // Apply autocomplete selection
  const applyAutocompleteSelection = (constraintId, item) => {
    updateConstraint(constraintId, {
      targetId: item.id,
      targetName: item.name,
      targetType: item.itemType,
      targetInputType: item.inputType,
      targetVariableType: item.variableType,
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
  
  // Add tag to constraint
  const addTagToConstraint = (constraintId, tag) => {
    setConstraints(prev => prev.map(c => {
      if (c.id !== constraintId) return c;
      if (c.tags?.find(t => t.id === tag.id)) return c;
      return { ...c, tags: [...(c.tags || []), tag] };
    }));
    setActiveTagAutocomplete(null);
    setTagSearchQuery(prev => ({ ...prev, [constraintId]: '' }));
    setTagAutocompleteIndex(0);
  };

  // Check if all drafts are mapped
  const unmappedDrafts = drafts.filter(d => !d.mappedConstraintId);
  const allDraftsMapped = unmappedDrafts.length === 0;

  // Validation
  const isValid = constraints.length > 0 || drafts.length === 0;
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleAddNew();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
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

  // Theme color for constraints
  const themeColor = '#FB923C';
  const themeColorRgb = '251, 146, 60';

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
          background: linear-gradient(180deg, rgba(251, 146, 60, 0.02) 0%, transparent 40%);
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

        .draft-item-constraint {
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

        /* Constraints Column */
        .constraints-column {
          display: flex;
          flex-direction: column;
        }

        .constraints-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .constraints-title {
          font-size: 13px;
          font-weight: 600;
          color: #A1A1AA;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .constraints-actions {
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
          background: linear-gradient(135deg, ${themeColor} 0%, #EA580C 100%);
          border: none;
          color: #0a0a0f;
          box-shadow: 0 2px 12px rgba(${themeColorRgb}, 0.25);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(${themeColorRgb}, 0.4);
        }

        /* Constraints List */
        .constraints-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .constraint-row {
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

        .constraint-row:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }

        .constraint-field {
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

        .constraint-field:focus {
          border-color: rgba(${themeColorRgb}, 0.5);
          background: rgba(${themeColorRgb}, 0.05);
        }

        .constraint-field::placeholder {
          color: #52525b;
        }

        select.constraint-field {
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

        .constraint-row:hover .delete-btn {
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
                      <div key={step.number} className="step">
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
                <ConstraintsIcon />
              </div>
              <div className="section-text">
                <h2 className="section-title">All Constraints</h2>
                <p className="section-subtitle">
                  Hard Limits on Inputs and their Combinations
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Two Columns */}
          <div className="content-columns">
            {/* Left Sidebar */}
            <div className="sidebar-column">
              {/* Draft Constraints Section */}
              <div className="sidebar-section">
                <div className="sidebar-section-header">
                  <span className="sidebar-section-title">
                    <LinkIcon />
                    Draft Constraints
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
                        No draft constraints from goals
                      </p>
                    </div>
                  ) : (
                    drafts.map((draft) => {
                      const isMapped = !!draft.mappedConstraintId;
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
                          {/* Left: Name + constraint type & value */}
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
                              {constraintTypes.find(ct => ct.id === draft.operator)?.symbol || ''} {draft.value1}{draft.value2 ? `–${draft.value2}` : ''}
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
                    Inputs & Combinations
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      style={{
                        padding: '4px 8px',
                        fontSize: '9px',
                        fontWeight: 600,
                        background: 'rgba(45, 212, 191, 0.1)',
                        color: '#2DD4BF',
                        border: '1px solid rgba(45, 212, 191, 0.25)',
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
                      Input
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
                    {['All', 'Ingredient', 'Processing', 'Combination'].map((filter) => (
                      <button
                        key={filter}
                        className={`filter-btn ${sidebarFilter === filter ? 'active' : ''}`}
                        onClick={() => setSidebarFilter(filter)}
                      >
                        {filter === 'Combination' ? 'Combos' : filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="sidebar-section-content" style={{ maxHeight: '300px' }}>
                  {getFilteredLibraryItems().length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#52525b', margin: 0 }}>
                        No inputs or combinations found
                      </p>
                    </div>
                  ) : (
                    getFilteredLibraryItems().map((item) => (
                      <div 
                        key={item.id}
                        className="library-item"
                        onClick={() => {
                          // Quick-add constraint with this item
                          const newConstraint = {
                            id: generateId(),
                            targetId: item.id,
                            targetName: item.name,
                            targetType: item.itemType,
                            targetInputType: item.inputType,
                            targetVariableType: item.variableType,
                            constraintType: null,
                            value1: '',
                            value2: '',
                            tags: [],
                            mappedDraftId: null,
                          };
                          setConstraints(prev => [...prev, newConstraint]);
                        }}
                      >
                        <div className="library-item-header">
                          <span className="library-item-name">{item.name}</span>
                          <InputTypeTag type={item.inputType} small />
                        </div>
                        {item.description && (
                          <span className="library-item-description">{item.description}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right - Constraints List */}
            <div className="constraints-column">
              <div className="constraints-header">
                <span className="constraints-title">
                  <LockIcon style={{ width: 16, height: 16 }} />
                  Project Constraints
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    background: 'rgba(255,255,255,0.06)',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}>
                    {constraints.length}
                  </span>
                </span>
                <div className="constraints-actions">
                  <button className="btn btn-secondary" onClick={() => setShowAddFromModal(true)}>
                    <ImportIcon />
                    Add From Product
                    <kbd>⌘P</kbd>
                  </button>
                  <button className="btn btn-primary" onClick={handleAddNew}>
                    <PlusIcon />
                    Add New
                    <kbd style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(0,0,0,0.2)' }}>⌘N</kbd>
                  </button>
                </div>
              </div>

              <div className="constraints-list">
                {constraints.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <LockIcon style={{ color: themeColor, opacity: 0.5 }} />
                    </div>
                    <p className="empty-state-title">No constraints defined</p>
                    <p className="empty-state-text">
                      Add constraints from your product library, create new ones, or click an input/combination 
                      from the sidebar to get started.
                    </p>
                  </div>
                ) : (
                  constraints.map((constraint) => {
                    const needsConfirm = constraint.needsConfirmation;
                    
                    return (
                      <div
                        key={constraint.id}
                        className="constraint-row"
                        style={{
                          borderLeft: needsConfirm ? '3px solid #F59E0B' : undefined,
                          background: needsConfirm ? 'rgba(245, 158, 11, 0.05)' : undefined,
                        }}
                        onMouseEnter={() => setHoveredConstraint(constraint.id)}
                        onMouseLeave={() => setHoveredConstraint(null)}
                      >
                        {/* Subject with Autocomplete */}
                        <div style={{ position: 'relative', flex: '0 0 180px' }}>
                        <input
                          type="text"
                          className="constraint-field"
                          style={{ width: '100%' }}
                          value={constraint.targetName}
                          onChange={(e) => {
                            updateConstraint(constraint.id, { 
                              targetName: e.target.value,
                              targetId: null,
                              targetType: null,
                              targetInputType: null,
                              targetVariableType: null,
                            });
                            if (e.target.value.length >= 1) {
                              setActiveAutocomplete(constraint.id);
                              setAutocompleteIndex(0);
                            } else {
                              setActiveAutocomplete(null);
                            }
                          }}
                          onFocus={() => {
                            setActiveAutocomplete(constraint.id);
                            setAutocompleteIndex(0);
                          }}
                          onBlur={() => {
                            setTimeout(() => setActiveAutocomplete(null), 150);
                          }}
                          onKeyDown={(e) => {
                            const suggestions = getAutocompleteSuggestions(constraint.targetName);
                            if (activeAutocomplete === constraint.id && suggestions.length > 0) {
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setAutocompleteIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setAutocompleteIndex(prev => Math.max(prev - 1, 0));
                              } else if (e.key === 'Enter') {
                                e.preventDefault();
                                applyAutocompleteSelection(constraint.id, suggestions[autocompleteIndex]);
                              }
                            }
                          }}
                          placeholder="Subject..."
                          autoComplete="off"
                        />
                        
                        {/* Autocomplete Dropdown */}
                        {activeAutocomplete === constraint.id && (() => {
                          const suggestions = getAutocompleteSuggestions(constraint.targetName);
                          if (suggestions.length === 0) return null;
                          
                          return (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              width: '280px',
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
                                  Select input or combination
                                </span>
                                <span style={{ fontSize: '9px', color: '#52525b' }}>
                                  ↑↓ nav · Enter select
                                </span>
                              </div>
                              {suggestions.map((item, idx) => (
                                <div
                                  key={item.id}
                                  onClick={() => applyAutocompleteSelection(constraint.id, item)}
                                  onMouseEnter={() => setAutocompleteIndex(idx)}
                                  style={{
                                    padding: '8px 10px',
                                    cursor: 'pointer',
                                    background: idx === autocompleteIndex ? `rgba(${themeColorRgb}, 0.1)` : 'transparent',
                                    borderLeft: idx === autocompleteIndex ? `2px solid ${themeColor}` : '2px solid transparent',
                                    transition: 'all 0.1s ease',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#E4E4E7' }}>{item.name}</span>
                                    <InputTypeTag type={item.inputType} small />
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
                      
                      {/* Constraint Type - disabled until input/combo selected */}
                      <select
                        className="constraint-field"
                        style={{ flex: '0 0 110px' }}
                        value={constraint.constraintType || ''}
                        onChange={(e) => updateConstraint(constraint.id, { constraintType: e.target.value || null })}
                        disabled={!constraint.targetId}
                      >
                        <option value="">Type...</option>
                        {constraintTypes.map(ct => (
                          <option key={ct.id} value={ct.id}>{ct.label}</option>
                        ))}
                      </select>
                      
                      {/* Values - disabled until input/combo AND type selected */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '0 0 160px' }}>
                        <input
                          type="text"
                          className="value-field"
                          value={constraint.value1}
                          onChange={(e) => updateConstraint(constraint.id, { value1: e.target.value })}
                          placeholder={constraint.constraintType === 'between' ? 'Min' : 'Value'}
                          disabled={!constraint.targetId || !constraint.constraintType}
                        />
                        {constraint.constraintType === 'between' && (
                          <>
                            <span style={{ color: '#52525b', fontSize: '11px' }}>–</span>
                            <input
                              type="text"
                              className="value-field"
                              value={constraint.value2}
                              onChange={(e) => updateConstraint(constraint.id, { value2: e.target.value })}
                              placeholder="Max"
                              disabled={!constraint.targetId}
                            />
                          </>
                        )}
                      </div>
                      
                      {/* Tags - disabled until input/combo selected */}
                      <div style={{ flex: 1, display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center', opacity: constraint.targetId ? 1 : 0.4 }}>
                        {(constraint.tags || []).map(tag => (
                          <ConstraintTagPill
                            key={tag.id}
                            tag={tag}
                            onRemove={constraint.targetId ? () => {
                              updateConstraint(constraint.id, {
                                tags: constraint.tags.filter(t => t.id !== tag.id)
                              });
                            } : undefined}
                            small
                          />
                        ))}
                        
                        {/* Tag Input with Autocomplete - only if input/combo selected */}
                        {constraint.targetId && (
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={tagSearchQuery[constraint.id] || ''}
                            onChange={(e) => {
                              setTagSearchQuery(prev => ({ ...prev, [constraint.id]: e.target.value }));
                              setActiveTagAutocomplete(constraint.id);
                              setTagAutocompleteIndex(0);
                            }}
                            onFocus={() => {
                              setActiveTagAutocomplete(constraint.id);
                              setTagAutocompleteIndex(0);
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setActiveTagAutocomplete(null);
                                setTagAutocompleteIndex(0);
                              }, 150);
                            }}
                            onKeyDown={(e) => {
                              const suggestions = getTagSuggestions(tagSearchQuery[constraint.id] || '', constraint.tags);
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setTagAutocompleteIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setTagAutocompleteIndex(prev => Math.max(prev - 1, 0));
                              } else if (e.key === 'Enter') {
                                e.preventDefault();
                                if (suggestions.length > 0) {
                                  addTagToConstraint(constraint.id, suggestions[tagAutocompleteIndex]);
                                }
                              }
                            }}
                            placeholder="+tag"
                            style={{
                              padding: '3px 8px',
                              fontSize: '10px',
                              background: 'transparent',
                              border: '1px dashed rgba(255,255,255,0.15)',
                              borderRadius: '4px',
                              color: '#A1A1AA',
                              cursor: 'text',
                              outline: 'none',
                              width: '50px',
                            }}
                          />
                          
                          {/* Tag Autocomplete Dropdown */}
                          {activeTagAutocomplete === constraint.id && (() => {
                            const suggestions = getTagSuggestions(tagSearchQuery[constraint.id] || '', constraint.tags);
                            if (suggestions.length === 0) return null;
                            
                            return (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                minWidth: '140px',
                                marginTop: '4px',
                                background: '#15151a',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '6px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                zIndex: 100,
                                overflow: 'hidden',
                              }}>
                                {suggestions.map((tag, idx) => (
                                  <div
                                    key={tag.id}
                                    onClick={() => addTagToConstraint(constraint.id, tag)}
                                    onMouseEnter={() => setTagAutocompleteIndex(idx)}
                                    style={{
                                      padding: '6px 10px',
                                      cursor: 'pointer',
                                      background: idx === tagAutocompleteIndex ? 'rgba(255,255,255,0.06)' : 'transparent',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      transition: 'background 0.1s ease',
                                    }}
                                  >
                                    <div style={{
                                      width: '8px',
                                      height: '8px',
                                      borderRadius: '2px',
                                      background: tag.color,
                                    }} />
                                    <span style={{ fontSize: '11px', color: '#E4E4E7' }}>{tag.name}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        )}
                      </div>
                      
                      {/* Confirm checkmark - only show for constraints needing confirmation */}
                      {needsConfirm && (
                        <button
                          onClick={() => {
                            updateConstraint(constraint.id, { needsConfirmation: false });
                            if (constraint.mappedDraftId) {
                              setDrafts(prev => prev.map(d => 
                                d.id === constraint.mappedDraftId ? { ...d, needsConfirmation: false } : d
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
                      )}
                      
                      {/* Delete */}
                      <button 
                        className="delete-btn"
                        onClick={() => deleteConstraint(constraint.id)}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button className="btn btn-large btn-secondary">
              Save as Draft
            </button>
            <button 
              className="btn btn-large btn-primary"
              disabled={!isValid}
            >
              Continue to Outcomes
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
              <div className="chat-subtitle">Constraints Assistant</div>
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
                I'll help you define constraints for your project. Constraints are hard limits that must be satisfied - 
                like maximum sugar content or cost limits. Start by mapping any draft constraints from your goals, 
                or add new ones from your product library.
              </div>
            </div>
          </div>

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask about constraints..."
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
            // Import selected constraints
            const newConstraints = selected.map(item => ({
              ...item,
              id: generateId(),
            }));
            setConstraints(prev => [...prev, ...newConstraints]);
            setShowAddFromModal(false);
          }}
          productConstraints={productConstraints}
          productTags={productTags}
        />
      )}
      
      {/* Mapping Modal */}
      {showMappingModal && mappingDraftId && (
        <MappingModal 
          draft={drafts.find(d => d.id === mappingDraftId)}
          constraints={constraints}
          onClose={() => {
            setShowMappingModal(false);
            setMappingDraftId(null);
          }}
          onMap={(constraintId) => {
            mapDraftToConstraint(mappingDraftId, constraintId);
            // Confirm the constraint
            setConstraints(prev => prev.map(c => 
              c.id === constraintId ? { ...c, needsConfirmation: false } : c
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
const MappingModal = ({ draft, constraints, onClose, onMap, onUnmap }) => {
  const themeColor = '#FB923C';
  const themeColorRgb = '251, 146, 60';
  
  if (!draft) return null;
  
  const isMapped = !!draft.mappedConstraintId;
  const currentConstraint = isMapped ? constraints.find(c => c.id === draft.mappedConstraintId) : null;
  
  // Get available constraints to map to (ones that aren't already mapped to another draft)
  const availableConstraints = constraints.filter(c => !c.mappedDraftId || c.mappedDraftId === draft.id);
  
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
                Map Draft Constraint
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#71717A' }}>
                Link "{draft.metricName}" to a constraint
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
            background: 'rgba(251, 146, 60, 0.05)',
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
                {draft.operator === 'at_most' ? '≤' : draft.operator === 'at_least' ? '≥' : draft.operator === 'between' ? '↔' : '='} {draft.value1}{draft.value2 ? `–${draft.value2}` : ''}
              </span>
            </div>
          </div>

          {/* Current Mapping Status */}
          {isMapped && currentConstraint && (
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
                  Currently linked to: <strong>{currentConstraint.targetName}</strong>
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

          {/* Available Constraints to Map */}
          <div style={{ padding: '12px 20px' }}>
            <div style={{ fontSize: '10px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Select a constraint to link
            </div>
            <div style={{ maxHeight: '240px', overflow: 'auto' }}>
              {availableConstraints.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#52525b', margin: 0 }}>
                    No constraints available. Create one first.
                  </p>
                </div>
              ) : (
                availableConstraints.map(constraint => {
                  const isCurrentlyMapped = constraint.id === draft.mappedConstraintId;
                  return (
                    <div
                      key={constraint.id}
                      onClick={() => !isCurrentlyMapped && onMap(constraint.id)}
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
                            {constraint.targetName}
                          </span>
                          <span style={{ 
                            fontSize: '11px', 
                            color: themeColor,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            {constraint.constraintType === 'at_most' ? '≤' : constraint.constraintType === 'at_least' ? '≥' : constraint.constraintType === 'between' ? '↔' : '='} {constraint.value1}{constraint.value2 ? `–${constraint.value2}` : ''}
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
const AddFromProductModal = ({ onClose, onImport, productConstraints, productTags }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'tags'
  const [selectedTagId, setSelectedTagId] = useState(null); // For tag drill-down

  const themeColor = '#FB923C';
  const themeColorRgb = '251, 146, 60';

  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
      return [...prev, item];
    });
  };
  
  const selectAll = () => {
    const toSelect = activeTab === 'tags' && selectedTagId 
      ? constraintsForSelectedTag 
      : filteredConstraints;
    setSelectedItems([...toSelect]);
  };

  // Filter for All Constraints tab
  const filteredConstraints = productConstraints.filter(c => {
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

  // Get constraints for selected tag
  const constraintsForSelectedTag = selectedTagId 
    ? productConstraints.filter(c => c.tags?.some(t => t.id === selectedTagId))
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
                  Select constraints from your product library
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
              All Constraints
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
                placeholder={activeTab === 'all' ? 'Search constraints...' : (selectedTagId ? 'Search within tag...' : 'Search tags...')}
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
                {filteredConstraints.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#52525b', margin: 0 }}>
                      No constraints found
                    </p>
                  </div>
                ) : (
                  filteredConstraints.map(constraint => {
                    const isSelected = selectedItems.find(i => i.id === constraint.id);
                    return (
                      <div
                        key={constraint.id}
                        onClick={() => toggleItem(constraint)}
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
                          
                          {/* Constraint Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#E4E4E7' }}>
                                {constraint.targetName}
                              </span>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 600,
                                background: `rgba(${themeColorRgb}, 0.15)`,
                                color: themeColor,
                              }}>
                                {constraint.constraintType === 'at_most' ? '≤' : constraint.constraintType === 'at_least' ? '≥' : '↔'} {constraint.value1}{constraint.value2 ? `–${constraint.value2}` : ''}
                              </span>
                            </div>
                            {/* Tags */}
                            {constraint.tags && constraint.tags.length > 0 && (
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {constraint.tags.map(tag => (
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
                    const count = productConstraints.filter(c => c.tags?.some(t => t.id === tag.id)).length;
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
                            {count} constraint{count !== 1 ? 's' : ''}
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
                    ({constraintsForSelectedTag.length} constraint{constraintsForSelectedTag.length !== 1 ? 's' : ''})
                  </span>
                </div>

                {/* Constraints for this tag */}
                {constraintsForSelectedTag.map(constraint => {
                  const isSelected = selectedItems.find(i => i.id === constraint.id);
                  return (
                    <div
                      key={constraint.id}
                      onClick={() => toggleItem(constraint)}
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
                              {constraint.targetName}
                            </span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              background: `rgba(${themeColorRgb}, 0.15)`,
                              color: themeColor,
                            }}>
                              {constraint.constraintType === 'at_most' ? '≤' : constraint.constraintType === 'at_least' ? '≥' : '↔'} {constraint.value1}{constraint.value2 ? `–${constraint.value2}` : ''}
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
                    ? `linear-gradient(135deg, ${themeColor} 0%, #EA580C 100%)`
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
