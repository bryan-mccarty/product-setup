import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';

const DataUploadModal = ({ onClose, onSave }) => {
  const { setInputs, setOutcomes } = useData();
  const [stage, setStage] = useState('upload'); // 'upload' | 'preview' | 'classify'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [classificationProgress, setClassificationProgress] = useState(0);
  const [classifications, setClassifications] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const fileInputRef = useRef(null);

  // Theme color for Upload - Cyan/Teal gradient
  const themeColor = '#22D3EE';
  const themeColorRgb = '34, 211, 238';
  const secondaryColor = '#2DD4BF';
  const secondaryColorRgb = '45, 212, 191';

  // Sample CSV data for demo
  const sampleCSVData = `Formulation_ID,Flour,Sugar,Butter,Eggs,Vanilla_Extract,Cocoa_Powder,Milk,Salt,Baking_Temp,Mix_Duration,Bake_Time,Moisture_Content,pH_Level,Overall_Liking,Texture_Score,Sweetness_Intensity,Purchase_Intent
F001,250,120,100,2,5,30,80,2,175,8,25,6.2,5.8,7.5,8.1,72,4
F002,275,100,120,3,4,25,90,3,180,10,28,5.8,5.6,8.2,7.8,68,5
F003,225,140,90,2,6,35,70,2,170,7,22,6.8,5.9,6.9,7.5,78,3
F004,260,110,110,3,5,28,85,2,178,9,26,6.0,5.7,7.8,8.0,70,4
F005,240,130,95,2,4,32,75,3,172,8,24,6.5,5.8,7.2,7.6,75,4
F006,280,95,125,3,5,22,95,2,182,11,30,5.5,5.5,8.5,8.3,65,5
F007,230,135,88,2,6,38,72,2,168,7,21,7.0,6.0,6.5,7.2,80,3
F008,265,105,115,3,4,26,88,3,179,10,27,5.9,5.6,8.0,7.9,69,5
F009,245,125,98,2,5,30,78,2,174,8,25,6.3,5.8,7.4,7.7,73,4
F010,255,115,108,3,5,29,82,2,176,9,26,6.1,5.7,7.7,7.9,71,4
F011,235,138,92,2,6,34,73,2,169,7,23,6.7,5.9,7.0,7.4,77,3
F012,270,98,122,3,4,24,92,3,181,10,29,5.6,5.5,8.3,8.2,66,5`;

  // AI classification logic (simulated)
  const classifyColumns = (cols) => {
    const inputKeywords = ['flour', 'sugar', 'butter', 'eggs', 'vanilla', 'cocoa', 'milk', 'salt', 'temp', 'duration', 'time', 'speed', 'mix'];
    const outcomeKeywords = ['moisture', 'ph', 'liking', 'texture', 'sweetness', 'purchase', 'intent', 'score', 'quality', 'rating', 'firmness', 'color'];
    
    return cols.filter(col => col.toLowerCase() !== 'formulation_id' && col.toLowerCase() !== 'id').map((col, index) => {
      const lowerCol = col.toLowerCase().replace(/_/g, ' ');
      
      // Simple heuristic classification
      const isInput = inputKeywords.some(kw => lowerCol.includes(kw));
      const isOutcome = outcomeKeywords.some(kw => lowerCol.includes(kw));
      
      let classification = 'unknown';
      let confidence = 0;
      let subType = '';
      let variableType = 'Continuous';
      
      if (isInput && !isOutcome) {
        classification = 'input';
        confidence = 0.92;
        // Determine sub-type
        if (['flour', 'sugar', 'butter', 'eggs', 'vanilla', 'cocoa', 'milk', 'salt'].some(kw => lowerCol.includes(kw))) {
          subType = 'Ingredient';
        } else {
          subType = 'Processing Condition';
        }
      } else if (isOutcome && !isInput) {
        classification = 'outcome';
        confidence = 0.88;
        // Determine sub-type
        if (['moisture', 'ph', 'viscosity', 'firmness', 'color', 'particle'].some(kw => lowerCol.includes(kw))) {
          subType = 'Analytical';
        } else if (['liking', 'texture', 'sweetness', 'aroma', 'flavor', 'mouthfeel'].some(kw => lowerCol.includes(kw))) {
          subType = 'Sensory';
        } else if (['purchase', 'intent', 'value', 'brand', 'repeat'].some(kw => lowerCol.includes(kw))) {
          subType = 'Consumer';
        } else {
          subType = 'Other';
        }
      } else if (isInput && isOutcome) {
        // Ambiguous - default to input
        classification = 'input';
        confidence = 0.65;
        subType = 'Processing Condition';
      } else {
        // Unknown - guess based on position (first half inputs, second half outcomes)
        classification = index < cols.length / 2 ? 'input' : 'outcome';
        confidence = 0.45;
        subType = classification === 'input' ? 'Other' : 'Other';
      }
      
      // Detect variable type from data patterns (simplified)
      if (['intent', 'speed', 'method', 'type'].some(kw => lowerCol.includes(kw))) {
        variableType = 'Ordinal';
      }
      
      return {
        id: `col-${index}`,
        name: col.replace(/_/g, ' '),
        originalName: col,
        classification,
        subType,
        variableType,
        confidence,
        confirmed: false,
      };
    });
  };

  // Parse CSV string
  const parseCSV = (csvString) => {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i];
      });
      return row;
    });
    return { headers, data };
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setUploadedFile(file);
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        const { headers, data } = parseCSV(e.target.result);
        setColumns(headers);
        setParsedData(data);
        setIsProcessing(false);
        setStage('preview');
      }, 800);
    };
    reader.readAsText(file);
  };

  // Load sample data for demo
  const loadSampleData = () => {
    setIsProcessing(true);
    setUploadedFile({ name: 'sample_formulations.csv', size: 1847 });
    
    setTimeout(() => {
      const { headers, data } = parseCSV(sampleCSVData);
      setColumns(headers);
      setParsedData(data);
      setIsProcessing(false);
      setStage('preview');
    }, 1000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Proceed to classification stage
  const proceedToClassification = () => {
    setStage('classify');
    setClassificationProgress(0);
    
    // Simulate AI processing with progress
    const cols = columns;
    const interval = setInterval(() => {
      setClassificationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const classified = classifyColumns(cols);
          setClassifications(classified);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);
  };

  // Toggle classification for an item
  const toggleClassification = (id) => {
    setClassifications(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        classification: item.classification === 'input' ? 'outcome' : 'input',
        subType: item.classification === 'input' ? 'Other' : 'Ingredient',
        confidence: 0.5, // User override
      };
    }));
  };

  // Confirm an item
  const confirmItem = (id) => {
    setClassifications(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, confirmed: true };
    }));
  };

  // Confirm all items
  const confirmAll = () => {
    setClassifications(prev => prev.map(item => ({ ...item, confirmed: true })));
  };

  // Update sub-type
  const updateSubType = (id, newSubType) => {
    setClassifications(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, subType: newSubType };
    }));
  };

  // Count stats
  const inputCount = classifications.filter(c => c.classification === 'input').length;
  const outcomeCount = classifications.filter(c => c.classification === 'outcome').length;
  const confirmedCount = classifications.filter(c => c.confirmed).length;
  const allConfirmed = classifications.length > 0 && confirmedCount === classifications.length;

  // Tag components
  const ClassificationTag = ({ type, small, draft }) => {
    const colors = {
      'input': { bg: 'rgba(45, 212, 191, 0.15)', text: '#2DD4BF', border: 'rgba(45, 212, 191, 0.3)' },
      'outcome': { bg: 'rgba(244, 114, 182, 0.15)', text: '#F472B6', border: 'rgba(244, 114, 182, 0.3)' },
      'unknown': { bg: 'rgba(113, 113, 122, 0.15)', text: '#A1A1AA', border: 'rgba(113, 113, 122, 0.3)' },
    };
    const c = colors[type] || colors['unknown'];
    return (
      <span style={{
        padding: small ? '3px 8px' : '4px 12px',
        borderRadius: '6px',
        fontSize: small ? '10px' : '11px',
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
      }}>
        {draft && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        )}
        {type === 'input' ? 'Input' : type === 'outcome' ? 'Outcome' : 'Unknown'}
      </span>
    );
  };

  const SubTypeTag = ({ type, classification, small }) => {
    const inputColors = {
      'Ingredient': { bg: 'rgba(45, 212, 191, 0.12)', text: '#2DD4BF', border: 'rgba(45, 212, 191, 0.25)' },
      'Processing Condition': { bg: 'rgba(251, 146, 60, 0.12)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.25)' },
      'Other': { bg: 'rgba(167, 139, 250, 0.12)', text: '#A78BFA', border: 'rgba(167, 139, 250, 0.25)' },
    };
    const outcomeColors = {
      'Analytical': { bg: 'rgba(96, 165, 250, 0.12)', text: '#60A5FA', border: 'rgba(96, 165, 250, 0.25)' },
      'Sensory': { bg: 'rgba(251, 146, 60, 0.12)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.25)' },
      'Consumer': { bg: 'rgba(244, 114, 182, 0.12)', text: '#F472B6', border: 'rgba(244, 114, 182, 0.25)' },
      'Other': { bg: 'rgba(113, 113, 122, 0.12)', text: '#A1A1AA', border: 'rgba(113, 113, 122, 0.25)' },
    };
    const colors = classification === 'input' ? inputColors : outcomeColors;
    const c = colors[type] || colors['Other'];
    const displayType = type === 'Processing Condition' ? 'Process' : type;
    return (
      <span style={{
        padding: small ? '2px 6px' : '3px 8px',
        borderRadius: '4px',
        fontSize: small ? '9px' : '10px',
        fontWeight: 500,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
      }}>
        {displayType}
      </span>
    );
  };

  const ConfidenceIndicator = ({ confidence }) => {
    const percent = Math.round(confidence * 100);
    const color = confidence >= 0.8 ? '#22C55E' : confidence >= 0.6 ? '#F59E0B' : '#EF4444';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '40px',
          height: '4px',
          borderRadius: '2px',
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${percent}%`,
            height: '100%',
            background: color,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <span style={{ fontSize: '10px', color: '#71717A', fontFamily: "'JetBrains Mono', monospace" }}>
          {percent}%
        </span>
      </div>
    );
  };

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
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        zIndex: 1000,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes checkPop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes progressPulse {
          0%, 100% { box-shadow: 0 0 8px currentColor; }
          50% { box-shadow: 0 0 16px currentColor, 0 0 24px currentColor; }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.12);
        }
        
        .upload-field {
          padding: 8px 12px;
          font-size: 13px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #E4E4E7;
          outline: none;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .upload-field:focus {
          border-color: rgba(34, 211, 238, 0.5);
          background: rgba(34, 211, 238, 0.05);
          box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1);
        }
        
        .table-cell {
          padding: 8px 12px;
          font-size: 12px;
          color: #A1A1AA;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }
        
        .table-header {
          padding: 10px 12px;
          font-size: 11px;
          font-weight: 600;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .classification-row {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          margin-bottom: 8px;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .classification-row:hover {
          background: rgba(255,255,255,0.025);
          border-color: rgba(255,255,255,0.1);
        }
        .classification-row.confirmed {
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.03);
        }
        
        select.subtype-select {
          appearance: none;
          padding: 4px 24px 4px 8px;
          font-size: 10px;
          font-weight: 500;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          color: #A1A1AA;
          outline: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 6px center;
          transition: all 0.15s ease;
        }
        select.subtype-select:hover {
          border-color: rgba(255,255,255,0.2);
        }
        select.subtype-select:focus {
          border-color: rgba(34, 211, 238, 0.5);
        }
      `}</style>

      {/* Main Modal */}
      <div style={{
        width: stage === 'upload' ? '580px' : stage === 'preview' ? '1000px' : '900px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        background: 'linear-gradient(180deg, #111116 0%, #0c0c10 100%)',
        borderRadius: '16px',
        border: `1px solid rgba(${themeColorRgb}, 0.2)`,
        boxShadow: `0 0 80px rgba(${themeColorRgb}, 0.08), 0 25px 80px rgba(0,0,0,0.6)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalEnter 0.25s ease-out',
        transition: 'width 0.3s ease',
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
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, rgba(${themeColorRgb}, 0.15) 0%, rgba(${secondaryColorRgb}, 0.1) 100%)`,
              border: `1px solid rgba(${themeColorRgb}, 0.25)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
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
                {stage === 'upload' && 'Upload Formulation Data'}
                {stage === 'preview' && 'Review Uploaded Data'}
                {stage === 'classify' && 'Classify Variables'}
              </h2>
              <p style={{
                margin: '3px 0 0 0',
                fontSize: '12px',
                color: '#71717A',
              }}>
                {stage === 'upload' && 'Import your CSV file with formulation data'}
                {stage === 'preview' && parsedData && `${parsedData.length} formulations • ${columns.length} columns detected`}
                {stage === 'classify' && `${confirmedCount}/${classifications.length} variables confirmed`}
              </p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {['upload', 'preview', 'classify'].map((step, idx) => (
              <React.Fragment key={step}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: stage === step 
                    ? `linear-gradient(135deg, ${themeColor}, ${secondaryColor})`
                    : idx < ['upload', 'preview', 'classify'].indexOf(stage)
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(255,255,255,0.05)',
                  border: stage === step 
                    ? 'none'
                    : idx < ['upload', 'preview', 'classify'].indexOf(stage)
                      ? '1px solid rgba(34, 197, 94, 0.4)'
                      : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: stage === step 
                    ? '#0a0a0f' 
                    : idx < ['upload', 'preview', 'classify'].indexOf(stage)
                      ? '#22C55E'
                      : '#52525b',
                  transition: 'all 0.3s ease',
                }}>
                  {idx < ['upload', 'preview', 'classify'].indexOf(stage) ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 2 && (
                  <div style={{
                    width: '32px',
                    height: '2px',
                    background: idx < ['upload', 'preview', 'classify'].indexOf(stage)
                      ? 'rgba(34, 197, 94, 0.4)'
                      : 'rgba(255,255,255,0.08)',
                    borderRadius: '1px',
                    transition: 'background 0.3s ease',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: stage === 'upload' ? '400px' : '500px',
        }}>
          
          {/* STAGE 1: Upload */}
          {stage === 'upload' && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              animation: 'fadeIn 0.3s ease-out',
            }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  padding: '48px 32px',
                  borderRadius: '16px',
                  border: `2px dashed ${isDragging ? themeColor : 'rgba(255,255,255,0.15)'}`,
                  background: isDragging 
                    ? `rgba(${themeColorRgb}, 0.05)` 
                    : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                }}
              >
                {isProcessing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: `rgba(${themeColorRgb}, 0.1)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#E4E4E7' }}>
                        Processing file...
                      </p>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#71717A' }}>
                        Parsing CSV data
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: isDragging 
                        ? `rgba(${themeColorRgb}, 0.15)` 
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isDragging ? `rgba(${themeColorRgb}, 0.3)` : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px auto',
                      transition: 'all 0.2s ease',
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isDragging ? themeColor : '#71717A'} strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    
                    <p style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 500, color: '#E4E4E7' }}>
                      {isDragging ? 'Drop your file here' : 'Drag & drop your CSV file'}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#71717A' }}>
                      or <span style={{ color: themeColor, fontWeight: 500 }}>click to browse</span>
                    </p>
                    
                    <div style={{
                      marginTop: '20px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#52525b' }}>
                        Expected format: CSV with columns for inputs (ingredients, processing conditions) and outcomes (measurements, sensory scores)
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Sample Data Button */}
              {!isProcessing && (
                <button
                  onClick={loadSampleData}
                  style={{
                    marginTop: '24px',
                    padding: '12px 20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    background: 'transparent',
                    color: '#71717A',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                    e.currentTarget.style.color = '#A1A1AA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = '#71717A';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  Load Sample Data
                </button>
              )}
            </div>
          )}

          {/* STAGE 2: Preview */}
          {stage === 'preview' && parsedData && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s ease-out',
            }}>
              {/* Summary Banner */}
              <div style={{
                padding: '16px 24px',
                background: `linear-gradient(90deg, rgba(${themeColorRgb}, 0.06) 0%, rgba(${secondaryColorRgb}, 0.03) 100%)`,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#22C55E' }}>
                      File loaded successfully
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Formulations</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 600, color: '#E4E4E7' }}>{parsedData.length}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Columns</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 600, color: '#E4E4E7' }}>{columns.length}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>File</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 500, color: '#A1A1AA', fontFamily: "'JetBrains Mono', monospace" }}>
                        {uploadedFile?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="custom-scrollbar" style={{
                flex: 1,
                overflow: 'auto',
                padding: '0',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {columns.map((col, idx) => (
                        <th key={idx} className="table-header" style={{ textAlign: idx === 0 ? 'left' : 'right' }}>
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, rowIdx) => (
                      <tr key={rowIdx} style={{ 
                        background: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      }}>
                        {columns.map((col, colIdx) => (
                          <td key={colIdx} className="table-cell" style={{ 
                            textAlign: colIdx === 0 ? 'left' : 'right',
                            fontFamily: colIdx === 0 ? 'inherit' : "'JetBrains Mono', monospace",
                            fontWeight: colIdx === 0 ? 500 : 400,
                            color: colIdx === 0 ? '#E4E4E7' : '#A1A1AA',
                          }}>
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {parsedData.length > 10 && (
                  <div style={{
                    padding: '12px 24px',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <span style={{ fontSize: '12px', color: '#52525b' }}>
                      Showing 10 of {parsedData.length} formulations
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STAGE 3: Classify */}
          {stage === 'classify' && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s ease-out',
              overflow: 'hidden',
            }}>
              {classificationProgress < 100 ? (
                /* AI Processing Animation */
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px',
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, rgba(${themeColorRgb}, 0.15) 0%, rgba(167, 139, 250, 0.1) 100%)`,
                    border: '1px solid rgba(167, 139, 250, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '28px',
                    animation: 'progressPulse 2s ease-in-out infinite',
                    color: '#A78BFA',
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: '#E4E4E7' }}>
                    AI Classifying Variables
                  </h3>
                  <p style={{ margin: '0 0 32px 0', fontSize: '13px', color: '#71717A', textAlign: 'center' }}>
                    Analyzing column names and data patterns to identify inputs and outcomes
                  </p>
                  
                  <div style={{ width: '280px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}>
                      <span style={{ fontSize: '11px', color: '#71717A' }}>Analyzing...</span>
                      <span style={{ fontSize: '11px', color: '#A78BFA', fontFamily: "'JetBrains Mono', monospace" }}>
                        {Math.min(100, Math.round(classificationProgress))}%
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      borderRadius: '3px',
                      background: 'rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${Math.min(100, classificationProgress)}%`,
                        height: '100%',
                        borderRadius: '3px',
                        background: 'linear-gradient(90deg, #A78BFA, #22D3EE)',
                        transition: 'width 0.15s ease-out',
                      }} />
                    </div>
                  </div>
                </div>
              ) : (
                /* Classification Results */
                <>
                  {/* Stats Header */}
                  <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                  }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: 'rgba(45, 212, 191, 0.08)',
                        border: '1px solid rgba(45, 212, 191, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#2DD4BF' }}>{inputCount}</span>
                        <span style={{ fontSize: '12px', color: '#71717A' }}>Inputs</span>
                      </div>
                      
                      <div style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: 'rgba(244, 114, 182, 0.08)',
                        border: '1px solid rgba(244, 114, 182, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" fill="#F472B6" />
                        </svg>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#F472B6' }}>{outcomeCount}</span>
                        <span style={{ fontSize: '12px', color: '#71717A' }}>Outcomes</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(167, 139, 250, 0.08)',
                        border: '1px dashed rgba(167, 139, 250, 0.25)',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                          <path d="M2 12l10 5 10-5" />
                        </svg>
                        <span style={{ fontSize: '11px', color: '#A78BFA' }}>AI Draft</span>
                      </div>
                      
                      <button
                        onClick={confirmAll}
                        disabled={allConfirmed}
                        style={{
                          padding: '8px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: allConfirmed ? 'rgba(255,255,255,0.03)' : 'rgba(34, 197, 94, 0.1)',
                          color: allConfirmed ? '#52525b' : '#22C55E',
                          border: allConfirmed ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '6px',
                          cursor: allConfirmed ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Confirm All
                      </button>
                    </div>
                  </div>

                  {/* Classification List */}
                  <div className="custom-scrollbar" style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '16px',
                  }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {/* Inputs Column */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          padding: '10px 14px',
                          marginBottom: '12px',
                          borderRadius: '8px',
                          background: 'rgba(45, 212, 191, 0.05)',
                          border: '1px solid rgba(45, 212, 191, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                          </svg>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#2DD4BF' }}>Inputs</span>
                          <span style={{ fontSize: '11px', color: '#71717A', marginLeft: 'auto' }}>
                            {classifications.filter(c => c.classification === 'input' && c.confirmed).length}/{inputCount} confirmed
                          </span>
                        </div>
                        
                        {classifications.filter(c => c.classification === 'input').map((item) => (
                          <div
                            key={item.id}
                            className={`classification-row ${item.confirmed ? 'confirmed' : ''}`}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#E4E4E7' }}>
                                  {item.name}
                                </span>
                                {!item.confirmed && (
                                  <ConfidenceIndicator confidence={item.confidence} />
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <select
                                  className="subtype-select"
                                  value={item.subType}
                                  onChange={(e) => { e.stopPropagation(); updateSubType(item.id, e.target.value); }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="Ingredient">Ingredient</option>
                                  <option value="Processing Condition">Processing</option>
                                  <option value="Other">Other</option>
                                </select>
                                {!item.confirmed && (
                                  <span style={{ fontSize: '9px', color: '#A78BFA', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    </svg>
                                    AI
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {/* Swap Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleClassification(item.id); }}
                                style={{
                                  padding: '6px',
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  color: '#71717A',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: hoveredItem === item.id ? 1 : 0,
                                  transition: 'all 0.15s ease',
                                }}
                                title="Move to Outcomes"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                              </button>
                              
                              {/* Confirm Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); confirmItem(item.id); }}
                                disabled={item.confirmed}
                                style={{
                                  padding: '6px 10px',
                                  background: item.confirmed 
                                    ? 'rgba(34, 197, 94, 0.15)' 
                                    : 'rgba(255,255,255,0.04)',
                                  border: item.confirmed 
                                    ? '1px solid rgba(34, 197, 94, 0.3)' 
                                    : '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '5px',
                                  cursor: item.confirmed ? 'default' : 'pointer',
                                  color: item.confirmed ? '#22C55E' : '#71717A',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {item.confirmed ? (
                                  <>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: item.confirmed ? 'checkPop 0.3s ease-out' : 'none' }}>
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Confirm
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Outcomes Column */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          padding: '10px 14px',
                          marginBottom: '12px',
                          borderRadius: '8px',
                          background: 'rgba(244, 114, 182, 0.05)',
                          border: '1px solid rgba(244, 114, 182, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="6" />
                            <circle cx="12" cy="12" r="2" fill="#F472B6" />
                          </svg>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#F472B6' }}>Outcomes</span>
                          <span style={{ fontSize: '11px', color: '#71717A', marginLeft: 'auto' }}>
                            {classifications.filter(c => c.classification === 'outcome' && c.confirmed).length}/{outcomeCount} confirmed
                          </span>
                        </div>
                        
                        {classifications.filter(c => c.classification === 'outcome').map((item) => (
                          <div
                            key={item.id}
                            className={`classification-row ${item.confirmed ? 'confirmed' : ''}`}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#E4E4E7' }}>
                                  {item.name}
                                </span>
                                {!item.confirmed && (
                                  <ConfidenceIndicator confidence={item.confidence} />
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <select
                                  className="subtype-select"
                                  value={item.subType}
                                  onChange={(e) => { e.stopPropagation(); updateSubType(item.id, e.target.value); }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="Analytical">Analytical</option>
                                  <option value="Sensory">Sensory</option>
                                  <option value="Consumer">Consumer</option>
                                  <option value="Other">Other</option>
                                </select>
                                {!item.confirmed && (
                                  <span style={{ fontSize: '9px', color: '#A78BFA', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    </svg>
                                    AI
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {/* Swap Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleClassification(item.id); }}
                                style={{
                                  padding: '6px',
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  color: '#71717A',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: hoveredItem === item.id ? 1 : 0,
                                  transition: 'all 0.15s ease',
                                }}
                                title="Move to Inputs"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                              </button>
                              
                              {/* Confirm Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); confirmItem(item.id); }}
                                disabled={item.confirmed}
                                style={{
                                  padding: '6px 10px',
                                  background: item.confirmed 
                                    ? 'rgba(34, 197, 94, 0.15)' 
                                    : 'rgba(255,255,255,0.04)',
                                  border: item.confirmed 
                                    ? '1px solid rgba(34, 197, 94, 0.3)' 
                                    : '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '5px',
                                  cursor: item.confirmed ? 'default' : 'pointer',
                                  color: item.confirmed ? '#22C55E' : '#71717A',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {item.confirmed ? (
                                  <>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: item.confirmed ? 'checkPop 0.3s ease-out' : 'none' }}>
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Confirm
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {stage !== 'upload' && (
              <button
                onClick={() => {
                  if (stage === 'preview') setStage('upload');
                  if (stage === 'classify') setStage('preview');
                }}
                style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: 'transparent',
                  color: '#71717A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.color = '#A1A1AA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#71717A';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
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
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Cancel
            </button>
            
            {stage === 'preview' && (
              <button
                onClick={proceedToClassification}
                style={{
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${themeColor} 0%, ${secondaryColor} 100%)`,
                  color: '#0a0a0f',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  boxShadow: `0 2px 16px rgba(${themeColorRgb}, 0.35)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 4px 20px rgba(${themeColorRgb}, 0.45)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 2px 16px rgba(${themeColorRgb}, 0.35)`;
                }}
              >
                Continue to Classification
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            {stage === 'classify' && classificationProgress >= 100 && (
              <button
                onClick={() => {
                  if (allConfirmed) {
                    const confirmedClassifications = classifications.filter((c: any) => c.confirmed);

                    // Separate inputs and outcomes
                    const inputClassifications = confirmedClassifications.filter((c: any) => c.classification === 'input');
                    const outcomeClassifications = confirmedClassifications.filter((c: any) => c.classification === 'outcome');

                    // Convert to Input/Outcome format and save to context
                    const newInputs = inputClassifications.map((item: any, index) => ({
                      id: `csv-input-${Date.now()}-${index}`,
                      name: item.name,
                      inputType: item.subType || 'Other',
                      variableType: item.variableType,
                      description: '',
                      cost: null,
                      isDefault: false,
                    }));

                    const newOutcomes = outcomeClassifications.map((item: any, index) => ({
                      id: `csv-outcome-${Date.now()}-${index}`,
                      name: item.name,
                      outcomeType: item.subType || 'Other',
                      variableType: item.variableType,
                      description: '',
                      isDefault: false,
                    }));

                    // Save to context
                    setInputs(newInputs);
                    setOutcomes(newOutcomes);

                    // Call onSave for stage transition
                    if (onSave) {
                      onSave({
                        classifications: confirmedClassifications,
                        parsedData,
                        columns,
                        file: uploadedFile
                      });
                    }
                  }
                }}
                disabled={!allConfirmed}
                style={{
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: allConfirmed 
                    ? `linear-gradient(135deg, #22C55E 0%, #16A34A 100%)`
                    : 'rgba(255,255,255,0.05)',
                  color: allConfirmed ? '#0a0a0f' : '#52525b',
                  border: allConfirmed ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: allConfirmed ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  boxShadow: allConfirmed ? '0 2px 16px rgba(34, 197, 94, 0.35)' : 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Complete Import
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUploadModal;
