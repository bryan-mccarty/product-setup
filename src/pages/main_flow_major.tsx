import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine
} from "recharts";
import { Reorder, motion } from "framer-motion";
import { Switch } from "@/components/ui/switch"; // shadcn/ui toggle
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const GOAL_VALUES = {
  saltiness: 4,
  sweetness: 8,
  sourness: 3
};

const AXIS_COLOR = "#E5E7EB"; // tailwind gray‑200
const GOAL_OVERLAY_COLOR = "rgba(55, 65, 81, 0.6)"; // gray‑700 @ 60%
const PRIMARY_COLOR = "#DC2626"; // brand red – tailwind red‑600

// ─────────────────────────────────────────────────────────────────────────────
// Chart component
// ─────────────────────────────────────────────────────────────────────────────
function OutcomeChart({ item, overlay = false }) {

  const baseData = [
    { name: "Saltiness", value: Number(item.saltiness) },
    { name: "Sweetness", value: Number(item.sweetness) },
    { name: "Sourness", value: Number(item.sourness) }
  ];

  const goalData = [
    { name: "Saltiness", value: GOAL_VALUES.saltiness },
    { name: "Sweetness", value: GOAL_VALUES.sweetness },
    { name: "Sourness", value: GOAL_VALUES.sourness }
  ];

  return (
    <div className="w-full h-32 px-4 py-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={baseData} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
          {/* Axes */}
          <XAxis
            dataKey="name"
            interval={0}
            tickMargin={6}
            tick={{ fontSize: 10, fill: "#6B7280" }}
            axisLine={{ stroke: AXIS_COLOR }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 10]}
            width={28}
            tick={{ fontSize: 10, fill: "#6B7280" }}
            tickFormatter={(v) => (v === 0 ? "min" : v === 10 ? "max" : "")}
            axisLine={{ stroke: AXIS_COLOR }}
            tickLine={false}
          />
          {/* Mid‑point reference line */}
          <ReferenceLine
            y={5}
            stroke={AXIS_COLOR}
            strokeDasharray="3 3"
            ifOverflow="extendDomain"
          />

          {/* Primary data line (drawn first so overlay sits on top) */}
          <Line
            type="monotone"
            dataKey="value"
            stroke={PRIMARY_COLOR}
            strokeWidth={2}
            dot={{ r: 3, stroke: PRIMARY_COLOR, fill: "#fff" }}
            isAnimationActive={false}
          />

          {/* Optional goal overlay (on top) */}
          {overlay && (
            <Line
              type="monotone"
              data={goalData}
              dataKey="value"
              stroke={GOAL_OVERLAY_COLOR}
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function OutcomePrioritizationMajor() {

  const navigate = useNavigate(); // <-- Add this line

  function handleConfirmClick() {
    navigate("/prioritize-2");
  }
  // Options currently in rank order (index = rank‑1)
  const [options, setOptions] = useState([
    { id: "optionA", name: "Option A", saltiness: 5, sweetness: 7, sourness: 3 },
    { id: "optionB", name: "Option B", saltiness: 3, sweetness: 6, sourness: 5 },
    { id: "optionC", name: "Option C", saltiness: 8, sweetness: 8, sourness: 2 }
  ]);

  // Toggle for showing overlay
  const [showGoalOverlay, setShowGoalOverlay] = useState(true);

  // Rank labels with medal emoji
  const labels = [
    "🥇 1st Choice",
    "🥈 2nd Choice",
    "🥉 3rd Choice"
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center">Outcome Prioritization</h1>
      <p className="text-sm text-gray-600 text-center mt-2">
        Please rank the following options based on your preferences. Drag the cards side‑to‑side to reorder them from most to least preferred.
      </p>

      {/* Progress */}
      <div className="mt-6">
        <div className="flex justify-between mb-1 text-sm font-medium">
          <span>Set 1 of 3</span>
          <span className="text-red-600">25% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-black h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: "25%" }}
          />
        </div>
      </div>

      {/* Subheading */}
      <p className="text-lg font-semibold text-center mt-8">
        First, work with Luna to tune the importance of your top priorities.
      </p>

      {/* Grid with goal card + rank labels */}
      <div className="grid grid-cols-4 gap-6 mt-6">
        {/* Column 1 – Goal label */}
        <div className="flex justify-center">
          <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm font-medium select-none">
            Goal ‑ Reference
          </div>
        </div>

        {/* Rank labels with medals */}
        {labels.map((label) => (
          <div key={label} className="flex justify-center">
            <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm font-medium select-none">
              {label}
            </div>
          </div>
        ))}

        {/* Goal static card */}
        <div className="flex justify-center">
          <div className="w-64 bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Card header with inline toggle */}
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-lg font-semibold">Goal</h3>
              <div className="flex items-center gap-1">
                <Switch
                  id="toggle-goal"
                  checked={showGoalOverlay}
                  onCheckedChange={setShowGoalOverlay}
                  className="scale-75"
                />
                <Label htmlFor="toggle-goal" className="text-xs text-gray-600 select-none">
                  Compare
                </Label>
              </div>
            </div>
            <OutcomeChart item={GOAL_VALUES} />
            <div className="divide-y divide-gray-200">
              <div className="flex justify-between px-4 py-2">
                <span className="text-sm font-medium">Saltiness</span>
                <span className="text-sm">{GOAL_VALUES.saltiness}</span>
              </div>
              <div className="flex justify-between px-4 py-2">
                <span className="text-sm font-medium">Sweetness</span>
                <span className="text-sm">{GOAL_VALUES.sweetness}</span>
              </div>
              <div className="flex justify-between px-4 py-2">
                <span className="text-sm font-medium">Sourness</span>
                <span className="text-sm">{GOAL_VALUES.sourness}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Draggable option cards */}
        <Reorder.Group axis="x" onReorder={setOptions} values={options} className="contents">
          {options.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              drag="x"
              whileDrag={{ scale: 1.05, zIndex: 20 }}
              layout
              className="flex justify-center"
            >
              <motion.div layout className="w-64 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold px-4 py-3">{item.name}</h3>
                <OutcomeChart item={item} overlay={showGoalOverlay} />
                <div className="divide-y divide-gray-200">
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-sm font-medium">Saltiness</span>
                    <span className="text-sm">{item.saltiness}</span>
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
