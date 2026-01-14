import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

const ObjectivesModal = ({ onClose }) => {
  // Get objectives, outcomes, and combinations from global context
  const { objectives, setObjectives, outcomes, combinations } = useData();
  const { theme, isDarkMode } = useTheme();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [focusNewRow, setFocusNewRow] = useState(null);
  const [activeAutocomplete, setActiveAutocomplete] = useState(null);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('All');
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#60A5FA');
  
  // Tag management
  const [availableTags, setAvailableTags] = useState([
    { id: 'tag-1', name: 'Primary', color: '#60A5FA' },
    { id: 'tag-2', name: 'Secondary', color: '#A78BFA' },
    { id: 'tag-3', name: 'Consumer Focus', color: '#F472B6' },
    { id: 'tag-4', name: 'Cost Reduction', color: '#22C55E' },
  ]);
  
  // Active tag autocomplete state (per objective)
  const [activeTagAutocomplete, setActiveTagAutocomplete] = useState(null);
  const [tagSearchQuery, setTagSearchQuery] = useState({});
  const [tagAutocompleteIndex, setTagAutocompleteIndex] = useState(0);

  // Get available outcomes from context and map to format expected by component
  const availableOutcomes = outcomes.map(o => ({
    ...o,
    sourceType: 'Outcome' as const
  }));

  // Get available combinations from context and map to format expected by component
  const availableCombinations = combinations.map(c => ({
    ...c,
    sourceType: 'Combination' as const,
    outcomeType: 'Combination',
    variableType: 'Continuous'
  }));

  // Combined list for autocomplete
  const allObjectiveItems = [...availableOutcomes, ...availableCombinations];

  // Theme color for Objectives - Blue
  const themeColor = '#60A5FA';
  const themeColorRgb = '96, 165, 250';

  // Objective types and their eligibility
  const objectiveTypes = [
    { id: 'maximize', label: 'Maximize', icon: '↑', eligibleVariables: ['Continuous', 'Ordinal'], eligibleSources: ['Outcome', 'Combination'], fields: 0, successCriteriaLabel: 'At Least', successCriteriaFields: 1 },
    { id: 'minimize', label: 'Minimize', icon: '↓', eligibleVariables: ['Continuous', 'Ordinal'], eligibleSources: ['Outcome', 'Combination'], fields: 0, successCriteriaLabel: 'At Most', successCriteriaFields: 1 },
    { id: 'approximately', label: 'Target', icon: '◎', eligibleVariables: ['Continuous', 'Ordinal', 'Nominal'], eligibleSources: ['Outcome', 'Combination'], fields: 1, successCriteriaLabel: 'Within', successCriteriaFields: 2 },
    { id: 'between', label: 'Between', icon: '↔', eligibleVariables: ['Continuous', 'Ordinal'], eligibleSources: ['Outcome', 'Combination'], fields: 2, successCriteriaLabel: null, successCriteriaFields: 0 },
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
    const newId = `objective-${Date.now()}`;
    const newObjective = {
      id: newId,
      targetId: null,
      targetName: '',
      targetSourceType: null,
      targetOutcomeType: null,
      targetVariableType: null,
      targetLevels: null,
      objectiveType: null,
      value1: '',
      value2: '',
      successCriteria1: '',
      successCriteria2: '',
      showSuccessCriteria: false,
      tags: [],
    };
    setObjectives(prev => [...prev, newObjective]);
    setFocusNewRow(newId);
  };

  const updateObjective = (id, field, value) => {
    setObjectives(prev => prev.map(objective => {
      if (objective.id !== id) return objective;
      
      const updated = { ...objective, [field]: value };
      
      // If changing objective type, check if current target is still valid
      if (field === 'objectiveType' && updated.targetId) {
        const objectiveTypeDef = objectiveTypes.find(ot => ot.id === value);
        if (objectiveTypeDef) {
          const isValid = objectiveTypeDef.eligibleVariables.includes(updated.targetVariableType) &&
                          objectiveTypeDef.eligibleSources.includes(updated.targetSourceType);
          if (!isValid) {
            updated.targetId = null;
            updated.targetName = '';
            updated.targetSourceType = null;
            updated.targetOutcomeType = null;
            updated.targetVariableType = null;
            updated.targetLevels = null;
          }
        }
        updated.value1 = '';
        updated.value2 = '';
        updated.successCriteria1 = '';
        updated.successCriteria2 = '';
        updated.showSuccessCriteria = false;
      }
      
      return updated;
    }));
  };

  const applyTargetItem = (objectiveId, item) => {
    setObjectives(prev => prev.map(objective => {
      if (objective.id !== objectiveId) return objective;
      
      if (objective.objectiveType) {
        const objectiveTypeDef = objectiveTypes.find(ot => ot.id === objective.objectiveType);
        if (objectiveTypeDef) {
          const isValid = objectiveTypeDef.eligibleVariables.includes(item.variableType) &&
                          objectiveTypeDef.eligibleSources.includes(item.sourceType);
          if (!isValid) {
            return objective;
          }
        }
      }
      
      return {
        ...objective,
        targetId: item.id,
        targetName: item.name,
        targetSourceType: item.sourceType,
        targetOutcomeType: item.outcomeType,
        targetVariableType: item.variableType,
        targetLevels: item.levels || null,
      };
    }));
    setActiveAutocomplete(null);
    setAutocompleteIndex(0);
  };

  const deleteObjective = (id) => {
    setObjectives(prev => prev.filter(o => o.id !== id));
  };

  const getAutocompleteSuggestions = (query, objectiveType) => {
    let eligible = allObjectiveItems;
    
    if (objectiveType) {
      const objectiveTypeDef = objectiveTypes.find(ot => ot.id === objectiveType);
      if (objectiveTypeDef) {
        eligible = eligible.filter(item => 
          objectiveTypeDef.eligibleVariables.includes(item.variableType) &&
          objectiveTypeDef.eligibleSources.includes(item.sourceType)
        );
      }
    }
    
    if (query && query.length >= 1) {
      const lowerQuery = query.toLowerCase();
      eligible = eligible.filter(item =>
        item.name.toLowerCase().includes(lowerQuery)
      );
    }
    
    return eligible.slice(0, 6);
  };

  const addTagToObjective = (objectiveId, tag) => {
    setObjectives(prev => prev.map(objective => {
      if (objective.id !== objectiveId) return objective;
      if (objective.tags.find(t => t.id === tag.id)) return objective;
      return { ...objective, tags: [...objective.tags, tag] };
    }));
    setActiveTagAutocomplete(null);
    setTagSearchQuery(prev => ({ ...prev, [objectiveId]: '' }));
    setTagAutocompleteIndex(0);
  };

  const removeTagFromObjective = (objectiveId, tagId) => {
    setObjectives(prev => prev.map(objective => {
      if (objective.id !== objectiveId) return objective;
      return { ...objective, tags: objective.tags.filter(t => t.id !== tagId) };
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

  const getTagSuggestions = (query, objectiveTags) => {
    const existingIds = objectiveTags.map(t => t.id);
    let eligible = availableTags.filter(t => !existingIds.includes(t.id));
    
    if (query && query.length >= 1) {
      const lowerQuery = query.toLowerCase();
      eligible = eligible.filter(t => t.name.toLowerCase().includes(lowerQuery));
    }
    
    return eligible;
  };

  const getFilteredLibraryItems = () => {
    let items = allObjectiveItems;
    
    if (libraryFilter !== 'All') {
      if (libraryFilter === 'Combination') {
        items = items.filter(i => i.sourceType === 'Combination');
      } else {
        items = items.filter(i => i.outcomeType === libraryFilter);
      }
    }
    
    if (librarySearch) {
      const lowerSearch = librarySearch.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(lowerSearch) ||
        i.outcomeType.toLowerCase().includes(lowerSearch)
      );
    }
    
    return items;
  };

  const nameInputRefs = useRef({});
  useEffect(() => {
    if (focusNewRow && nameInputRefs.current[focusNewRow]) {
      nameInputRefs.current[focusNewRow].focus();
      setFocusNewRow(null);
    }
  }, [focusNewRow, objectives]);

  const OutcomeTypeTag = ({ type, small }) => {
    const colors = {
      'Analytical': { bg: 'rgba(96, 165, 250, 0.15)', text: '#60A5FA', border: 'rgba(96, 165, 250, 0.3)' },
      'Sensory': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
      'Consumer': { bg: 'rgba(244, 114, 182, 0.15)', text: '#F472B6', border: 'rgba(244, 114, 182, 0.3)' },
      'Combination': { bg: 'rgba(167, 139, 250, 0.15)', text: '#A78BFA', border: 'rgba(167, 139, 250, 0.3)' },
      'Other': { bg: 'rgba(113, 113, 122, 0.15)', text: theme.textSecondary, border: 'rgba(113, 113, 122, 0.3)' },
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

  const ObjectiveTag = ({ tag, onRemove, small }) => {
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

  const tagColors = ['#60A5FA', '#A78BFA', '#F472B6', '#22C55E', '#EF4444', '#F59E0B', '#06B6D4', '#84CC16'];

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
          background: ${theme.cardBg};
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme.scrollbarThumb};
          border-radius: 3px;
        }

        input::placeholder {
          color: ${theme.placeholder};
        }

        .objective-field {
          padding: 7px 10px;
          font-size: 13px;
          background: ${theme.cardBg};
          border: 1px solid ${theme.inputBorder};
          border-radius: 6px;
          color: ${theme.text};
          outline: none;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .objective-field:focus {
          border-color: rgba(96, 165, 250, 0.5);
          background: rgba(96, 165, 250, 0.05);
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }
        .objective-field:hover:not(:focus) {
          border-color: ${theme.borderStrong};
        }
        .objective-field:disabled {
          background: ${theme.rowHoverBg};
          color: ${theme.textMuted};
          cursor: not-allowed;
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
          background: ${theme.borderLight};
          border: 1px solid ${theme.borderLight};
          border-radius: 5px;
          color: #60A5FA;
          text-align: center;
          outline: none;
          transition: all 0.15s ease;
          width: 70px;
        }
        .value-field:focus {
          border-color: rgba(96, 165, 250, 0.5);
          background: rgba(96, 165, 250, 0.08);
        }
        
        .success-field {
          padding: 5px 7px;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 4px;
          color: #22C55E;
          text-align: center;
          outline: none;
          transition: all 0.15s ease;
          width: 60px;
        }
        .success-field:focus {
          border-color: rgba(34, 197, 94, 0.5);
          background: rgba(34, 197, 94, 0.12);
        }
        
        .tag-input {
          padding: 4px 8px;
          font-size: 11px;
          background: theme.inputBg;
          border: 1px dashed ${theme.borderStrong};
          border-radius: 4px;
          color: theme.textSecondary;
          outline: none;
          min-width: 60px;
          transition: all 0.15s ease;
        }
        .tag-input:focus {
          border-style: solid;
          border-color: rgba(96, 165, 250, 0.4);
          background: rgba(96, 165, 250, 0.05);
        }
        
        .library-item {
          padding: 10px 12px;
          background: theme.cardBg;
          border: 1px solid ${theme.borderLight};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.12s ease;
          margin-bottom: 6px;
        }
        .library-item:hover {
          background: rgba(96, 165, 250, 0.06);
          border-color: rgba(96, 165, 250, 0.2);
        }
        
        .success-toggle {
          padding: 3px 8px;
          font-size: 9px;
          font-weight: 600;
          background: rgba(34, 197, 94, 0.08);
          color: theme.placeholder;
          border: 1px dashed rgba(34, 197, 94, 0.2);
          border-radius: 4px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          transition: all 0.15s ease;
        }
        .success-toggle:hover {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.4);
          color: #22C55E;
        }
      `}</style>

      {/* Main Modal */}
      <div style={{
        width: '1200px',
        maxWidth: '95vw',
        height: '700px',
        maxHeight: '92vh',
        background: theme.modalBg,
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
          borderBottom: `1px solid ${theme.border}`,
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: theme.text,
                letterSpacing: '-0.02em',
              }}>
                Configure Objectives
              </h2>
              <p style={{
                margin: '3px 0 0 0',
                fontSize: '12px',
                color: theme.textTertiary,
              }}>
                {objectives.length} objective{objectives.length !== 1 ? 's' : ''} • Define optimization goals on outcomes and combinations
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          overflow: 'hidden',
        }}>
          
          {/* LEFT SIDE - Objectives List */}
          <div style={{
            flex: '1 1 68%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: `1px solid ${theme.border}`,
            minWidth: 0,
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${theme.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: theme.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Objectives List
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handleAddNew}
                  style={{
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${themeColor} 0%, #3B82F6 100%)`,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Objective
                  <kbd style={{
                    padding: '2px 5px',
                    borderRadius: '3px',
                    background: theme.cardBgDark,
                    fontSize: '9px',
                    fontWeight: 500,
                  }}>⌘N</kbd>
                </button>
                <button
                  onClick={() => setShowTagModal(true)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 500,
                    background: theme.inputBg,
                    color: theme.textSecondary,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${theme.border}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.inputBg;
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

            <div className="custom-scrollbar" style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px',
            }}>
              {objectives.length === 0 ? (
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
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: theme.textSecondary,
                    }}>
                      No objectives defined
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: theme.textMuted,
                      maxWidth: '320px',
                      lineHeight: 1.5,
                    }}>
                      Add objectives to optimize outcomes and combinations. Select from the library on the right or click "Add Objective".
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {objectives.map((objective) => {
                    const objectiveTypeDef = objectiveTypes.find(ot => ot.id === objective.objectiveType);
                    const isNominal = objective.targetVariableType === 'Nominal';
                    const isOrdinal = objective.targetVariableType === 'Ordinal';
                    const isContinuous = objective.targetVariableType === 'Continuous' || !objective.targetVariableType;
                    
                    return (
                      <div
                        key={objective.id}
                        onMouseEnter={() => setHoveredRow(objective.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          background: hoveredRow === objective.id
                            ? theme.cardBgHover
                            : theme.cardBg,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '10px',
                          padding: '10px 12px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          {/* Target Input */}
                          <div style={{ flex: '0 0 200px', position: 'relative' }}>
                            <input
                              ref={el => nameInputRefs.current[objective.id] = el}
                              type="text"
                              value={objective.targetName}
                              onChange={(e) => {
                                updateObjective(objective.id, 'targetName', e.target.value);
                                if (e.target.value.length >= 1) {
                                  setActiveAutocomplete(objective.id);
                                  setAutocompleteIndex(0);
                                } else {
                                  updateObjective(objective.id, 'targetId', null);
                                  updateObjective(objective.id, 'targetSourceType', null);
                                  updateObjective(objective.id, 'targetOutcomeType', null);
                                  updateObjective(objective.id, 'targetVariableType', null);
                                  updateObjective(objective.id, 'targetLevels', null);
                                  setActiveAutocomplete(null);
                                }
                              }}
                              onFocus={() => setActiveAutocomplete(objective.id)}
                              onBlur={() => setTimeout(() => setActiveAutocomplete(null), 150)}
                              onKeyDown={(e) => {
                                const suggestions = getAutocompleteSuggestions(objective.targetName, objective.objectiveType);
                                if (activeAutocomplete === objective.id && suggestions.length > 0) {
                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setAutocompleteIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setAutocompleteIndex(prev => Math.max(prev - 1, 0));
                                  } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    applyTargetItem(objective.id, suggestions[autocompleteIndex]);
                                  }
                                }
                              }}
                              placeholder="Target outcome..."
                              className="objective-field"
                              style={{ width: '100%', fontSize: '12px', padding: '6px 8px' }}
                              autoComplete="off"
                            />
                            
                            {/* Autocomplete Dropdown */}
                            {activeAutocomplete === objective.id && (() => {
                              const suggestions = getAutocompleteSuggestions(objective.targetName, objective.objectiveType);
                              if (suggestions.length === 0) return null;
                              
                              return (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  width: '300px',
                                  marginTop: '4px',
                                  background: theme.surfaceElevated,
                                  border: `1px solid rgba(${themeColorRgb}, 0.3)`,
                                  borderRadius: '8px',
                                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                  zIndex: 100,
                                  overflow: 'hidden',
                                  animation: 'fadeIn 0.1s ease-out',
                                }}>
                                  <div style={{
                                    padding: '6px 10px',
                                    borderBottom: `1px solid ${theme.border}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}>
                                    <span style={{ fontSize: '9px', color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      Select target
                                    </span>
                                    <span style={{ fontSize: '9px', color: theme.textMuted }}>
                                      ↑↓ nav · Enter select
                                    </span>
                                  </div>
                                  {suggestions.map((item, idx) => (
                                    <div
                                      key={item.id}
                                      onClick={() => applyTargetItem(objective.id, item)}
                                      style={{
                                        padding: '8px 10px',
                                        cursor: 'pointer',
                                        background: idx === autocompleteIndex ? `rgba(${themeColorRgb}, 0.1)` : 'transparent',
                                        borderLeft: idx === autocompleteIndex ? `2px solid ${themeColor}` : '2px solid transparent',
                                        transition: 'all 0.1s ease',
                                      }}
                                      onMouseEnter={() => setAutocompleteIndex(idx)}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 500, color: theme.text }}>{item.name}</span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                          <OutcomeTypeTag type={item.outcomeType} small />
                                          <VariableTypeTag type={item.variableType} small />
                                        </div>
                                      </div>
                                      {item.description && (
                                        <div style={{ fontSize: '10px', color: theme.textTertiary }}>{item.description}</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Objective Type */}
                          <div style={{ flex: '0 0 100px' }}>
                            <select
                              value={objective.objectiveType || ''}
                              onChange={(e) => updateObjective(objective.id, 'objectiveType', e.target.value || null)}
                              className="objective-field"
                              style={{ width: '100%', fontSize: '11px', padding: '6px 8px' }}
                            >
                              <option value="">Type...</option>
                              {objectiveTypes
                                .filter(ot => {
                                  if (!objective.targetVariableType) return true;
                                  return ot.eligibleVariables.includes(objective.targetVariableType);
                                })
                                .map(ot => (
                                  <option key={ot.id} value={ot.id}>{ot.icon} {ot.label}</option>
                                ))}
                            </select>
                          </div>

                          {/* Value Fields + Success Criteria Combined */}
                          <div style={{ flex: '0 0 225px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {/* Maximize - optional At Least success criteria only */}
                            {objective.objectiveType === 'maximize' && (
                              <>
                                {!objective.showSuccessCriteria ? (
                                  <button
                                    onClick={() => updateObjective(objective.id, 'showSuccessCriteria', true)}
                                    className="success-toggle"
                                  >
                                    + At Least
                                  </button>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '10px', color: '#22C55E', fontWeight: 600 }}>At Least</span>
                                    {isContinuous ? (
                                      <input
                                        type="number"
                                        step="any"
                                        value={objective.successCriteria1}
                                        onChange={(e) => updateObjective(objective.id, 'successCriteria1', e.target.value)}
                                        placeholder="Min"
                                        className="success-field"
                                        style={{ width: '70px' }}
                                      />
                                    ) : isOrdinal && objective.targetLevels ? (
                                      <select
                                        value={objective.successCriteria1}
                                        onChange={(e) => updateObjective(objective.id, 'successCriteria1', e.target.value)}
                                        className="objective-field"
                                        style={{ width: '120px', fontSize: '10px', padding: '5px 6px' }}
                                      >
                                        <option value="">Min level...</option>
                                        {objective.targetLevels.map((level, idx) => (
                                          <option key={idx} value={level}>{level}</option>
                                        ))}
                                      </select>
                                    ) : null}
                                    <button
                                      onClick={() => {
                                        updateObjective(objective.id, 'showSuccessCriteria', false);
                                        updateObjective(objective.id, 'successCriteria1', '');
                                      }}
                                      style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textMuted, display: 'flex' }}
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
                            
                            {/* Minimize - optional At Most success criteria only */}
                            {objective.objectiveType === 'minimize' && (
                              <>
                                {!objective.showSuccessCriteria ? (
                                  <button
                                    onClick={() => updateObjective(objective.id, 'showSuccessCriteria', true)}
                                    className="success-toggle"
                                  >
                                    + At Most
                                  </button>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '10px', color: '#22C55E', fontWeight: 600 }}>At Most</span>
                                    {isContinuous ? (
                                      <input
                                        type="number"
                                        step="any"
                                        value={objective.successCriteria1}
                                        onChange={(e) => updateObjective(objective.id, 'successCriteria1', e.target.value)}
                                        placeholder="Max"
                                        className="success-field"
                                        style={{ width: '70px' }}
                                      />
                                    ) : isOrdinal && objective.targetLevels ? (
                                      <select
                                        value={objective.successCriteria1}
                                        onChange={(e) => updateObjective(objective.id, 'successCriteria1', e.target.value)}
                                        className="objective-field"
                                        style={{ width: '120px', fontSize: '10px', padding: '5px 6px' }}
                                      >
                                        <option value="">Max level...</option>
                                        {objective.targetLevels.map((level, idx) => (
                                          <option key={idx} value={level}>{level}</option>
                                        ))}
                                      </select>
                                    ) : null}
                                    <button
                                      onClick={() => {
                                        updateObjective(objective.id, 'showSuccessCriteria', false);
                                        updateObjective(objective.id, 'successCriteria1', '');
                                      }}
                                      style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textMuted, display: 'flex' }}
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
                            
                            {/* Target - value + optional Within (NOT for nominal) */}
                            {objective.objectiveType === 'approximately' && (
                              <>
                                {(isContinuous || !objective.targetId) && (
                                  <input
                                    type="number"
                                    step="any"
                                    value={objective.value1}
                                    onChange={(e) => updateObjective(objective.id, 'value1', e.target.value)}
                                    placeholder="Target"
                                    className="value-field"
                                    style={{ width: '80px' }}
                                  />
                                )}
                                {(isOrdinal || isNominal) && objective.targetLevels && (
                                  <select
                                    value={objective.value1}
                                    onChange={(e) => updateObjective(objective.id, 'value1', e.target.value)}
                                    className="objective-field"
                                    style={{ width: '120px', fontSize: '10px', padding: '5px 6px' }}
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
                                        onClick={() => updateObjective(objective.id, 'showSuccessCriteria', true)}
                                        className="success-toggle"
                                      >
                                        + Within
                                      </button>
                                    ) : (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '10px', color: '#22C55E', fontWeight: 600 }}>±</span>
                                        {isContinuous ? (
                                          <input
                                            type="number"
                                            step="any"
                                            value={objective.successCriteria1}
                                            onChange={(e) => updateObjective(objective.id, 'successCriteria1', e.target.value)}
                                            placeholder="Tol"
                                            className="success-field"
                                            style={{ width: '60px' }}
                                          />
                                        ) : isOrdinal ? (
                                          <input
                                            type="number"
                                            step="1"
                                            min="0"
                                            value={objective.successCriteria1}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              if (val === '' || /^\d+$/.test(val)) {
                                                updateObjective(objective.id, 'successCriteria1', val);
                                              }
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === '.' || e.key === '-' || e.key === 'e') {
                                                e.preventDefault();
                                              }
                                            }}
                                            placeholder="Lvls"
                                            className="success-field"
                                            style={{ width: '50px' }}
                                          />
                                        ) : null}
                                        <button
                                          onClick={() => {
                                            updateObjective(objective.id, 'showSuccessCriteria', false);
                                            updateObjective(objective.id, 'successCriteria1', '');
                                          }}
                                          style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textMuted, display: 'flex' }}
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
                            
                            {/* Between - two values, NO success criteria */}
                            {objective.objectiveType === 'between' && (
                              <>
                                {(isContinuous || !objective.targetId) && (
                                  <>
                                    <input
                                      type="number"
                                      step="any"
                                      value={objective.value1}
                                      onChange={(e) => updateObjective(objective.id, 'value1', e.target.value)}
                                      placeholder="Min"
                                      className="value-field"
                                      style={{ width: '85px' }}
                                    />
                                    <span style={{ color: theme.textMuted, fontSize: '10px' }}>–</span>
                                    <input
                                      type="number"
                                      step="any"
                                      value={objective.value2}
                                      onChange={(e) => updateObjective(objective.id, 'value2', e.target.value)}
                                      placeholder="Max"
                                      className="value-field"
                                      style={{ width: '85px' }}
                                    />
                                  </>
                                )}
                                {isOrdinal && objective.targetLevels && (
                                  <>
                                    <select
                                      value={objective.value1}
                                      onChange={(e) => updateObjective(objective.id, 'value1', e.target.value)}
                                      className="objective-field"
                                      style={{ width: '100px', fontSize: '10px', padding: '5px 6px' }}
                                    >
                                      <option value="">Min</option>
                                      {objective.targetLevels.map((level, idx) => (
                                        <option key={idx} value={level}>{level}</option>
                                      ))}
                                    </select>
                                    <span style={{ color: theme.textMuted, fontSize: '10px' }}>–</span>
                                    <select
                                      value={objective.value2}
                                      onChange={(e) => updateObjective(objective.id, 'value2', e.target.value)}
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
                              <span style={{ fontSize: '11px', color: theme.textMuted, fontStyle: 'italic' }}>
                                Select type
                              </span>
                            )}
                          </div>

                          {/* Tags */}
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexWrap: 'wrap',
                            minWidth: 0,
                          }}>
                            {objective.tags.map(tag => (
                              <ObjectiveTag
                                key={tag.id}
                                tag={tag}
                                onRemove={() => removeTagFromObjective(objective.id, tag.id)}
                                small
                              />
                            ))}
                            
                            <div style={{ position: 'relative' }}>
                              <input
                                type="text"
                                value={tagSearchQuery[objective.id] || ''}
                                onChange={(e) => {
                                  setTagSearchQuery(prev => ({ ...prev, [objective.id]: e.target.value }));
                                  setActiveTagAutocomplete(objective.id);
                                  setTagAutocompleteIndex(0);
                                }}
                                onFocus={() => {
                                  setActiveTagAutocomplete(objective.id);
                                  setTagAutocompleteIndex(0);
                                }}
                                onBlur={() => setTimeout(() => {
                                  setActiveTagAutocomplete(null);
                                  setTagAutocompleteIndex(0);
                                }, 150)}
                                onKeyDown={(e) => {
                                  const suggestions = getTagSuggestions(tagSearchQuery[objective.id] || '', objective.tags);
                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setTagAutocompleteIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setTagAutocompleteIndex(prev => Math.max(prev - 1, 0));
                                  } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (suggestions.length > 0) {
                                      addTagToObjective(objective.id, suggestions[tagAutocompleteIndex]);
                                    } else if ((tagSearchQuery[objective.id] || '').trim()) {
                                      const newTag = {
                                        id: `tag-${Date.now()}`,
                                        name: (tagSearchQuery[objective.id] || '').trim(),
                                        color: tagColors[availableTags.length % tagColors.length],
                                      };
                                      setAvailableTags(prev => [...prev, newTag]);
                                      addTagToObjective(objective.id, newTag);
                                    }
                                  }
                                }}
                                placeholder="+tag"
                                className="tag-input"
                                style={{ width: '50px' }}
                              />
                              
                              {activeTagAutocomplete === objective.id && (() => {
                                const suggestions = getTagSuggestions(tagSearchQuery[objective.id] || '', objective.tags);
                                const query = (tagSearchQuery[objective.id] || '').trim();
                                const showCreateOption = query && !suggestions.find(t => t.name.toLowerCase() === query.toLowerCase());
                                
                                if (suggestions.length === 0 && !showCreateOption) return null;
                                
                                return (
                                  <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    minWidth: '140px',
                                    marginTop: '4px',
                                    background: theme.surfaceElevated,
                                    border: `1px solid ${theme.borderStrong}`,
                                    borderRadius: '6px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                    animation: 'fadeIn 0.1s ease-out',
                                  }}>
                                    {suggestions.map((tag, idx) => (
                                      <div
                                        key={tag.id}
                                        onClick={() => addTagToObjective(objective.id, tag)}
                                        style={{
                                          padding: '6px 10px',
                                          cursor: 'pointer',
                                          background: idx === tagAutocompleteIndex ? `${theme.border}` : 'transparent',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                        }}
                                        onMouseEnter={() => setTagAutocompleteIndex(idx)}
                                      >
                                        <div style={{
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '2px',
                                          background: tag.color,
                                        }} />
                                        <span style={{ fontSize: '11px', color: theme.text }}>{tag.name}</span>
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
                                          addTagToObjective(objective.id, newTag);
                                        }}
                                        style={{
                                          padding: '6px 10px',
                                          cursor: 'pointer',
                                          background: suggestions.length === 0 ? `${theme.border}` : 'transparent',
                                          borderTop: suggestions.length > 0 ? `1px solid ${theme.border}` : 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
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
                            onClick={() => deleteObjective(objective.id)}
                            style={{
                              padding: '5px',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: theme.textMuted,
                              opacity: hoveredRow === objective.id ? 1 : 0,
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
                              e.currentTarget.style.color = theme.textMuted;
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - Library */}
          <div style={{
            flex: '1 1 32%',
            display: 'flex',
            flexDirection: 'column',
            background: theme.sidebarBg,
            minWidth: 0,
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${theme.borderLight}`,
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
                  color: theme.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  Outcomes & Combinations
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{
                    padding: '5px 10px',
                    fontSize: '10px',
                    fontWeight: 600,
                    background: 'rgba(244, 114, 182, 0.1)',
                    color: '#F472B6',
                    border: '1px solid rgba(244, 114, 182, 0.25)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Outcome
                  </button>
                  <button style={{
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
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Combo
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" 
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search outcomes & combinations..."
                  className="objective-field"
                  style={{ width: '100%', paddingLeft: '32px', fontSize: '12px', background: `${theme.cardBg}` }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['All', 'Combination', 'Analytical', 'Sensory', 'Consumer', 'Other'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLibraryFilter(filter)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '10px',
                      fontWeight: 500,
                      background: libraryFilter === filter ? `rgba(${themeColorRgb}, 0.15)` : theme.inputBg,
                      color: libraryFilter === filter ? themeColor : theme.textTertiary,
                      border: libraryFilter === filter ? `1px solid rgba(${themeColorRgb}, 0.3)` : `1px solid ${theme.inputBorder}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {filter === 'Combination' ? 'Combos' : filter === 'Analytical' ? 'Analyt.' : filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {getFilteredLibraryItems().map((item) => (
                <div
                  key={item.id}
                  className="library-item"
                  onClick={() => {
                    const newId = `objective-${Date.now()}`;
                    const newObjective = {
                      id: newId,
                      targetId: item.id,
                      targetName: item.name,
                      targetSourceType: item.sourceType,
                      targetOutcomeType: item.outcomeType,
                      targetVariableType: item.variableType,
                      targetLevels: item.levels || null,
                      objectiveType: null,
                      value1: '',
                      value2: '',
                      successCriteria1: '',
                      successCriteria2: '',
                      showSuccessCriteria: false,
                      tags: [],
                    };
                    setObjectives(prev => [...prev, newObjective]);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>{item.name}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <OutcomeTypeTag type={item.outcomeType} small />
                      <VariableTypeTag type={item.variableType} small />
                    </div>
                  </div>
                  {item.description && (
                    <p style={{ margin: 0, fontSize: '11px', color: theme.textTertiary }}>{item.description}</p>
                  )}
                  {item.levels && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {item.levels.slice(0, 3).map((level, i) => (
                        <span key={i} style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: `${theme.borderLight}`,
                          fontSize: '9px',
                          color: theme.textSecondary,
                        }}>
                          {level}
                        </span>
                      ))}
                      {item.levels.length > 3 && (
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: `${theme.borderLight}`,
                          fontSize: '9px',
                          color: theme.textTertiary,
                        }}>
                          +{item.levels.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {getFilteredLibraryItems().length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>
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
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          background: theme.cardBgDark,
        }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: theme.textMuted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ padding: '2px 6px', borderRadius: '4px', background: `${theme.borderLight}`, border: `1px solid ${theme.inputBorder}`, fontSize: '10px' }}>⌘N</kbd>
              New Objective
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
                color: theme.textTertiary,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Data is already saved to context automatically
                // Just close the modal if we have objectives
                if (objectives.length > 0) {
                  onClose();
                }
              }}
              disabled={objectives.length === 0}
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 600,
                background: objectives.length > 0 
                  ? `linear-gradient(135deg, ${themeColor} 0%, #3B82F6 100%)`
                  : `${theme.borderLight}`,
                color: objectives.length > 0 ? '#ffffff' : theme.textMuted,
                border: objectives.length > 0 ? 'none' : `1px solid ${theme.borderLight}`,
                borderRadius: '8px',
                cursor: objectives.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: objectives.length > 0 ? `0 2px 16px rgba(${themeColorRgb}, 0.35)` : 'none',
              }}
            >
              Save Objectives
            </button>
          </div>
        </div>
      </div>

      {/* Create Tag Modal */}
      {showTagModal && (
        <>
          <div 
            onClick={() => { setShowTagModal(false); setNewTagName(''); }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1001,
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
            background: theme.surfaceElevated,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            zIndex: 1002,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: theme.text }}>
                Create New Tag
              </h3>
              <button
                onClick={() => { setShowTagModal(false); setNewTagName(''); }}
                style={{ padding: '4px', background: `${theme.borderLight}`, border: 'none', borderRadius: '4px', cursor: 'pointer', color: theme.textTertiary }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., Primary, Cost Focus"
                  autoFocus
                  className="objective-field"
                  style={{ width: '100%' }}
                  onKeyDown={(e) => { if (e.key === 'Enter') createNewTag(); }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
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
                        boxShadow: newTagColor === color ? `0 0 12px ${color}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {newTagName && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Preview
                  </label>
                  <ObjectiveTag tag={{ name: newTagName, color: newTagColor }} small={false} />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setShowTagModal(false); setNewTagName(''); }}
                  style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 500, background: 'transparent', color: theme.textTertiary, border: `1px solid ${theme.borderLight}`, borderRadius: '6px', cursor: 'pointer' }}
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
                    background: newTagName.trim() ? `linear-gradient(135deg, ${themeColor} 0%, #3B82F6 100%)` : `${theme.borderLight}`,
                    color: newTagName.trim() ? '#ffffff' : theme.textMuted,
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

export default ObjectivesModal;
