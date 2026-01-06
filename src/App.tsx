import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputsModal from './pages/inputs';
import OutcomesModal from './pages/outcomes';
import CombinationsModal from './pages/combinations';
import ConstraintsModal from './pages/constraints';
import ObjectivesModal from './pages/objectives';
import DataUploadModal from './pages/upload';

const SetupFlow = () => {
  const navigate = useNavigate();

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Theme configuration
  const theme = {
    dark: {
      background: '#0a0a0f',
      text: '#E4E4E7',
      textSecondary: '#A1A1AA',
      textTertiary: '#71717A',
      textMuted: '#52525b',
      border: 'rgba(255,255,255,0.1)',
      cardBg: 'rgba(255,255,255,0.05)',
      inputBg: 'rgba(255,255,255,0.08)',
    },
    light: {
      background: '#ffffff',
      text: '#18181b',
      textSecondary: '#52525b',
      textTertiary: '#71717A',
      textMuted: '#A1A1AA',
      border: 'rgba(0,0,0,0.1)',
      cardBg: 'rgba(0,0,0,0.05)',
      inputBg: 'rgba(0,0,0,0.08)',
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const [categoryName, setCategoryName] = useState('');
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isCategorySet, setIsCategorySet] = useState(false);
  const [flowStage, setFlowStage] = useState('category'); // 'category' | 'data-upload' | 'configure'
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dataUploaded, setDataUploaded] = useState(false);
  const [showInputsModal, setShowInputsModal] = useState(false);
  const [showOutcomesModal, setShowOutcomesModal] = useState(false);
  const [showCombinationsModal, setShowCombinationsModal] = useState(false);
  const [showConstraintsModal, setShowConstraintsModal] = useState(false);
  const [showObjectivesModal, setShowObjectivesModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [nodeStatus, setNodeStatus] = useState({
    inputs: { complete: false, items: 0, required: true },
    outcomes: { complete: false, items: 0, required: true },
    combinations: { complete: false, items: 0, required: false },
    constraints: { complete: false, items: 0, required: false },
    objectives: { complete: false, items: 0, required: false },
  });

  const completedCount = Object.values(nodeStatus).filter(n => n.complete).length;
  const totalNodes = Object.keys(nodeStatus).length;
  const completionPercent = Math.round((completedCount / totalNodes) * 100);

  // Check if all required nodes are complete
  const allRequiredComplete = Object.entries(nodeStatus)
    .filter(([_, status]) => status.required)
    .every(([_, status]) => status.complete);

  // Complete setup is enabled when in configure stage and all required nodes are complete
  const canCompleteSetup = flowStage === 'configure' && allRequiredComplete;

  const handleCategorySubmit = () => {
    if (categoryName.trim()) {
      setIsCategorySet(true);
      setIsEditingCategory(false);
      setFlowStage('data-upload');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCategorySubmit();
    if (e.key === 'Escape') {
      setIsEditingCategory(false);
      if (!isCategorySet) setCategoryName('');
    }
  };

  const handleDataUpload = () => {
    setShowUploadModal(true);
  };

  const handleSkipUpload = () => {
    setFlowStage('configure');
  };

  const handleCompleteSetup = () => {
    if (canCompleteSetup) {
      console.log('Setup completed!');
      navigate('/dashboard');
    }
  };

  // Node positions - evenly distributed pentagon
  const nodes = [
    { 
      id: 'inputs', 
      label: 'Inputs', 
      x: 0, y: -160,
      color: '#2DD4BF',
      description: 'Click to configure',
      required: true
    },
    { 
      id: 'outcomes', 
      label: 'Outcomes', 
      x: 152, y: -49,
      color: '#F472B6',
      description: 'Click to configure',
      required: true
    },
    { 
      id: 'combinations', 
      label: 'Combinations', 
      x: 94, y: 129,
      color: '#A78BFA',
      description: 'Click to configure',
      required: false
    },
    { 
      id: 'constraints', 
      label: 'Constraints', 
      x: -94, y: 129,
      color: '#FB923C',
      description: 'Click to configure',
      required: false
    },
    { 
      id: 'objectives', 
      label: 'Objectives', 
      x: -152, y: -49,
      color: '#60A5FA',
      description: 'Click to configure',
      required: false
    },
  ];

  const NodeIcon = ({ id, color }) => {
    const iconStyle = { width: 28, height: 28, color };
    
    switch(id) {
      case 'inputs':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        );
      case 'outcomes':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        );
      case 'combinations':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        );
      case 'constraints':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case 'objectives':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      default:
        return null;
    }
  };

  const isNodeDisabled = flowStage !== 'configure';

  return (
    <div style={{
      minHeight: '100vh',
      background: currentTheme.background,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: currentTheme.text,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Theme Toggle - Fixed bottom left */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: currentTheme.cardBg,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          transition: 'all 0.2s ease'
        }}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={currentTheme.text} strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={currentTheme.text} strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        
        @keyframes nodeAppear {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes checkPop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }
          50% { box-shadow: 0 0 30px currentColor, 0 0 60px currentColor; }
        }
        
        @keyframes completeButtonGlow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.6), 
                        0 0 40px rgba(34, 197, 94, 0.4), 
                        0 0 60px rgba(34, 197, 94, 0.2),
                        0 4px 20px rgba(0, 0, 0, 0.3);
          }
          50% { 
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.8), 
                        0 0 60px rgba(34, 197, 94, 0.5), 
                        0 0 80px rgba(34, 197, 94, 0.3),
                        0 4px 30px rgba(0, 0, 0, 0.4);
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .complete-button-active {
          animation: completeButtonGlow 2s ease-in-out infinite;
        }
        
        .complete-button-active:hover {
          transform: translateY(-2px) scale(1.02);
        }
        
        .complete-button-active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2.5s infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Subtle background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(45, 212, 191, 0.03) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Top bar with upload and completeness */}
      <header style={{
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        zIndex: 100,
      }}>
        <button
          onClick={handleDataUpload}
          disabled={flowStage === 'category'}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            background: flowStage === 'category' 
              ? 'rgba(255,255,255,0.05)'
              : flowStage === 'data-upload'
                ? 'linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%)'
                : 'linear-gradient(135deg, #2DD4BF 0%, #22D3EE 100%)',
            color: flowStage === 'category' 
              ? '#52525b'
              : '#0a0a0f',
            border: flowStage === 'category' 
              ? '1px solid rgba(255,255,255,0.1)'
              : 'none',
            borderRadius: '8px',
            cursor: flowStage === 'category' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: flowStage === 'category'
              ? 'none'
              : flowStage === 'data-upload'
                ? '0 0 30px rgba(45, 212, 191, 0.5), 0 0 60px rgba(45, 212, 191, 0.3), 0 4px 20px rgba(45, 212, 191, 0.4)'
                : '0 4px 20px rgba(45, 212, 191, 0.3)',
            transform: flowStage === 'data-upload' ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Data
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}>
          {/* Completeness indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{ fontSize: '13px', color: '#71717A' }}>Completeness</span>
            <div style={{
              width: '160px',
              height: '6px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${completionPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2DD4BF, #A78BFA)',
                borderRadius: '3px',
                transition: 'width 0.4s ease-out',
              }} />
            </div>
            <span style={{ 
              fontSize: '13px', 
              color: '#E4E4E7', 
              fontWeight: 600,
              minWidth: '36px',
            }}>
              {completionPercent}%
            </span>
          </div>

          {/* Complete Setup Button */}
          <button
            onClick={handleCompleteSetup}
            disabled={!canCompleteSetup}
            className={canCompleteSetup ? 'complete-button-active' : ''}
            style={{
              position: 'relative',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: canCompleteSetup 
                ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #15803D 100%)'
                : 'rgba(255,255,255,0.05)',
              color: canCompleteSetup 
                ? '#ffffff'
                : '#52525b',
              border: canCompleteSetup 
                ? 'none'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              cursor: canCompleteSetup ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              opacity: canCompleteSetup ? 1 : 0.6,
            }}
          >
            {canCompleteSetup ? (
              <>
                {/* Checkmark circle icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 10 11 15 8 12" />
                </svg>
                <span>Complete Setup</span>
                {/* Right arrow */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            ) : (
              <>
                {/* Lock icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Complete Setup</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative',
      }}>
        
        {/* Graph container */}
        <div style={{
          position: 'relative',
          width: '500px',
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          
          {/* SVG for connection lines - lines connect to edge of center node */}
          <svg
            width="500"
            height="500"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
          >
            {flowStage === 'configure' && nodes.map((node) => {
              const centerX = 250;
              const centerY = 250;
              const nodeX = centerX + node.x;
              const nodeY = centerY + node.y;
              
              // Calculate direction vector
              const dx = node.x;
              const dy = node.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const dirX = dx / dist;
              const dirY = dy / dist;
              
              // Start line at edge of center circle (radius 70)
              const startX = centerX + dirX * 70;
              const startY = centerY + dirY * 70;
              
              // End line at edge of rectangular node (50x50 from center)
              // Find intersection with box edges
              const boxHalfSize = 50;
              let endX, endY;
              
              // Calculate where line from center hits the box
              // We need to find t such that the point is on the box edge
              const tX = Math.abs(dirX) > 0.001 ? boxHalfSize / Math.abs(dirX) : Infinity;
              const tY = Math.abs(dirY) > 0.001 ? boxHalfSize / Math.abs(dirY) : Infinity;
              const t = Math.min(tX, tY);
              
              endX = nodeX - dirX * t;
              endY = nodeY - dirY * t;
              
              return (
                <line
                  key={node.id}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>

          {/* Central node */}
          <div
            onClick={() => flowStage === 'category' && !isCategorySet && setIsEditingCategory(true)}
            style={{
              position: 'absolute',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: isCategorySet 
                ? 'linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)'
                : 'rgba(255,255,255,0.02)',
              border: isCategorySet 
                ? '2px solid rgba(45, 212, 191, 0.6)'
                : '2px dashed rgba(255,255,255,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: flowStage === 'category' && !isCategorySet ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              zIndex: 20,
            }}
          >
            {isEditingCategory ? (
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => categoryName.trim() && handleCategorySubmit()}
                autoFocus
                placeholder="Category name"
                style={{
                  width: '100px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#E4E4E7',
                  fontSize: '16px',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontFamily: 'inherit',
                }}
              />
            ) : isCategorySet ? (
              <>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  maxWidth: '110px',
                }}>
                  {categoryName}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: 'rgba(45, 212, 191, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginTop: '8px',
                  fontWeight: 500,
                }}>
                  Category
                </span>
              </>
            ) : (
              <>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '2px solid rgba(45, 212, 191, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  color: '#2DD4BF',
                  fontSize: '20px',
                  fontWeight: 300,
                }}>
                  +
                </div>
                <span style={{
                  fontSize: '13px',
                  color: '#71717A',
                  textAlign: 'center',
                }}>
                  Add Category
                </span>
              </>
            )}
          </div>

          {/* Outer nodes */}
          {nodes.map((node) => {
            const status = nodeStatus[node.id];
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            const disabled = isNodeDisabled;
            
            return (
              <div
                key={node.id}
                onMouseEnter={() => !disabled && setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  if (!disabled) {
                    if (node.id === 'inputs') {
                      setShowInputsModal(true);
                    } else if (node.id === 'outcomes') {
                      setShowOutcomesModal(true);
                    } else if (node.id === 'combinations') {
                      setShowCombinationsModal(true);
                    } else if (node.id === 'constraints') {
                      setShowConstraintsModal(true);
                    } else if (node.id === 'objectives') {
                      setShowObjectivesModal(true);
                    } else {
                      setSelectedNode(isSelected ? null : node.id);
                    }
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${node.x}px)`,
                  top: `calc(50% + ${node.y}px)`,
                  transform: `translate(-50%, -50%) ${isHovered && !disabled ? 'scale(1.05)' : 'scale(1)'}`,
                  transition: 'all 0.2s ease',
                  opacity: disabled ? 0.25 : 1,
                  cursor: disabled ? 'default' : 'pointer',
                  zIndex: isHovered ? 30 : 10,
                  animation: flowStage === 'configure' ? 'nodeAppear 0.4s ease-out' : 'none',
                }}
              >
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${status.complete ? node.color : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: isHovered && !disabled
                    ? `0 0 30px ${node.color}20`
                    : 'none',
                }}>
                  
                  {/* Status indicator - top right */}
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: status.complete 
                      ? '#22C55E' 
                      : node.required 
                        ? '#EF4444' 
                        : '#3f3f46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: status.complete 
                      ? '0 0 12px #22C55E, 0 0 24px rgba(34, 197, 94, 0.6)' 
                      : node.required 
                        ? '0 0 12px rgba(239, 68, 68, 0.6), 0 0 24px rgba(239, 68, 68, 0.3)'
                        : 'none',
                    border: '2px solid #0a0a0f',
                  }}>
                    {status.complete && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  
                  <NodeIcon id={node.id} color={node.color} />
                  
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#E4E4E7',
                    marginTop: '8px',
                  }}>
                    {node.label}
                  </span>
                  
                  {node.required && (
                    <span style={{
                      fontSize: '9px',
                      color: '#71717A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginTop: '2px',
                    }}>
                      Required
                    </span>
                  )}
                </div>
                
                {/* Tooltip */}
                {isHovered && !disabled && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(20, 20, 28, 0.98)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    zIndex: 100,
                    animation: 'slideUp 0.2s ease-out',
                  }}>
                    <p style={{
                      fontSize: '12px',
                      color: '#A1A1AA',
                      margin: 0,
                      width: '160px',
                      textAlign: 'center',
                      lineHeight: 1.4,
                    }}>
                      {node.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Instructions & CTAs */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          animation: 'slideUp 0.4s ease-out',
        }}>
          {flowStage === 'category' && (
            <>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 600,
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em',
              }}>
                Create a Product Category
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#71717A',
                margin: 0,
              }}>
                Click the center to name your category
              </p>
            </>
          )}
          
          {flowStage === 'data-upload' && (
            <>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 600,
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em',
              }}>
                Upload Your Data
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#71717A',
                margin: '0 0 32px 0',
                maxWidth: '400px',
              }}>
                Use the upload button above to import data, or skip to configure manually
              </p>
              
              <button
                onClick={handleSkipUpload}
                style={{
                  padding: '14px 28px',
                  fontSize: '14px',
                  fontWeight: 500,
                  background: 'transparent',
                  color: '#71717A',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.borderColor = 'rgba(255,255,255,0.3)';
                  target.style.color = '#A1A1AA';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.borderColor = 'rgba(255,255,255,0.15)';
                  target.style.color = '#71717A';
                }}
              >
                Skip for now
              </button>
            </>
          )}
          
          {flowStage === 'configure' && (
            <>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 600,
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em',
              }}>
                Configure Your Category
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#71717A',
                margin: 0,
              }}>
                Select a node to add data. <span style={{ color: '#EF4444' }}>Red</span> indicators show required configurations.
              </p>
            </>
          )}
        </div>

        {/* Legend - only show in configure stage */}
        {flowStage === 'configure' && (
          <div style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '32px',
            animation: 'slideUp 0.4s ease-out 0.2s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#2DD4BF',
                boxShadow: '0 0 8px #2DD4BF, 0 0 16px rgba(45, 212, 191, 0.5)',
              }} />
              <span style={{ fontSize: '12px', color: '#71717A' }}>Complete</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#EF4444',
                boxShadow: '0 0 8px #EF4444, 0 0 16px rgba(239, 68, 68, 0.5)',
              }} />
              <span style={{ fontSize: '12px', color: '#71717A' }}>Required</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#3f3f46',
              }} />
              <span style={{ fontSize: '12px', color: '#71717A' }}>Optional</span>
            </div>
          </div>
        )}
      </main>

      {/* Inputs Modal */}
      {showInputsModal && (
        <InputsModal 
          onClose={() => setShowInputsModal(false)}
          onSave={(inputs) => {
            // Update node status when inputs are saved
            setNodeStatus(prev => ({
              ...prev,
              inputs: {
                complete: inputs.length > 0,
                items: inputs.length,
                required: true
              }
            }));
            // Close the modal
            setShowInputsModal(false);
          }}
        />
      )}

      {/* Outcomes Modal */}
      {showOutcomesModal && (
        <OutcomesModal 
          onClose={() => setShowOutcomesModal(false)}
          onSave={(outcomes) => {
            // Update node status when outcomes are saved
            setNodeStatus(prev => ({
              ...prev,
              outcomes: {
                complete: outcomes.length > 0,
                items: outcomes.length,
                required: true
              }
            }));
            // Close the modal
            setShowOutcomesModal(false);
          }}
        />
      )}

      {/* Combinations Modal */}
      {showCombinationsModal && (
        <CombinationsModal 
          onClose={() => setShowCombinationsModal(false)}
          onSave={(combinations) => {
            // Update node status when combinations are saved
            setNodeStatus(prev => ({
              ...prev,
              combinations: {
                complete: combinations.length > 0,
                items: combinations.length,
                required: false
              }
            }));
            // Close the modal
            setShowCombinationsModal(false);
          }}
        />
      )}

      {/* Constraints Modal */}
      {showConstraintsModal && (
        <ConstraintsModal 
          onClose={() => setShowConstraintsModal(false)}
          onSave={(constraints) => {
            // Update node status when constraints are saved
            setNodeStatus(prev => ({
              ...prev,
              constraints: {
                complete: constraints.length > 0,
                items: constraints.length,
                required: false
              }
            }));
            // Close the modal
            setShowConstraintsModal(false);
          }}
        />
      )}

      {/* Objectives Modal */}
      {showObjectivesModal && (
        <ObjectivesModal 
          onClose={() => setShowObjectivesModal(false)}
          onSave={(objectives) => {
            // Update node status when objectives are saved
            setNodeStatus(prev => ({
              ...prev,
              objectives: {
                complete: objectives.length > 0,
                items: objectives.length,
                required: false
              }
            }));
            // Close the modal
            setShowObjectivesModal(false);
          }}
        />
      )}

      {/* Data Upload Modal */}
      {showUploadModal && (
        <DataUploadModal 
          onClose={() => setShowUploadModal(false)}
          onSave={(uploadData) => {
            // Process uploaded data
            setDataUploaded(true);
            
            // Update node statuses based on uploaded classifications
            const inputs = uploadData.classifications.filter(c => c.classification === 'input');
            const outcomes = uploadData.classifications.filter(c => c.classification === 'outcome');
            
            setNodeStatus(prev => ({
              ...prev,
              inputs: {
                complete: inputs.length > 0,
                items: inputs.length,
                required: true
              },
              outcomes: {
                complete: outcomes.length > 0,
                items: outcomes.length,
                required: true
              }
            }));
            
            // Close the modal and transition to configure stage
            setShowUploadModal(false);
            setTimeout(() => setFlowStage('configure'), 300);
          }}
        />
      )}
    </div>
  );
};

export default SetupFlow;
