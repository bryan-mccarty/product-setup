import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

const CombinationsModal = ({ onClose }) => {
  const { combinations, setCombinations, inputs } = useData();
  const { theme, isDarkMode } = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusNewCombination, setFocusNewCombination] = useState(null);
  const [directEntryMode, setDirectEntryMode] = useState({}); // { [comboId]: boolean }
  const [directEntryText, setDirectEntryText] = useState({}); // { [comboId]: string }
  const [mentionState, setMentionState] = useState({ active: false, comboId: null, query: '', position: 0 });
  const [mentionIndex, setMentionIndex] = useState(0);
  const directEntryRefs = useRef({});

  // Get available inputs from context
  const availableInputs = inputs;

  // Theme color for Combinations - Purple
  const themeColor = '#A78BFA';
  const themeColorRgb = '167, 139, 250';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleAddNew();
      }
      if (e.key === 'Escape') {
        if (mentionState.active) {
          setMentionState({ active: false, comboId: null, query: '', position: 0 });
          setMentionIndex(0);
        } else if (expandedId) {
          setExpandedId(null);
        } else if (onClose) {
          onClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedId, mentionState.active]);

  const handleAddNew = () => {
    const newId = `combo-${Date.now()}`;
    const newCombination = {
      id: newId,
      name: '',
      description: '',
      terms: [], // { inputId, inputName, coefficient }
    };
    setCombinations(prev => [...prev, newCombination]);
    setExpandedId(newId);
    setFocusNewCombination(newId);
  };

  const updateCombination = (id, field, value) => {
    setCombinations(prev => prev.map(combo => {
      if (combo.id !== id) return combo;
      return { ...combo, [field]: value };
    }));
  };

  const addTermToCombination = (comboId, input) => {
    setCombinations(prev => prev.map(combo => {
      if (combo.id !== comboId) return combo;
      // Don't add if already exists
      if (combo.terms.find(t => t.inputId === input.id)) return combo;
      return {
        ...combo,
        terms: [...combo.terms, { inputId: input.id, inputName: input.name, coefficient: 1 }]
      };
    }));
    setSearchQuery('');
  };

  const updateTermCoefficient = (comboId, inputId, coefficient) => {
    setCombinations(prev => prev.map(combo => {
      if (combo.id !== comboId) return combo;
      return {
        ...combo,
        terms: combo.terms.map(term => 
          term.inputId === inputId ? { ...term, coefficient: parseFloat(coefficient) || 0 } : term
        )
      };
    }));
  };

  const removeTerm = (comboId, inputId) => {
    setCombinations(prev => prev.map(combo => {
      if (combo.id !== comboId) return combo;
      return {
        ...combo,
        terms: combo.terms.filter(term => term.inputId !== inputId)
      };
    }));
  };

  const deleteCombination = (id) => {
    setCombinations(prev => prev.filter(combo => combo.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  // Toggle direct entry mode for a combination
  const toggleDirectEntry = (comboId) => {
    const isEntering = !directEntryMode[comboId];
    setDirectEntryMode(prev => ({ ...prev, [comboId]: isEntering }));
    
    if (isEntering) {
      // Convert current terms to text format
      const combo = combinations.find(c => c.id === comboId);
      const text = termsToText(combo?.terms || []);
      setDirectEntryText(prev => ({ ...prev, [comboId]: text }));
    } else {
      // Parse text back to terms
      const text = directEntryText[comboId] || '';
      const parsed = parseDirectEntry(text);
      if (parsed.valid) {
        updateCombination(comboId, 'terms', parsed.terms);
      }
    }
    setMentionState({ active: false, comboId: null, query: '', position: 0 });
  };

  // Convert terms array to readable text
  const termsToText = (terms) => {
    if (terms.length === 0) return '';
    return terms.map((term, i) => {
      const coef = term.coefficient;
      const sign = i === 0 ? (coef < 0 ? '-' : '') : (coef >= 0 ? ' + ' : ' - ');
      const absCoef = Math.abs(coef);
      const coefStr = absCoef === 1 ? '' : `${absCoef}*`;
      return `${sign}${coefStr}@${term.inputName}`;
    }).join('');
  };

  // Parse direct entry text into terms
  const parseDirectEntry = (text) => {
    const terms = [];
    // Match patterns like: 0.5*@Sugar, @Flour, -0.3*@Butter, + 2*@Eggs
    const regex = /([+-]?\s*\d*\.?\d*)\s*\*?\s*@([A-Za-z][A-Za-z0-9\s]*)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      let coefStr = match[1].replace(/\s/g, '');
      let inputName = match[2].trim();
      
      // Find the input
      const input = availableInputs.find(inp => 
        inp.name.toLowerCase() === inputName.toLowerCase()
      );
      
      if (input) {
        let coefficient = 1;
        if (coefStr === '' || coefStr === '+') coefficient = 1;
        else if (coefStr === '-') coefficient = -1;
        else coefficient = parseFloat(coefStr) || 1;
        
        terms.push({
          inputId: input.id,
          inputName: input.name,
          coefficient
        });
      }
    }
    
    return { valid: terms.length > 0 || text.trim() === '', terms };
  };

  // Handle direct entry text change with @mention detection
  const handleDirectEntryChange = (comboId, value) => {
    setDirectEntryText(prev => ({ ...prev, [comboId]: value }));
    
    // Check for @ trigger
    const textarea = directEntryRefs.current[comboId];
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = value.substring(0, cursorPos);
      const atIndex = textBeforeCursor.lastIndexOf('@');
      
      if (atIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(atIndex + 1);
        // Check if we're still in a mention (no spaces or operators after @)
        if (!/[\s+\-*]/.test(textAfterAt) || textAfterAt === '') {
          setMentionState({
            active: true,
            comboId,
            query: textAfterAt,
            position: atIndex
          });
          setMentionIndex(0);
          return;
        }
      }
    }
    setMentionState({ active: false, comboId: null, query: '', position: 0 });
  };

  // Get filtered inputs for mention autocomplete
  const getMentionSuggestions = () => {
    if (!mentionState.active) return [];
    return availableInputs.filter(input =>
      input.name.toLowerCase().includes(mentionState.query.toLowerCase())
    ).slice(0, 6);
  };

  // Insert selected mention
  const insertMention = (comboId, input) => {
    const currentText = directEntryText[comboId] || '';
    const beforeAt = currentText.substring(0, mentionState.position);
    const afterCursor = currentText.substring(mentionState.position + mentionState.query.length + 1);
    
    const newText = `${beforeAt}@${input.name}${afterCursor}`;
    setDirectEntryText(prev => ({ ...prev, [comboId]: newText }));
    setMentionState({ active: false, comboId: null, query: '', position: 0 });
    setMentionIndex(0);
    
    // Refocus and position cursor
    setTimeout(() => {
      const textarea = directEntryRefs.current[comboId];
      if (textarea) {
        textarea.focus();
        const newPos = beforeAt.length + input.name.length + 1;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Handle keyboard navigation in mention dropdown
  const handleDirectEntryKeyDown = (e, comboId) => {
    if (!mentionState.active) return;
    
    const suggestions = getMentionSuggestions();
    if (suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(comboId, suggestions[mentionIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setMentionState({ active: false, comboId: null, query: '', position: 0 });
    }
  };

  const duplicateCombination = (combo) => {
    const newId = `combo-${Date.now()}`;
    const newCombo = {
      ...combo,
      id: newId,
      name: `${combo.name} (copy)`,
    };
    setCombinations(prev => [...prev, newCombo]);
    setExpandedId(newId);
  };

  // Filter available inputs based on search and exclude already added
  const getFilteredInputs = (comboId) => {
    const combo = combinations.find(c => c.id === comboId);
    const addedIds = combo?.terms.map(t => t.inputId) || [];
    
    return availableInputs.filter(input => {
      const matchesSearch = !searchQuery || 
        input.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        input.inputType.toLowerCase().includes(searchQuery.toLowerCase());
      const notAdded = !addedIds.includes(input.id);
      return matchesSearch && notAdded;
    });
  };

  // Format equation preview
  const formatEquation = (terms) => {
    if (terms.length === 0) return 'No terms defined';
    return terms.map((term, i) => {
      const coef = term.coefficient;
      const absCoef = Math.abs(coef);
      // Format coefficient - show decimals if present, but clean up trailing zeros
      const formatCoef = (num) => {
        if (num === 1) return '';
        const str = num.toString();
        // If it's a clean integer, show as integer
        if (Number.isInteger(num)) return str;
        // Otherwise show up to 4 decimal places, trimming trailing zeros
        return parseFloat(num.toFixed(4)).toString();
      };
      
      const coefStr = formatCoef(absCoef);
      const sign = i === 0 ? (coef < 0 ? '-' : '') : (coef >= 0 ? ' + ' : ' − ');
      const mult = coefStr ? '·' : '';
      return `${sign}${coefStr}${mult}${term.inputName}`;
    }).join('');
  };

  // Focus management
  const nameInputRefs = useRef({});
  useEffect(() => {
    if (focusNewCombination && nameInputRefs.current[focusNewCombination]) {
      setTimeout(() => {
        nameInputRefs.current[focusNewCombination]?.focus();
      }, 100);
      setFocusNewCombination(null);
    }
  }, [focusNewCombination, combinations]);

  const InputTypeChip = ({ type }) => {
    const colors = {
      'Ingredient': { bg: 'rgba(45, 212, 191, 0.12)', text: '#2DD4BF', border: 'rgba(45, 212, 191, 0.25)' },
      'Processing': { bg: 'rgba(251, 146, 60, 0.12)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.25)' },
    };
    const c = colors[type] || colors['Ingredient'];
    return (
      <span style={{
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '9px',
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        {type}
      </span>
    );
  };

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
        
        @keyframes cardExpand {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 400px; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes termAppear {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: theme.cardBg;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: theme.scrollbarThumb;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: theme.borderStrong;
        }
        
        input::placeholder {
          color: #52525b;
        }
        
        .combo-field {
          padding: 8px 12px;
          font-size: 13px;
          background: theme.inputBg;
          border: 1px solid ${theme.inputBorder};
          border-radius: 6px;
          color: #E4E4E7;
          outline: none;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .combo-field:focus {
          border-color: rgba(167, 139, 250, 0.5);
          background: rgba(167, 139, 250, 0.05);
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
        }
        .combo-field:hover:not(:focus) {
          border-color: theme.borderStrong;
        }
        
        .coef-input {
          width: 72px;
          padding: 4px 6px;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          background: theme.borderLight;
          border: 1px solid ${theme.borderLight};
          border-radius: 4px;
          color: ${themeColor};
          text-align: right;
          outline: none;
          transition: all 0.15s ease;
        }
        .coef-input:focus {
          border-color: rgba(167, 139, 250, 0.5);
          background: rgba(167, 139, 250, 0.08);
        }
        
        .input-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: theme.borderLight;
          border: 1px solid ${theme.inputBorder};
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.12s ease;
        }
        .input-chip:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: rgba(167, 139, 250, 0.3);
        }
        
        .term-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 6px 4px 8px;
          background: rgba(167, 139, 250, 0.08);
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 6px;
          animation: termAppear 0.2s ease-out;
        }
        
        .direct-entry-textarea {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          background: theme.cardBgDark;
          border: 1px solid ${theme.borderLight};
          border-radius: 8px;
          color: #E4E4E7;
          outline: none;
          resize: vertical;
          line-height: 1.6;
          transition: all 0.15s ease;
        }
        .direct-entry-textarea:focus {
          border-color: rgba(167, 139, 250, 0.4);
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
        }
        .direct-entry-textarea::placeholder {
          color: #3f3f46;
        }
        
        .mention-dropdown {
          position: absolute;
          left: 12px;
          right: 12px;
          background: #1a1a22;
          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          z-index: 100;
          overflow: hidden;
          animation: fadeIn 0.1s ease-out;
        }
        
        .mention-item {
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.1s ease;
        }
        .mention-item:hover, .mention-item.active {
          background: rgba(167, 139, 250, 0.1);
        }
        .mention-item.active {
          border-left: 2px solid ${themeColor};
        }
      `}</style>

      {/* Main Modal */}
      <div style={{
        width: '720px',
        maxWidth: '95vw',
        height: '640px',
        maxHeight: '90vh',
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
              {/* Grid/Combinations icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
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
                Linear Combinations
              </h2>
              <p style={{
                margin: '3px 0 0 0',
                fontSize: '12px',
                color: theme.textTertiary,
              }}>
                {combinations.length} combination{combinations.length !== 1 ? 's' : ''} • Define weighted sums of continuous inputs
              </p>
            </div>
          </div>
          
          <button
            onClick={handleAddNew}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${themeColor} 0%, #8B5CF6 100%)`,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              boxShadow: `0 2px 16px rgba(${themeColorRgb}, 0.35)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 4px 20px rgba(${themeColorRgb}, 0.45)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 2px 16px rgba(${themeColorRgb}, 0.35)`;
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Combination
            <kbd style={{
              padding: '2px 6px',
              borderRadius: '4px',
              background: theme.cardBgDark,
              fontSize: '10px',
              fontWeight: 500,
            }}>⌘N</kbd>
          </button>
        </div>

        {/* Content Area */}
        <div className="custom-scrollbar" style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          minHeight: 0,
        }}>
          {combinations.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '20px',
              padding: '40px',
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                background: `linear-gradient(135deg, rgba(${themeColorRgb}, 0.08) 0%, rgba(${themeColorRgb}, 0.02) 100%)`,
                border: `1px dashed rgba(${themeColorRgb}, 0.25)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="1.5" opacity="0.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: theme.textSecondary,
                }}>
                  No combinations yet
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: theme.textMuted,
                  maxWidth: '320px',
                  lineHeight: 1.5,
                }}>
                  Create linear combinations like <span style={{ color: themeColor, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>0.5×Sugar + 0.3×Butter</span> to use in constraints and objectives.
                </p>
              </div>
              <button
                onClick={handleAddNew}
                style={{
                  padding: '12px 24px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: `rgba(${themeColorRgb}, 0.1)`,
                  color: themeColor,
                  border: `1px solid rgba(${themeColorRgb}, 0.25)`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `rgba(${themeColorRgb}, 0.15)`;
                  e.currentTarget.style.borderColor = `rgba(${themeColorRgb}, 0.4)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `rgba(${themeColorRgb}, 0.1)`;
                  e.currentTarget.style.borderColor = `rgba(${themeColorRgb}, 0.25)`;
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create your first combination
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {combinations.map((combo) => {
                const isExpanded = expandedId === combo.id;
                const filteredInputs = getFilteredInputs(combo.id);
                
                return (
                  <div
                    key={combo.id}
                    style={{
                      background: isExpanded 
                        ? `linear-gradient(135deg, rgba(${themeColorRgb}, 0.06) 0%, rgba(${themeColorRgb}, 0.02) 100%)`
                        : `${theme.cardBg}`,
                      border: `1px solid ${isExpanded ? `rgba(${themeColorRgb}, 0.25)` : `${theme.border}`}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Card Header - Always visible */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : combo.id)}
                      style={{
                        padding: '14px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isExpanded) e.currentTarget.style.background = `${theme.cardBg}`;
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: `rgba(${themeColorRgb}, 0.12)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: 600, 
                            color: combo.name ? theme.text : theme.textMuted,
                            marginBottom: '2px',
                          }}>
                            {combo.name || 'Untitled combination'}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: theme.textTertiary,
                            fontFamily: combo.terms.length > 0 ? "'JetBrains Mono', monospace" : 'inherit',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {formatEquation(combo.terms)}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: `${theme.borderLight}`,
                          fontSize: '11px',
                          color: theme.textTertiary,
                          fontWeight: 500,
                        }}>
                          {combo.terms.length} term{combo.terms.length !== 1 ? 's' : ''}
                        </span>
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#71717A" 
                          strokeWidth="2"
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div style={{
                        padding: '0 16px 16px 16px',
                        borderTop: `1px solid ${theme.borderLight}`,
                        animation: 'fadeIn 0.2s ease-out',
                      }}>
                        {/* Name & Description */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '12px',
                          marginTop: '16px',
                        }}>
                          <div>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '11px', 
                              fontWeight: 600, 
                              color: theme.textTertiary, 
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '6px',
                            }}>
                              Name
                            </label>
                            <input
                              ref={el => nameInputRefs.current[combo.id] = el}
                              type="text"
                              value={combo.name}
                              onChange={(e) => updateCombination(combo.id, 'name', e.target.value)}
                              placeholder="e.g., Total Sugar Content"
                              className="combo-field"
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '11px', 
                              fontWeight: 600, 
                              color: theme.textTertiary, 
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '6px',
                            }}>
                              Description <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={combo.description}
                              onChange={(e) => updateCombination(combo.id, 'description', e.target.value)}
                              placeholder="What does this combination represent?"
                              className="combo-field"
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>

                        {/* Terms Section */}
                        <div style={{ marginTop: '20px' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            marginBottom: '12px',
                          }}>
                            <label style={{ 
                              fontSize: '11px', 
                              fontWeight: 600, 
                              color: theme.textTertiary, 
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}>
                              Terms
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {combo.terms.length > 0 && !directEntryMode[combo.id] && (
                                <div style={{
                                  fontSize: '11px',
                                  color: theme.textMuted,
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}>
                                  = Σ (coef × input)
                                </div>
                              )}
                              {/* Direct Entry Toggle */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDirectEntry(combo.id);
                                }}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  background: directEntryMode[combo.id] 
                                    ? `rgba(${themeColorRgb}, 0.15)` 
                                    : `${theme.borderLight}`,
                                  color: directEntryMode[combo.id] ? themeColor : theme.textTertiary,
                                  border: `1px solid ${directEntryMode[combo.id] 
                                    ? `rgba(${themeColorRgb}, 0.3)` 
                                    : `${theme.inputBorder}`}`,
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.03em',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                </svg>
                                Direct Entry
                              </button>
                            </div>
                          </div>

                          {directEntryMode[combo.id] ? (
                            /* Direct Entry Mode */
                            <div style={{ position: 'relative' }}>
                              <textarea
                                ref={el => directEntryRefs.current[combo.id] = el}
                                value={directEntryText[combo.id] || ''}
                                onChange={(e) => handleDirectEntryChange(combo.id, e.target.value)}
                                onKeyDown={(e) => handleDirectEntryKeyDown(e, combo.id)}
                                onBlur={() => {
                                  // Parse on blur if not selecting from dropdown
                                  setTimeout(() => {
                                    if (!mentionState.active) {
                                      const parsed = parseDirectEntry(directEntryText[combo.id] || '');
                                      if (parsed.valid) {
                                        updateCombination(combo.id, 'terms', parsed.terms);
                                      }
                                    }
                                  }, 150);
                                }}
                                placeholder="Type equation using @ to reference inputs...&#10;Example: 0.5*@Sugar + 0.22*@Butter - 0.08*@Salt"
                                className="direct-entry-textarea"
                                onClick={(e) => e.stopPropagation()}
                              />
                              
                              {/* Mention Autocomplete Dropdown */}
                              {mentionState.active && mentionState.comboId === combo.id && (() => {
                                const suggestions = getMentionSuggestions();
                                if (suggestions.length === 0) return null;
                                
                                return (
                                  <div className="mention-dropdown" style={{ top: '100%', marginTop: '4px' }}>
                                    <div style={{
                                      padding: '6px 12px',
                                      borderBottom: `1px solid ${theme.border}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}>
                                      <span style={{ fontSize: '10px', color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Select input
                                      </span>
                                      <span style={{ fontSize: '10px', color: theme.textMuted }}>
                                        ↑↓ navigate · Enter/Tab select
                                      </span>
                                    </div>
                                    {suggestions.map((input, idx) => (
                                      <div
                                        key={input.id}
                                        className={`mention-item ${idx === mentionIndex ? 'active' : ''}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          insertMention(combo.id, input);
                                        }}
                                        onMouseEnter={() => setMentionIndex(idx)}
                                      >
                                        <span style={{ fontSize: '13px', fontWeight: 500, color: theme.text }}>
                                          @{input.name}
                                        </span>
                                        <InputTypeChip type={input.inputType} />
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                              
                              <div style={{
                                marginTop: '8px',
                                padding: '8px 10px',
                                background: `${theme.cardBg}`,
                                borderRadius: '6px',
                                fontSize: '11px',
                                color: theme.textMuted,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                              }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <kbd style={{ 
                                    padding: '1px 4px', 
                                    background: `${theme.border}`, 
                                    borderRadius: '3px',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '11px',
                                    color: themeColor,
                                  }}>@</kbd>
                                  to insert input
                                </span>
                                <span>Use <code style={{ color: theme.textTertiary }}>+</code> <code style={{ color: theme.textTertiary }}>-</code> <code style={{ color: theme.textTertiary }}>*</code> for operators</span>
                              </div>
                            </div>
                          ) : (
                            /* Visual Builder Mode */
                            <>
                              {/* Current Terms */}
                              {combo.terms.length > 0 && (
                                <div style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '6px',
                                  marginBottom: '12px',
                                  alignItems: 'center',
                                }}>
                                  {combo.terms.map((term, idx) => (
                                    <React.Fragment key={term.inputId}>
                                      {idx > 0 && (
                                        <span style={{ 
                                          color: theme.textMuted, 
                                          fontSize: '14px',
                                          fontWeight: 500,
                                          padding: '0 2px',
                                        }}>+</span>
                                      )}
                                      <div className="term-pill">
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={term.coefficient}
                                          onChange={(e) => updateTermCoefficient(combo.id, term.inputId, e.target.value)}
                                          className="coef-input"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <span style={{ 
                                          fontSize: '11px', 
                                          color: theme.textTertiary,
                                          fontFamily: "'JetBrains Mono', monospace",
                                        }}>
                                          ·
                                        </span>
                                        <span style={{ 
                                          fontSize: '12px', 
                                          color: theme.textSecondary,
                                          fontWeight: 500,
                                        }}>
                                          {term.inputName}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeTerm(combo.id, term.inputId);
                                          }}
                                          style={{
                                            padding: '2px',
                                            marginLeft: '2px',
                                            background: `${theme.border}`,
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: theme.textMuted,
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'all 0.15s ease',
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                            e.currentTarget.style.color = '#EF4444';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = `${theme.border}`;
                                            e.currentTarget.style.color = theme.textMuted;
                                          }}
                                          title="Remove term"
                                        >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M3 6h18" />
                                            <path d="M8 6V4h8v2" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                          </svg>
                                        </button>
                                      </div>
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}

                          {/* Add Input Search */}
                          <div style={{ position: 'relative' }}>
                            <div style={{ position: 'relative' }}>
                              <svg 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="#52525b" 
                                strokeWidth="2" 
                                style={{ 
                                  position: 'absolute', 
                                  left: '12px', 
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search inputs to add..."
                                className="combo-field"
                                style={{ 
                                  width: '100%', 
                                  paddingLeft: '36px',
                                  background: `${theme.cardBg}`,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            {/* Quick-add chips */}
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '6px',
                              marginTop: '10px',
                              maxHeight: '120px',
                              overflowY: 'auto',
                            }}>
                              {filteredInputs.slice(0, 12).map(input => (
                                <div
                                  key={input.id}
                                  className="input-chip"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addTermToCombination(combo.id, input);
                                  }}
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                  <span style={{ fontSize: '12px', color: theme.text, fontWeight: 500 }}>
                                    {input.name}
                                  </span>
                                  <InputTypeChip type={input.inputType} />
                                </div>
                              ))}
                              {filteredInputs.length === 0 && (
                                <span style={{ fontSize: '12px', color: theme.textMuted, padding: '8px 0' }}>
                                  {searchQuery ? 'No matching inputs' : 'All inputs added'}
                                </span>
                              )}
                            </div>
                          </div>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '20px',
                          paddingTop: '16px',
                          borderTop: `1px solid ${theme.borderLight}`,
                        }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateCombination(combo);
                              }}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 500,
                                background: `${theme.borderLight}`,
                                color: theme.textTertiary,
                                border: `1px solid ${theme.inputBorder}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${theme.border}`;
                                e.currentTarget.style.color = theme.textSecondary;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `${theme.borderLight}`;
                                e.currentTarget.style.color = theme.textTertiary;
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                              Duplicate
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCombination(combo.id);
                              }}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 500,
                                background: 'transparent',
                                color: theme.textTertiary,
                                border: `1px solid ${theme.inputBorder}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                e.currentTarget.style.color = '#EF4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = `${theme.inputBorder}`;
                                e.currentTarget.style.color = theme.textTertiary;
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                              Delete
                            </button>
                          </div>
                          
                          {/* Equation Preview */}
                          {combo.terms.length > 0 && (
                            <div style={{
                              padding: '8px 12px',
                              background: theme.cardBgDark,
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontFamily: "'JetBrains Mono', monospace",
                              color: themeColor,
                              maxWidth: '280px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {formatEquation(combo.terms)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '11px',
            color: theme.textMuted,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ 
                padding: '2px 6px', 
                borderRadius: '4px', 
                background: `${theme.borderLight}`, 
                border: `1px solid ${theme.inputBorder}`, 
                fontSize: '10px' 
              }}>⌘N</kbd>
              New
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ 
                padding: '2px 6px', 
                borderRadius: '4px', 
                background: `${theme.borderLight}`, 
                border: `1px solid ${theme.inputBorder}`, 
                fontSize: '10px' 
              }}>Esc</kbd>
              Collapse
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
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.borderStrong;
                e.currentTarget.style.color = theme.textSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.borderLight;
                e.currentTarget.style.color = theme.textTertiary;
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (combinations.length > 0) {
                  onClose();
                }
              }}
              disabled={combinations.length === 0}
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 600,
                background: combinations.length > 0
                  ? `linear-gradient(135deg, ${themeColor} 0%, #8B5CF6 100%)`
                  : `${theme.borderLight}`,
                color: combinations.length > 0 ? '#ffffff' : theme.textMuted,
                border: combinations.length > 0 ? 'none' : `1px solid ${theme.borderLight}`,
                borderRadius: '8px',
                cursor: combinations.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                boxShadow: combinations.length > 0 ? `0 2px 16px rgba(${themeColorRgb}, 0.35)` : 'none',
              }}
              onMouseEnter={(e) => {
                if (combinations.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 4px 20px rgba(${themeColorRgb}, 0.45)`;
                }
              }}
              onMouseLeave={(e) => {
                if (combinations.length > 0) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 2px 16px rgba(${themeColorRgb}, 0.35)`;
                }
              }}
            >
              Save Combinations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinationsModal;
