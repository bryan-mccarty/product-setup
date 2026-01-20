// Centralized Demo Library
// Single source of truth for all demo data

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Input {
  id: string;
  name: string;
  inputType: string;
  variableType: string;
  description: string;
  cost?: number | null;
  isDefault?: boolean;
  levels?: string[];
  suggestedMin?: string;
  suggestedMax?: string;
  // Project-specific fields (for user-configured inputs)
  minValue?: string;
  maxValue?: string;
  levelsText?: string;
  status?: 'draft' | 'confirmed';
  comment?: string;
  source?: 'Product' | 'Library' | string;
}

export interface Outcome {
  id: string;
  name: string;
  outcomeType: string;
  variableType: string;
  description: string;
  isDefault?: boolean;
  limits?: string;
  levels?: string[];
}

export interface Constraint {
  id: string;
  targetName: string;
  constraintType: string;
  value1: string;
  value2?: string;
  tags: string[];
}

export interface Objective {
  id: string;
  targetName: string;
  objectiveType: string;
  value1: string;
  value2?: string;
  successCriteria: string;
  // Fields for prioritization screen:
  priority?: number;
  weight?: number;
  chips?: number;
  isPrerequisite?: boolean;
  dependsOn?: string[];
  tags?: string[];
}

export interface Calculation {
  id: string;
  name: string;
  description: string;
  // For user-created (linear calculations):
  terms?: Array<{
    inputId: string;
    inputName: string;
    coefficient: number;
  }>;
  // For library items:
  formula?: string;
  unit?: string;
}

export interface Project {
  id: string;
  name: string;
  roundsCompleted: number;
  owner: string;
  dateModified: string;
  starred: boolean;
  status: {
    current: number;
    projectedMean: number;
    projectedStd: number;
  };
}

export interface Idea {
  id: string;
  name: string;
  fidelity: number;
  source: string;
  dateModified: string;
  starred: boolean;
  status: {
    current: number;
    projectedMean: number;
    projectedStd: number;
  };
}

export interface Supplier {
  id: string;
  name: string;
  suppliesInputIds: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  category?: 'constraint' | 'objective' | 'general';
}

// Project metadata for setup flow
export interface ProjectMetadata {
  id: string;
  name: string;
  category: string;
  projectType?: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  // Formula references from getting-started
  referenceFormula?: Record<string, any>;
  targetFormula?: Record<string, any>;
  preserveLabel?: boolean;
  labelTolerance?: string;
  matchOutcomes?: boolean;
  substituteSelections?: Record<string, any[]>;
  inputColumns?: string[];
}

// Product category definition
export interface ProductCategory {
  value: string;
  label: string;
}

// ============================================================================
// INPUT LIBRARY (15 items)
// ============================================================================

export const INPUT_LIBRARY: Input[] = [
  { id: 'lib-1', name: 'Flour', inputType: 'Ingredient', variableType: 'Continuous', description: 'Base flour amount', cost: 0.42, suggestedMin: '20', suggestedMax: '40' },
  { id: 'lib-2', name: 'Sugar', inputType: 'Ingredient', variableType: 'Continuous', description: 'Granulated sugar', cost: 0.68, suggestedMin: '15', suggestedMax: '30' },
  { id: 'lib-3', name: 'Butter', inputType: 'Ingredient', variableType: 'Continuous', description: 'Unsalted butter', cost: 1.85, suggestedMin: '10', suggestedMax: '25' },
  { id: 'lib-4', name: 'Eggs', inputType: 'Ingredient', variableType: 'Continuous', description: 'Whole eggs', cost: 0.35, suggestedMin: '5', suggestedMax: '15' },
  { id: 'lib-5', name: 'Vanilla Extract', inputType: 'Ingredient', variableType: 'Continuous', description: 'Pure vanilla', cost: 4.20, suggestedMin: '0.5', suggestedMax: '2' },
  { id: 'lib-6', name: 'Cocoa Powder', inputType: 'Ingredient', variableType: 'Continuous', description: 'Dutch-process cocoa', cost: 2.15, suggestedMin: '8', suggestedMax: '18' },
  { id: 'lib-7', name: 'Baking Temperature', inputType: 'Processing', variableType: 'Continuous', description: 'Oven temp in °F', suggestedMin: '325', suggestedMax: '375' },
  { id: 'lib-8', name: 'Mixing Duration', inputType: 'Processing', variableType: 'Continuous', description: 'Total mix time in minutes', suggestedMin: '3', suggestedMax: '10' },
  { id: 'lib-9', name: 'Mixer Speed', inputType: 'Processing', variableType: 'Ordinal', description: 'Speed setting', levels: ['Low', 'Medium', 'High'] },
  { id: 'lib-10', name: 'Bake Time', inputType: 'Processing', variableType: 'Continuous', description: 'Duration in minutes', suggestedMin: '25', suggestedMax: '35' },
  { id: 'lib-11', name: 'Cooling Method', inputType: 'Processing', variableType: 'Nominal', description: 'Post-bake cooling', levels: ['Room Temp', 'Refrigerated', 'Flash Cool'] },
  { id: 'lib-12', name: 'Milk', inputType: 'Ingredient', variableType: 'Continuous', description: 'Whole milk', cost: 0.52, suggestedMin: '5', suggestedMax: '20' },
  { id: 'lib-13', name: 'Salt', inputType: 'Ingredient', variableType: 'Continuous', description: 'Fine sea salt', cost: 0.15, suggestedMin: '0', suggestedMax: '3' },
  { id: 'lib-14', name: 'Proofing Time', inputType: 'Processing', variableType: 'Continuous', description: 'Dough rest duration', suggestedMin: '30', suggestedMax: '120' },
  { id: 'lib-15', name: 'Humidity Level', inputType: 'Processing', variableType: 'Ordinal', description: 'Environment humidity', levels: ['Low', 'Medium', 'High'] },
];

// ============================================================================
// OUTCOME LIBRARY (20 items)
// ============================================================================

export const OUTCOME_LIBRARY: Outcome[] = [
  // Analytical (lab measurements - typically continuous)
  { id: 'lib-1', name: 'Moisture Content', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Water activity level (%)', limits: '2-8' },
  { id: 'lib-2', name: 'pH Level', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Acidity measurement', limits: '4.0-7.0' },
  { id: 'lib-3', name: 'Viscosity', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Flow resistance (cP)', limits: '100-5000' },
  { id: 'lib-4', name: 'Texture Firmness', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Force measurement (N)', limits: '5-50' },
  { id: 'lib-5', name: 'Color L*', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Lightness value', limits: '20-80' },
  { id: 'lib-6', name: 'Particle Size', outcomeType: 'Analytical', variableType: 'Continuous', description: 'Average diameter (μm)', limits: '10-500' },

  // Sensory (panel evaluations - can be ordinal or continuous)
  { id: 'lib-7', name: 'Overall Liking', outcomeType: 'Sensory', variableType: 'Ordinal', description: '9-point hedonic scale', levels: ['Dislike Extremely', 'Dislike Very Much', 'Dislike Moderately', 'Dislike Slightly', 'Neither', 'Like Slightly', 'Like Moderately', 'Like Very Much', 'Like Extremely'] },
  { id: 'lib-8', name: 'Sweetness Intensity', outcomeType: 'Sensory', variableType: 'Continuous', description: 'Line scale 0-100', limits: '0-100' },
  { id: 'lib-9', name: 'Crunchiness', outcomeType: 'Sensory', variableType: 'Ordinal', description: 'Texture rating', levels: ['Not Crunchy', 'Slightly Crunchy', 'Moderately Crunchy', 'Very Crunchy', 'Extremely Crunchy'] },
  { id: 'lib-10', name: 'Flavor Intensity', outcomeType: 'Sensory', variableType: 'Continuous', description: 'Intensity scale 0-15', limits: '0-15' },
  { id: 'lib-11', name: 'Aroma Quality', outcomeType: 'Sensory', variableType: 'Ordinal', description: 'Quality rating', levels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] },
  { id: 'lib-12', name: 'Mouthfeel', outcomeType: 'Sensory', variableType: 'Nominal', description: 'Texture descriptor', levels: ['Smooth', 'Grainy', 'Creamy', 'Waxy', 'Chalky'] },

  // Consumer (market research - various types)
  { id: 'lib-13', name: 'Purchase Intent', outcomeType: 'Consumer', variableType: 'Ordinal', description: 'Likelihood to buy', levels: ['Definitely Would Not', 'Probably Would Not', 'Might/Might Not', 'Probably Would', 'Definitely Would'] },
  { id: 'lib-14', name: 'Value Perception', outcomeType: 'Consumer', variableType: 'Ordinal', description: 'Price-value rating', levels: ['Very Poor Value', 'Poor Value', 'Fair Value', 'Good Value', 'Excellent Value'] },
  { id: 'lib-15', name: 'Brand Fit', outcomeType: 'Consumer', variableType: 'Continuous', description: 'Fit score 1-10', limits: '1-10' },
  { id: 'lib-16', name: 'Repeat Purchase', outcomeType: 'Consumer', variableType: 'Nominal', description: 'Would buy again', levels: ['Yes', 'No', 'Unsure'] },
  { id: 'lib-17', name: 'NPS Score', outcomeType: 'Consumer', variableType: 'Continuous', description: 'Net Promoter Score', limits: '-100-100' },

  // Other
  { id: 'lib-18', name: 'Shelf Life', outcomeType: 'Other', variableType: 'Continuous', description: 'Days until expiration', limits: '7-365' },
  { id: 'lib-19', name: 'Production Yield', outcomeType: 'Other', variableType: 'Continuous', description: 'Output percentage', limits: '80-100' },
  { id: 'lib-20', name: 'Quality Grade', outcomeType: 'Other', variableType: 'Ordinal', description: 'Final product grade', levels: ['Reject', 'C-Grade', 'B-Grade', 'A-Grade', 'Premium'] },
];

// ============================================================================
// DEFAULT PROJECTS (6 items)
// ============================================================================

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'KCHP', name: 'Summer Launch Optimization', roundsCompleted: 4, owner: 'Sarah Chen', dateModified: '2025-01-15T14:30:00', starred: true, status: { current: 72, projectedMean: 81, projectedStd: 8 } },
  { id: 'BRWN', name: 'Fudge Brownie Reformulation', roundsCompleted: 7, owner: 'Marcus Johnson', dateModified: '2025-01-14T09:15:00', starred: true, status: { current: 85, projectedMean: 89, projectedStd: 4 } },
  { id: 'CKCH', name: 'Chocolate Chip - Cost Reduction', roundsCompleted: 2, owner: 'Emily Rodriguez', dateModified: '2025-01-13T16:45:00', starred: false, status: { current: 45, projectedMean: 62, projectedStd: 14 } },
  { id: 'VNLA', name: 'Vanilla Extract Substitution', roundsCompleted: 0, owner: 'Sarah Chen', dateModified: '2025-01-12T11:00:00', starred: false, status: { current: 0, projectedMean: 0, projectedStd: 0 } },
  { id: 'CRML', name: 'Caramel Swirl Integration', roundsCompleted: 5, owner: 'Alex Kim', dateModified: '2025-01-10T13:20:00', starred: false, status: { current: 68, projectedMean: 75, projectedStd: 6 } },
  { id: 'NTBR', name: 'Nut-Free Alternative', roundsCompleted: 3, owner: 'Jordan Taylor', dateModified: '2025-01-09T08:30:00', starred: false, status: { current: 52, projectedMean: 71, projectedStd: 12 } },
];

// ============================================================================
// DEFAULT IDEAS (4 items)
// ============================================================================

export const DEFAULT_IDEAS: Idea[] = [
  { id: 'IDEA', name: 'Reduced Sugar Formula Exploration', fidelity: 78, source: 'Luna AI', dateModified: '2025-01-15T10:00:00', starred: true, status: { current: 42, projectedMean: 65, projectedStd: 12 } },
  { id: 'IDBX', name: 'Gluten-Free Base Investigation', fidelity: 45, source: 'Emily Rodriguez', dateModified: '2025-01-14T16:20:00', starred: false, status: { current: 0, projectedMean: 55, projectedStd: 22 } },
  { id: 'IDCF', name: 'Plant-Based Butter Alternative', fidelity: 62, source: 'Marcus Johnson', dateModified: '2025-01-13T11:45:00', starred: false, status: { current: 38, projectedMean: 58, projectedStd: 15 } },
  { id: 'IDDM', name: 'High-Protein Brownie Concept', fidelity: 34, source: 'Luna AI', dateModified: '2025-01-12T09:30:00', starred: false, status: { current: 0, projectedMean: 48, projectedStd: 25 } },
];

// ============================================================================
// DEFAULT SUPPLIERS (4 items)
// ============================================================================

export const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 'supplier-1', name: 'Acme Flour Co.', suppliesInputIds: ['input-1'] },
  { id: 'supplier-2', name: 'Sweet Sugar Inc.', suppliesInputIds: ['input-2'] },
  { id: 'supplier-3', name: 'Dairy Best', suppliesInputIds: ['input-3'] },
  { id: 'supplier-4', name: 'Global Ingredients', suppliesInputIds: ['input-5', 'input-6'] },
];

// ============================================================================
// TAG LIBRARIES
// ============================================================================

export const CONSTRAINT_TAGS: Tag[] = [
  { id: 'ctag-1', name: 'Regulatory', color: '#EF4444', category: 'constraint' },
  { id: 'ctag-2', name: 'Cost Control', color: '#22C55E', category: 'constraint' },
  { id: 'ctag-3', name: 'Quality', color: '#3B82F6', category: 'constraint' },
  { id: 'ctag-4', name: 'Safety', color: '#F59E0B', category: 'constraint' },
  { id: 'ctag-5', name: 'Nutrition', color: '#A78BFA', category: 'constraint' },
];

export const OBJECTIVE_TAGS: Tag[] = [
  { id: 'otag-1', name: 'Default', color: '#60A5FA', category: 'objective' },
  { id: 'otag-2', name: 'Primary', color: '#60A5FA', category: 'objective' },
  { id: 'otag-3', name: 'Secondary', color: '#A78BFA', category: 'objective' },
  { id: 'otag-4', name: 'Consumer Focus', color: '#F472B6', category: 'objective' },
  { id: 'otag-5', name: 'Cost Reduction', color: '#22C55E', category: 'objective' },
];

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = [
  { value: 'ketchup', label: 'Ketchup' },
  { value: 'brownie_mix', label: 'Brownie Mix' },
  { value: 'orange_juice', label: 'Orange Juice' },
  { value: 'greek_yogurt', label: 'Greek Yogurt' },
  { value: 'potato_chips', label: 'Potato Chips' },
  { value: 'mayonnaise', label: 'Mayonnaise' },
  { value: 'granola_bar', label: 'Granola Bar' },
  { value: 'salad_dressing', label: 'Salad Dressing' },
];

// ============================================================================
// CALCULATIONS LIBRARY
// ============================================================================

export const CALCULATIONS_LIBRARY: Calculation[] = [
  { id: 'calc-1', name: 'Total Cost', description: 'Sum of all ingredient costs', formula: 'sum(ingredient_costs)', unit: '$' },
  { id: 'calc-2', name: 'Sugar Percentage', description: 'Sugar as % of total weight', formula: '(sugar / total_weight) * 100', unit: '%' },
  { id: 'calc-3', name: 'Fat Content', description: 'Total fat from all sources', formula: 'sum(fat_sources)', unit: 'g' },
  { id: 'calc-4', name: 'Calorie Count', description: 'Estimated total calories', formula: '(protein*4 + carbs*4 + fat*9)', unit: 'kcal' },
  { id: 'calc-5', name: 'Cost per Serving', description: 'Total cost divided by servings', formula: 'total_cost / servings', unit: '$/serving' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default inputs for initial pre-population (first 10 from library)
 */
export function getDefaultInputs(): Input[] {
  return INPUT_LIBRARY.slice(0, 10).map(input => ({
    ...input,
    id: `input-${input.id.replace('lib-', '')}`,
    isDefault: true,
  }));
}

/**
 * Get default outcomes for initial pre-population (first 8 from library)
 */
export function getDefaultOutcomes(): Outcome[] {
  return OUTCOME_LIBRARY.slice(0, 8).map((outcome, index) => ({
    ...outcome,
    id: `outcome-${index + 1}`,
    isDefault: true,
  }));
}
