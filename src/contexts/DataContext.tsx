import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Input,
  Outcome,
  Constraint,
  Objective,
  Calculation,
  Project,
  Idea,
  Supplier,
  Tag,
  ProjectMetadata,
  ProductCategory,
  Competitor,
  Packaging,
  Formulation,
  ManufacturingSite,
  DistributionChannel,
  INPUT_LIBRARY,
  OUTCOME_LIBRARY,
  DEFAULT_PROJECTS,
  DEFAULT_IDEAS,
  DEFAULT_SUPPLIERS,
  DEFAULT_COMPETITORS,
  DEFAULT_PACKAGING,
  DEFAULT_FORMULATIONS,
  DEFAULT_MFG_SITES,
  DEFAULT_DISTRIBUTION_CHANNELS,
  DEFAULT_CONSTRAINTS,
  DEFAULT_OBJECTIVES,
  DEFAULT_CALCULATIONS,
  CONSTRAINT_TAGS,
  OBJECTIVE_TAGS,
  DEFAULT_PRODUCT_CATEGORIES,
  CALCULATIONS_LIBRARY,
  getDefaultInputs,
  getDefaultOutcomes,
} from '../data/demoLibrary';

// Step status type
export type StepStatus = 'completed' | 'current' | 'draft' | 'incomplete' | 'upcoming';

// Uploaded CSV data structure
export interface UploadedData {
  parsedData: Record<string, string | number>[];
  columns: string[];
  fileName: string;
  uploadedAt: number;
}

// ============================================================================
// GOAL & DRAFT TYPES (for Goals & Claims → Constraints/Objectives flow)
// ============================================================================

export interface GoalItem {
  id: string;
  type: 'constraint' | 'objective';
  metricName: string;
  metricRef: { id: string; type: string } | null;
  operator: string;
  value1: string;
  value2: string;
  successValue1?: string;
  successValue2?: string;
  showSuccessCriteria?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  valueType: 'calculated' | 'predicted' | null;
  items: GoalItem[];
  isCollapsed: boolean;
}

export interface DraftConstraint {
  id: string;
  metricName: string;
  metricRef: { id: string; type: string } | null;
  operator: string;
  value1: string;
  value2: string;
  goalId: string;
  goalName: string;
  status: 'draft' | 'confirmed';
  isPrefilled: boolean;
}

export interface DraftObjective {
  id: string;
  metricName: string;
  metricRef: { id: string; type: string } | null;
  operator: string;
  value1: string;
  value2: string;
  goalId: string;
  goalName: string;
  status: 'draft' | 'confirmed';
  isPrefilled: boolean;
}

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface DataContextType {
  // Core product data (category-specific, e.g., brownie mix inputs)
  inputs: Input[];
  outcomes: Outcome[];
  constraints: Constraint[];
  objectives: Objective[];
  combinations: Calculation[];

  // Project-specific data (selected for current project setup)
  projectInputs: Input[];
  projectOutcomes: Outcome[];
  projectConstraints: Constraint[];
  projectObjectives: Objective[];
  projectCombinations: Calculation[];

  // Project setup data
  projectMetadata: ProjectMetadata | null;
  productCategories: ProductCategory[];
  tags: Tag[];
  libraryCalculations: Calculation[];

  // Setters (support both direct values and callback functions like React setState)
  setInputs: (value: Input[] | ((prev: Input[]) => Input[])) => void;
  setOutcomes: (value: Outcome[] | ((prev: Outcome[]) => Outcome[])) => void;
  setConstraints: (value: Constraint[] | ((prev: Constraint[]) => Constraint[])) => void;
  setObjectives: (value: Objective[] | ((prev: Objective[]) => Objective[])) => void;
  setCombinations: (value: Calculation[] | ((prev: Calculation[]) => Calculation[])) => void;

  setProjectMetadata: (value: ProjectMetadata | null) => void;
  setProductCategories: (value: ProductCategory[] | ((prev: ProductCategory[]) => ProductCategory[])) => void;
  setTags: (value: Tag[] | ((prev: Tag[]) => Tag[])) => void;
  setLibraryCalculations: (value: Calculation[] | ((prev: Calculation[]) => Calculation[])) => void;

  // Project-specific setters
  setProjectInputs: (value: Input[] | ((prev: Input[]) => Input[])) => void;
  setProjectOutcomes: (value: Outcome[] | ((prev: Outcome[]) => Outcome[])) => void;
  setProjectConstraints: (value: Constraint[] | ((prev: Constraint[]) => Constraint[])) => void;
  setProjectObjectives: (value: Objective[] | ((prev: Objective[]) => Objective[])) => void;
  setProjectCombinations: (value: Calculation[] | ((prev: Calculation[]) => Calculation[])) => void;

  // Project-specific CRUD
  addProjectInput: (input: Input) => void;
  removeProjectInput: (id: string) => void;
  addProjectOutcome: (outcome: Outcome) => void;
  removeProjectOutcome: (id: string) => void;
  addProjectConstraint: (constraint: Constraint) => void;
  removeProjectConstraint: (id: string) => void;
  addProjectObjective: (objective: Objective) => void;
  removeProjectObjective: (id: string) => void;
  addProjectCombination: (combination: Calculation) => void;
  removeProjectCombination: (id: string) => void;

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

  addCombination: (combination: Calculation) => void;
  updateCombination: (id: string, updates: Partial<Calculation>) => void;
  removeCombination: (id: string) => void;

  // Dashboard-specific data
  projects: Project[];
  ideas: Idea[];
  suppliers: Supplier[];

  setProjects: (value: Project[] | ((prev: Project[]) => Project[])) => void;
  setIdeas: (value: Idea[] | ((prev: Idea[]) => Idea[])) => void;
  setSuppliers: (value: Supplier[] | ((prev: Supplier[]) => Supplier[])) => void;

  // Extended graph data
  competitors: Competitor[];
  packaging: Packaging[];
  formulations: Formulation[];
  manufacturingSites: ManufacturingSite[];
  distributionChannels: DistributionChannel[];

  setCompetitors: (value: Competitor[] | ((prev: Competitor[]) => Competitor[])) => void;
  setPackaging: (value: Packaging[] | ((prev: Packaging[]) => Packaging[])) => void;
  setFormulations: (value: Formulation[] | ((prev: Formulation[]) => Formulation[])) => void;
  setManufacturingSites: (value: ManufacturingSite[] | ((prev: ManufacturingSite[]) => ManufacturingSite[])) => void;
  setDistributionChannels: (value: DistributionChannel[] | ((prev: DistributionChannel[]) => DistributionChannel[])) => void;

  // Library access (read-only)
  inputLibrary: Input[];
  outcomeLibrary: Outcome[];

  // CSV upload integration
  loadFromCSV: (data: any) => void;

  // Raw uploaded data
  uploadedData: UploadedData | null;
  setUploadedData: (data: UploadedData | null) => void;

  // Utility
  resetToDefaults: () => void;
  loadFullDemoMode: () => void;

  // Step status management for project setup wizard
  stepStatuses: Record<number, StepStatus>;
  setStepStatus: (stepNumber: number, status: StepStatus) => void;

  // Goals & Claims data (flows to Constraints/Objectives pages)
  projectGoals: Goal[];
  setProjectGoals: (goals: Goal[]) => void;
  draftConstraints: DraftConstraint[];
  setDraftConstraints: (value: DraftConstraint[] | ((prev: DraftConstraint[]) => DraftConstraint[])) => void;
  draftObjectives: DraftObjective[];
  setDraftObjectives: (value: DraftObjective[] | ((prev: DraftObjective[]) => DraftObjective[])) => void;
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
  uploadedData: 'product_setup_uploaded_data',
  projectMetadata: 'product_setup_project_metadata',
  productCategories: 'product_setup_product_categories',
  tags: 'product_setup_tags',
  libraryCalculations: 'product_setup_library_calculations',
  stepStatuses: 'product_setup_step_statuses',
  // Project-specific storage
  projectInputs: 'product_setup_project_inputs',
  projectOutcomes: 'product_setup_project_outcomes',
  projectConstraints: 'product_setup_project_constraints',
  projectObjectives: 'product_setup_project_objectives',
  projectCombinations: 'product_setup_project_combinations',
  // Goals & drafts storage
  projectGoals: 'product_setup_project_goals',
  draftConstraints: 'product_setup_draft_constraints',
  draftObjectives: 'product_setup_draft_objectives',
  // Extended graph data
  competitors: 'product_setup_competitors',
  packaging: 'product_setup_packaging',
  formulations: 'product_setup_formulations',
  manufacturingSites: 'product_setup_mfg_sites',
  distributionChannels: 'product_setup_distribution_channels',
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

  const [combinations, setCombinationsState] = useState<Calculation[]>(() =>
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

  // Extended graph data - empty by default
  const [competitors, setCompetitorsState] = useState<Competitor[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.competitors, [])
  );

  const [packaging, setPackagingState] = useState<Packaging[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.packaging, [])
  );

  const [formulations, setFormulationsState] = useState<Formulation[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.formulations, [])
  );

  const [manufacturingSites, setManufacturingSitesState] = useState<ManufacturingSite[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.manufacturingSites, [])
  );

  const [distributionChannels, setDistributionChannelsState] = useState<DistributionChannel[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.distributionChannels, [])
  );

  // Raw uploaded CSV data
  const [uploadedData, setUploadedDataState] = useState<UploadedData | null>(() =>
    loadFromSessionStorage(STORAGE_KEYS.uploadedData, null)
  );

  // Project setup data - with defaults
  const [projectMetadata, setProjectMetadataState] = useState<ProjectMetadata | null>(() =>
    loadFromSessionStorage(STORAGE_KEYS.projectMetadata, null)
  );

  const [productCategories, setProductCategoriesState] = useState<ProductCategory[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.productCategories, DEFAULT_PRODUCT_CATEGORIES)
  );

  // Step statuses for project setup wizard
  const [stepStatuses, setStepStatusesState] = useState<Record<number, StepStatus>>(() =>
    loadFromSessionStorage(STORAGE_KEYS.stepStatuses, {})
  );

  const setStepStatus = useCallback((stepNumber: number, status: StepStatus) => {
    setStepStatusesState(prev => {
      const updated = { ...prev, [stepNumber]: status };
      saveToSessionStorage(STORAGE_KEYS.stepStatuses, updated);
      return updated;
    });
  }, []);

  const [tags, setTagsState] = useState<Tag[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.tags, [...CONSTRAINT_TAGS, ...OBJECTIVE_TAGS])
  );

  const [libraryCalculations, setLibraryCalculationsState] = useState<Calculation[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.libraryCalculations, CALCULATIONS_LIBRARY)
  );

  // Project-specific data - empty by default, user populates during setup
  const [projectInputs, setProjectInputsState] = useState<Input[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.projectInputs, [])
  );

  const [projectOutcomes, setProjectOutcomesState] = useState<Outcome[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.projectOutcomes, [])
  );

  const [projectConstraints, setProjectConstraintsState] = useState<Constraint[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.projectConstraints, [])
  );

  const [projectObjectives, setProjectObjectivesState] = useState<Objective[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.projectObjectives, [])
  );

  const [projectCombinations, setProjectCombinationsState] = useState<Calculation[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.projectCombinations, [])
  );

  // Goals & Claims data - flows to Constraints/Objectives pages
  const [projectGoals, setProjectGoalsState] = useState<Goal[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.projectGoals, [])
  );

  const [draftConstraints, setDraftConstraintsState] = useState<DraftConstraint[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.draftConstraints, [])
  );

  const [draftObjectives, setDraftObjectivesState] = useState<DraftObjective[]>(() =>
    loadFromSessionStorage(STORAGE_KEYS.draftObjectives, [])
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

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.competitors, competitors);
  }, [competitors]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.packaging, packaging);
  }, [packaging]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.formulations, formulations);
  }, [formulations]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.manufacturingSites, manufacturingSites);
  }, [manufacturingSites]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.distributionChannels, distributionChannels);
  }, [distributionChannels]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.uploadedData, uploadedData);
  }, [uploadedData]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.projectMetadata, projectMetadata);
  }, [projectMetadata]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.productCategories, productCategories);
  }, [productCategories]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.tags, tags);
  }, [tags]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.libraryCalculations, libraryCalculations);
  }, [libraryCalculations]);

  // Project-specific data persistence
  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.projectInputs, projectInputs);
  }, [projectInputs]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.projectOutcomes, projectOutcomes);
  }, [projectOutcomes]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.projectConstraints, projectConstraints);
  }, [projectConstraints]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.projectObjectives, projectObjectives);
  }, [projectObjectives]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.projectCombinations, projectCombinations);
  }, [projectCombinations]);

  // Goals & drafts persistence
  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.projectGoals, projectGoals);
  }, [projectGoals]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.draftConstraints, draftConstraints);
  }, [draftConstraints]);

  useEffect(() => {
    saveToSessionStorage(STORAGE_KEYS.draftObjectives, draftObjectives);
  }, [draftObjectives]);

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
  const setCombinations = useCallback((value: Calculation[] | ((prev: Calculation[]) => Calculation[])) => {
    if (typeof value === 'function') {
      setCombinationsState(value);
    } else {
      setCombinationsState(value);
    }
  }, []);

  const addCombination = useCallback((combination: Calculation) => {
    setCombinationsState(prev => [...prev, combination]);
  }, []);

  const updateCombination = useCallback((id: string, updates: Partial<Calculation>) => {
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

  const setCompetitors = useCallback((value: Competitor[] | ((prev: Competitor[]) => Competitor[])) => {
    if (typeof value === 'function') {
      setCompetitorsState(value);
    } else {
      setCompetitorsState(value);
    }
  }, []);

  const setPackaging = useCallback((value: Packaging[] | ((prev: Packaging[]) => Packaging[])) => {
    if (typeof value === 'function') {
      setPackagingState(value);
    } else {
      setPackagingState(value);
    }
  }, []);

  const setFormulations = useCallback((value: Formulation[] | ((prev: Formulation[]) => Formulation[])) => {
    if (typeof value === 'function') {
      setFormulationsState(value);
    } else {
      setFormulationsState(value);
    }
  }, []);

  const setManufacturingSites = useCallback((value: ManufacturingSite[] | ((prev: ManufacturingSite[]) => ManufacturingSite[])) => {
    if (typeof value === 'function') {
      setManufacturingSitesState(value);
    } else {
      setManufacturingSitesState(value);
    }
  }, []);

  const setDistributionChannels = useCallback((value: DistributionChannel[] | ((prev: DistributionChannel[]) => DistributionChannel[])) => {
    if (typeof value === 'function') {
      setDistributionChannelsState(value);
    } else {
      setDistributionChannelsState(value);
    }
  }, []);

  const setUploadedData = useCallback((data: UploadedData | null) => {
    setUploadedDataState(data);
  }, []);

  // Project setup data setters
  const setProjectMetadata = useCallback((data: ProjectMetadata | null) => {
    setProjectMetadataState(data);
  }, []);

  const setProductCategories = useCallback((value: ProductCategory[] | ((prev: ProductCategory[]) => ProductCategory[])) => {
    if (typeof value === 'function') {
      setProductCategoriesState(value);
    } else {
      setProductCategoriesState(value);
    }
  }, []);

  const setTags = useCallback((value: Tag[] | ((prev: Tag[]) => Tag[])) => {
    if (typeof value === 'function') {
      setTagsState(value);
    } else {
      setTagsState(value);
    }
  }, []);

  const setLibraryCalculations = useCallback((value: Calculation[] | ((prev: Calculation[]) => Calculation[])) => {
    if (typeof value === 'function') {
      setLibraryCalculationsState(value);
    } else {
      setLibraryCalculationsState(value);
    }
  }, []);

  // Project-specific setters and CRUD
  const setProjectInputs = useCallback((value: Input[] | ((prev: Input[]) => Input[])) => {
    if (typeof value === 'function') {
      setProjectInputsState(value);
    } else {
      setProjectInputsState(value);
    }
  }, []);

  const addProjectInput = useCallback((input: Input) => {
    setProjectInputsState(prev => [...prev, input]);
  }, []);

  const removeProjectInput = useCallback((id: string) => {
    setProjectInputsState(prev => prev.filter(item => item.id !== id));
  }, []);

  const setProjectOutcomes = useCallback((value: Outcome[] | ((prev: Outcome[]) => Outcome[])) => {
    if (typeof value === 'function') {
      setProjectOutcomesState(value);
    } else {
      setProjectOutcomesState(value);
    }
  }, []);

  const addProjectOutcome = useCallback((outcome: Outcome) => {
    setProjectOutcomesState(prev => [...prev, outcome]);
  }, []);

  const removeProjectOutcome = useCallback((id: string) => {
    setProjectOutcomesState(prev => prev.filter(item => item.id !== id));
  }, []);

  const setProjectConstraints = useCallback((value: Constraint[] | ((prev: Constraint[]) => Constraint[])) => {
    if (typeof value === 'function') {
      setProjectConstraintsState(value);
    } else {
      setProjectConstraintsState(value);
    }
  }, []);

  const addProjectConstraint = useCallback((constraint: Constraint) => {
    setProjectConstraintsState(prev => [...prev, constraint]);
  }, []);

  const removeProjectConstraint = useCallback((id: string) => {
    setProjectConstraintsState(prev => prev.filter(item => item.id !== id));
  }, []);

  const setProjectObjectives = useCallback((value: Objective[] | ((prev: Objective[]) => Objective[])) => {
    if (typeof value === 'function') {
      setProjectObjectivesState(value);
    } else {
      setProjectObjectivesState(value);
    }
  }, []);

  const addProjectObjective = useCallback((objective: Objective) => {
    setProjectObjectivesState(prev => [...prev, objective]);
  }, []);

  const removeProjectObjective = useCallback((id: string) => {
    setProjectObjectivesState(prev => prev.filter(item => item.id !== id));
  }, []);

  const setProjectCombinations = useCallback((value: Calculation[] | ((prev: Calculation[]) => Calculation[])) => {
    if (typeof value === 'function') {
      setProjectCombinationsState(value);
    } else {
      setProjectCombinationsState(value);
    }
  }, []);

  const addProjectCombination = useCallback((combination: Calculation) => {
    setProjectCombinationsState(prev => [...prev, combination]);
  }, []);

  const removeProjectCombination = useCallback((id: string) => {
    setProjectCombinationsState(prev => prev.filter(item => item.id !== id));
  }, []);

  // Goals & drafts setters
  const setProjectGoals = useCallback((goals: Goal[]) => {
    setProjectGoalsState(goals);
  }, []);

  const setDraftConstraints = useCallback((value: DraftConstraint[] | ((prev: DraftConstraint[]) => DraftConstraint[])) => {
    if (typeof value === 'function') {
      setDraftConstraintsState(value);
    } else {
      setDraftConstraintsState(value);
    }
  }, []);

  const setDraftObjectives = useCallback((value: DraftObjective[] | ((prev: DraftObjective[]) => DraftObjective[])) => {
    if (typeof value === 'function') {
      setDraftObjectivesState(value);
    } else {
      setDraftObjectivesState(value);
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
    // Extended graph data
    setCompetitorsState([]);
    setPackagingState([]);
    setFormulationsState([]);
    setManufacturingSitesState([]);
    setDistributionChannelsState([]);
  }, []);

  const loadFullDemoMode = useCallback(() => {
    // Product data (category-specific, e.g., brownie mix)
    setInputsState(getDefaultInputs());
    setOutcomesState(getDefaultOutcomes());
    setConstraintsState(DEFAULT_CONSTRAINTS);
    setObjectivesState(DEFAULT_OBJECTIVES);
    setCombinationsState(DEFAULT_CALCULATIONS);
    setProjectsState(DEFAULT_PROJECTS);
    setIdeasState(DEFAULT_IDEAS);
    setSuppliersState(DEFAULT_SUPPLIERS);

    // Extended graph data
    setCompetitorsState(DEFAULT_COMPETITORS);
    setPackagingState(DEFAULT_PACKAGING);
    setFormulationsState(DEFAULT_FORMULATIONS);
    setManufacturingSitesState(DEFAULT_MFG_SITES);
    setDistributionChannelsState(DEFAULT_DISTRIBUTION_CHANNELS);

    // Project-specific data starts empty - user populates during setup
    setProjectInputsState([]);
    setProjectOutcomesState([]);
    setProjectConstraintsState([]);
    setProjectObjectivesState([]);
    setProjectCombinationsState([]);

    // Goals & drafts start empty - user creates during setup
    setProjectGoalsState([]);
    setDraftConstraintsState([]);
    setDraftObjectivesState([]);

    // Set demo uploaded data (matches sample CSV from upload modal)
    setUploadedDataState({
      parsedData: [
        { Formulation_ID: 'F001', Flour: 250, Sugar: 120, Butter: 100, Eggs: 2, Vanilla_Extract: 5, Cocoa_Powder: 30, Milk: 80, Salt: 2, Baking_Temperature: 175, Mix_Duration: 8, Bake_Time: 25, Moisture_Content: 6.2, pH_Level: 5.8, Overall_Liking: 7.5, Texture_Score: 8.1, Sweetness_Intensity: 72, Purchase_Intent: 4 },
        { Formulation_ID: 'F002', Flour: 275, Sugar: 100, Butter: 120, Eggs: 3, Vanilla_Extract: 4, Cocoa_Powder: 25, Milk: 90, Salt: 3, Baking_Temperature: 180, Mix_Duration: 10, Bake_Time: 28, Moisture_Content: 5.8, pH_Level: 5.6, Overall_Liking: 8.2, Texture_Score: 7.8, Sweetness_Intensity: 68, Purchase_Intent: 5 },
        { Formulation_ID: 'F003', Flour: 225, Sugar: 140, Butter: 90, Eggs: 2, Vanilla_Extract: 6, Cocoa_Powder: 35, Milk: 70, Salt: 2, Baking_Temperature: 170, Mix_Duration: 7, Bake_Time: 22, Moisture_Content: 6.8, pH_Level: 5.9, Overall_Liking: 6.9, Texture_Score: 7.5, Sweetness_Intensity: 78, Purchase_Intent: 3 },
        { Formulation_ID: 'F004', Flour: 260, Sugar: 110, Butter: 110, Eggs: 3, Vanilla_Extract: 5, Cocoa_Powder: 28, Milk: 85, Salt: 2, Baking_Temperature: 178, Mix_Duration: 9, Bake_Time: 26, Moisture_Content: 6.0, pH_Level: 5.7, Overall_Liking: 7.8, Texture_Score: 8.0, Sweetness_Intensity: 70, Purchase_Intent: 4 },
        { Formulation_ID: 'F005', Flour: 240, Sugar: 130, Butter: 95, Eggs: 2, Vanilla_Extract: 4, Cocoa_Powder: 32, Milk: 75, Salt: 3, Baking_Temperature: 172, Mix_Duration: 8, Bake_Time: 24, Moisture_Content: 6.5, pH_Level: 5.8, Overall_Liking: 7.2, Texture_Score: 7.6, Sweetness_Intensity: 75, Purchase_Intent: 4 },
        { Formulation_ID: 'F006', Flour: 280, Sugar: 95, Butter: 125, Eggs: 3, Vanilla_Extract: 5, Cocoa_Powder: 22, Milk: 95, Salt: 2, Baking_Temperature: 182, Mix_Duration: 11, Bake_Time: 30, Moisture_Content: 5.5, pH_Level: 5.5, Overall_Liking: 8.5, Texture_Score: 8.3, Sweetness_Intensity: 65, Purchase_Intent: 5 },
        { Formulation_ID: 'F007', Flour: 230, Sugar: 135, Butter: 88, Eggs: 2, Vanilla_Extract: 6, Cocoa_Powder: 38, Milk: 72, Salt: 2, Baking_Temperature: 168, Mix_Duration: 7, Bake_Time: 21, Moisture_Content: 7.0, pH_Level: 6.0, Overall_Liking: 6.5, Texture_Score: 7.2, Sweetness_Intensity: 80, Purchase_Intent: 3 },
        { Formulation_ID: 'F008', Flour: 265, Sugar: 105, Butter: 115, Eggs: 3, Vanilla_Extract: 4, Cocoa_Powder: 26, Milk: 88, Salt: 3, Baking_Temperature: 179, Mix_Duration: 10, Bake_Time: 27, Moisture_Content: 5.9, pH_Level: 5.6, Overall_Liking: 8.0, Texture_Score: 7.9, Sweetness_Intensity: 69, Purchase_Intent: 5 },
        { Formulation_ID: 'F009', Flour: 245, Sugar: 125, Butter: 98, Eggs: 2, Vanilla_Extract: 5, Cocoa_Powder: 30, Milk: 78, Salt: 2, Baking_Temperature: 174, Mix_Duration: 8, Bake_Time: 25, Moisture_Content: 6.3, pH_Level: 5.8, Overall_Liking: 7.4, Texture_Score: 7.7, Sweetness_Intensity: 73, Purchase_Intent: 4 },
        { Formulation_ID: 'F010', Flour: 255, Sugar: 115, Butter: 108, Eggs: 3, Vanilla_Extract: 5, Cocoa_Powder: 29, Milk: 82, Salt: 2, Baking_Temperature: 176, Mix_Duration: 9, Bake_Time: 26, Moisture_Content: 6.1, pH_Level: 5.7, Overall_Liking: 7.7, Texture_Score: 7.9, Sweetness_Intensity: 71, Purchase_Intent: 4 },
        { Formulation_ID: 'F011', Flour: 235, Sugar: 138, Butter: 92, Eggs: 2, Vanilla_Extract: 6, Cocoa_Powder: 34, Milk: 73, Salt: 2, Baking_Temperature: 169, Mix_Duration: 7, Bake_Time: 23, Moisture_Content: 6.7, pH_Level: 5.9, Overall_Liking: 7.0, Texture_Score: 7.4, Sweetness_Intensity: 77, Purchase_Intent: 3 },
        { Formulation_ID: 'F012', Flour: 270, Sugar: 98, Butter: 122, Eggs: 3, Vanilla_Extract: 4, Cocoa_Powder: 24, Milk: 92, Salt: 3, Baking_Temperature: 181, Mix_Duration: 10, Bake_Time: 29, Moisture_Content: 5.6, pH_Level: 5.5, Overall_Liking: 8.3, Texture_Score: 8.2, Sweetness_Intensity: 66, Purchase_Intent: 5 },
      ],
      columns: ['Formulation_ID', 'Flour', 'Sugar', 'Butter', 'Eggs', 'Vanilla_Extract', 'Cocoa_Powder', 'Milk', 'Salt', 'Baking_Temperature', 'Mix_Duration', 'Bake_Time', 'Moisture_Content', 'pH_Level', 'Overall_Liking', 'Texture_Score', 'Sweetness_Intensity', 'Purchase_Intent'],
      fileName: 'sample_formulations.csv',
      uploadedAt: Date.now(),
    });
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: DataContextType = {
    // Product data (category-specific)
    inputs,
    outcomes,
    constraints,
    objectives,
    combinations,

    // Project-specific data
    projectInputs,
    projectOutcomes,
    projectConstraints,
    projectObjectives,
    projectCombinations,

    // Dashboard data
    projects,
    ideas,
    suppliers,

    // Extended graph data
    competitors,
    packaging,
    formulations,
    manufacturingSites,
    distributionChannels,

    setCompetitors,
    setPackaging,
    setFormulations,
    setManufacturingSites,
    setDistributionChannels,

    // Project setup state
    projectMetadata,
    productCategories,
    tags,
    libraryCalculations,

    // Product data setters
    setInputs,
    setOutcomes,
    setConstraints,
    setObjectives,
    setCombinations,
    setProjects,
    setIdeas,
    setSuppliers,

    setProjectMetadata,
    setProductCategories,
    setTags,
    setLibraryCalculations,

    // Project-specific setters
    setProjectInputs,
    setProjectOutcomes,
    setProjectConstraints,
    setProjectObjectives,
    setProjectCombinations,

    // Project-specific CRUD
    addProjectInput,
    removeProjectInput,
    addProjectOutcome,
    removeProjectOutcome,
    addProjectConstraint,
    removeProjectConstraint,
    addProjectObjective,
    removeProjectObjective,
    addProjectCombination,
    removeProjectCombination,

    // Product CRUD operations
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

    // Raw uploaded data
    uploadedData,
    setUploadedData,

    // Utility
    resetToDefaults,
    loadFullDemoMode,

    // Step status management
    stepStatuses,
    setStepStatus,

    // Goals & Claims data (flows to Constraints/Objectives pages)
    projectGoals,
    setProjectGoals,
    draftConstraints,
    setDraftConstraints,
    draftObjectives,
    setDraftObjectives,
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
