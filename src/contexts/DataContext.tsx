import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Input,
  Outcome,
  Constraint,
  Objective,
  Combination,
  Project,
  Idea,
  Supplier,
  INPUT_LIBRARY,
  OUTCOME_LIBRARY,
  DEFAULT_PROJECTS,
  DEFAULT_IDEAS,
  DEFAULT_SUPPLIERS,
  getDefaultInputs,
  getDefaultOutcomes,
} from '../data/demoLibrary';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface DataContextType {
  // Core product data (user-configurable)
  inputs: Input[];
  outcomes: Outcome[];
  constraints: Constraint[];
  objectives: Objective[];
  combinations: Combination[];

  // Setters (support both direct values and callback functions like React setState)
  setInputs: (value: Input[] | ((prev: Input[]) => Input[])) => void;
  setOutcomes: (value: Outcome[] | ((prev: Outcome[]) => Outcome[])) => void;
  setConstraints: (value: Constraint[] | ((prev: Constraint[]) => Constraint[])) => void;
  setObjectives: (value: Objective[] | ((prev: Objective[]) => Objective[])) => void;
  setCombinations: (value: Combination[] | ((prev: Combination[]) => Combination[])) => void;

  // CRUD operations
  addInput: (input: Input) => void;
  updateInput: (id: string, updates: Partial<Input>) => void;
  removeInput: (id: string) => void;

  addOutcome: (outcome: Outcome) => void;
  updateOutcome: (id: string, updates: Partial<Outcome>) => void;
  removeOutcome: (id: string) => void;

  addConstraint: (constraint: Constraint) => void;
  updateConstraint: (id: string, updates: Partial<Constraint>) => void;
  removeConstraint: (id: string) => void;

  addObjective: (objective: Objective) => void;
  updateObjective: (id: string, updates: Partial<Objective>) => void;
  removeObjective: (id: string) => void;

  addCombination: (combination: Combination) => void;
  updateCombination: (id: string, updates: Partial<Combination>) => void;
  removeCombination: (id: string) => void;

  // Dashboard-specific data
  projects: Project[];
  ideas: Idea[];
  suppliers: Supplier[];

  setProjects: (value: Project[] | ((prev: Project[]) => Project[])) => void;
  setIdeas: (value: Idea[] | ((prev: Idea[]) => Idea[])) => void;
  setSuppliers: (value: Supplier[] | ((prev: Supplier[]) => Supplier[])) => void;

  // Library access (read-only)
  inputLibrary: Input[];
  outcomeLibrary: Outcome[];

  // CSV upload integration
  loadFromCSV: (data: any) => void;

  // Utility
  resetToDefaults: () => void;
  loadFullDemoMode: () => void;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const DataContext = createContext<DataContextType | undefined>(undefined);

// ============================================================================
// SESSIONSTO RAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  inputs: 'product_setup_inputs',
  outcomes: 'product_setup_outcomes',
  constraints: 'product_setup_constraints',
  objectives: 'product_setup_objectives',
  combinations: 'product_setup_combinations',
  projects: 'product_setup_projects',
  ideas: 'product_setup_ideas',
  suppliers: 'product_setup_suppliers',
};

// ============================================================================
// STORAGE HELPERS
// ============================================================================

function loadFromSessionStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn(`Failed to load ${key} from sessionStorage:`, error);
  }
  return defaultValue;
}

function saveToSessionStorage<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to sessionStorage:`, error);
  }
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Core product data - empty by default, populated only via CSV upload
  const [inputs, setInputsState] = useState<Input[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.inputs, [])
  );

  const [outcomes, setOutcomesState] = useState<Outcome[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.outcomes, [])
  );

  // User-configured data - empty by default
  const [constraints, setConstraintsState] = useState<Constraint[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.constraints, [])
  );

  const [objectives, setObjectivesState] = useState<Objective[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.objectives, [])
  );

  const [combinations, setCombinationsState] = useState<Combination[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.combinations, [])
  );

  // Dashboard data - empty by default
  const [projects, setProjectsState] = useState<Project[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.projects, [])
  );

  const [ideas, setIdeasState] = useState<Idea[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.ideas, [])
  );

  const [suppliers, setSuppliersState] = useState<Supplier[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.suppliers, [])
  );

  // ============================================================================
  // SESSIONSTO RAGE SYNC (auto-persist on change)
  // ============================================================================

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.inputs, inputs);
  }, [inputs]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.outcomes, outcomes);
  }, [outcomes]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.constraints, constraints);
  }, [constraints]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.objectives, objectives);
  }, [objectives]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.combinations, combinations);
  }, [combinations]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.projects, projects);
  }, [projects]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.ideas, ideas);
  }, [ideas]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.suppliers, suppliers);
  }, [suppliers]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  // Inputs - support both direct values and callback functions
  const setInputs = useCallback((value: Input[] | ((prev: Input[]) => Input[])) => {
    if (typeof value === 'function') {
      setInputsState(value);
    } else {
      setInputsState(value);
    }
  }, []);

  const addInput = useCallback((input: Input) => {
    setInputsState(prev => [...prev, input]);
  }, []);

  const updateInput = useCallback((id: string, updates: Partial<Input>) => {
    setInputsState(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const removeInput = useCallback((id: string) => {
    setInputsState(prev => prev.filter(item => item.id !== id));
  }, []);

  // Outcomes - support both direct values and callback functions
  const setOutcomes = useCallback((value: Outcome[] | ((prev: Outcome[]) => Outcome[])) => {
    if (typeof value === 'function') {
      setOutcomesState(value);
    } else {
      setOutcomesState(value);
    }
  }, []);

  const addOutcome = useCallback((outcome: Outcome) => {
    setOutcomesState(prev => [...prev, outcome]);
  }, []);

  const updateOutcome = useCallback((id: string, updates: Partial<Outcome>) => {
    setOutcomesState(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const removeOutcome = useCallback((id: string) => {
    setOutcomesState(prev => prev.filter(item => item.id !== id));
  }, []);

  // Constraints - support both direct values and callback functions
  const setConstraints = useCallback((value: Constraint[] | ((prev: Constraint[]) => Constraint[])) => {
    if (typeof value === 'function') {
      setConstraintsState(value);
    } else {
      setConstraintsState(value);
    }
  }, []);

  const addConstraint = useCallback((constraint: Constraint) => {
    setConstraintsState(prev => [...prev, constraint]);
  }, []);

  const updateConstraint = useCallback((id: string, updates: Partial<Constraint>) => {
    setConstraintsState(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const removeConstraint = useCallback((id: string) => {
    setConstraintsState(prev => prev.filter(item => item.id !== id));
  }, []);

  // Objectives - support both direct values and callback functions
  const setObjectives = useCallback((value: Objective[] | ((prev: Objective[]) => Objective[])) => {
    if (typeof value === 'function') {
      setObjectivesState(value);
    } else {
      setObjectivesState(value);
    }
  }, []);

  const addObjective = useCallback((objective: Objective) => {
    setObjectivesState(prev => [...prev, objective]);
  }, []);

  const updateObjective = useCallback((id: string, updates: Partial<Objective>) => {
    setObjectivesState(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const removeObjective = useCallback((id: string) => {
    setObjectivesState(prev => prev.filter(item => item.id !== id));
  }, []);

  // Combinations - support both direct values and callback functions
  const setCombinations = useCallback((value: Combination[] | ((prev: Combination[]) => Combination[])) => {
    if (typeof value === 'function') {
      setCombinationsState(value);
    } else {
      setCombinationsState(value);
    }
  }, []);

  const addCombination = useCallback((combination: Combination) => {
    setCombinationsState(prev => [...prev, combination]);
  }, []);

  const updateCombination = useCallback((id: string, updates: Partial<Combination>) => {
    setCombinationsState(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const removeCombination = useCallback((id: string) => {
    setCombinationsState(prev => prev.filter(item => item.id !== id));
  }, []);

  // Dashboard data - support both direct values and callback functions
  const setProjects = useCallback((value: Project[] | ((prev: Project[]) => Project[])) => {
    if (typeof value === 'function') {
      setProjectsState(value);
    } else {
      setProjectsState(value);
    }
  }, []);

  const setIdeas = useCallback((value: Idea[] | ((prev: Idea[]) => Idea[])) => {
    if (typeof value === 'function') {
      setIdeasState(value);
    } else {
      setIdeasState(value);
    }
  }, []);

  const setSuppliers = useCallback((value: Supplier[] | ((prev: Supplier[]) => Supplier[])) => {
    if (typeof value === 'function') {
      setSuppliersState(value);
    } else {
      setSuppliersState(value);
    }
  }, []);

  // ============================================================================
  // CSV UPLOAD INTEGRATION
  // ============================================================================

  const loadFromCSV = useCallback((data: any) => {
    // Parse CSV data and convert to Input/Outcome format
    // Assuming data has format: { inputs: [...], outcomes: [...] }

    if (data.inputs && Array.isArray(data.inputs)) {
      const newInputs = data.inputs.map((item: any, index: number) => ({
        id: `csv-input-${Date.now()}-${index}`,
        name: item.name || `Input ${index + 1}`,
        inputType: item.inputType || item.subType || 'Other',
        variableType: item.variableType || 'Continuous',
        description: item.description || '',
        cost: item.cost || null,
        isDefault: false,
        levels: item.levels,
      }));
      setInputsState(newInputs);
    }

    if (data.outcomes && Array.isArray(data.outcomes)) {
      const newOutcomes = data.outcomes.map((item: any, index: number) => ({
        id: `csv-outcome-${Date.now()}-${index}`,
        name: item.name || `Outcome ${index + 1}`,
        outcomeType: item.outcomeType || item.subType || 'Other',
        variableType: item.variableType || 'Continuous',
        description: item.description || '',
        isDefault: false,
        limits: item.limits,
        levels: item.levels,
      }));
      setOutcomesState(newOutcomes);
    }
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetToDefaults = useCallback(() => {
    setInputsState(getDefaultInputs());
    setOutcomesState(getDefaultOutcomes());
    setConstraintsState([]);
    setObjectivesState([]);
    setCombinationsState([]);
    setProjectsState(DEFAULT_PROJECTS);
    setIdeasState(DEFAULT_IDEAS);
    setSuppliersState(DEFAULT_SUPPLIERS);
  }, []);

  const loadFullDemoMode = useCallback(() => {
    setInputsState(getDefaultInputs());
    setOutcomesState(getDefaultOutcomes());
    setProjectsState(DEFAULT_PROJECTS);
    setIdeasState(DEFAULT_IDEAS);
    setSuppliersState(DEFAULT_SUPPLIERS);
    // Note: combinations, constraints, objectives stay empty - user configures these
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: DataContextType = {
    // State
    inputs,
    outcomes,
    constraints,
    objectives,
    combinations,
    projects,
    ideas,
    suppliers,

    // Setters
    setInputs,
    setOutcomes,
    setConstraints,
    setObjectives,
    setCombinations,
    setProjects,
    setIdeas,
    setSuppliers,

    // CRUD operations
    addInput,
    updateInput,
    removeInput,
    addOutcome,
    updateOutcome,
    removeOutcome,
    addConstraint,
    updateConstraint,
    removeConstraint,
    addObjective,
    updateObjective,
    removeObjective,
    addCombination,
    updateCombination,
    removeCombination,

    // Library access
    inputLibrary: INPUT_LIBRARY,
    outcomeLibrary: OUTCOME_LIBRARY,

    // CSV upload
    loadFromCSV,

    // Utility
    resetToDefaults,
    loadFullDemoMode,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
