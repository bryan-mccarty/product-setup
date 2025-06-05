import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

type FormulaData = {
  id: number;
  name: string;
  inputs: Record<string, number>;
  outcomes: Record<string, number>;
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
      "Ingredient 6": 5.5,
    },
    outcomes: {
      "Outcome 1": 1.1,
      "Outcome 2": 2.2,
      "Outcome 3": 4.2,
    },
  },
  {
    id: 2,
    name: "Formula B",
    inputs: {
      "Ingredient 2": 3,
      "Ingredient 4": 8,
      "Ingredient 5": 2,
    },
    outcomes: {
      "Outcome 1": 0.5,
      "Outcome 2": 2.5,
      "Outcome 3": 5.0,
    },
  },
  {
    id: 3,
    name: "Formula C",
    inputs: {
      "Ingredient 1": 0,
      "Ingredient 4": 4,
      "Ingredient 6": 9,
    },
    outcomes: {
      "Outcome 1": 1.5,
      "Outcome 2": 3.5,
      "Outcome 3": 10.1,
    },
  },
];

function getAllInputIngredients(formulas: FormulaData[]): string[] {
  const set = new Set<string>();
  formulas.forEach((f) => {
    Object.keys(f.inputs).forEach((i) => set.add(i));
  });
  return Array.from(set);
}

function getAllOutcomes(formulas: FormulaData[]): string[] {
  const set = new Set<string>();
  formulas.forEach((f) => {
    Object.keys(f.outcomes).forEach((o) => set.add(o));
  });
  return Array.from(set);
}

// The step labels
const steps = [
  "Pick Formula",
  "Select Ingredients to Vary (± %)",
  "Pick Goal-Setting Approach",
];

const ProgressTracker = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="flex justify-center space-x-6 mb-4">
      {steps.map((label, idx) => {
        const stepNumber = idx + 1;
        const isActive = currentStep === stepNumber;
        const isDone = currentStep > stepNumber;

        return (
          <div key={label} className="flex items-center space-x-2">
            <div
              className={
                "h-8 w-8 flex items-center justify-center rounded-full border-2" +
                (isDone
                  ? " border-green-500 bg-green-500 text-white"
                  : isActive
                  ? " border-blue-500 bg-blue-500 text-white"
                  : " border-gray-300 bg-white text-gray-600")
              }
            >
              {isDone ? <Check size={16} /> : stepNumber}
            </div>
            <span
              className={
                (isDone || isActive ? "font-semibold " : "") + "text-sm"
              }
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function PreserveFormulaWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1
  const [formulaSearch, setFormulaSearch] = useState("");
  const [selectedFormulaId, setSelectedFormulaId] = useState<number | null>(
    null
  );

  // Step 2
  const [varyingIngredients, setVaryingIngredients] = useState<
    { name: string; pctRange: number }[]
  >([]);
  
  // New global percentage for all ingredients
  const [globalPctRange, setGlobalPctRange] = useState(5);

  // Step 3
  const [goalOption, setGoalOption] = useState<string | null>(null);

  const filteredFormulas = mockFormulas.filter((f) => {
    const lower = formulaSearch.toLowerCase();
    return (
      f.name.toLowerCase().includes(lower) ||
      Object.keys(f.inputs).some((i) => i.toLowerCase().includes(lower)) ||
      Object.keys(f.outcomes).some((o) => o.toLowerCase().includes(lower))
    );
  });

  // Initialize with selected formula's non-zero ingredients
  useEffect(() => {
    if (selectedFormulaId) {
      const formula = mockFormulas.find((f) => f.id === selectedFormulaId);
      if (formula) {
        // Add all non-zero ingredients with the default global percentage
        const nonZeroIngredients = Object.entries(formula.inputs)
          .filter(([_, value]) => value > 0)
          .map(([name]) => ({ name, pctRange: globalPctRange }));
        
        setVaryingIngredients(nonZeroIngredients);
      }
    }
  }, [selectedFormulaId]);

  // Navigation
  function handleNext() {
    if (currentStep >= steps.length) {
      // Confirm or finalize
      alert(
        `Finalizing:\nFormula: ${selectedFormulaId}\nIngredients to vary: ${JSON.stringify(
          varyingIngredients,
          null,
          2
        )}\nGoal: ${goalOption}`
      );
      return;
    }
    setCurrentStep(currentStep + 1);
  }

  function handleBack() {
    setCurrentStep(Math.max(1, currentStep - 1));
  }

  function handleCreateNewFormula() {
    alert("Create new formula flow");
  }

  function handleToggleIngredient(name: string) {
    setVaryingIngredients((prev) => {
      const existing = prev.find((p) => p.name === name);
      if (existing) {
        // Uncheck it
        return prev.filter((p) => p.name !== name);
      } else {
        // Add with global percentage
        return [...prev, { name, pctRange: globalPctRange }];
      }
    });
  }

  function handleChangePct(name: string, newPct: number) {
    setVaryingIngredients((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, pctRange: newPct } : item
      )
    );
  }

  // Update all currently selected ingredients when global percentage changes
  useEffect(() => {
    setVaryingIngredients(prev => 
      prev.map(item => ({ ...item, pctRange: globalPctRange }))
    );
  }, [globalPctRange]);

  // Render steps

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Step 1: Pick Formula</h2>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleCreateNewFormula}
            >
              New Formula
            </Button>
          </div>
          <Input
            placeholder="Search formulas..."
            value={formulaSearch}
            onChange={(e) => setFormulaSearch(e.target.value)}
            className="mb-3"
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Select</th>
                  <th className="p-2 border">Name</th>
                  {getAllInputIngredients(mockFormulas).map((ing) => (
                    <th key={ing} className="p-2 border">
                      {ing}
                    </th>
                  ))}
                  {getAllOutcomes(mockFormulas).map((out) => (
                    <th key={out} className="p-2 border">
                      {out}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFormulas.map((formula) => (
                  <tr
                    key={formula.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-2 border text-center">
                      <input
                        type="radio"
                        name="formulaSelect"
                        onChange={() => setSelectedFormulaId(formula.id)}
                        checked={selectedFormulaId === formula.id}
                      />
                    </td>
                    <td className="p-2 border">{formula.name}</td>
                    {getAllInputIngredients(mockFormulas).map((ing) => (
                      <td key={ing} className="p-2 border text-center">
                        {formula.inputs[ing] ?? 0}
                      </td>
                    ))}
                    {getAllOutcomes(mockFormulas).map((out) => (
                      <td key={out} className="p-2 border text-center">
                        {formula.outcomes[out] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          Selected Formula:{" "}
          {selectedFormulaId ? `Formula #${selectedFormulaId}` : "None"}
        </div>
        <Button
          disabled={!selectedFormulaId}
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => {
    const formula = mockFormulas.find((f) => f.id === selectedFormulaId);
    if (!formula) return null;
  
    // Get only non-zero ingredients in this formula
    const nonZeroIngredients = Object.entries(formula.inputs)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  
    return (
      <motion.div
        key="step2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg mb-4">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">
              Step 2: Select Ingredient(s) to Vary (± x%)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Any ingredient not selected will be locked at its current value.
            </p>

            {/* Global percentage editor */}
            <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Set all variations to</span>
              <div className="flex items-center">
                <span>±</span>
                <Input
                  type="number"
                  className="w-16 mx-1"
                  value={globalPctRange}
                  onChange={(e) => setGlobalPctRange(Number(e.target.value))}
                />
                <span>%</span>
              </div>
            </div>
  
            <ul className="space-y-3">
              {nonZeroIngredients.map(({ name, value }) => {
                const found = varyingIngredients.find((item) => item.name === name);
  
                return (
                  <li key={name} className="flex items-center space-x-3">
                    {/* Checkbox to toggle "vary this ingredient" */}
                    <input
                      type="checkbox"
                      checked={!!found}
                      onChange={() => handleToggleIngredient(name)}
                      className="h-4 w-4"
                    />
  
                    {/* Ingredient name */}
                    <span className="text-sm font-medium">{name}</span>
  
                    {/* Show the base level and ± input side by side */}
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <span>{value}</span>
                      <span>±</span>
                      {found ? (
                        <>
                          <Input
                            type="number"
                            className="w-16"
                            value={found.pctRange}
                            onChange={(e) =>
                              handleChangePct(name, Number(e.target.value))
                            }
                          />
                          <span>%</span>
                        </>
                      ) : (
                        // If not varying, just show "± --%" in a muted style
                        <span className="opacity-50">--%</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
  
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={handleNext}
          >
            Confirm &amp; Next
          </Button>
        </div>
      </motion.div>
    );
  };
  

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg mb-4">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Step 3: Pick GoalApproach</h2>
          <div className="flex flex-col space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={goalOption === "passFail"}
                onChange={() => setGoalOption("passFail")}
              />
              <span className="text-sm">Pass/Fail similarity score</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={goalOption === "reduceCost"}
                onChange={() => setGoalOption("reduceCost")}
              />
              <span className="text-sm">
                Reduce cost while measuring specific outcomes
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={goalOption === "fullSuite"}
                onChange={() => setGoalOption("fullSuite")}
              />
              <span className="text-sm">Full Goal Suite</span>
            </label>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button
          disabled={!goalOption}
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={handleNext}
        >
          Confirm &amp; Finish
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Step Tracker */}
      <ProgressTracker currentStep={currentStep} />

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  );
}