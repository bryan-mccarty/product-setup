import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

const InputsModal = ({ onClose }) => {
  // Get inputs and input library from global context
  const { inputs, setInputs, inputLibrary } = useData();
  const { theme, isDarkMode } = useTheme();

  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLibraryItems, setSelectedLibraryItems] = useState([]);
  const [focusNewRow, setFocusNewRow] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Autocomplete state
  const [activeAutocomplete, setActiveAutocomplete] = useState(null);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);

  // Filter library items for autocomplete
  const getAutocompleteSuggestions = (query) => {
    if (!query || query.length < 1) return [];
    const lowerQuery = query.toLowerCase();
    return inputLibrary.filter(item =>
      item.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  };

  // Apply selected library item to input row
  const applyLibraryItem = (inputId, libraryItem) => {
    setInputs(prev => prev.map(input => {
      if (input.id !== inputId) return input;
      return {
        ...input,
        name: libraryItem.name,
        inputType: libraryItem.inputType,
        variableType: libraryItem.variableType,
        description: libraryItem.description || '',
        levels: libraryItem.levels || [],
        levelsText: libraryItem.levels?.join(', ') || '',
        cost: libraryItem.cost || null,
      };
    }));
    setActiveAutocomplete(null);
    setAutocompleteIndex(0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleAddNew();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        setShowLibrary(true);
      }
      if (e.key === 'Escape') {
        if (activeAutocomplete) {
          setActiveAutocomplete(null);
          setAutocompleteIndex(0);
        } else if (showLibrary) {
          setShowLibrary(false);
          setSelectedLibraryItems([]);
          setSearchQuery('');
        } else if (onClose) {
          onClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLibrary, activeAutocomplete]);

  const handleAddNew = () => {
    const newId = `input-${Date.now()}`;
    const newInput = {
      id: newId,
      name: '',
      inputType: 'Ingredient',
      variableType: 'Continuous',
      description: '',
      levels: [],
      levelsText: '',
      cost: null,
    };
    setInputs(prev => [...prev, newInput]);
    setFocusNewRow(newId);
  };

  const updateInput = (id, field, value) => {
    setInputs(prev => prev.map(input => {
      if (input.id !== id) return input;
      
      const updated = { ...input, [field]: value };
      
      // If changing to Ingredient, force Continuous
      if (field === 'inputType' && value === 'Ingredient') {
        updated.variableType = 'Continuous';
        updated.levels = [];
        updated.levelsText = '';
      }
      
      // If changing variable type
      if (field === 'variableType') {
        if (value === 'Continuous') {
          updated.levels = [];
          updated.levelsText = '';
        } else {
          updated.cost = null;
        }
      }
      
      return updated;
    }));
  };

  const deleteInput = (id) => {
    setInputs(prev => prev.filter(input => input.id !== id));
  };

  const toggleLibraryItem = (item) => {
    setSelectedLibraryItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const importSelected = () => {
    const newInputs = selectedLibraryItems.map(item => ({
      ...item,
      id: `imported-${Date.now()}-${item.id}`,
    }));
    setInputs(prev => [...prev, ...newInputs]);
    setShowLibrary(false);
    setSelectedLibraryItems([]);
    setSearchQuery('');
  };

  const filteredLibrary = inputLibrary.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.inputType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const InputTypeTag = ({ type, small }) => {
    const colors = {
      'Ingredient': {
        bg: isDarkMode ? 'rgba(45, 212, 191, 0.15)' : 'rgba(13, 148, 136, 0.15)',
        text: theme.accentInputs,
        border: isDarkMode ? 'rgba(45, 212, 191, 0.3)' : 'rgba(13, 148, 136, 0.35)'
      },
      'Processing Condition': {
        bg: isDarkMode ? 'rgba(251, 146, 60, 0.15)' : 'rgba(234, 88, 12, 0.15)',
        text: theme.accentConstraints,
        border: isDarkMode ? 'rgba(251, 146, 60, 0.3)' : 'rgba(234, 88, 12, 0.35)'
      },
      'Other': {
        bg: isDarkMode ? 'rgba(167, 139, 250, 0.15)' : 'rgba(124, 58, 237, 0.15)',
        text: theme.accentCombinations,
        border: isDarkMode ? 'rgba(167, 139, 250, 0.3)' : 'rgba(124, 58, 237, 0.35)'
      },
    };
    const c = colors[type] || colors['Other'];
    return (
      <span style={{
        padding: small ? '2px 6px' : '4px 10px',
        borderRadius: '4px',
        fontSize: small ? '10px' : '11px',
        fontWeight: 500,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
      }}>
        {type === 'Processing Condition' ? 'Process' : type}
      </span>
    );
  };

  const VariableTypeTag = ({ type, small }) => {
    const colors = {
      'Continuous': {
        bg: isDarkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.15)',
        text: theme.accentObjectives,
        border: isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(37, 99, 235, 0.35)'
      },
      'Ordinal': {
        bg: isDarkMode ? 'rgba(244, 114, 182, 0.15)' : 'rgba(219, 39, 119, 0.15)',
        text: theme.accentOutcomes,
        border: isDarkMode ? 'rgba(244, 114, 182, 0.3)' : 'rgba(219, 39, 119, 0.35)'
      },
      'Nominal': {
        bg: isDarkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(245, 158, 11, 0.15)',
        text: isDarkMode ? '#FBBF24' : '#d97706',
        border: isDarkMode ? 'rgba(251, 191, 36, 0.3)' : 'rgba(245, 158, 11, 0.35)'
      },
    };
    const c = colors[type] || colors['Continuous'];
    return (
      <span style={{
        padding: small ? '2px 6px' : '4px 10px',
        borderRadius: '4px',
        fontSize: small ? '10px' : '11px',
        fontWeight: 500,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
      }}>
        {type}
      </span>
    );
  };

  // Focus management for new rows
  const nameInputRefs = useRef({});
  useEffect(() => {
    if (focusNewRow && nameInputRefs.current[focusNewRow]) {
      nameInputRefs.current[focusNewRow].focus();
      setFocusNewRow(null);
    }
  }, [focusNewRow, inputs]);

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
        background: theme.modalOverlay,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        zIndex: 1000,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme.scrollbarTrack};
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme.scrollbarThumb};
          border-radius: 3px;
        }

        input::placeholder, textarea::placeholder {
          color: ${theme.placeholder};
        }
        
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          padding-right: 26px !important;
        }
        
        .input-field {
          padding: 6px 10px;
          font-size: 13px;
          background: ${theme.inputBg};
          border: 1px solid ${theme.inputBorder};
          border-radius: 5px;
          color: ${theme.text};
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s, background 0.15s;
        }
        .input-field:focus {
          border-color: rgba(45, 212, 191, 0.5);
          background: ${theme.inputFocusBg};
        }
        .input-field:disabled {
          background: ${theme.cardBg};
          color: ${theme.textMuted};
          cursor: not-allowed;
        }
      `}</style>

      {/* Main Modal */}
      <div style={{
        width: '1000px',
        maxWidth: '95vw',
        height: '600px',
        maxHeight: '90vh',
        background: theme.modalBg,
        borderRadius: '16px',
        border: `1px solid rgba(45, 212, 191, ${isDarkMode ? '0.2' : '0.18'})`,
        boxShadow: '0 0 60px rgba(45, 212, 191, 0.1), 0 25px 80px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalEnter 0.3s ease-out',
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
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `rgba(45, 212, 191, ${isDarkMode ? '0.1' : '0.08'})`,
              border: `1px solid rgba(45, 212, 191, ${isDarkMode ? '0.3' : '0.25'})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
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
                Configure Inputs
              </h2>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: '12px',
                color: theme.textTertiary,
              }}>
                {inputs.length} input{inputs.length !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowLibrary(true)}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 500,
                background: theme.cardBg,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.cardBgHover;
                e.currentTarget.style.borderColor = theme.borderStrong;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.cardBg;
                e.currentTarget.style.borderColor = theme.border;
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Library
              <kbd style={{
                padding: '1px 5px',
                borderRadius: '3px',
                background: theme.inputBg,
                fontSize: '10px',
                color: theme.textTertiary,
              }}>⌘L</kbd>
            </button>
            
            <button
              onClick={handleAddNew}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%)',
                color: '#0a0a0f',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 12px rgba(45, 212, 191, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(45, 212, 191, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(45, 212, 191, 0.3)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Input
              <kbd style={{
                padding: '1px 5px',
                borderRadius: '3px',
                background: 'rgba(0,0,0,0.15)',
                fontSize: '10px',
              }}>⌘N</kbd>
            </button>
          </div>
        </div>

        {/* Table Container - Fixed height */}
        <div className="custom-scrollbar" style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                borderBottom: `1px solid ${theme.border}`,
                position: 'sticky',
                top: 0,
                background: theme.modalBg,
                zIndex: 10,
              }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '20%' }}>Name</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '14%' }}>Input Type</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '13%' }}>Variable Type</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '18%' }}>Levels</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '10%' }}>Cost</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', width: '20%' }}>Description</th>
                <th style={{ padding: '10px 16px', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {inputs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px',
                    }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        background: 'rgba(45, 212, 191, 0.06)',
                        border: '1px dashed rgba(45, 212, 191, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.5" opacity="0.6">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                      </div>
                      <div>
                        <p style={{
                          margin: '0 0 6px 0',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: theme.textSecondary,
                        }}>
                          No inputs configured
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: theme.textMuted,
                        }}>
                          Add inputs from the <button 
                            onClick={() => setShowLibrary(true)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#2DD4BF', 
                              cursor: 'pointer',
                              fontSize: '13px',
                              padding: 0,
                            }}
                          >library</button> or <button 
                            onClick={handleAddNew}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#2DD4BF', 
                              cursor: 'pointer',
                              fontSize: '13px',
                              padding: 0,
                            }}
                          >create a new input</button> to get started.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                inputs.map((input) => {
                  const isContinuous = input.variableType === 'Continuous';
                  const isIngredient = input.inputType === 'Ingredient';
                  
                  return (
                    <tr
                      key={input.id}
                      onMouseEnter={() => setHoveredRow(input.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: `1px solid ${theme.borderLight}`,
                        background: hoveredRow === input.id ? theme.rowHoverBg : 'transparent',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      <td style={{ padding: '8px 16px', position: 'relative' }}>
                        <input
                          ref={el => nameInputRefs.current[input.id] = el}
                          type="text"
                          value={input.name}
                          onChange={(e) => {
                            updateInput(input.id, 'name', e.target.value);
                            if (e.target.value.length >= 1) {
                              setActiveAutocomplete(input.id);
                              setAutocompleteIndex(0);
                            } else {
                              setActiveAutocomplete(null);
                            }
                          }}
                          onFocus={() => {
                            if (input.name.length >= 1) {
                              setActiveAutocomplete(input.id);
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => setActiveAutocomplete(null), 150);
                          }}
                          onKeyDown={(e) => {
                            const suggestions = getAutocompleteSuggestions(input.name);
                            if (activeAutocomplete === input.id && suggestions.length > 0) {
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setAutocompleteIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setAutocompleteIndex(prev => Math.max(prev - 1, 0));
                              } else if (e.key === 'Enter') {
                                e.preventDefault();
                                applyLibraryItem(input.id, suggestions[autocompleteIndex]);
                              }
                            }
                          }}
                          placeholder="Input name..."
                          className="input-field"
                          style={{ width: '100%', fontWeight: 500 }}
                          autoComplete="off"
                        />

                        {/* Autocomplete Dropdown */}
                        {activeAutocomplete === input.id && (() => {
                          const suggestions = getAutocompleteSuggestions(input.name);
                          if (suggestions.length === 0) return null;

                          return (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              marginTop: '4px',
                              background: theme.surfaceElevated,
                              border: '1px solid rgba(45, 212, 191, 0.3)',
                              borderRadius: '8px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                              zIndex: 100,
                              overflow: 'hidden',
                              animation: 'fadeIn 0.1s ease-out',
                            }}>
                              {/* Header with keyboard shortcuts */}
                              <div style={{
                                padding: '8px 12px',
                                background: 'rgba(45, 212, 191, 0.05)',
                                borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#2DD4BF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Library matches
                                </span>
                                <span style={{ fontSize: '10px', color: theme.textTertiary }}>
                                  ↑↓ navigate · Enter select
                                </span>
                              </div>

                              {/* Suggestion items */}
                              {suggestions.map((item, idx) => (
                                <div
                                  key={item.id}
                                  onClick={() => applyLibraryItem(input.id, item)}
                                  style={{
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    background: idx === autocompleteIndex ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
                                    borderLeft: idx === autocompleteIndex ? '2px solid #2DD4BF' : '2px solid transparent',
                                    transition: 'all 0.1s ease',
                                  }}
                                  onMouseEnter={() => setAutocompleteIndex(idx)}
                                >
                                  {/* Item header with name and tags */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '4px',
                                  }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>
                                      {item.name}
                                    </span>
                                    <InputTypeTag type={item.inputType} small />
                                    <VariableTypeTag type={item.variableType} small />
                                  </div>

                                  {/* Item details */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '8px',
                                  }}>
                                    <span style={{ fontSize: '11px', color: theme.textTertiary }}>
                                      {item.description}
                                    </span>
                                    {item.cost && (
                                      <span style={{ fontSize: '10px', color: '#2DD4BF', fontWeight: 600 }}>
                                        ${item.cost.toFixed(2)}
                                      </span>
                                    )}
                                    {item.levels && item.levels.length > 0 && (
                                      <span style={{ fontSize: '10px', color: theme.textSecondary }}>
                                        {item.levels.join(', ')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <select
                          value={input.inputType}
                          onChange={(e) => updateInput(input.id, 'inputType', e.target.value)}
                          className="input-field"
                          style={{ width: '100%' }}
                        >
                          <option value="Ingredient">Ingredient</option>
                          <option value="Processing Condition">Processing</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <select
                          value={input.variableType}
                          onChange={(e) => updateInput(input.id, 'variableType', e.target.value)}
                          className="input-field"
                          style={{ width: '100%' }}
                          disabled={isIngredient}
                        >
                          <option value="Continuous">Continuous</option>
                          <option value="Ordinal">Ordinal</option>
                          <option value="Nominal">Nominal</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={isContinuous ? '' : (input.levelsText ?? input.levels?.join(', ') ?? '')}
                          onChange={(e) => updateInput(input.id, 'levelsText', e.target.value)}
                          onBlur={(e) => {
                            const parsed = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            updateInput(input.id, 'levels', parsed);
                          }}
                          placeholder={isContinuous ? 'N/A' : 'Low, Medium, High'}
                          className="input-field"
                          style={{ width: '100%' }}
                          disabled={isContinuous}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: isContinuous ? theme.textTertiary : theme.textMuted, fontSize: '13px' }}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={isContinuous ? (input.cost || '') : ''}
                            onChange={(e) => updateInput(input.id, 'cost', e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder={isContinuous ? '0.00' : 'N/A'}
                            className="input-field"
                            style={{ width: '100%' }}
                            disabled={!isContinuous}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={input.description}
                          onChange={(e) => updateInput(input.id, 'description', e.target.value)}
                          placeholder="Optional..."
                          className="input-field"
                          style={{ width: '100%', color: theme.textSecondary }}
                        />
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => deleteInput(input.id)}
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: theme.textMuted,
                            opacity: hoveredRow === input.id ? 1 : 0,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = theme.deleteButtonHoverBg;
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
                      </td>
                    </tr>
                  );
                })
              )}
              {/* Empty rows to fill minimum height */}
              {inputs.length > 0 && inputs.length < 8 && Array.from({ length: 8 - inputs.length }).map((_, i) => (
                <tr key={`empty-${i}`} style={{ borderBottom: `1px solid ${theme.cardBg}` }}>
                  <td colSpan="7" style={{ padding: '20px 16px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '11px',
            color: theme.textMuted,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ padding: '2px 5px', borderRadius: '3px', background: theme.cardBgHover, border: `1px solid ${theme.inputBorder}`, fontSize: '10px' }}>⌘N</kbd>
              New
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ padding: '2px 5px', borderRadius: '3px', background: theme.cardBgHover, border: `1px solid ${theme.inputBorder}`, fontSize: '10px' }}>⌘L</kbd>
              Library
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
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Data is already saved to context automatically
                // Just close the modal if we have inputs
                if (inputs.length > 0) {
                  onClose();
                }
              }}
              disabled={inputs.length === 0}
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 600,
                background: inputs.length > 0 
                  ? 'linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%)'
                  : theme.cardBgHover,
                color: inputs.length > 0 ? '#0a0a0f' : theme.textMuted,
                border: inputs.length > 0 ? 'none' : `1px solid ${theme.border}`,
                borderRadius: '6px',
                cursor: inputs.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                boxShadow: inputs.length > 0 ? '0 2px 12px rgba(45, 212, 191, 0.3)' : 'none',
              }}
            >
              Save Inputs
            </button>
          </div>
        </div>
      </div>

      {/* Library Slide-over */}
      {showLibrary && (
        <>
          <div 
            onClick={() => {
              setShowLibrary(false);
              setSelectedLibraryItems([]);
              setSearchQuery('');
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 1001,
              animation: 'fadeIn 0.15s ease-out',
            }}
          />
          <div style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: '460px',
            background: theme.modalBg,
            borderLeft: `1px solid ${theme.inputBorder}`,
            boxShadow: '-10px 0 40px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1002,
            animation: 'slideIn 0.2s ease-out',
          }}>
            {/* Library Header */}
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.border}`,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme.text }}>
                  Input Library
                </h3>
                <button
                  onClick={() => {
                    setShowLibrary(false);
                    setSelectedLibraryItems([]);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '6px',
                    background: theme.cardBgHover,
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    color: theme.textTertiary,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inputs..."
                  autoFocus
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '36px', padding: '10px 12px 10px 36px' }}
                />
              </div>
            </div>

            {/* Library Items - Compact but informative rows */}
            <div className="custom-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
              {filteredLibrary.map((item) => {
                const isSelected = selectedLibraryItems.find(i => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleLibraryItem(item)}
                    style={{
                      padding: '12px 14px',
                      marginBottom: '6px',
                      background: isSelected ? 'rgba(45, 212, 191, 0.08)' : theme.cardBg,
                      border: `1px solid ${isSelected ? 'rgba(45, 212, 191, 0.3)' : theme.borderLight}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = theme.borderLight;
                        e.currentTarget.style.borderColor = theme.inputBorder;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = theme.cardBg;
                        e.currentTarget.style.borderColor = theme.borderLight;
                      }
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: isSelected ? 'none' : `2px solid ${theme.borderStrong}`,
                      background: isSelected ? '#2DD4BF' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>{item.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <InputTypeTag type={item.inputType} small />
                          <VariableTypeTag type={item.variableType} small />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: theme.textTertiary }}>{item.description}</span>
                        {item.cost && (
                          <span style={{ fontSize: '11px', color: '#2DD4BF', fontWeight: 500 }}>${item.cost.toFixed(2)}</span>
                        )}
                      </div>
                      {item.levels && item.levels.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {item.levels.map((level, i) => (
                            <span key={i} style={{
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: theme.border,
                              fontSize: '10px',
                              color: theme.textSecondary,
                            }}>
                              {level}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Library Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '12px', color: theme.textTertiary }}>
                {selectedLibraryItems.length} selected
              </span>
              <button
                onClick={importSelected}
                disabled={selectedLibraryItems.length === 0}
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: selectedLibraryItems.length > 0 
                    ? 'linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%)'
                    : theme.cardBgHover,
                  color: selectedLibraryItems.length > 0 ? '#0a0a0f' : theme.textMuted,
                  border: selectedLibraryItems.length > 0 ? 'none' : `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  cursor: selectedLibraryItems.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: selectedLibraryItems.length > 0 ? '0 2px 12px rgba(45, 212, 191, 0.3)' : 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Import
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InputsModal;
