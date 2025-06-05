import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

// Each formula now has levels for each input ingredient, plus outcome values.
// We'll gather all possible inputs and outcomes from these formulas

type FormulaData = {
  id: number;
  name: string;
  inputs: Record<string, number>; // e.g. {"Ingredient 1": 10, "Ingredient 2": 5}
  outcomes: Record<string, number>; // e.g. {"Outcome 1": 3.14, "Outcome 2": 6.28}
};

// Example mock formulas
const mockFormulas: FormulaData[] = [
  {
    id: 1,
    name: "Formula A",
    inputs: {
      "Ingredient 1": 10,
      "Ingredient 2": 5,
      "Ingredient 3": 0.2,
      "Ingredient 4": 4.5,
      "Ingredient 5": 0,
      "Ingredient 6": 5.5
    },
    outcomes: {
      "Outcome 1": 1.1,
      "Outcome 2": 2.2,
      "Outcome 3": 4.2
    }
  },
  {
    id: 2,
    name: "Formula B",
    inputs: {
      "Ingredient 2": 3,
      "Ingredient 4": 8,
      "Ingredient 5": 2
    },
    outcomes: {
      "Outcome 3": 5.0,
      "Outcome 1": 0.5,
      "Outcome 2": 2.5
    }
  },
  {
    id: 3,
    name: "Formula C",
    inputs: {
      "Ingredient 1": 0,
      "Ingredient 4": 4,
      "Ingredient 6": 9
    },
    outcomes: {
      "Outcome 1": 1.5,
      "Outcome 2": 3.5,
      "Outcome 3": 10.1
    }
  }
];

// We'll also keep a separate list of all known ingredients, which can be expanded.
const mockIngredients = [
  "Ingredient 1",
  "Ingredient 2",
  "Ingredient 3",
  "Ingredient 4",
  "Ingredient 5",
  "Ingredient 6",
  "Ingredient 7",
  "Ingredient X"
];

// A helper to gather all distinct input ingredient names across formulas.
function getAllInputIngredients(formulas: FormulaData[]): string[] {
  const ingredientSet = new Set<string>();
  formulas.forEach((f) => {
    Object.keys(f.inputs).forEach((ing) => {
      ingredientSet.add(ing);
    });
  });
  return Array.from(ingredientSet);
}

// A helper to gather all distinct outcome names across formulas.
function getAllOutcomes(formulas: FormulaData[]): string[] {
  const outcomeSet = new Set<string>();
  formulas.forEach((f) => {
    Object.keys(f.outcomes).forEach((out) => {
      outcomeSet.add(out);
    });
  });
  return Array.from(outcomeSet);
}

// ProgressTracker: a simple overhead step indicator
const ProgressTracker = ({ currentStep }: { currentStep: number }) => {
  // Now 4 steps in total
  const steps = [
    "Select Formula",
    "Select Ingredient to Remove",
    "Select Substitutes",
    "Set Substitution Rules"
  ];

  return (
    <div className="w-full flex items-center justify-between mb-4">
      {steps.map((stepLabel, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;
        return (
          <div key={stepLabel} className="flex-1 flex items-center gap-2">
            <div
              className={
                "h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 transition-all" +
                (isActive
                  ? " bg-blue-500 text-white border-blue-500"
                  : isCompleted
                  ? " bg-green-500 text-white border-green-500"
                  : "")
              }
            >
              {isCompleted ? <Check size={16} /> : stepNumber}
            </div>
            <span className={isActive ? "font-semibold" : ""}>{stepLabel}</span>
          </div>
        );
      })}
    </div>
  );
};

const IngredientSubstitutionWorkflow = () => {
  // Steps in the mini-workflow
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: selected formula
  const [selectedFormula, setSelectedFormula] = useState<number | null>(null);

  // Step 2: which ingredient to remove
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);

  // Step 3: substitutes chosen
  const [substitutes, setSubstitutes] = useState<string[]>([]);

  // Searching for formulas in Step 1
  const [formulaSearch, setFormulaSearch] = useState("");

  // For searching in the list of possible substitutes
  const [searchTerm, setSearchTerm] = useState("");

  // For adding a new ingredient
  const [showAddNew, setShowAddNew] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");

  // Step 4: substitution constraints
  const [alwaysExcludeRemoved, setAlwaysExcludeRemoved] = useState(true);
  const [constraintMin, setConstraintMin] = useState(1);
  const [constraintMax, setConstraintMax] = useState(1);

  // Gather dynamic columns
  const allIngredients = getAllInputIngredients(mockFormulas);
  const allOutcomes = getAllOutcomes(mockFormulas);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      alert(
        `Finalizing selection:\nFormula: ${selectedFormula}\nRemoved Ingredient: ${selectedIngredient}\nSubstitutes: ${substitutes.join(", ")}\nAlways Exclude Removed? ${alwaysExcludeRemoved}\nMin: ${constraintMin}\nMax: ${constraintMax}`
      );
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateNewFormula = () => {
    // logic for adding a new formula
    alert("Create new formula");
  };

  const handleSelectFormula = (formulaId: number) => {
    setSelectedFormula(formulaId);
    setSelectedIngredient(null);
    setSubstitutes([]);
  };

  const handleSelectIngredient = (ingredient: string) => {
    setSelectedIngredient(ingredient);
  };

  const handleToggleSubstitute = (ingredient: string) => {
    if (substitutes.includes(ingredient)) {
      setSubstitutes(substitutes.filter((sub) => sub !== ingredient));
    } else {
      setSubstitutes([...substitutes, ingredient]);
    }
  };

  const handleAddNewIngredient = () => {
    if (newIngredient.trim()) {
      mockIngredients.push(newIngredient.trim());
      setSubstitutes([...substitutes, newIngredient.trim()]);
      setNewIngredient("");
      setShowAddNew(false);
    }
  };

  // Filter the known ingredients by search for Step 3
  const filteredIngredients = mockIngredients.filter((ing) =>
    ing.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter the formulas by name, or if the search text is found in input or outcome keys
  const filteredFormulas = mockFormulas.filter((formula) => {
    const lowerSearch = formulaSearch.toLowerCase();
    const nameMatches = formula.name.toLowerCase().includes(lowerSearch);
    const anyInputMatches = Object.keys(formula.inputs).some((ing) =>
      ing.toLowerCase().includes(lowerSearch)
    );
    const anyOutcomeMatches = Object.keys(formula.outcomes).some((out) =>
      out.toLowerCase().includes(lowerSearch)
    );
    return nameMatches || anyInputMatches || anyOutcomeMatches;
  });

  // Step 1: Table with each input/outcome as a column, plus a red 'add new' button,
  // a formula search, and the radio button at the LEFT so it’s not scrolled off.
  const renderStep1 = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg p-4 mb-4">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Existing Formula</h2>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                size="icon"
                onClick={handleCreateNewFormula}
              >
                +
              </Button>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Input
                placeholder="Search formulas..."
                value={formulaSearch}
                onChange={(e) => setFormulaSearch(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Select</th>
                    <th className="p-2 border">Name</th>
                    {allIngredients.map((ing) => (
                      <th key={ing} className="p-2 border">
                        {ing}
                      </th>
                    ))}
                    {allOutcomes.map((out) => (
                      <th key={out} className="p-2 border">
                        {out}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredFormulas.map((formula) => {
                    return (
                      <tr key={formula.id} className="hover:bg-gray-50">
                        <td className="p-2 border text-center">
                          <input
                            type="radio"
                            name="formulaSelect"
                            checked={selectedFormula === formula.id}
                            onChange={() => handleSelectFormula(formula.id)}
                          />
                        </td>
                        <td className="p-2 border">{formula.name}</td>
                        {allIngredients.map((ing) => {
                          const level = formula.inputs[ing] || 0;
                          return (
                            <td key={ing} className="p-2 border">
                              {level}
                            </td>
                          );
                        })}
                        {allOutcomes.map((out) => {
                          const val = formula.outcomes[out] || 0;
                          return (
                            <td key={out} className="p-2 border">
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between mt-4">
          <div>
            Selected: {selectedFormula ? `Formula ${selectedFormula}` : "None"}
          </div>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={!selectedFormula}
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      </motion.div>
    );
  };

  // Step 2: pick an ingredient to remove from the selected formula (non-zero)
  const renderStep2 = () => {
    const formula = mockFormulas.find((f) => f.id === selectedFormula);
    if (!formula) {
      return null;
    }

    const availableIngredients = Object.entries(formula.inputs)
      .filter(([_, lvl]) => lvl > 0)
      .map(([ing]) => ing);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg p-4 mb-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Select Ingredient to Remove</h2>
            <ul className="space-y-2">
              {availableIngredients.map((ingredient) => (
                <li key={ingredient} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="ingredientSelect"
                    checked={selectedIngredient === ingredient}
                    onChange={() => handleSelectIngredient(ingredient)}
                  />
                  <label>{ingredient}</label>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={handlePrevious}>
            Back
          </Button>
          <div>Selected: {selectedIngredient || "None"}</div>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={!selectedIngredient}
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      </motion.div>
    );
  };

  // Step 3: choose new ingredients from a searchable list (multi-select), add new button is red
  const renderStep3 = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg p-4 mb-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Select Substitutes</h2>
            <div className="mb-4 flex items-center gap-2">
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => setShowAddNew(true)}
              >
                Add New Ingredient
              </Button>
            </div>

            {showAddNew && (
              <div className="mb-4 flex flex-col gap-2 p-2 border rounded-md">
                <Input
                  placeholder="New ingredient name"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleAddNewIngredient}
                  >
                    Confirm
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddNew(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <ul className="space-y-2 max-h-48 overflow-auto">
              {filteredIngredients.map((ingredient) => {
                const isSelected = substitutes.includes(ingredient);
                return (
                  <li key={ingredient} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSubstitute(ingredient)}
                    />
                    <label>{ingredient}</label>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={handlePrevious}>
            Back
          </Button>
          <div>
            Selected: {substitutes.length > 0 ? substitutes.join(", ") : "None"}
          </div>
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleNext}>
            Next
          </Button>
        </div>
      </motion.div>
    );
  };

  // Step 4: Set Substitution Rules
  const renderStep4 = () => {
    // max can be up to substitutes.length + 1 (for original ingredient)
    const maxAllowed = substitutes.length + 1;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg p-4 mb-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Set Substitution Rules</h2>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="exclude-removed"
                checked={alwaysExcludeRemoved}
                onChange={() => setAlwaysExcludeRemoved(!alwaysExcludeRemoved)}
              />
              <label htmlFor="exclude-removed" className="ml-2">
                Always Exclude {selectedIngredient || "(none)"}
              </label>
            </div>
            <div className="flex gap-4 items-center">
              <div>
                <label className="block mb-1">Minimum # of Substitutes</label>
                <Input
                  type="number"
                  value={constraintMin}
                  min={0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setConstraintMin(val);
                  }}
                  className="w-24"
                />
              </div>
              <div>
                <label className="block mb-1">Maximum # of Substitutes</label>
                <Input
                  type="number"
                  value={constraintMax}
                  min={1}
                  max={maxAllowed}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (val <= maxAllowed) {
                      setConstraintMax(val);
                    }
                  }}
                  className="w-24"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={handlePrevious}>
            Back
          </Button>
          <div>
            Min: {constraintMin}, Max: {constraintMax}
          </div>
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleNext}>
            Finish
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <ProgressTracker currentStep={currentStep} />
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </div>
  );
};

export default IngredientSubstitutionWorkflow;
