import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, Goal, GoalItem, DraftConstraint, DraftObjective } from '../../contexts/DataContext';

// Unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial structures
const createEmptyGoal = (): Goal => ({
  id: generateId(),
  name: '',
  valueType: null,
  items: [],
  isCollapsed: false
});

const createConstraint = (): GoalItem => ({
  id: generateId(),
  type: 'constraint' as const,
  metricName: '',
  metricRef: null,
  operator: '',
  value1: '',
  value2: ''
});

const createObjective = (): GoalItem => ({
  id: generateId(),
  type: 'objective' as const,
  metricName: '',
  metricRef: null,
  operator: '',
  value1: '',
  value2: '',
  successValue1: '',
  successValue2: '',
  showSuccessCriteria: false
});

// Icons
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" />
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 7l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GoalsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 12h32M8 24h24M8 36h28" strokeLinecap="round" />
    <circle cx="40" cy="12" r="4" fill="currentColor" opacity="0.3" />
    <path d="M38 10l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="36" cy="24" r="3" fill="currentColor" opacity="0.2" />
    <circle cx="40" cy="36" r="3" fill="currentColor" opacity="0.2" />
  </svg>
);

// Type Tags
const MetricTypeTag = ({ type }) => {
  const config = {
    'input': { bg: 'rgba(45, 212, 191, 0.15)', text: '#2DD4BF', border: 'rgba(45, 212, 191, 0.3)', label: 'Input' },
    'combination': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)', label: 'Combo' },
    'calculation': { bg: 'rgba(96, 165, 250, 0.15)', text: '#60A5FA', border: 'rgba(96, 165, 250, 0.3)', label: 'Calc' },
    'outcome': { bg: 'rgba(244, 114, 182, 0.15)', text: '#F472B6', border: 'rgba(244, 114, 182, 0.3)', label: 'Outcome' },
  };
  const c = config[type] || config['input'];
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
      letterSpacing: '0.03em',
    }}>
      {c.label}
    </span>
  );
};

const CategoryTag = ({ category }) => {
  const colors = {
    'Ingredient': '#2DD4BF',
    'Processing': '#FB923C',
    'Analytical': '#60A5FA',
    'Sensory': '#F472B6',
    'Consumer': '#A78BFA',
  };
  const color = colors[category] || '#71717A';
  return (
    <span style={{
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '9px',
      fontWeight: 500,
      background: `${color}15`,
      color: color,
    }}>
      {category}
    </span>
  );
};

// Custom Select Component
const Select = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="select-wrapper" onClick={() => setIsOpen(!isOpen)}>
      <div className={`select-display ${!value ? 'placeholder' : ''}`}>
        {selected?.label || placeholder}
        <ChevronDown />
      </div>
      {isOpen && (
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
          </div>
        </>
      )}
    </div>
  );
};

// Autocomplete Input Component
const AutocompleteInput = ({ value, onChange, onSelect, placeholder, library, goalName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef(null);

  const getSuggestions = () => {
    if (!value || value.length < 1) return library.slice(0, 8);
    const lower = value.toLowerCase();
    return library.filter(item =>
      item.name.toLowerCase().includes(lower) ||
      (item.description && item.description.toLowerCase().includes(lower))
    ).slice(0, 8);
  };

  const suggestions = getSuggestions();

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && suggestions[highlightIndex]) {
      e.preventDefault();
      onSelect(suggestions[highlightIndex]);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setHighlightIndex(0);
  }, [value]);

  return (
    <div className="autocomplete-wrapper">
      <input
        ref={inputRef}
        type="text"
        className="metric-input"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || goalName || "Metric name..."}
        autoComplete="off"
      />
      
      {isOpen && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-header">
            <span className="autocomplete-label">Library matches</span>
            <span className="autocomplete-hint">↑↓ navigate · Enter select</span>
          </div>
          {suggestions.map((item, idx) => (
            <div
              key={item.id}
              className={`autocomplete-item ${idx === highlightIndex ? 'highlighted' : ''}`}
              onMouseEnter={() => setHighlightIndex(idx)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item);
                setIsOpen(false);
              }}
            >
              <div className="autocomplete-item-header">
                <span className="autocomplete-item-name">{item.name}</span>
                <div className="autocomplete-item-tags">
                  <MetricTypeTag type={item.type} />
                  {item.category && <CategoryTag category={item.category} />}
                </div>
              </div>
              <div className="autocomplete-item-details">
                <span className="autocomplete-item-description">{item.description}</span>
                {item.formula && (
                  <span className="autocomplete-item-formula">{item.formula}</span>
                )}
                {item.cost && (
                  <span className="autocomplete-item-cost">${item.cost.toFixed(2)}</span>
                )}
              </div>
              {item.components && (
                <div className="autocomplete-item-components">
                  {item.components.map((c, i) => (
                    <span key={i} className="component-pill">{c}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Constraint Component - Single inline row
const ConstraintItem = ({ constraint, onUpdate, onDelete, goalName, valueType, library }) => {
  const operatorOptions = [
    { value: 'equals', label: '= Equals' },
    { value: 'between', label: '↔ Between' },
    { value: 'at_least', label: '≥ At Least' },
    { value: 'at_most', label: '≤ At Most' },
  ];

  const needsTwoValues = constraint.operator === 'between';

  const handleSelect = (item) => {
    onUpdate({
      ...constraint,
      metricName: item.name,
      metricRef: { id: item.id, type: item.type }
    });
  };

  return (
    <div className="inline-item-row constraint-row">
      <span className="item-badge constraint-badge">Constraint</span>
      <div className="inline-autocomplete">
        <AutocompleteInput
          value={constraint.metricName}
          onChange={(val) => onUpdate({ ...constraint, metricName: val, metricRef: null })}
          onSelect={handleSelect}
          placeholder={goalName || "Metric name..."}
          library={library}
          goalName={goalName}
        />
      </div>
      <select
        value={constraint.operator || ''}
        onChange={(e) => onUpdate({ ...constraint, operator: e.target.value || null })}
        className="inline-select"
      >
        <option value="">Type...</option>
        {operatorOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {constraint.operator && (
        <div className="inline-values">
          <input
            type="text"
            className="value-field"
            value={constraint.value1}
            onChange={(e) => onUpdate({ ...constraint, value1: e.target.value })}
            placeholder={needsTwoValues ? "Min" : "Value"}
          />
          {needsTwoValues && (
            <>
              <span className="to-separator">to</span>
              <input
                type="text"
                className="value-field"
                value={constraint.value2}
                onChange={(e) => onUpdate({ ...constraint, value2: e.target.value })}
                placeholder="Max"
              />
            </>
          )}
        </div>
      )}
      <button className="delete-btn" onClick={onDelete} title="Delete constraint">
        <TrashIcon />
      </button>
    </div>
  );
};

// Objective Component - Single inline row
const ObjectiveItem = ({ objective, onUpdate, onDelete, goalName, valueType, onElevateToConstraint, library }) => {
  const operatorOptions = [
    { value: 'maximize', label: '↑ Maximize' },
    { value: 'minimize', label: '↓ Minimize' },
    { value: 'approximately', label: '◎ Target' },
    { value: 'between', label: '↔ Between' }
  ];

  const needsTwoValues = objective.operator === 'between';
  const needsOneValue = objective.operator === 'approximately';

  const getSuccessCriteriaLabel = () => {
    switch (objective.operator) {
      case 'maximize': return 'At Least';
      case 'minimize': return 'At Most';
      case 'approximately': return 'Between';
      default: return '';
    }
  };

  // Map objective operator to constraint operator for elevation
  const getConstraintOperator = () => {
    switch (objective.operator) {
      case 'maximize': return 'at_least';
      case 'minimize': return 'at_most';
      case 'approximately': return 'between';
      case 'between': return 'between';
      default: return null;
    }
  };

  // No success criteria for 'between' type
  const canHaveSuccessCriteria = objective.operator && objective.operator !== 'between';
  const successNeedsTwoValues = objective.operator === 'approximately';

  // Can elevate to constraint if:
  // - calculated valueType
  // - metric name is filled out
  // - EITHER: has success criteria filled out OR is a between type with values
  const hasMetricName = objective.metricName && objective.metricName.trim() !== '';

  const canElevateFromSuccess = valueType === 'calculated' &&
    hasMetricName &&
    objective.showSuccessCriteria &&
    objective.successValue1 &&
    (successNeedsTwoValues ? objective.successValue2 : true);

  const canElevateFromBetween = valueType === 'calculated' &&
    hasMetricName &&
    objective.operator === 'between' &&
    objective.value1 &&
    objective.value2;

  const handleSelect = (item) => {
    onUpdate({
      ...objective,
      metricName: item.name,
      metricRef: { id: item.id, type: item.type }
    });
  };

  const handleElevateFromSuccess = () => {
    if (canElevateFromSuccess && onElevateToConstraint) {
      onElevateToConstraint({
        metricName: objective.metricName,
        metricRef: objective.metricRef,
        operator: getConstraintOperator(),
        value1: objective.successValue1,
        value2: objective.successValue2 || ''
      });
    }
  };

  const handleElevateFromBetween = () => {
    if (canElevateFromBetween && onElevateToConstraint) {
      onElevateToConstraint({
        metricName: objective.metricName,
        metricRef: objective.metricRef,
        operator: 'between',
        value1: objective.value1,
        value2: objective.value2
      });
    }
  };

  // Keyboard shortcut for elevate (⌘E)
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      if (canElevateFromBetween) {
        handleElevateFromBetween();
      } else if (canElevateFromSuccess) {
        handleElevateFromSuccess();
      }
    }
  };

  return (
    <div className="inline-item-row objective-row" onKeyDown={handleKeyDown} tabIndex={-1}>
      <span className="item-badge objective-badge">Objective</span>
      <div className="inline-autocomplete">
        <AutocompleteInput
          value={objective.metricName}
          onChange={(val) => onUpdate({ ...objective, metricName: val, metricRef: null })}
          onSelect={handleSelect}
          placeholder={goalName || "Metric name..."}
          library={library}
          goalName={goalName}
        />
      </div>
      <select
        value={objective.operator || ''}
        onChange={(e) => onUpdate({ ...objective, operator: e.target.value || null, showSuccessCriteria: false, successValue1: '', successValue2: '' })}
        className="inline-select"
      >
        <option value="">Type...</option>
        {operatorOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {(needsOneValue || needsTwoValues) && (
        <div className="inline-values">
          <input
            type="text"
            className="value-field"
            value={objective.value1}
            onChange={(e) => onUpdate({ ...objective, value1: e.target.value })}
            placeholder={needsTwoValues ? "Min" : "Target"}
          />
          {needsTwoValues && (
            <>
              <span className="to-separator">to</span>
              <input
                type="text"
                className="value-field"
                value={objective.value2}
                onChange={(e) => onUpdate({ ...objective, value2: e.target.value })}
                placeholder="Max"
              />
            </>
          )}
        </div>
      )}
      {/* Elevate button for Between type */}
      {needsTwoValues && valueType === 'calculated' && (
        <button
          className={`elevate-btn ${canElevateFromBetween ? 'active' : ''}`}
          onClick={handleElevateFromBetween}
          disabled={!canElevateFromBetween}
          title="Create constraint from between values (⌘E)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          Constraint
        </button>
      )}
      {canHaveSuccessCriteria && !objective.showSuccessCriteria && (
        <button
          className="success-toggle"
          onClick={() => onUpdate({ ...objective, showSuccessCriteria: true })}
        >
          + Success Criteria
        </button>
      )}
      {canHaveSuccessCriteria && objective.showSuccessCriteria && (
        <div className="success-criteria-group">
          <span className="success-tag">Success</span>
          <span className="success-label">{getSuccessCriteriaLabel()}</span>
          <input
            type="text"
            className="success-field"
            value={objective.successValue1}
            onChange={(e) => onUpdate({ ...objective, successValue1: e.target.value })}
            placeholder={successNeedsTwoValues ? "Min" : "Value"}
          />
          {successNeedsTwoValues && (
            <>
              <span className="to-separator success-sep">to</span>
              <input
                type="text"
                className="success-field"
                value={objective.successValue2}
                onChange={(e) => onUpdate({ ...objective, successValue2: e.target.value })}
                placeholder="Max"
              />
            </>
          )}
          {valueType === 'calculated' && (
            <button
              className={`elevate-btn ${canElevateFromSuccess ? 'active' : ''}`}
              onClick={handleElevateFromSuccess}
              disabled={!canElevateFromSuccess}
              title="Create constraint from success criteria (⌘E)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              Constraint
            </button>
          )}
          <button
            className="remove-success-btn"
            onClick={() => onUpdate({ ...objective, showSuccessCriteria: false, successValue1: '', successValue2: '' })}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
      <button className="delete-btn" onClick={onDelete} title="Delete objective">
        <TrashIcon />
      </button>
    </div>
  );
};

// Goal Card Component
const GoalCard = ({ goal, onUpdate, onDelete, isSelected, onSelect, calculatedLibrary, predictedLibrary }) => {
  const updateGoal = (updates) => onUpdate({ ...goal, ...updates });

  const toggleCollapse = () => {
    updateGoal({ isCollapsed: !goal.isCollapsed });
    if (goal.isCollapsed) {
      onSelect(goal.id);
    }
  };

  const handleCardClick = () => {
    if (!goal.isCollapsed) {
      onSelect(goal.id);
    }
  };

  const addItem = (type) => {
    const newItem = type === 'constraint' ? createConstraint() : createObjective();
    newItem.metricName = goal.name || '';
    updateGoal({ items: [...goal.items, newItem] });
  };

  const elevateToConstraint = (constraintData) => {
    const newConstraint = createConstraint();
    newConstraint.metricName = constraintData.metricName;
    newConstraint.metricRef = constraintData.metricRef;
    newConstraint.operator = constraintData.operator;
    newConstraint.value1 = constraintData.value1;
    newConstraint.value2 = constraintData.value2;
    updateGoal({ items: [...goal.items, newConstraint] });
  };

  const updateItem = (itemId, updates) => {
    updateGoal({
      items: goal.items.map(item => item.id === itemId ? updates : item)
    });
  };

  const deleteItem = (itemId) => {
    updateGoal({ items: goal.items.filter(item => item.id !== itemId) });
  };

  const canAddConstraint = goal.valueType === 'calculated';
  const canAddObjective = goal.valueType !== null;
  const showDisabledConstraint = goal.valueType === 'predicted';

  const getGoalSummary = () => {
    if (!goal.valueType) return 'Not configured';
    const constraints = goal.items.filter(i => i.type === 'constraint').length;
    const objectives = goal.items.filter(i => i.type === 'objective').length;
    const parts = [];
    if (goal.valueType) parts.push(goal.valueType);
    if (constraints) parts.push(`${constraints} constraint${constraints > 1 ? 's' : ''}`);
    if (objectives) parts.push(`${objectives} objective${objectives > 1 ? 's' : ''}`);
    return parts.join(' · ');
  };

  return (
    <div className={`goal-card ${goal.isCollapsed ? 'collapsed' : ''} ${isSelected && !goal.isCollapsed ? 'selected' : ''}`} onClick={handleCardClick}>
      <div className="goal-header">
        <button className="collapse-btn" onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}>
          {goal.isCollapsed ? <ChevronRight /> : <ChevronDown />}
        </button>
        <input
          type="text"
          className="goal-name-input"
          value={goal.name}
          onChange={(e) => updateGoal({ name: e.target.value })}
          placeholder="Enter goal or claim..."
        />
        {goal.isCollapsed && (
          <span className="goal-summary">{getGoalSummary()}</span>
        )}
        <button className="delete-goal-btn" onClick={onDelete} title="Delete goal">
          <TrashIcon />
        </button>
      </div>

      {!goal.isCollapsed && (
        <div className="goal-body">
          <div className="value-type-row">
            <span className="row-label">Type</span>
            <div className="value-type-toggle">
              <button
                className={`toggle-btn ${goal.valueType === 'calculated' ? 'active calculated' : ''}`}
                onClick={() => updateGoal({ valueType: 'calculated', items: [] })}
              >
                <span className="toggle-icon">∑</span>
                Calculated
                <kbd>⌘1</kbd>
              </button>
              <button
                className={`toggle-btn ${goal.valueType === 'predicted' ? 'active predicted' : ''}`}
                onClick={() => updateGoal({ valueType: 'predicted', items: goal.items.filter(i => i.type === 'objective') })}
              >
                <span className="toggle-icon">◎</span>
                Predicted
                <kbd>⌘2</kbd>
              </button>
            </div>

          </div>

          {goal.valueType && (
            <div className="items-section">
              {goal.items.map(item => (
                item.type === 'constraint' ? (
                  <ConstraintItem
                    key={item.id}
                    constraint={item}
                    goalName={goal.name}
                    valueType={goal.valueType}
                    onUpdate={(updated) => updateItem(item.id, updated)}
                    onDelete={() => deleteItem(item.id)}
                    library={calculatedLibrary}
                  />
                ) : (
                  <ObjectiveItem
                    key={item.id}
                    objective={item}
                    goalName={goal.name}
                    valueType={goal.valueType}
                    onUpdate={(updated) => updateItem(item.id, updated)}
                    onDelete={() => deleteItem(item.id)}
                    onElevateToConstraint={elevateToConstraint}
                    library={goal.valueType === 'predicted' ? predictedLibrary : calculatedLibrary}
                  />
                )
              ))}

              <div className="add-item-buttons">
                {canAddConstraint && (
                  <button className="add-item-btn constraint" onClick={() => addItem('constraint')}>
                    <PlusIcon />
                    <span>Constraint (Hard Limit)</span>
                    <kbd>⌘K</kbd>
                  </button>
                )}
                {showDisabledConstraint && (
                  <div className="add-item-btn-wrapper disabled-wrapper">
                    <button className="add-item-btn constraint disabled" disabled>
                      <PlusIcon />
                      <span>Constraint (Hard Limit)</span>
                    </button>
                    <div className="disabled-tooltip">
                      Constraints only available for calculated values
                    </div>
                  </div>
                )}
                {canAddObjective && (
                  <button className="add-item-btn objective" onClick={() => addItem('objective')}>
                    <PlusIcon />
                    <span>Objective (What to Optimize)</span>
                    <kbd>⌘J</kbd>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
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

// Main Component
export default function GoalsClaimsPage() {
  const navigate = useNavigate();
  const {
    inputs,
    outcomes,
    combinations,
    calculations,
    inputLibrary,
    outcomeLibrary,
    projectMetadata,
    projectGoals,
    setProjectGoals,
    setDraftConstraints,
    setDraftObjectives,
    stepStatuses,
    setStepStatus
  } = useData();

  const currentStep = 2;

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

  // Build libraries from context data
  const calculatedLibrary = useMemo(() => [
    ...inputs.map(i => ({ ...i, type: 'input', category: i.inputType })),
    ...inputLibrary.map(i => ({ ...i, type: 'input', category: i.inputType })),
    ...combinations.map(c => ({ ...c, type: 'combination' })),
    ...calculations.map(c => ({ ...c, type: 'calculation' })),
  ], [inputs, inputLibrary, combinations, calculations]);

  const predictedLibrary = useMemo(() => [
    ...outcomes.map(o => ({ ...o, type: 'outcome', category: o.outcomeType })),
    ...outcomeLibrary.map(o => ({ ...o, type: 'outcome', category: o.outcomeType })),
  ], [outcomes, outcomeLibrary]);

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
    if (!isValid) return;

    // Extract constraints and objectives from goals
    const newDraftConstraints: DraftConstraint[] = [];
    const newDraftObjectives: DraftObjective[] = [];

    goals.forEach(goal => {
      goal.items.forEach(item => {
        if (item.type === 'constraint') {
          newDraftConstraints.push({
            id: item.id,
            metricName: item.metricName,
            metricRef: item.metricRef,
            operator: item.operator,
            value1: item.value1,
            value2: item.value2,
            goalId: goal.id,
            goalName: goal.name,
            status: 'draft',
            isPrefilled: !!item.metricRef, // Has valid reference from autocomplete
          });
        } else if (item.type === 'objective') {
          newDraftObjectives.push({
            id: item.id,
            metricName: item.metricName,
            metricRef: item.metricRef,
            operator: item.operator,
            value1: item.value1,
            value2: item.value2,
            goalId: goal.id,
            goalName: goal.name,
            status: 'draft',
            isPrefilled: !!item.metricRef,
          });
        }
      });
    });

    // Save to context
    setProjectGoals(goals);
    setDraftConstraints(newDraftConstraints);
    setDraftObjectives(newDraftObjectives);
    setStepStatus(currentStep, 'completed');
    navigate('/project/new/step-3');
  };

  const handleSaveAsDraft = () => {
    setProjectGoals(goals);
    setStepStatus(currentStep, 'draft');
  };

  const handleSkip = () => {
    setStepStatus(currentStep, 'incomplete');
    navigate('/project/new/step-3');
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Project info from context
  const projectInfo = {
    title: projectMetadata?.name || "New Project",
    description: projectMetadata?.description || "Set up your formulation project goals and claims"
  };

  // Initialize goals from context if available
  const [goals, setGoals] = useState(() =>
    projectGoals.length > 0 ? projectGoals : [createEmptyGoal()]
  );
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: "I'm here to help you define your business goals and claims. Let's break down your project objective into measurable goals. What's the primary metric you want to optimize?"
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const addGoal = () => {
    setGoals([...goals, createEmptyGoal()]);
  };

  const updateGoal = (goalId, updates) => {
    setGoals(goals.map(g => g.id === goalId ? updates : g));
  };

  const deleteGoal = (goalId) => {
    if (goals.length === 1) {
      setGoals([createEmptyGoal()]);
    } else {
      setGoals(goals.filter(g => g.id !== goalId));
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages([
      ...chatMessages,
      { id: generateId(), role: 'user', content: chatInput },
      { id: generateId(), role: 'assistant', content: "I understand you're working on defining that goal. Consider whether this value will be directly calculated from your inputs (like cost or sugar percentage) or if it's a predicted outcome from your model (like sweetness perception or purchase intent). This will determine what metrics you can use." }
    ]);
    setChatInput('');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Add new goal: Cmd/Ctrl + N
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setGoals(prev => [...prev, createEmptyGoal()]);
        return;
      }

      if (!selectedGoalId) return;

      // Set to Calculated: Cmd/Ctrl + 1
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setGoals(prev => {
          const selectedGoal = prev.find(g => g.id === selectedGoalId && !g.isCollapsed);
          if (!selectedGoal) return prev;
          return prev.map(g => g.id === selectedGoalId 
            ? { ...g, valueType: 'calculated', items: [] } 
            : g
          );
        });
        return;
      }

      // Set to Predicted: Cmd/Ctrl + 2
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setGoals(prev => {
          const selectedGoal = prev.find(g => g.id === selectedGoalId && !g.isCollapsed);
          if (!selectedGoal) return prev;
          return prev.map(g => g.id === selectedGoalId 
            ? { ...g, valueType: 'predicted', items: g.items.filter(i => i.type === 'objective') } 
            : g
          );
        });
        return;
      }

      // Add Constraint: Cmd/Ctrl + K (only if calculated)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGoals(prev => {
          const selectedGoal = prev.find(g => g.id === selectedGoalId && !g.isCollapsed);
          if (!selectedGoal || selectedGoal.valueType !== 'calculated') return prev;
          const newConstraint = createConstraint();
          newConstraint.metricName = selectedGoal.name || '';
          return prev.map(g => g.id === selectedGoalId 
            ? { ...g, items: [...g.items, newConstraint] } 
            : g
          );
        });
        return;
      }

      // Add Objective: Cmd/Ctrl + J (if valueType is set)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setGoals(prev => {
          const selectedGoal = prev.find(g => g.id === selectedGoalId && !g.isCollapsed);
          if (!selectedGoal || !selectedGoal.valueType) return prev;
          const newObjective = createObjective();
          newObjective.metricName = selectedGoal.name || '';
          return prev.map(g => g.id === selectedGoalId 
            ? { ...g, items: [...g.items, newObjective] } 
            : g
          );
        });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGoalId]);

  const isValid = goals.some(g => g.name && g.valueType && g.items.length > 0);

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
          margin-bottom: 16px;
          gap: 24px;
        }

        .section-header-left {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .section-icon {
          color: #2DD4BF;
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

        .add-goal-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%);
          color: #0a0a0f;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          box-shadow: 0 2px 12px rgba(45, 212, 191, 0.25);
          flex-shrink: 0;
        }

        .add-goal-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(45, 212, 191, 0.4);
        }

        .add-goal-btn kbd {
          padding: 2px 5px;
          border-radius: 3px;
          background: rgba(0,0,0,0.15);
          font-size: 10px;
          font-family: inherit;
          margin-left: 4px;
        }

        /* Goals List */
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Goal Card */
        .goal-card {
          background: rgba(255,255,255,0.04);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s ease;
        }

        .goal-card:hover {
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
        }

        .goal-card.selected {
          border-color: rgba(45, 212, 191, 0.3);
          box-shadow: 0 0 0 1px rgba(45, 212, 191, 0.1);
        }

        .goal-card.collapsed {
          padding: 14px 20px;
        }

        .goal-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 6px;
          color: #A1A1AA;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .collapse-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #E4E4E7;
        }

        .goal-name-input {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          border: none;
          background: transparent;
          outline: none;
          color: #E4E4E7;
          min-width: 0;
        }

        .goal-name-input::placeholder {
          color: #52525b;
        }

        .goal-summary {
          font-size: 11px;
          color: #A1A1AA;
          white-space: nowrap;
          text-transform: capitalize;
          padding: 4px 10px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .delete-goal-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #52525b;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .delete-goal-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }

        /* Goal Body */
        .goal-body {
          margin-top: 16px;
        }

        /* Value Type Row */
        .value-type-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .row-label {
          font-size: 11px;
          font-weight: 600;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          width: 40px;
          flex-shrink: 0;
        }

        .value-type-toggle {
          display: flex;
          gap: 8px;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #A1A1AA;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .toggle-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.18);
        }

        .toggle-btn kbd {
          padding: 2px 5px;
          border-radius: 3px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 10px;
          color: #71717A;
          margin-left: 4px;
        }

        .toggle-btn.active kbd {
          background: rgba(0,0,0,0.1);
          border-color: rgba(0,0,0,0.15);
          color: inherit;
        }

        .toggle-btn.active.calculated {
          background: rgba(167, 139, 250, 0.1);
          border-color: rgba(167, 139, 250, 0.4);
          color: #A78BFA;
        }

        .toggle-btn.active.calculated kbd {
          background: rgba(0,0,0,0.1);
          border-color: rgba(0,0,0,0.15);
          color: inherit;
        }

        .toggle-btn.active.predicted {
          background: rgba(244, 114, 182, 0.1);
          border-color: rgba(244, 114, 182, 0.4);
          color: #F472B6;
        }

        .toggle-icon {
          font-size: 14px;
          opacity: 0.8;
        }

        /* Items Section */
        .items-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        /* Inline Item Row - Single line for constraint/objective */
        .inline-item-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          transition: all 0.15s ease;
        }

        .inline-item-row:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.16);
        }

        .inline-item-row.constraint-row {
          border-left: 3px solid rgba(251, 191, 36, 0.5);
        }

        .inline-item-row.objective-row {
          border-left: 3px solid rgba(96, 165, 250, 0.5);
        }

        .inline-autocomplete {
          flex: 0 0 270px;
          min-width: 0;
        }

        .item-badge {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 8px;
          border-radius: 4px;
          flex-shrink: 0;
          white-space: nowrap;
          width: 78px;
          text-align: center;
        }

        .constraint-badge {
          background: rgba(251, 191, 36, 0.15);
          color: #FBBF24;
        }

        .objective-badge {
          background: rgba(96, 165, 250, 0.15);
          color: #60A5FA;
        }

        /* Inline Select */
        .inline-select {
          padding: 6px 28px 6px 10px;
          font-size: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 5px;
          color: #E4E4E7;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          min-width: 110px;
        }

        .inline-select:focus {
          border-color: rgba(45, 212, 191, 0.5);
        }

        /* Value Field */
        .value-field {
          padding: 6px 8px;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 5px;
          color: #60A5FA;
          text-align: center;
          outline: none;
          width: 70px;
        }

        .value-field:focus {
          border-color: rgba(96, 165, 250, 0.5);
          background: rgba(96, 165, 250, 0.08);
        }

        .value-field::placeholder {
          color: #52525b;
          font-family: 'Inter', sans-serif;
        }

        /* Success Criteria */
        .success-toggle {
          padding: 5px 10px;
          font-size: 10px;
          font-weight: 600;
          background: rgba(34, 197, 94, 0.08);
          color: #52525b;
          border: 1px dashed rgba(34, 197, 94, 0.25);
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .success-toggle:hover {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.4);
          color: #22C55E;
        }

        .success-criteria-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .success-tag {
          font-size: 9px;
          font-style: italic;
          color: #22C55E;
          opacity: 0.7;
        }

        .success-label {
          font-size: 10px;
          color: #22C55E;
          font-weight: 600;
          white-space: nowrap;
        }

        .elevate-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          font-size: 9px;
          font-weight: 600;
          background: rgba(251, 191, 36, 0.08);
          color: #52525b;
          border: 1px dashed rgba(251, 191, 36, 0.2);
          border-radius: 4px;
          cursor: not-allowed;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .elevate-btn.active {
          cursor: pointer;
          background: rgba(251, 191, 36, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.4);
          color: #FBBF24;
        }

        .elevate-btn.active:hover {
          background: rgba(251, 191, 36, 0.25);
          border-color: rgba(251, 191, 36, 0.6);
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
        }

        .success-field {
          padding: 5px 7px;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: 4px;
          color: #22C55E;
          text-align: center;
          outline: none;
          width: 60px;
        }

        .success-field:focus {
          border-color: rgba(34, 197, 94, 0.5);
          background: rgba(34, 197, 94, 0.12);
        }

        .success-field::placeholder {
          color: rgba(34, 197, 94, 0.4);
          font-family: 'Inter', sans-serif;
        }

        .remove-success-btn {
          padding: 3px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #52525b;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          transition: all 0.15s ease;
        }

        .remove-success-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #EF4444;
        }

        /* Autocomplete Wrapper */
        .autocomplete-wrapper {
          flex: 1;
          position: relative;
          min-width: 150px;
        }

        .metric-input {
          width: 100%;
          padding: 7px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          outline: none;
          transition: all 0.15s ease;
          color: #E4E4E7;
        }

        .metric-input:focus {
          border-color: rgba(45, 212, 191, 0.5);
          background: rgba(45, 212, 191, 0.05);
        }

        .metric-input::placeholder {
          color: #52525b;
          font-weight: 400;
        }

        /* Autocomplete Dropdown */
        .autocomplete-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          width: 340px;
          background: #1a1a22;
          border: 1px solid rgba(45, 212, 191, 0.3);
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
          background: rgba(45, 212, 191, 0.05);
          border-bottom: 1px solid rgba(45, 212, 191, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .autocomplete-label {
          font-size: 10px;
          font-weight: 600;
          color: #2DD4BF;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .autocomplete-hint {
          font-size: 10px;
          color: #52525b;
        }

        .autocomplete-item {
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.1s ease;
          border-left: 2px solid transparent;
        }

        .autocomplete-item:hover,
        .autocomplete-item.highlighted {
          background: rgba(45, 212, 191, 0.08);
          border-left-color: #2DD4BF;
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
          gap: 6px;
        }

        .autocomplete-item-details {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .autocomplete-item-description {
          font-size: 11px;
          color: #71717A;
        }

        .autocomplete-item-formula {
          font-size: 10px;
          color: #60A5FA;
          font-family: 'JetBrains Mono', monospace;
          background: rgba(96, 165, 250, 0.1);
          padding: 2px 6px;
          border-radius: 3px;
        }

        .autocomplete-item-cost {
          font-size: 11px;
          color: #2DD4BF;
          font-weight: 600;
        }

        .autocomplete-item-components {
          margin-top: 6px;
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .component-pill {
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255,255,255,0.05);
          font-size: 9px;
          color: #A1A1AA;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .inline-values {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .to-separator {
          font-size: 11px;
          color: #52525b;
          font-weight: 500;
        }

        .to-separator.success-sep {
          color: #22C55E;
        }

        .delete-btn {
          padding: 5px;
          background: transparent;
          border: none;
          color: #52525b;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
          flex-shrink: 0;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #EF4444;
        }

        /* Select Component */
        .select-wrapper {
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
        }

        .select-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          font-size: 13px;
          color: #E4E4E7;
          transition: all 0.15s ease;
          min-width: 130px;
        }

        .select-display:hover {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.07);
        }

        .select-display.placeholder {
          color: #52525b;
        }

        .select-backdrop {
          position: fixed;
          inset: 0;
          z-index: 10;
        }

        .select-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          min-width: 100%;
          background: #1a1a22;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          z-index: 20;
          overflow: hidden;
          animation: dropdownEnter 0.15s ease-out;
        }

        .select-option {
          padding: 9px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.1s ease;
          white-space: nowrap;
          color: #A1A1AA;
        }

        .select-option:hover {
          background: rgba(45, 212, 191, 0.08);
          color: #E4E4E7;
        }

        .select-option.selected {
          background: rgba(45, 212, 191, 0.12);
          color: #2DD4BF;
          font-weight: 500;
        }

        /* Value Input */
        .value-input {
          width: 80px;
          padding: 7px 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          transition: all 0.15s ease;
          color: #E4E4E7;
        }

        .value-input:focus {
          border-color: rgba(45, 212, 191, 0.5);
          background: rgba(45, 212, 191, 0.05);
        }

        .value-input::placeholder {
          color: #52525b;
          font-family: 'Inter', sans-serif;
        }

        /* Add Item Buttons */
        .add-item-buttons {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }

        .add-item-btn-wrapper {
          position: relative;
        }

        .add-item-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.15);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #71717A;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .add-item-btn kbd {
          padding: 2px 5px;
          border-radius: 3px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 9px;
          color: #52525b;
          margin-left: 2px;
        }

        .add-item-btn:hover:not(.disabled) {
          border-style: solid;
        }

        .add-item-btn.constraint {
          border-color: rgba(251, 191, 36, 0.3);
        }

        .add-item-btn.constraint:hover:not(.disabled) {
          background: rgba(251, 191, 36, 0.08);
          border-color: rgba(251, 191, 36, 0.5);
          color: #FBBF24;
        }

        .add-item-btn.objective {
          border-color: rgba(96, 165, 250, 0.3);
        }

        .add-item-btn.objective:hover:not(.disabled) {
          background: rgba(96, 165, 250, 0.08);
          border-color: rgba(96, 165, 250, 0.5);
          color: #60A5FA;
        }

        .add-item-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          border-color: rgba(255,255,255,0.08);
        }

        .disabled-wrapper .disabled-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #27272a;
          color: #A1A1AA;
          font-size: 11px;
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
          z-index: 10;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .disabled-wrapper .disabled-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #27272a;
        }

        .disabled-wrapper:hover .disabled-tooltip {
          opacity: 1;
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

        .btn-skip {
          background: transparent;
          border: 1px solid rgba(251, 146, 60, 0.3);
          color: #FB923C;
        }

        .btn-skip:hover {
          background: rgba(251, 146, 60, 0.08);
          border-color: rgba(251, 146, 60, 0.5);
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
          background: rgba(45, 212, 191, 0.1);
          border-color: rgba(45, 212, 191, 0.2);
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
      `}</style>

      <div className="page-container">
        <main className="main-content">
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

          <div className="section-header">
            <div className="section-header-left">
              <div className="section-icon">
                <GoalsIcon />
              </div>
              <div className="section-text">
                <h2 className="section-title">Goals & Claims</h2>
                <p className="section-subtitle">
                  Enumerate your project goals & intended claims, and build constraints (hard limits) and objectives (what to optimize) to support those goals & claims.
                </p>
              </div>
            </div>
            <button className="add-goal-btn" onClick={addGoal}>
              <PlusIcon />
              Add Goal
              <kbd>⌘N</kbd>
            </button>
          </div>

          <div className="goals-list">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                isSelected={selectedGoalId === goal.id}
                onSelect={setSelectedGoalId}
                onUpdate={(updated) => updateGoal(goal.id, updated)}
                onDelete={() => deleteGoal(goal.id)}
                calculatedLibrary={calculatedLibrary}
                predictedLibrary={predictedLibrary}
              />
            ))}
          </div>

          <div className="form-actions">
            <button className="btn btn-skip" onClick={handleSkip}>
              Skip
            </button>
            <button className="btn btn-secondary" onClick={handleSaveAsDraft}>
              Save as Draft
            </button>
            <button
              className="btn btn-primary"
              disabled={!isValid}
              onClick={handleContinue}
            >
              Continue to Inputs
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </main>

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
              <div className="chat-subtitle">Goals & Claims Assistant</div>
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
                placeholder="Ask about goals & constraints..."
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
    </>
  );
}
