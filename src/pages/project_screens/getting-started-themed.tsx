import React, { useState } from 'react';

// Unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Sample product categories
const productCategories = [
  { value: 'ketchup', label: 'Ketchup' },
  { value: 'brownie_mix', label: 'Brownie Mix' },
  { value: 'orange_juice', label: 'Orange Juice' },
  { value: 'greek_yogurt', label: 'Greek Yogurt' },
  { value: 'potato_chips', label: 'Potato Chips' },
  { value: 'mayonnaise', label: 'Mayonnaise' },
  { value: 'granola_bar', label: 'Granola Bar' },
  { value: 'salad_dressing', label: 'Salad Dressing' },
];

// Project types - empty for now
const projectTypes = [];

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

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
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

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
);

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

// Main Component
export default function GettingStartedPage() {
  const [currentStep] = useState(1);

  const steps = [
    { number: 1, name: 'Basic Information', status: 'current' },
    { number: 2, name: 'Define Goals / Claims', status: null },
    { number: 3, name: 'Select Inputs', status: null },
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

  // Form state - reorganized: Category -> Name -> Type -> Description
  const [selectedCategory, setSelectedCategory] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [categories, setCategories] = useState(productCategories);
  const [types, setTypes] = useState(projectTypes);

  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome! Let's start by setting up your new formulation project. First, select your product category, then give it a name."
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleCreateCategory = (categoryName) => {
    const newCategory = {
      value: categoryName.toLowerCase().replace(/\s+/g, '_'),
      label: categoryName
    };
    setCategories([...categories, newCategory]);
    setSelectedCategory(newCategory.value);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages([
      ...chatMessages,
      { id: generateId(), role: 'user', content: chatInput },
      { id: generateId(), role: 'assistant', content: "That sounds like an interesting project! Make sure to select the appropriate category and project type to help organize your work and enable relevant optimization features." }
    ]);
    setChatInput('');
  };

  const isValid = projectName.trim().length > 0 && selectedCategory;

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

        /* Form Section */
        .form-section {
          max-width: 620px;
        }

        .section-header {
          margin-bottom: 20px;
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
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }

        .section-subtitle {
          font-size: 13px;
          color: #71717A;
          line-height: 1.5;
        }

        /* Form Fields */
        .form-card {
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          padding: 20px 24px;
          border: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #A1A1AA;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-label .required {
          color: #2DD4BF;
          margin-left: 2px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          background: rgba(255,255,255,0.03);
          transition: all 0.15s ease;
          color: #E4E4E7;
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(45, 212, 191, 0.5);
          background: rgba(45, 212, 191, 0.05);
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.1);
        }

        .form-input::placeholder {
          color: #52525b;
        }

        .form-input.large {
          font-size: 14px;
          font-weight: 500;
        }

        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          background: rgba(255,255,255,0.03);
          transition: all 0.15s ease;
          resize: vertical;
          min-height: 56px;
          line-height: 1.5;
          color: #E4E4E7;
        }

        .form-textarea:focus {
          outline: none;
          border-color: rgba(45, 212, 191, 0.5);
          background: rgba(45, 212, 191, 0.05);
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.1);
        }

        .form-textarea::placeholder {
          color: #52525b;
        }

        .form-helper {
          font-size: 10px;
          color: #52525b;
          margin-top: 4px;
          line-height: 1.3;
        }

        /* Select Component */
        .select-wrapper {
          position: relative;
          cursor: pointer;
        }

        .select-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 13px;
          transition: all 0.15s ease;
          color: #E4E4E7;
        }

        .select-display:hover {
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
        }

        .select-display:focus-within {
          border-color: rgba(45, 212, 191, 0.5);
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.1);
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
          right: 0;
          background: #1a1a22;
          border: 1px solid rgba(45, 212, 191, 0.2);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
          z-index: 20;
          max-height: 240px;
          overflow-y: auto;
          animation: dropdownEnter 0.15s ease-out;
        }

        @keyframes dropdownEnter {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .select-option {
          padding: 9px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.1s ease;
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

        .select-option.create-new {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #2DD4BF;
          font-weight: 500;
        }

        .select-option.create-new:hover {
          background: rgba(45, 212, 191, 0.15);
        }

        .select-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0;
        }

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
          animation: dropdownEnter 0.15s ease-out;
        }

        .create-new-header {
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 600;
          color: #2DD4BF;
          background: rgba(45, 212, 191, 0.05);
          border-bottom: 1px solid rgba(45, 212, 191, 0.15);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .create-new-input {
          width: 100%;
          padding: 10px 12px;
          border: none;
          outline: none;
          font-size: 13px;
          font-family: inherit;
          background: transparent;
          color: #E4E4E7;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .create-new-input::placeholder {
          color: #52525b;
        }

        .create-new-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(0,0,0,0.2);
        }

        .create-new-cancel {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 5px;
          font-size: 11px;
          font-weight: 500;
          color: #71717A;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
        }

        .create-new-cancel:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.15);
        }

        .create-new-save {
          padding: 6px 12px;
          background: linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%);
          border: none;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #0a0a0f;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
        }

        .create-new-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(45, 212, 191, 0.3);
        }

        .create-new-save:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Action Buttons */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn {
          padding: 10px 20px;
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

        /* Keyboard shortcut hint */
        .kbd {
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          color: #71717A;
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
            </div>
          </header>

          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FlaskIcon />
              </div>
              <div className="section-text">
                <h1 className="section-title">Let's Get Started</h1>
                <p className="section-subtitle">
                  Tell us about your formulation project. You'll be able to refine these details later.
                </p>
              </div>
            </div>

            <div className="form-card">
              {/* Category - First */}
              <div className="form-group">
                <label className="form-label">
                  Product Category <span className="required">*</span>
                </label>
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categories}
                  placeholder="Select a category..."
                  onCreateNew={handleCreateCategory}
                  createLabel="Create new category"
                />
                <div className="form-helper">
                  Select an existing category or create a new one
                </div>
              </div>

              {/* Name - Second */}
              <div className="form-group">
                <label className="form-label">
                  Project Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input large"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Low-Sugar Orange Juice"
                />
                <div className="form-helper">
                  Choose a clear, descriptive name for your project
                </div>
              </div>

              {/* Project Type - Third (New, empty) */}
              <div className="form-group">
                <label className="form-label">
                  Project Type
                </label>
                <Select
                  value={selectedType}
                  onChange={setSelectedType}
                  options={types}
                  placeholder="Select project type..."
                />
                <div className="form-helper">
                  Categorize the type of work being done
                </div>
              </div>

              {/* Description - Fourth */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Project goals, constraints, target market, or special requirements..."
                />
                <div className="form-helper">
                  Optional details about your objectives
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary">
                Save as Draft
              </button>
              <button 
                className="btn btn-primary" 
                disabled={!isValid}
              >
                Continue to Goals
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
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
