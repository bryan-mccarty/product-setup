import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import { Reorder, motion } from 'framer-motion';

export default function OutcomePrioritizationCost() {
  // Options currently in rank order (index = rank‑1)
  const [options, setOptions] = useState([
    { id: 'optionA', name: 'Option A', cost: '$1,200', sweetness: 7, sourness: 3 },
    { id: 'optionC', name: 'Option C', cost: '$1,500', sweetness: 6, sourness: 5 },
    { id: 'optionB', name: 'Option B', cost: '$950',  sweetness: 8, sourness: 2 }
  ]);

  const labels = ['1st Choice', '2nd Choice', '3rd Choice'];

  const navigate = useNavigate();

  function handleConfirmClick() {
    navigate("/prioritize-3");
  }


  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center">Outcome Prioritization</h1>
      <p className="text-sm text-gray-600 text-center mt-2">
        Please rank the following options based on your preferences. Drag the cards side‑to‑side to reorder them from most to least preferred.
      </p>

      {/* Progress */}
      <div className="mt-6">
        <div className="flex justify-between mb-1 text-sm font-medium">
          <span>Set 1 of 3</span>
          <span className="text-red-600">50% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-black h-2 rounded-full transition-all duration-300 ease-out" style={{ width: '50%' }} />
        </div>
      </div>

      {/* Subheading */}
      <p className="text-lg font-semibold text-center mt-8">
        Now let's help Luna understand your cost tradeoffs.
      </p>

      {/* Grid with fixed labels (row 1) and draggable cards (row 2) */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* Fixed Rank Labels */}
        {labels.map((label) => (
          <div key={label} className="flex justify-center">
            <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm font-medium select-none">
              {label}
            </div>
          </div>
        ))}

        {/* Reorderable Cards */}
        <Reorder.Group
          axis="x"
          onReorder={setOptions}
          values={options}
          className="contents"
        >
          {options.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              drag="x"
              whileDrag={{ scale: 1.05, zIndex: 20 }}
              layout
              className="flex justify-center"
            >
              <motion.div
                layout
                className="w-64 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <h3 className="text-lg font-semibold px-4 py-3">{item.name}</h3>
                <div className="divide-y divide-gray-200">
                  {/* Emphasized Cost Row */}
                  <div className="flex justify-between px-4 py-2 font-semibold text-gray-800">
                    <span className="text-sm">Cost</span>
                    <span className="text-sm">{item.cost}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-sm font-medium">Sweetness</span>
                    <span className="text-sm">{item.sweetness}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-sm font-medium">Sourness</span>
                    <span className="text-sm">{item.sourness}</span>
                  </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Confirm Button */}
      <div className="flex justify-center mt-8">
        <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-full transition-colors duration-200" onClick={handleConfirmClick}>
          Confirm & Continue
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Your preferences will be used to optimize results based on your priorities.
      </p>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────────
  Text update per user request:
  • Subheading rephrased to "Drag the cards to arrange your ranking" (no "prioritize").
*/
