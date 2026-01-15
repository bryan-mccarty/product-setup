import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData, UploadedData } from '../contexts/DataContext';

interface FilterState {
  column: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: string;
  value2?: string; // For 'between' operator
}

interface ColumnSort {
  column: string;
  direction: 'asc' | 'desc';
}

const DataView: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { uploadedData } = useData();

  // Theme colors for Data view - using a cyan/blue gradient consistent with the data upload
  const themeColor = '#14B8A6';
  const themeColorRgb = '20, 184, 166';
  const secondaryColor = '#0EA5E9';
  const secondaryColorRgb = '14, 165, 233';

  // State for filters
  const [activeFilters, setActiveFilters] = useState<FilterState[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState<string | null>(null);
  const [tempFilter, setTempFilter] = useState<FilterState | null>(null);
  
  // State for sorting
  const [sortConfig, setSortConfig] = useState<ColumnSort | null>(null);
  
  // State for column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  
  // Refs for click outside handling
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Initialize visible columns when data loads
  useEffect(() => {
    if (uploadedData?.columns) {
      setVisibleColumns(new Set(uploadedData.columns));
    }
  }, [uploadedData?.columns]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(null);
        setTempFilter(null);
      }
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setColumnMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get column data type (numeric or string)
  const getColumnType = (column: string): 'numeric' | 'string' => {
    if (!uploadedData?.parsedData || uploadedData.parsedData.length === 0) return 'string';
    const firstValue = uploadedData.parsedData[0][column];
    return typeof firstValue === 'number' || !isNaN(Number(firstValue)) ? 'numeric' : 'string';
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    if (!uploadedData?.parsedData) return [];
    
    let data = [...uploadedData.parsedData];
    
    // Apply filters
    activeFilters.forEach(filter => {
      data = data.filter(row => {
        const cellValue = row[filter.column];
        const stringValue = String(cellValue).toLowerCase();
        const numValue = Number(cellValue);
        const filterValue = filter.value.toLowerCase();
        const filterNumValue = Number(filter.value);
        
        switch (filter.operator) {
          case 'equals':
            return stringValue === filterValue;
          case 'contains':
            return stringValue.includes(filterValue);
          case 'greater':
            return !isNaN(numValue) && !isNaN(filterNumValue) && numValue > filterNumValue;
          case 'less':
            return !isNaN(numValue) && !isNaN(filterNumValue) && numValue < filterNumValue;
          case 'between':
            const filterNum2 = Number(filter.value2);
            return !isNaN(numValue) && !isNaN(filterNumValue) && !isNaN(filterNum2) && 
                   numValue >= filterNumValue && numValue <= filterNum2;
          default:
            return true;
        }
      });
    });
    
    // Apply sorting
    if (sortConfig) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.column];
        const bVal = b[sortConfig.column];
        
        // Try numeric comparison first
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Fall back to string comparison
        const aStr = String(aVal);
        const bStr = String(bVal);
        const cmp = aStr.localeCompare(bStr);
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      });
    }
    
    return data;
  }, [uploadedData?.parsedData, activeFilters, sortConfig]);

  // Handle column sort
  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev?.column === column) {
        if (prev.direction === 'asc') return { column, direction: 'desc' };
        if (prev.direction === 'desc') return null;
      }
      return { column, direction: 'asc' };
    });
  };

  // Handle filter application
  const applyFilter = () => {
    if (tempFilter && tempFilter.value) {
      setActiveFilters(prev => [...prev, tempFilter]);
      setTempFilter(null);
      setFilterMenuOpen(null);
    }
  };

  // Remove a filter
  const removeFilter = (index: number) => {
    setActiveFilters(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  };

  // Calculate stats for numeric columns
  const getColumnStats = (column: string) => {
    if (!uploadedData?.parsedData) return null;
    const values = uploadedData.parsedData
      .map(row => Number(row[column]))
      .filter(v => !isNaN(v));
    
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { mean: mean.toFixed(2), min: min.toFixed(2), max: max.toFixed(2), count: values.length };
  };

  // Empty state when no data
  if (!uploadedData || !uploadedData.parsedData || uploadedData.parsedData.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        background: theme.background,
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: `linear-gradient(135deg, rgba(${themeColorRgb}, 0.15) 0%, rgba(${secondaryColorRgb}, 0.1) 100%)`,
          border: `1px solid rgba(${themeColorRgb}, 0.25)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="1.5">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-4 4 4 5-6" />
          </svg>
        </div>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: 600,
          color: theme.text,
        }}>No Data Available</h3>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: theme.textTertiary,
          textAlign: 'center',
          maxWidth: '320px',
        }}>
          Upload data during setup to view and analyze your formulation data here.
        </p>
      </div>
    );
  }

  const displayColumns = uploadedData.columns.filter(col => visibleColumns.has(col));

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: theme.background,
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        .data-view-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .data-view-scrollbar::-webkit-scrollbar-track {
          background: ${theme.scrollbarTrack};
        }
        .data-view-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme.scrollbarThumb};
          border-radius: 3px;
        }
        .data-view-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme.borderStrong};
        }
        
        .data-table-row {
          transition: background 0.1s ease;
        }
        .data-table-row:hover {
          background: ${theme.rowHoverBg};
        }
        
        .filter-btn {
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .header-cell:hover .filter-btn {
          opacity: 1;
        }
        
        .sort-icon {
          transition: transform 0.15s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 3-Panel Layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        gap: '16px',
        overflow: 'hidden',
      }}>
        {/* Top Panel - Data Table */}
        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* Table Header Bar */}
          <div style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: theme.cardBgDark,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, rgba(${themeColorRgb}, 0.15) 0%, rgba(${secondaryColorRgb}, 0.1) 100%)`,
                  border: `1px solid rgba(${themeColorRgb}, 0.25)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: theme.text,
                  }}>Formulation Data</h3>
                  <p style={{
                    margin: 0,
                    fontSize: '11px',
                    color: theme.textTertiary,
                  }}>
                    {processedData.length} of {uploadedData.parsedData.length} rows • {displayColumns.length} columns
                  </p>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: '8px',
                  paddingLeft: '12px',
                  borderLeft: `1px solid ${theme.borderLight}`,
                }}>
                  {activeFilters.map((filter, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: `rgba(${themeColorRgb}, 0.1)`,
                        border: `1px solid rgba(${themeColorRgb}, 0.25)`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        color: themeColor,
                        fontWeight: 500,
                      }}
                    >
                      <span style={{ color: theme.textSecondary }}>{filter.column.replace(/_/g, ' ')}</span>
                      <span style={{ opacity: 0.7 }}>{filter.operator}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {filter.value}{filter.value2 ? ` - ${filter.value2}` : ''}
                      </span>
                      <button
                        onClick={() => removeFilter(idx)}
                        style={{
                          padding: '2px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: theme.textTertiary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setActiveFilters([])}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 500,
                      background: 'transparent',
                      color: theme.textTertiary,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Column Visibility Menu */}
            <div style={{ position: 'relative' }} ref={columnMenuRef}>
              <button
                onClick={() => setColumnMenuOpen(!columnMenuOpen)}
                style={{
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: 500,
                  background: columnMenuOpen ? theme.cardBgHover : 'transparent',
                  color: theme.textSecondary,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
                Columns
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              
              {columnMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '200px',
                  maxHeight: '300px',
                  overflow: 'auto',
                  background: theme.modalBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  zIndex: 100,
                  animation: 'fadeIn 0.15s ease-out',
                }}>
                  <div style={{ padding: '8px' }}>
                    <p style={{
                      margin: '0 0 8px 0',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: theme.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>Toggle Columns</p>
                    {uploadedData.columns.map(col => (
                      <label
                        key={col}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: theme.text,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = theme.cardBgHover}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns.has(col)}
                          onChange={() => toggleColumnVisibility(col)}
                          style={{ accentColor: themeColor }}
                        />
                        {col.replace(/_/g, ' ')}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="data-view-scrollbar" style={{
            flex: 1,
            overflow: 'auto',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
            }}>
              <colgroup>
                {displayColumns.map((col, idx) => (
                  <col key={col} style={{ width: idx === 0 ? '90px' : '80px' }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {displayColumns.map((col, idx) => {
                    const isFiltered = activeFilters.some(f => f.column === col);
                    const isSorted = sortConfig?.column === col;
                    const colType = getColumnType(col);
                    
                    return (
                      <th
                        key={col}
                        className="header-cell"
                        style={{
                          padding: '8px 10px',
                          textAlign: idx === 0 ? 'left' : 'right',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: isFiltered || isSorted ? themeColor : theme.textTertiary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          background: theme.cardBgDark,
                          borderBottom: `1px solid ${theme.border}`,
                          position: 'sticky',
                          top: 0,
                          zIndex: 10,
                          whiteSpace: 'normal',
                          lineHeight: '1.3',
                          minWidth: '70px',
                          maxWidth: '100px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          verticalAlign: 'bottom',
                        }}
                        onClick={() => handleSort(col)}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: idx === 0 ? 'flex-start' : 'flex-end',
                          gap: '6px',
                        }}>
                          <span>{col.replace(/_/g, ' ')}</span>
                          
                          {/* Sort indicator */}
                          {isSorted && (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="sort-icon"
                              style={{
                                transform: sortConfig.direction === 'asc' ? 'rotate(180deg)' : 'none',
                              }}
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          )}
                          
                          {/* Filter button */}
                          <div
                            style={{ position: 'relative' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="filter-btn"
                              onClick={() => {
                                if (filterMenuOpen === col) {
                                  setFilterMenuOpen(null);
                                  setTempFilter(null);
                                } else {
                                  setFilterMenuOpen(col);
                                  setTempFilter({
                                    column: col,
                                    operator: colType === 'numeric' ? 'greater' : 'contains',
                                    value: '',
                                  });
                                }
                              }}
                              style={{
                                padding: '2px',
                                background: isFiltered ? `rgba(${themeColorRgb}, 0.15)` : 'transparent',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                color: isFiltered ? themeColor : theme.textMuted,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isFiltered ? 1 : undefined,
                              }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                              </svg>
                            </button>
                            
                            {/* Filter Menu */}
                            {filterMenuOpen === col && (
                              <div
                                ref={filterMenuRef}
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: idx === 0 ? 'auto' : 0,
                                  left: idx === 0 ? 0 : 'auto',
                                  marginTop: '8px',
                                  width: '200px',
                                  background: theme.modalBg,
                                  border: `1px solid ${theme.border}`,
                                  borderRadius: '8px',
                                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                  zIndex: 100,
                                  animation: 'fadeIn 0.15s ease-out',
                                  overflow: 'hidden',
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && tempFilter?.value) {
                                    applyFilter();
                                  } else if (e.key === 'Escape') {
                                    setFilterMenuOpen(null);
                                    setTempFilter(null);
                                  }
                                }}
                              >
                                <div style={{ padding: '12px' }}>
                                  <p style={{
                                    margin: '0 0 10px 0',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: theme.text,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em',
                                  }}>Filter {col.replace(/_/g, ' ')}</p>
                                  
                                  <select
                                    value={tempFilter?.operator || 'contains'}
                                    onChange={(e) => setTempFilter(prev => prev ? {
                                      ...prev,
                                      operator: e.target.value as FilterState['operator'],
                                    } : null)}
                                    style={{
                                      width: '100%',
                                      padding: '6px 8px',
                                      fontSize: '12px',
                                      background: theme.inputBg,
                                      border: `1px solid ${theme.inputBorder}`,
                                      borderRadius: '4px',
                                      color: theme.text,
                                      marginBottom: '8px',
                                      outline: 'none',
                                      boxSizing: 'border-box',
                                    }}
                                  >
                                    <option value="contains">Contains</option>
                                    <option value="equals">Equals</option>
                                    {colType === 'numeric' && (
                                      <>
                                        <option value="greater">Greater than</option>
                                        <option value="less">Less than</option>
                                        <option value="between">Between</option>
                                      </>
                                    )}
                                  </select>
                                  
                                  <input
                                    type={colType === 'numeric' ? 'number' : 'text'}
                                    placeholder={tempFilter?.operator === 'between' ? 'Min value' : 'Value'}
                                    value={tempFilter?.value || ''}
                                    onChange={(e) => setTempFilter(prev => prev ? {
                                      ...prev,
                                      value: e.target.value,
                                    } : null)}
                                    autoFocus
                                    style={{
                                      width: '100%',
                                      padding: '6px 8px',
                                      fontSize: '12px',
                                      background: theme.inputBg,
                                      border: `1px solid ${theme.inputBorder}`,
                                      borderRadius: '4px',
                                      color: theme.text,
                                      marginBottom: tempFilter?.operator === 'between' ? '8px' : '10px',
                                      outline: 'none',
                                      fontFamily: "'JetBrains Mono', monospace",
                                      boxSizing: 'border-box',
                                    }}
                                  />
                                  
                                  {tempFilter?.operator === 'between' && (
                                    <input
                                      type="number"
                                      placeholder="Max value"
                                      value={tempFilter?.value2 || ''}
                                      onChange={(e) => setTempFilter(prev => prev ? {
                                        ...prev,
                                        value2: e.target.value,
                                      } : null)}
                                      style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        fontSize: '12px',
                                        background: theme.inputBg,
                                        border: `1px solid ${theme.inputBorder}`,
                                        borderRadius: '4px',
                                        color: theme.text,
                                        marginBottom: '10px',
                                        outline: 'none',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        boxSizing: 'border-box',
                                      }}
                                    />
                                  )}
                                  
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      onClick={() => {
                                        setFilterMenuOpen(null);
                                        setTempFilter(null);
                                      }}
                                      style={{
                                        flex: 1,
                                        padding: '6px',
                                        fontSize: '11px',
                                        fontWeight: 500,
                                        background: 'transparent',
                                        color: theme.textTertiary,
                                        border: `1px solid ${theme.borderLight}`,
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={applyFilter}
                                      disabled={!tempFilter?.value}
                                      style={{
                                        flex: 1,
                                        padding: '6px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        background: tempFilter?.value 
                                          ? `linear-gradient(135deg, ${themeColor} 0%, ${secondaryColor} 100%)`
                                          : theme.borderLight,
                                        color: tempFilter?.value ? '#ffffff' : theme.textMuted,
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: tempFilter?.value ? 'pointer' : 'not-allowed',
                                      }}
                                    >
                                      Apply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {processedData.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="data-table-row"
                    style={{
                      background: rowIdx % 2 === 0 ? 'transparent' : theme.rowHoverBg,
                    }}
                  >
                    {displayColumns.map((col, colIdx) => (
                      <td
                        key={col}
                        style={{
                          padding: '6px 10px',
                          fontSize: '11px',
                          color: colIdx === 0 ? theme.text : theme.textSecondary,
                          fontWeight: colIdx === 0 ? 500 : 400,
                          fontFamily: colIdx === 0 ? 'inherit' : "'JetBrains Mono', monospace",
                          textAlign: colIdx === 0 ? 'left' : 'right',
                          borderBottom: `1px solid ${theme.borderLight}`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div style={{
            padding: '8px 16px',
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: theme.cardBgDark,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '11px', color: theme.textTertiary }}>
              Showing {processedData.length} of {uploadedData.parsedData.length} rows
              {activeFilters.length > 0 && ` • ${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''} applied`}
            </span>
            <span style={{ fontSize: '10px', color: theme.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
              {uploadedData.fileName}
            </span>
          </div>
        </div>

        {/* Bottom Row - Two Chart Canvases */}
        <div style={{
          display: 'flex',
          gap: '16px',
          height: '240px',
          flexShrink: 0,
        }}>
          {/* Left Chart Canvas */}
          <div style={{
            flex: 1,
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${theme.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>Chart 1</span>
              </div>
              <span style={{
                padding: '3px 8px',
                fontSize: '9px',
                fontWeight: 500,
                background: `rgba(${themeColorRgb}, 0.1)`,
                color: themeColor,
                borderRadius: '4px',
              }}>Coming Soon</span>
            </div>
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, rgba(${themeColorRgb}, 0.08) 0%, rgba(${secondaryColorRgb}, 0.05) 100%)`,
                border: `1px dashed rgba(${themeColorRgb}, 0.3)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: theme.textTertiary,
                textAlign: 'center',
              }}>
                Visualization canvas
              </p>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '10px',
                color: theme.textMuted,
              }}>
                Select columns to chart
              </p>
            </div>
          </div>

          {/* Right Chart Canvas */}
          <div style={{
            flex: 1,
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${theme.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={secondaryColor} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                  <line x1="12" y1="12" x2="12" y2="6" />
                  <line x1="12" y1="12" x2="16" y2="14" />
                </svg>
                <span style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>Chart 2</span>
              </div>
              <span style={{
                padding: '3px 8px',
                fontSize: '9px',
                fontWeight: 500,
                background: `rgba(${secondaryColorRgb}, 0.1)`,
                color: secondaryColor,
                borderRadius: '4px',
              }}>Coming Soon</span>
            </div>
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, rgba(${secondaryColorRgb}, 0.08) 0%, rgba(${themeColorRgb}, 0.05) 100%)`,
                border: `1px dashed rgba(${secondaryColorRgb}, 0.3)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="1.5">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-4 4 4 5-6" />
                </svg>
              </div>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: theme.textTertiary,
                textAlign: 'center',
              }}>
                Visualization canvas
              </p>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '10px',
                color: theme.textMuted,
              }}>
                Select columns to chart
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataView;
