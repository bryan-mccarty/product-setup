import React, { useState, useRef, useEffect } from 'react';

// ============================================================================
// UNIQUE ID GENERATOR
// ============================================================================
const generateId = () => Math.random().toString(36).substr(2, 9);

// ============================================================================
// PRODUCT INPUTS (from finished_dashboard - these are the "defaults")
// ============================================================================
const productInputs = [
  { id: 'prod-1', name: 'Flour', inputType: 'Ingredient', variableType: 'Continuous', description: 'Base flour amount', cost: 0.42, isDefault: true, suggestedMin: '20', suggestedMax: '40' },
  { id: 'prod-2', name: 'Sugar', inputType: 'Ingredient', variableType: 'Continuous', description: 'Granulated sugar', cost: 0.68, isDefault: true, suggestedMin: '15', suggestedMax: '30' },
  { id: 'prod-3', name: 'Butter', inputType: 'Ingredient', variableType: 'Continuous', description: 'Unsalted butter', cost: 1.85, isDefault: true, suggestedMin: '10', suggestedMax: '25' },
  { id: 'prod-4', name: 'Eggs', inputType: 'Ingredient', variableType: 'Continuous', description: 'Whole eggs', cost: 0.35, isDefault: false, suggestedMin: '5', suggestedMax: '15' },
  { id: 'prod-5', name: 'Vanilla Extract', inputType: 'Ingredient', variableType: 'Continuous', description: 'Pure vanilla', cost: 4.20, isDefault: false, suggestedMin: '0.5', suggestedMax: '2' },
  { id: 'prod-6', name: 'Cocoa Powder', inputType: 'Ingredient', variableType: 'Continuous', description: 'Dutch-process cocoa', cost: 2.15, isDefault: true, suggestedMin: '8', suggestedMax: '18' },
  { id: 'prod-7', name: 'Baking Temperature', inputType: 'Processing', variableType: 'Continuous', description: 'Oven temp °F', isDefault: true, suggestedMin: '325', suggestedMax: '375' },
  { id: 'prod-8', name: 'Mixing Duration', inputType: 'Processing', variableType: 'Continuous', description: 'Total mix time', isDefault: false, suggestedMin: '3', suggestedMax: '10' },
  { id: 'prod-9', name: 'Mixer Speed', inputType: 'Processing', variableType: 'Ordinal', description: 'Speed setting', isDefault: false, levels: ['Low', 'Medium', 'High'] },
  { id: 'prod-10', name: 'Bake Time', inputType: 'Processing', variableType: 'Continuous', description: 'Duration in minutes', isDefault: true, suggestedMin: '25', suggestedMax: '35' },
];

// ============================================================================
// LIBRARY INPUTS (extended library)
// ============================================================================
const libraryInputs = [
  { id: 'lib-1', name: 'Water', inputType: 'Ingredient', variableType: 'Continuous', description: 'Purified water', cost: 0.01, suggestedMin: '40', suggestedMax: '90' },
  { id: 'lib-2', name: 'Salt', inputType: 'Ingredient', variableType: 'Continuous', description: 'Fine sea salt', cost: 0.15, suggestedMin: '0', suggestedMax: '3' },
  { id: 'lib-3', name: 'Milk', inputType: 'Ingredient', variableType: 'Continuous', description: 'Whole milk', cost: 0.52, suggestedMin: '5', suggestedMax: '20' },
  { id: 'lib-4', name: 'Baking Soda', inputType: 'Ingredient', variableType: 'Continuous', description: 'Sodium bicarbonate', cost: 0.08, suggestedMin: '0.5', suggestedMax: '2' },
  { id: 'lib-5', name: 'Baking Powder', inputType: 'Ingredient', variableType: 'Continuous', description: 'Double-acting', cost: 0.12, suggestedMin: '1', suggestedMax: '4' },
  { id: 'lib-6', name: 'Vegetable Oil', inputType: 'Ingredient', variableType: 'Continuous', description: 'Neutral oil', cost: 0.35, suggestedMin: '5', suggestedMax: '20' },
  { id: 'lib-7', name: 'Proofing Time', inputType: 'Processing', variableType: 'Continuous', description: 'Dough rest duration', suggestedMin: '30', suggestedMax: '120' },
  { id: 'lib-8', name: 'Humidity Level', inputType: 'Processing', variableType: 'Ordinal', description: 'Environment humidity', levels: ['Low', 'Medium', 'High'] },
  { id: 'lib-9', name: 'Cooling Method', inputType: 'Processing', variableType: 'Nominal', description: 'Post-bake cooling', levels: ['Room Temp', 'Refrigerated', 'Flash Cool'] },
  { id: 'lib-10', name: 'Natural Flavor', inputType: 'Ingredient', variableType: 'Continuous', description: 'Natural flavoring', cost: 2.50, suggestedMin: '0', suggestedMax: '1' },
  { id: 'lib-11', name: 'Citric Acid', inputType: 'Ingredient', variableType: 'Continuous', description: 'Acidulant', cost: 0.25, suggestedMin: '0', suggestedMax: '2' },
  { id: 'lib-12', name: 'Cornstarch', inputType: 'Ingredient', variableType: 'Continuous', description: 'Corn starch', cost: 0.18, suggestedMin: '2', suggestedMax: '8' },
];

// ============================================================================
// HISTORICAL DATA FOR RANGE EXPLORER
// ============================================================================
const getHistoricalData = (inputName) => {
  const data = {
    'Flour': {
      productRange: { min: 22, max: 38 },
      libraryRange: { min: 15, max: 50 },
      lunaRecommended: { min: 25, max: 35 },
      absoluteMin: 15,
      absoluteMax: 50,
      productDots: [0,0,0,0,0,1,2,4,6,8,10,12,14,12,10,8,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      libraryDots: [1,2,3,4,6,8,10,11,12,13,14,14,13,12,11,10,9,8,7,6,5,4,4,3,3,2,2,1,1,1,0,0,0,0,0],
    },
    'Sugar': {
      productRange: { min: 18, max: 28 },
      libraryRange: { min: 10, max: 35 },
      lunaRecommended: { min: 20, max: 26 },
      absoluteMin: 10,
      absoluteMax: 35,
      productDots: [0,0,0,0,0,0,0,0,2,4,7,10,12,11,9,7,5,3,2,1,0,0,0,0,0],
      libraryDots: [1,2,3,5,7,9,11,12,13,13,12,11,10,9,8,7,6,5,4,3,2,2,1,1,0],
    },
    'default': {
      productRange: { min: 5, max: 15 },
      libraryRange: { min: 0, max: 25 },
      lunaRecommended: { min: 8, max: 12 },
      absoluteMin: 0,
      absoluteMax: 25,
      productDots: [0,1,2,3,5,7,9,10,11,10,9,7,5,4,3,2,1,1,0,0,0,0,0,0,0],
      libraryDots: [2,3,5,7,9,10,11,12,12,11,10,9,8,7,6,5,4,3,3,2,2,1,1,0,0],
    },
  };
  return data[inputName] || data['default'];
};

// ============================================================================
// THEME COLORS
// ============================================================================
const themeColor = '#2DD4BF';
const themeColorRgb = '45, 212, 191';

// ============================================================================
// ICONS
// ============================================================================
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const LibraryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ProductIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const MagnifyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FlaskIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 6v14l-8 16a2 2 0 001.8 3h24.4a2 2 0 001.8-3l-8-16V6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 6h16" strokeLinecap="round" />
    <circle cx="20" cy="32" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="28" cy="30" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="24" cy="35" r="1" fill="currentColor" opacity="0.5" />
  </svg>
);

const InputsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="8" y="8" width="32" height="32" rx="4" />
    <line x1="8" y1="18" x2="40" y2="18" />
    <line x1="18" y1="40" x2="18" y2="18" />
    <circle cx="28" cy="28" r="3" fill="currentColor" opacity="0.4" />
  </svg>
);

// ============================================================================
// TYPE TAG COMPONENTS
// ============================================================================
const InputTypeTag = ({ type, small }) => {
  const colors = {
    'Ingredient': { bg: 'rgba(45, 212, 191, 0.15)', text: '#2DD4BF', border: 'rgba(45, 212, 191, 0.3)' },
    'Processing': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
    'Other': { bg: 'rgba(167, 139, 250, 0.15)', text: '#A78BFA', border: 'rgba(167, 139, 250, 0.3)' },
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
      {type === 'Processing' ? 'Process' : type}
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

const SourceTag = ({ source }) => {
  const isProduct = source === 'Product';
  return (
    <span style={{
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '9px',
      fontWeight: 600,
      background: isProduct ? 'rgba(139, 92, 246, 0.15)' : 'rgba(113, 113, 122, 0.15)',
      color: isProduct ? '#A78BFA' : '#A1A1AA',
      border: `1px solid ${isProduct ? 'rgba(139, 92, 246, 0.3)' : 'rgba(113, 113, 122, 0.3)'}`,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    }}>
      {source}
    </span>
  );
};

// ============================================================================
// PLACEHOLDER - These will be defined in subsequent phases
// ============================================================================

// Phase 2: Custom Select Component
// Phase 3: InputRow Component  
// Phase 4: Autocomplete functionality
// Phase 5: Library/Product Panel
// Phase 6: Range Explorer Modal
// Phase 7: Main Component

// ============================================================================
// DOT PLOT COMPONENT FOR RANGE EXPLORER
// ============================================================================
const DotPlot = ({ dots, color, label, minValue, maxValue, absoluteMin, absoluteMax, onMinChange, onMaxChange }) => {
  const minVal = parseFloat(minValue) || absoluteMin;
  const maxVal = parseFloat(maxValue) || absoluteMax;
  const maxCount = Math.max(...dots);
  
  return (
    <div className="dot-plot-container">
      <div className="dot-plot-header">
        <span className="dot-plot-color" style={{ background: color }}></span>
        <span className="dot-plot-label">{label}</span>
      </div>
      <div className="dot-plot">
        {dots.map((count, idx) => {
          const value = absoluteMin + idx;
          const isInRange = value >= minVal && value <= maxVal;
          // Scale to max 10 dots for better visual density
          const displayCount = maxCount > 0 ? Math.round((count / maxCount) * 10) : 0;
          
          return (
            <div key={idx} className="dot-column">
              {displayCount > 0 && Array.from({ length: displayCount }).map((_, dotIdx) => (
                <div 
                  key={dotIdx} 
                  className="dot"
                  style={{ 
                    background: isInRange ? color : '#71717A',
                    opacity: isInRange ? 1 : 0.35
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
      <div className="dot-plot-slider">
        <input
          type="range"
          className="dot-slider min-slider"
          min={absoluteMin}
          max={absoluteMax}
          step="0.1"
          value={minValue}
          onChange={onMinChange}
        />
        <input
          type="range"
          className="dot-slider max-slider"
          min={absoluteMin}
          max={absoluteMax}
          step="0.1"
          value={maxValue}
          onChange={onMaxChange}
        />
      </div>
      <div className="dot-plot-axis">
        <span>{absoluteMin}</span>
        <span>{absoluteMax}</span>
      </div>
    </div>
  );
};

// ============================================================================
// RANGE EXPLORER MODAL
// ============================================================================
const RangeExplorerModal = ({ input, onSave, onClose }) => {
  const historicalData = getHistoricalData(input.name);
  const [minValue, setMinValue] = useState(input.minValue || String(historicalData.lunaRecommended.min));
  const [maxValue, setMaxValue] = useState(input.maxValue || String(historicalData.lunaRecommended.max));
  
  const absoluteMin = historicalData.absoluteMin;
  const absoluteMax = historicalData.absoluteMax;
  
  const handleMinSlider = (e) => {
    const val = e.target.value;
    if (parseFloat(val) < parseFloat(maxValue)) {
      setMinValue(val);
    }
  };
  
  const handleMaxSlider = (e) => {
    const val = e.target.value;
    if (parseFloat(val) > parseFloat(minValue)) {
      setMaxValue(val);
    }
  };
  
  const handleSave = () => {
    onSave(minValue, maxValue);
  };

  const isIngredient = input.inputType === 'Ingredient';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="range-explorer-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Range Explorer</h3>
            <p className="modal-subtitle">{input.name}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        
        <div className="explorer-body">
          {/* Range Summary Cards */}
          <div className="range-cards">
            <div className="range-card product-card">
              <div className="range-card-label">This Product</div>
              <div className="range-card-value">
                {historicalData.productRange.min} – {historicalData.productRange.max}{isIngredient ? '%' : ''}
              </div>
              <div className="range-card-meta">Previous formulas</div>
            </div>
            <div className="range-card library-card">
              <div className="range-card-label">All Products</div>
              <div className="range-card-value">
                {historicalData.libraryRange.min} – {historicalData.libraryRange.max}{isIngredient ? '%' : ''}
              </div>
              <div className="range-card-meta">Library-wide</div>
            </div>
            <div className="range-card luna-card">
              <div className="range-card-label">Luna Recommended</div>
              <div className="range-card-value">
                {historicalData.lunaRecommended.min} – {historicalData.lunaRecommended.max}{isIngredient ? '%' : ''}
              </div>
              <div className="range-card-meta">AI suggestion</div>
            </div>
          </div>

          {/* Dot Plot Distributions - Side by Side */}
          <div className="distribution-section">
            <div className="dot-plots-container">
              <DotPlot 
                dots={historicalData.productDots} 
                color="#3B82F6" 
                label="This Product"
                minValue={minValue}
                maxValue={maxValue}
                absoluteMin={absoluteMin}
                absoluteMax={absoluteMax}
                onMinChange={handleMinSlider}
                onMaxChange={handleMaxSlider}
              />
              <div className="distribution-divider"></div>
              <DotPlot 
                dots={historicalData.libraryDots} 
                color="#8B5CF6" 
                label="All Products"
                minValue={minValue}
                maxValue={maxValue}
                absoluteMin={absoluteMin}
                absoluteMax={absoluteMax}
                onMinChange={handleMinSlider}
                onMaxChange={handleMaxSlider}
              />
            </div>
          </div>

          {/* Value Input Fields */}
          <div className="value-inputs-section">
            <div className="value-input-group">
              <label className="value-input-label">Min</label>
              <div className="value-input-wrapper">
                <input
                  type="text"
                  className="value-input-field"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                />
                {isIngredient && <span className="value-unit">%</span>}
              </div>
            </div>
            <div className="value-separator">–</div>
            <div className="value-input-group">
              <label className="value-input-label">Max</label>
              <div className="value-input-wrapper">
                <input
                  type="text"
                  className="value-input-field"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                />
                {isIngredient && <span className="value-unit">%</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-save" onClick={handleSave}>Save Range</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LIBRARY PANEL (SLIDE-OVER)
// ============================================================================
// ============================================================================
// INGREDIENT EXPLORER MODAL (Find New Inputs - Coming Soon)
// ============================================================================
const IngredientExplorerModal = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="ingredient-explorer-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <div>
          <h3 className="modal-title">Ingredient Explorer</h3>
          <p className="modal-subtitle">Discover new ingredients</p>
        </div>
        <button className="modal-close" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      
      <div className="explorer-content">
        <div className="explorer-icon-container">
          <FlaskIcon />
        </div>
        <h4 className="explorer-main-title">Discover New Ingredients</h4>
        <p className="explorer-description">
          AI-powered ingredient discovery coming soon. Explore alternatives, find substitutes, 
          and discover novel ingredients based on your formulation goals.
        </p>
        <div className="explorer-badge">Coming Soon</div>
      </div>
    </div>
  </div>
);

const LibraryPanel = ({ activeTab, onTabChange, productInputs, libraryInputs, onImport, onImportDefaults, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const currentItems = activeTab === 'product' ? productInputs : libraryInputs;
  const defaultCount = productInputs.filter(p => p.isDefault).length;
  
  const filteredItems = currentItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(query) ||
           item.inputType.toLowerCase().includes(query) ||
           (item.description && item.description.toLowerCase().includes(query));
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleImportSelected = () => {
    const selectedItems = currentItems.filter(item => selectedIds.includes(item.id));
    onImport(selectedItems);
    setSelectedIds([]);
    onClose();
  };

  const handleImportDefaults = () => {
    onImportDefaults();
    onClose();
  };

  return (
    <>
      <div className="library-overlay" onClick={onClose} />
      <div className="library-panel">
        {/* Header */}
        <div className="library-header">
          <h3 className="library-title">Add Inputs</h3>
          <button className="library-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="library-tabs">
          <button 
            className={`library-tab ${activeTab === 'product' ? 'active' : ''}`}
            onClick={() => { onTabChange('product'); setSelectedIds([]); }}
          >
            <ProductIcon />
            Product
            <span className="library-tab-count">{productInputs.length}</span>
          </button>
          <button 
            className={`library-tab ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => { onTabChange('library'); setSelectedIds([]); }}
          >
            <LibraryIcon />
            Library
            <span className="library-tab-count">{libraryInputs.length}</span>
          </button>
        </div>

        {/* Defaults Import (only on product tab) */}
        {activeTab === 'product' && defaultCount > 0 && (
          <div className="defaults-import">
            <span className="defaults-import-text">
              <StarIcon filled />
              {defaultCount} default inputs available
            </span>
            <button className="defaults-import-btn" onClick={handleImportDefaults}>
              Import Defaults
            </button>
          </div>
        )}

        {/* Search */}
        <div className="library-search">
          <div className="library-search-wrapper">
            <span className="library-search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="library-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inputs..."
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="library-items">
          {filteredItems.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`library-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleSelect(item.id)}
              >
                <div className="library-item-checkbox">
                  {isSelected && <CheckIcon />}
                </div>
                <div className="library-item-content">
                  <div className="library-item-header">
                    <span className="library-item-name">
                      {item.name}
                      {item.isDefault && <span className="default-badge">Default</span>}
                    </span>
                    <div className="library-item-tags">
                      <InputTypeTag type={item.inputType} small />
                      <VariableTypeTag type={item.variableType} small />
                    </div>
                  </div>
                  <div className="library-item-details">
                    <span className="library-item-desc">{item.description}</span>
                    {item.cost && <span className="library-item-cost">${item.cost.toFixed(2)}</span>}
                  </div>
                  {item.levels && item.levels.length > 0 && (
                    <div className="library-item-levels">
                      {item.levels.map((level, i) => (
                        <span key={i} className="level-pill">{level}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {filteredItems.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#52525b' }}>
                No inputs found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="library-footer">
          <span className="library-selected-count">
            {selectedIds.length} selected
          </span>
          <button
            className="library-import-btn"
            onClick={handleImportSelected}
            disabled={selectedIds.length === 0}
            style={{ borderRadius: '6px' }}
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
  );
};

// ============================================================================
// INPUT ROW COMPONENT WITH AUTOCOMPLETE
// ============================================================================
const InputRow = ({ input, onUpdate, onDelete, onConfirm, onOpenRangeExplorer, allProductInputs, allLibraryInputs }) => {
  const [showCommentPopover, setShowCommentPopover] = useState(false);
  const [commentDraft, setCommentDraft] = useState(input.comment || '');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const nameInputRef = useRef(null);

  const inputTypeOptions = [
    { value: 'Ingredient', label: 'Ingredient' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Other', label: 'Other' }
  ];

  const variableTypeOptions = input.inputType === 'Ingredient' 
    ? [{ value: 'Continuous', label: 'Continuous' }]
    : [
        { value: 'Continuous', label: 'Continuous' },
        { value: 'Ordinal', label: 'Ordinal' },
        { value: 'Nominal', label: 'Nominal' }
      ];

  // Get autocomplete suggestions - product first, then library
  const getAutocompleteSuggestions = () => {
    const query = input.name.toLowerCase();
    if (!query || query.length < 1) return { product: [], library: [] };
    
    const productMatches = allProductInputs.filter(item =>
      item.name.toLowerCase().includes(query)
    ).slice(0, 4);
    
    const libraryMatches = allLibraryInputs.filter(item =>
      item.name.toLowerCase().includes(query) &&
      !productMatches.find(p => p.name.toLowerCase() === item.name.toLowerCase())
    ).slice(0, 4);
    
    return { product: productMatches, library: libraryMatches };
  };

  const suggestions = getAutocompleteSuggestions();
  const allSuggestions = [...suggestions.product, ...suggestions.library];
  const hasSuggestions = allSuggestions.length > 0;

  const applyAutocomplete = (item) => {
    onUpdate({
      ...input,
      name: item.name,
      inputType: item.inputType,
      variableType: item.variableType,
      description: item.description || '',
      minValue: item.suggestedMin || '',
      maxValue: item.suggestedMax || '',
      levelsText: item.levels?.join(', ') || '',
      levels: item.levels || [],
      cost: item.cost || null,
      status: 'draft',
      source: item.id.startsWith('prod') ? 'Product' : 'Library',
    });
    setShowAutocomplete(false);
    setAutocompleteIndex(0);
  };

  const handleNameKeyDown = (e) => {
    if (!showAutocomplete || !hasSuggestions) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAutocompleteIndex(prev => Math.min(prev + 1, allSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAutocompleteIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      applyAutocomplete(allSuggestions[autocompleteIndex]);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };

  const handleInputTypeChange = (newType) => {
    const updates = { inputType: newType };
    if (newType === 'Ingredient') {
      updates.variableType = 'Continuous';
      updates.levels = [];
      updates.levelsText = '';
    }
    onUpdate({ ...input, ...updates });
  };

  const handleVariableTypeChange = (newType) => {
    const updates = { variableType: newType };
    if (newType === 'Continuous') {
      updates.levels = [];
      updates.levelsText = '';
    } else {
      updates.cost = null;
      updates.minValue = '';
      updates.maxValue = '';
    }
    onUpdate({ ...input, ...updates });
  };

  const openCommentPopover = () => {
    setCommentDraft(input.comment || '');
    setShowCommentPopover(true);
  };

  const saveComment = () => {
    onUpdate({ ...input, comment: commentDraft.trim() });
    setShowCommentPopover(false);
  };

  const cancelComment = () => {
    setCommentDraft(input.comment || '');
    setShowCommentPopover(false);
  };

  const isIngredient = input.inputType === 'Ingredient';
  const isContinuous = input.variableType === 'Continuous';
  const isDraft = input.status === 'draft';
  const hasComment = input.comment && input.comment.trim().length > 0;

  return (
    <tr className={`input-row ${isDraft ? 'draft-row' : ''}`}>
      {/* Name with Autocomplete */}
      <td style={{ position: 'relative' }}>
        <input
          ref={nameInputRef}
          type="text"
          className="table-input name-input"
          value={input.name}
          onChange={(e) => {
            onUpdate({ ...input, name: e.target.value });
            setShowAutocomplete(e.target.value.length >= 1);
            setAutocompleteIndex(0);
          }}
          onFocus={() => setShowAutocomplete(input.name.length >= 1)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
          onKeyDown={handleNameKeyDown}
          placeholder="Input name..."
          autoComplete="off"
        />
        
        {/* Autocomplete Dropdown */}
        {showAutocomplete && hasSuggestions && (
          <div className="autocomplete-dropdown">
            <div className="autocomplete-header">
              <span className="autocomplete-label">Suggestions</span>
              <span className="autocomplete-hint">↑↓ nav · Enter select</span>
            </div>
            
            {/* Product Matches */}
            {suggestions.product.length > 0 && (
              <>
                <div className="autocomplete-section-label">
                  <ProductIcon /> From Product
                </div>
                {suggestions.product.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`autocomplete-item ${idx === autocompleteIndex ? 'highlighted' : ''}`}
                    onMouseEnter={() => setAutocompleteIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyAutocomplete(item);
                    }}
                  >
                    <div className="autocomplete-item-header">
                      <span className="autocomplete-item-name">{item.name}</span>
                      <div className="autocomplete-item-tags">
                        <InputTypeTag type={item.inputType} small />
                        <VariableTypeTag type={item.variableType} small />
                      </div>
                    </div>
                    <div className="autocomplete-item-details">
                      <span className="autocomplete-item-desc">{item.description}</span>
                      {item.cost && <span className="autocomplete-item-cost">${item.cost.toFixed(2)}</span>}
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {/* Library Matches */}
            {suggestions.library.length > 0 && (
              <>
                <div className="autocomplete-section-label">
                  <LibraryIcon /> From Library
                </div>
                {suggestions.library.map((item, idx) => {
                  const actualIdx = suggestions.product.length + idx;
                  return (
                    <div
                      key={item.id}
                      className={`autocomplete-item ${actualIdx === autocompleteIndex ? 'highlighted' : ''}`}
                      onMouseEnter={() => setAutocompleteIndex(actualIdx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyAutocomplete(item);
                      }}
                    >
                      <div className="autocomplete-item-header">
                        <span className="autocomplete-item-name">{item.name}</span>
                        <div className="autocomplete-item-tags">
                          <InputTypeTag type={item.inputType} small />
                          <VariableTypeTag type={item.variableType} small />
                        </div>
                      </div>
                      <div className="autocomplete-item-details">
                        <span className="autocomplete-item-desc">{item.description}</span>
                        {item.cost && <span className="autocomplete-item-cost">${item.cost.toFixed(2)}</span>}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </td>
      
      {/* Input Type */}
      <td>
        <select
          className="table-select"
          value={input.inputType}
          onChange={(e) => handleInputTypeChange(e.target.value)}
        >
          {inputTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </td>
      
      {/* Variable Type */}
      <td>
        <select
          className="table-select"
          value={input.variableType}
          onChange={(e) => handleVariableTypeChange(e.target.value)}
          disabled={isIngredient}
        >
          {variableTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </td>
      
      {/* Range / Levels */}
      <td>
        <div className="range-cell">
          {isContinuous ? (
            <div className="range-inputs">
              <input
                type="text"
                className="table-input range-input"
                value={input.minValue}
                onChange={(e) => onUpdate({ ...input, minValue: e.target.value })}
                placeholder="Min"
              />
              <span className="range-separator">–</span>
              <input
                type="text"
                className="table-input range-input"
                value={input.maxValue}
                onChange={(e) => onUpdate({ ...input, maxValue: e.target.value })}
                placeholder="Max"
              />
              {isIngredient && <span className="unit-label">%</span>}
            </div>
          ) : (
            <input
              type="text"
              className="table-input levels-input"
              value={input.levelsText || ''}
              onChange={(e) => onUpdate({ ...input, levelsText: e.target.value })}
              placeholder="Low, Medium, High..."
            />
          )}
          
          {isContinuous && (
            <button 
              className="explore-btn" 
              onClick={() => onOpenRangeExplorer(input)}
              title="Explore range"
            >
              <MagnifyIcon />
            </button>
          )}
          
          {isDraft && (
            <button 
              className="confirm-btn" 
              onClick={() => onConfirm(input.id)}
              title="Confirm values"
            >
              <CheckIcon />
            </button>
          )}
        </div>
      </td>
      
      {/* Cost */}
      <td>
        {isIngredient && isContinuous ? (
          <div className="cost-cell">
            <span className="cost-prefix">$</span>
            <input
              type="text"
              className="table-input cost-input"
              value={input.cost || ''}
              onChange={(e) => onUpdate({ ...input, cost: e.target.value })}
              placeholder="0.00"
            />
          </div>
        ) : (
          <span className="no-cost">—</span>
        )}
      </td>
      
      {/* Description */}
      <td>
        <input
          type="text"
          className="table-input"
          value={input.description || ''}
          onChange={(e) => onUpdate({ ...input, description: e.target.value })}
          placeholder="Optional..."
          style={{ color: '#A1A1AA' }}
        />
      </td>
      
      {/* Actions */}
      <td>
        <div className="row-actions">
          <div className="comment-wrapper">
            <button 
              className={`comment-btn ${hasComment ? 'has-comment' : ''}`} 
              onClick={openCommentPopover}
              title={hasComment ? input.comment : "Add note"}
            >
              <CommentIcon />
              {hasComment && <span className="comment-indicator"></span>}
            </button>
            
            {showCommentPopover && (
              <>
                <div className="popover-backdrop" onClick={cancelComment}></div>
                <div className="comment-popover">
                  <div className="comment-popover-header">Note</div>
                  <textarea
                    className="comment-textarea"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Add a note about this input..."
                    autoFocus
                  />
                  <div className="comment-popover-actions">
                    <button className="comment-cancel-btn" onClick={cancelComment}>Cancel</button>
                    <button className="comment-save-btn" onClick={saveComment}>Save</button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <button className="delete-btn" onClick={onDelete} title="Delete input">
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function InputsPage() {
  // Progress stepper - Step 3 is Inputs
  const currentStep = 3;
  const steps = [
    { number: 1, name: 'Basic Information', status: 'complete' },
    { number: 2, name: 'Define Goals / Claims', status: 'complete' },
    { number: 3, name: 'Select Inputs', status: 'current' },
    { number: 4, name: 'Define Constraints', status: null },
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
    if (step.status === 'draft') return 'draft';
    if (step.status === 'incomplete') return 'incomplete';
    return 'completed';
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Project state
  const [projectSummary] = useState({
    title: "Low-Sugar Brownie Mix",
    description: "Reduce brownie sugar levels while maintaining sweetness and fudginess near full-sugar version and cost below $2.20 per unit"
  });

  // Inputs state
  const [inputs, setInputs] = useState([]);
  
  // Modal states
  const [showLibraryPanel, setShowLibraryPanel] = useState(false);
  const [libraryTab, setLibraryTab] = useState('product'); // 'product' | 'library'
  const [rangeExplorerInput, setRangeExplorerInput] = useState(null);
  const [showIngredientExplorer, setShowIngredientExplorer] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: "I'll help you configure inputs for this project. You can import defaults from the product, add from the library, or create new inputs."
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + N: New input
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleAddNew();
      }
      // Cmd/Ctrl + L: Open library panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        setShowLibraryPanel(true);
        setLibraryTab('library');
      }
      // Cmd/Ctrl + D: Import defaults
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        handleImportDefaults();
      }
      // Cmd/Ctrl + F: Find New Inputs (Ingredient Explorer)
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowIngredientExplorer(true);
      }
      // Escape: Close panels
      if (e.key === 'Escape') {
        setShowLibraryPanel(false);
        setRangeExplorerInput(null);
        setShowIngredientExplorer(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Input management functions
  const handleAddNew = () => {
    const newId = `input-${Date.now()}`;
    const newInput = {
      id: newId,
      name: '',
      inputType: 'Ingredient',
      variableType: 'Continuous',
      description: '',
      minValue: '',
      maxValue: '',
      levelsText: '',
      levels: [],
      cost: null,
      status: 'confirmed',
      comment: '',
    };
    setInputs(prev => [newInput, ...prev]);
  };

  const handleImportDefaults = () => {
    const defaultInputs = productInputs.filter(p => p.isDefault);
    const newInputs = defaultInputs.map(input => ({
      id: `imported-${Date.now()}-${input.id}`,
      name: input.name,
      inputType: input.inputType,
      variableType: input.variableType,
      description: input.description || '',
      minValue: input.suggestedMin || '',
      maxValue: input.suggestedMax || '',
      levelsText: input.levels?.join(', ') || '',
      levels: input.levels || [],
      cost: input.cost || null,
      status: 'draft',
      comment: '',
      source: 'Product',
    }));
    setInputs(prev => [...newInputs, ...prev]);
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

  const confirmInput = (id) => {
    setInputs(prev => prev.map(input => 
      input.id === id ? { ...input, status: 'confirmed' } : input
    ));
  };

  const deleteInput = (id) => {
    setInputs(prev => prev.filter(input => input.id !== id));
  };

  const addFromSelection = (selectedItems) => {
    const newInputs = selectedItems.map(item => ({
      id: `imported-${Date.now()}-${item.id}`,
      name: item.name,
      inputType: item.inputType,
      variableType: item.variableType,
      description: item.description || '',
      minValue: item.suggestedMin || '',
      maxValue: item.suggestedMax || '',
      levelsText: item.levels?.join(', ') || '',
      levels: item.levels || [],
      cost: item.cost || null,
      status: 'draft',
      comment: '',
      source: item.id.startsWith('prod') ? 'Product' : 'Library',
    }));
    setInputs(prev => [...newInputs, ...prev]);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages([
      ...chatMessages,
      { id: generateId(), role: 'user', content: chatInput },
      { id: generateId(), role: 'assistant', content: "That's a great approach. For brownie formulations, you'll want to carefully balance the sugar reduction with other sweeteners or flavor enhancers. Consider your texture goals alongside taste targets." }
    ]);
    setChatInput('');
  };

  // Stats
  const confirmedCount = inputs.filter(i => i.status === 'confirmed').length;
  const draftCount = inputs.filter(i => i.status === 'draft').length;

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

        /* SKELETON STYLES - More will be added in subsequent phases */
        
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
          background: linear-gradient(180deg, rgba(45, 212, 191, 0.02) 0%, transparent 40%);
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

        /* ===== STEPPER HEADER ===== */
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
          background: linear-gradient(90deg, ${themeColor} 0%, #22D3EE 100%);
          border-radius: 1px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 12px rgba(${themeColorRgb}, 0.4);
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
          background: linear-gradient(135deg, ${themeColor} 0%, #22D3EE 100%);
          color: #0a0a0f;
          border: none;
        }

        .step-circle.current {
          background: linear-gradient(135deg, ${themeColor} 0%, #22D3EE 100%);
          color: #0a0a0f;
          border: none;
          box-shadow: 0 0 0 3px rgba(${themeColorRgb}, 0.2), 0 0 20px rgba(${themeColorRgb}, 0.3);
        }

        .step-circle.upcoming {
          background: #18181B;
          color: #52525b;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .step-circle:hover {
          transform: scale(1.08);
        }

        .warning-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #09090b;
          font-size: 8px;
          font-weight: 700;
          cursor: help;
        }

        .warning-badge.draft {
          background: #F59E0B;
          color: white;
        }

        .warning-badge.incomplete {
          background: #EF4444;
          color: white;
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
          color: ${themeColor};
        }

        .step-label.completed {
          color: #A1A1AA;
        }

        .step-label.upcoming {
          color: #52525b;
        }

        /* Project Info (inside stepper) */
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
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
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

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #A1A1AA;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .action-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.15);
          color: #E4E4E7;
        }

        .action-btn kbd {
          padding: 2px 5px;
          border-radius: 3px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 10px;
          color: #71717A;
          margin-left: 4px;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, ${themeColor} 0%, #22D3EE 100%);
          border: none;
          color: #0a0a0f;
          font-weight: 600;
          box-shadow: 0 2px 12px rgba(${themeColorRgb}, 0.25);
        }

        .action-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(${themeColorRgb}, 0.35);
        }

        .action-btn.primary kbd {
          background: rgba(0,0,0,0.15);
          border-color: rgba(0,0,0,0.2);
          color: inherit;
        }

        .action-btn.defaults {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.3);
          color: #FBBF24;
        }

        .action-btn.defaults:hover {
          background: rgba(251, 191, 36, 0.15);
          border-color: rgba(251, 191, 36, 0.4);
        }

        .action-btn.explore {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
          color: #A78BFA;
        }

        .action-btn.explore:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.4);
        }

        /* Stats Badge */
        .stats-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 6px;
          font-size: 11px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #71717A;
        }

        .stat-value {
          font-weight: 600;
          color: #A1A1AA;
        }

        .stat-item.draft .stat-value {
          color: #FBBF24;
        }

        /* Table Placeholder */
        .table-container {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          overflow: visible;
        }

        .empty-state {
          padding: 80px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
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
          color: ${themeColor};
          opacity: 0.6;
        }

        .empty-state-title {
          font-size: 15px;
          font-weight: 500;
          color: #A1A1AA;
        }

        .empty-state-text {
          font-size: 13px;
          color: #52525b;
          max-width: 320px;
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

        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #71717A;
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.15);
          color: #A1A1AA;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%);
          border: none;
          color: #0a0a0f;
          box-shadow: 0 2px 12px rgba(45, 212, 191, 0.25);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(45, 212, 191, 0.4);
        }

        .btn-primary:disabled {
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
          padding: 20px;
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

        /* ===== TABLE STYLES ===== */
        .inputs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .inputs-table thead tr {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          background: #0f0f14;
          z-index: 10;
        }

        .inputs-table th {
          padding: 10px 12px;
          text-align: left;
          font-size: 10px;
          font-weight: 600;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .inputs-table th:first-child {
          padding-left: 16px;
        }

        .inputs-table th:last-child {
          width: 80px;
          padding-right: 16px;
        }

        .input-row {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.1s ease;
        }

        .input-row:hover {
          background: rgba(255,255,255,0.02);
        }

        .input-row.draft-row {
          background: rgba(251, 191, 36, 0.04);
        }

        .input-row.draft-row:hover {
          background: rgba(251, 191, 36, 0.08);
        }

        .input-row.draft-row td:first-child {
          border-left: 3px solid #FBBF24;
        }

        .input-row td {
          padding: 8px 12px;
          vertical-align: middle;
        }

        .input-row td:first-child {
          padding-left: 16px;
        }

        .input-row td:last-child {
          padding-right: 16px;
        }

        /* Input fields in table */
        .table-input {
          width: 100%;
          padding: 6px 10px;
          font-size: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 5px;
          color: #E4E4E7;
          outline: none;
          font-family: inherit;
          transition: all 0.15s ease;
        }

        .table-input:focus {
          border-color: rgba(${themeColorRgb}, 0.5);
          background: rgba(${themeColorRgb}, 0.05);
        }

        .table-input:hover:not(:focus) {
          border-color: rgba(255,255,255,0.12);
        }

        .table-input::placeholder {
          color: #52525b;
        }

        .table-input.name-input {
          font-weight: 500;
        }

        .draft-row .table-input {
          border-color: rgba(251, 191, 36, 0.3);
          background: rgba(251, 191, 36, 0.05);
        }

        .draft-row .table-input:focus {
          border-color: rgba(251, 191, 36, 0.6);
          background: rgba(251, 191, 36, 0.1);
        }

        /* Select in table */
        .table-select {
          padding: 6px 28px 6px 10px;
          font-size: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 5px;
          color: #E4E4E7;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          min-width: 110px;
          font-family: inherit;
          transition: all 0.15s ease;
        }

        .table-select:focus {
          border-color: rgba(${themeColorRgb}, 0.5);
          background-color: rgba(${themeColorRgb}, 0.05);
        }

        .table-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .draft-row .table-select {
          border-color: rgba(251, 191, 36, 0.3);
          background-color: rgba(251, 191, 36, 0.05);
        }

        /* Range Cell */
        .range-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .range-inputs {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .range-input {
          width: 60px;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
        }

        .range-separator {
          color: #52525b;
          font-size: 11px;
        }

        .unit-label {
          font-size: 10px;
          color: #71717A;
          margin-left: 2px;
        }

        .levels-input {
          flex: 1;
          min-width: 120px;
        }

        /* Action buttons in row */
        .explore-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          color: #71717A;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .explore-btn:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
          color: #A78BFA;
        }

        .confirm-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 4px;
          color: #22C55E;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .confirm-btn:hover {
          background: rgba(34, 197, 94, 0.25);
          border-color: rgba(34, 197, 94, 0.5);
        }

        /* Cost input */
        .cost-cell {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cost-prefix {
          color: #71717A;
          font-size: 11px;
        }

        .cost-input {
          width: 60px;
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
        }

        .no-cost {
          color: #3f3f46;
          font-size: 12px;
        }

        /* Row Actions */
        .row-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: flex-end;
        }

        .comment-wrapper {
          position: relative;
        }

        .comment-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #52525b;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }

        .comment-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #A1A1AA;
        }

        .comment-btn.has-comment {
          color: #60A5FA;
          background: rgba(96, 165, 250, 0.1);
        }

        .comment-btn.has-comment:hover {
          background: rgba(96, 165, 250, 0.15);
        }

        .comment-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 6px;
          height: 6px;
          background: #FBBF24;
          border-radius: 50%;
        }

        .popover-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
        }

        .comment-popover {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 260px;
          background: #1a1a22;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          z-index: 101;
          overflow: hidden;
        }

        .comment-popover-header {
          padding: 10px 12px;
          font-size: 11px;
          font-weight: 600;
          color: #A1A1AA;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .comment-textarea {
          width: 100%;
          padding: 10px 12px;
          border: none;
          outline: none;
          font-size: 12px;
          font-family: inherit;
          resize: none;
          min-height: 70px;
          line-height: 1.5;
          background: transparent;
          color: #E4E4E7;
        }

        .comment-textarea::placeholder {
          color: #52525b;
        }

        .comment-popover-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .comment-cancel-btn {
          padding: 5px 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 5px;
          font-size: 11px;
          font-weight: 500;
          color: #71717A;
          cursor: pointer;
          font-family: inherit;
        }

        .comment-cancel-btn:hover {
          background: rgba(255,255,255,0.05);
        }

        .comment-save-btn {
          padding: 5px 10px;
          background: ${themeColor};
          border: none;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #0a0a0f;
          cursor: pointer;
          font-family: inherit;
        }

        .comment-save-btn:hover {
          opacity: 0.9;
        }

        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #52525b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }

        /* ===== AUTOCOMPLETE DROPDOWN ===== */
        .autocomplete-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          width: 320px;
          background: #1a1a22;
          border: 1px solid rgba(${themeColorRgb}, 0.3);
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          z-index: 100;
          overflow: hidden;
          animation: dropdownEnter 0.15s ease-out;
        }

        @keyframes dropdownEnter {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .autocomplete-header {
          padding: 8px 12px;
          background: rgba(${themeColorRgb}, 0.05);
          border-bottom: 1px solid rgba(${themeColorRgb}, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .autocomplete-label {
          font-size: 10px;
          font-weight: 600;
          color: ${themeColor};
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .autocomplete-hint {
          font-size: 10px;
          color: #52525b;
        }

        .autocomplete-section-label {
          padding: 6px 12px;
          font-size: 9px;
          font-weight: 600;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .autocomplete-item {
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.1s ease;
          border-left: 2px solid transparent;
        }

        .autocomplete-item:hover,
        .autocomplete-item.highlighted {
          background: rgba(${themeColorRgb}, 0.08);
          border-left-color: ${themeColor};
        }

        .autocomplete-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }

        .autocomplete-item-name {
          font-size: 13px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .autocomplete-item-tags {
          display: flex;
          gap: 4px;
        }

        .autocomplete-item-details {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .autocomplete-item-desc {
          font-size: 11px;
          color: #71717A;
        }

        .autocomplete-item-cost {
          font-size: 11px;
          color: ${themeColor};
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ===== LIBRARY PANEL (SLIDE-OVER) ===== */
        .library-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          animation: fadeIn 0.15s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .library-panel {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: 480px;
          background: #0f0f14;
          border-left: 1px solid rgba(255,255,255,0.08);
          box-shadow: -10px 0 40px rgba(0,0,0,0.4);
          display: flex;
          flex-direction: column;
          z-index: 1001;
          animation: slideIn 0.2s ease-out;
        }

        .library-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .library-title {
          font-size: 16px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .library-close-btn {
          padding: 6px;
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: 5px;
          cursor: pointer;
          color: #71717A;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .library-close-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #A1A1AA;
        }

        /* Library Tabs */
        .library-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .library-tab {
          flex: 1;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 12px;
          font-weight: 500;
          color: #71717A;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .library-tab:hover {
          color: #A1A1AA;
          background: rgba(255,255,255,0.02);
        }

        .library-tab.active {
          color: ${themeColor};
          border-bottom-color: ${themeColor};
          background: rgba(${themeColorRgb}, 0.03);
        }

        .library-tab-count {
          padding: 2px 6px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          font-size: 10px;
        }

        .library-tab.active .library-tab-count {
          background: rgba(${themeColorRgb}, 0.2);
        }

        /* Library Search */
        .library-search {
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .library-search-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          font-size: 13px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #E4E4E7;
          outline: none;
          font-family: inherit;
          position: relative;
        }

        .library-search-input:focus {
          border-color: rgba(${themeColorRgb}, 0.5);
          background: rgba(${themeColorRgb}, 0.05);
        }

        .library-search-input::placeholder {
          color: #52525b;
        }

        .library-search-wrapper {
          position: relative;
        }

        .library-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #52525b;
          pointer-events: none;
        }

        /* Defaults Import Section */
        .defaults-import {
          padding: 12px 16px;
          background: rgba(251, 191, 36, 0.05);
          border-bottom: 1px solid rgba(251, 191, 36, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .defaults-import-text {
          font-size: 12px;
          color: #FBBF24;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .defaults-import-btn {
          padding: 6px 12px;
          background: rgba(251, 191, 36, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #FBBF24;
          cursor: pointer;
          font-family: inherit;
        }

        .defaults-import-btn:hover {
          background: rgba(251, 191, 36, 0.25);
        }

        /* Library Items List */
        .library-items {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .library-items::-webkit-scrollbar {
          width: 5px;
        }
        .library-items::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .library-items::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
        }

        .library-item {
          padding: 12px 14px;
          margin-bottom: 6px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: all 0.12s ease;
        }

        .library-item:hover {
          background: rgba(${themeColorRgb}, 0.06);
          border-color: rgba(${themeColorRgb}, 0.2);
        }

        .library-item.selected {
          background: rgba(${themeColorRgb}, 0.08);
          border-color: rgba(${themeColorRgb}, 0.3);
        }

        .library-item-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 2px solid rgba(255,255,255,0.15);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
          transition: all 0.15s ease;
        }

        .library-item.selected .library-item-checkbox {
          border: none;
          background: ${themeColor};
        }

        .library-item-content {
          flex: 1;
          min-width: 0;
        }

        .library-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .library-item-name {
          font-size: 13px;
          font-weight: 600;
          color: #E4E4E7;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .default-badge {
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(251, 191, 36, 0.15);
          color: #FBBF24;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .library-item-tags {
          display: flex;
          gap: 4px;
        }

        .library-item-details {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .library-item-desc {
          font-size: 11px;
          color: #71717A;
        }

        .library-item-cost {
          font-size: 11px;
          color: ${themeColor};
          font-weight: 600;
        }

        .library-item-levels {
          margin-top: 8px;
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .level-pill {
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255,255,255,0.05);
          font-size: 9px;
          color: #A1A1AA;
        }

        /* Library Footer */
        .library-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .library-selected-count {
          font-size: 12px;
          color: #71717A;
        }

        .library-import-btn {
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          background: linear-gradient(135deg, ${themeColor} 0%, #22D3EE 100%);
          color: #0a0a0f;
          border: none;
          borderRadius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 12px rgba(${themeColorRgb}, 0.3);
          transition: all 0.15s ease;
        }

        .library-import-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(${themeColorRgb}, 0.4);
        }

        .library-import-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* ===== RANGE EXPLORER MODAL ===== */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .range-explorer-modal {
          width: 600px;
          max-width: 95vw;
          background: #0f0f14;
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          box-shadow: 0 0 60px rgba(139, 92, 246, 0.1), 0 25px 80px rgba(0,0,0,0.5);
          overflow: hidden;
          animation: modalEnter 0.25s ease-out;
        }

        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .modal-subtitle {
          font-size: 12px;
          color: #71717A;
          margin-top: 2px;
        }

        .modal-close {
          padding: 6px;
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: #71717A;
        }

        .modal-close:hover {
          background: rgba(255,255,255,0.1);
          color: #A1A1AA;
        }

        .explorer-body {
          padding: 20px;
        }

        /* Range Cards - Compact */
        .range-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }

        .range-card {
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
        }

        .range-card-label {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717A;
          margin-bottom: 4px;
        }

        .range-card-value {
          font-size: 15px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 2px;
        }

        .range-card.product-card .range-card-value { color: #3B82F6; }
        .range-card.library-card .range-card-value { color: #8B5CF6; }
        .range-card.luna-card .range-card-value { color: ${themeColor}; }

        .range-card-meta {
          font-size: 9px;
          color: #52525b;
        }

        /* Distribution Section - Side by Side */
        .distribution-section {
          margin-bottom: 16px;
        }

        .dot-plots-container {
          display: flex;
          gap: 16px;
        }

        .distribution-divider {
          width: 1px;
          background: rgba(255,255,255,0.08);
        }

        .dot-plot-container {
          flex: 1;
        }

        .dot-plot-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .dot-plot-color {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }

        .dot-plot-label {
          font-size: 11px;
          font-weight: 600;
          color: #A1A1AA;
        }

        .dot-plot {
          display: flex;
          align-items: flex-end;
          height: 80px;
          gap: 0;
          padding: 4px 0;
        }

        .dot-column {
          flex: 1;
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          gap: 2px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: all 0.1s ease;
        }

        .dot-plot-slider {
          position: relative;
          height: 24px;
          margin-top: 6px;
        }

        .dot-slider {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 24px;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          pointer-events: none;
          margin: 0;
          padding: 0;
        }

        .dot-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          background: transparent;
          border: none;
        }

        .dot-slider::-moz-range-track {
          width: 100%;
          height: 4px;
          background: transparent;
          border: none;
        }

        .dot-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border: 2px solid #18181B;
          border-radius: 50%;
          cursor: grab;
          pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          margin-top: -6px;
        }

        .dot-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }

        .dot-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border: 2px solid #18181B;
          border-radius: 50%;
          cursor: grab;
          pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }

        .dot-slider::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }

        .dot-plot-axis {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #71717A;
          margin-top: 2px;
        }

        /* Value Inputs - Compact Inline */
        .value-inputs-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .value-input-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .value-input-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717A;
        }

        .value-input-wrapper {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .value-input-field {
          width: 70px;
          padding: 8px 10px;
          font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #E4E4E7;
          text-align: center;
          outline: none;
        }

        .value-input-field:focus {
          border-color: rgba(139, 92, 246, 0.5);
          background: rgba(139, 92, 246, 0.08);
        }

        .value-unit {
          font-size: 14px;
          color: #71717A;
        }

        .value-separator {
          font-size: 24px;
          color: #52525b;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .modal-cancel {
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 500;
          background: transparent;
          color: #71717A;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
        }

        .modal-cancel:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.15);
        }

        .modal-save {
          padding: 10px 24px;
          font-size: 13px;
          font-weight: 600;
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 2px 12px rgba(139, 92, 246, 0.3);
        }

        .modal-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
        }

        /* ===== INGREDIENT EXPLORER MODAL ===== */
        .ingredient-explorer-modal {
          width: 420px;
          max-width: 90vw;
          background: #0f0f14;
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          box-shadow: 0 0 60px rgba(139, 92, 246, 0.1), 0 25px 80px rgba(0,0,0,0.5);
          overflow: hidden;
          animation: modalEnter 0.25s ease-out;
        }

        .explorer-content {
          padding: 40px 32px;
          text-align: center;
        }

        .explorer-icon-container {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(167, 139, 250, 0.1) 100%);
          border: 1px solid rgba(139, 92, 246, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #A78BFA;
        }

        .explorer-main-title {
          font-size: 18px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 12px;
        }

        .explorer-description {
          font-size: 13px;
          color: #71717A;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .explorer-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(167, 139, 250, 0.1) 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          font-size: 11px;
          font-weight: 600;
          color: #A78BFA;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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
                    const showWarning = status === 'completed' && (step.status === 'draft' || step.status === 'incomplete');
                    
                    return (
                      <div key={step.number} className="step">
                        <div className="step-circle-wrapper">
                          <div
                            className={`step-circle ${stepClass}`}
                            title={showWarning ? (step.status === 'draft' ? 'Draft - Needs review' : 'Incomplete - Missing required fields') : ''}
                          >
                            {status === 'completed' && !showWarning ? (
                              <CheckIcon />
                            ) : (
                              step.number
                            )}
                          </div>
                          {showWarning && (
                            <div className={`warning-badge ${step.status}`} title={step.status === 'draft' ? 'Draft - Needs review' : 'Incomplete - Missing required fields'}>
                              !
                            </div>
                          )}
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
                <h1 className="project-title">{projectSummary.title}</h1>
                <p className="project-description">{projectSummary.description}</p>
              </div>
            </div>
          </header>

          {/* Section Header */}
          <div className="section-header">
            <div className="section-icon">
              <InputsIcon />
            </div>
            <div className="section-text">
              <h2 className="section-title">Configure Inputs</h2>
              <p className="section-subtitle">
                Define the inputs for your formulation project. Import from product defaults, 
                select from the library, or create custom inputs.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn primary" onClick={handleAddNew}>
              <PlusIcon />
              Add Input
              <kbd>⌘N</kbd>
            </button>
            <button className="action-btn defaults" onClick={handleImportDefaults}>
              <StarIcon filled />
              Add Defaults
              <kbd>⌘D</kbd>
            </button>
            <button className="action-btn" onClick={() => { setShowLibraryPanel(true); setLibraryTab('product'); }}>
              <LibraryIcon />
              Library
              <kbd>⌘L</kbd>
            </button>
            <button className="action-btn explore" onClick={() => setShowIngredientExplorer(true)}>
              <SearchIcon />
              Find Inputs
              <kbd>⌘F</kbd>
            </button>
          </div>

          {/* Stats */}
          {inputs.length > 0 && (
            <div className="stats-badge">
              <div className="stat-item">
                <span className="stat-value">{confirmedCount}</span>
                <span>confirmed</span>
              </div>
              {draftCount > 0 && (
                <div className="stat-item draft">
                  <span className="stat-value">{draftCount}</span>
                  <span>drafts</span>
                </div>
              )}
            </div>
          )}

          {/* Table Container */}
          <div className="table-container">
            {inputs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <InputsIcon />
                </div>
                <h3 className="empty-state-title">No inputs configured</h3>
                <p className="empty-state-text">
                  Get started by importing product defaults, adding from the library, 
                  or creating a new input manually.
                </p>
              </div>
            ) : (
              <table className="inputs-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Name</th>
                    <th style={{ width: '12%' }}>Input Type</th>
                    <th style={{ width: '12%' }}>Variable Type</th>
                    <th style={{ width: '22%' }}>Range / Levels</th>
                    <th style={{ width: '10%' }}>Cost</th>
                    <th style={{ width: '18%' }}>Description</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {inputs.map(input => (
                    <InputRow
                      key={input.id}
                      input={input}
                      onUpdate={(updated) => setInputs(prev => prev.map(i => i.id === input.id ? updated : i))}
                      onDelete={() => deleteInput(input.id)}
                      onConfirm={confirmInput}
                      onOpenRangeExplorer={setRangeExplorerInput}
                      allProductInputs={productInputs}
                      allLibraryInputs={libraryInputs}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary">
              Save as Draft
            </button>
            <button 
              className="btn btn-primary" 
              disabled={inputs.length === 0}
            >
              Continue to Constraints
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
              <div className="chat-subtitle">Input Configuration Assistant</div>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.map(message => (
              <div key={message.id} className={`chat-message ${message.role}`}>
                {message.role === 'assistant' && (
                  <div className="avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2v4m0 12v4"/>
                    </svg>
                  </div>
                )}
                <div className="message-content">{message.content}</div>
              </div>
            ))}
          </div>

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about inputs..."
              />
              <button className="send-btn" onClick={sendMessage}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Library Panel (Slide-over) */}
      {showLibraryPanel && (
        <LibraryPanel
          activeTab={libraryTab}
          onTabChange={setLibraryTab}
          productInputs={productInputs}
          libraryInputs={libraryInputs}
          onImport={addFromSelection}
          onImportDefaults={handleImportDefaults}
          onClose={() => setShowLibraryPanel(false)}
        />
      )}

      {/* Range Explorer Modal */}
      {rangeExplorerInput && (
        <RangeExplorerModal
          input={rangeExplorerInput}
          onSave={(minValue, maxValue) => {
            setInputs(prev => prev.map(i => 
              i.id === rangeExplorerInput.id 
                ? { ...i, minValue, maxValue } 
                : i
            ));
            setRangeExplorerInput(null);
          }}
          onClose={() => setRangeExplorerInput(null)}
        />
      )}

      {/* Ingredient Explorer Modal (Find New Inputs) */}
      {showIngredientExplorer && (
        <IngredientExplorerModal onClose={() => setShowIngredientExplorer(false)} />
      )}
    </>
  );
}
