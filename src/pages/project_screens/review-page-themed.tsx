import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';

// ============================================================================
// TYPES
// ============================================================================
interface Comment {
  id: string;
  targetType: 'section' | 'item';
  targetSection: 'goals' | 'inputs' | 'outcomes' | 'constraints' | 'objectives';
  targetItemId?: string;
  author: {
    type: 'human' | 'luna';
    name: string;
  };
  content: string;
  severity?: 'info' | 'warning' | 'error';
  timestamp: Date;
  resolved: boolean;
}

interface Approval {
  section: 'goals' | 'constraints' | 'objectives' | 'inputs' | 'outcomes';
  approvedBy: string;
  approvedAt: Date;
}

// ============================================================================
// ICONS
// ============================================================================
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 7l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TargetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const FlaskIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 3h6M10 3v6l-4 8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l-4-8V3" />
  </svg>
);

const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ReviewIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="8" y="6" width="32" height="36" rx="3" />
    <path d="M16 14h16M16 22h16M16 30h10" strokeLinecap="round" />
    <circle cx="34" cy="34" r="8" fill="rgba(45, 212, 191, 0.2)" stroke="currentColor" />
    <path d="M32 34l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LunaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
  </svg>
);

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================
const StatusBadge = ({ status }: { status: 'completed' | 'draft' | 'incomplete' }) => {
  const config = {
    completed: { bg: 'rgba(45, 212, 191, 0.15)', color: '#2DD4BF', border: 'rgba(45, 212, 191, 0.3)', label: 'Complete' },
    draft: { bg: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)', label: 'Draft' },
    incomplete: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'rgba(239, 68, 68, 0.3)', label: 'Incomplete' },
  };
  const c = config[status] || config.incomplete;
  
  return (
    <span style={{
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 600,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    }}>
      {c.label}
    </span>
  );
};

// ============================================================================
// GOAL TAG COMPONENT (for linking constraints/objectives to goals)
// ============================================================================
const GoalTag = ({ goalId, goalName, isHighlighted, onHover, onClick }: { 
  goalId: string; 
  goalName: string; 
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}) => {
  return (
    <span
      style={{
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '9px',
        fontWeight: 600,
        background: isHighlighted ? 'rgba(167, 139, 250, 0.3)' : 'rgba(167, 139, 250, 0.15)',
        color: '#A78BFA',
        border: `1px solid ${isHighlighted ? 'rgba(167, 139, 250, 0.6)' : 'rgba(167, 139, 250, 0.3)'}`,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={() => onHover(goalId)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(goalId)}
      title={goalName}
    >
      {goalId}
    </span>
  );
};

// ============================================================================
// COMMENT BUBBLE COMPONENT (for item-level indicators)
// ============================================================================
const CommentIndicator = ({ 
  comments, 
  onClick 
}: { 
  comments: Comment[]; 
  onClick: () => void;
}) => {
  if (comments.length === 0) return null;
  
  const hasLuna = comments.some(c => c.author.type === 'luna');
  const hasUnresolved = comments.some(c => !c.resolved);
  const hasWarning = comments.some(c => c.severity === 'warning' || c.severity === 'error');
  
  return (
    <button
      className={`comment-indicator-btn ${hasUnresolved ? 'unresolved' : 'resolved'} ${hasLuna ? 'luna' : 'human'} ${hasWarning ? 'warning' : ''}`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={`${comments.length} comment${comments.length > 1 ? 's' : ''}`}
    >
      {hasWarning ? <AlertIcon /> : <CommentIcon />}
      {comments.length > 1 && <span className="comment-indicator-count">{comments.length}</span>}
    </button>
  );
};

// ============================================================================
// COMMENT THREAD COMPONENT
// ============================================================================
const CommentThread = ({
  comments,
  onAddComment,
  onResolve,
  onClose,
  targetLabel,
}: {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onResolve: (commentId: string) => void;
  onClose: () => void;
  targetLabel: string;
}) => {
  const [newComment, setNewComment] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="comment-thread">
      <div className="comment-thread-header">
        <span className="comment-thread-title">Comments on {targetLabel}</span>
        <button className="comment-thread-close" onClick={onClose}>
          <XIcon />
        </button>
      </div>
      
      <div className="comment-thread-list">
        {comments.length === 0 ? (
          <div className="comment-thread-empty">No comments yet</div>
        ) : (
          comments.map(comment => (
            <div 
              key={comment.id} 
              className={`comment-item ${comment.resolved ? 'resolved' : ''} ${comment.author.type}`}
            >
              <div className="comment-item-header">
                <div className="comment-item-author">
                  {comment.author.type === 'luna' ? <LunaIcon /> : <UserIcon />}
                  <span className="comment-item-name">{comment.author.name}</span>
                  {comment.severity && (
                    <span className={`comment-severity ${comment.severity}`}>
                      {comment.severity}
                    </span>
                  )}
                </div>
                <div className="comment-item-actions">
                  {!comment.resolved && (
                    <button 
                      className="comment-resolve-btn"
                      onClick={() => onResolve(comment.id)}
                      title="Mark as resolved"
                    >
                      <CheckCircleIcon />
                    </button>
                  )}
                  {comment.resolved && (
                    <span className="comment-resolved-badge">Resolved</span>
                  )}
                </div>
              </div>
              <div className="comment-item-content">{comment.content}</div>
              <div className="comment-item-time">
                {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="comment-thread-input">
        <input
          ref={inputRef}
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button 
          className="comment-send-btn"
          onClick={handleSubmit}
          disabled={!newComment.trim()}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// APPROVAL BADGE COMPONENT
// ============================================================================
const ApprovalBadge = ({ approval }: { approval?: Approval }) => {
  if (!approval) return null;
  
  return (
    <div className="approval-badge">
      <CheckCircleIcon />
      <span>Approved by {approval.approvedBy}</span>
    </div>
  );
};

// ============================================================================
// APPROVAL BUTTON COMPONENT
// ============================================================================
const ApprovalButton = ({
  section,
  approval,
  onApprove,
  onRevokeApproval,
}: {
  section: string;
  approval?: Approval;
  onApprove: () => void;
  onRevokeApproval: () => void;
}) => {
  if (approval) {
    return (
      <div className="approval-status">
        <div className="approval-info">
          <CheckCircleIcon />
          <span>Approved by {approval.approvedBy}</span>
          <span className="approval-date">
            {approval.approvedAt.toLocaleDateString()}
          </span>
        </div>
        <button className="approval-revoke-btn" onClick={onRevokeApproval}>
          Revoke
        </button>
      </div>
    );
  }

  return (
    <button className="approval-btn" onClick={onApprove}>
      <CheckCircleIcon />
      Approve {section}
    </button>
  );
};

// ============================================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================================
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  status: 'completed' | 'draft' | 'incomplete';
  summary: string;
  commentCount: number;
  hasProblems: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  themeColor?: string;
}

const CollapsibleSection = ({
  title,
  icon,
  status,
  summary,
  commentCount,
  hasProblems,
  isExpanded,
  onToggle,
  children,
  themeColor = '#2DD4BF',
}: CollapsibleSectionProps) => {
  return (
    <div className="review-section">
      <div 
        className="section-header-bar"
        onClick={onToggle}
        style={{ borderLeftColor: themeColor }}
      >
        <div className="section-header-left">
          <span className="section-collapse-icon">
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </span>
          <span className="section-icon" style={{ color: themeColor }}>
            {icon}
          </span>
          <span className="section-title">{title}</span>
          <StatusBadge status={status} />
        </div>
        
        <div className="section-header-right">
          {!isExpanded && (
            <span className="section-summary">{summary}</span>
          )}
          {hasProblems && (
            <span className="section-problem-indicator">
              <AlertIcon />
            </span>
          )}
          {commentCount > 0 && (
            <span className="section-comment-count">
              <CommentIcon />
              {commentCount}
            </span>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="section-content">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PRIORITY BAR COMPONENT
// ============================================================================
const PriorityBar = ({ value, maxValue }: { value: number; maxValue: number }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="priority-bar-container">
      <div className="priority-bar-track">
        <div 
          className="priority-bar-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="priority-bar-value">{value}</span>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ReviewPage() {
  const navigate = useNavigate();
  const {
    projectMetadata,
    projectGoals,
    projectInputs,
    projectOutcomes,
    projectConstraints,
    projectObjectives,
    stepStatuses,
    setStepStatus,
    setProjects,
  } = useData();

  const currentStep = 8;

  const steps = [
    { number: 1, name: 'Basic Information' },
    { number: 2, name: 'Define Goals / Claims' },
    { number: 3, name: 'Select Inputs' },
    { number: 4, name: 'Define Constraints' },
    { number: 5, name: 'Select Outcomes' },
    { number: 6, name: 'Set Objectives' },
    { number: 7, name: 'Prioritize Objectives' },
    { number: 8, name: 'Review' },
  ];

  // Section collapse state
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    constraintsObjectives: true,
    inputsOutcomes: true,
    lunaAssessment: true,
  });

  // Goal highlighting state (for hover/click interactions)
  const [highlightedGoalId, setHighlightedGoalId] = useState<string | null>(null);
  const [lockedGoalId, setLockedGoalId] = useState<string | null>(null);

  const activeGoalId = lockedGoalId || highlightedGoalId;

  // Comments state
  const [comments, setComments] = useState<Comment[]>([
    // Pre-populated Luna comment for demo
    {
      id: 'luna-1',
      targetType: 'item',
      targetSection: 'constraints',
      targetItemId: 'c3',
      author: { type: 'luna', name: 'Luna AI' },
      content: 'The upper bound of 375°F seems higher than typical for this product category. Most similar products in the library use 350°F maximum. Consider verifying this aligns with your equipment capabilities.',
      severity: 'warning',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      resolved: false,
    },
  ]);

  // Active comment thread state
  const [activeCommentThread, setActiveCommentThread] = useState<{
    targetType: 'section' | 'item';
    targetSection: 'goals' | 'inputs' | 'outcomes' | 'constraints' | 'objectives';
    targetItemId?: string;
    targetLabel: string;
  } | null>(null);

  // Approvals state
  const [approvals, setApprovals] = useState<Approval[]>([]);

  // Current user (mock - in real app would come from auth context)
  const currentUser = 'Current User';

  // Comment helper functions
  const getCommentsForTarget = (
    targetType: 'section' | 'item',
    targetSection: string,
    targetItemId?: string
  ) => {
    return comments.filter(c => {
      if (targetType === 'section') {
        return c.targetType === 'section' && c.targetSection === targetSection;
      }
      return c.targetType === 'item' && c.targetSection === targetSection && c.targetItemId === targetItemId;
    });
  };

  const getCommentsForSection = (section: string) => {
    return comments.filter(c => c.targetSection === section);
  };

  const hasUnresolvedComments = (section: string) => {
    return comments.some(c => c.targetSection === section && !c.resolved);
  };

  const addComment = (content: string) => {
    if (!activeCommentThread) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      targetType: activeCommentThread.targetType,
      targetSection: activeCommentThread.targetSection,
      targetItemId: activeCommentThread.targetItemId,
      author: { type: 'human', name: currentUser },
      content,
      timestamp: new Date(),
      resolved: false,
    };
    
    setComments(prev => [...prev, newComment]);
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, resolved: true } : c
    ));
  };

  const openCommentThread = (
    targetType: 'section' | 'item',
    targetSection: 'goals' | 'inputs' | 'outcomes' | 'constraints' | 'objectives',
    targetLabel: string,
    targetItemId?: string
  ) => {
    setActiveCommentThread({ targetType, targetSection, targetItemId, targetLabel });
  };

  // Approval helper functions
  const getApproval = (section: string) => {
    return approvals.find(a => a.section === section);
  };

  const approveSection = (section: 'goals' | 'constraints' | 'objectives' | 'inputs' | 'outcomes') => {
    const newApproval: Approval = {
      section,
      approvedBy: currentUser,
      approvedAt: new Date(),
    };
    setApprovals(prev => [...prev.filter(a => a.section !== section), newApproval]);
  };

  const revokeApproval = (section: string) => {
    setApprovals(prev => prev.filter(a => a.section !== section));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGoalHover = (goalId: string | null) => {
    if (!lockedGoalId) {
      setHighlightedGoalId(goalId);
    }
  };

  const handleGoalClick = (goalId: string) => {
    setLockedGoalId(prev => prev === goalId ? null : goalId);
  };

  // Get step status
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber === currentStep) {
      if (stepStatuses[stepNumber] === 'draft') return 'draft';
      return 'current';
    }
    if (stepStatuses[stepNumber] === 'completed') return 'completed';
    if (stepStatuses[stepNumber] === 'draft') return 'draft';
    if (stepStatuses[stepNumber] === 'incomplete') return 'incomplete';
    return 'upcoming';
  };

  const getStepClass = (step: any) => getStepStatus(step.number);

  // Navigation
  const handleStepClick = (stepNumber: number) => {
    navigate(`/project/new/step-${stepNumber}`);
  };

  const handleSubmit = () => {
    setStepStatus(currentStep, 'completed');

    // Create new project entry
    const newProject = {
      id: projectMetadata?.id || 'PRJ' + Date.now().toString(36).toUpperCase(),
      name: projectMetadata?.name || 'Untitled Project',
      roundsCompleted: 0,
      owner: 'Current User',
      dateModified: new Date().toISOString(),
      starred: false,
      status: { current: 0, projectedMean: 0, projectedStd: 0 }
    };

    setProjects(prev => [...prev, newProject]);
    navigate('/dashboard');
  };

  const handleSaveAsDraft = () => {
    setStepStatus(currentStep, 'draft');
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Project info
  const projectInfo = {
    title: projectMetadata?.name || 'Untitled Project',
    description: projectMetadata?.description || '',
    productLine: projectMetadata?.productLine || 'Unknown Product',
  };

  // Derive statuses from step statuses
  const getStatusFromStep = (stepNum: number): 'completed' | 'draft' | 'incomplete' => {
    const status = stepStatuses[stepNum];
    if (status === 'completed') return 'completed';
    if (status === 'draft') return 'draft';
    return 'incomplete';
  };

  // Mock data for skeleton (will be replaced with real data)
  const mockGoals = projectGoals?.length > 0 ? projectGoals : [
    { id: 'G1', name: 'Reduce sugar content by 30%', items: [] },
    { id: 'G2', name: 'Maintain consumer acceptance ≥ 8.0', items: [] },
  ];

  const mockConstraints = projectConstraints?.length > 0 ? projectConstraints : [
    { id: 'c1', targetName: 'Sugar', constraintType: 'at_most', value1: '30', value2: '', goalId: 'G1' },
    { id: 'c2', targetName: 'Total Cost', constraintType: 'at_most', value1: '2.50', value2: '' },
    { id: 'c3', targetName: 'Bake Temperature', constraintType: 'between', value1: '325', value2: '375' },
  ];

  const mockObjectives = projectObjectives?.length > 0 ? projectObjectives : [
    { id: 'o1', targetName: 'Overall Liking', objectiveType: 'maximize', value1: '', chips: 42, goalId: 'G2' },
    { id: 'o2', targetName: 'Purchase Intent', objectiveType: 'maximize', value1: '', chips: 28, goalId: 'G2' },
    { id: 'o3', targetName: 'Total Cost', objectiveType: 'minimize', value1: '', chips: 18 },
    { id: 'o4', targetName: 'Sweetness', objectiveType: 'approximately', value1: '7.5', chips: 12, goalId: 'G1' },
  ];

  // Calculate max priority AFTER mockObjectives is defined
  const maxPriority = Math.max(...mockObjectives.map((o: any) => o.chips || 0), 1);

  const mockInputs = projectInputs?.length > 0 ? projectInputs : [
    { id: 'i1', name: 'Flour', inputType: 'Ingredient' },
    { id: 'i2', name: 'Sugar', inputType: 'Ingredient' },
    { id: 'i3', name: 'Butter', inputType: 'Ingredient' },
    { id: 'i4', name: 'Eggs', inputType: 'Ingredient' },
    { id: 'i5', name: 'Cocoa Powder', inputType: 'Ingredient' },
    { id: 'i6', name: 'Bake Temperature', inputType: 'Processing' },
  ];

  const mockOutcomes = projectOutcomes?.length > 0 ? projectOutcomes : [
    { id: 'out1', name: 'Overall Liking', outcomeType: 'Consumer' },
    { id: 'out2', name: 'Purchase Intent', outcomeType: 'Consumer' },
    { id: 'out3', name: 'Sweetness', outcomeType: 'Sensory' },
    { id: 'out4', name: 'Moisture Content', outcomeType: 'Analytical' },
  ];

  // Helper to format constraint/objective display
  const formatConstraint = (c: any) => {
    const symbols: Record<string, string> = {
      'equals': '=',
      'at_least': '≥',
      'at_most': '≤',
      'between': '↔',
    };
    const symbol = symbols[c.constraintType] || c.constraintType;
    if (c.constraintType === 'between') {
      return `${c.targetName} ${symbol} ${c.value1}–${c.value2}`;
    }
    return `${c.targetName} ${symbol} ${c.value1}`;
  };

  const formatConstraintValue = (c: any) => {
    const symbols: Record<string, string> = {
      'equals': '=',
      'at_least': '≥',
      'at_most': '≤',
      'between': '',
    };
    const symbol = symbols[c.constraintType] || '';
    if (c.constraintType === 'between') {
      return `${c.value1}–${c.value2}`;
    }
    return `${symbol} ${c.value1}`;
  };

  const formatObjective = (o: any) => {
    const symbols: Record<string, string> = {
      'maximize': '↑',
      'minimize': '↓',
      'approximately': '◎',
      'between': '↔',
    };
    const symbol = symbols[o.objectiveType] || o.objectiveType;
    if (o.value1) {
      return `${o.targetName} ${symbol} ${o.value1}`;
    }
    return `${o.targetName} ${symbol}`;
  };

  // Group inputs/outcomes by type
  const inputsByType = mockInputs.reduce((acc: any, input: any) => {
    const type = input.inputType || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(input);
    return acc;
  }, {});

  const outcomesByType = mockOutcomes.reduce((acc: any, outcome: any) => {
    const type = outcome.outcomeType || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(outcome);
    return acc;
  }, {});

  return (
    <>
      <style>{`
        /* ============================================ */
        /* BASE STYLES */
        /* ============================================ */
        * {
          box-sizing: border-box;
        }

        .page-container {
          display: flex;
          min-height: 100vh;
          background: #09090b;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .main-content {
          flex: 1;
          padding: 32px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ============================================ */
        /* STEPPER HEADER */
        /* ============================================ */
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
          cursor: pointer;
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

        .step-label.draft {
          color: #F59E0B;
        }

        .step-label.incomplete {
          color: #EF4444;
        }

        /* ============================================ */
        /* PROJECT INFO */
        /* ============================================ */
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

        /* ============================================ */
        /* SECTION HEADER */
        /* ============================================ */
        .page-section-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
        }

        .page-section-icon {
          width: 48px;
          height: 48px;
          background: rgba(45, 212, 191, 0.1);
          border: 1px solid rgba(45, 212, 191, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2DD4BF;
          flex-shrink: 0;
        }

        .page-section-text h2 {
          font-size: 18px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }

        .page-section-text p {
          font-size: 13px;
          color: #71717A;
          line-height: 1.5;
          margin: 0;
        }

        /* ============================================ */
        /* REVIEW SECTIONS */
        /* ============================================ */
        .review-sections {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
        }

        .section-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          cursor: pointer;
          border-left: 3px solid transparent;
          transition: all 0.15s ease;
        }

        .section-header-bar:hover {
          background: rgba(255,255,255,0.02);
        }

        .section-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-collapse-icon {
          color: #52525b;
          display: flex;
          align-items: center;
        }

        .section-icon {
          display: flex;
          align-items: center;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .section-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-summary {
          font-size: 12px;
          color: #71717A;
        }

        .section-problem-indicator {
          color: #F59E0B;
          display: flex;
          align-items: center;
        }

        .section-comment-count {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #71717A;
          padding: 3px 8px;
          background: rgba(255,255,255,0.04);
          border-radius: 4px;
        }

        .section-content {
          padding: 0 18px 18px 18px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        /* ============================================ */
        /* TWO COLUMN LAYOUT */
        /* ============================================ */
        .two-column-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 16px;
        }

        .column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .column-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 4px;
        }

        .column-title {
          font-size: 12px;
          font-weight: 600;
          color: #A1A1AA;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .column-count {
          font-size: 11px;
          color: #52525b;
        }

        /* ============================================ */
        /* ITEM ROWS */
        /* ============================================ */
        .item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .item-row:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }

        .item-row.highlighted {
          background: rgba(167, 139, 250, 0.08);
          border-color: rgba(167, 139, 250, 0.3);
        }

        .item-row-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .item-row-name {
          font-size: 13px;
          color: #E4E4E7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-row-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .item-comment-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #A78BFA;
        }

        .item-comment-indicator.luna {
          background: #A78BFA;
        }

        .item-comment-indicator.human {
          background: #60A5FA;
        }

        /* ============================================ */
        /* PRIORITY BAR */
        /* ============================================ */
        .priority-bar-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 80px;
        }

        .priority-bar-track {
          flex: 1;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .priority-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #22D3EE 0%, #2DD4BF 100%);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .priority-bar-value {
          font-size: 11px;
          color: #71717A;
          min-width: 20px;
          text-align: right;
        }

        /* ============================================ */
        /* TYPE GROUPS */
        /* ============================================ */
        .type-group {
          margin-bottom: 12px;
        }

        .type-group:last-child {
          margin-bottom: 0;
        }

        .type-group-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .type-group-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .type-group-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .type-group-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-left: 14px;
        }

        .type-group-item {
          font-size: 13px;
          color: #A1A1AA;
          padding: 4px 0;
        }

        /* ============================================ */
        /* GOALS LIST IN OVERVIEW */
        /* ============================================ */
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 12px;
        }

        .goal-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .goal-row:hover {
          background: rgba(255,255,255,0.04);
        }

        .goal-row.highlighted {
          background: rgba(167, 139, 250, 0.1);
          border-color: rgba(167, 139, 250, 0.3);
        }

        .goal-id {
          font-size: 10px;
          font-weight: 700;
          color: #A78BFA;
          padding: 2px 6px;
          background: rgba(167, 139, 250, 0.15);
          border-radius: 4px;
          flex-shrink: 0;
        }

        .goal-content {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .goal-name {
          font-size: 13px;
          font-weight: 500;
          color: #E4E4E7;
        }

        .goal-links {
          font-size: 11px;
          color: #71717A;
        }

        .goal-row-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* ============================================ */
        /* LUNA SUMMARY */
        /* ============================================ */
        .luna-summary {
          margin-top: 12px;
          padding: 16px;
          background: rgba(167, 139, 250, 0.05);
          border: 1px solid rgba(167, 139, 250, 0.15);
          border-radius: 10px;
        }

        .luna-summary-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(167, 139, 250, 0.15);
        }

        .luna-summary-label {
          font-size: 12px;
          font-weight: 600;
          color: #A78BFA;
        }

        .luna-summary-text {
          font-size: 13px;
          color: #D4D4D8;
          line-height: 1.6;
        }

        .luna-summary-text p {
          margin: 0 0 10px 0;
        }

        .luna-summary-text p:last-child {
          margin-bottom: 0;
        }

        .luna-summary-text strong {
          color: #F4F4F5;
        }

        /* ============================================ */
        /* SECTION LUNA CONTEXT (inline summary) */
        /* ============================================ */
        .section-luna-context {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          margin-top: 12px;
          background: rgba(167, 139, 250, 0.05);
          border-left: 2px solid rgba(167, 139, 250, 0.4);
          border-radius: 0 6px 6px 0;
          font-size: 12px;
          color: #A1A1AA;
          line-height: 1.5;
        }

        .section-luna-context svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ============================================ */
        /* GOALS LIST */
        /* ============================================ */
        .goals-list-header {
          font-size: 10px;
          font-weight: 600;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 12px;
          margin-bottom: 4px;
        }

        /* ============================================ */
        /* COLUMN LAYOUT IMPROVEMENTS */
        /* ============================================ */
        .two-column-equal-height {
          align-items: stretch;
        }

        .two-column-equal-height .column {
          display: flex;
          flex-direction: column;
        }

        .column-content {
          flex: 1;
        }

        .column-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* ============================================ */
        /* DENSE CONSTRAINTS & OBJECTIVES LAYOUT */
        /* ============================================ */
        .co-dense-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 12px;
        }

        .co-dense-column {
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          overflow: hidden;
        }

        .co-dense-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-size: 11px;
          font-weight: 600;
          color: #A1A1AA;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .co-dense-header svg {
          width: 12px;
          height: 12px;
        }

        .co-dense-count {
          margin-left: auto;
          font-size: 10px;
          color: #52525b;
          font-weight: 500;
        }

        .co-dense-list {
          display: flex;
          flex-direction: column;
          padding: 6px;
          gap: 2px;
        }

        .co-dense-item {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 4px;
          transition: all 0.15s ease;
        }

        .co-dense-item:hover {
          background: rgba(255,255,255,0.04);
        }

        .co-dense-item.highlighted {
          background: rgba(167, 139, 250, 0.1);
        }

        .co-dense-name {
          font-size: 12px;
          color: #E4E4E7;
          flex-shrink: 0;
        }

        .co-dense-item-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .co-dense-value {
          font-size: 11px;
          color: #71717A;
          font-family: 'SF Mono', 'Menlo', monospace;
        }

        .co-dense-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: auto;
        }

        .add-comment-btn-inline {
          background: transparent;
          border: none;
          color: #52525b;
          cursor: pointer;
          padding: 2px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          transition: all 0.15s ease;
          margin-left: auto;
        }

        .add-comment-btn-inline:hover {
          background: rgba(255,255,255,0.1);
          color: #A1A1AA;
        }

        /* ============================================ */
        /* OBJECTIVES BAR CHART */
        /* ============================================ */
        .objectives-bar-chart {
          display: flex;
          flex-direction: column;
          padding: 6px;
          gap: 2px;
        }

        .obj-bar-row {
          display: grid;
          grid-template-columns: 1fr 120px 36px 28px;
          gap: 8px;
          align-items: center;
          padding: 4px 6px;
          border-radius: 4px;
          transition: all 0.15s ease;
        }

        .obj-bar-row:hover {
          background: rgba(255,255,255,0.04);
        }

        .obj-bar-row.highlighted {
          background: rgba(167, 139, 250, 0.1);
        }

        .obj-bar-label {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }

        .obj-bar-symbol {
          font-size: 11px;
          color: #2DD4BF;
          width: 14px;
          text-align: center;
          flex-shrink: 0;
        }

        .obj-bar-name {
          font-size: 12px;
          color: #E4E4E7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .obj-bar-chart-area {
          display: flex;
          align-items: center;
        }

        .obj-bar-track {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
          overflow: hidden;
        }

        .obj-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #22D3EE 0%, #2DD4BF 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .obj-bar-pct {
          font-size: 11px;
          font-weight: 600;
          color: #A1A1AA;
          min-width: 32px;
          text-align: right;
        }

        /* ============================================ */
        /* LUNA ASSESSMENT SECTION */
        /* ============================================ */
        .luna-assessment-content {
          padding-top: 16px;
        }

        .luna-assessment-text {
          font-size: 14px;
          color: #D4D4D8;
          line-height: 1.7;
        }

        /* ============================================ */
        /* FORM ACTIONS */
        /* ============================================ */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: #A1A1AA;
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          color: #E4E4E7;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%);
          border: none;
          color: #0a0a0f;
          box-shadow: 0 2px 12px rgba(45, 212, 191, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(45, 212, 191, 0.4);
        }

        .btn-primary:disabled {
          background: rgba(255,255,255,0.1);
          color: #52525b;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        /* ============================================ */
        /* CHAT PANEL */
        /* ============================================ */
        .chat-panel {
          width: 340px;
          background: #0f0f12;
          border-left: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
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
          background: rgba(167, 139, 250, 0.1);
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-header-text {
          flex: 1;
        }

        .chat-title {
          font-size: 14px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .chat-subtitle {
          font-size: 11px;
          color: #71717A;
        }

        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .chat-message {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .chat-avatar {
          width: 28px;
          height: 28px;
          background: rgba(167, 139, 250, 0.15);
          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chat-message-content {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          color: #A1A1AA;
          line-height: 1.6;
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
        }

        .send-btn:hover {
          transform: translateY(-1px);
        }

        /* ============================================ */
        /* COMMENT INDICATOR BUTTON */
        /* ============================================ */
        .comment-indicator-btn {
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 4px 6px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          color: #71717A;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 10px;
        }

        .comment-indicator-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
        }

        .comment-indicator-btn.unresolved {
          background: rgba(167, 139, 250, 0.1);
          border-color: rgba(167, 139, 250, 0.3);
          color: #A78BFA;
        }

        .comment-indicator-btn.unresolved.warning {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.3);
          color: #FBBF24;
        }

        .comment-indicator-btn.resolved {
          opacity: 0.6;
        }

        .comment-indicator-count {
          font-weight: 600;
        }

        /* ============================================ */
        /* COMMENT THREAD */
        /* ============================================ */
        .comment-thread {
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 420px;
          max-height: 500px;
          background: #18181B;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .comment-thread-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .comment-thread-title {
          font-size: 13px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .comment-thread-close {
          background: transparent;
          border: none;
          color: #71717A;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .comment-thread-close:hover {
          background: rgba(255,255,255,0.05);
          color: #A1A1AA;
        }

        .comment-thread-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 350px;
        }

        .comment-thread-empty {
          text-align: center;
          color: #52525b;
          font-size: 13px;
          padding: 20px;
        }

        .comment-item {
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
        }

        .comment-item.resolved {
          opacity: 0.6;
        }

        .comment-item.luna {
          border-left: 3px solid #A78BFA;
        }

        .comment-item.human {
          border-left: 3px solid #60A5FA;
        }

        .comment-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .comment-item-author {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .comment-item-name {
          font-size: 12px;
          font-weight: 600;
          color: #E4E4E7;
        }

        .comment-severity {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .comment-severity.info {
          background: rgba(96, 165, 250, 0.15);
          color: #60A5FA;
        }

        .comment-severity.warning {
          background: rgba(251, 191, 36, 0.15);
          color: #FBBF24;
        }

        .comment-severity.error {
          background: rgba(239, 68, 68, 0.15);
          color: #EF4444;
        }

        .comment-item-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .comment-resolve-btn {
          background: transparent;
          border: none;
          color: #52525b;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .comment-resolve-btn:hover {
          background: rgba(45, 212, 191, 0.1);
          color: #2DD4BF;
        }

        .comment-resolved-badge {
          font-size: 10px;
          color: #2DD4BF;
          background: rgba(45, 212, 191, 0.1);
          padding: 2px 6px;
          border-radius: 3px;
        }

        .comment-item-content {
          font-size: 13px;
          color: #D4D4D8;
          line-height: 1.5;
          margin-bottom: 6px;
        }

        .comment-item-time {
          font-size: 10px;
          color: #52525b;
        }

        .comment-thread-input {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .comment-thread-input input {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 13px;
          color: #E4E4E7;
          outline: none;
          font-family: inherit;
        }

        .comment-thread-input input:focus {
          border-color: rgba(167, 139, 250, 0.5);
        }

        .comment-thread-input input::placeholder {
          color: #52525b;
        }

        .comment-send-btn {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .comment-send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .comment-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ============================================ */
        /* ADD COMMENT BUTTON (inline) */
        /* ============================================ */
        .add-comment-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.15);
          border-radius: 5px;
          color: #52525b;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .add-comment-btn:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.25);
          color: #71717A;
        }

        /* ============================================ */
        /* APPROVAL SYSTEM */
        /* ============================================ */
        .approval-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(45, 212, 191, 0.1);
          border: 1px solid rgba(45, 212, 191, 0.3);
          border-radius: 6px;
          color: #2DD4BF;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .approval-btn:hover {
          background: rgba(45, 212, 191, 0.15);
          border-color: rgba(45, 212, 191, 0.5);
        }

        .approval-status {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .approval-info {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(45, 212, 191, 0.1);
          border-radius: 6px;
          color: #2DD4BF;
          font-size: 11px;
        }

        .approval-date {
          color: rgba(45, 212, 191, 0.6);
          margin-left: 4px;
        }

        .approval-revoke-btn {
          background: transparent;
          border: none;
          color: #71717A;
          font-size: 11px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: inherit;
        }

        .approval-revoke-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }

        .section-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .section-footer-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ============================================ */
        /* COMMENT OVERLAY BACKDROP */
        /* ============================================ */
        .comment-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 999;
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
                    const stepClass = getStepClass(step);
                    return (
                      <div key={step.number} className="step" onClick={() => handleStepClick(step.number)}>
                        <div className={`step-circle ${stepClass}`}>
                          {stepClass === 'completed' ? <CheckIcon /> : step.number}
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
                <div className="breadcrumb">Project Review</div>
                <h1 className="project-title">{projectInfo.title}</h1>
                <p className="project-description">{projectInfo.description}</p>
              </div>
            </div>
          </header>

          {/* Page Section Header */}
          <div className="page-section-header">
            <div className="page-section-icon">
              <ReviewIcon />
            </div>
            <div className="page-section-text">
              <h2>Review & Submit</h2>
              <p>
                Review your optimization project configuration before submitting. 
                Use comments to flag items for discussion with stakeholders.
              </p>
            </div>
          </div>

          {/* Review Sections */}
          <div className="review-sections">
            
            {/* SECTION 1: Overview */}
            <CollapsibleSection
              title="Overview"
              icon={<TargetIcon />}
              status={getStatusFromStep(2)}
              summary={`${mockGoals.length} goals configured`}
              commentCount={getCommentsForSection('goals').length}
              hasProblems={hasUnresolvedComments('goals')}
              isExpanded={expandedSections.overview}
              onToggle={() => toggleSection('overview')}
              themeColor="#A78BFA"
            >
              {/* Luna Summary - FIRST */}
              <div className="luna-summary">
                <div className="luna-summary-header">
                  <LunaIcon />
                  <span className="luna-summary-label">Summary</span>
                </div>
                <div className="luna-summary-text">
                  <p>
                    This project will reformulate <strong>{projectInfo.productLine || 'the product'}</strong> to 
                    achieve two main business goals: reducing sugar content by 30% while keeping consumer 
                    acceptance scores at or above 8.0.
                  </p>
                  <p>
                    The optimization considers {mockInputs.length} controllable factors and will measure 
                    success across {mockOutcomes.length} outcomes. Consumer preference metrics like Overall 
                    Liking and Purchase Intent are weighted most heavily, receiving 70% of the total priority.
                  </p>
                  <p>
                    {mockConstraints.length} hard constraints ensure the formulation stays within acceptable 
                    bounds for sugar content, cost, and processing parameters.
                  </p>
                </div>
              </div>

              {/* Goals List */}
              <div className="goals-list">
                <div className="goals-list-header">Goals & Claims</div>
                {mockGoals.map((goal: any, index: number) => {
                  const goalId = `G${index + 1}`;
                  const isHighlighted = activeGoalId === goalId;
                  const goalComments = getCommentsForTarget('item', 'goals', goal.id);
                  
                  // Count linked constraints and objectives
                  const linkedConstraints = mockConstraints.filter((c: any) => c.goalId === goalId).length;
                  const linkedObjectives = mockObjectives.filter((o: any) => o.goalId === goalId).length;
                  
                  return (
                    <div
                      key={goal.id}
                      className={`goal-row ${isHighlighted ? 'highlighted' : ''}`}
                      onMouseEnter={() => handleGoalHover(goalId)}
                      onMouseLeave={() => handleGoalHover(null)}
                      onClick={() => handleGoalClick(goalId)}
                    >
                      <span className="goal-id">{goalId}</span>
                      <div className="goal-content">
                        <div className="goal-name">{goal.name}</div>
                        <div className="goal-links">
                          {linkedConstraints > 0 && `${linkedConstraints} constraint${linkedConstraints > 1 ? 's' : ''}`}
                          {linkedConstraints > 0 && linkedObjectives > 0 && ' · '}
                          {linkedObjectives > 0 && `${linkedObjectives} objective${linkedObjectives > 1 ? 's' : ''}`}
                          {linkedConstraints === 0 && linkedObjectives === 0 && 'No linked items'}
                        </div>
                      </div>
                      <div className="goal-row-right">
                        {goalComments.length > 0 ? (
                          <CommentIndicator
                            comments={goalComments}
                            onClick={() => openCommentThread('item', 'goals', goal.name, goal.id)}
                          />
                        ) : (
                          <button
                            className="add-comment-btn-inline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCommentThread('item', 'goals', goal.name, goal.id);
                            }}
                          >
                            <CommentIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section Footer with Approval */}
              <div className="section-footer">
                <div className="section-footer-left">
                  <button
                    className="add-comment-btn"
                    onClick={() => openCommentThread('section', 'goals', 'Goals & Claims')}
                  >
                    <CommentIcon /> Comment on section
                  </button>
                </div>
                <ApprovalButton
                  section="Goals"
                  approval={getApproval('goals')}
                  onApprove={() => approveSection('goals')}
                  onRevokeApproval={() => revokeApproval('goals')}
                />
              </div>
            </CollapsibleSection>

            {/* SECTION 2: Constraints & Objectives */}
            <CollapsibleSection
              title="Constraints & Objectives"
              icon={<LockIcon />}
              status={getStatusFromStep(4) === 'completed' && getStatusFromStep(6) === 'completed' 
                ? 'completed' 
                : getStatusFromStep(4) === 'draft' || getStatusFromStep(6) === 'draft' 
                  ? 'draft' 
                  : 'incomplete'}
              summary={`${mockConstraints.length} constraints · ${mockObjectives.length} objectives`}
              commentCount={getCommentsForSection('constraints').length + getCommentsForSection('objectives').length}
              hasProblems={hasUnresolvedComments('constraints') || hasUnresolvedComments('objectives')}
              isExpanded={expandedSections.constraintsObjectives}
              onToggle={() => toggleSection('constraintsObjectives')}
              themeColor="#FBBF24"
            >
              {/* Luna Context */}
              <div className="section-luna-context">
                <LunaIcon />
                <span>
                  The optimization will maximize consumer metrics while staying within {mockConstraints.length} hard 
                  boundaries. Priority heavily favors sensory outcomes (70% weight).
                </span>
              </div>

              <div className="co-dense-layout">
                {/* Constraints Column */}
                <div className="co-dense-column">
                  <div className="co-dense-header">
                    <LockIcon />
                    <span>Constraints</span>
                    <span className="co-dense-count">{mockConstraints.length}</span>
                  </div>
                  <div className="co-dense-list">
                    {mockConstraints.map((constraint: any) => {
                      const isHighlighted = constraint.goalId && activeGoalId === constraint.goalId;
                      const constraintComments = getCommentsForTarget('item', 'constraints', constraint.id);
                      return (
                        <div 
                          key={constraint.id} 
                          className={`co-dense-item ${isHighlighted ? 'highlighted' : ''}`}
                        >
                          <div className="co-dense-item-left">
                            <span className="co-dense-name">{constraint.targetName}</span>
                            <span className="co-dense-value">{formatConstraintValue(constraint)}</span>
                            {constraint.goalId && (
                              <GoalTag
                                goalId={constraint.goalId}
                                goalName={mockGoals.find((g: any, i: number) => `G${i + 1}` === constraint.goalId)?.name || ''}
                                isHighlighted={isHighlighted}
                                onHover={handleGoalHover}
                                onClick={handleGoalClick}
                              />
                            )}
                          </div>
                          {constraintComments.length > 0 ? (
                            <CommentIndicator
                              comments={constraintComments}
                              onClick={() => openCommentThread('item', 'constraints', constraint.targetName, constraint.id)}
                            />
                          ) : (
                            <button
                              className="add-comment-btn-inline"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCommentThread('item', 'constraints', constraint.targetName, constraint.id);
                              }}
                            >
                              <CommentIcon />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="co-dense-footer">
                    <button className="add-comment-btn" onClick={() => openCommentThread('section', 'constraints', 'Constraints')}>
                      <CommentIcon /> Comment
                    </button>
                    <ApprovalButton
                      section="Constraints"
                      approval={getApproval('constraints')}
                      onApprove={() => approveSection('constraints')}
                      onRevokeApproval={() => revokeApproval('constraints')}
                    />
                  </div>
                </div>

                {/* Objectives Column - Horizontal Bar Chart */}
                <div className="co-dense-column">
                  <div className="co-dense-header">
                    <ChartIcon />
                    <span>Objectives (Priority %)</span>
                    <span className="co-dense-count">{mockObjectives.length}</span>
                  </div>
                  <div className="objectives-bar-chart">
                    {mockObjectives
                      .sort((a: any, b: any) => (b.chips || 0) - (a.chips || 0))
                      .map((objective: any) => {
                        const isHighlighted = objective.goalId && activeGoalId === objective.goalId;
                        const objectiveComments = getCommentsForTarget('item', 'objectives', objective.id);
                        const percentage = maxPriority > 0 ? ((objective.chips || 0) / maxPriority) * 100 : 0;
                        const typeSymbols: Record<string, string> = { maximize: '↑', minimize: '↓', approximately: '◎', between: '↔' };
                        const symbol = typeSymbols[objective.objectiveType] || '';
                        
                        return (
                          <div 
                            key={objective.id} 
                            className={`obj-bar-row ${isHighlighted ? 'highlighted' : ''}`}
                          >
                            <div className="obj-bar-label">
                              <span className="obj-bar-symbol">{symbol}</span>
                              <span className="obj-bar-name">{objective.targetName}</span>
                              {objective.goalId && (
                                <GoalTag
                                  goalId={objective.goalId}
                                  goalName={mockGoals.find((g: any, i: number) => `G${i + 1}` === objective.goalId)?.name || ''}
                                  isHighlighted={isHighlighted}
                                  onHover={handleGoalHover}
                                  onClick={handleGoalClick}
                                />
                              )}
                            </div>
                            <div className="obj-bar-chart-area">
                              <div className="obj-bar-track">
                                <div className="obj-bar-fill" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                            <span className="obj-bar-pct">{objective.chips}%</span>
                            {objectiveComments.length > 0 ? (
                              <CommentIndicator
                                comments={objectiveComments}
                                onClick={() => openCommentThread('item', 'objectives', objective.targetName, objective.id)}
                              />
                            ) : (
                              <button
                                className="add-comment-btn-inline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCommentThread('item', 'objectives', objective.targetName, objective.id);
                                }}
                              >
                                <CommentIcon />
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  <div className="co-dense-footer">
                    <button className="add-comment-btn" onClick={() => openCommentThread('section', 'objectives', 'Objectives')}>
                      <CommentIcon /> Comment
                    </button>
                    <ApprovalButton
                      section="Objectives"
                      approval={getApproval('objectives')}
                      onApprove={() => approveSection('objectives')}
                      onRevokeApproval={() => revokeApproval('objectives')}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* SECTION 3: Inputs & Outcomes */}
            <CollapsibleSection
              title="Inputs & Outcomes"
              icon={<FlaskIcon />}
              status={getStatusFromStep(3) === 'completed' && getStatusFromStep(5) === 'completed' 
                ? 'completed' 
                : getStatusFromStep(3) === 'draft' || getStatusFromStep(5) === 'draft' 
                  ? 'draft' 
                  : 'incomplete'}
              summary={`${mockInputs.length} inputs · ${mockOutcomes.length} outcomes`}
              commentCount={getCommentsForSection('inputs').length + getCommentsForSection('outcomes').length}
              hasProblems={hasUnresolvedComments('inputs') || hasUnresolvedComments('outcomes')}
              isExpanded={expandedSections.inputsOutcomes}
              onToggle={() => toggleSection('inputsOutcomes')}
              themeColor="#2DD4BF"
            >
              {/* Luna Context */}
              <div className="section-luna-context">
                <LunaIcon />
                <span>
                  The model will explore {mockInputs.length} controllable variables to optimize 
                  {mockOutcomes.length} measured outcomes.
                </span>
              </div>

              <div className="two-column-layout two-column-equal-height">
                {/* Inputs Column */}
                <div className="column">
                  <div className="column-header">
                    <FlaskIcon />
                    <span className="column-title">Inputs</span>
                    <span className="column-count">({mockInputs.length})</span>
                  </div>
                  <div className="column-content">
                    {Object.entries(inputsByType).map(([type, inputs]: [string, any]) => {
                      const typeColors: Record<string, string> = {
                        'Ingredient': '#2DD4BF',
                        'Processing': '#FB923C',
                        'Other': '#A78BFA',
                      };
                      return (
                        <div key={type} className="type-group">
                          <div className="type-group-header">
                            <span 
                              className="type-group-dot" 
                              style={{ background: typeColors[type] || '#71717A' }}
                            />
                            <span 
                              className="type-group-label"
                              style={{ color: typeColors[type] || '#71717A' }}
                            >
                              {type}
                            </span>
                          </div>
                          <div className="type-group-items">
                            {inputs.map((input: any) => {
                              const inputComments = getCommentsForTarget('item', 'inputs', input.id);
                              return (
                                <div key={input.id} className="type-group-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{input.name}</span>
                                  {inputComments.length > 0 ? (
                                    <CommentIndicator
                                      comments={inputComments}
                                      onClick={() => openCommentThread('item', 'inputs', input.name, input.id)}
                                    />
                                  ) : (
                                    <button
                                      className="add-comment-btn"
                                      style={{ padding: '2px 6px', fontSize: '10px' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCommentThread('item', 'inputs', input.name, input.id);
                                      }}
                                    >
                                      <CommentIcon />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="column-footer">
                    <button
                      className="add-comment-btn"
                      onClick={() => openCommentThread('section', 'inputs', 'Inputs')}
                    >
                      <CommentIcon /> Comment
                    </button>
                    <ApprovalButton
                      section="Inputs"
                      approval={getApproval('inputs')}
                      onApprove={() => approveSection('inputs')}
                      onRevokeApproval={() => revokeApproval('inputs')}
                    />
                  </div>
                </div>

                {/* Outcomes Column */}
                <div className="column">
                  <div className="column-header">
                    <ChartIcon />
                    <span className="column-title">Outcomes</span>
                    <span className="column-count">({mockOutcomes.length})</span>
                  </div>
                  <div className="column-content">
                    {Object.entries(outcomesByType).map(([type, outcomes]: [string, any]) => {
                      const typeColors: Record<string, string> = {
                        'Consumer': '#A78BFA',
                        'Sensory': '#F472B6',
                        'Analytical': '#60A5FA',
                        'Other': '#71717A',
                      };
                      return (
                        <div key={type} className="type-group">
                          <div className="type-group-header">
                            <span 
                              className="type-group-dot" 
                              style={{ background: typeColors[type] || '#71717A' }}
                            />
                            <span 
                              className="type-group-label"
                              style={{ color: typeColors[type] || '#71717A' }}
                            >
                              {type}
                            </span>
                          </div>
                          <div className="type-group-items">
                            {outcomes.map((outcome: any) => {
                              const outcomeComments = getCommentsForTarget('item', 'outcomes', outcome.id);
                              return (
                                <div key={outcome.id} className="type-group-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{outcome.name}</span>
                                  {outcomeComments.length > 0 ? (
                                    <CommentIndicator
                                      comments={outcomeComments}
                                      onClick={() => openCommentThread('item', 'outcomes', outcome.name, outcome.id)}
                                    />
                                  ) : (
                                    <button
                                      className="add-comment-btn"
                                      style={{ padding: '2px 6px', fontSize: '10px' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCommentThread('item', 'outcomes', outcome.name, outcome.id);
                                      }}
                                    >
                                      <CommentIcon />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="column-footer">
                    <button
                      className="add-comment-btn"
                      onClick={() => openCommentThread('section', 'outcomes', 'Outcomes')}
                    >
                      <CommentIcon /> Comment
                    </button>
                    <ApprovalButton
                      section="Outcomes"
                      approval={getApproval('outcomes')}
                      onApprove={() => approveSection('outcomes')}
                      onRevokeApproval={() => revokeApproval('outcomes')}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* SECTION 4: Luna Assessment */}
            <CollapsibleSection
              title="Luna Assessment"
              icon={<LunaIcon />}
              status="completed"
              summary="Quality check complete"
              commentCount={0}
              hasProblems={false}
              isExpanded={expandedSections.lunaAssessment}
              onToggle={() => toggleSection('lunaAssessment')}
              themeColor="#A78BFA"
            >
              <div className="luna-assessment-content">
                <div className="luna-assessment-text">
                  <p style={{ marginBottom: '12px' }}>
                    <strong>Overall Assessment:</strong> This optimization project is well-configured and ready 
                    for execution. The constraints appear feasible given the input ranges, and the objective 
                    priorities align with the stated business goals.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>Potential Considerations:</strong> The heavy weighting toward Overall Liking (42%) 
                    may result in cost outcomes that are suboptimal. Consider whether this tradeoff aligns with 
                    business priorities.
                  </p>
                  <p>
                    <strong>Strengths:</strong> Clear goal-to-objective traceability, reasonable constraint bounds, 
                    and good coverage of both consumer and analytical outcomes.
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={handleSaveAsDraft}>
              Save as Draft
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Submit Project
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
              <LunaIcon />
            </div>
            <div className="chat-header-text">
              <div className="chat-title">Luna AI</div>
              <div className="chat-subtitle">Review Assistant</div>
            </div>
          </div>

          <div className="chat-messages">
            <div className="chat-message">
              <div className="chat-avatar">
                <LunaIcon />
              </div>
              <div className="chat-message-content">
                I've reviewed your project configuration. Everything looks good overall! 
                I left one comment on the Bake Temperature constraint — the upper bound 
                seems higher than typical for this product category. Would you like me 
                to explain my reasoning?
              </div>
            </div>
          </div>

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask about your project..."
              />
              <button className="send-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Comment Thread Modal */}
      {activeCommentThread && (
        <>
          <div 
            className="comment-backdrop" 
            onClick={() => setActiveCommentThread(null)}
          />
          <CommentThread
            comments={getCommentsForTarget(
              activeCommentThread.targetType,
              activeCommentThread.targetSection,
              activeCommentThread.targetItemId
            )}
            onAddComment={addComment}
            onResolve={resolveComment}
            onClose={() => setActiveCommentThread(null)}
            targetLabel={activeCommentThread.targetLabel}
          />
        </>
      )}
    </>
  );
}
