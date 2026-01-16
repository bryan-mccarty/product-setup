import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';

// Objective type definitions
const objectiveTypes = [
  { id: 'maximize', label: 'Maximize', symbol: '↑' },
  { id: 'minimize', label: 'Minimize', symbol: '↓' },
  { id: 'approximately', label: 'Target', symbol: '◎' },
  { id: 'between', label: 'Between', symbol: '↔' },
];

// Outcome type colors
const outcomeTypeConfig = {
  'Sensory': { color: '#F472B6', bg: 'rgba(244, 114, 182, 0.12)', border: 'rgba(244, 114, 182, 0.25)' },
  'Analytical': { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.25)' },
  'Consumer': { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.25)' },
  'Combination': { color: '#FB923C', bg: 'rgba(251, 146, 60, 0.12)', border: 'rgba(251, 146, 60, 0.25)' },
};

// ============================================
// ICONS
// ============================================
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 7l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ChipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
  </svg>
);

const PriorityIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M24 8v32M16 16l8-8 8 8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.3" />
    <path d="M12 32h24" strokeLinecap="round" opacity="0.5" />
    <path d="M8 40h32" strokeLinecap="round" opacity="0.3" />
  </svg>
);

const ShieldIcon = ({ small }) => (
  <svg width={small ? "14" : "18"} height={small ? "14" : "18"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ShieldFilledIcon = ({ small }) => (
  <svg width={small ? "14" : "18"} height={small ? "14" : "18"} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

const UnlockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {/* Body tilted */}
    <rect x="4" y="12" width="16" height="10" rx="2" transform="rotate(-15, 12, 17)" />
    {/* Shackle swung open to upper right - disconnected arc */}
    <path d="M20 10 C20 5 16 2 12 2 C9 2 7 4 6.5 6" strokeLinecap="round" />
    {/* Keyhole on tilted body */}
    <circle cx="11" cy="16.5" r="1" fill="currentColor" transform="rotate(-15, 12, 17)" />
  </svg>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function ObjectivePrioritization() {
  const navigate = useNavigate();
  const {
    projectObjectives,         // ONLY objectives from step 6
    setProjectObjectives,
    projectMetadata,
    stepStatuses,
    setStepStatus
  } = useData();

  const currentStep = 7;

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

  const getStepClass = (step: any) => {
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
    // Save prioritized objectives back to context
    setProjectObjectives(objectives.map((o: any) => ({
      id: o.id,
      targetName: o.targetName,
      objectiveType: o.objectiveType,
      value1: o.value1 || '',
      value2: o.value2 || '',
      successCriteria: '',
      tags: o.tags || [],
      chips: o.chips,
      isPrerequisite: o.isPrerequisite,
    })));
    setStepStatus(currentStep, 'completed');
    navigate('/project/new/step-8');
  };

  const handleSaveAsDraft = () => {
    setProjectObjectives(objectives.map((o: any) => ({
      id: o.id,
      targetName: o.targetName,
      objectiveType: o.objectiveType,
      value1: o.value1 || '',
      value2: o.value2 || '',
      successCriteria: '',
      tags: o.tags || [],
      chips: o.chips,
      isPrerequisite: o.isPrerequisite,
    })));
    setStepStatus(currentStep, 'draft');
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Project info from context
  const projectInfo = {
    title: projectMetadata?.name || "New Project",
    description: projectMetadata?.description || "Prioritize objectives for your formulation project"
  };

  // State - initialize from projectObjectives (only from step 6)
  const [objectives, setObjectives] = useState<any[]>(() => {
    // Map projectObjectives from step 6 to local state with prioritization fields
    return projectObjectives.map((obj: any) => ({
      id: obj.id,
      targetName: obj.targetName,
      targetType: 'outcome', // Default, could be enhanced
      outcomeType: 'Consumer', // Default, could be enhanced
      objectiveType: obj.objectiveType,
      value1: obj.value1 || '',
      value2: obj.value2 || '',
      chips: obj.chips || 1, // Default to 1 chip
      isPrerequisite: obj.isPrerequisite || false,
    }));
  });
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [prereqSearchSlot, setPrereqSearchSlot] = useState(null); // which slot is being searched (0 or 1)
  const [prereqSearch, setPrereqSearch] = useState('');
  const [showPrereqDropdown, setShowPrereqDropdown] = useState(false);
  const [adjustingFromRanked, setAdjustingFromRanked] = useState(null); // id of objective being adjusted from ranked panel
  const [highlightedInRanked, setHighlightedInRanked] = useState(null); // id of objective highlighted when adjusting from main panel
  const [rankingsLocked, setRankingsLocked] = useState(true); // default locked
  
  // Constants
  const TOTAL_CHIPS = 100;
  const MAX_PREREQUISITES = 2;

  // Calculated values
  const allocatedChips = useMemo(() => 
    objectives.reduce((sum, obj) => sum + obj.chips, 0), 
    [objectives]
  );
  
  const remainingChips = TOTAL_CHIPS - allocatedChips;
  
  const prerequisiteCount = useMemo(() =>
    objectives.filter(obj => obj.isPrerequisite).length,
    [objectives]
  );

  // Ranked objectives (sorted by chips, excluding prerequisites)
  // When adjusting from ranked panel, don't re-sort until mouse is released
  const [pendingRankedValue, setPendingRankedValue] = useState(null);
  
  const rankedObjectives = useMemo(() => {
    let objs = [...objectives].filter(obj => obj.chips > 0);
    
    // If adjusting from ranked panel, use the pending value for sorting stability
    if (adjustingFromRanked && pendingRankedValue !== null) {
      objs = objs.map(obj => 
        obj.id === adjustingFromRanked 
          ? { ...obj, chips: pendingRankedValue }
          : obj
      );
    }
    
    // Only sort if not currently adjusting from ranked panel
    if (!adjustingFromRanked) {
      objs.sort((a, b) => b.chips - a.chips);
    } else {
      // Keep current order, just update the value display
      const currentOrder = objectives.filter(obj => obj.chips > 0).sort((a, b) => b.chips - a.chips).map(o => o.id);
      objs.sort((a, b) => currentOrder.indexOf(a.id) - currentOrder.indexOf(b.id));
    }
    
    return objs;
  }, [objectives, adjustingFromRanked, pendingRankedValue]);

  // Prerequisites
  const prerequisiteObjectives = useMemo(() =>
    objectives.filter(obj => obj.isPrerequisite),
    [objectives]
  );

  // Prerequisite search suggestions
  const prereqSuggestions = useMemo(() => {
    if (!prereqSearch) return [];
    const query = prereqSearch.toLowerCase();
    return objectives
      .filter(obj => !obj.isPrerequisite && obj.targetName.toLowerCase().includes(query))
      .slice(0, 6);
  }, [objectives, prereqSearch]);

  // Filtered objectives for main grid
  const filteredObjectives = useMemo(() => {
    let filtered = objectives;
    
    if (activeFilter !== 'All') {
      filtered = filtered.filter(obj => obj.outcomeType === activeFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(obj => 
        obj.targetName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [objectives, activeFilter, searchQuery]);

  // Group objectives by outcome type
  const groupedObjectives = useMemo(() => {
    const groups = {};
    filteredObjectives.forEach(obj => {
      if (!groups[obj.outcomeType]) {
        groups[obj.outcomeType] = [];
      }
      groups[obj.outcomeType].push(obj);
    });
    return groups;
  }, [filteredObjectives]);

  // Handlers
  const updateChips = (id, value, fromRankedPanel = false) => {
    const numValue = Math.max(1, Math.min(100, parseInt(value) || 1)); // minimum 1
    const obj = objectives.find(o => o.id === id);
    const currentChips = fromRankedPanel && pendingRankedValue !== null ? pendingRankedValue : obj.chips;
    const maxAllowed = obj.chips + remainingChips; // current allocation + what's left
    const clampedValue = Math.min(numValue, maxAllowed);
    
    if (fromRankedPanel) {
      // Just update pending value, don't commit yet
      setPendingRankedValue(clampedValue);
      return;
    }
    
    setObjectives(prev => prev.map(o => 
      o.id === id ? { ...o, chips: clampedValue } : o
    ));
  };

  const commitRankedAdjustment = (id) => {
    if (pendingRankedValue !== null) {
      setObjectives(prev => prev.map(o => 
        o.id === id ? { ...o, chips: pendingRankedValue } : o
      ));
    }
    setAdjustingFromRanked(null);
    setPendingRankedValue(null);
  };

  const togglePrerequisite = (id) => {
    const obj = objectives.find(o => o.id === id);
    if (obj.isPrerequisite) {
      // Always allow removing
      setObjectives(prev => prev.map(o => 
        o.id === id ? { ...o, isPrerequisite: false } : o
      ));
    } else if (prerequisiteCount < MAX_PREREQUISITES) {
      // Only add if under limit
      setObjectives(prev => prev.map(o => 
        o.id === id ? { ...o, isPrerequisite: true } : o
      ));
    }
  };

  // Chat state
  const [chatMessages] = useState([
    { id: 1, type: 'assistant', text: "Allocate your 100 chips across objectives to set relative priorities. Higher chips = higher priority in optimization." },
    { id: 2, type: 'assistant', text: "You can optionally mark 1-2 prerequisite objectives—outcomes that must be achieved to validate your test results." },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Theme
  const themeColor = '#60A5FA';
  const themeColorRgb = '96, 165, 250';

  // Get objective type display with values
  const getObjectiveTypeDisplay = (obj) => {
    const typeInfo = objectiveTypes.find(t => t.id === obj.objectiveType);
    if (!typeInfo) return '';
    
    if (obj.objectiveType === 'between') {
      return `${typeInfo.symbol} ${obj.value1}–${obj.value2}`;
    } else if (obj.objectiveType === 'approximately' && obj.value1) {
      return `${typeInfo.symbol} ${obj.value1}`;
    }
    return typeInfo.symbol;
  };

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
          grid-template-columns: 1fr 340px;
          min-height: 100vh;
          background: #09090b;
        }

        .main-content {
          padding: 32px 40px;
          overflow-y: auto;
          max-height: 100vh;
          background: linear-gradient(180deg, rgba(96, 165, 250, 0.02) 0%, transparent 40%);
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

        .step-circle.draft {
          background: #18181B;
          color: #F59E0B;
          border: 2px solid #F59E0B;
        }

        .step-circle.incomplete {
          background: #18181B;
          color: #EF4444;
          border: 2px solid #EF4444;
        }

        .step {
          cursor: pointer;
        }

        .step-label.draft {
          color: #F59E0B;
        }

        .step-label.incomplete {
          color: #EF4444;
        }

        /* Project Info */
        .project-info {
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .breadcrumb {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #52525b;
          margin-bottom: 8px;
        }

        .project-title {
          font-size: 22px;
          font-weight: 700;
          color: #FAFAFA;
          margin-bottom: 6px;
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
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .section-header-left {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .section-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(${themeColorRgb}, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
          border: 1px solid rgba(${themeColorRgb}, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${themeColor};
          flex-shrink: 0;
        }

        .section-text {
          padding-top: 2px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #FAFAFA;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }

        .section-subtitle {
          font-size: 13px;
          color: #71717A;
          max-width: 500px;
          line-height: 1.5;
        }

        /* Chip Counter */
        .chip-counter {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
        }

        .chip-counter-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%);
          border: 1px solid rgba(34, 197, 94, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #22C55E;
        }

        .chip-counter-text {
          display: flex;
          flex-direction: column;
        }

        .chip-counter-label {
          font-size: 11px;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .chip-counter-value {
          font-size: 20px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          color: #E4E4E7;
        }

        .chip-counter.complete .chip-counter-icon {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%);
          border-color: rgba(34, 197, 94, 0.3);
          color: #22C55E;
        }

        .chip-counter.complete .chip-counter-value {
          color: #22C55E;
        }

        .chip-counter.partial .chip-counter-icon {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%);
          border-color: rgba(251, 191, 36, 0.3);
          color: #FBBF24;
        }

        .chip-counter.partial .chip-counter-value {
          color: #FBBF24;
        }

        .chip-counter.empty .chip-counter-icon {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
          border-color: rgba(239, 68, 68, 0.3);
          color: #EF4444;
        }

        .chip-counter.empty .chip-counter-value {
          color: #EF4444;
        }

        /* Main Layout */
        .prioritization-layout {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 24px;
        }

        /* Ranked List */
        .ranked-list-container {
          position: sticky;
          top: 0;
        }

        .ranked-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 0 4px;
        }

        .ranked-list-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #71717A;
        }

        .ranked-lock-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .ranked-lock-btn.locked {
          background: rgba(96, 165, 250, 0.15);
          border: 1px solid rgba(96, 165, 250, 0.4);
          color: #60A5FA;
        }

        .ranked-lock-btn.locked:hover {
          background: rgba(96, 165, 250, 0.25);
          border-color: rgba(96, 165, 250, 0.6);
        }

        .ranked-lock-btn.unlocked {
          background: rgba(251, 191, 36, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.4);
          color: #FBBF24;
        }

        .ranked-lock-btn.unlocked:hover {
          background: rgba(251, 191, 36, 0.25);
          border-color: rgba(251, 191, 36, 0.6);
        }

        .ranked-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ranked-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .ranked-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }

        .ranked-item.prerequisite {
          background: rgba(251, 191, 36, 0.08);
          border-color: rgba(251, 191, 36, 0.25);
        }

        .ranked-item.highlighted {
          border-color: rgba(${themeColorRgb}, 0.5);
          background: rgba(${themeColorRgb}, 0.08);
          box-shadow: 0 0 0 2px rgba(${themeColorRgb}, 0.2);
        }

        .ranked-item-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ranked-item-top svg {
          color: #FBBF24;
          flex-shrink: 0;
        }

        .rank-number {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: linear-gradient(135deg, rgba(${themeColorRgb}, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: ${themeColor};
          flex-shrink: 0;
        }

        .rank-number.gold {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%);
          color: #FBBF24;
        }

        .rank-number.silver {
          background: linear-gradient(135deg, rgba(148, 163, 184, 0.3) 0%, rgba(100, 116, 139, 0.3) 100%);
          color: #94A3B8;
        }

        .rank-number.bronze {
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(234, 88, 12, 0.3) 100%);
          color: #FB923C;
        }

        .ranked-item-info {
          flex: 1;
          min-width: 0;
        }

        .ranked-item-name {
          font-size: 12px;
          font-weight: 600;
          color: #E4E4E7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ranked-empty {
          padding: 20px;
          text-align: center;
          color: #52525b;
          font-size: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: 8px;
        }

        /* Right Content */
        .right-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Prerequisite Section - Compact but with slots */
        .prerequisite-section {
          padding: 16px;
          background: rgba(251, 191, 36, 0.04);
          border: 1px solid rgba(251, 191, 36, 0.15);
          border-radius: 10px;
        }

        .prerequisite-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .prerequisite-icon {
          color: #FBBF24;
        }

        .prerequisite-title {
          font-size: 13px;
          font-weight: 600;
          color: #FBBF24;
        }

        .prerequisite-optional-badge {
          padding: 3px 8px;
          background: rgba(113, 113, 122, 0.15);
          border: 1px solid rgba(113, 113, 122, 0.25);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
          color: #A1A1AA;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .prerequisite-description {
          font-size: 11px;
          color: #71717A;
          margin-left: auto;
        }

        .prerequisite-slots {
          display: flex;
          gap: 12px;
        }

        .prerequisite-slot {
          flex: 1;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px dashed rgba(251, 191, 36, 0.3);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60px;
          gap: 6px;
        }

        .prerequisite-slot.filled {
          border-style: solid;
          border-color: rgba(251, 191, 36, 0.5);
          background: rgba(255,255,255,0.02);
        }

        .prerequisite-slot-empty {
          color: #52525b;
          font-size: 11px;
          text-align: center;
        }

        .prerequisite-obj-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .prerequisite-obj-name {
          font-size: 13px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .prerequisite-obj-type {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }

        .prerequisite-remove {
          padding: 3px 8px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          color: #71717A;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .prerequisite-remove:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #EF4444;
        }

        .prerequisite-search-container {
          position: relative;
          width: 100%;
        }

        .prerequisite-search {
          width: 100%;
          padding: 8px 10px;
          background: transparent;
          border: none;
          font-size: 11px;
          color: #E4E4E7;
          outline: none;
          text-align: center;
        }

        .prerequisite-search::placeholder {
          color: #52525b;
        }

        .prerequisite-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #1a1a22;
          border: 1px solid rgba(251, 191, 36, 0.25);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          z-index: 100;
          max-height: 180px;
          overflow-y: auto;
        }

        .prerequisite-dropdown-item {
          padding: 8px 12px;
          font-size: 12px;
          color: #A1A1AA;
          cursor: pointer;
          transition: all 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .prerequisite-dropdown-item:hover {
          background: rgba(251, 191, 36, 0.1);
          color: #FBBF24;
        }

        .prerequisite-dropdown-type {
          font-size: 10px;
          color: #52525b;
        }

        /* Filter Bar */
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
        }

        .filter-tabs {
          display: flex;
          gap: 4px;
        }

        .filter-tab {
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          color: #71717A;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-tab:hover {
          color: #A1A1AA;
          background: rgba(255,255,255,0.04);
        }

        .filter-tab.active {
          color: ${themeColor};
          background: rgba(${themeColorRgb}, 0.1);
          border-color: rgba(${themeColorRgb}, 0.25);
        }

        .search-input-container {
          flex: 1;
          max-width: 250px;
          margin-left: auto;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px;
          padding-left: 36px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 12px;
          color: #E4E4E7;
          outline: none;
          transition: all 0.15s ease;
        }

        .search-input:focus {
          border-color: rgba(${themeColorRgb}, 0.4);
          background: rgba(${themeColorRgb}, 0.05);
        }

        .search-input::placeholder {
          color: #52525b;
        }

        /* Objectives Grid */
        .objectives-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .outcome-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .outcome-group-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
        }

        .outcome-group-dot {
          width: 10px;
          height: 10px;
          border-radius: 3px;
        }

        .outcome-group-title {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .outcome-group-count {
          font-size: 11px;
          color: #71717A;
          margin-left: 4px;
        }

        .objectives-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 10px;
        }

        /* Objective Card */
        .objective-card {
          padding: 12px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .objective-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.12);
        }

        .objective-card.has-chips {
          border-color: rgba(${themeColorRgb}, 0.3);
          background: rgba(${themeColorRgb}, 0.03);
        }

        .objective-card.is-prerequisite {
          border-color: rgba(251, 191, 36, 0.4);
          background: rgba(251, 191, 36, 0.05);
        }

        .objective-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .prerequisite-toggle {
          padding: 4px;
          background: transparent;
          border: none;
          color: #3f3f46;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .prerequisite-toggle:hover:not(.disabled) {
          color: #FBBF24;
        }

        .prerequisite-toggle.active {
          color: #FBBF24;
        }

        .prerequisite-toggle.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .objective-card-info {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .objective-card-name {
          font-size: 13px;
          font-weight: 600;
          color: #E4E4E7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .objective-card-type {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        }

        /* Slider Container */
        .slider-container {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .slider-wrapper {
          position: relative;
          flex: 1;
          height: 20px;
          display: flex;
          align-items: center;
        }

        .slider-track {
          position: absolute;
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          pointer-events: none;
          z-index: 1;
        }

        .slider-fill {
          position: absolute;
          height: 4px;
          background: linear-gradient(90deg, ${themeColor} 0%, #3B82F6 100%);
          border-radius: 2px;
          pointer-events: none;
          z-index: 2;
        }

        .slider-native {
          -webkit-appearance: none;
          appearance: none;
          position: absolute;
          width: 100%;
          height: 20px;
          background: transparent;
          cursor: pointer;
          margin: 0;
          z-index: 3;
        }

        .slider-native::-webkit-slider-track {
          height: 4px;
          background: transparent;
        }

        .slider-native::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #E4E4E7;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          margin-top: 0;
        }

        .slider-native::-moz-range-track {
          height: 4px;
          background: transparent;
        }

        .slider-native::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #E4E4E7;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          border: none;
        }

        .slider-native:hover::-webkit-slider-thumb {
          transform: scale(1.15);
        }

        .slider-native:hover::-moz-range-thumb {
          transform: scale(1.15);
        }

        .slider-value-input {
          width: 36px;
          padding: 3px 4px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 4px;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          color: #E4E4E7;
          text-align: center;
          outline: none;
        }

        .slider-value-input:focus {
          border-color: rgba(${themeColorRgb}, 0.5);
          background: rgba(${themeColorRgb}, 0.05);
        }

        /* Ranked List Slider - Full width on own line */
        .ranked-slider-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .ranked-slider-wrapper {
          position: relative;
          flex: 1;
          height: 16px;
          display: flex;
          align-items: center;
        }

        .ranked-slider-track {
          position: absolute;
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }

        .ranked-slider-fill {
          position: absolute;
          height: 4px;
          background: linear-gradient(90deg, ${themeColor} 0%, #3B82F6 100%);
          border-radius: 2px;
        }

        .ranked-slider-input {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          margin: 0;
        }

        .ranked-slider-thumb {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #E4E4E7;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          pointer-events: none;
        }

        .ranked-slider-value {
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          color: #71717A;
          width: 28px;
          text-align: right;
          flex-shrink: 0;
        }

        .ranked-slider-endcap {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #E4E4E7;
          border-radius: 50%;
          pointer-events: none;
          top: 50%;
          transform: translateY(-50%);
        }

        .ranked-slider-thumb {
          position: absolute;
          width: 14px;
          height: 14px;
          background: #E4E4E7;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          pointer-events: none;
          top: 50%;
          transform: translateY(-50%);
          transition: opacity 0.15s ease;
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
          background: linear-gradient(135deg, ${themeColor} 0%, #3B82F6 100%);
          border: none;
          color: #0a0a0f;
          box-shadow: 0 2px 12px rgba(${themeColorRgb}, 0.25);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(${themeColorRgb}, 0.4);
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

                    return (
                      <div key={step.number} className="step" onClick={() => handleStepClick(step.number)}>
                        <div
                          className={`step-circle ${stepClass}`}
                        >
                          {status === 'completed' ? <CheckIcon /> : step.number}
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

          {/* Section Header with Chip Counter */}
          <div className="section-header">
            <div className="section-header-left">
              <div className="section-icon">
                <PriorityIcon />
              </div>
              <div className="section-text">
                <h2 className="section-title">Prioritize Objectives</h2>
                <p className="section-subtitle">
                  Allocate chips to indicate relative importance. Mark up to 2 prerequisites—outcomes that must be achieved to validate testing.
                </p>
              </div>
            </div>
            
            <div className={`chip-counter ${remainingChips === 0 ? 'empty' : remainingChips <= 30 ? 'partial' : 'complete'}`}>
              <div className="chip-counter-icon">
                <ChipIcon />
              </div>
              <div className="chip-counter-text">
                <span className="chip-counter-label">Chips Remaining</span>
                <span className="chip-counter-value">
                  {remainingChips} / {TOTAL_CHIPS}
                </span>
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="prioritization-layout">
            {/* Left: Ranked List */}
            <div className="ranked-list-container">
              <div className="ranked-list-header">
                <span className="ranked-list-title">Live Rankings</span>
                <button 
                  className={`ranked-lock-btn ${rankingsLocked ? 'locked' : 'unlocked'}`}
                  onClick={() => setRankingsLocked(!rankingsLocked)}
                  title={rankingsLocked ? 'Unlock to edit rankings' : 'Lock rankings'}
                >
                  {rankingsLocked ? <LockIcon /> : <UnlockIcon />}
                </button>
              </div>
              <div className="ranked-list">
                {rankedObjectives.length === 0 ? (
                  <div className="ranked-empty">
                    Allocate chips to see rankings
                  </div>
                ) : (
                  rankedObjectives.map((obj, index) => {
                    const displayValue = (adjustingFromRanked === obj.id && pendingRankedValue !== null) 
                      ? pendingRankedValue 
                      : obj.chips;
                    const isHighlighted = highlightedInRanked === obj.id;
                    
                    // When locked, scale to max value in rankings (first item since sorted)
                    const maxChips = rankedObjectives[0]?.chips || 1;
                    const scaledPercent = rankingsLocked 
                      ? (displayValue / maxChips) * 100 
                      : displayValue;
                    
                    return (
                      <div 
                        key={obj.id} 
                        className={`ranked-item ${obj.isPrerequisite ? 'prerequisite' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                      >
                        <div className="ranked-item-top">
                          <div className={`rank-number ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                            {index + 1}
                          </div>
                          <div className="ranked-item-info">
                            <div className="ranked-item-name">{obj.targetName}</div>
                          </div>
                          {obj.isPrerequisite && <ShieldFilledIcon small />}
                        </div>
                        <div className="ranked-slider-container">
                          <div className="ranked-slider-wrapper">
                            <div className="ranked-slider-track" />
                            <div className="ranked-slider-fill" style={{ width: `${scaledPercent}%` }} />
                            {!rankingsLocked && (
                              <input
                                type="range"
                                className="ranked-slider-input"
                                min="1"
                                max="100"
                                value={displayValue}
                                onMouseDown={() => {
                                  setAdjustingFromRanked(obj.id);
                                  setPendingRankedValue(obj.chips);
                                }}
                                onChange={(e) => updateChips(obj.id, e.target.value, true)}
                                onMouseUp={() => commitRankedAdjustment(obj.id)}
                                onMouseLeave={() => {
                                  if (adjustingFromRanked === obj.id) {
                                    commitRankedAdjustment(obj.id);
                                  }
                                }}
                              />
                            )}
                            {/* Small endcap always visible for comparison */}
                            <div 
                              className="ranked-slider-endcap" 
                              style={{ left: `calc(${scaledPercent}% - 4px)` }}
                            />
                            {/* Full thumb only when unlocked */}
                            {!rankingsLocked && (
                              <div 
                                className="ranked-slider-thumb" 
                                style={{ left: `calc(${scaledPercent}% - 7px)` }}
                              />
                            )}
                          </div>
                          <span className="ranked-slider-value">{displayValue}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Prerequisites + Filter + Objectives */}
            <div className="right-content">
              {/* Prerequisite Section */}
              <div className="prerequisite-section">
                <div className="prerequisite-header">
                  <ShieldIcon small={false} />
                  <span className="prerequisite-title">Prerequisite Objectives</span>
                  <span className="prerequisite-optional-badge">Optional</span>
                  <span className="prerequisite-description">Must achieve to validate test results</span>
                </div>
                
                <div className="prerequisite-slots">
                  {[0, 1].map((slotIndex) => {
                    const prereq = prerequisiteObjectives[slotIndex];
                    const isSearchingThisSlot = prereqSearchSlot === slotIndex;
                    
                    return (
                      <div 
                        key={slotIndex} 
                        className={`prerequisite-slot ${prereq ? 'filled' : ''}`}
                      >
                        {prereq ? (
                          <>
                            <div className="prerequisite-obj-row">
                              <span className="prerequisite-obj-name">{prereq.targetName}</span>
                              <span 
                                className="prerequisite-obj-type"
                                style={{ 
                                  background: outcomeTypeConfig[prereq.outcomeType]?.bg,
                                  color: outcomeTypeConfig[prereq.outcomeType]?.color,
                                  border: `1px solid ${outcomeTypeConfig[prereq.outcomeType]?.border}`,
                                }}
                              >
                                {getObjectiveTypeDisplay(prereq)}
                              </span>
                            </div>
                            <button 
                              className="prerequisite-remove"
                              onClick={() => togglePrerequisite(prereq.id)}
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <div className="prerequisite-search-container">
                            <input
                              type="text"
                              className="prerequisite-search"
                              placeholder="Search to add..."
                              value={isSearchingThisSlot ? prereqSearch : ''}
                              onChange={(e) => {
                                setPrereqSearch(e.target.value);
                                setPrereqSearchSlot(slotIndex);
                                setShowPrereqDropdown(true);
                              }}
                              onFocus={() => {
                                setPrereqSearchSlot(slotIndex);
                                setShowPrereqDropdown(true);
                              }}
                              onBlur={() => setTimeout(() => {
                                setShowPrereqDropdown(false);
                                setPrereqSearchSlot(null);
                                setPrereqSearch('');
                              }, 150)}
                            />
                            {isSearchingThisSlot && showPrereqDropdown && prereqSuggestions.length > 0 && (
                              <div className="prerequisite-dropdown">
                                {prereqSuggestions.map(obj => (
                                  <div
                                    key={obj.id}
                                    className="prerequisite-dropdown-item"
                                    onMouseDown={() => {
                                      togglePrerequisite(obj.id);
                                      setPrereqSearch('');
                                      setShowPrereqDropdown(false);
                                      setPrereqSearchSlot(null);
                                    }}
                                  >
                                    <span>{obj.targetName}</span>
                                    <span className="prerequisite-dropdown-type">{obj.outcomeType}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filter Bar */}
              <div className="filter-bar">
                <div className="filter-tabs">
                  {['All', 'Sensory', 'Analytical', 'Consumer', 'Combination'].map(filter => (
                    <button
                      key={filter}
                      className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="search-input-container">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search objectives..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Objectives Grid by Type */}
              <div className="objectives-section">
                {Object.entries(groupedObjectives).map(([outcomeType, objs]) => {
                  const config = outcomeTypeConfig[outcomeType];
                  return (
                    <div key={outcomeType} className="outcome-group">
                      <div className="outcome-group-header">
                        <div 
                          className="outcome-group-dot" 
                          style={{ background: config?.color || '#71717A' }}
                        />
                        <span 
                          className="outcome-group-title"
                          style={{ color: config?.color || '#71717A' }}
                        >
                          {outcomeType}
                        </span>
                        <span className="outcome-group-count">
                          ({objs.length})
                        </span>
                      </div>
                      
                      <div className="objectives-grid">
                        {objs.map(obj => {
                          const config = outcomeTypeConfig[obj.outcomeType];
                          
                          return (
                            <div 
                              key={obj.id}
                              className={`objective-card ${obj.chips > 0 ? 'has-chips' : ''} ${obj.isPrerequisite ? 'is-prerequisite' : ''}`}
                            >
                              <div className="objective-card-top">
                                <button
                                  className={`prerequisite-toggle ${obj.isPrerequisite ? 'active' : ''} ${!obj.isPrerequisite && prerequisiteCount >= MAX_PREREQUISITES ? 'disabled' : ''}`}
                                  onClick={() => togglePrerequisite(obj.id)}
                                  title={obj.isPrerequisite ? 'Remove prerequisite' : prerequisiteCount >= MAX_PREREQUISITES ? 'Max prerequisites reached' : 'Mark as prerequisite'}
                                >
                                  {obj.isPrerequisite ? <ShieldFilledIcon small /> : <ShieldIcon small />}
                                </button>
                                
                                <div className="objective-card-info">
                                  <span className="objective-card-name">{obj.targetName}</span>
                                  <span 
                                    className="objective-card-type"
                                    style={{ 
                                      background: config?.bg, 
                                      color: config?.color,
                                    }}
                                  >
                                    {getObjectiveTypeDisplay(obj)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="slider-container">
                                <div className="slider-wrapper">
                                  <div className="slider-track" />
                                  <div className="slider-fill" style={{ width: `${obj.chips}%` }} />
                                  <input
                                    type="range"
                                    className="slider-native"
                                    min="1"
                                    max="100"
                                    value={obj.chips || 1}
                                    onMouseDown={() => setHighlightedInRanked(obj.id)}
                                    onInput={(e) => updateChips(obj.id, e.target.value)}
                                    onMouseUp={() => setHighlightedInRanked(null)}
                                    onMouseLeave={() => setHighlightedInRanked(null)}
                                  />
                                </div>
                                <input
                                  type="number"
                                  className="slider-value-input"
                                  value={obj.chips || ''}
                                  onChange={(e) => updateChips(obj.id, e.target.value)}
                                  onFocus={() => setHighlightedInRanked(obj.id)}
                                  onBlur={() => setHighlightedInRanked(null)}
                                  placeholder="1"
                                  min="1"
                                  max="100"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={handleSaveAsDraft}>
              Save as Draft
            </button>
            <button
              className="btn btn-primary"
              disabled={allocatedChips !== TOTAL_CHIPS}
              onClick={handleContinue}
            >
              Continue to Review
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
              <div className="chat-subtitle">Prioritization Assistant</div>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.map(message => (
              <div key={message.id} className="chat-message">
                <div className="avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div className="message-content">
                  {message.text}
                </div>
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
                placeholder="Ask about prioritization..."
              />
              <button className="send-btn">
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
