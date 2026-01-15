import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { ProjectPageLayout, ChatMessage } from '../../components/project-setup/ProjectPageLayout';

// Unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Project types - empty for now
const projectTypes: { value: string; label: string }[] = [];

// Icons
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
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
const Select = ({ value, onChange, options, placeholder, onCreateNew, createLabel = "Create new" }: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  onCreateNew?: (name: string) => void;
  createLabel?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newValue, setNewValue] = useState('');
  const selected = options.find(o => o.value === value);

  const handleCreateNew = () => {
    if (newValue.trim() && onCreateNew) {
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

// Main Component
export default function GettingStartedPage() {
  const { theme } = useTheme();
  const { productCategories, setProductCategories, stepStatuses, setStepStatus } = useData();
  const navigate = useNavigate();

  // Form state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [types] = useState(projectTypes);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome! Let's start by setting up your new formulation project. First, select your product category, then give it a name."
    }
  ]);

  const handleCreateCategory = (categoryName: string) => {
    const newCategory = {
      value: categoryName.toLowerCase().replace(/\s+/g, '_'),
      label: categoryName
    };
    setProductCategories([...productCategories, newCategory]);
    setSelectedCategory(newCategory.value);
  };

  const handleSendMessage = (message: string) => {
    setChatMessages([
      ...chatMessages,
      { id: generateId(), role: 'user', content: message },
      { id: generateId(), role: 'assistant', content: "That sounds like an interesting project! Make sure to select the appropriate category and project type to help organize your work and enable relevant optimization features." }
    ]);
  };

  const isValid = projectName.trim().length > 0 && selectedCategory;

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= 1) {
      navigate(`/project/new/step-${stepNumber}`);
    }
  };

  return (
    <>
      <style>{`
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
          color: ${theme.accentInputs};
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
          color: ${theme.text};
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }

        .section-subtitle {
          font-size: 13px;
          color: ${theme.textTertiary};
          line-height: 1.5;
        }

        /* Form Fields */
        .form-card {
          background: ${theme.cardBg};
          border-radius: 10px;
          padding: 20px 24px;
          border: 1px solid ${theme.border};
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
          color: ${theme.textSecondary};
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-label .required {
          color: ${theme.accentInputs};
          margin-left: 2px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          background: ${theme.inputBg};
          transition: all 0.15s ease;
          color: ${theme.text};
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(45, 212, 191, 0.5);
          background: rgba(45, 212, 191, 0.05);
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.1);
        }

        .form-input::placeholder {
          color: ${theme.textMuted};
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
          background: ${theme.inputBg};
          transition: all 0.15s ease;
          resize: vertical;
          min-height: 56px;
          line-height: 1.5;
          color: ${theme.text};
        }

        .form-textarea:focus {
          outline: none;
          border-color: rgba(45, 212, 191, 0.5);
          background: rgba(45, 212, 191, 0.05);
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.1);
        }

        .form-textarea::placeholder {
          color: ${theme.textMuted};
        }

        .form-helper {
          font-size: 10px;
          color: ${theme.textMuted};
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
          background: ${theme.inputBg};
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 13px;
          transition: all 0.15s ease;
          color: ${theme.text};
        }

        .select-display:hover {
          border-color: rgba(255,255,255,0.15);
          background: ${theme.borderLight};
        }

        .select-display.placeholder {
          color: ${theme.textMuted};
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
          background: ${theme.surfaceElevated};
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
          color: ${theme.textSecondary};
        }

        .select-option:hover {
          background: rgba(45, 212, 191, 0.08);
          color: ${theme.text};
        }

        .select-option.selected {
          background: rgba(45, 212, 191, 0.12);
          color: ${theme.accentInputs};
          font-weight: 500;
        }

        .select-option.create-new {
          display: flex;
          align-items: center;
          gap: 6px;
          color: ${theme.accentInputs};
          font-weight: 500;
        }

        .select-option.create-new:hover {
          background: rgba(45, 212, 191, 0.15);
        }

        .select-divider {
          height: 1px;
          background: ${theme.border};
          margin: 4px 0;
        }

        .create-new-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: ${theme.surfaceElevated};
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
          color: ${theme.accentInputs};
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
          color: ${theme.text};
          border-bottom: 1px solid ${theme.border};
        }

        .create-new-input::placeholder {
          color: ${theme.textMuted};
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
          color: ${theme.textTertiary};
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
          background: linear-gradient(135deg, ${theme.accentInputs} 0%, ${theme.accentInputs} 100%);
          border: none;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          color: ${theme.background};
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
          color: ${theme.textTertiary};
        }

        .btn-secondary:hover {
          background: ${theme.inputBg};
          border-color: rgba(255,255,255,0.15);
          color: ${theme.textSecondary};
        }

        .btn-primary {
          background: linear-gradient(135deg, ${theme.accentInputs} 0%, ${theme.accentInputs} 100%);
          border: none;
          color: ${theme.background};
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
      `}</style>

      <ProjectPageLayout
        currentStep={1}
        stepStatuses={stepStatuses}
        chatSubtitle="Setup Assistant"
        chatMessages={chatMessages}
        onSendChatMessage={handleSendMessage}
        onStepClick={handleStepClick}
      >
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
                options={productCategories}
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
            <button className="btn btn-secondary" onClick={() => setStepStatus(1, 'draft')}>
              Save as Draft
            </button>
            <button
              className="btn btn-primary"
              disabled={!isValid}
              onClick={() => {
                setStepStatus(1, 'completed');
                navigate('/project/new/step-2');
              }}
            >
              Continue to Goals
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </ProjectPageLayout>
    </>
  );
}
