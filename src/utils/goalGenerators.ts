// Goal generators for auto-creating goals from getting-started operations
import { Goal, GoalItem } from '../contexts/DataContext';
import { Calculation } from '../data/demoLibrary';

// ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Library item interface for matching
interface LibraryItem {
  id: string;
  name: string;
  inputType?: string;  // 'Ingredient' | 'Processing' - used for filtering
  suggestedMin?: string;
  suggestedMax?: string;
}

// Substitute item from the library selection
interface SubstituteItem {
  id: string;
  name: string;
  inputType?: string;
  variableType?: string;
  description?: string;
  cost?: number | null;
}

// Result type for generateGoalsFromOperations
interface GenerateGoalsResult {
  goals: Goal[];
  calculations: Calculation[];
}

/**
 * Find a library match for a metric name
 * Normalizes underscores to spaces and does case-insensitive exact match
 */
function findLibraryMatch(
  metricName: string,
  library: LibraryItem[],
  libraryType: 'input' | 'outcome'
): { id: string; type: string } | null {
  // Normalize: replace underscores with spaces, lowercase
  const normalizedMetricName = metricName.replace(/_/g, ' ').toLowerCase();

  // Find exact case-insensitive match
  const match = library.find(item =>
    item.name.toLowerCase() === normalizedMetricName
  );

  if (match) {
    return {
      id: match.id,
      type: libraryType
    };
  }

  return null;
}

/**
 * Generate goals for ingredient substitution
 * Creates one goal per original ingredient being substituted with:
 * - An equality constraint setting the removed input to 0
 * - A choose 1-1 from Z constraint on the substitute combination
 */
interface SubstituteGoalParams {
  selectedIngredientsToSub: Record<string, boolean>;
  substituteSelections: Record<string, SubstituteItem[]>;
  inputLibrary: LibraryItem[];
}

interface SubstituteGoalsResult {
  goals: Goal[];
  calculations: Calculation[];
}

function generateSubstituteIngredientGoals(params: SubstituteGoalParams): SubstituteGoalsResult {
  const { selectedIngredientsToSub, substituteSelections, inputLibrary } = params;
  const goals: Goal[] = [];
  const calculations: Calculation[] = [];

  // Get all ingredients marked for substitution
  const ingredientsToSubstitute = Object.entries(selectedIngredientsToSub)
    .filter(([_, isSelected]) => isSelected)
    .map(([name]) => name);

  for (const ingredientName of ingredientsToSubstitute) {
    const displayName = ingredientName.replace(/_/g, ' ');
    const substitutes = substituteSelections[ingredientName] || [];

    // Skip if no substitutes selected for this ingredient
    if (substitutes.length === 0) continue;

    // 1. Create a Combination for the substitute options
    const combinationId = `combo-sub-${generateId()}`;
    const calculation: Calculation = {
      id: combinationId,
      name: `${displayName} Substitutes`,
      description: `Substitute options for ${displayName}`,
      terms: substitutes.map(sub => ({
        inputId: sub.id,
        inputName: sub.name,
        coefficient: 1,
      })),
    };
    calculations.push(calculation);

    // 2. Find original input's library reference
    const originalInputRef = findLibraryMatch(ingredientName, inputLibrary, 'input');

    // 3. Create Goal with TWO constraints
    const goal: Goal = {
      id: generateId(),
      name: `Substitute ${displayName} ingredient`,
      valueType: 'calculated',
      items: [
        // Constraint 1: Set removed ingredient to 0
        {
          id: generateId(),
          type: 'constraint',
          metricName: displayName,
          metricRef: originalInputRef,
          operator: 'equals',
          value1: '0',
          value2: '',
        },
        // Constraint 2: Choose exactly 1 substitute from combination
        {
          id: generateId(),
          type: 'constraint',
          metricName: `${displayName} Substitutes`,
          metricRef: { id: combinationId, type: 'combination' },
          operator: 'choose_x_y_of_z',
          value1: '1',
          value2: '1',
        },
      ],
      isCollapsed: false
    };

    goals.push(goal);
  }

  return { goals, calculations };
}

/**
 * Generate a goal for preserving label with tolerance constraints
 * Creates one constraint per input in the reference formula
 */
interface PreserveLabelGoalParams {
  referenceFormula: Record<string, any>;
  labelTolerance: string;
  inputColumns: string[];
  inputLibrary: LibraryItem[];
}

function generatePreserveLabelGoal(params: PreserveLabelGoalParams): Goal {
  const { referenceFormula, labelTolerance, inputColumns, inputLibrary } = params;
  const tolerancePercent = parseFloat(labelTolerance) || 5;

  const items: GoalItem[] = [];

  for (const inputName of inputColumns) {
    const currentValue = referenceFormula[inputName];
    if (currentValue === undefined || currentValue === null) continue;

    const numericValue = parseFloat(currentValue);
    if (isNaN(numericValue)) continue;

    // Look up input type from library - only constrain Ingredient types
    const normalizedName = inputName.replace(/_/g, ' ').toLowerCase();
    const libraryItem = inputLibrary.find(item =>
      item.name.toLowerCase() === normalizedName
    );

    // Skip non-ingredient inputs (e.g., Processing conditions)
    if (libraryItem?.inputType && libraryItem.inputType !== 'Ingredient') {
      continue;
    }

    // Calculate tolerance bounds
    const toleranceAmount = numericValue * (tolerancePercent / 100);
    const minValue = numericValue - toleranceAmount;
    const maxValue = numericValue + toleranceAmount;

    // Display name with spaces
    const displayName = inputName.replace(/_/g, ' ');

    // Try to find library match
    const metricRef = findLibraryMatch(inputName, inputLibrary, 'input');

    const constraint: GoalItem = {
      id: generateId(),
      type: 'constraint',
      metricName: displayName,
      metricRef: metricRef,
      operator: 'between',
      value1: minValue.toFixed(2),
      value2: maxValue.toFixed(2)
    };

    items.push(constraint);
  }

  return {
    id: generateId(),
    name: `Preserve label of formula ${referenceFormula.Formulation_ID}`,
    valueType: 'calculated',
    items: items,
    isCollapsed: false
  };
}

/**
 * Generate a goal for matching outcomes from a target formula
 * Creates one objective per outcome in the target formula
 */
interface MatchOutcomesGoalParams {
  targetFormula: Record<string, any>;
  outcomeColumns: string[];
  outcomeLibrary: LibraryItem[];
}

function generateMatchOutcomesGoal(params: MatchOutcomesGoalParams): Goal {
  const { targetFormula, outcomeColumns, outcomeLibrary } = params;

  const items: GoalItem[] = [];

  for (const outcomeName of outcomeColumns) {
    const targetValue = targetFormula[outcomeName];
    if (targetValue === undefined || targetValue === null) continue;

    // Display name with spaces
    const displayName = outcomeName.replace(/_/g, ' ');

    // Try to find library match
    const metricRef = findLibraryMatch(outcomeName, outcomeLibrary, 'outcome');

    const objective: GoalItem = {
      id: generateId(),
      type: 'objective',
      metricName: displayName,
      metricRef: metricRef,
      operator: 'approximately',
      value1: String(targetValue),
      value2: ''
    };

    items.push(objective);
  }

  return {
    id: generateId(),
    name: `Match Performance of Formula ${targetFormula.Formulation_ID}`,
    valueType: 'predicted',
    items: items,
    isCollapsed: false
  };
}

/**
 * Main function to generate all goals from getting-started operations
 */
interface GenerateGoalsParams {
  // Operations state
  substituteIngredient: boolean;
  selectedIngredientsToSub: Record<string, boolean>;
  substituteSelections: Record<string, SubstituteItem[]>;
  preserveLabel: boolean;
  referenceFormula: Record<string, any> | null;
  labelTolerance: string;
  matchOutcomes: boolean;
  targetFormula: Record<string, any> | null;

  // Column definitions
  inputColumns: string[];
  outcomeColumns: string[];

  // Libraries for matching
  inputLibrary: LibraryItem[];
  outcomeLibrary: LibraryItem[];
}

function generateGoalsFromOperations(params: GenerateGoalsParams): GenerateGoalsResult {
  const goals: Goal[] = [];
  const calculations: Calculation[] = [];

  // 1. Substitute Ingredient Goals
  if (params.substituteIngredient) {
    const hasSelectedIngredients = Object.values(params.selectedIngredientsToSub)
      .some(isSelected => isSelected);

    if (hasSelectedIngredients) {
      const result = generateSubstituteIngredientGoals({
        selectedIngredientsToSub: params.selectedIngredientsToSub,
        substituteSelections: params.substituteSelections,
        inputLibrary: params.inputLibrary
      });
      goals.push(...result.goals);
      calculations.push(...result.calculations);
    }
  }

  // 2. Preserve Label Goal
  if (params.preserveLabel && params.referenceFormula) {
    const preserveGoal = generatePreserveLabelGoal({
      referenceFormula: params.referenceFormula,
      labelTolerance: params.labelTolerance,
      inputColumns: params.inputColumns,
      inputLibrary: params.inputLibrary
    });
    goals.push(preserveGoal);
  }

  // 3. Match Outcomes Goal
  if (params.matchOutcomes && params.targetFormula) {
    const matchGoal = generateMatchOutcomesGoal({
      targetFormula: params.targetFormula,
      outcomeColumns: params.outcomeColumns,
      outcomeLibrary: params.outcomeLibrary
    });
    goals.push(matchGoal);
  }

  return { goals, calculations };
}

/**
 * Generate inputs from a reference formula
 * Creates one input per column in the reference formula
 * Uses preserve label tolerance for min/max values when applicable
 * Sets 0-0 range for inputs being substituted
 */
interface GenerateInputsParams {
  referenceFormula: Record<string, any>;
  inputColumns: string[];
  inputLibrary: LibraryItem[];
  preserveLabel: boolean;
  labelTolerance: string;
  substituteSelections?: Record<string, SubstituteItem[]>;
}

interface GeneratedInput {
  id: string;
  name: string;
  inputType: string;
  variableType: string;
  description: string;
  cost: number | null;
  minValue: string;
  maxValue: string;
  status: 'draft' | 'confirmed';
  source: string;
  levelsText: string;
  comment: string;
}

function generateInputsFromReferenceFormula(params: GenerateInputsParams): GeneratedInput[] {
  const { referenceFormula, inputColumns, inputLibrary, preserveLabel, labelTolerance, substituteSelections = {} } = params;
  const tolerancePercent = parseFloat(labelTolerance) || 5;
  const inputs: GeneratedInput[] = [];

  // Build set of ingredients being substituted (should have 0-0 range)
  const substitutedIngredients = new Set(
    Object.entries(substituteSelections)
      .filter(([_, subs]) => Array.isArray(subs) && subs.length > 0)
      .map(([name]) => name.toLowerCase().replace(/_/g, ' '))
  );

  for (const inputName of inputColumns) {
    const currentValue = referenceFormula[inputName];
    if (currentValue === undefined || currentValue === null) continue;

    const numericValue = parseFloat(currentValue);
    const displayName = inputName.replace(/_/g, ' ');

    // Find library match for metadata
    const libraryMatch = inputLibrary.find(item =>
      item.name.toLowerCase() === displayName.toLowerCase()
    );

    // Check if this input is being substituted
    const isSubstituted = substitutedIngredients.has(displayName.toLowerCase());

    // Calculate min/max based on preserve label tolerance (only for Ingredients)
    let minValue = '';
    let maxValue = '';
    const isIngredient = !libraryMatch?.inputType || libraryMatch.inputType === 'Ingredient';

    if (isSubstituted) {
      // Force 0-0 range for inputs being substituted
      minValue = '0';
      maxValue = '0';
    } else if (preserveLabel && !isNaN(numericValue) && isIngredient) {
      // Apply tolerance bounds only to Ingredients
      const toleranceAmount = numericValue * (tolerancePercent / 100);
      minValue = (numericValue - toleranceAmount).toFixed(2);
      maxValue = (numericValue + toleranceAmount).toFixed(2);
    } else if (libraryMatch?.suggestedMin && libraryMatch?.suggestedMax) {
      // Use library defaults for non-ingredients
      minValue = libraryMatch.suggestedMin;
      maxValue = libraryMatch.suggestedMax;
    }

    const input: GeneratedInput = {
      id: `ref-${generateId()}`,
      name: displayName,
      inputType: (libraryMatch as any)?.inputType || 'Ingredient',
      variableType: (libraryMatch as any)?.variableType || 'Continuous',
      description: (libraryMatch as any)?.description || `From reference formula ${referenceFormula.Formulation_ID}`,
      cost: (libraryMatch as any)?.cost || null,
      minValue: minValue,
      maxValue: maxValue,
      status: 'draft',
      source: 'Reference',
      levelsText: '',
      comment: '',
    };

    inputs.push(input);
  }

  // Add substitute inputs to the list with ranges from the library
  const existingNames = new Set(inputs.map(i => i.name.toLowerCase()));
  for (const [_, substitutes] of Object.entries(substituteSelections)) {
    if (!Array.isArray(substitutes) || substitutes.length === 0) continue;

    for (const sub of substitutes) {
      // Skip if already in the list
      if (existingNames.has(sub.name.toLowerCase())) continue;
      existingNames.add(sub.name.toLowerCase());

      // Look up the substitute in the input library for suggested ranges
      const libMatch = inputLibrary.find(item =>
        item.name.toLowerCase() === sub.name.toLowerCase()
      );

      const substituteInput: GeneratedInput = {
        id: `sub-${generateId()}`,
        name: sub.name,
        inputType: sub.inputType || 'Ingredient',
        variableType: sub.variableType || 'Continuous',
        description: sub.description || 'Substitute ingredient',
        cost: sub.cost || null,
        minValue: libMatch?.suggestedMin || '',
        maxValue: libMatch?.suggestedMax || '',
        status: 'draft',
        source: 'Substitute',
        levelsText: '',
        comment: '',
      };
      inputs.push(substituteInput);
    }
  }

  return inputs;
}

export {
  generateGoalsFromOperations,
  generateSubstituteIngredientGoals,
  generatePreserveLabelGoal,
  generateMatchOutcomesGoal,
  findLibraryMatch,
  generateInputsFromReferenceFormula
};

export type { GenerateGoalsResult };
