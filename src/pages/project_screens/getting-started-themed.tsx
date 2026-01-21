import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { INPUT_LIBRARY, OUTCOME_LIBRARY } from '../../data/demoLibrary';
import { generateGoalsFromOperations } from '../../utils/goalGenerators';

// Unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Sample formulation data (matching the upload.tsx structure)
const sampleFormulations = [
  { Formulation_ID: 'F001', Flour: 250, Sugar: 120, Butter: 100, Eggs: 2, Cocoa_Powder: 30, Baking_Temperature: 175, Moisture_Content: 6.2, pH_Level: 5.8, Overall_Liking: 7.5, Texture_Score: 8.1, Purchase_Intent: 4 },
  { Formulation_ID: 'F002', Flour: 275, Sugar: 100, Butter: 120, Eggs: 3, Cocoa_Powder: 25, Baking_Temperature: 180, Moisture_Content: 5.8, pH_Level: 5.6, Overall_Liking: 8.2, Texture_Score: 7.8, Purchase_Intent: 5 },
  { Formulation_ID: 'F003', Flour: 225, Sugar: 140, Butter: 90, Eggs: 2, Cocoa_Powder: 35, Baking_Temperature: 170, Moisture_Content: 6.8, pH_Level: 5.9, Overall_Liking: 6.9, Texture_Score: 7.5, Purchase_Intent: 3 },
  { Formulation_ID: 'F004', Flour: 260, Sugar: 110, Butter: 110, Eggs: 3, Cocoa_Powder: 28, Baking_Temperature: 178, Moisture_Content: 6.0, pH_Level: 5.7, Overall_Liking: 7.8, Texture_Score: 8.0, Purchase_Intent: 4 },
  { Formulation_ID: 'F005', Flour: 240, Sugar: 130, Butter: 95, Eggs: 2, Cocoa_Powder: 32, Baking_Temperature: 172, Moisture_Content: 6.5, pH_Level: 5.8, Overall_Liking: 7.2, Texture_Score: 7.6, Purchase_Intent: 4 },
  { Formulation_ID: 'F006', Flour: 280, Sugar: 95, Butter: 125, Eggs: 3, Cocoa_Powder: 22, Baking_Temperature: 182, Moisture_Content: 5.5, pH_Level: 5.5, Overall_Liking: 8.5, Texture_Score: 8.3, Purchase_Intent: 5 },
];

const inputColumns = ['Flour', 'Sugar', 'Butter', 'Eggs', 'Cocoa_Powder', 'Baking_Temperature'];
const outcomeColumns = ['Moisture_Content', 'pH_Level', 'Overall_Liking', 'Texture_Score', 'Purchase_Intent'];

// Sample input library for substitutions
const inputLibrary = [
  { id: 'lib-1', name: 'Almond Flour', inputType: 'Ingredient', variableType: 'Continuous', description: 'Gluten-free flour alternative', cost: 4.50 },
  { id: 'lib-2', name: 'Coconut Flour', inputType: 'Ingredient', variableType: 'Continuous', description: 'High fiber, low carb', cost: 3.80 },
  { id: 'lib-3', name: 'Oat Flour', inputType: 'Ingredient', variableType: 'Continuous', description: 'Whole grain option', cost: 2.20 },
  { id: 'lib-4', name: 'Rice Flour', inputType: 'Ingredient', variableType: 'Continuous', description: 'Light texture, neutral taste', cost: 1.90 },
  { id: 'lib-5', name: 'Stevia', inputType: 'Ingredient', variableType: 'Continuous', description: 'Zero calorie sweetener', cost: 8.00 },
  { id: 'lib-6', name: 'Erythritol', inputType: 'Ingredient', variableType: 'Continuous', description: 'Sugar alcohol, low glycemic', cost: 6.50 },
  { id: 'lib-7', name: 'Monk Fruit', inputType: 'Ingredient', variableType: 'Continuous', description: 'Natural zero-cal sweetener', cost: 12.00 },
  { id: 'lib-8', name: 'Honey', inputType: 'Ingredient', variableType: 'Continuous', description: 'Natural sweetener', cost: 5.00 },
  { id: 'lib-9', name: 'Coconut Oil', inputType: 'Ingredient', variableType: 'Continuous', description: 'Dairy-free fat', cost: 4.20 },
  { id: 'lib-10', name: 'Avocado Oil', inputType: 'Ingredient', variableType: 'Continuous', description: 'Heart-healthy fat', cost: 7.50 },
  { id: 'lib-11', name: 'Ghee', inputType: 'Ingredient', variableType: 'Continuous', description: 'Clarified butter', cost: 6.00 },
  { id: 'lib-12', name: 'Applesauce', inputType: 'Ingredient', variableType: 'Continuous', description: 'Egg/fat replacement', cost: 1.50 },
  { id: 'lib-13', name: 'Flax Egg', inputType: 'Ingredient', variableType: 'Continuous', description: 'Vegan egg substitute', cost: 2.00 },
  { id: 'lib-14', name: 'Aquafaba', inputType: 'Ingredient', variableType: 'Continuous', description: 'Chickpea water, vegan', cost: 0.50 },
  { id: 'lib-15', name: 'Cacao Powder', inputType: 'Ingredient', variableType: 'Continuous', description: 'Raw, unprocessed cocoa', cost: 5.50 },
  { id: 'lib-16', name: 'Carob Powder', inputType: 'Ingredient', variableType: 'Continuous', description: 'Caffeine-free cocoa alt', cost: 4.00 },
];

// Product-specific inputs (from the current product)
const productInputs = [
  { id: 'prod-1', name: 'All-Purpose Flour', inputType: 'Ingredient', variableType: 'Continuous', description: 'Standard wheat flour', cost: 1.20, isDefault: true },
  { id: 'prod-2', name: 'Bread Flour', inputType: 'Ingredient', variableType: 'Continuous', description: 'High protein flour', cost: 1.50 },
  { id: 'prod-3', name: 'Cake Flour', inputType: 'Ingredient', variableType: 'Continuous', description: 'Low protein, fine texture', cost: 1.80 },
  { id: 'prod-4', name: 'Granulated Sugar', inputType: 'Ingredient', variableType: 'Continuous', description: 'Standard white sugar', cost: 0.80, isDefault: true },
  { id: 'prod-5', name: 'Brown Sugar', inputType: 'Ingredient', variableType: 'Continuous', description: 'Molasses-containing sugar', cost: 1.10 },
  { id: 'prod-6', name: 'Unsalted Butter', inputType: 'Ingredient', variableType: 'Continuous', description: 'Standard dairy butter', cost: 3.50, isDefault: true },
  { id: 'prod-7', name: 'Salted Butter', inputType: 'Ingredient', variableType: 'Continuous', description: 'Butter with salt', cost: 3.50 },
  { id: 'prod-8', name: 'Large Eggs', inputType: 'Ingredient', variableType: 'Continuous', description: 'Standard eggs', cost: 0.30, isDefault: true },
  { id: 'prod-9', name: 'Dutch Process Cocoa', inputType: 'Ingredient', variableType: 'Continuous', description: 'Alkalized cocoa powder', cost: 4.50, isDefault: true },
  { id: 'prod-10', name: 'Natural Cocoa', inputType: 'Ingredient', variableType: 'Continuous', description: 'Non-alkalized cocoa', cost: 3.80 },
];

// Icons
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 7l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FlaskIcon = () => (
  <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 6v14l-8 16a2 2 0 001.8 3h24.4a2 2 0 001.8-3l-8-16V6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 6h16" strokeLinecap="round" />
    <circle cx="20" cy="32" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="28" cy="30" r="1.5" fill="currentColor" opacity="0.4" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
);

const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const MaximizeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
  </svg>
);

const MinimizeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 14h6v6m10-10h-6V4m0 6l7-7M3 21l7-7" />
  </svg>
);

const LinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const BeakerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 3h15M6 3v16a2 2 0 002 2h8a2 2 0 002-2V3" />
    <path d="M6 14h12" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ProductIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const LibraryIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const MagnifyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const LunaIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/>
  </svg>
);

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const InputTypeTag = ({ type, small }) => {
  const colors = {
    'Ingredient': { bg: 'rgba(45, 212, 191, 0.15)', text: '#2DD4BF', border: 'rgba(45, 212, 191, 0.3)' },
    'Processing': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
    'Other': { bg: 'rgba(167, 139, 250, 0.15)', text: '#A78BFA', border: 'rgba(167, 139, 250, 0.3)' },
  };
  const c = colors[type] || colors['Other'];
  return (
    <span style={{
      padding: small ? '2px 5px' : '3px 8px',
      borderRadius: '4px',
      fontSize: small ? '9px' : '10px',
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
    }}>
      {type === 'Processing' ? 'Process' : type}
    </span>
  );
};

// Custom Select Component
const Select = ({ value, onChange, options, placeholder, onCreateNew, createLabel = "Create new" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newValue, setNewValue] = useState('');
  const selected = options.find(o => o.value === value);

  const handleCreateNew = () => {
    if (newValue.trim()) {
      onCreateNew(newValue.trim());
      setNewValue('');
      setShowCreateNew(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="select-wrapper" onClick={() => !showCreateNew && setIsOpen(!isOpen)}>
      <div className={`select-display ${!value ? 'placeholder' : ''}`}>
        {selected?.label || placeholder}
        <ChevronDown />
      </div>
      {isOpen && !showCreateNew && (
        <>
          <div className="select-backdrop" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="select-dropdown">
            {options.map(opt => (
              <div
                key={opt.value}
                className={`select-option ${opt.value === value ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
            {onCreateNew && (
              <>
                <div className="select-divider"></div>
                <div
                  className="select-option create-new"
                  onClick={(e) => { e.stopPropagation(); setShowCreateNew(true); setIsOpen(false); }}
                >
                  <PlusIcon />
                  <span>{createLabel}</span>
                </div>
              </>
            )}
          </div>
        </>
      )}
      {showCreateNew && (
        <>
          <div className="select-backdrop" onClick={(e) => { e.stopPropagation(); setShowCreateNew(false); }} />
          <div className="create-new-dropdown">
            <div className="create-new-header">{createLabel}</div>
            <input
              type="text"
              className="create-new-input"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') handleCreateNew();
                if (e.key === 'Escape') { setShowCreateNew(false); setNewValue(''); }
              }}
              placeholder="Enter name..."
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <div className="create-new-actions">
              <button 
                className="create-new-cancel" 
                onClick={(e) => { e.stopPropagation(); setShowCreateNew(false); setNewValue(''); }}
              >
                Cancel
              </button>
              <button 
                className="create-new-save" 
                onClick={(e) => { e.stopPropagation(); handleCreateNew(); }}
                disabled={!newValue.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message }) => (
  <div className={`chat-message ${message.role}`}>
    {message.role === 'assistant' && (
      <div className="avatar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
        </svg>
      </div>
    )}
    <div className="message-content">{message.content}</div>
  </div>
);

// Formula Detail View (when a formula is selected)
const FormulaDetailView = ({ formula, onClear, showInputsFirst, panelColor }) => {
  const inputData = inputColumns.map(col => ({ name: col.replace(/_/g, ' '), value: formula[col], type: 'input' }));
  const outcomeData = outcomeColumns.map(col => ({ name: col.replace(/_/g, ' '), value: formula[col], type: 'outcome' }));
  
  const primaryData = showInputsFirst ? inputData : outcomeData;
  const secondaryData = showInputsFirst ? outcomeData : inputData;
  const primaryLabel = showInputsFirst ? 'Inputs' : 'Outcomes';
  const secondaryLabel = showInputsFirst ? 'Outcomes' : 'Inputs';
  const primaryColor = showInputsFirst ? '#2DD4BF' : '#F472B6';
  const secondaryColor = showInputsFirst ? '#F472B6' : '#2DD4BF';

  return (
    <div className="formula-detail">
      <div className="formula-detail-header">
        <div className="formula-detail-id" style={{ color: panelColor }}>{formula.Formulation_ID}</div>
        <button className="formula-clear-btn" onClick={onClear}>
          <XIcon /> Clear
        </button>
      </div>
      
      <div className="formula-detail-sections">
        <div className="formula-detail-section">
          <div className="formula-section-label" style={{ color: primaryColor }}>
            <span className="section-dot" style={{ background: primaryColor }} />
            {primaryLabel}
          </div>
          <div className="formula-attributes">
            {primaryData.map((item, idx) => (
              <div key={idx} className="formula-attribute" style={{ borderLeftColor: `${primaryColor}33` }}>
                <span className="attr-name">{item.name}</span>
                <span className="attr-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="formula-detail-section">
          <div className="formula-section-label" style={{ color: secondaryColor }}>
            <span className="section-dot" style={{ background: secondaryColor }} />
            {secondaryLabel}
          </div>
          <div className="formula-attributes">
            {secondaryData.map((item, idx) => (
              <div key={idx} className="formula-attribute" style={{ borderLeftColor: `${secondaryColor}33` }}>
                <span className="attr-name">{item.name}</span>
                <span className="attr-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Formula Table View (default view for each panel)
const FormulaTableView = ({ 
  data, 
  onSelect, 
  selectedId,
  showInputsFirst,
  searchQuery,
  onSearchChange,
  panelColor,
}) => {
  const columns = showInputsFirst 
    ? ['Formulation_ID', ...inputColumns, ...outcomeColumns]
    : ['Formulation_ID', ...outcomeColumns, ...inputColumns];

  const filteredData = data.filter(row => 
    row.Formulation_ID.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="formula-table-container">
      <div className="formula-search">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search formulations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="formula-table-scroll">
        <table className="formula-table">
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const isId = col === 'Formulation_ID';
                const isInput = inputColumns.includes(col);
                return (
                  <th 
                    key={col} 
                    className={isId ? 'col-id' : isInput ? 'col-input' : 'col-outcome'}
                  >
                    {col.replace(/_/g, ' ')}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIdx) => (
              <tr 
                key={row.Formulation_ID}
                className={selectedId === row.Formulation_ID ? 'selected' : ''}
                onClick={() => onSelect(row)}
                style={selectedId === row.Formulation_ID ? { 
                  background: `${panelColor}15`,
                  boxShadow: `inset 3px 0 0 ${panelColor}`,
                } : {}}
              >
                {columns.map((col, colIdx) => {
                  const isId = col === 'Formulation_ID';
                  return (
                    <td key={col} className={isId ? 'col-id' : 'col-data'}>
                      {row[col]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Single Formula Panel Component
const FormulaPanel = ({
  title,
  subtitle,
  icon,
  color,
  colorRgb,
  selectedFormula,
  onSelectFormula,
  onClearFormula,
  showInputsFirst,
  linkLabel,
  isLinked,
  onLinkToggle,
  linkedToId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="formula-panel" style={{ borderColor: selectedFormula ? `${color}33` : undefined }}>
      <div className="formula-panel-header" style={{ 
        background: selectedFormula ? `linear-gradient(135deg, ${color}08 0%, transparent 100%)` : undefined 
      }}>
        <div className="panel-title-area">
          <div className="panel-icon" style={{ background: `${color}15`, borderColor: `${color}33`, color }}>
            {icon}
          </div>
          <div className="panel-title-text">
            <div className="panel-title">{title}</div>
            <div className="panel-subtitle">{subtitle}</div>
          </div>
        </div>
        <div className="panel-actions">
          <button className="panel-btn" title="Upload file">
            <UploadIcon />
          </button>
          <button className="panel-btn" title="Paste data">
            <ClipboardIcon />
          </button>
          <button className="panel-btn" title="Manual entry">
            <EditIcon />
          </button>
          {linkLabel && (
            <button 
              className={`panel-btn link-btn ${isLinked ? 'active' : ''}`}
              onClick={onLinkToggle}
              title={linkLabel}
              style={isLinked ? { background: `${color}20`, borderColor: `${color}40`, color } : {}}
            >
              <LinkIcon />
              <span>Same</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="formula-panel-body">
        {selectedFormula ? (
          <FormulaDetailView 
            formula={selectedFormula} 
            onClear={onClearFormula}
            showInputsFirst={showInputsFirst}
            panelColor={color}
          />
        ) : isLinked && linkedToId ? (
          <div className="linked-placeholder">
            <LinkIcon />
            <span>Linked to Reference: <strong>{linkedToId}</strong></span>
          </div>
        ) : (
          <FormulaTableView
            data={sampleFormulations}
            onSelect={onSelectFormula}
            selectedId={selectedFormula?.Formulation_ID}
            showInputsFirst={showInputsFirst}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            panelColor={color}
          />
        )}
      </div>
    </div>
  );
};

// Main Component
export default function GettingStartedPage() {
  const navigate = useNavigate();
  const {
    productCategories,
    setProductCategories,
    projectMetadata,
    setProjectMetadata,
    stepStatuses,
    setStepStatus,
    setProjectGoals,
    setProjectCombinations
  } = useData();

  const currentStep = 1;

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

  const getStepStatus = (stepNumber) => {
    if (stepNumber === currentStep) {
      if (stepStatuses[stepNumber] === 'draft') return 'draft';
      return 'current';
    }
    if (stepStatuses[stepNumber] === 'completed') return 'completed';
    if (stepStatuses[stepNumber] === 'draft') return 'draft';
    if (stepStatuses[stepNumber] === 'incomplete') return 'incomplete';
    return 'upcoming';
  };

  const getStepClass = (step) => getStepStatus(step.number);

  const handleStepClick = (stepNumber) => {
    const currentStatus = stepStatuses[currentStep];
    if (currentStatus !== 'completed' && currentStatus !== 'draft') {
      setStepStatus(currentStep, 'incomplete');
    }
    navigate(`/project/new/step-${stepNumber}`);
  };

  const handleContinue = () => {
    if (!isValid) return;

    // If substitute ingredient is checked and we have a reference, show the modal first
    if (substituteIngredient && referenceFormula && !showSubstituteModal) {
      setShowSubstituteModal(true);
      return;
    }

    // Generate goals and combinations from operations
    const { goals: generatedGoals, calculations: generatedCalculations } = generateGoalsFromOperations({
      substituteIngredient,
      selectedIngredientsToSub,
      substituteSelections,
      preserveLabel,
      referenceFormula,
      labelTolerance,
      matchOutcomes,
      targetFormula,
      inputColumns,
      outcomeColumns,
      inputLibrary: INPUT_LIBRARY,
      outcomeLibrary: OUTCOME_LIBRARY
    });

    // Save generated goals to context
    if (generatedGoals.length > 0) {
      setProjectGoals(generatedGoals);
    }

    // Save generated combinations to context
    if (generatedCalculations.length > 0) {
      setProjectCombinations(generatedCalculations);
    }

    setProjectMetadata({
      id: projectMetadata?.id || generateId(),
      name: projectName,
      category: selectedCategory,
      description: projectDescription,
      createdAt: projectMetadata?.createdAt || Date.now(),
      updatedAt: Date.now(),
      // Save formula selections for downstream pages
      referenceFormula: referenceFormula || undefined,
      targetFormula: targetFormula || undefined,
      preserveLabel: preserveLabel,
      labelTolerance: labelTolerance,
      matchOutcomes: matchOutcomes,
      substituteSelections: substituteSelections,
      inputColumns: inputColumns,
    });

    setStepStatus(currentStep, 'completed');
    navigate('/project/new/step-2');
  };

  const handleSubstituteConfirm = () => {
    setShowSubstituteModal(false);

    // Build selectedIngredientsToSub from substituteSelections
    // If an ingredient has any substitutes selected, mark it as true
    const ingredientsToSubstitute: Record<string, boolean> = {};
    for (const [ingredient, substitutes] of Object.entries(substituteSelections)) {
      if (Array.isArray(substitutes) && substitutes.length > 0) {
        ingredientsToSubstitute[ingredient] = true;
      }
    }

    // Generate goals and combinations from operations
    const { goals: generatedGoals, calculations: generatedCalculations } = generateGoalsFromOperations({
      substituteIngredient,
      selectedIngredientsToSub: ingredientsToSubstitute,
      substituteSelections,
      preserveLabel,
      referenceFormula,
      labelTolerance,
      matchOutcomes,
      targetFormula,
      inputColumns,
      outcomeColumns,
      inputLibrary: INPUT_LIBRARY,
      outcomeLibrary: OUTCOME_LIBRARY
    });

    // Save generated goals to context
    if (generatedGoals.length > 0) {
      setProjectGoals(generatedGoals);
    }

    // Save generated combinations to context
    if (generatedCalculations.length > 0) {
      setProjectCombinations(generatedCalculations);
    }

    setProjectMetadata({
      id: projectMetadata?.id || generateId(),
      name: projectName,
      category: selectedCategory,
      description: projectDescription,
      createdAt: projectMetadata?.createdAt || Date.now(),
      updatedAt: Date.now(),
      // Save formula selections for downstream pages
      referenceFormula: referenceFormula || undefined,
      targetFormula: targetFormula || undefined,
      preserveLabel: preserveLabel,
      labelTolerance: labelTolerance,
      matchOutcomes: matchOutcomes,
      substituteSelections: substituteSelections,
      inputColumns: inputColumns,
    });

    setStepStatus(currentStep, 'completed');
    navigate('/project/new/step-2');
  };

  const toggleIngredientToSub = (ingredientName) => {
    setSelectedIngredientsToSub(prev => ({
      ...prev,
      [ingredientName]: !prev[ingredientName]
    }));
  };

  const addSubstituteSelection = (ingredientName, item) => {
    setSubstituteSelections(prev => ({
      ...prev,
      [ingredientName]: [...(prev[ingredientName] || []), item]
    }));
  };

  const removeSubstituteSelection = (ingredientName, itemId) => {
    setSubstituteSelections(prev => ({
      ...prev,
      [ingredientName]: (prev[ingredientName] || []).filter(s => s.id !== itemId)
    }));
  };

  const getFilteredSubstituteItems = (ingredientName) => {
    let items = [];
    
    if (substituteLibraryTab === 'recommended') {
      // Get recommendations based on the specific ingredient
      if (ingredientName) {
        const lowerName = ingredientName.toLowerCase();
        items = inputLibrary.filter(item => {
          if (lowerName.includes('flour')) return item.name.toLowerCase().includes('flour');
          if (lowerName.includes('sugar')) return ['stevia', 'erythritol', 'monk', 'honey'].some(s => item.name.toLowerCase().includes(s));
          if (lowerName.includes('butter')) return ['oil', 'ghee'].some(s => item.name.toLowerCase().includes(s));
          if (lowerName.includes('egg')) return ['egg', 'aquafaba', 'applesauce', 'flax'].some(s => item.name.toLowerCase().includes(s));
          if (lowerName.includes('cocoa')) return ['cacao', 'carob'].some(s => item.name.toLowerCase().includes(s));
          return false;
        });
      }
    } else if (substituteLibraryTab === 'product') {
      items = productInputs.filter(i => i.inputType === 'Ingredient');
    } else {
      items = inputLibrary;
    }
    
    if (substituteSearchQuery) {
      const query = substituteSearchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    return items;
  };

  const sendSubstituteChat = () => {
    if (!substituteChatInput.trim()) return;
    
    setSubstituteChatMessages(prev => [
      ...prev,
      { id: generateId(), role: 'user', content: substituteChatInput },
      { id: generateId(), role: 'assistant', content: "That's a great question! For sugar substitutes in baked goods, I'd recommend trying Erythritol or Monk Fruit for a zero-calorie option that maintains sweetness. Honey works well if you're okay with natural sugars." }
    ]);
    setSubstituteChatInput('');
  };

  const handleSaveAsDraft = () => {
    setProjectMetadata({
      id: projectMetadata?.id || generateId(),
      name: projectName,
      category: selectedCategory,
      description: projectDescription,
      createdAt: projectMetadata?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });

    setStepStatus(currentStep, 'draft');
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Form state
  const [selectedCategory, setSelectedCategory] = useState(projectMetadata?.category || '');
  const [projectName, setProjectName] = useState(projectMetadata?.name || '');
  const [projectDescription, setProjectDescription] = useState(projectMetadata?.description || '');
  const [categories, setCategories] = useState(productCategories);

  // Starting point state
  const [referenceFormula, setReferenceFormula] = useState(null);
  const [targetFormula, setTargetFormula] = useState(null);
  const [linkPanels, setLinkPanels] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // Project requirements
  const [preserveLabel, setPreserveLabel] = useState(false);
  const [labelTolerance, setLabelTolerance] = useState('5');
  const [substituteIngredient, setSubstituteIngredient] = useState(false);
  const [matchOutcomes, setMatchOutcomes] = useState(false);
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [selectedIngredientsToSub, setSelectedIngredientsToSub] = useState({});
  const [substituteSelections, setSubstituteSelections] = useState({});
  const [substituteLibraryTab, setSubstituteLibraryTab] = useState('recommended');
  const [substituteSearchQuery, setSubstituteSearchQuery] = useState('');
  const [activeSubIngredient, setActiveSubIngredient] = useState(null);
  const [substituteChatMessages, setSubstituteChatMessages] = useState([
    { id: '1', role: 'assistant', content: "I can help you find ingredient substitutes. Select an ingredient on the left, then browse options or ask me for recommendations!" }
  ]);
  const [substituteChatInput, setSubstituteChatInput] = useState('');

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { id: '1', role: 'assistant', content: "Welcome! Let's start by setting up your new formulation project." }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleCreateCategory = (categoryName) => {
    const newCategory = { value: categoryName.toLowerCase().replace(/\s+/g, '_'), label: categoryName };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    setProductCategories(updatedCategories);
    setSelectedCategory(newCategory.value);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      { id: generateId(), role: 'user', content: chatInput },
      { id: generateId(), role: 'assistant', content: "That sounds like an interesting project!" }
    ]);
    setChatInput('');
  };

  const isValid = projectName.trim().length > 0 && selectedCategory;

  const handleLinkToggle = () => {
    const newLinkState = !linkPanels;
    setLinkPanels(newLinkState);
    if (newLinkState && referenceFormula) {
      setTargetFormula(referenceFormula);
    } else if (!newLinkState) {
      // Keep target as is when unlinking
    }
  };

  const handleSelectReference = (formula) => {
    setReferenceFormula(formula);
    if (linkPanels) {
      setTargetFormula(formula);
    }
  };

  const handleSelectTarget = (formula) => {
    if (!linkPanels) {
      setTargetFormula(formula);
    }
  };

  const handleClearReference = () => {
    setReferenceFormula(null);
    if (linkPanels) {
      setTargetFormula(null);
    }
  };

  const handleClearTarget = () => {
    if (!linkPanels) {
      setTargetFormula(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #09090b;
          color: #E4E4E7;
          line-height: 1.5;
        }

        .page-container {
          display: grid;
          grid-template-columns: 1fr 360px;
          min-height: 100vh;
          background: #09090b;
        }

        .main-content {
          padding: 24px 32px;
          overflow-y: auto;
          max-height: 100vh;
          background: linear-gradient(180deg, rgba(45, 212, 191, 0.02) 0%, transparent 40%);
        }

        /* Stepper */
        .stepper-header-section {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .stepper-top {
          margin-bottom: 16px;
        }

        .stepper-title {
          font-size: 14px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 2px;
        }

        .stepper-subtitle {
          font-size: 11px;
          color: #71717A;
        }

        .progress-wrapper { position: relative; }

        .progress-line-container {
          position: absolute;
          top: 14px;
          left: 0;
          right: 0;
          height: 2px;
          padding: 0 14px;
        }

        .progress-line-bg {
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
          transition: width 0.4s ease;
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
          cursor: pointer;
        }

        .step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          font-size: 11px;
          transition: all 0.2s ease;
          background: #18181B;
        }

        .step-circle.completed {
          background: linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%);
          color: #0a0a0f;
        }

        .step-circle.current {
          background: linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%);
          color: #0a0a0f;
          box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2);
        }

        .step-circle.upcoming {
          color: #52525b;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .step-circle.draft {
          color: #F59E0B;
          border: 2px solid #F59E0B;
        }

        .step-circle.incomplete {
          color: #EF4444;
          border: 2px solid #EF4444;
        }

        .step-circle:hover { transform: scale(1.1); }

        .step-label {
          margin-top: 6px;
          text-align: center;
          max-width: 70px;
          font-size: 9px;
          font-weight: 500;
          line-height: 1.2;
        }

        .step-label.current { color: #2DD4BF; }
        .step-label.completed { color: #A1A1AA; }
        .step-label.upcoming { color: #52525b; }
        .step-label.draft { color: #F59E0B; }
        .step-label.incomplete { color: #EF4444; }

        /* Basic Info Section - Compact Horizontal Layout */
        .basic-info-section {
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .section-icon {
          color: #2DD4BF;
          opacity: 0.9;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .section-subtitle {
          font-size: 12px;
          color: #71717A;
          margin-left: auto;
        }

        .basic-info-grid {
          display: grid;
          grid-template-columns: 200px 1fr 1fr;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .form-group { display: flex; flex-direction: column; }

        .form-label {
          font-size: 10px;
          font-weight: 600;
          color: #71717A;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-label .required { color: #2DD4BF; margin-left: 2px; }

        .form-input, .form-textarea {
          padding: 8px 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          background: rgba(255,255,255,0.03);
          color: #E4E4E7;
          transition: all 0.15s ease;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: rgba(45, 212, 191, 0.5);
          background: rgba(45, 212, 191, 0.05);
        }

        .form-input::placeholder, .form-textarea::placeholder { color: #52525b; }

        .form-textarea {
          resize: none;
          min-height: 36px;
        }

        /* Select */
        .select-wrapper { position: relative; cursor: pointer; }

        .select-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 13px;
          color: #E4E4E7;
          transition: all 0.15s ease;
        }

        .select-display:hover { border-color: rgba(255,255,255,0.15); }
        .select-display.placeholder { color: #52525b; }

        .select-backdrop { position: fixed; inset: 0; z-index: 10; }

        .select-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #1a1a22;
          border: 1px solid rgba(45, 212, 191, 0.2);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          z-index: 20;
          max-height: 200px;
          overflow-y: auto;
        }

        .select-option {
          padding: 8px 10px;
          font-size: 12px;
          cursor: pointer;
          color: #A1A1AA;
          transition: all 0.1s ease;
        }

        .select-option:hover { background: rgba(45, 212, 191, 0.08); color: #E4E4E7; }
        .select-option.selected { background: rgba(45, 212, 191, 0.12); color: #2DD4BF; font-weight: 500; }
        .select-option.create-new { display: flex; align-items: center; gap: 6px; color: #2DD4BF; font-weight: 500; }
        .select-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }

        .create-new-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #1a1a22;
          border: 1px solid rgba(45, 212, 191, 0.3);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          z-index: 20;
          overflow: hidden;
        }

        .create-new-header {
          padding: 8px 10px;
          font-size: 10px;
          font-weight: 600;
          color: #2DD4BF;
          background: rgba(45, 212, 191, 0.05);
          border-bottom: 1px solid rgba(45, 212, 191, 0.15);
          text-transform: uppercase;
        }

        .create-new-input {
          width: 100%;
          padding: 10px;
          border: none;
          outline: none;
          font-size: 13px;
          background: transparent;
          color: #E4E4E7;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .create-new-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
          padding: 8px 10px;
          background: rgba(0,0,0,0.2);
        }

        .create-new-cancel, .create-new-save {
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
        }

        .create-new-cancel {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #71717A;
        }

        .create-new-save {
          background: linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%);
          border: none;
          color: #0a0a0f;
        }

        .create-new-save:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Requirements Row */
        .requirements-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .requirement-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .requirement-chip:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.12);
        }

        .requirement-chip.checked {
          background: rgba(45, 212, 191, 0.08);
          border-color: rgba(45, 212, 191, 0.25);
        }

        .requirement-chip.target-chip.checked {
          background: rgba(244, 114, 182, 0.08);
          border-color: rgba(244, 114, 182, 0.25);
        }

        .chip-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 2px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .chip-checkbox.checked {
          background: #2DD4BF;
          border-color: #2DD4BF;
          color: #0a0a0f;
        }

        .chip-checkbox.target-checkbox.checked {
          background: #F472B6;
          border-color: #F472B6;
        }

        .chip-label {
          font-size: 12px;
          font-weight: 500;
          color: #A1A1AA;
        }

        .requirement-chip.checked .chip-label { color: #E4E4E7; }

        .chip-warning {
          font-size: 10px;
          color: #FB923C;
          margin-left: 4px;
        }

        .chip-reference {
          font-size: 10px;
          color: #2DD4BF;
          margin-left: 4px;
          font-weight: 500;
        }

        .chip-reference.chip-target {
          color: #F472B6;
        }

        /* Requirement hint badges - always visible */
        .chip-req-hint {
          font-size: 9px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 4px;
          border-style: dashed;
          border-width: 1px;
        }

        .chip-req-hint.ref {
          color: rgba(45, 212, 191, 0.5);
          border-color: rgba(45, 212, 191, 0.3);
          background: transparent;
        }

        .chip-req-hint.ref.filled {
          color: #2DD4BF;
          border-color: rgba(45, 212, 191, 0.5);
          background: rgba(45, 212, 191, 0.1);
          border-style: solid;
        }

        .chip-req-hint.ref.warning {
          color: #F59E0B;
          border-color: rgba(245, 158, 11, 0.5);
          background: rgba(245, 158, 11, 0.1);
          border-style: solid;
        }

        .chip-req-hint.target {
          color: rgba(244, 114, 182, 0.5);
          border-color: rgba(244, 114, 182, 0.3);
          background: transparent;
        }

        .chip-req-hint.target.filled {
          color: #F472B6;
          border-color: rgba(244, 114, 182, 0.5);
          background: rgba(244, 114, 182, 0.1);
          border-style: solid;
        }

        .chip-req-hint.target.warning {
          color: #F59E0B;
          border-color: rgba(245, 158, 11, 0.5);
          background: rgba(245, 158, 11, 0.1);
          border-style: solid;
        }

        .chip-divider {
          width: 1px;
          height: 14px;
          background: rgba(255,255,255,0.15);
          margin: 0 6px;
        }

        .preserve-label-input {
          display: flex;
          align-items: center;
          gap: 1px;
          font-size: 10px;
          color: #A1A1AA;
        }

        .preserve-label-input input {
          width: 28px;
          padding: 1px 3px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 3px;
          font-size: 10px;
          color: #E4E4E7;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
        }

        .preserve-label-input input:focus {
          outline: none;
          border-color: rgba(45, 212, 191, 0.5);
        }

        .preserve-label-input input::-webkit-inner-spin-button,
        .preserve-label-input input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Substitute Modal - 3 Column Layout */
        .substitute-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .substitute-modal {
          width: 100%;
          max-width: 1000px;
          height: calc(100vh - 80px);
          max-height: 700px;
          background: #0A0A0C;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
        }

        .substitute-modal-header {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.02);
          flex-shrink: 0;
        }

        .substitute-modal-title {
          font-size: 15px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .substitute-modal-subtitle {
          font-size: 11px;
          color: #71717A;
          margin-top: 2px;
        }

        .substitute-modal-body {
          flex: 1;
          display: grid;
          grid-template-columns: 200px 1fr 260px;
          min-height: 0;
          overflow: hidden;
        }

        /* LEFT: Ingredients List */
        .sub-ingredients-list {
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          background: rgba(0,0,0,0.15);
        }

        .sub-list-header {
          padding: 12px 14px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717A;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          background: rgba(10,10,12,0.95);
          backdrop-filter: blur(8px);
        }

        .sub-ingredient-row {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer;
          transition: all 0.1s ease;
        }

        .sub-ingredient-row:hover {
          background: rgba(255,255,255,0.03);
        }

        .sub-ingredient-row.active {
          background: rgba(167, 139, 250, 0.1);
          border-left: 3px solid #A78BFA;
          padding-left: 11px;
        }

        .sub-ingredient-row.has-subs:not(.active) {
          background: rgba(45, 212, 191, 0.04);
        }

        .sub-ing-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }

        .sub-ing-name {
          font-size: 12px;
          font-weight: 500;
          color: #E4E4E7;
        }

        .sub-ing-value {
          font-size: 10px;
          color: #71717A;
          font-family: 'JetBrains Mono', monospace;
        }

        .sub-ing-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 6px;
        }

        .sub-ing-chip {
          padding: 2px 6px;
          background: rgba(45, 212, 191, 0.1);
          border-radius: 4px;
          font-size: 9px;
          color: #2DD4BF;
        }

        .sub-ing-more {
          padding: 2px 6px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          font-size: 9px;
          color: #71717A;
        }

        /* MIDDLE: Picker Panel */
        .sub-picker-panel {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sub-picker-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #52525B;
          font-size: 13px;
          gap: 8px;
        }

        .empty-icon {
          font-size: 24px;
          opacity: 0.5;
        }

        .sub-picker-header {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(167, 139, 250, 0.05);
        }

        .sub-picker-title {
          font-size: 13px;
          color: #A1A1AA;
        }

        .sub-picker-title strong {
          color: #A78BFA;
        }

        .sub-picker-original {
          font-size: 11px;
          color: #52525B;
          margin-top: 2px;
        }

        .sub-picker-selected {
          padding: 10px 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(45, 212, 191, 0.03);
        }

        .selected-sub-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px 5px 10px;
          background: rgba(45, 212, 191, 0.12);
          border: 1px solid rgba(45, 212, 191, 0.3);
          border-radius: 6px;
          font-size: 11px;
          color: #2DD4BF;
          font-weight: 500;
        }

        .selected-sub-tag button {
          padding: 2px;
          background: none;
          border: none;
          color: rgba(45, 212, 191, 0.6);
          cursor: pointer;
          display: flex;
        }

        .selected-sub-tag button:hover {
          color: #EF4444;
        }

        .sub-picker-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .spt {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 500;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #71717A;
          cursor: pointer;
          transition: all 0.1s ease;
        }

        .spt:hover {
          background: rgba(255,255,255,0.03);
          color: #A1A1AA;
        }

        .spt.active {
          background: rgba(167, 139, 250, 0.12);
          border-color: rgba(167, 139, 250, 0.3);
          color: #A78BFA;
        }

        .spt.find-spt {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.25);
          color: #A78BFA;
          position: relative;
        }

        .soon-tag {
          position: absolute;
          top: -5px;
          right: -5px;
          padding: 1px 4px;
          background: #F59E0B;
          border-radius: 3px;
          font-size: 7px;
          font-weight: 700;
          color: #0a0a0f;
          text-transform: uppercase;
        }

        .sub-picker-search {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 12px 18px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #52525B;
        }

        .sub-picker-search input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 12px;
          color: #E4E4E7;
        }

        .sub-picker-search input::placeholder {
          color: #52525B;
        }

        .sub-picker-options {
          flex: 1;
          overflow-y: auto;
          padding: 0 18px 18px;
        }

        .sub-picker-no-results {
          text-align: center;
          padding: 30px;
          color: #52525B;
          font-size: 12px;
        }

        .sub-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          margin-bottom: 6px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.1s ease;
        }

        .sub-option:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }

        .sub-option.added {
          background: rgba(45, 212, 191, 0.05);
          border-color: rgba(45, 212, 191, 0.2);
          cursor: default;
        }

        .sub-option-info {
          flex: 1;
          min-width: 0;
        }

        .sub-option-name {
          font-size: 13px;
          font-weight: 500;
          color: #E4E4E7;
        }

        .sub-option-desc {
          font-size: 11px;
          color: #71717A;
          margin-top: 2px;
        }

        .sub-option-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          margin-left: 12px;
        }

        .sub-option-cost {
          font-size: 11px;
          color: #2DD4BF;
          font-weight: 500;
          font-family: 'JetBrains Mono', monospace;
        }

        .sub-option-add {
          padding: 5px 12px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(45, 212, 191, 0.1);
          border: 1px solid rgba(45, 212, 191, 0.3);
          border-radius: 6px;
          color: #2DD4BF;
          cursor: pointer;
        }

        .sub-option-add:hover {
          background: rgba(45, 212, 191, 0.2);
        }

        .sub-option-added {
          font-size: 11px;
          color: #2DD4BF;
          font-weight: 500;
        }

        /* RIGHT: Chat Panel */
        .sub-chat-panel {
          border-left: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          background: #08080A;
        }

        .sub-chat-head {
          padding: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(180deg, rgba(167, 139, 250, 0.05) 0%, transparent 100%);
        }

        .sub-chat-icon {
          width: 28px;
          height: 28px;
          background: rgba(167, 139, 250, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(167, 139, 250, 0.2);
          color: #A78BFA;
        }

        .sub-chat-name {
          font-size: 12px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .sub-chat-desc {
          font-size: 10px;
          color: #71717A;
        }

        .sub-chat-msgs {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .scm {
          display: flex;
          gap: 8px;
        }

        .scm.user {
          justify-content: flex-end;
        }

        .scm-av {
          width: 20px;
          height: 20px;
          background: rgba(167, 139, 250, 0.1);
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #A78BFA;
        }

        .scm-txt {
          max-width: 85%;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 11px;
          line-height: 1.45;
        }

        .scm.assistant .scm-txt {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: #A1A1AA;
        }

        .scm.user .scm-txt {
          background: rgba(167, 139, 250, 0.15);
          border: 1px solid rgba(167, 139, 250, 0.25);
          color: #E4E4E7;
        }

        .sub-chat-inp {
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          gap: 8px;
          background: rgba(0,0,0,0.2);
        }

        .sub-chat-inp input {
          flex: 1;
          padding: 8px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          font-size: 11px;
          color: #E4E4E7;
          outline: none;
        }

        .sub-chat-inp input:focus {
          border-color: rgba(167, 139, 250, 0.4);
        }

        .sub-chat-inp input::placeholder {
          color: #52525B;
        }

        .sub-chat-inp button {
          padding: 8px 12px;
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        /* Footer */
        .substitute-modal-footer {
          padding: 12px 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0,0,0,0.2);
          flex-shrink: 0;
        }

        .substitute-summary {
          font-size: 12px;
          color: #71717A;
        }

        .substitute-summary strong {
          color: #A78BFA;
        }

        /* Panels Section */
        .panels-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .panels-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .panels-title {
          font-size: 13px;
          font-weight: 600;
          color: #A1A1AA;
        }

        .maximize-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 500;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #71717A;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .maximize-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #A1A1AA;
        }

        .panels-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          min-height: 380px;
        }

        /* Formula Panel */
        .formula-panel {
          background: #0A0A0C;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }

        .formula-panel-header {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .panel-title-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .panel-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
        }

        .panel-title-text { }

        .panel-title {
          font-size: 12px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .panel-subtitle {
          font-size: 10px;
          color: #52525B;
        }

        .panel-actions {
          display: flex;
          gap: 4px;
        }

        .panel-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 5px 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 5px;
          color: #52525B;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 10px;
        }

        .panel-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
          color: #A1A1AA;
        }

        .panel-btn.link-btn span { display: inline; }

        .formula-panel-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Formula Table */
        .formula-table-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .formula-search {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          gap: 8px;
          color: #52525B;
        }

        .formula-search input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 12px;
          color: #E4E4E7;
        }

        .formula-search input::placeholder { color: #3F3F46; }

        .formula-table-scroll {
          flex: 1;
          overflow: auto;
        }

        .formula-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }

        .formula-table thead {
          position: sticky;
          top: 0;
          z-index: 5;
        }

        .formula-table th {
          padding: 8px 6px;
          text-align: right;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          background: #0C0C0E;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          white-space: nowrap;
        }

        .formula-table th.col-id {
          text-align: left;
          color: #71717A;
        }

        .formula-table th.col-input { color: #2DD4BF; }
        .formula-table th.col-outcome { color: #F472B6; }

        .formula-table tbody tr {
          cursor: pointer;
          transition: all 0.1s ease;
        }

        .formula-table tbody tr:hover {
          background: rgba(255,255,255,0.03);
        }

        .formula-table td {
          padding: 6px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .formula-table td.col-id {
          font-weight: 500;
          color: #E4E4E7;
        }

        .formula-table td.col-data {
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          color: #A1A1AA;
        }

        /* Formula Detail View */
        .formula-detail {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 12px;
          overflow: auto;
        }

        .formula-detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .formula-detail-id {
          font-size: 14px;
          font-weight: 600;
        }

        .formula-clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          font-size: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          color: #71717A;
          cursor: pointer;
        }

        .formula-clear-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #EF4444;
        }

        .formula-detail-sections {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .formula-section-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .section-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .formula-attributes {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .formula-attribute {
          display: flex;
          justify-content: space-between;
          padding: 5px 8px;
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
          border-left: 2px solid;
        }

        .attr-name {
          font-size: 11px;
          color: #71717A;
        }

        .attr-value {
          font-size: 11px;
          font-weight: 500;
          font-family: 'JetBrains Mono', monospace;
          color: #E4E4E7;
        }

        .linked-placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #52525B;
          font-size: 12px;
        }

        .linked-placeholder strong {
          color: #A1A1AA;
        }

        /* Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .btn {
          padding: 9px 18px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #A1A1AA;
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.03);
        }

        .btn-primary {
          background: linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%);
          border: none;
          color: #0a0a0f;
          font-weight: 600;
          box-shadow: 0 2px 12px rgba(45, 212, 191, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(45, 212, 191, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Chat Panel */
        .chat-panel {
          background: #0a0a0f;
          border-left: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .chat-header {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(180deg, rgba(167, 139, 250, 0.05) 0%, transparent 100%);
        }

        .chat-header-icon {
          width: 32px;
          height: 32px;
          background: rgba(167, 139, 250, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(167, 139, 250, 0.2);
        }

        .chat-title { font-size: 13px; font-weight: 600; color: #E4E4E7; }
        .chat-subtitle { font-size: 10px; color: #71717A; }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-message { display: flex; gap: 8px; }
        .chat-message.user { justify-content: flex-end; }

        .chat-message .avatar {
          width: 24px;
          height: 24px;
          background: rgba(167, 139, 250, 0.1);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(167, 139, 250, 0.2);
        }

        .chat-message .message-content {
          max-width: 85%;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.4;
        }

        .chat-message.assistant .message-content {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: #A1A1AA;
        }

        .chat-message.user .message-content {
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
          border: 1px solid rgba(167, 139, 250, 0.3);
          color: #E4E4E7;
        }

        .chat-input-container {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.2);
        }

        .chat-input-wrapper { display: flex; gap: 8px; align-items: center; }

        .chat-input {
          flex: 1;
          padding: 8px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          font-size: 12px;
          color: #E4E4E7;
          outline: none;
        }

        .chat-input:focus {
          border-color: rgba(167, 139, 250, 0.4);
        }

        .chat-input::placeholder { color: #52525b; }

        .send-btn {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn:hover {
          transform: translateY(-1px);
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .modal-container {
          width: 100%;
          max-width: 1400px;
          max-height: calc(100vh - 48px);
          background: #0A0A0C;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
        }

        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.02);
        }

        .modal-title {
          font-size: 15px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .modal-close-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: #A1A1AA;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .modal-close-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #E4E4E7;
        }

        .modal-body {
          flex: 1;
          padding: 20px;
          overflow: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .modal-body .formula-panel {
          min-height: 500px;
        }

        /* Collapsible Section */
        .collapsible-header {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .collapsible-header:hover .collapse-icon {
          color: #A1A1AA;
        }

        .collapse-icon {
          color: #52525B;
          transition: all 0.15s ease;
        }

        .collapsible-content {
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .collapsible-content.collapsed {
          height: 0;
          opacity: 0;
          margin-top: 0;
        }

        .collapsible-content.expanded {
          opacity: 1;
          margin-top: 12px;
        }

        .selection-summary-inline {
          display: flex;
          gap: 12px;
          margin-left: auto;
        }

        .summary-badge {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 500;
        }

        .summary-badge.reference {
          background: rgba(45, 212, 191, 0.1);
          border: 1px solid rgba(45, 212, 191, 0.25);
          color: #2DD4BF;
        }

        .summary-badge.target {
          background: rgba(244, 114, 182, 0.1);
          border: 1px solid rgba(244, 114, 182, 0.25);
          color: #F472B6;
        }

        .summary-badge.empty {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #52525B;
        }
      `}</style>

      <div className="page-container">
        <main className="main-content">
          {/* Stepper */}
          <header className="stepper-header-section">
            <div className="stepper-top">
              <h2 className="stepper-title">Project Setup</h2>
              <p className="stepper-subtitle">Step {currentStep} of {steps.length}</p>
            </div>

            <div className="progress-wrapper">
              <div className="progress-line-container">
                <div className="progress-line-bg">
                  <div className="progress-line-fill" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>

              <div className="steps-container">
                {steps.map((step) => (
                  <div key={step.number} className="step" onClick={() => handleStepClick(step.number)}>
                    <div className={`step-circle ${getStepClass(step)}`}>
                      {getStepStatus(step.number) === 'completed' ? <CheckIcon /> : step.number}
                    </div>
                    <div className={`step-label ${getStepClass(step)}`}>{step.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* Basic Info - Compact Top Section */}
          <div className="basic-info-section">
            <div className="section-header">
              <div className="section-icon"><FlaskIcon /></div>
              <h1 className="section-title">Project Setup</h1>
              <span className="section-subtitle">Configure your formulation project</span>
            </div>

            <div className="basic-info-grid">
              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categories}
                  placeholder="Select..."
                  onCreateNew={handleCreateCategory}
                  createLabel="Create new"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Low-Sugar Orange Juice"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Brief project description..."
                />
              </div>
            </div>
          </div>

          {/* Requirements Row */}
          <div className="requirements-row">
            <div className={`requirement-chip ${preserveLabel ? 'checked' : ''}`}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div className={`chip-checkbox ${preserveLabel ? 'checked' : ''}`}>
                  {preserveLabel && <CheckIcon />}
                </div>
                <span className="chip-label">Preserve Label</span>
                <input 
                  type="checkbox" 
                  checked={preserveLabel} 
                  onChange={(e) => {
                    setPreserveLabel(e.target.checked);
                    if (e.target.checked && isCollapsed) setIsCollapsed(false);
                  }} 
                  style={{ display: 'none' }} 
                />
              </label>
              {preserveLabel && (
                <>
                  <div className="chip-divider" />
                  <div className="preserve-label-input">
                    <span>±</span>
                    <input
                      type="number"
                      value={labelTolerance}
                      onChange={(e) => setLabelTolerance(e.target.value)}
                      placeholder="5"
                      min="0"
                      max="100"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>%</span>
                  </div>
                </>
              )}
              <span className={`chip-req-hint ref ${referenceFormula ? 'filled' : ''} ${preserveLabel && !referenceFormula ? 'warning' : ''}`}>
                {referenceFormula ? `← ${referenceFormula.Formulation_ID}` : 'Requires Reference'}
              </span>
            </div>

            <div className={`requirement-chip ${substituteIngredient ? 'checked' : ''}`}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div className={`chip-checkbox ${substituteIngredient ? 'checked' : ''}`}>
                  {substituteIngredient && <CheckIcon />}
                </div>
                <span className="chip-label">Substitute Ingredient</span>
                <input 
                  type="checkbox" 
                  checked={substituteIngredient} 
                  onChange={(e) => {
                    setSubstituteIngredient(e.target.checked);
                    if (e.target.checked && isCollapsed) setIsCollapsed(false);
                  }} 
                  style={{ display: 'none' }} 
                />
              </label>
              <span className={`chip-req-hint ref ${referenceFormula ? 'filled' : ''} ${substituteIngredient && !referenceFormula ? 'warning' : ''}`}>
                {referenceFormula ? `← ${referenceFormula.Formulation_ID}` : 'Requires Reference'}
              </span>
            </div>

            <div className={`requirement-chip target-chip ${matchOutcomes ? 'checked' : ''}`}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div className={`chip-checkbox target-checkbox ${matchOutcomes ? 'checked' : ''}`}>
                  {matchOutcomes && <CheckIcon />}
                </div>
                <span className="chip-label">Match Outcomes</span>
                <input 
                  type="checkbox" 
                  checked={matchOutcomes} 
                  onChange={(e) => {
                    setMatchOutcomes(e.target.checked);
                    if (e.target.checked && isCollapsed) setIsCollapsed(false);
                  }} 
                  style={{ display: 'none' }} 
                />
              </label>
              <span className={`chip-req-hint target ${targetFormula ? 'filled' : ''} ${matchOutcomes && !targetFormula ? 'warning' : ''}`}>
                {targetFormula ? `← ${targetFormula.Formulation_ID}` : 'Requires Target'}
              </span>
            </div>
          </div>

          {/* Panels Section - Collapsible */}
          <div className="panels-section">
            <div className="panels-header">
              <div className="collapsible-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <span className="collapse-icon">
                  {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                </span>
                <span className="panels-title">Starting Point Selection (Optional)</span>
              </div>
              
              {/* Show summary when collapsed */}
              {isCollapsed && (
                <div className="selection-summary-inline">
                  <span className={`summary-badge ${referenceFormula ? 'reference' : 'empty'}`}>
                    Ref: {referenceFormula?.Formulation_ID || 'None'}
                  </span>
                  <span className={`summary-badge ${targetFormula || (linkPanels && referenceFormula) ? 'target' : 'empty'}`}>
                    Tgt: {linkPanels && referenceFormula ? `↔ ${referenceFormula.Formulation_ID}` : targetFormula?.Formulation_ID || 'None'}
                  </span>
                </div>
              )}
              
              {!isCollapsed && (
                <button className="maximize-btn" onClick={() => setIsMaximized(true)}>
                  <MaximizeIcon />
                  Expand
                </button>
              )}
            </div>

            <div className={`collapsible-content ${isCollapsed ? 'collapsed' : 'expanded'}`}>
              <div className="panels-container">
                {/* Reference Panel */}
                <FormulaPanel
                  title="Reference Formula"
                  subtitle="Starting composition"
                  icon={<BeakerIcon />}
                  color="#2DD4BF"
                  colorRgb="45, 212, 191"
                  selectedFormula={referenceFormula}
                  onSelectFormula={handleSelectReference}
                  onClearFormula={handleClearReference}
                  showInputsFirst={true}
                />

                {/* Target Panel */}
                <FormulaPanel
                  title="Target Formula"
                  subtitle="Goal outcomes"
                  icon={<TargetIcon />}
                  color="#F472B6"
                  colorRgb="244, 114, 182"
                  selectedFormula={linkPanels ? referenceFormula : targetFormula}
                  onSelectFormula={handleSelectTarget}
                  onClearFormula={handleClearTarget}
                  showInputsFirst={false}
                  linkLabel="Same as Reference"
                  isLinked={linkPanels}
                  onLinkToggle={handleLinkToggle}
                  linkedToId={referenceFormula?.Formulation_ID}
                />
              </div>
            </div>
          </div>

          {/* Maximized Modal */}
          {isMaximized && (
            <div className="modal-overlay" onClick={() => setIsMaximized(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <span className="modal-title">Starting Point Selection</span>
                  <button className="modal-close-btn" onClick={() => setIsMaximized(false)}>
                    <XIcon />
                    Close
                  </button>
                </div>
                <div className="modal-body">
                  {/* Reference Panel */}
                  <FormulaPanel
                    title="Reference Formula"
                    subtitle="Starting composition"
                    icon={<BeakerIcon />}
                    color="#2DD4BF"
                    colorRgb="45, 212, 191"
                    selectedFormula={referenceFormula}
                    onSelectFormula={handleSelectReference}
                    onClearFormula={handleClearReference}
                    showInputsFirst={true}
                  />

                  {/* Target Panel */}
                  <FormulaPanel
                    title="Target Formula"
                    subtitle="Goal outcomes"
                    icon={<TargetIcon />}
                    color="#F472B6"
                    colorRgb="244, 114, 182"
                    selectedFormula={linkPanels ? referenceFormula : targetFormula}
                    onSelectFormula={handleSelectTarget}
                    onClearFormula={handleClearTarget}
                    showInputsFirst={false}
                    linkLabel="Same as Reference"
                    isLinked={linkPanels}
                    onLinkToggle={handleLinkToggle}
                    linkedToId={referenceFormula?.Formulation_ID}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={handleSaveAsDraft}>Save as Draft</button>
            <button className="btn btn-primary" disabled={!isValid} onClick={handleContinue}>
              Continue to Goals
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {/* Substitute Ingredient Modal */}
          {showSubstituteModal && referenceFormula && (
            <div className="substitute-modal-overlay" onClick={() => setShowSubstituteModal(false)}>
              <div className="substitute-modal" onClick={(e) => e.stopPropagation()}>
                <div className="substitute-modal-header">
                  <div>
                    <div className="substitute-modal-title">Ingredient Substitution</div>
                    <div className="substitute-modal-subtitle">
                      Reference: <strong style={{ color: '#2DD4BF' }}>{referenceFormula.Formulation_ID}</strong>
                    </div>
                  </div>
                  <button className="modal-close-btn" onClick={() => setShowSubstituteModal(false)}>
                    <XIcon />
                  </button>
                </div>

                <div className="substitute-modal-body">
                  {/* LEFT: Ingredient List - Always Visible */}
                  <div className="sub-ingredients-list">
                    <div className="sub-list-header">Ingredients</div>
                    {inputColumns.filter(col => col !== 'Baking_Temperature').map(col => {
                      const isActive = activeSubIngredient === col;
                      const subs = substituteSelections[col] || [];
                      const hasSubs = subs.length > 0;
                      
                      return (
                        <div 
                          key={col}
                          className={`sub-ingredient-row ${isActive ? 'active' : ''} ${hasSubs ? 'has-subs' : ''}`}
                          onClick={() => setActiveSubIngredient(col)}
                        >
                          <div className="sub-ing-main">
                            <span className="sub-ing-name">{col.replace(/_/g, ' ')}</span>
                            <span className="sub-ing-value">{referenceFormula[col]}g</span>
                          </div>
                          {hasSubs && (
                            <div className="sub-ing-chips">
                              {subs.slice(0, 2).map(s => (
                                <span key={s.id} className="sub-ing-chip">{s.name}</span>
                              ))}
                              {subs.length > 2 && <span className="sub-ing-more">+{subs.length - 2}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* MIDDLE: Substitute Picker for Active Ingredient */}
                  <div className="sub-picker-panel">
                    {!activeSubIngredient ? (
                      <div className="sub-picker-empty">
                        <div className="empty-icon">←</div>
                        <div>Select an ingredient to find substitutes</div>
                      </div>
                    ) : (
                      <>
                        <div className="sub-picker-header">
                          <div className="sub-picker-title">
                            Substitutes for <strong>{activeSubIngredient.replace(/_/g, ' ')}</strong>
                          </div>
                          <div className="sub-picker-original">{referenceFormula[activeSubIngredient]}g in reference</div>
                        </div>

                        {/* Selected Substitutes */}
                        {(substituteSelections[activeSubIngredient] || []).length > 0 && (
                          <div className="sub-picker-selected">
                            {(substituteSelections[activeSubIngredient] || []).map(sub => (
                              <div key={sub.id} className="selected-sub-tag">
                                <span>{sub.name}</span>
                                <button onClick={() => removeSubstituteSelection(activeSubIngredient, sub.id)}>
                                  <XIcon />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tabs */}
                        <div className="sub-picker-tabs">
                          <button 
                            className={`spt ${substituteLibraryTab === 'recommended' ? 'active' : ''}`}
                            onClick={() => setSubstituteLibraryTab('recommended')}
                          >
                            <StarIcon filled={substituteLibraryTab === 'recommended'} />
                            Recommended
                          </button>
                          <button 
                            className={`spt ${substituteLibraryTab === 'product' ? 'active' : ''}`}
                            onClick={() => setSubstituteLibraryTab('product')}
                          >
                            <ProductIcon />
                            Product
                          </button>
                          <button 
                            className={`spt ${substituteLibraryTab === 'library' ? 'active' : ''}`}
                            onClick={() => setSubstituteLibraryTab('library')}
                          >
                            <LibraryIcon />
                            Library
                          </button>
                          <div style={{ flex: 1 }} />
                          <button className="spt find-spt">
                            <MagnifyIcon />
                            Find
                            <span className="soon-tag">Soon</span>
                          </button>
                        </div>

                        {/* Search */}
                        <div className="sub-picker-search">
                          <SearchIcon />
                          <input
                            type="text"
                            placeholder="Search ingredients..."
                            value={substituteSearchQuery}
                            onChange={(e) => setSubstituteSearchQuery(e.target.value)}
                          />
                        </div>

                        {/* Options List */}
                        <div className="sub-picker-options">
                          {getFilteredSubstituteItems(activeSubIngredient).length === 0 ? (
                            <div className="sub-picker-no-results">No matching ingredients</div>
                          ) : (
                            getFilteredSubstituteItems(activeSubIngredient).map(item => {
                              const isAdded = (substituteSelections[activeSubIngredient] || []).some(s => s.id === item.id);
                              return (
                                <div
                                  key={item.id}
                                  className={`sub-option ${isAdded ? 'added' : ''}`}
                                  onClick={() => !isAdded && addSubstituteSelection(activeSubIngredient, item)}
                                >
                                  <div className="sub-option-info">
                                    <div className="sub-option-name">{item.name}</div>
                                    <div className="sub-option-desc">{item.description}</div>
                                  </div>
                                  <div className="sub-option-actions">
                                    {item.cost && <span className="sub-option-cost">${item.cost.toFixed(2)}</span>}
                                    {isAdded ? (
                                      <span className="sub-option-added">Added</span>
                                    ) : (
                                      <button className="sub-option-add">+ Add</button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* RIGHT: Chat Panel */}
                  <div className="sub-chat-panel">
                    <div className="sub-chat-head">
                      <div className="sub-chat-icon"><LunaIcon /></div>
                      <div>
                        <div className="sub-chat-name">Luna AI</div>
                        <div className="sub-chat-desc">Substitution help</div>
                      </div>
                    </div>
                    <div className="sub-chat-msgs">
                      {substituteChatMessages.map(msg => (
                        <div key={msg.id} className={`scm ${msg.role}`}>
                          {msg.role === 'assistant' && <div className="scm-av"><LunaIcon /></div>}
                          <div className="scm-txt">{msg.content}</div>
                        </div>
                      ))}
                    </div>
                    <div className="sub-chat-inp">
                      <input
                        type="text"
                        placeholder="Ask about substitutions..."
                        value={substituteChatInput}
                        onChange={(e) => setSubstituteChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendSubstituteChat()}
                      />
                      <button onClick={sendSubstituteChat}><SendIcon /></button>
                    </div>
                  </div>
                </div>

                <div className="substitute-modal-footer">
                  <div className="substitute-summary">
                    {Object.values(substituteSelections).flat().length === 0 ? (
                      <span>Select ingredients and add substitutes</span>
                    ) : (
                      <>
                        <strong>{Object.keys(substituteSelections).filter(k => (substituteSelections[k] || []).length > 0).length}</strong> ingredients · 
                        <strong> {Object.values(substituteSelections).flat().length}</strong> substitutes
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setShowSubstituteModal(false)}>Back</button>
                    <button className="btn btn-primary" onClick={handleSubstituteConfirm}>
                      Confirm & Continue
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Chat Panel */}
        <aside className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              </svg>
            </div>
            <div>
              <div className="chat-title">Luna AI</div>
              <div className="chat-subtitle">Setup Assistant</div>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.map(message => (
              <ChatMessage key={message.id} message={message} />
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
                placeholder="Ask a question..."
              />
              <button className="send-btn" onClick={sendMessage}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}