// Goal generators for auto-creating goals from getting-started operations
import { Goal, GoalItem } from '../contexts/DataContext';

// ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Library item interface for matching
interface LibraryItem {
  id: string;
  name: string;
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
 * Creates one goal per original ingredient being substituted
 */
interface SubstituteGoalParams {
  selectedIngredientsToSub: Record<string, boolean>;
  inputLibrary: LibraryItem[];
}

function generateSubstituteIngredientGoals(params: SubstituteGoalParams): Goal[] {
  const { selectedIngredientsToSub } = params;
  const goals: Goal[] = [];

  // Get all ingredients marked for substitution
  const ingredientsToSubstitute = Object.entries(selectedIngredientsToSub)
    .filter(([_, isSelected]) => isSelected)
    .map(([name]) => name);

  for (const ingredientName of ingredientsToSubstitute) {
    const displayName = ingredientName.replace(/_/g, ' ');

    const goal: Goal = {
      id: generateId(),
      name: `Substitute ${displayName} ingredient`,
      valueType: 'calculated',
      items: [],
      isCollapsed: false
    };

    goals.push(goal);
  }

  return goals;
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

function generateGoalsFromOperations(params: GenerateGoalsParams): Goal[] {
  const goals: Goal[] = [];

  // 1. Substitute Ingredient Goals
  if (params.substituteIngredient) {
    const hasSelectedIngredients = Object.values(params.selectedIngredientsToSub)
      .some(isSelected => isSelected);

    if (hasSelectedIngredients) {
      const substituteGoals = generateSubstituteIngredientGoals({
        selectedIngredientsToSub: params.selectedIngredientsToSub,
        inputLibrary: params.inputLibrary
      });
      goals.push(...substituteGoals);
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

  return goals;
}

/**
 * Generate inputs from a reference formula
 * Creates one input per column in the reference formula
 * Uses preserve label tolerance for min/max values when applicable
 */
interface GenerateInputsParams {
  referenceFormula: Record<string, any>;
  inputColumns: string[];
  inputLibrary: LibraryItem[];
  preserveLabel: boolean;
  labelTolerance: string;
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
  const { referenceFormula, inputColumns, inputLibrary, preserveLabel, labelTolerance } = params;
  const tolerancePercent = parseFloat(labelTolerance) || 5;
  const inputs: GeneratedInput[] = [];

  for (const inputName of inputColumns) {
    const currentValue = referenceFormula[inputName];
    if (currentValue === undefined || currentValue === null) continue;

    const numericValue = parseFloat(currentValue);
    const displayName = inputName.replace(/_/g, ' ');

    // Find library match for metadata
    const libraryMatch = inputLibrary.find(item =>
      item.name.toLowerCase() === displayName.toLowerCase()
    );

    // Calculate min/max based on preserve label tolerance
    let minValue = '';
    let maxValue = '';
    if (preserveLabel && !isNaN(numericValue)) {
      const toleranceAmount = numericValue * (tolerancePercent / 100);
      minValue = (numericValue - toleranceAmount).toFixed(2);
      maxValue = (numericValue + toleranceAmount).toFixed(2);
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
