import React, { useState, useEffect, useRef } from 'react';

const OutcomesModal = ({ onClose, onSave }) => {
  const [outcomes, setOutcomes] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLibraryItems, setSelectedLibraryItems] = useState([]);
  const [focusNewRow, setFocusNewRow] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [activeAutocomplete, setActiveAutocomplete] = useState(null); // tracks which row has autocomplete open
  const [autocompleteIndex, setAutocompleteIndex] = useState(0); // keyboard navigation index
  
  // Outcomes Library - categorized by measurement type
  const outcomeLibrary = [
    // Analytical (lab measurements - typically continuous)
    { id: 'lib-1', name: 'Moisture Content', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Water activity level (%)', limits: '2-8' },
    { id: 'lib-2', name: 'pH Level', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Acidity measurement', limits: '4.0-7.0' },
    { id: 'lib-3', name: 'Viscosity', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Flow resistance (cP)', limits: '100-5000' },
    { id: 'lib-4', name: 'Texture Firmness', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Force measurement (N)', limits: '5-50' },
    { id: 'lib-5', name: 'Color L*', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Lightness value', limits: '20-80' },
    { id: 'lib-6', name: 'Particle Size', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Average diameter (μm)', limits: '10-500' },
    
    // Sensory (panel evaluations - can be ordinal or continuous)
    { id: 'lib-7', name: 'Overall Liking', outcomeType: 'Sensory', variableType: 'Ordinal', description: '9-point hedonic scale', levels: ['Dislike Extremely', 'Dislike Very Much', 'Dislike Moderately', 'Dislike Slightly', 'Neither', 'Like Slightly', 'Like Moderately', 'Like Very Much', 'Like Extremely'] },
    { id: 'lib-8', name: 'Sweetness Intensity', outcomeType: 'Sensory', variableType: 'Continuous', description: 'Line scale 0-100', limits: '0-100' },
    { id: 'lib-9', name: 'Crunchiness', outcomeType: 'Sensory', variableType: 'Ordinal', description: 'Texture rating', levels: ['Not Crunchy', 'Slightly Crunchy', 'Moderately Crunchy', 'Very Crunchy', 'Extremely Crunchy'] },
    { id: 'lib-10', name: 'Flavor Intensity', outcomeType: 'Sensory', variableType: 'Continuous', description: 'Intensity scale 0-15', limits: '0-15' },
    { id: 'lib-11', name: 'Aroma Quality', outcomeType: 'Sensory', variableType: 'Ordinal', description: 'Quality rating', levels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] },
    { id: 'lib-12', name: 'Mouthfeel', outcomeType: 'Sensory', variableType: 'Nominal', description: 'Texture descriptor', levels: ['Smooth', 'Grainy', 'Creamy', 'Waxy', 'Chalky'] },
    
    // Consumer (market research - various types)
    { id: 'lib-13', name: 'Purchase Intent', outcomeType: 'Consumer', variableType: 'Ordinal', description: 'Likelihood to buy', levels: ['Definitely Would Not', 'Probably Would Not', 'Might/Might Not', 'Probably Would', 'Definitely Would'] },
    { id: 'lib-14', name: 'Value Perception', outcomeType: 'Consumer', variableType: 'Ordinal', description: 'Price-value rating', levels: ['Very Poor Value', 'Poor Value', 'Fair Value', 'Good Value', 'Excellent Value'] },
    { id: 'lib-15', name: 'Brand Fit', outcomeType: 'Consumer', variableType: 'Continuous', description: 'Fit score 1-10', limits: '1-10' },
    { id: 'lib-16', name: 'Repeat Purchase', outcomeType: 'Consumer', variableType: 'Nominal', description: 'Would buy again', levels: ['Yes', 'No', 'Unsure'] },
    { id: 'lib-17', name: 'NPS Score', outcomeType: 'Consumer', variableType: 'Continuous', description: 'Net Promoter Score', limits: '-100-100' },
    
    // Other
    { id: 'lib-18', name: 'Shelf Life', outcomeType: 'Other', variableType: 'Continuous', description: 'Days until expiration', limits: '7-365' },
    { id: 'lib-19', name: 'Production Yield', outcomeType: 'Other', variableType: 'Continuous', description: 'Output percentage', limits: '80-100' },
    { id: 'lib-20', name: 'Quality Grade', outcomeType: 'Other', variableType: 'Ordinal', description: 'Final product grade', levels: ['Reject', 'C-Grade', 'B-Grade', 'A-Grade', 'Premium'] },
  ];

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
    const newId = `outcome-${Date.now()}`;
    const newOutcome = {
      id: newId,
      name: '',
      outcomeType: 'Analytical',
      variableType: 'Continuous',
      description: '',
      levels: [],
      levelsText: '',
      min: '',
      max: '',
    };
    setOutcomes(prev => [...prev, newOutcome]);
    setFocusNewRow(newId);
  };

  const updateOutcome = (id, field, value) => {
    setOutcomes(prev => prev.map(outcome => {
      if (outcome.id !== id) return outcome;
      
      const updated = { ...outcome, [field]: value };
      
      // If changing variable type, clear the opposite field
      if (field === 'variableType') {
        if (value === 'Continuous') {
          updated.levels = [];
          updated.levelsText = '';
        } else {
          updated.min = '';
          updated.max = '';
        }
      }
      
      return updated;
    }));
  };

  const deleteOutcome = (id) => {
    setOutcomes(prev => prev.filter(outcome => outcome.id !== id));
  };

  // Get autocomplete suggestions for a given name query
  const getAutocompleteSuggestions = (query) => {
    if (!query || query.length < 1) return [];
    const lowerQuery = query.toLowerCase();
    return outcomeLibrary.filter(item =>
      item.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 5); // Limit to 5 suggestions
  };

  // Apply a library item to an existing outcome row
  const applyLibraryItem = (outcomeId, libraryItem) => {
    // Parse limits string into min/max
    let min = '';
    let max = '';
    if (libraryItem.limits) {
      const parts = libraryItem.limits.split('-');
      if (parts.length === 2) {
        min = parts[0].trim();
        max = parts[1].trim();
      } else if (parts.length === 3 && libraryItem.limits.startsWith('-')) {
        min = '-' + parts[1].trim();
        max = parts[2].trim();
      }
    }

    setOutcomes(prev => prev.map(outcome => {
      if (outcome.id !== outcomeId) return outcome;
      return {
        ...outcome,
        name: libraryItem.name,
        outcomeType: libraryItem.outcomeType,
        variableType: libraryItem.variableType,
        description: libraryItem.description || '',
        levels: libraryItem.levels || [],
        levelsText: libraryItem.levels?.join(', ') || '',
        min,
        max,
      };
    }));
    setActiveAutocomplete(null);
    setAutocompleteIndex(0);
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
    const newOutcomes = selectedLibraryItems.map(item => {
      // Parse limits string (e.g., "0-100") into min/max
      let min = '';
      let max = '';
      if (item.limits) {
        const parts = item.limits.split('-');
        if (parts.length === 2) {
          min = parts[0].trim();
          max = parts[1].trim();
        } else if (parts.length === 3 && item.limits.startsWith('-')) {
          // Handle negative min like "-100-100"
          min = '-' + parts[1].trim();
          max = parts[2].trim();
        }
      }
      
      return {
        ...item,
        id: `imported-${Date.now()}-${item.id}`,
        levelsText: item.levels?.join(', ') || '',
        min,
        max,
      };
    });
    setOutcomes(prev => [...prev, ...newOutcomes]);
    setShowLibrary(false);
    setSelectedLibraryItems([]);
    setSearchQuery('');
  };

  const filteredLibrary = outcomeLibrary.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.outcomeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Theme color for Outcomes - Pink
  const themeColor = '#F472B6';
  const themeColorRgb = '244, 114, 182';

  const OutcomeTypeTag = ({ type, small }) => {
    const colors = {
      'Analytical': { bg: 'rgba(96, 165, 250, 0.15)', text: '#60A5FA', border: 'rgba(96, 165, 250, 0.3)' },
      'Sensory': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
      'Consumer': { bg: 'rgba(167, 139, 250, 0.15)', text: '#A78BFA', border: 'rgba(167, 139, 250, 0.3)' },
      'Other': { bg: 'rgba(113, 113, 122, 0.15)', text: '#A1A1AA', border: 'rgba(113, 113, 122, 0.3)' },
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
        {type}
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
  }, [focusNewRow, outcomes]);

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
        background: 'rgba(0, 0, 0, 0.8)',
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
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        
        input::placeholder, textarea::placeholder {
          color: #52525b;
        }
        
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          padding-right: 26px !important;
        }
        
        .outcome-field {
          padding: 6px 10px;
          font-size: 13px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 5px;
          color: #E4E4E7;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s, background 0.15s;
        }
        .outcome-field:focus {
          border-color: rgba(${themeColorRgb}, 0.5);
          background: rgba(${themeColorRgb}, 0.05);
        }
        .outcome-field:disabled {
          background: rgba(255,255,255,0.01);
          color: #3f3f46;
          cursor: not-allowed;
        }
      `}</style>

      {/* Main Modal */}
      <div style={{
        width: '1000px',
        maxWidth: '95vw',
        height: '600px',
        maxHeight: '90vh',
        background: '#0f0f14',
        borderRadius: '16px',
        border: `1px solid rgba(${themeColorRgb}, 0.2)`,
        boxShadow: `0 0 60px rgba(${themeColorRgb}, 0.1), 0 25px 80px rgba(0,0,0,0.5)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalEnter 0.3s ease-out',
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
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `rgba(${themeColorRgb}, 0.1)`,
              border: `1px solid rgba(${themeColorRgb}, 0.3)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Target/Bullseye icon for Outcomes */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" fill={themeColor} />
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
                Configure Outcomes
              </h2>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: '12px',
                color: '#71717A',
              }}>
                {outcomes.length} outcome{outcomes.length !== 1 ? 's' : ''} configured
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
                background: 'rgba(255,255,255,0.03)',
                color: '#A1A1AA',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
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
                background: 'rgba(255,255,255,0.08)',
                fontSize: '10px',
                color: '#71717A',
              }}>⌘L</kbd>
            </button>
            
            <button
              onClick={handleAddNew}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${themeColor} 0%, #EC4899 100%)`,
                color: '#0a0a0f',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                boxShadow: `0 2px 12px rgba(${themeColorRgb}, 0.3)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 4px 16px rgba(${themeColorRgb}, 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 2px 12px rgba(${themeColorRgb}, 0.3)`;
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Outcome
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
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'sticky',
                top: 0,
                background: '#0f0f14',
                zIndex: 10,
              }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', width: '28%' }}>Name</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', width: '12%' }}>Outcome Type</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', width: '12%' }}>Variable Type</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', width: '20%' }}>Range / Levels</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', width: '23%' }}>Description</th>
                <th style={{ padding: '10px 16px', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {outcomes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '80px 24px', textAlign: 'center' }}>
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
                        background: `rgba(${themeColorRgb}, 0.06)`,
                        border: `1px dashed rgba(${themeColorRgb}, 0.25)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="1.5" opacity="0.6">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" fill={themeColor} />
                        </svg>
                      </div>
                      <div>
                        <p style={{
                          margin: '0 0 6px 0',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#A1A1AA',
                        }}>
                          No outcomes configured
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: '#52525b',
                        }}>
                          Add outcomes from the <button 
                            onClick={() => setShowLibrary(true)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: themeColor, 
                              cursor: 'pointer',
                              fontSize: '13px',
                              padding: 0,
                            }}
                          >library</button> or <button 
                            onClick={handleAddNew}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: themeColor, 
                              cursor: 'pointer',
                              fontSize: '13px',
                              padding: 0,
                            }}
                          >create a new outcome</button> to get started.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                outcomes.map((outcome) => {
                  const isContinuous = outcome.variableType === 'Continuous';
                  
                  return (
                    <tr
                      key={outcome.id}
                      onMouseEnter={() => setHoveredRow(outcome.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: hoveredRow === outcome.id ? 'rgba(255,255,255,0.015)' : 'transparent',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      <td style={{ padding: '8px 16px', position: 'relative' }}>
                        <div style={{ position: 'relative' }}>
                          <input
                            ref={el => nameInputRefs.current[outcome.id] = el}
                            type="text"
                            value={outcome.name}
                            onChange={(e) => {
                              updateOutcome(outcome.id, 'name', e.target.value);
                              if (e.target.value.length >= 1) {
                                setActiveAutocomplete(outcome.id);
                                setAutocompleteIndex(0);
                              } else {
                                setActiveAutocomplete(null);
                              }
                            }}
                            onFocus={() => {
                              if (outcome.name.length >= 1) {
                                setActiveAutocomplete(outcome.id);
                              }
                            }}
                            onBlur={() => {
                              // Delay to allow click on suggestion
                              setTimeout(() => setActiveAutocomplete(null), 150);
                            }}
                            onKeyDown={(e) => {
                              const suggestions = getAutocompleteSuggestions(outcome.name);
                              if (activeAutocomplete === outcome.id && suggestions.length > 0) {
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setAutocompleteIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  setAutocompleteIndex(prev => Math.max(prev - 1, 0));
                                } else if (e.key === 'Enter') {
                                  e.preventDefault();
                                  applyLibraryItem(outcome.id, suggestions[autocompleteIndex]);
                                }
                              }
                            }}
                            placeholder="Outcome name..."
                            className="outcome-field"
                            style={{ width: '100%', fontWeight: 500 }}
                            autoComplete="off"
                          />
                          
                          {/* Autocomplete dropdown */}
                          {activeAutocomplete === outcome.id && (() => {
                            const suggestions = getAutocompleteSuggestions(outcome.name);
                            if (suggestions.length === 0) return null;
                            
                            return (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
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
                                  <span style={{ fontSize: '10px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Library matches
                                  </span>
                                  <span style={{ fontSize: '10px', color: '#52525b' }}>
                                    ↑↓ navigate · Enter select
                                  </span>
                                </div>
                                {suggestions.map((item, idx) => (
                                  <div
                                    key={item.id}
                                    onClick={() => applyLibraryItem(outcome.id, item)}
                                    style={{
                                      padding: '10px 12px',
                                      cursor: 'pointer',
                                      background: idx === autocompleteIndex ? `rgba(${themeColorRgb}, 0.1)` : 'transparent',
                                      borderLeft: idx === autocompleteIndex ? `2px solid ${themeColor}` : '2px solid transparent',
                                      transition: 'all 0.1s ease',
                                    }}
                                    onMouseEnter={() => setAutocompleteIndex(idx)}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#E4E4E7' }}>{item.name}</span>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <OutcomeTypeTag type={item.outcomeType} small />
                                        <VariableTypeTag type={item.variableType} small />
                                      </div>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#71717A' }}>
                                      {item.description}
                                      {item.limits && <span style={{ marginLeft: '8px', color: '#2DD4BF', fontFamily: 'monospace' }}>{item.limits}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <select
                          value={outcome.outcomeType}
                          onChange={(e) => updateOutcome(outcome.id, 'outcomeType', e.target.value)}
                          className="outcome-field"
                          style={{ width: '100%' }}
                        >
                          <option value="Analytical">Analytical</option>
                          <option value="Sensory">Sensory</option>
                          <option value="Consumer">Consumer</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <select
                          value={outcome.variableType}
                          onChange={(e) => updateOutcome(outcome.id, 'variableType', e.target.value)}
                          className="outcome-field"
                          style={{ width: '100%' }}
                        >
                          <option value="Continuous">Continuous</option>
                          <option value="Ordinal">Ordinal</option>
                          <option value="Nominal">Nominal</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        {isContinuous ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              value={outcome.min ?? ''}
                              onChange={(e) => updateOutcome(outcome.id, 'min', e.target.value)}
                              placeholder="Min"
                              className="outcome-field"
                              style={{ width: '100%', textAlign: 'center' }}
                            />
                            <span style={{ color: '#52525b', fontSize: '12px', flexShrink: 0 }}>to</span>
                            <input
                              type="number"
                              value={outcome.max ?? ''}
                              onChange={(e) => updateOutcome(outcome.id, 'max', e.target.value)}
                              placeholder="Max"
                              className="outcome-field"
                              style={{ width: '100%', textAlign: 'center' }}
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={outcome.levelsText ?? outcome.levels?.join(', ') ?? ''}
                            onChange={(e) => updateOutcome(outcome.id, 'levelsText', e.target.value)}
                            onBlur={(e) => {
                              const parsed = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              updateOutcome(outcome.id, 'levels', parsed);
                            }}
                            placeholder="Level 1, Level 2, Level 3..."
                            className="outcome-field"
                            style={{ width: '100%' }}
                          />
                        )}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={outcome.description}
                          onChange={(e) => updateOutcome(outcome.id, 'description', e.target.value)}
                          placeholder="Optional notes..."
                          className="outcome-field"
                          style={{ width: '100%', color: '#A1A1AA' }}
                        />
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => deleteOutcome(outcome.id)}
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#52525b',
                            opacity: hoveredRow === outcome.id ? 1 : 0,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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
                      </td>
                    </tr>
                  );
                })
              )}
              {/* Empty rows to fill minimum height */}
              {outcomes.length > 0 && outcomes.length < 8 && Array.from({ length: 8 - outcomes.length }).map((_, i) => (
                <tr key={`empty-${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td colSpan="6" style={{ padding: '20px 16px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '11px',
            color: '#52525b',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '10px' }}>⌘N</kbd>
              New
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '10px' }}>⌘L</kbd>
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
                color: '#71717A',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (outcomes.length > 0 && onSave) {
                  onSave(outcomes);
                }
              }}
              disabled={outcomes.length === 0}
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 600,
                background: outcomes.length > 0 
                  ? `linear-gradient(135deg, ${themeColor} 0%, #EC4899 100%)`
                  : 'rgba(255,255,255,0.05)',
                color: outcomes.length > 0 ? '#0a0a0f' : '#52525b',
                border: outcomes.length > 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                cursor: outcomes.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                boxShadow: outcomes.length > 0 ? `0 2px 12px rgba(${themeColorRgb}, 0.3)` : 'none',
              }}
            >
              Save Outcomes
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
            width: '480px',
            background: '#0f0f14',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1002,
            animation: 'slideIn 0.2s ease-out',
          }}>
            {/* Library Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#E4E4E7' }}>
                  Outcome Library
                </h3>
                <button
                  onClick={() => {
                    setShowLibrary(false);
                    setSelectedLibraryItems([]);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: '5px',
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
              
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search outcomes..."
                  autoFocus
                  className="outcome-field"
                  style={{ width: '100%', paddingLeft: '36px', padding: '10px 12px 10px 36px' }}
                />
              </div>
              
              {/* Category filters */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px',
                flexWrap: 'wrap',
              }}>
                {['All', 'Analytical', 'Sensory', 'Consumer', 'Other'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSearchQuery(cat === 'All' ? '' : cat)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 500,
                      background: (cat === 'All' && !searchQuery) || searchQuery.toLowerCase() === cat.toLowerCase()
                        ? `rgba(${themeColorRgb}, 0.15)`
                        : 'rgba(255,255,255,0.03)',
                      color: (cat === 'All' && !searchQuery) || searchQuery.toLowerCase() === cat.toLowerCase()
                        ? themeColor
                        : '#71717A',
                      border: (cat === 'All' && !searchQuery) || searchQuery.toLowerCase() === cat.toLowerCase()
                        ? `1px solid rgba(${themeColorRgb}, 0.3)`
                        : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Library Items */}
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
                      background: isSelected ? `rgba(${themeColorRgb}, 0.08)` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? `rgba(${themeColorRgb}, 0.3)` : 'rgba(255,255,255,0.04)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                      }
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.15)',
                      background: isSelected ? themeColor : 'transparent',
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
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#E4E4E7' }}>{item.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <OutcomeTypeTag type={item.outcomeType} small />
                          <VariableTypeTag type={item.variableType} small />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#71717A' }}>{item.description}</span>
                        {item.limits && (
                          <span style={{ fontSize: '11px', color: '#2DD4BF', fontWeight: 500, fontFamily: 'monospace' }}>{item.limits}</span>
                        )}
                      </div>
                      {item.levels && item.levels.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {item.levels.slice(0, 4).map((level, i) => (
                            <span key={i} style={{
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.06)',
                              fontSize: '10px',
                              color: '#A1A1AA',
                            }}>
                              {level}
                            </span>
                          ))}
                          {item.levels.length > 4 && (
                            <span style={{
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.06)',
                              fontSize: '10px',
                              color: '#71717A',
                            }}>
                              +{item.levels.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {filteredLibrary.length === 0 && (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '13px', color: '#52525b', margin: 0 }}>
                    No outcomes found matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>

            {/* Library Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '12px', color: '#71717A' }}>
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
                    ? `linear-gradient(135deg, ${themeColor} 0%, #EC4899 100%)`
                    : 'rgba(255,255,255,0.05)',
                  color: selectedLibraryItems.length > 0 ? '#0a0a0f' : '#52525b',
                  border: selectedLibraryItems.length > 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  cursor: selectedLibraryItems.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: selectedLibraryItems.length > 0 ? `0 2px 12px rgba(${themeColorRgb}, 0.3)` : 'none',
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

export default OutcomesModal;
