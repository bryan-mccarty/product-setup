import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Sidebar() {
  const [configOpen, setConfigOpen] = useState(true);
  const [batches, setBatches] = useState(5);
  const [batchSize, setBatchSize] = useState(5);

  const [goals, setGoals] = useState([
    { outcome: "Outcome 1", type: "Maximize", priority: "High" },
    { outcome: "Outcome 2", type: "Maximize", priority: "Low" },
    { outcome: "Outcome 3", type: "Minimize", priority: "Medium" },
  ]);

  const constraints = [
    { name: "Constraint A", condition: "Total Fats, Sum < 4" },
    { name: "Constraint B", condition: "Lemon Juice = 0.20" },
  ];

  const updateGoalPriority = (index, newPriority) => {
    const updatedGoals = [...goals];
    updatedGoals[index].priority = newPriority;
    setGoals(updatedGoals);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-500";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-500";
    }
  };

  const renderPriorityDropdown = (goal, index) => (
    <Select value={goal.priority} onValueChange={(value) => updateGoalPriority(index, value)}>
      <SelectTrigger className="w-24 text-sm">
        <SelectValue placeholder="Priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="High">High</SelectItem>
        <SelectItem value="Medium">Medium</SelectItem>
        <SelectItem value="Low">Low</SelectItem>
      </SelectContent>
    </Select>
  );

  const renderGoalIcon = (goal) => {
    const iconProps = {
      size: 20,
      className: `ml-2 ${getPriorityColor(goal.priority)}`
    };

    return goal.type === "Maximize" ? (
      <ArrowUpCircle {...iconProps} />
    ) : (
      <ArrowDownCircle {...iconProps} />
    );
  };

  return (
    <aside className="w-72 bg-white text-gray-900 p-4 flex flex-col h-full shadow-md border border-gray-300">
      {/* Header Section */}
      <div className="mb-4 border-b pb-2">
        <h2 className="text-lg font-bold text-red-600">Low-sugar A</h2>
        <h3 className="text-md text-gray-700">Product A</h3>
        <div className="mt-2 flex justify-between text-gray-600 text-sm">
          <span>Tests: 12 (inf.) / 5 (form.)</span>
          <span>
            Best Turing Score: <strong className="text-green-600">87</strong>
          </span>
        </div>
      </div>

      {/* Optimization Configuration */}
      <div className="mb-4 border-b pb-2">
        <Button
          onClick={() => setConfigOpen(!configOpen)}
          className="flex justify-between w-full text-left text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg p-2"
        >
          Optimization Configuration
          {configOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
        {configOpen && (
          <div className="mt-2 space-y-2 text-gray-700 bg-gray-100 p-2 rounded-b-lg border border-gray-300">
            <div>
              <label className="block text-sm">Number of Batches</label>
              <Input
                type="number"
                value={batches}
                onChange={(e) => setBatches(Number(e.target.value))}
                className="bg-white border-gray-400 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm">Size of Batches</label>
              <Input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="bg-white border-gray-400 text-gray-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Goals and Constraints Section */}
      <h3 className="text-md font-semibold text-gray-800 mb-2">Optimization Criteria</h3>
      <Tabs defaultValue="goals" className="flex-grow">
        <TabsList className="flex bg-gray-100 rounded-lg p-1 text-gray-600 border border-gray-300">
          <TabsTrigger value="goals" className="flex-1 data-[state=active]:text-red-600">
            Goals
          </TabsTrigger>
          <TabsTrigger value="constraints" className="flex-1 data-[state=active]:text-red-600">
            Constraints
          </TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="mt-2 text-gray-700 pt-2">
          <div className="space-y-2">
            {goals.map((goal, index) => (
              <div key={index} className="p-2 border rounded-lg bg-gray-50 shadow-sm flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">{goal.outcome}</div>
                  <div className="text-sm text-gray-600">{goal.type}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderPriorityDropdown(goal, index)}
                  {renderGoalIcon(goal)}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Constraints Tab */}
        <TabsContent value="constraints" className="mt-2 text-gray-700 pt-2">
          <div className="space-y-2">
            {constraints.map((constraint, index) => (
              <div key={index} className="p-2 border rounded-lg bg-gray-50 shadow-sm">
                <div className="font-bold text-gray-800">{constraint.name}</div>
                <div className="text-sm text-gray-600">{constraint.condition}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
