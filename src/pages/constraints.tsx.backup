import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';

const ConstraintsModal = ({ onClose }) => {
  // Get constraints, inputs, and combinations from global context
  const { constraints, setConstraints, inputs, combinations } = useData();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [focusNewRow, setFocusNewRow] = useState(null);
  const [activeAutocomplete, setActiveAutocomplete] = useState(null);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('All');
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#FB923C');
  
  // Tag management
  const [availableTags, setAvailableTags] = useState([
    { id: 'tag-1', name: 'Regulatory', color: '#EF4444' },
    { id: 'tag-2', name: 'Cost Control', color: '#22C55E' },
    { id: 'tag-3', name: 'Quality', color: '#3B82F6' },
    { id: 'tag-4', name: 'Safety', color: '#F59E0B' },
  ]);
  
  // Active tag autocomplete state (per constraint)
  const [activeTagAutocomplete, setActiveTagAutocomplete] = useState(null);
  const [tagSearchQuery, setTagSearchQuery] = useState({});
  const [tagAutocompleteIndex, setTagAutocompleteIndex] = useState(0);

  // Get available inputs from context and map to format expected by component
  const availableInputs = inputs.map(i => ({
    ...i,
    sourceType: 'Input' as const
  }));

  // Get available combinations from context and map to format expected by component
  const availableCombinations = combinations.map(c => ({
    ...c,
    sourceType: 'Combination' as const,
    inputType: 'Combination',
    variableType: 'Continuous'
  }));

  // Combined list for autocomplete
  const allConstrainableItems = [...availableInputs, ...availableCombinations];

  // Theme color for Constraints - Orange
  const themeColor = '#FB923C';
  const themeColorRgb = '251, 146, 60';

  // Constraint types and their eligibility
  const constraintTypes = [
    { id: 'equals', label: 'Equals To', eligibleVariables: ['Continuous', 'Ordinal', 'Nominal'], eligibleSources: ['Input', 'Combination'], fields: 1 },
    { id: 'between', label: 'Between', eligibleVariables: ['Continuous', 'Ordinal'], eligibleSources: ['Input', 'Combination'], fields: 2 },
    { id: 'at_least', label: 'At Least', eligibleVariables: ['Continuous', 'Ordinal'], eligibleSources: ['Input', 'Combination'], fields: 1 },
    { id: 'at_most', label: 'At Most', eligibleVariables: ['Continuous', 'Ordinal'], eligibleSources: ['Input', 'Combination'], fields: 1 },
    { id: 'use_x_types', label: 'Use X Types', eligibleVariables: ['Continuous'], eligibleSources: ['Combination'], fields: 2 },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleAddNew();
      }
      if (e.key === 'Escape') {
        if (showTagModal) {
          setShowTagModal(false);
          setNewTagName('');
        } else if (activeAutocomplete) {
          setActiveAutocomplete(null);
          setAutocompleteIndex(0);
        } else if (activeTagAutocomplete) {
          setActiveTagAutocomplete(null);
          setTagAutocompleteIndex(0);
        } else if (onClose) {
          onClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTagModal, activeAutocomplete, activeTagAutocomplete]);

  const handleAddNew = () => {
    const newId = `constraint-${Date.now()}`;
    const newConstraint = {
      id: newId,
      targetId: null,
      targetName: '',
      targetSourceType: null,
      targetInputType: null,
      targetVariableType: null,
      constraintType: null,
      value1: '',
      value2: '',
      tags: [],
    };
    setConstraints(prev => [...prev, newConstraint]);
    setFocusNewRow(newId);
  };

  const updateConstraint = (id, field, value) => {
    setConstraints(prev => prev.map(constraint => {
      if (constraint.id !== id) return constraint;
      
      const updated = { ...constraint, [field]: value };
      
      // If changing constraint type, check if current target is still valid
      if (field === 'constraintType' && updated.targetId) {
        const constraintTypeDef = constraintTypes.find(ct => ct.id === value);
        if (constraintTypeDef) {
          const isValid = constraintTypeDef.eligibleVariables.includes(updated.targetVariableType) &&
                          constraintTypeDef.eligibleSources.includes(updated.targetSourceType);
          if (!isValid) {
            // Clear the target
            updated.targetId = null;
            updated.targetName = '';
            updated.targetSourceType = null;
            updated.targetInputType = null;
            updated.targetVariableType = null;
          }
        }
      }
      
      return updated;
    }));
  };

  const applyTargetItem = (constraintId, item) => {
    setConstraints(prev => prev.map(constraint => {
      if (constraint.id !== constraintId) return constraint;
      
      // Check if the item is eligible for the current constraint type
      if (constraint.constraintType) {
        const constraintTypeDef = constraintTypes.find(ct => ct.id === constraint.constraintType);
        if (constraintTypeDef) {
          const isValid = constraintTypeDef.eligibleVariables.includes(item.variableType) &&
                          constraintTypeDef.eligibleSources.includes(item.sourceType);
          if (!isValid) {
            // Don't apply if not eligible
            return constraint;
          }
        }
      }
      
      return {
        ...constraint,
        targetId: item.id,
        targetName: item.name,
        targetSourceType: item.sourceType,
        targetInputType: item.inputType,
        targetVariableType: item.variableType,
      };
    }));
    setActiveAutocomplete(null);
    setAutocompleteIndex(0);
  };

  const deleteConstraint = (id) => {
    setConstraints(prev => prev.filter(c => c.id !== id));
  };

  // Get autocomplete suggestions based on constraint type
  const getAutocompleteSuggestions = (query, constraintType) => {
    let eligible = allConstrainableItems;
    
    // Filter by constraint type eligibility
    if (constraintType) {
      const constraintTypeDef = constraintTypes.find(ct => ct.id === constraintType);
      if (constraintTypeDef) {
        eligible = eligible.filter(item => 
          constraintTypeDef.eligibleVariables.includes(item.variableType) &&
          constraintTypeDef.eligibleSources.includes(item.sourceType)
        );
      }
    }
    
    // Filter by search query
    if (query && query.length >= 1) {
      const lowerQuery = query.toLowerCase();
      eligible = eligible.filter(item =>
        item.name.toLowerCase().includes(lowerQuery)
      );
    }
    
    return eligible.slice(0, 6);
  };

  // Tag management functions
  const addTagToConstraint = (constraintId, tag) => {
    setConstraints(prev => prev.map(constraint => {
      if (constraint.id !== constraintId) return constraint;
      if (constraint.tags.find(t => t.id === tag.id)) return constraint;
      return { ...constraint, tags: [...constraint.tags, tag] };
    }));
    setActiveTagAutocomplete(null);
    setTagSearchQuery(prev => ({ ...prev, [constraintId]: '' }));
    setTagAutocompleteIndex(0);
  };

  const removeTagFromConstraint = (constraintId, tagId) => {
    setConstraints(prev => prev.map(constraint => {
      if (constraint.id !== constraintId) return constraint;
      return { ...constraint, tags: constraint.tags.filter(t => t.id !== tagId) };
    }));
  };

  const createNewTag = () => {
    if (!newTagName.trim()) return;
    const newTag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
    };
    setAvailableTags(prev => [...prev, newTag]);
    setShowTagModal(false);
    setNewTagName('');
  };

  const getTagSuggestions = (query, constraintTags) => {
    const existingIds = constraintTags.map(t => t.id);
    let eligible = availableTags.filter(t => !existingIds.includes(t.id));
    
    if (query && query.length >= 1) {
      const lowerQuery = query.toLowerCase();
      eligible = eligible.filter(t => t.name.toLowerCase().includes(lowerQuery));
    }
    
    return eligible;
  };

  // Filter library items
  const getFilteredLibraryItems = () => {
    let items = allConstrainableItems;
    
    // Apply category filter
    if (libraryFilter !== 'All') {
      if (libraryFilter === 'Combination') {
        items = items.filter(i => i.sourceType === 'Combination');
      } else {
        items = items.filter(i => i.inputType === libraryFilter);
      }
    }
    
    // Apply search
    if (librarySearch) {
      const lowerSearch = librarySearch.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(lowerSearch) ||
        i.inputType.toLowerCase().includes(lowerSearch)
      );
    }
    
    return items;
  };

  // Focus management for new rows
  const nameInputRefs = useRef({});
  useEffect(() => {
    if (focusNewRow && nameInputRefs.current[focusNewRow]) {
      nameInputRefs.current[focusNewRow].focus();
      setFocusNewRow(null);
    }
  }, [focusNewRow, constraints]);

  // Tag components
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

  const VariableTypeTag = ({ type, small }) => {
    const colors = {
      'Continuous': { bg: 'rgba(96, 165, 250, 0.15)', text: '#60A5FA', border: 'rgba(96, 165, 250, 0.3)' },
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

  const ConstraintTag = ({ tag, onRemove, small }) => {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: small ? '2px 6px' : '3px 8px',
        borderRadius: '4px',
        fontSize: small ? '10px' : '11px',
        fontWeight: 500,
        background: `${tag.color}20`,
        color: tag.color,
        border: `1px solid ${tag.color}40`,
        whiteSpace: 'nowrap',
      }}>
        {tag.name}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              padding: '0',
              width: '12px',
              height: '12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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

  const tagColors = ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  return (
    <div 
      onClick={(e) => {
        // Close modal when clicking the backdrop (but not the modal content)
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        zIndex: 1000,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.12);
        }
        
        input::placeholder {
          color: #52525b;
        }
        
        .constraint-field {
          padding: 7px 10px;
          font-size: 13px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #E4E4E7;
          outline: none;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .constraint-field:focus {
          border-color: rgba(251, 146, 60, 0.5);
          background: rgba(251, 146, 60, 0.05);
          box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.1);
        }
        .constraint-field:hover:not(:focus) {
          border-color: rgba(255,255,255,0.12);
        }
        .constraint-field:disabled {
          background: rgba(255,255,255,0.01);
          color: #3f3f46;
          cursor: not-allowed;
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
          transition: all 0.15s ease;
          width: 80px;
        }
        .value-field:focus {
          border-color: rgba(251, 146, 60, 0.5);
          background: rgba(251, 146, 60, 0.08);
        }
        
        .tag-input {
          padding: 4px 8px;
          font-size: 11px;
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.15);
          border-radius: 4px;
          color: #A1A1AA;
          outline: none;
          min-width: 60px;
          transition: all 0.15s ease;
        }
        .tag-input:focus {
          border-style: solid;
          border-color: rgba(251, 146, 60, 0.4);
          background: rgba(251, 146, 60, 0.05);
        }
        .tag-input::placeholder {
          color: #52525b;
        }
        
        .library-item {
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.12s ease;
          margin-bottom: 6px;
        }
        .library-item:hover {
          background: rgba(251, 146, 60, 0.06);
          border-color: rgba(251, 146, 60, 0.2);
        }
      `}</style>

      {/* Main Modal - Side by side layout */}
      <div style={{
        width: '1200px',
        maxWidth: '95vw',
        height: '700px',
        maxHeight: '92vh',
        background: 'linear-gradient(180deg, #111116 0%, #0c0c10 100%)',
        borderRadius: '16px',
        border: `1px solid rgba(${themeColorRgb}, 0.2)`,
        boxShadow: `0 0 80px rgba(${themeColorRgb}, 0.08), 0 25px 80px rgba(0,0,0,0.6)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalEnter 0.25s ease-out',
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, rgba(${themeColorRgb}, 0.15) 0%, rgba(${themeColorRgb}, 0.05) 100%)`,
              border: `1px solid rgba(${themeColorRgb}, 0.25)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Lock icon for Constraints */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: '#E4E4E7',
                letterSpacing: '-0.02em',
              }}>
                Configure Constraints
              </h2>
              <p style={{
                margin: '3px 0 0 0',
                fontSize: '12px',
                color: '#71717A',
              }}>
                {constraints.length} constraint{constraints.length !== 1 ? 's' : ''} • Define limits on inputs and combinations
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Side by Side */}
        <div style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          overflow: 'hidden',
        }}>
          
          {/* LEFT SIDE - Constraints List */}
          <div style={{
            flex: '1 1 68%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            minWidth: 0,
          }}>
            {/* Constraints List Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#71717A',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Constraints List
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAddNew}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${themeColor} 0%, #EA580C 100%)`,
                    color: '#0a0a0f',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                    boxShadow: `0 2px 8px rgba(${themeColorRgb}, 0.3)`,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Constraint
                  <kbd style={{
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: 'rgba(0,0,0,0.2)',
                    fontSize: '10px',
                    fontWeight: 500,
                  }}>⌘N</kbd>
                </button>
                <button
                  onClick={() => setShowTagModal(true)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 500,
                    background: 'rgba(255,255,255,0.03)',
                    color: '#A1A1AA',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  Create Tag
                </button>
              </div>
            </div>

            {/* Constraints List Content */}
            <div className="custom-scrollbar" style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px',
            }}>
              {constraints.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: '16px',
                  padding: '40px',
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, rgba(${themeColorRgb}, 0.08) 0%, rgba(${themeColorRgb}, 0.02) 100%)`,
                    border: `1px dashed rgba(${themeColorRgb}, 0.25)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="1.5" opacity="0.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#A1A1AA',
                    }}>
                      No constraints defined
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#52525b',
                      maxWidth: '280px',
                      lineHeight: 1.5,
                    }}>
                      Add constraints to limit values of inputs and combinations. Select from the library on the right or click "Add Constraint".
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {constraints.map((constraint) => {
                    const constraintTypeDef = constraintTypes.find(ct => ct.id === constraint.constraintType);
                    
                    return (
                      <div
                        key={constraint.id}
                        onMouseEnter={() => setHoveredRow(constraint.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          background: hoveredRow === constraint.id 
                            ? 'rgba(255,255,255,0.025)' 
                            : 'rgba(255,255,255,0.015)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        {/* Subject Input with Autocomplete */}
                        <div style={{ flex: '0 0 210px', position: 'relative' }}>
                          <input
                            ref={el => nameInputRefs.current[constraint.id] = el}
                            type="text"
                            value={constraint.targetName}
                            onChange={(e) => {
                              updateConstraint(constraint.id, 'targetName', e.target.value);
                              if (e.target.value.length >= 1) {
                                setActiveAutocomplete(constraint.id);
                                setAutocompleteIndex(0);
                              } else {
                                updateConstraint(constraint.id, 'targetId', null);
                                updateConstraint(constraint.id, 'targetSourceType', null);
                                updateConstraint(constraint.id, 'targetInputType', null);
                                updateConstraint(constraint.id, 'targetVariableType', null);
                                setActiveAutocomplete(null);
                              }
                            }}
                            onFocus={() => {
                              setActiveAutocomplete(constraint.id);
                            }}
                            onBlur={() => {
                              setTimeout(() => setActiveAutocomplete(null), 150);
                            }}
                            onKeyDown={(e) => {
                              const suggestions = getAutocompleteSuggestions(constraint.targetName, constraint.constraintType);
                              if (activeAutocomplete === constraint.id && suggestions.length > 0) {
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setAutocompleteIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  setAutocompleteIndex(prev => Math.max(prev - 1, 0));
                                } else if (e.key === 'Enter') {
                                  e.preventDefault();
                                  applyTargetItem(constraint.id, suggestions[autocompleteIndex]);
                                }
                              }
                            }}
                            placeholder="Subject..."
                            className="constraint-field"
                            style={{ width: '100%', fontSize: '12px', padding: '6px 8px' }}
                            autoComplete="off"
                          />
                          
                          {/* Autocomplete Dropdown */}
                          {activeAutocomplete === constraint.id && (() => {
                            const suggestions = getAutocompleteSuggestions(constraint.targetName, constraint.constraintType);
                            if (suggestions.length === 0) return null;
                            
                            return (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                width: '280px',
                                marginTop: '4px',
                                background: '#1a1a22',
                                border: `1px solid rgba(${themeColorRgb}, 0.3)`,
                                borderRadius: '8px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                zIndex: 100,
                                overflow: 'hidden',
                                animation: 'fadeIn 0.1s ease-out',
                              }}>
                                <div style={{
                                  padding: '6px 10px',
                                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}>
                                  <span style={{ fontSize: '9px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Select subject
                                  </span>
                                  <span style={{ fontSize: '9px', color: '#52525b' }}>
                                    ↑↓ nav · Enter select
                                  </span>
                                </div>
                                {suggestions.map((item, idx) => (
                                  <div
                                    key={item.id}
                                    onClick={() => applyTargetItem(constraint.id, item)}
                                    style={{
                                      padding: '8px 10px',
                                      cursor: 'pointer',
                                      background: idx === autocompleteIndex ? `rgba(${themeColorRgb}, 0.1)` : 'transparent',
                                      borderLeft: idx === autocompleteIndex ? `2px solid ${themeColor}` : '2px solid transparent',
                                      transition: 'all 0.1s ease',
                                    }}
                                    onMouseEnter={() => setAutocompleteIndex(idx)}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#E4E4E7' }}>{item.name}</span>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <InputTypeTag type={item.inputType} small />
                                        <VariableTypeTag type={item.variableType} small />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Constraint Type Dropdown */}
                        <div style={{ flex: '0 0 110px' }}>
                          <select
                            value={constraint.constraintType || ''}
                            onChange={(e) => updateConstraint(constraint.id, 'constraintType', e.target.value || null)}
                            className="constraint-field"
                            style={{ width: '100%', fontSize: '11px', padding: '6px 8px' }}
                          >
                            <option value="">Type...</option>
                            {constraintTypes.map(ct => (
                              <option key={ct.id} value={ct.id}>{ct.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Value Fields - different for continuous vs discrete */}
                        <div style={{ flex: '0 0 180px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {/* Continuous/Ordinal numeric inputs */}
                          {(constraint.targetVariableType === 'Continuous' || !constraint.targetVariableType) && (
                            <>
                              {(!constraintTypeDef || constraintTypeDef.fields >= 1) && (
                                <input
                                  type="number"
                                  step="any"
                                  value={constraint.value1}
                                  onChange={(e) => updateConstraint(constraint.id, 'value1', e.target.value)}
                                  placeholder={constraintTypeDef?.fields === 2 ? 'Min' : 'Value'}
                                  className="value-field"
                                  disabled={!constraint.constraintType}
                                  style={{ width: constraintTypeDef?.fields === 2 ? '80px' : '100%' }}
                                />
                              )}
                              {constraintTypeDef?.fields === 2 && (
                                <>
                                  <span style={{ color: '#52525b', fontSize: '10px' }}>–</span>
                                  <input
                                    type="number"
                                    step="any"
                                    value={constraint.value2}
                                    onChange={(e) => updateConstraint(constraint.id, 'value2', e.target.value)}
                                    placeholder="Max"
                                    className="value-field"
                                    style={{ width: '80px' }}
                                  />
                                </>
                              )}
                            </>
                          )}
                          
                          {/* Ordinal dropdown for discrete ordinal types */}
                          {constraint.targetVariableType === 'Ordinal' && constraint.targetId && (
                            <>
                              {constraint.constraintType === 'equals' && (
                                <select
                                  value={constraint.value1}
                                  onChange={(e) => updateConstraint(constraint.id, 'value1', e.target.value)}
                                  className="constraint-field"
                                  style={{ width: '100%', fontSize: '11px', padding: '6px 8px' }}
                                  disabled={!constraint.constraintType}
                                >
                                  <option value="">Select level...</option>
                                  {(allConstrainableItems.find(i => i.id === constraint.targetId)?.levels || []).map((level, idx) => (
                                    <option key={idx} value={level}>{level}</option>
                                  ))}
                                </select>
                              )}
                              {(constraint.constraintType === 'between' || constraint.constraintType === 'at_least' || constraint.constraintType === 'at_most') && (
                                <>
                                  <select
                                    value={constraint.value1}
                                    onChange={(e) => updateConstraint(constraint.id, 'value1', e.target.value)}
                                    className="constraint-field"
                                    style={{ width: constraintTypeDef?.fields === 2 ? '70px' : '100%', fontSize: '11px', padding: '6px 8px' }}
                                    disabled={!constraint.constraintType}
                                  >
                                    <option value="">{constraintTypeDef?.fields === 2 ? 'Min' : 'Level'}</option>
                                    {(allConstrainableItems.find(i => i.id === constraint.targetId)?.levels || []).map((level, idx) => (
                                      <option key={idx} value={level}>{level}</option>
                                    ))}
                                  </select>
                                  {constraintTypeDef?.fields === 2 && (
                                    <>
                                      <span style={{ color: '#52525b', fontSize: '10px' }}>–</span>
                                      <select
                                        value={constraint.value2}
                                        onChange={(e) => updateConstraint(constraint.id, 'value2', e.target.value)}
                                        className="constraint-field"
                                        style={{ width: '70px', fontSize: '11px', padding: '6px 8px' }}
                                      >
                                        <option value="">Max</option>
                                        {(allConstrainableItems.find(i => i.id === constraint.targetId)?.levels || []).map((level, idx) => (
                                          <option key={idx} value={level}>{level}</option>
                                        ))}
                                      </select>
                                    </>
                                  )}
                                </>
                              )}
                            </>
                          )}
                          
                          {/* Nominal dropdown - only equals is valid */}
                          {constraint.targetVariableType === 'Nominal' && constraint.targetId && (
                            <select
                              value={constraint.value1}
                              onChange={(e) => updateConstraint(constraint.id, 'value1', e.target.value)}
                              className="constraint-field"
                              style={{ width: '100%', fontSize: '11px', padding: '6px 8px' }}
                              disabled={!constraint.constraintType}
                            >
                              <option value="">Select level...</option>
                              {(allConstrainableItems.find(i => i.id === constraint.targetId)?.levels || []).map((level, idx) => (
                                <option key={idx} value={level}>{level}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Tags - Inline */}
                        <div style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          flexWrap: 'wrap',
                          minWidth: 0,
                        }}>
                          {constraint.tags.map(tag => (
                            <ConstraintTag
                              key={tag.id}
                              tag={tag}
                              onRemove={() => removeTagFromConstraint(constraint.id, tag.id)}
                              small
                            />
                          ))}
                          
                          {/* Tag Input with Autocomplete */}
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
                                  } else if ((tagSearchQuery[constraint.id] || '').trim()) {
                                    const newTag = {
                                      id: `tag-${Date.now()}`,
                                      name: (tagSearchQuery[constraint.id] || '').trim(),
                                      color: tagColors[availableTags.length % tagColors.length],
                                    };
                                    setAvailableTags(prev => [...prev, newTag]);
                                    addTagToConstraint(constraint.id, newTag);
                                  }
                                }
                              }}
                              placeholder="+tag"
                              className="tag-input"
                              style={{ width: '50px' }}
                            />
                            
                            {/* Tag Autocomplete Dropdown - shows on focus */}
                            {activeTagAutocomplete === constraint.id && (() => {
                              const suggestions = getTagSuggestions(tagSearchQuery[constraint.id] || '', constraint.tags);
                              const query = (tagSearchQuery[constraint.id] || '').trim();
                              const showCreateOption = query && !suggestions.find(t => t.name.toLowerCase() === query.toLowerCase());
                              
                              // Show dropdown if there are suggestions OR if there's a create option
                              if (suggestions.length === 0 && !showCreateOption) return null;
                              
                              return (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  minWidth: '140px',
                                  marginTop: '4px',
                                  background: '#1a1a22',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  borderRadius: '6px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                  zIndex: 100,
                                  overflow: 'hidden',
                                  animation: 'fadeIn 0.1s ease-out',
                                }}>
                                  {suggestions.map((tag, idx) => (
                                    <div
                                      key={tag.id}
                                      onClick={() => addTagToConstraint(constraint.id, tag)}
                                      style={{
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        background: idx === tagAutocompleteIndex ? 'rgba(255,255,255,0.06)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background 0.1s ease',
                                      }}
                                      onMouseEnter={() => setTagAutocompleteIndex(idx)}
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
                                  {showCreateOption && (
                                    <div
                                      onClick={() => {
                                        const newTag = {
                                          id: `tag-${Date.now()}`,
                                          name: query,
                                          color: tagColors[availableTags.length % tagColors.length],
                                        };
                                        setAvailableTags(prev => [...prev, newTag]);
                                        addTagToConstraint(constraint.id, newTag);
                                      }}
                                      style={{
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        background: suggestions.length === 0 && tagAutocompleteIndex === 0 ? 'rgba(255,255,255,0.06)' : 'transparent',
                                        borderTop: suggestions.length > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'background 0.1s ease',
                                      }}
                                    >
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                      </svg>
                                      <span style={{ fontSize: '11px', color: themeColor }}>Create "{query}"</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteConstraint(constraint.id)}
                          style={{
                            padding: '5px',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#52525b',
                            opacity: hoveredRow === constraint.id ? 1 : 0,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#EF4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#52525b';
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - Inputs/Combinations Library */}
          <div style={{
            flex: '1 1 32%',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(0,0,0,0.15)',
            minWidth: 0,
          }}>
            {/* Library Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              flexShrink: 0,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#71717A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  Inputs & Combinations
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    style={{
                      padding: '5px 10px',
                      fontSize: '10px',
                      fontWeight: 600,
                      background: 'rgba(45, 212, 191, 0.1)',
                      color: '#2DD4BF',
                      border: '1px solid rgba(45, 212, 191, 0.25)',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Input
                  </button>
                  <button
                    style={{
                      padding: '5px 10px',
                      fontSize: '10px',
                      fontWeight: 600,
                      background: 'rgba(167, 139, 250, 0.1)',
                      color: '#A78BFA',
                      border: '1px solid rgba(167, 139, 250, 0.25)',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Combo
                  </button>
                </div>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#52525b" 
                  strokeWidth="2" 
                  style={{ 
                    position: 'absolute', 
                    left: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search inputs & combinations..."
                  className="constraint-field"
                  style={{ 
                    width: '100%', 
                    paddingLeft: '32px',
                    fontSize: '12px',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                />
              </div>

              {/* Filter Buttons */}
              <div style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
              }}>
                {['All', 'Combination', 'Ingredient', 'Processing', 'Other'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLibraryFilter(filter)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '10px',
                      fontWeight: 500,
                      background: libraryFilter === filter
                        ? `rgba(${themeColorRgb}, 0.15)`
                        : 'rgba(255,255,255,0.03)',
                      color: libraryFilter === filter
                        ? themeColor
                        : '#71717A',
                      border: libraryFilter === filter
                        ? `1px solid rgba(${themeColorRgb}, 0.3)`
                        : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {filter === 'Combination' ? 'Combos' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Library Items */}
            <div className="custom-scrollbar" style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px',
            }}>
              {getFilteredLibraryItems().map((item) => (
                <div
                  key={item.id}
                  className="library-item"
                  onClick={() => {
                    // Quick-add a new constraint with this item
                    const newId = `constraint-${Date.now()}`;
                    const newConstraint = {
                      id: newId,
                      targetId: item.id,
                      targetName: item.name,
                      targetSourceType: item.sourceType,
                      targetInputType: item.inputType,
                      targetVariableType: item.variableType,
                      constraintType: null,
                      value1: '',
                      value2: '',
                      tags: [],
                    };
                    setConstraints(prev => [...prev, newConstraint]);
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#E4E4E7',
                    }}>
                      {item.name}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <InputTypeTag type={item.inputType} small />
                      <VariableTypeTag type={item.variableType} small />
                    </div>
                  </div>
                  {item.description && (
                    <p style={{
                      margin: 0,
                      fontSize: '11px',
                      color: '#71717A',
                    }}>
                      {item.description}
                    </p>
                  )}
                  {item.levels && (
                    <div style={{
                      display: 'flex',
                      gap: '4px',
                      marginTop: '6px',
                      flexWrap: 'wrap',
                    }}>
                      {item.levels.slice(0, 3).map((level, i) => (
                        <span key={i} style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: 'rgba(255,255,255,0.05)',
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
                          background: 'rgba(255,255,255,0.05)',
                          fontSize: '9px',
                          color: '#71717A',
                        }}>
                          +{item.levels.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {getFilteredLibraryItems().length === 0 && (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '12px', color: '#52525b', margin: 0 }}>
                    No items found matching "{librarySearch || libraryFilter}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '11px',
            color: '#52525b',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ 
                padding: '2px 6px', 
                borderRadius: '4px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.08)', 
                fontSize: '10px' 
              }}>⌘N</kbd>
              New Constraint
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={onClose}
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 500,
                background: 'transparent',
                color: '#71717A',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = '#A1A1AA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#71717A';
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Data is already saved to context automatically
                // Just close the modal if we have constraints
                if (constraints.length > 0) {
                  onClose();
                }
              }}
              disabled={constraints.length === 0}
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 600,
                background: constraints.length > 0 
                  ? `linear-gradient(135deg, ${themeColor} 0%, #EA580C 100%)`
                  : 'rgba(255,255,255,0.05)',
                color: constraints.length > 0 ? '#0a0a0f' : '#52525b',
                border: constraints.length > 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: constraints.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                boxShadow: constraints.length > 0 ? `0 2px 16px rgba(${themeColorRgb}, 0.35)` : 'none',
              }}
              onMouseEnter={(e) => {
                if (constraints.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 4px 20px rgba(${themeColorRgb}, 0.45)`;
                }
              }}
              onMouseLeave={(e) => {
                if (constraints.length > 0) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 2px 16px rgba(${themeColorRgb}, 0.35)`;
                }
              }}
            >
              Save Constraints
            </button>
          </div>
        </div>
      </div>

      {/* Create Tag Modal */}
      {showTagModal && (
        <>
          <div 
            onClick={() => {
              setShowTagModal(false);
              setNewTagName('');
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1001,
              animation: 'fadeIn 0.15s ease-out',
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
            background: '#14141a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            zIndex: 1002,
            animation: 'slideUp 0.2s ease-out',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#E4E4E7' }}>
                Create New Tag
              </h3>
              <button
                onClick={() => {
                  setShowTagModal(false);
                  setNewTagName('');
                }}
                style={{
                  padding: '4px',
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#71717A',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#71717A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                }}>
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., Regulatory, Cost Control"
                  autoFocus
                  className="constraint-field"
                  style={{ width: '100%' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      createNewTag();
                    }
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#71717A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}>
                  Color
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tagColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: color,
                        border: newTagColor === color ? '2px solid white' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: newTagColor === color ? `0 0 12px ${color}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              {newTagName && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#71717A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                  }}>
                    Preview
                  </label>
                  <ConstraintTag tag={{ name: newTagName, color: newTagColor }} small={false} />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowTagModal(false);
                    setNewTagName('');
                  }}
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
                  Cancel
                </button>
                <button
                  onClick={createNewTag}
                  disabled={!newTagName.trim()}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: newTagName.trim()
                      ? `linear-gradient(135deg, ${themeColor} 0%, #EA580C 100%)`
                      : 'rgba(255,255,255,0.05)',
                    color: newTagName.trim() ? '#0a0a0f' : '#52525b',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: newTagName.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Create Tag
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConstraintsModal;
